#!/usr/bin/env node
import fs from "fs";
import path from "path";
import chalk from "chalk";
import yargsParser from "yargs-parser";
import { configure } from "./index";
import { InputConfig } from "./config";

const argv = yargsParser(process.argv.slice(2), {
  boolean: ["help"],
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

function getInput(argv): string {
  let input = argv.input || argv._[1];

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

function getOutput(argv): string {
  let output = argv.output || argv._[2];
  if (!output) {
    output = path.join(process.cwd(), "dist", "index.js");
    console.warn(
      `Using default output path of './dist/index.js'. Use --output to override.`
    );
  }

  return output;
}

const usage = `Usage: kame <command> [options]

<command>: What to do. Can be 'run' or 'bundle'.

Options:
--input: The file to run, or the bundle entrypoint.

         If left unspecified, kame will attempt to use whichever of these files
         exists, in order:

         - ./src/index.tsx
         - ./src/index.ts
         - ./src/index.jsx
         - ./src/index.js
         - ./index.tsx
         - ./index.ts
         - ./index.jsx
         - ./index.js

--output: The file to write bundle output to.

          If left unspecified, kame will default to './dist/index.js'.

          Note: If you use code splitting (dynamic import), then the
          split chunks will be written into the same folder as the
          output file, with autogenerated names. For this reason, you
          may want the output file to be in something like a 'dist' or
          'build' folder.

--global: The name of the global variable that the bundle contents should
          be written to, if the bundle is loaded in an environment without
          a module loader. If you pass the string "null", then no global
          will be written.

          If left unspecified, no global variable will be written.

--loader: The path to a file that exports a loader function, which kame will
          use to read modules from disk and convert them to JavaScript.

          A loader module should export a function that receives a
          string (the file to load), and returns a string (the code to
           execute in the browser). Loader modules must be synchronous,
           because they're called when 'require' is called.

          Defaults to 'node_modules/kame/dist/default-loader.js',
          which supports ES2020, React, TypeScript, and Flow.

--resolver: The path to a file that exports a resolver function, which kame
            will use to convert the strings appearing in requires and imports
            into absolute paths to files on disk.

            The resolver function should be defined according to the
            eslint-plugin-import resolver spec v2 as defined at the
            following url:

            https://github.com/benmosher/eslint-plugin-import/blob/b916ed2b574a107e62f819663b8c300f82d82d8d/resolvers/README.md

            Defaults to 'node_modules/kame/dist/default-resolver.js', which
            implements node's module resolution algorithm, and supports
            omitting the extension in the import/require for any of these
            filetypes: ".js", ".json", ".mjs", ".jsx", ".ts", and ".tsx".

--runtime-eval: The path to a file that exports an eval function, which kame
                will use to execute code (in run mode only).

                The eval function will receive:
                - A code string (always an expression)
                - The absolute path to the file where the code came from

                And should return:
                - The result of evaluating the code string

                Defaults to 'node_modules/kame/dist/default-runtime-eval.js',
                which uses node's builtin \`vm\` module to run code.

--code-splitting-id: A globally-unique id used to tie code-split chunks from
                     this bundle to the correct kame instance.

                     When using dynamic import syntax (\`import()\`), kame
                     splits your code into separate files, some of which have
                     generated filenames. These files are called "chunks".

                     The first chunk that gets loaded is called the "entry"
                     chunk. The entry chunk sets up a module cache and loader
                     that other chunks then hook into in order to load modules
                     at a later time. This module cache and loader is called
                     the "kame instance".

                     If your code contains two separate kame bundles,
                     and they both use dynamic imports, then kame needs a way
                     to tell some chunks "go use this kame instance" and
                     other chunks "go use that kame instance".

                     That's where the code-splitting id comes in. It's a
                     globally-unique identifier that can be used to
                     differentiate one kame instance from another.

                     When kame compiles a bundle, every chunk in it includes
                     the code-splitting id.

                     The code-splitting id defaults to an autogenerated unique
                     id. But, if you want your chunks to be separately cacheable
                     for browsers (so that unchanged chunks don't need to be
                     redownloaded), you'll need to set your own code-splitting
                     id.

                     If you aren't using code-splitting, you don't need to
                     care about this.
`;

if (argv.help) {
  console.log(usage);
  process.exitCode = 1;
} else {
  const inputConfig: InputConfig = {
    loader: argv.loader,
    resolver: argv.resolver,
    runtimeEval: argv.runtimeEval,
  };
  const kame = configure(inputConfig);

  if (argv._[0] === "run") {
    const input = getInput(argv);

    console.warn(
      `Running ${
        path.isAbsolute(input) ? path.relative(process.cwd(), input) : input
      }`
    );

    const runtime = new kame.Runtime();
    runtime.load(argv.input || argv._[1]);
  } else if (argv._[0] === "bundle") {
    const input = getInput(argv);
    const output = getOutput(argv);

    let globalName = argv.global;
    if (globalName === undefined) globalName = null;
    if (globalName === "null") globalName = null;

    const codeSplittingId = argv.codeSplittingId || undefined;

    const bundler = new kame.Bundler();
    const { warnings, writtenFiles } = bundler.bundle({
      input,
      output,
      globalName,
      codeSplittingId,
    });

    warnings.forEach((warning) => {
      console.warn(warning);
    });
    console.warn(chalk.blue("Files created:"));
    writtenFiles.forEach((file) => {
      console.log(path.relative(process.cwd(), file));
    });
  } else {
    console.error(`Unknown command: ${argv._[0]}\n`);
    console.error(usage);
    process.exitCode = 1;
  }
}
