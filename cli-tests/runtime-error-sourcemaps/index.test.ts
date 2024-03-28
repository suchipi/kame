import { test, expect } from "vitest";
import firstBase from "first-base";
import { cli, path, read, write, remove, cleanResult } from "../test-util";

test("works", async () => {
  const run = firstBase.spawn(cli, ["run", "--input", "./index.ts"], {
    cwd: __dirname,
  });

  await run.completion;

  expect(cleanResult(run.result)).toMatchInlineSnapshot(`
    {
      "code": 1,
      "error": false,
      "stderr": "<rootDir>/dist/runtime.js:137
                    throw (0, source_maps_1.applySourceMapsToError)(sourceMaps, err);
                    ^

    Error: uh oh spongebob
        at Whatever.someOtherThirdThing (<rootDir>/cli-tests/runtime-error-sourcemaps/index.ts:21:17)
        at Whatever.anotherMethod (<rootDir>/cli-tests/runtime-error-sourcemaps/index.ts:17:10)
        at Whatever.someMethod (<rootDir>/cli-tests/runtime-error-sourcemaps/index.ts:13:10)
        at new Whatever (<rootDir>/cli-tests/runtime-error-sourcemaps/index.ts:9:10)
        at <rootDir>/cli-tests/runtime-error-sourcemaps/index.ts:28:18
        at Object.run (<rootDir>/dist/runtime.js:118:13)
        at Module._load (<rootDir>/node_modules/commonjs-standalone/dist/index.js:43:22)
        at Runtime._run (<rootDir>/dist/runtime.js:134:53)
        at Runtime.load (<rootDir>/dist/runtime.js:130:25)
        at Object.<anonymous> (<rootDir>/dist/cli/cmd-run.js:18:9) {
      someProperty: 65
    }

    Node.js v20.11.1
    ",
      "stdout": "",
    }
  `);
});
