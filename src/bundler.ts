import fs from "fs";
import path from "path";
import crypto from "crypto";
import kleur from "kleur";
import { uid } from "uid";
import type { NodePath } from "@babel/core";
import * as t from "@babel/types";
import generate from "@babel/generator";
import * as parser from "@babel/parser";
import traverse from "@babel/traverse";
import { codeFrameColumns } from "@babel/code-frame";
import { Config } from "./config";
import { entryWrapper, chunkWrapper, externalWrapper } from "./bundle-wrapper";
import bakeNodeEnv from "./bake-node-env";

type Modules = { [id: string]: string };

export interface IBundler {
  bundle(options: {
    input: string;
    output: string;
    globalName?: string;
    codeSplittingId?: string;
    pathsRelativeTo?: string;
  }): {
    warnings: string[];
    writtenFiles: string[];
  };
}

function parsePath(
  somepath: string
):
  | { kind: "external"; id: string }
  | { kind: "unresolved"; id: string; fromFilePath: string }
  | { kind: "normal"; path: string } {
  const matches = somepath.match(/^(external|unresolved):/);
  if (matches) {
    const protocol = matches[1];
    switch (protocol) {
      case "external": {
        return {
          kind: "external",
          id: somepath.replace("external:", ""),
        };
      }
      case "unresolved": {
        const [fromFilePath, id] = somepath
          .replace("unresolved:", "")
          .split("|");

        return {
          kind: "unresolved",
          fromFilePath,
          id,
        };
      }
      default: {
        throw new Error(
          "Unhandled protocol in resolved path string: " + protocol
        );
      }
    }
  } else {
    return { kind: "normal", path: somepath };
  }
}

function makeRelative(context: string, filepath: string) {
  const parsedPath = parsePath(filepath);
  switch (parsedPath.kind) {
    case "normal": {
      return path.relative(context, filepath);
    }
    case "external": {
      return filepath;
    }
    case "unresolved": {
      return (
        "unresolved:" +
        path.relative(context, parsedPath.fromFilePath) +
        "|" +
        parsedPath.id
      );
    }
  }
}

