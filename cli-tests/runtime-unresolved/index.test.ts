import { test, expect } from "vitest";
import firstBase from "first-base";
import { cli, path, read, write, remove, cleanResult } from "../test-util";

test("works", async () => {
  const run = firstBase.spawn(cli, ["run", "--input", "./index.js"], {
    cwd: __dirname,
    env: Object.assign({}, process.env, {
      KAME_ALLOW_UNRESOLVED: "true",
    }),
  });

  await run.completion;

  expect(cleanResult(run.result)).toMatchInlineSnapshot(`
    {
      "code": 1,
      "error": false,
      "stderr": "<rootDir>/dist/runtime.js:137
                    throw (0, source_maps_1.applySourceMapsToError)(sourceMaps, err);
                    ^

    Error: Module not found: Tried to load "./not-there" from "<rootDir>/cli-tests/runtime-unresolved/index.js"
        at unresolved:<rootDir>/cli-tests/runtime-unresolved/index.js|./not-there:1:69
        at Object.run (<rootDir>/dist/runtime.js:118:13)
        at Module._load (<rootDir>/node_modules/commonjs-standalone/dist/index.js:43:22)
        at Module.require (<rootDir>/node_modules/commonjs-standalone/dist/index.js:56:23)
        at <rootDir>/cli-tests/runtime-unresolved/index.js:1:1
        at Object.run (<rootDir>/dist/runtime.js:118:13)
        at Module._load (<rootDir>/node_modules/commonjs-standalone/dist/index.js:43:22)
        at Runtime._run (<rootDir>/dist/runtime.js:134:53)
        at Runtime.load (<rootDir>/dist/runtime.js:130:25)
        at Object.<anonymous> (<rootDir>/dist/cli/cmd-run.js:18:9)

    Node.js v20.11.1
    ",
      "stdout": "",
    }
  `);
});
