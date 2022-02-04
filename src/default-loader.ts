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
      return "module.exports = " + fs.readFileSync(filename, "utf-8");
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
      debug(`js case`);

      let code = "";
      if (extension === ".js" && filename.match(/node_modules/)) {
        debug(`js case uncompiled`);
        code = fs.readFileSync(filename, "utf-8");
      } else {
        const config = {
          sourceType: "unambiguous" as "unambiguous",
          presets: [
            [require("@babel/preset-env").default, { modules: false }],
            require("@babel/preset-react").default,
          ],
          plugins: [
            require("@babel/plugin-proposal-class-properties").default,
            require("@babel/plugin-proposal-nullish-coalescing-operator")
              .default,
            require("@babel/plugin-proposal-optional-chaining").default,
            require("@babel/plugin-transform-modules-commonjs").default,
          ],
          filename,
        };

        if (extension === ".ts" || extension === ".tsx") {
          config.presets.push(require("@babel/preset-typescript").default);
        } else {
          config.plugins.push(
            require("@babel/plugin-transform-flow-strip-types").default
          );
        }

        const result = babel.transformFileSync(filename, config);
        debug(`js case compiled`);
        code = result?.code || "";
      }

      const codeWithoutShebang = code.replace(/^#![^\r\n]*/, "");
      return codeWithoutShebang;
    }

    default: {
      debug(`default case`);
      const type = mime.lookup(extension) || "application/octet-stream";
      const base64 = fs.readFileSync(filename, "base64");
      const url = `data:${type};base64,${base64}`;
      return `module.exports = ${JSON.stringify(url)}`;
    }
  }
}
