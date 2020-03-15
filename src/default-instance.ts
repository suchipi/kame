import makeBundler from "./bundler";
import makeRuntime from "./runtime";
import { Config } from "./config";
import defaultLoader from "./default-loader";
import * as defaultResolver from "./default-resolver";
import defaultRuntimeEval from "./default-runtime-eval";

const config: Config = {
  loader: defaultLoader,
  resolver: defaultResolver.resolve,
  runtimeEval: defaultRuntimeEval,
};

export const Runtime = makeRuntime(config);
export const Bundler = makeBundler(config);
