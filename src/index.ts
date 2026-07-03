import makeBundler, { IBundler } from "./bundler";
import makeRuntime, { IRuntime } from "./runtime";
import { InputConfig, readConfig, Config } from "./config";
import * as defaultLoader from "./default-loader";
import * as defaultResolver from "./default-resolver";
import * as defaultRuntimeEval from "./default-runtime-eval";
import { defaultConfig } from "./default-config";
import { Runtime, Bundler } from "./default-instance";
import type { SourceMap } from "./source-maps";

function configure(inputConfig: InputConfig = {}) {
  const config = readConfig(inputConfig);
  const Bundler = makeBundler(config);
  const Runtime = makeRuntime(config);

  return {
    Bundler,
    Runtime,
  };
}

/** Optional passthrough function helper for type autocomplete. */
function defineConfig(config: Config) {
  return config;
}

export {
  configure,
  defaultLoader,
  defaultResolver,
  defaultRuntimeEval,
  defaultConfig,
  IBundler,
  IRuntime,
  Runtime,
  Bundler,
  InputConfig as Config,
  defineConfig,
  type SourceMap,
};
