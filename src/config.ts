import path from "path";
import util from "util";
import makeDebug from "debug";
import { SourceMap } from "./source-maps";
import { Runtime } from "./default-instance";
import * as defaultLoader from "./default-loader";
import * as defaultResolver from "./default-resolver";
import * as defaultRuntimeEval from "./default-runtime-eval";
import { warnOnce } from "./warn-once";

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

function getConfigFromModule(mod: any): Partial<Config> {
  let load: Config["load"] | undefined = undefined;
  let resolve: Config["resolve"] | undefined = undefined;
  let evaluate: Config["evaluate"] | undefined = undefined;

  if (typeof mod === "object" && mod != null) {
    if (typeof mod.load === "function") {
      load = mod.load;
    } else if (typeof mod.loader === "function") {
      warnOnce(
        "Config provided load function via an export named 'loader', which is deprecated. Please name the export 'load'."
      );
      load = mod.loader;
    } else if (typeof mod.default === "object" && mod.default != null) {
      if (typeof mod.default.load === "function") {
        load = mod.default.load;
      } else if (typeof mod.default.loader === "function") {
        warnOnce(
          "Config provided load function via the 'loader' key, which is deprecated. Please use the key 'load'."
        );
        load = mod.default.loader;
      }
    }
    if (typeof mod.resolve === "function") {
      resolve = mod.resolve;
    } else if (typeof mod.resolver === "function") {
      warnOnce(
        "Config provided resolve function via an export named 'resolver', which is deprecated. Please name the export 'resolve'."
      );
      resolve = mod.resolver;
    } else if (typeof mod.default === "object" && mod.default != null) {
      if (typeof mod.default.resolve === "function") {
        resolve = mod.default.resolve;
      } else if (typeof mod.default.resolver === "function") {
        warnOnce(
          "Config provided resolve function via the 'resolver' key, which is deprecated. Please use the key 'resolve'."
        );
        resolve = mod.default.resolver;
      }
    }
    if (typeof mod.evaluate === "function") {
      evaluate = mod.evaluate;
    } else if (typeof mod.runtimeEval === "function") {
      warnOnce(
        "Config provided evaluate function via an export named 'runtimeEval', which is deprecated. Please name the export 'evaluate'."
      );
      evaluate = mod.runtimeEval;
    } else if (typeof mod.default === "object" && mod.default != null) {
      if (typeof mod.default.evaluate === "function") {
        evaluate = mod.default.evaluate;
      } else if (typeof mod.default.runtimeEval === "function") {
        warnOnce(
          "Config provided evaluate function via the 'runtimeEval' key, which is deprecated. Please use the key 'evaluate'."
        );
        evaluate = mod.default.runtimeEval;
      }
    }
  }

  return {
    load,
    resolve,
    evaluate,
  };
}

export function readConfig(inputConfig: InputConfig): Config {
  debug(`Parsing input config: ${util.inspect(inputConfig)}`);

  // @ts-ignore
  const config: Config = {};

  if (typeof inputConfig === "string") {
    const mod = loadFile(inputConfig);

    const { load, resolve, evaluate } = getConfigFromModule(mod);

    if (!(load ?? resolve ?? evaluate)) {
      throw new Error(
        `'${inputConfig}' did not export a 'load', 'resolve', or 'evaluate' function. See \`kame --help\` for more info.`
      );
    }

    inputConfig = {
      load,
      resolve,
      evaluate,
    };
  }

  let load: Exclude<InputConfig, string>["load"];
  if (inputConfig.load) {
    load = inputConfig.load;
  } else if (inputConfig.loader) {
    warnOnce(
      "Config provided load function via the 'loader' key, which is deprecated. Please use the key 'load'."
    );
    load = inputConfig.loader;
  }

  let resolve: Exclude<InputConfig, string>["resolve"];
  if (inputConfig.resolve) {
    resolve = inputConfig.resolve;
  } else if (inputConfig.resolver) {
    warnOnce(
      "Config provided resolve function via the 'resolver' key, which is deprecated. Please use the key 'resolve'."
    );
    resolve = inputConfig.resolver;
  }

  let evaluate: Exclude<InputConfig, string>["evaluate"];
  if (inputConfig.evaluate) {
    evaluate = inputConfig.evaluate;
  } else if (inputConfig.runtimeEval) {
    warnOnce(
      "Config provided evaluate function via the 'runtimeEval' key, which is deprecated. Please use the key 'evaluate'."
    );
    evaluate = inputConfig.runtimeEval;
  }

  if (typeof load === "string") {
    const mod = loadFile(load);
    const loadFromModule = getConfigFromModule(mod).load;
    if (loadFromModule != null) {
      config.load = loadFromModule;
    } else {
      throw new Error(
        `'${load}' did not export a 'load' function. See \`kame --help\` for more info.`
      );
    }
  } else if (typeof load === "function") {
    config.load = load;
  } else {
    config.load = defaultLoader.load;
  }

  if (typeof resolve === "string") {
    const mod = loadFile(resolve);
    const resolveFromModule = getConfigFromModule(mod).resolve;
    if (resolveFromModule != null) {
      config.resolve = resolveFromModule;
    } else {
      throw new Error(
        `'${resolve}' did not export a 'resolve' function. See \`kame --help\` for more info.`
      );
    }
  } else if (typeof resolve === "function") {
    config.resolve = resolve;
  } else {
    config.resolve = defaultResolver.resolve;
  }

  if (typeof evaluate === "string") {
    const mod = loadFile(evaluate);
    const evaluateFromModule = getConfigFromModule(mod).evaluate;
    if (evaluateFromModule != null) {
      config.evaluate = evaluateFromModule;
    } else {
      throw new Error(
        `'${evaluate}' did not export a 'evaluate' function. See \`kame --help\` for more info.`
      );
    }
  } else if (typeof evaluate === "function") {
    config.evaluate = evaluate;
  } else {
    config.evaluate = defaultRuntimeEval.evaluate;
  }

  debug(`Parsed input config: ${util.inspect(config)}`);
  return config;
}