export default function makeBundler(config: Config): { new (): IBundler } {
  return class Bundler implements IBundler {
    private _pendingChunks: Array<string> = [];
    private _warnings: Array<string> = [];
    private _pathsRelativeTo: string = "";

    private _transformRequires(
      filename: string,
      code: string
    ): { transformedCode: string; resolvedRequires: Array<string> } {
      const resolvedRequires: Array<string> = [];
      const pendingChunks = this._pendingChunks;
      const warnings = this._warnings;
      const pathsRelativeTo = this._pathsRelativeTo;

      const ast = parser.parse(code, {
        allowAwaitOutsideFunction: true,
        allowImportExportEverywhere: true,
        allowNewTargetOutsideFunction: true,
        allowReturnOutsideFunction: true,
        allowSuperOutsideMethod: true,
        allowUndeclaredExports: true,
        sourceType: "module",
      });
      traverse(ast, {
        ImportOrExportDeclaration(nodePath) {
          const { node } = nodePath;
          warnings.push(
            kleur.yellow(
              `Found ECMAScript module syntax in '${filename}' after it was processed by the loader. When using a custom loader, your loader needs to compile ECMAScript Module (ESM) syntax to CommonJS (CJS) syntax.`
            ) +
              "\n" +
              codeFrameColumns(code, node.loc, { highlightCode: true })
          );
        },
        CallExpression(nodePath) {
          const { node } = nodePath;

          const hasOneStringArg =
            node.arguments.length === 1 && t.isStringLiteral(node.arguments[0]);

          const isRequire =
            t.isIdentifier(node.callee) && node.callee.name === "require";

          const isImport = t.isImport(node.callee);

          if (isRequire || isImport) {
            if (!hasOneStringArg) {
              warnings.push(
                kleur.yellow(
                  `Found a non-static ${
                    isRequire ? "require" : "import"
                  } in '${filename}'. This cannot be bundled, and will be left as-is.`
                ) +
                  "\n" +
                  codeFrameColumns(code, node.loc, { highlightCode: true })
              );
              return;
            }

            // @ts-ignore
            const source: NodePath<t.StringLiteral> =
              nodePath.get("arguments")[0];

            const currentValue = source.node.value;

            let resolverResult: string;
            try {
              resolverResult = config.resolver(currentValue, filename);
            } catch (err: any) {
              const newMessage =
                `${kleur.red("Resolver failed in")} ${kleur.yellow(
                  "'" + filename + "'"
                )}: ` +
                err.message +
                "\n" +
                codeFrameColumns(code, node.loc, { highlightCode: true });
              Object.defineProperty(err, "message", { value: newMessage });
              throw err;
            }

            const newValue = makeRelative(pathsRelativeTo, resolverResult);

            if (isRequire) {
              resolvedRequires.push(newValue);

              nodePath.replaceWith(
                t.callExpression(t.identifier("_kame_require_"), [
                  t.stringLiteral(newValue),
                ])
              );
            } else {
              pendingChunks.push(newValue);
              nodePath.replaceWith(
                t.callExpression(t.identifier("_kame_dynamic_import_"), [
                  t.stringLiteral(newValue),
                ])
              );
            }
          }
        },
      });

      return {
        transformedCode: generate(ast).code,
        resolvedRequires,
      };
    }

    private _gatherModules(entry: string): Modules {
      const modules: Modules = {};

      const filesToProcess: Array<string> = [];
      filesToProcess.push(entry);

      let file: string | undefined;
      while ((file = filesToProcess.shift())) {
        if (modules[file]) continue;

        if (file.startsWith("external:")) {
          modules[file] = externalWrapper(file);
          continue;
        }

        if (file.startsWith("unresolved:")) {
          const [fromFilePath, id] = file
            .replace(/^unresolved:/, "")
            .split("|");

          modules[file] = `throw new Error(${JSON.stringify(
            `Module wasn't found at bundle time: Tried to load ${JSON.stringify(
              id
            )} from ${JSON.stringify(fromFilePath)}`
          )});`;
          continue;
        }

        const absFile = path.resolve(this._pathsRelativeTo, file);
        let code: string;
        // prettier-ignore
        try {
          const result = config.loader(absFile);
          if (typeof result === "string") {
            code = result;
          } else {
            code = result.code;
          }
        } catch (err: any) {
          const newMessage =
            `${kleur.red("Loader failed to load")} ${kleur.yellow(
              "'" + absFile + "'"
            )}: ` + err.message;
          Object.defineProperty(err, "message", { value: newMessage });
          throw err;
        }
        try {
          code = bakeNodeEnv(code, process.env.NODE_ENV || "production");
        } catch (err) {
          this._warnings.push(
            kleur.yellow(
              `Warning: Kame bundler failed to bake process.env.NODE_ENV into the generated code for '${absFile}'.\n${err}`
            )
          );
        }

        const { transformedCode, resolvedRequires } = this._transformRequires(
          file,
          code
        );
        modules[file] = transformedCode;

        const newResolvedRequires = resolvedRequires.filter(
          (reqPath) => !modules.hasOwnProperty(reqPath)
        );
        filesToProcess.push(...newResolvedRequires);
      }

      return modules;
    }

    bundle({
      input,
      output,
      globalName,
      codeSplittingId = uid() + Date.now(),
      pathsRelativeTo = process.cwd(),
    }: {
      input: string;
      output: string;
      globalName?: string;
      codeSplittingId?: string;
      pathsRelativeTo?: string;
    }) {
      this._pendingChunks = [];
      this._warnings = [];
      this._pathsRelativeTo = pathsRelativeTo;

      const writtenFiles: Array<string> = [];

      if (!path.isAbsolute(input)) {
        input = path.resolve(pathsRelativeTo, input);
      }
      if (!path.isAbsolute(output)) {
        output = path.resolve(pathsRelativeTo, output);
      }

      fs.mkdirSync(path.dirname(output), { recursive: true });

      const relativeInput = makeRelative(pathsRelativeTo, input);
      const entryModules = this._gatherModules(relativeInput);

      const chunkUrls = {};

      let pendingChunk: string | undefined;
      while ((pendingChunk = this._pendingChunks.shift())) {
        const chunkModules = this._gatherModules(pendingChunk);
        Object.keys(chunkModules).forEach((key) => {
          if (entryModules[key]) {
            delete chunkModules[key];
          }
        });

        const chunkHash = crypto
          .createHash("md5")
          .update(Object.values(chunkModules).join("\n") + codeSplittingId)
          .digest("hex");

        const chunkOutputFilename = `${chunkHash}.js`;
        chunkUrls[pendingChunk] = chunkOutputFilename;
        const chunkOutputPath = path.join(
          path.dirname(output),
          chunkOutputFilename
        );

        const chunkCode = chunkWrapper({
          entryId: pendingChunk,
          codeSplittingId,
          modules: chunkModules,
        });

        fs.writeFileSync(chunkOutputPath, chunkCode);
        writtenFiles.push(chunkOutputPath);
      }

      let entryCode = entryWrapper({
        entryId: relativeInput,
        globalName,
        codeSplittingId,
        modules: entryModules,
        chunkUrls,
      });

      fs.writeFileSync(output, entryCode);
      writtenFiles.push(output);

      return {
        warnings: this._warnings,
        writtenFiles,
      };
    }
  };
}
