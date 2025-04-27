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
  loader: (filename: string) => string | { code: string; map: SourceMap };
  resolver: (id: string, fromFilePath: string) => string;
  runtimeEval: (code: string, filename: string) => any;
};

export type InputConfig =
  | string
  | {
      loader?: void | string | Config["loader"];
      runtimeEval?: void | string | Config["runtimeEval"];
      resolver?: void | string | Config["resolver"];
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

    let loader: Config["loader"] | undefined = undefined;
    let resolver: Config["resolver"] | undefined = undefined;
    let runtimeEval: Config["runtimeEval"] | undefined = undefined;

    if (typeof mod === "object" && mod != null) {
      if (typeof mod.load === "function") {
        loader = mod.load;
      }
      if (typeof mod.resolve === "function") {
        resolver = mod.resolve;
      }
      if (typeof mod.evaluate === "function") {
        runtimeEval = mod.evaluate;
      }
    }

    if (!(loader ?? resolver ?? runtimeEval)) {
      throw new Error(
        `'${inputConfig}' did not export a 'load', 'resolve', or 'evaluate' function as a named export. See \`kame --help\` for more info.`
      );
    }

    inputConfig = {
      loader,
      resolver,
      runtimeEval,
    };
  }

  if (typeof inputConfig.loader === "string") {
    const mod = loadFile(inputConfig.loader);
    if (typeof mod === "object" && mod != null) {
      config.loader = mod.load;
    }
    if (typeof mod.load !== "function") {
      throw new Error(
        `'${inputConfig.loader}' did not export a 'load' function as a named export. Loader modules should export a function that receives an absolute path string and returns a JavaScript code string. See \`kame --help\` for more info.`
      );
    }
  } else if (typeof inputConfig.loader === "function") {
    config.loader = inputConfig.loader;
  } else {
    config.loader = defaultLoader.load;
  }

  if (typeof inputConfig.resolver === "string") {
    const mod = loadFile(inputConfig.resolver);
    if (typeof mod === "object" && mod != null) {
      config.resolver = mod.resolve;
    }
    if (typeof config.resolver !== "function") {
      throw new Error(
        `'${inputConfig.resolver}' did not export a 'resolve' function as a named export. Resolver modules should export a function that receives the source import/require string and the filename it appeared in, and returns the absolute path to the targeted file. See \`kame --help\` for more info.`
      );
    }
  } else if (typeof inputConfig.resolver === "function") {
    config.resolver = inputConfig.resolver;
  } else {
    config.resolver = defaultResolver.resolve;
  }

  if (typeof inputConfig.runtimeEval === "string") {
    const mod = loadFile(inputConfig.runtimeEval);
    if (typeof mod === "object" && mod != null) {
      config.runtimeEval = mod.evaluate;
    }
    if (typeof config.runtimeEval !== "function") {
      throw new Error(
        `'${inputConfig.runtimeEval}' did not export an 'evaluate' function as a named export. Runtime eval modules should export a function that receives a code string and an absolute path string and returns the result of evaluating that code string as an expression. See \`kame --help\` for more info.`
      );
    }
  } else if (typeof inputConfig.runtimeEval === "function") {
    config.runtimeEval = inputConfig.runtimeEval;
  } else {
    config.runtimeEval = defaultRuntimeEval.evaluate;
  }

  debug(`Parsed input config: ${util.inspect(config)}`);
  return config;
}
