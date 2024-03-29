import { test, expect } from "vitest";
import fs from "node:fs";
import firstBase from "first-base";
import { cli, path, read, write, remove, rootDir } from "../test-util";

test("works", async () => {
  const configureRun = firstBase.spawn(
    rootDir("node_modules/.bin/node-gyp"),
    ["configure"],
    { cwd: path(__dirname, "sample-addon") }
  );
  await configureRun.completion;
  expect(configureRun.result.code).toBe(0);

  const buildRun = firstBase.spawn(
    rootDir("node_modules/.bin/node-gyp"),
    ["build"],
    { cwd: path(__dirname, "sample-addon") }
  );
  await buildRun.completion;
  expect(buildRun.result.code).toBe(0);

  expect(
    fs.existsSync(path(__dirname, "sample-addon/build/Release/addon.node"))
  ).toBe(true);

  const run = firstBase.spawn(cli, ["run", "--input", "./index.js"], {
    cwd: __dirname,
  });

  await run.completion;

  expect(run.result).toMatchInlineSnapshot(`
    {
      "code": 0,
      "error": false,
      "stderr": "",
      "stdout": "hello!
    ",
    }
  `);
});
