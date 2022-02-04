import path from "path";
import chalk from "chalk";
import * as babel from "@babel/core";
import { Module } from "commonjs-standalone";
import { Config } from "./config";

type Exports = { [key: string]: any };

type ModuleEnv = {
  require: (id: string) => any;
  module: { exports: Exports };
  exports: Exports;
  __filename: string;
  __dirname: string;
};

type Delegate = {
  resolve(id: string, fromFilePath: string): string;
  read(filepath: string): string;
  run(code: string, moduleEnv: ModuleEnv, filepath: string): void;
};

export interface IRuntime {
  cache: { [key: string]: any };
  load(filename: string): any;
}

export default function makeRuntime(config: Config): { new (): IRuntime } {
  const realRequire = require;

  const delegate: Delegate = {
    resolve(id, fromFilePath) {
      return config.resolver(id, fromFilePath);
    },

    read(filepath) {
      if (filepath.startsWith("external:")) {
        return "";
      }

      if (filepath.startsWith("unresolved:")) {
        const [fromFilePath, id] = filepath
          .replace(/^unresolved:/, "")
          .split("|");

        return `throw new Error(
          ${JSON.stringify(
            `Module not found: Tried to load ${JSON.stringify(
              id
            )} from ${JSON.stringify(fromFilePath)}`
          )}
        );`;
      }

      let code = config.loader(filepath);

      if (code.match(/import\s*\(/)) {
        let babelResult: ReturnType<typeof babel.transformSync>;
        try {
          babelResult = babel.transformSync(code, {
            babelrc: false,
            plugins: [require("babel-plugin-dynamic-import-node")],
            sourceType: "unambiguous",
            filename: filepath,

            // Same effect as default value but silences warning
            compact: code.length > 500 * 1024,
          });
          code = babelResult?.code || code;
        } catch (err) {
          console.warn(
            chalk.yellow(
              `Warning: Kame runtime failed to convert dynamic imports to requires in the generated code for '${filepath}'\n${err}.`
            )
          );
        }
      }

      return code;
    },

    run(code, moduleEnv, filepath) {
      if (filepath.startsWith("external:")) {
        moduleEnv.exports = moduleEnv.module.exports = realRequire(
          filepath.replace(/^external:/, "")
        );
        return;
      }

      const wrapper = config.runtimeEval(
        "(function (exports, require, module, __filename, __dirname) { " +
          code +
          "\n})\n",
        filepath
      );

      wrapper(
        moduleEnv.exports,
        moduleEnv.require,
        moduleEnv.module,
        moduleEnv.__filename,
        moduleEnv.__dirname
      );
    },
  };

  class Runtime implements IRuntime {
    cache: { [key: string]: any } = {};

    load(filename: string): any {
      require("regenerator-runtime");

      if (!path.isAbsolute(filename)) {
        filename = path.join(process.cwd(), filename);
      }

      return Module._load(filename, delegate, this.cache);
    }
  }

  return Runtime;
}
