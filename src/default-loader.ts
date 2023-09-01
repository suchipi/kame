import fs from "fs";
import path from "path";
import util from "util";
import mime from "mime-types";
import chalk from "chalk";
import * as esbuild from "esbuild";
import makeDebug from "debug";

const debug = makeDebug("kame/default-loader");

export function stripShebang(content: string) {
  return content.replace(/^#![^\r\n]*/, "");
}

export function loadJson(filename: string) {
  debug(`loadJson`);

  return "module.exports = " + fs.readFileSync(filename, "utf-8");
}

export function loadCss(filename: string) {
  debug(`loadCss`);

  const content = fs.readFileSync(filename, "utf-8");
  return `
    var style = document.createElement("style");
    style.type = "text/css";
    style.textContent = ${JSON.stringify(content)};
    document.head.appendChild(style);
  `;
}

export function loadJsUncompiled(filename: string) {
  debug(`loadJsUncompiled`);
  const code = fs.readFileSync(filename, "utf-8");
  return stripShebang(code);
}

export function loadJsCompiled(
  filename: string,
  esbuildOptions: { [key: string]: any } = {}
) {
  debug(`loadJsCompiled`);
  const extension = path.extname(filename);
  const content = fs.readFileSync(filename);

  let loader;
  switch (extension) {
    case ".mts":
    case ".cts":
    case ".ts": {
      loader = "ts";
      break;
    }
    case ".mtsx":
    case ".ctsx":
    case ".tsx": {
      loader = "tsx";
      break;
    }

    case ".mjsx":
    case ".cjsx":
    case ".jsx": {
      loader = "jsx";
      break;
    }

    case ".js":
    case ".cjs":
    case ".mjs":
    default: {
      loader = "js";
      break;
    }
  }

  const result = esbuild.transformSync(content, {
    sourcefile: filename,
    sourcemap: "inline",
    loader,
    format: "cjs",
    ...esbuildOptions,
  });
  const code = result?.code || "";

  const map = result?.map || null;

  for (const warning of result.warnings) {
    console.warn(
      chalk.yellow("warning from esbuild:"),
      util.inspect(warning, { depth: 12, colors: true })
    );
  }

  return {
    code: stripShebang(code),
    map,
  };
}

export function loadFile(filename: string) {
  debug(`loadFile`);

  const extension = path.extname(filename);

  const type = mime.lookup(extension) || "application/octet-stream";
  const base64 = fs.readFileSync(filename, "base64");
  const url = `data:${type};base64,${base64}`;
  return `module.exports = ${JSON.stringify(url)}`;
}

function defaultLoader(
  filename: string,
  babelEnvOptions: { [key: string]: any } = {}
): string | { code: string; map: any } {
  debug(`Loading ${filename}`);
  const extension = path.extname(filename);

  switch (extension) {
    case ".json": {
      return loadJson(filename);
    }
    case ".css": {
      return loadCss(filename);
    }

    case ".js":
    case ".jsx":
    case ".cjs":
    case ".mjs":
    case ".mjsx":
    case ".cjsx":
    case ".ts":
    case ".tsx":
    case ".mts":
    case ".cts":
    case ".mtsx":
    case ".ctsx": {
      if (
        (extension === ".js" || extension === ".cjs") &&
        filename.match(/node_modules/)
      ) {
        return loadJsUncompiled(filename);
      } else {
        return loadJsCompiled(filename, babelEnvOptions);
      }
    }

    default: {
      return loadFile(filename);
    }
  }
}

export const load = defaultLoader;
