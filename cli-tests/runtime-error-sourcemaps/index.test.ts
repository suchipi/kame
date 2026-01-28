import { test, expect } from "vitest";
import firstBase from "first-base";
import { cli, path, read, write, remove } from "../test-util";

test("works", async () => {
  const run = firstBase.spawn(cli, ["run", "--input", "./index.ts"], {
    cwd: __dirname,
  });

  await run.completion;

  expect(run.cleanResult()).toMatchInlineSnapshot(`
    {
      "code": 1,
      "error": false,
      "stderr": "<rootDir>/dist/runtime.js
                    throw (0, source_maps_1.applySourceMapsToError)(sourceMaps, err);
                    ^

    Error: uh oh spongebob
        at somewhere
      someProperty: 65
    }

    Node.js v24.11.1
    ",
      "stdout": "",
    }
  `);
});
