import { test, expect } from "vitest";
import firstBase from "first-base";
import { cli, path, read, write, remove } from "../test-util";

test("works", async () => {
  const run = firstBase.spawn(cli, ["run", "--input", "./index.js"], {
    cwd: __dirname,
  });

  await run.completion;

  expect(run.result).toMatchInlineSnapshot(`
    {
      "code": 0,
      "error": false,
      "stderr": "",
      "stdout": "hi
    ",
    }
  `);
});

test("works with unqualified path", async () => {
  const run = firstBase.spawn(cli, ["run", "--input", "index.js"], {
    cwd: __dirname,
  });

  await run.completion;

  expect(run.result).toMatchInlineSnapshot(`
    {
      "code": 0,
      "error": false,
      "stderr": "",
      "stdout": "hi
    ",
    }
  `);
});
