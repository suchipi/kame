import path from "path";
import util from "util";
import makeDebug from "debug";
import { SourceMap } from "./source-maps";
import { Runtime } from "./default-instance";
import * as defaultLoader from "./default-loader";
import * as defaultResolver from "./default-resolver";
import * as defaultRuntimeEval from "./default-runtime-eval";

const debug = makeDebug("kame/config");

export type Config = {
  load: (filename: string) => string | { code: string; map: SourceMap };
  resolve: (id: string, fromFilePath: string) => string;
  evaluate: (code: string, filename: string) => any;
};

export type InputConfig =
  | string
  | {
      load?: void | string | Config["load"];
      evaluate?: void | string | Config["evaluate"];
      resolve?: void | string | Config["evaluate"];

      /** @deprecated renamed to 'load' for parity with config file exports */
      loader?: void | string | Config["load"];
      /** @deprecated renamed to 'resolve' for parity with config file exports */
      resolver?: void | string | Config["resolve"];
      /** @deprecated renamed to 'evaluate' for parity with config file exports */
      runtimeEval?: void | string | Config["evaluate"];
    };

const configLoaderRuntime = new Runtime();

function loadFile(filepath: string) {
  let resolvedPath: string;
  try {
    resolvedPath = defaultResolver.resolve(
      filepath,
      path.join(process.cwd(), "fake-cwd-file.js")
    );
  } catch (err) {
    try {
      resolvedPath = defaultResolver.resolve(
        "./" + filepath,
        path.join(process.cwd(), "fake-cwd-file.js")
      );
    } catch (err2) {
      throw err;
    }
  }

  return configLoaderRuntime.load(resolvedPath);
}

export function readConfig(inputConfig: InputConfig): Config {
  debug(`Parsing input config: ${util.inspect(inputConfig)}`);

  // @ts-ignore
  const config: Config = {};

  if (typeof inputConfig === "string") {
    const mod = loadFile(inputConfig);

    let load: Config["load"] | undefined = undefined;
    let resolve: Config["resolve"] | undefined = undefined;
    let evaluate: Config["evaluate"] | undefined = undefined;

    if (typeof mod === "object" && mod != null) {
      if (typeof mod.load === "function") {
        load = mod.load;
      } else if (typeof mod.loader === "function") {
        load = mod.loader;
      }
      if (typeof mod.resolve === "function") {
        resolve = mod.resolve;
      } else if (typeof mod.resolver === "function") {
        resolve = mod.resolver;
      }
      if (typeof mod.evaluate === "function") {
        evaluate = mod.evaluate;
      } else if (typeof mod.runtimeEval === "function") {
        evaluate = mod.runtimeEval;
      }
    }

    if (!(load ?? resolve ?? evaluate)) {
      throw new Error(
        `'${inputConfig}' did not export a 'load', 'resolve', or 'evaluate' function as a named export. See \`kame --help\` for more info.`
      );
    }

    inputConfig = {
      load,
      resolve,
      evaluate,
    };
  }

  const load = inputConfig.load ?? inputConfig.loader;
  const resolve = inputConfig.resolve ?? inputConfig.resolver;
  const evaluate = inputConfig.evaluate ?? inputConfig.runtimeEval;

  if (typeof load === "string") {
    const mod = loadFile(load);
    if (typeof mod === "object" && mod != null) {
      if (typeof mod.load === "function") {
        config.load = mod.load;
      } else if (typeof mod.loader === "function") {
        config.load = mod.loader;
      } else {
        throw new Error(
          `'${load}' did not export a 'load' function as a named export. Loader modules should export a function that receives an absolute path string and returns a JavaScript code string. See \`kame --help\` for more info.`
        );
      }
    }
  } else if (typeof load === "function") {
    config.load = load;
  } else {
    config.load = defaultLoader.load;
  }

  if (typeof resolve === "string") {
    const mod = loadFile(resolve);
    if (typeof mod === "object" && mod != null) {
      if (typeof mod.resolve === "function") {
        config.resolve = mod.resolve;
      } else if (typeof mod.resolver === "function") {
        config.resolve = mod.resolver;
      } else {
        throw new Error(
          `'${resolve}' did not export a 'resolve' function as a named export. Resolver modules should export a function that receives the source import/require string and the filename it appeared in, and returns the absolute path to the targeted file. See \`kame --help\` for more info.`
        );
      }
    }
  } else if (typeof resolve === "function") {
    config.resolve = resolve;
  } else {
    config.resolve = defaultResolver.resolve;
  }

  if (typeof evaluate === "string") {
    const mod = loadFile(evaluate);
    if (typeof mod === "object" && mod != null) {
      if (typeof mod.evaluate === "function") {
        config.evaluate = mod.evaluate;
      } else if (typeof mod.runtimeEval === "function") {
        config.evaluate = mod.runtimeEval;
      } else {
        throw new Error(
          `'${inputConfig.runtimeEval}' did not export an 'evaluate' function as a named export. Runtime eval modules should export a function that receives a code string and an absolute path string and returns the result of evaluating that code string as an expression. See \`kame --help\` for more info.`
        );
      }
    }
  } else if (typeof evaluate === "function") {
    config.evaluate = evaluate;
  } else {
    config.evaluate = defaultRuntimeEval.evaluate;
  }

  debug(`Parsed input config: ${util.inspect(config)}`);
  return config;
}
