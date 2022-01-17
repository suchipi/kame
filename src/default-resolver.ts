import path from "path";
import builtins from "builtin-modules";
import nodeResolve from "resolve";
import makeDebug from "debug";

const debug = makeDebug("kame/default-resolver");

const allBuiltins = new Set(builtins);

export const interfaceVersion = 2;

export function resolve(id: string, fromFilePath: string): string {
  debug(`Resolving '${id}' from '${fromFilePath}'`);

  if (allBuiltins.has(id)) {
    return "external:" + id;
  }

  const result = nodeResolve.sync(id, {
    basedir: path.dirname(fromFilePath),
    preserveSymlinks: false,
    extensions: [".js", ".json", ".mjs", ".jsx", ".ts", ".tsx", ".node"],
  });

  if (result.endsWith(".node")) {
    return "external:" + result;
  }

  return result;
}
