import fs from "fs";
import path from "path";
import * as babel from "@babel/core";
import mime from "mime-types";
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
  babelEnvOptions: { [key: string]: any } = {}
) {
  debug(`loadJsCompiled`);
  const extension = path.extname(filename);

  const config: babel.TransformOptions = {
    babelrc: false,
    sourceType: "unambiguous",
    presets: [
      [
        require("@babel/preset-env").default,
        { modules: false, ...babelEnvOptions },
      ],
      require("@babel/preset-react").default,
    ],
    plugins: [
      require("@babel/plugin-proposal-class-properties").default,
      require("@babel/plugin-proposal-nullish-coalescing-operator").default,
      require("@babel/plugin-proposal-optional-chaining").default,
      require("@babel/plugin-transform-modules-commonjs").default,
    ],
    filename,
  };

  if (extension === ".ts" || extension === ".tsx") {
    config.presets!.push(require("@babel/preset-typescript").default);
  } else {
    config.plugins!.push(
      require("@babel/plugin-transform-flow-strip-types").default
    );
  }

  const result = babel.transformFileSync(filename, {
    ...config,
    sourceMaps: true,
  });
  const code = result?.code || "";

  const map = result?.map || null;

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
    case ".mjs":
    case ".cjs":
    case ".ts":
    case ".tsx": {
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
