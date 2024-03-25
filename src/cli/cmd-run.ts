#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { configure } from "../index";
import parseArgv from "./parse-argv";

const parsedArgv = parseArgv(process.argv.slice(2));
const kame = configure(parsedArgv.inputConfig);

let input = parsedArgv.getInput();

if (!path.isAbsolute(input) && fs.existsSync(input)) {
  input = "./" + input;
}

const runtime = new kame.Runtime();
runtime.load(input);
