import { test, expect } from "vitest";
import firstBase from "first-base";
import { cli, path, read, write, remove } from "../test-util";

test("works", async () => {
  const run = firstBase.spawn(
    cli,
    ["run", "--input", "./index.js", "--runtime-eval", "evaluator.js"],
    {
      cwd: __dirname,
    }
  );

  await run.completion;

  expect(run.result).toMatchInlineSnapshot(`
    {
      "code": 0,
      "error": false,
      "stderr": "",
      "stdout": "Code from index.js:
    (function (exports, require, module, __filename, __dirname) { "use strict";
    console.log("hi");

    })


    ",
    }
  `);
});
