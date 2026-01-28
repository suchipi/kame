import { test, expect } from "vitest";
import firstBase from "first-base";
import { cli, path, read, write, remove } from "../test-util";

test("works", async () => {
  const run = firstBase.spawn(cli, ["run", "--input", "./index.js"], {
    cwd: __dirname,
    env: Object.assign({}, process.env, {
      KAME_ALLOW_UNRESOLVED: "true",
    }),
  });

  await run.completion;

  expect(run.cleanResult()).toMatchInlineSnapshot(`
    {
      "code": 1,
      "error": false,
      "stderr": "<rootDir>/dist/runtime.js
                    throw (0, source_maps_1.applySourceMapsToError)(sourceMaps, err);
                    ^

    Error: Module not found: Tried to load "./not-there" from "<rootDir>/cli-tests/runtime-unresolved/index.js"
        at somewhere

    Node.js v24.6.0
    ",
      "stdout": "",
    }
  `);
});
