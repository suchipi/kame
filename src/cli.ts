#!/usr/bin/env node
import path from "path";
import kleur from "kleur";
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
      console.warn(kleur.yellow("    process errored:"));
      console.warn(error);

      console.warn(kleur.dim("    process will re-run on next file change."));
    });

    child.on("close", (code, signal) => {
      console.warn(
        kleur.cyan("    process exited: " + JSON.stringify({ code, signal }))
      );
      console.warn(kleur.dim("    process will re-run on next file change."));
    });
  };

  spawn();

  let isRestarting = false;
  chokidar
    .watch(".", { ignoreInitial: true, persistent: true })
    .on("all", async (eventName, filepath) => {
      if (isRestarting) return;
      if (!filter(filepath)) return;

      console.warn(kleur.cyan(`    ${eventName}: ${filepath}`));

      isRestarting = true;

      if (child.pid != null) {
        await childUtils.kill(child.pid);
      }

      spawn();
      isRestarting = false;
    });
}

if (parsedArgv.help) {
  console.log(usage());
  process.exitCode = 1;
} else if (parsedArgv.version) {
  console.log(require("../package.json").version);
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
      console.error(usage());
      process.exitCode = 1;
    }
  }
}
