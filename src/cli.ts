#!/usr/bin/env node
import path from "path";
import chalk from "chalk";
import chokidar from "chokidar";
import child_process from "child_process";
import * as childUtils from "./cli/child-process-utils";
import parseArgv from "./cli/parse-argv";
import usage from "./cli/usage";

const inputArgv = process.argv.slice(2);
const parsedArgv = parseArgv(inputArgv);

function spawnWatchChild(
  scriptPath: string,
  filter: (filepath: string) => boolean
) {
  let child: child_process.ChildProcess;

  const spawn = () => {
    child = child_process.spawn(
      process.argv[0],
      [scriptPath, "--is-watch-child", ...inputArgv],
      { stdio: "inherit" }
    );

    child.on("error", (error) => {
      console.warn(chalk.yellow("    process errored:"));
      console.warn(error);

      console.warn(chalk.dim("    process will re-run on next file change."));
    });

    child.on("close", (code, signal) => {
      console.warn(
        chalk.cyan("    process exited: " + JSON.stringify({ code, signal }))
      );
      console.warn(chalk.dim("    process will re-run on next file change."));
    });
  };

  spawn();

  let isRestarting = false;
  chokidar
    .watch(".", { ignoreInitial: true, persistent: true })
    .on("all", (eventName, filepath) => {
      if (isRestarting) return;
      if (!filter(filepath)) return;

      console.warn(chalk.cyan(`    ${eventName}: ${filepath}`));

      isRestarting = true;
      childUtils.kill(child.pid).then(() => {
        spawn();
        isRestarting = false;
      });
    });
}

if (parsedArgv.help) {
  console.log(usage);
  process.exitCode = 1;
} else {
  switch (parsedArgv.cmd) {
    case "run": {
      if (parsedArgv.watch && !parsedArgv.isWatchChild) {
        spawnWatchChild(require.resolve("./cli/cmd-run"), () => true);
      } else {
        require("./cli/cmd-run");
      }
      break;
    }
    case "bundle": {
      if (parsedArgv.watch && !parsedArgv.isWatchChild) {
        let output = parsedArgv.getOutput(false);
        if (!path.isAbsolute(output)) {
          output = path.resolve(process.cwd(), output);
        }

        spawnWatchChild(
          require.resolve("./cli/cmd-bundle"),
          (filepath) => filepath !== output
        );
      } else {
        require("./cli/cmd-bundle");
      }
      break;
    }
    default: {
      console.error(`Unknown command: ${parsedArgv.cmd}\n`);
      console.error(usage);
      process.exitCode = 1;
    }
  }
}
