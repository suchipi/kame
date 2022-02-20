import vm from "vm";
import makeDebug from "debug";

const debug = makeDebug("kame/default-runtime-eval");

function defaultRuntimeEval(code: string, filename: string): any {
  debug(`Running code for '${filename}':\n-----\n${code}\n-----\n`);

  return vm.runInThisContext(code, { filename });
}

export const evaluate = defaultRuntimeEval;
