import makeBundler, { IBundler } from "./bundler";
import makeRuntime, { IRuntime } from "./runtime";
import { InputConfig, readConfig } from "./config";
import * as defaultLoader from "./default-loader";
import * as defaultResolver from "./default-resolver";
import * as defaultRuntimeEval from "./default-runtime-eval";
import { Runtime, Bundler } from "./default-instance";

function configure(inputConfig: InputConfig = {}) {
  const config = readConfig(inputConfig);
  const Bundler = makeBundler(config);
  const Runtime = makeRuntime(config);

  return {
    Bundler,
    Runtime,
  };
}

export {
  configure,
  defaultLoader,
  defaultResolver,
  defaultRuntimeEval,
  IBundler,
  IRuntime,
  Runtime,
  Bundler,
  InputConfig as Config,
};
