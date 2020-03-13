import vm from "vm";
import makeDebug from "debug";

const debug = makeDebug("kame/default-runtime-eval");

export default function defaultRuntimeEval(
  code: string,
  filename: string
): any {
  debug(`Running code for '${filename}':\n-----\n${code}\n-----\n`);

  return vm.runInThisContext(code, { filename });
}
