import makeBundler from "./bundler";
import makeRuntime from "./runtime";
import { defaultConfig } from "./default-config";

export const Runtime = makeRuntime(defaultConfig);
export const Bundler = makeBundler(defaultConfig);
