import path from "path";
import builtins from "builtin-modules";
import nodeResolve from "resolve";
import makeDebug from "debug";

const debug = makeDebug("kame/default-resolver");

const allBuiltins = new Set(builtins);

function defaultResolver(id: string, fromFilePath: string): string {
  debug(`Resolving '${id}' from '${fromFilePath}'`);

  if (id.includes(":")) {
    return "external:" + id;
  }

  if (allBuiltins.has(id.split("/")[0])) {
    return "external:" + id;
  }

  let result: string;
  try {
    result = nodeResolve.sync(id, {
      basedir: path.dirname(fromFilePath),
      preserveSymlinks: false,
      extensions: [".js", ".json", ".mjs", ".jsx", ".ts", ".tsx", ".node"],
    });
  } catch (err) {
    // TODO make this a CLI option or something, or at least document it
    if (process.env.KAME_ALLOW_UNRESOLVED === "true") {
      return "unresolved:" + fromFilePath + "|" + id;
    } else {
      throw err;
    }
  }

  if (result.endsWith(".node")) {
    return "external:" + result;
  }

  return result;
}

export const resolve = defaultResolver;
