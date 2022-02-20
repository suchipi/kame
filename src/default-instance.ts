import makeBundler from "./bundler";
import makeRuntime from "./runtime";
import type { Config } from "./config";
import * as defaultLoader from "./default-loader";
import * as defaultResolver from "./default-resolver";
import * as defaultRuntimeEval from "./default-runtime-eval";

const config: Config = {
  loader: defaultLoader.load,
  resolver: defaultResolver.resolve,
  runtimeEval: defaultRuntimeEval.evaluate,
};

export const Runtime = makeRuntime(config);
export const Bundler = makeBundler(config);
