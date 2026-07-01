import fs from "fs";
import path from "path";
import * as clef from "clef-parse";
import { InputConfig } from "../config";
import { warnOnce } from "../warn-once";

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
  const { options, positionalArgs } = clef.parseArgv(input, {
    help: Boolean,
    h: Boolean,
    version: Boolean,
    v: Boolean,
    watch: Boolean,
    isWatchChild: Boolean,
    input: String,
    output: String,
    global: String,
    loader: String,
    resolver: String,
    runtimeEval: String,
    codeSplittingId: String,
    config: String,
  });

  function getInput(): string {
    let input = options.input || positionalArgs[1];

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
    let output = options.output || positionalArgs[2];
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

  let config = options.config;
  const autoConfigPaths = [
    path.join(process.cwd(), "kame.config.ts"),
    path.join(process.cwd(), "kame.config.js"),
  ];
  if (
    !options.config &&
    !options.loader &&
    !options.resolver &&
    !options.runtimeEval
  ) {
    const existingConfigAtAutoConfigPath = autoConfigPaths.find(
      (autoConfigPath) => fs.existsSync(autoConfigPath)
    );
    if (existingConfigAtAutoConfigPath != null) {
      config = existingConfigAtAutoConfigPath;
    }
  }

  if (options.loader) {
    warnOnce("--loader is deprecated; use --config instead.");
  }
  if (options.resolver) {
    warnOnce("--resolver is deprecated; use --config instead.");
  }
  if (options.runtimeEval) {
    warnOnce("--runtime-eval is deprecated; use --config instead.");
  }

  return {
    cmd: positionalArgs[0] ? String(positionalArgs[0]) : undefined,
    watch: options.watch || false,
    isWatchChild: options.isWatchChild || false,
    help: options.help || options.h || false,
    version: options.version || options.v || false,
    globalName: options.global === "null" ? null : options.global,
    codeSplittingId: options.codeSplittingId,
    inputConfig: config || {
      load: options.loader,
      resolve: options.resolver,
      evaluate: options.runtimeEval,
    },
    getInput,
    getOutput,
  };
}
