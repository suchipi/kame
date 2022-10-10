import fs from "fs";
import path from "path";
import yargsParser from "yargs-parser";
import { InputConfig } from "../config";

export type ParsedArgv = {
  cmd: string | undefined;
  watch: boolean;
  isWatchChild: boolean;
  help: boolean;
  version: boolean;
  globalName: string | undefined;
  codeSplittingId: string;
  inputConfig: InputConfig;
  getInput: () => string;
  getOutput: (shouldLog: boolean) => string;
};

export default function parseArgv(input: Array<string>): ParsedArgv {
  const argvObj = yargsParser(input, {
    boolean: [
      "help",
      "h",
      "version",
      "v",
      "watch",
      "is-watch-child",
      "isWatchChild",
    ],
    string: [
      "input",
      "output",
      "global",
      "loader",
      "resolver",
      "runtime-eval",
      "runtimeEval",
      "codeSplittingId",
      "code-splitting-id",
    ],
  });

  function getInput(): string {
    let input = argvObj.input || argvObj._[1];

    if (!input) {
      const pathsToTry = [
        path.join(process.cwd(), "src", "index.tsx"),
        path.join(process.cwd(), "src", "index.ts"),
        path.join(process.cwd(), "src", "index.jsx"),
        path.join(process.cwd(), "src", "index.js"),
        path.join(process.cwd(), "index.tsx"),
        path.join(process.cwd(), "index.ts"),
        path.join(process.cwd(), "index.jsx"),
        path.join(process.cwd(), "index.js"),
      ];

      let pathToUse: string | null = null;
      while (!pathToUse && pathsToTry.length > 0) {
        const nextPath = pathsToTry.shift();
        if (!nextPath) break;
        if (fs.existsSync(nextPath)) {
          pathToUse = nextPath;
        }
      }

      if (pathToUse) {
        input = pathToUse;
        console.warn(
          `Auto-detected '${path.relative(
            process.cwd(),
            pathToUse
          )}' as the input file. Use --input to override.`
        );
      } else {
        console.error(
          `Could not auto-detect the input file. Please specify it with --input.`
        );
        console.error(`Run with --help for more info.`);
        process.exit(1);
      }
    }

    return input;
  }

  function getOutput(shouldLog: boolean): string {
    let output = argvObj.output || argvObj._[2];
    if (!output) {
      output = path.join(process.cwd(), "dist", "index.js");
      if (shouldLog) {
        console.warn(
          `Using default output path of './dist/index.js'. Use --output to override.`
        );
      }
    }

    return output;
  }

  return {
    cmd: argvObj._[0] ? String(argvObj._[0]) : undefined,
    watch: argvObj.watch || false,
    isWatchChild: argvObj.isWatchChild || false,
    help: argvObj.help || argvObj.h || false,
    version: argvObj.version || argvObj.v || false,
    globalName: argvObj.global === "null" ? null : argvObj.global,
    codeSplittingId: argvObj.codeSplittingId,
    inputConfig: {
      loader: argvObj.loader,
      resolver: argvObj.resolver,
      runtimeEval: argvObj.runtimeEval,
    },
    getInput,
    getOutput,
  };
}
