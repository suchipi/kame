import { test, expect } from "vitest";
import firstBase from "first-base";
import { cli, path, read, write, remove } from "../test-util";

test("works", async () => {
  const run = firstBase.spawn(
    cli,
    ["run", "--input", "./index.js", "--runtime-eval", "./evaluator.js"],
    {
      cwd: __dirname,
    }
  );

  await run.completion;

  expect(run.result).toMatchInlineSnapshot(`
    {
      "code": 0,
      "error": false,
      "stderr": "--runtime-eval is deprecated; use --config instead.
    ",
      "stdout": "hi
    ",
    }
  `);
});
