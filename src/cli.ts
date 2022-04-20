#!/usr/bin/env node
import path from "path";
import chalk from "chalk";
import { configure } from "./index";
import parseArgv from "./cli/parse-argv";
import usage from "./cli/usage";

const parsedArgv = parseArgv(process.argv.slice(2));

if (parsedArgv.help) {
  console.log(usage);
  process.exitCode = 1;
} else {
  const kame = configure(parsedArgv.inputConfig);

  if (parsedArgv.cmd === "run") {
    const input = parsedArgv.getInput();

    console.warn(
      `Running ${
        path.isAbsolute(input) ? path.relative(process.cwd(), input) : input
      }`
    );

    const runtime = new kame.Runtime();
    runtime.load(input);
  } else if (parsedArgv.cmd === "bundle") {
    const input = parsedArgv.getInput();
    const output = parsedArgv.getOutput();
    const globalName = parsedArgv.globalName;
    const codeSplittingId = parsedArgv.codeSplittingId || undefined;

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
    console.error(`Unknown command: ${parsedArgv.cmd}\n`);
    console.error(usage);
    process.exitCode = 1;
  }
}
