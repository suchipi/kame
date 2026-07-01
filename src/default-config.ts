import type { Config } from "./config";
import * as defaultLoader from "./default-loader";
import * as defaultResolver from "./default-resolver";
import * as defaultRuntimeEval from "./default-runtime-eval";

export const defaultConfig: Config = {
  load: defaultLoader.load,
  resolve: defaultResolver.resolve,
  evaluate: defaultRuntimeEval.evaluate,
};
