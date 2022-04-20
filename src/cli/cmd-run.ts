#!/usr/bin/env node
import { configure } from "../index";
import parseArgv from "./parse-argv";

const parsedArgv = parseArgv(process.argv.slice(2));
const kame = configure(parsedArgv.inputConfig);

const input = parsedArgv.getInput();

const runtime = new kame.Runtime();
runtime.load(input);
