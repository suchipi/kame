import fs from "fs";
import path from "path";
import mkdirp from "mkdirp";
import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import generate from "@babel/generator";
import * as parser from "@babel/parser";
import traverse from "@babel/traverse";
import { Config } from "./config";

export default function makeBundler(config: Config) {
  return class Bundler {
    private _instrumentRequires(
      filename: string,
      code: string
    ): { transformedCode: string; resolvedRequires: Array<string> } {
      const resolvedRequires: Array<string> = [];

      const ast = parser.parse(code);
      traverse(ast, {
        CallExpression(nodePath) {
          const { node } = nodePath;

          if (
            t.isIdentifier(node.callee) &&
            node.callee.name === "require" &&
            node.arguments.length === 1 &&
            t.isStringLiteral(node.arguments[0])
          ) {
            // @ts-ignore
            const source: NodePath<t.StringLiteral> = nodePath.get(
              "arguments"
            )[0];

            const currentValue = source.node.value;

            const newValueAbsolute = config.resolver(currentValue, filename);
            const newValue = path.relative(process.cwd(), newValueAbsolute);

            resolvedRequires.push(newValue);

            nodePath.replaceWith(
              t.callExpression(t.identifier("_kame_require_"), [
                t.stringLiteral(newValue),
              ])
            );
          }
        },
      });

      return {
        transformedCode: generate(ast).code,
        resolvedRequires,
      };
    }

    bundle({
      input,
      output,
      globalName = "kameBundle",
    }: {
      input: string;
      output: string;
      globalName?: string;
    }) {
      if (!path.isAbsolute(input)) {
        input = path.resolve(process.cwd(), input);
      }
      if (!path.isAbsolute(output)) {
        output = path.resolve(process.cwd(), output);
      }

      const modules = {};

      const filesToProcess: Array<string> = [];
      const relativeEntry = path.relative(process.cwd(), input);
      filesToProcess.push(relativeEntry);

      let file: string | undefined;
      while ((file = filesToProcess.shift())) {
        if (file.startsWith("external:")) {
          modules[file] = `module.exports = require(${JSON.stringify(
            file.replace(/^external:/, "")
          )})`;
          continue;
        }

        const code = config.loader(path.resolve(process.cwd(), file));
        const { transformedCode, resolvedRequires } = this._instrumentRequires(
          file,
          code
        );
        modules[file] = transformedCode;

        filesToProcess.push(...resolvedRequires);
      }

      const bundleCode = `(function (global, factory) {
		if (typeof exports === 'object' && typeof module !== 'undefined') {
			module.exports = factory();
		} else if (typeof define === 'function' && define.amd) {
			define([], factory)
		} else {
			global[${JSON.stringify(globalName)}] = factory();
		}
	}(this, (function () { 'use strict';
		var __kame__ = {
			basedir: typeof __dirname === 'string' ? __dirname : "",
			cache: {},
			runModule: function runModule(name, isMain) {
				var exports = {};
				var module = {
					id: name,
					exports: exports,
				};

				__kame__.cache[name] = module;

				var _kame_require_ = function require(id) {
					if (__kame__.cache[id]) {
						return __kame__.cache[id].exports;
					} else {
						__kame__.runModule(id, false);
						return __kame__.cache[id].exports;
					}
				};
				_kame_require_.cache = __kame__.cache;

				if (isMain) {
					_kame_require_.main = module;
				}

				var __filename = __kame__.basedir + "/" + name;
				var __dirname = __kame__.basedir + "/" + name.split("/").slice(0, -1).join("/");

				__kame__.modules[name](exports, _kame_require_, module, __filename, __dirname);
				return module.exports;
			},
			modules: {
				${Object.keys(modules)
          .map((key, index, all) => {
            return `${JSON.stringify(
              key
            )}: (function (exports, _kame_require_, module, __filename, __dirname) {\n${
              modules[key]
            }\n})${index === all.length - 1 ? "" : ","}`;
          })
          .join("\n")}
			}
		};

		return __kame__.runModule(${JSON.stringify(relativeEntry)}, true);
	})));
	`;

      mkdirp.sync(path.dirname(output));
      fs.writeFileSync(output, bundleCode);
    }
  };
}
