import path from "path";
import util from "util";
import kleur from "kleur";
import * as babel from "@babel/core";
import { Module as CJSStandaloneModule } from "commonjs-standalone";
import { Config } from "./config";
import { applySourceMapsToError, SourceMap } from "./source-maps";
import makeDebug from "debug";

const debug = makeDebug("kame/runtime");

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
  /** The `require.cache` for files loaded by this Runtime. */
  cache: { [key: string]: any };
  /** Run the file with the given name and return its exports. */
  load(filename: string): any;
  /**
   * Inject kame into Node's `require` mechanism, so that all future calls to
   * `require` are handled by kame.
   */
  register(): void;
}

export default function makeRuntime(config: Config): { new (): IRuntime } {
  const realRequire = require;

  // keys here are absolute filepaths
  const sourceMaps: { [key: string]: SourceMap } = {};

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

      const loaderResult = config.loader(filepath);
      debug(
        `Loader result for ${filepath}: ---------\n${util.inspect(
          loaderResult,
          { colors: true }
        )}\n---------`
      );

      let code: string;
      let map: any;

      if (typeof loaderResult === "string") {
        code = loaderResult;
        map = null;
      } else {
        code = loaderResult.code;
        map = loaderResult.map;
      }

      if (code.match(/import\s*\(/)) {
        let babelResult: ReturnType<typeof babel.transformSync>;
        try {
          let inputSourceMap = map;
          if (typeof inputSourceMap === "string") {
            try {
              inputSourceMap = JSON.parse(inputSourceMap);
            } catch (err) {
              // ignored
            }
          }
          inputSourceMap = inputSourceMap || undefined;

          babelResult = babel.transformSync(code, {
            babelrc: false,
            plugins: [require("babel-plugin-dynamic-import-node")],
            sourceType: "unambiguous",
            filename: filepath,

            inputSourceMap,

            // Same effect as default value but silences warning
            compact: code.length > 500 * 1024,
          });

          if (babelResult == null) {
            throw new Error("babel.transformSync returned null");
          }

          if (babelResult.code == null) {
            throw new Error(
              "The result from babel.transformSync had no code on it: " +
                util.inspect(babelResult)
            );
          }

          code = babelResult.code;
          map = babelResult.map;
        } catch (err) {
          console.warn(
            kleur.yellow(
              `Warning: Kame runtime failed to convert dynamic imports to requires in the generated code for '${filepath}'\n${err}.\nInput source map was:\n${util.inspect(
                map,
                { colors: true, depth: 10 }
              )}`
            )
          );
        }
      }

      if (map != null) {
        sourceMaps[filepath] = map;
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

  function fallbackRequester() {
    return path.join(process.cwd(), "__kame-runtime-load.js");
  }

  class Runtime implements IRuntime {
    cache: { [key: string]: any } = {};

    load(filename: string): any {
      const resolvedFilename = config.resolver(filename, fallbackRequester());
      return this._run(resolvedFilename);
    }

    _run(filename: string): any {
      try {
        return CJSStandaloneModule._load(filename, delegate, this.cache);
      } catch (err) {
        throw applySourceMapsToError(sourceMaps, err);
      }
    }

    register() {
      const runtime = this;

      // We patch Module.prototype.load instead of using `npm:pirates` because
      // we want to affect *ALL* filename extensions, and pirates makes you
      // specify which to hook.
      const NodeJSModule = require("node:module").Module;
      const originalLoad = NodeJSModule.prototype.load;
      NodeJSModule.prototype.load = function load(this: any, filename: string) {
        // Module._extensions[*] is expected to call _compile (the default '.js'
        // loader does), so _compile is what we patch.
        //
        // Normally, _compile is where the module wrapper gets executed.
        // Instead, we bypass that and defer everything to kame.
        this._compile = function compile(this: any) {
          this.exports = runtime._run(filename);
        };

        originalLoad.call(this, filename);
      };

      // We also have to patch Module._resolveFilename to use kame's resolver.
      NodeJSModule._resolveFilename = function _resolveFilename(
        request: string,
        parent: any,
        _isMain: boolean,
        _options: any
      ) {
        let requester = parent?.filename || parent?.id || fallbackRequester();
        return config.resolver(request, requester);
      };
    }
  }

  return Runtime;
}
