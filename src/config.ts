import path from "path";
import util from "util";
import makeDebug from "debug";
import defaultLoader from "./default-loader";
import defaultResolver from "./default-resolver";
import defaultRuntimeEval from "./default-runtime-eval";

const debug = makeDebug("kame/config");

export type Config = {
  loader: (filename: string) => string;
  resolver: (id: string, fromFilePath: string) => string;
  runtimeEval: (code: string, filename: string) => any;
};

export type InputConfig = {
  loader?: void | string | Config["loader"];
  runtimeEval?: void | string | Config["runtimeEval"];
  resolver?: void | string | Config["resolver"];
};

export function readConfig(inputConfig: InputConfig): Config {
  debug(`Parsing input config: ${util.inspect(inputConfig)}`);

  // @ts-ignore
  const config: Config = {};

  if (typeof inputConfig.loader === "string") {
    const loaderPath = path.isAbsolute(inputConfig.loader)
      ? inputConfig.loader
      : path.resolve(process.cwd(), inputConfig.loader);
    config.loader = require(loaderPath);
  } else if (typeof inputConfig.loader === "function") {
    config.loader = inputConfig.loader;
  } else {
    config.loader = defaultLoader;
  }

  if (typeof inputConfig.resolver === "string") {
    const resolverPath = path.isAbsolute(inputConfig.resolver)
      ? inputConfig.resolver
      : path.resolve(process.cwd(), inputConfig.resolver);
    config.resolver = require(resolverPath);
  } else if (typeof inputConfig.resolver === "function") {
    config.resolver = inputConfig.resolver;
  } else {
    config.resolver = defaultResolver;
  }

  if (typeof inputConfig.runtimeEval === "string") {
    const runtimeEvalPath = path.isAbsolute(inputConfig.runtimeEval)
      ? inputConfig.runtimeEval
      : path.resolve(process.cwd(), inputConfig.runtimeEval);
    config.runtimeEval = require(runtimeEvalPath);
  } else if (typeof inputConfig.runtimeEval === "function") {
    config.runtimeEval = inputConfig.runtimeEval;
  } else {
    config.runtimeEval = defaultRuntimeEval;
  }

  debug(`Parsed input config: ${util.inspect(config)}`);
  return config;
}
