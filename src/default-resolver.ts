import path from "path";
import builtins from "builtin-modules";
import resolve from "resolve";
import makeDebug from "debug";

const debug = makeDebug("kame/default-resolver");

const allBuiltins = new Set(builtins);

export default function defaultResolver(
  id: string,
  fromFilePath: string
): string {
  debug(`Resolving '${id}' from '${fromFilePath}'`);

  if (allBuiltins.has(id)) {
    return "external:" + id;
  }

  return resolve.sync(id, {
    basedir: path.dirname(fromFilePath),
    preserveSymlinks: false,
    extensions: [".js", ".json", ".mjs", ".jsx", ".ts", ".tsx", ".node"],
  });
}
