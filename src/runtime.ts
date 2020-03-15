import path from "path";
import * as babel from "@babel/core";
import { Module } from "commonjs-standalone";
import { Config } from "./config";
import bakeNodeEnv from "./bake-node-env";

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
      return config.resolver(id, fromFilePath, {});
    },

    read(filepath) {
      if (filepath.startsWith("external:")) {
        return "";
      }

      let code = config.loader(filepath);

      const babelResult = babel.transformSync(code, {
        babelrc: false,
        plugins: ["babel-plugin-dynamic-import-node"],
      });

      code = babelResult?.code || code;
      code = bakeNodeEnv(code, process.env.NODE_ENV || "development");

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
