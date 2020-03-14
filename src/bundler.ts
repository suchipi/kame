import fs from "fs";
import path from "path";
import crypto from "crypto";
import mkdirp from "mkdirp";
import chalk from "chalk";
import { NodePath } from "@babel/core";
import * as t from "@babel/types";
import generate from "@babel/generator";
import * as parser from "@babel/parser";
import traverse from "@babel/traverse";
import { codeFrameColumns } from "@babel/code-frame";
import { Config } from "./config";
import { entryWrapper, chunkWrapper } from "./bundle-wrapper";
import bakeNodeEnv from "./bake-node-env";

type Modules = { [id: string]: string };

export default function makeBundler(config: Config) {
  return class Bundler {
    private _pendingChunks: Array<string> = [];
    private _warnings: Array<string> = [];

    private _transformRequires(
      filename: string,
      code: string
    ): { transformedCode: string; resolvedRequires: Array<string> } {
      const resolvedRequires: Array<string> = [];
      const pendingChunks = this._pendingChunks;
      const warnings = this._warnings;

      const ast = parser.parse(code);
      traverse(ast, {
        CallExpression(nodePath) {
          const { node } = nodePath;

          const hasOneStringArg =
            node.arguments.length === 1 && t.isStringLiteral(node.arguments[0]);

          const isRequire =
            t.isIdentifier(node.callee) && node.callee.name === "require";

          const isImport = t.isImport(node.callee);

          if (isRequire || isImport) {
            if (!hasOneStringArg) {
              warnings.push(
                chalk.yellow(
                  `Found a non-static ${
                    isRequire ? "require" : "import"
                  } in '${filename}'. This cannot be bundled, and will be left as-is.`
                ) +
                  "\n" +
                  codeFrameColumns(code, node.loc, { highlightCode: true })
              );
              return;
            }

            // @ts-ignore
            const source: NodePath<t.StringLiteral> = nodePath.get(
              "arguments"
            )[0];

            const currentValue = source.node.value;

            let newValueAbsolute: string;
            try {
              newValueAbsolute = config.resolver(currentValue, filename);
            } catch (err) {
              const newMessage =
                `${chalk.red("Resolver failed in")} ${chalk.yellow(
                  "'" + filename + "'"
                )}: ` +
                err.message +
                "\n" +
                codeFrameColumns(code, node.loc, { highlightCode: true });
              Object.defineProperty(err, "message", { value: newMessage });
              throw err;
            }
            const newValue = path.relative(process.cwd(), newValueAbsolute);

            if (isRequire) {
              resolvedRequires.push(newValue);

              nodePath.replaceWith(
                t.callExpression(t.identifier("_kame_require_"), [
                  t.stringLiteral(newValue),
                ])
              );
            } else {
              pendingChunks.push(newValue);
              nodePath.replaceWith(
                t.callExpression(t.identifier("_kame_dynamic_import_"), [
                  t.stringLiteral(newValue),
                ])
              );
            }
          }
        },
      });

      return {
        transformedCode: generate(ast).code,
        resolvedRequires,
      };
    }

    private _gatherModules(entry: string): Modules {
      const modules: Modules = {};

      const filesToProcess: Array<string> = [];
      filesToProcess.push(entry);

      let file: string | undefined;
      while ((file = filesToProcess.shift())) {
        if (file.startsWith("external:")) {
          modules[file] = `module.exports = require(${JSON.stringify(
            file.replace(/^external:/, "")
          )})`;
          continue;
        }

        const absFile = path.resolve(process.cwd(), file);
        let code: string;
        try {
          code = config.loader(absFile);
        } catch (err) {
          const newMessage =
            `${chalk.red("Loader failed to load")} ${chalk.yellow(
              "'" + absFile + "'"
            )}: ` + err.message;
          Object.defineProperty(err, "message", { value: newMessage });
          throw err;
        }
        code = bakeNodeEnv(code, process.env.NODE_ENV || "production");

        const { transformedCode, resolvedRequires } = this._transformRequires(
          file,
          code
        );
        modules[file] = transformedCode;

        filesToProcess.push(...resolvedRequires);
      }

      return modules;
    }

    bundle({
      input,
      output,
      globalName,
    }: {
      input: string;
      output: string;
      globalName: string;
    }) {
      this._pendingChunks = [];
      this._warnings = [];

      const writtenFiles: Array<string> = [];

      if (!path.isAbsolute(input)) {
        input = path.resolve(process.cwd(), input);
      }
      if (!path.isAbsolute(output)) {
        output = path.resolve(process.cwd(), output);
      }

      mkdirp.sync(path.dirname(output));

      const relativeInput = path.relative(process.cwd(), input);
      const entryModules = this._gatherModules(relativeInput);

      const chunkUrls = {};
      let needsRegenerator = false;

      let pendingChunk: string | undefined;
      while ((pendingChunk = this._pendingChunks.shift())) {
        const chunkModules = this._gatherModules(pendingChunk);
        Object.keys(chunkModules).forEach((key) => {
          if (entryModules[key]) {
            delete chunkModules[key];
          }
        });

        const chunkHash = crypto
          .createHash("md5")
          .update(Object.values(chunkModules).join("\n"))
          .digest("hex");

        const chunkOutputFilename = `${chunkHash}.js`;
        chunkUrls[pendingChunk] = chunkOutputFilename;
        const chunkOutputPath = path.join(
          path.dirname(output),
          chunkOutputFilename
        );

        const chunkCode = chunkWrapper({
          entryId: pendingChunk,
          globalName,
          modules: chunkModules,
        });

        if (chunkCode.match(/regeneratorRuntime/)) {
          needsRegenerator = true;
        }

        fs.writeFileSync(chunkOutputPath, chunkCode);
        writtenFiles.push(chunkOutputPath);
      }

      let entryCode = entryWrapper({
        entryId: relativeInput,
        globalName,
        modules: entryModules,
        chunkUrls,
      });

      if (entryCode.match(/regeneratorRuntime/)) {
        needsRegenerator = true;
      }

      if (needsRegenerator) {
        const regeneratorCode = fs.readFileSync(
          require.resolve("regenerator-runtime"),
          "utf-8"
        );
        entryCode = regeneratorCode + ";\n" + entryCode;
      }

      fs.writeFileSync(output, entryCode);
      writtenFiles.push(output);

      return {
        warnings: this._warnings,
        writtenFiles,
      };
    }
  };
}
