import makeBundler from "./bundler";
import makeRuntime from "./runtime";
import { InputConfig, readConfig } from "./config";

function configure(inputConfig: InputConfig = {}) {
  const config = readConfig(inputConfig);
  const Bundler = makeBundler(config);
  const Runtime = makeRuntime(config);

  return {
    Bundler,
    Runtime,
  };
}

export = Object.assign(configure, configure());
