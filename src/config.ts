import path from "path";
import util from "util";
import makeDebug from "debug";
import defaultLoader from "./default-loader";
import * as defaultResolver from "./default-resolver";
import defaultRuntimeEval from "./default-runtime-eval";
import { Runtime } from "./default-instance";

const debug = makeDebug("kame/config");

export type Config = {
  loader: (filename: string) => string;
  resolver: (id: string, fromFilePath: string, settings: any) => string;
  runtimeEval: (code: string, filename: string) => any;
};

export type InputConfig = {
  loader?: void | string | Config["loader"];
  runtimeEval?: void | string | Config["runtimeEval"];
  resolver?: void | string | Config["resolver"];
};

let fileLoadingRuntime = new Runtime();
function loadFile(filepath: string) {
  const resolvedPath = defaultResolver.resolve(
    filepath,
    path.join(process.cwd(), "fake-cwd-file.js"),
    {}
  );
  return fileLoadingRuntime.load(resolvedPath);
}

export function readConfig(inputConfig: InputConfig): Config {
  debug(`Parsing input config: ${util.inspect(inputConfig)}`);
  fileLoadingRuntime.cache = {};

  // @ts-ignore
  const config: Config = {};

  if (typeof inputConfig.loader === "string") {
    const mod = loadFile(inputConfig.loader);
    if (typeof mod === "object" && mod != null && mod.__esModule) {
      config.loader = mod.default;
    } else {
      config.loader = mod;
    }
    if (typeof config.loader !== "function") {
      throw new Error(
        `'${inputConfig.loader}' did not export a function as either its default export or module.exports. Loader modules should export a function that receives an absolute path string and returns a JavaScript code string.`
      );
    }
  } else if (typeof inputConfig.loader === "function") {
    config.loader = inputConfig.loader;
  } else {
    config.loader = defaultLoader;
  }

  if (typeof inputConfig.resolver === "string") {
    const mod = loadFile(inputConfig.resolver);
    if (typeof mod === "object" && mod != null) {
      config.resolver = mod.resolve;
    }
    if (typeof config.resolver !== "function") {
      throw new Error(
        `'${inputConfig.resolver}' did not export a function as its 'resolve' named export. Resolver modules should adhere to the eslint-plugin-import resolver spec v2 as defined at https://github.com/benmosher/eslint-plugin-import/blob/b916ed2b574a107e62f819663b8c300f82d82d8d/resolvers/README.md.`
      );
    }
  } else if (typeof inputConfig === "function") {
    config.resolver = inputConfig;
  } else {
    config.resolver = defaultResolver.resolve;
  }

  if (typeof inputConfig.runtimeEval === "string") {
    const mod = loadFile(inputConfig.runtimeEval);
    if (typeof mod === "object" && mod != null && mod.__esModule) {
      config.runtimeEval = mod.default;
    } else {
      config.runtimeEval = mod;
    }
    if (typeof config.runtimeEval !== "function") {
      throw new Error(
        `'${inputConfig.runtimeEval}' did not export a function as either its default export or module.exports. Runtime eval modules should export a function that receives a code string and an absolute path string and returns the result of evaluating that code string as an expression.`
      );
    }
  } else if (typeof inputConfig.runtimeEval === "function") {
    config.runtimeEval = inputConfig.runtimeEval;
  } else {
    config.runtimeEval = defaultRuntimeEval;
  }

  debug(`Parsed input config: ${util.inspect(config)}`);
  return config;
}
