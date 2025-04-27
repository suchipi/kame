import { test, expect } from "vitest";
import firstBase from "first-base";
import { cli, path, read, write, remove } from "../test-util";

test("works", async () => {
  const run = firstBase.spawn(
    cli,
    [
      "run",
      "--input",
      "./src/index.js",
      "--config",
      path(__dirname, "./config.js"),
    ],
    {
      cwd: __dirname,
    }
  );

  await run.completion;

  expect(run.cleanResult()).toMatchInlineSnapshot(`
    {
      "code": 0,
      "error": false,
      "stderr": "",
      "stdout": "running <rootDir>/cli-tests/runtime-with-config/src/index.js
    yo
    running <rootDir>/cli-tests/runtime-with-config/outside-src/something.js
    yo from something
    ",
    }
  `);
});
