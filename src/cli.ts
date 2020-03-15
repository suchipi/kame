#!/usr/bin/env node
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
  ],
});

const usage = `Usage: kame <command> [options]

<command>: What to do. Can be 'run' or 'bundle'.

Options:
--input: The file to run, or the bundle entrypoint.

--output: The folder to write bundle output to.

--global: The name of the global variable that the bundle contents should
          be written to, if the bundle is loaded in an environment without
          a module loader.

--loader: The path to a file that exports a loader function, which kame will
          use to read modules from disk and convert them to JavaScript.

          Defaults to 'node_modules/kame/dist/default-loader.js'.

--resolver: The path to a file that exports a resolver function, which kame
            will use to convert the strings appearing in requires and imports
            into absolute paths to files on disk.

            Defaults to 'node_modules/kame/dist/default-resolver.js'.

--runtime-eval: The path to a file that exports an eval function, which kame
                will use to execute code (in run mode only).

                Defaults to 'node_modules/kame/dist/default-runtime-eval.js'.
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
    const input = argv.input || argv._[1];
    if (!input) {
      console.log(`No input file specified. Use --input to specify one.\n`);
      console.log(usage);
      process.exit(1);
    }

    console.log(`Running ${input}`);

    const runtime = new kame.Runtime();
    runtime.load(argv.input || argv._[1]);
  } else if (argv._[0] === "bundle") {
    const input = argv.input || argv._[1];
    const output = argv.output || argv._[2];
    const globalName = argv.global;
    if (!input) {
      console.log(`No input file specified. Use --input to specify one.\n`);
      console.log(usage);
      process.exit(1);
    }
    if (!output) {
      console.log(`No output file specified. Use --output to specify one.\n`);
      console.log(usage);
      process.exit(1);
    }
    if (!globalName) {
      console.log(`No global name specified. Use --global to specify one.\n`);
      console.log(usage);
      process.exit(1);
    }

    const bundler = new kame.Bundler();
    const { warnings, writtenFiles } = bundler.bundle({
      input,
      output,
      globalName,
    });

    warnings.forEach((warning) => {
      console.warn(warning);
    });
    console.log(chalk.blue("Files created:"));
    writtenFiles.forEach((file) => {
      console.log(path.relative(process.cwd(), file));
    });
  } else {
    console.log(`Unknown command: ${argv._[0]}\n`);
    console.log(usage);
    process.exitCode = 1;
  }
}
