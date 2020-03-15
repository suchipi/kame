import makeBundler, { IBundler } from "./bundler";
import makeRuntime, { IRuntime } from "./runtime";
import { InputConfig, readConfig } from "./config";
import defaultLoader from "./default-loader";
import defaultResolver from "./default-resolver";
import defaultRuntimeEval from "./default-runtime-eval";

function configure(inputConfig: InputConfig = {}) {
  const config = readConfig(inputConfig);
  const Bundler = makeBundler(config);
  const Runtime = makeRuntime(config);

  return {
    Bundler,
    Runtime,
  };
}

const defaultInstance = configure();
export const Runtime = defaultInstance.Runtime;
export const Bundler = defaultInstance.Bundler;

export {
  configure,
  defaultLoader,
  defaultResolver,
  defaultRuntimeEval,
  IBundler,
  IRuntime,
};
