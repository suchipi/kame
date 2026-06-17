import fs from "fs";
import path from "path";
import mime from "mime-types";
import * as swc from "@swc/core";
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
  {
    target = "es5",
  }: {
    target?:
      | "es3"
      | "es5"
      | "es2015"
      | "es2016"
      | "es2017"
      | "es2018"
      | "es2019"
      | "es2020"
      | "es2021"
      | "es2022"
      | "esnext";
  } = {}
) {
  debug(`loadJsCompiled`);
  const extension = path.extname(filename);

  let mode: "ts" | "js";
  if (/\.[cm]?tsx?$/.test(extension)) {
    mode = "ts";
  } else {
    mode = "js";
  }

  const result = swc.transformFileSync(filename, {
    swcrc: false,
    filename,
    sourceMaps: true,
    module: {
      type: "commonjs",
      ignoreDynamic: true,
    },
    jsc: {
      target,
      externalHelpers: true,
      parser:
        mode === "ts"
          ? {
              syntax: "typescript",
              tsx: true,
              decorators: true,
              dynamicImport: true,
            }
          : {
              syntax: "ecmascript",
              jsx: true,
              functionBind: true,
              decorators: true,
              decoratorsBeforeExport: true,
              exportDefaultFrom: true,
              importAssertions: true,
            },
    },
  });

  const code = result?.code || "";
  const map = result?.map ? JSON.parse(result.map) : null;

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
  {
    target = "es5",
  }: {
    target?:
      | "es3"
      | "es5"
      | "es2015"
      | "es2016"
      | "es2017"
      | "es2018"
      | "es2019"
      | "es2020"
      | "es2021"
      | "es2022"
      | "esnext";
  } = {}
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
        return loadJsCompiled(filename, { target });
      }
    }

    default: {
      return loadFile(filename);
    }
  }
}

export const load = defaultLoader;
