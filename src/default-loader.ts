import fs from "fs";
import path from "path";
import * as babel from "@babel/core";
import mime from "mime-types";
import makeDebug from "debug";

const debug = makeDebug("kame/default-loader");

export default function defaultLoader(filename: string): string {
  debug(`Loading ${filename}`);

  const extension = path.extname(filename);

  switch (extension) {
    case ".json": {
      return "module.exports = " + fs.readFileSync(filename);
    }
    case ".node": {
      return require(filename);
    }
    case ".css": {
      const content = fs.readFileSync(filename, "utf-8");
      return `
        var style = document.createElement("style");
        style.type = "text/css";
        style.textContent = ${JSON.stringify(content)};
        document.head.appendChild(style);
      `;
    }
    case ".js":
    case ".jsx":
    case ".mjs":
    case ".ts":
    case ".tsx": {
      if (filename.match(/node_modules/)) {
        return fs.readFileSync(filename, "utf-8");
      }

      const config = {
        sourceType: "unambiguous" as "unambiguous",
        presets: [
          ["@babel/preset-env", { modules: false }],
          "@babel/preset-react",
        ],
        plugins: [
          "@babel/plugin-proposal-class-properties",
          "@babel/plugin-proposal-nullish-coalescing-operator",
          "@babel/plugin-proposal-optional-chaining",
          "@babel/plugin-transform-modules-commonjs",
        ],
      };

      if (extension === ".ts" || extension === ".tsx") {
        config.presets.push("@babel/preset-typescript");
      } else {
        config.plugins.push("@babel/plugin-transform-flow-strip-types");
      }

      const result = babel.transformFileSync(filename, config);
      return result?.code || "";
    }

    default: {
      const type = mime.lookup(extension) || "application/octet-stream";
      const base64 = fs.readFileSync(filename, "base64");
      const url = `data:${type};base64,${base64}`;
      return `module.exports = ${JSON.stringify(url)}`;
    }
  }
}
