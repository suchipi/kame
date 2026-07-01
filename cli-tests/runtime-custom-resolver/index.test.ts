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
      "--resolver",
      path(__dirname, "./resolver.js"),
    ],
    {
      cwd: __dirname,
    }
  );

  await run.completion;

  expect(run.result).toMatchInlineSnapshot(`
    {
      "code": 0,
      "error": false,
      "stderr": "--resolver is deprecated; use --config instead.
    ",
      "stdout": "hi
    hi from something
    ",
    }
  `);
});
