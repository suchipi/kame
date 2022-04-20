#!/usr/bin/env node
import path from "path";
import chalk from "chalk";
import { configure } from "../index";
import parseArgv from "./parse-argv";

const parsedArgv = parseArgv(process.argv.slice(2));

const kame = configure(parsedArgv.inputConfig);

const input = parsedArgv.getInput();
const output = parsedArgv.getOutput(true);
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
