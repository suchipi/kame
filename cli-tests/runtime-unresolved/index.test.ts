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

  run.result.stderr = run.result.stderr
    .replace(new RegExp(process.cwd(), "g"), "<cwd>")
    .replace(/\(node:internal[^\n]+/g, "(node:internal)");

  expect(run.result).toMatchInlineSnapshot(`
    {
      "code": 1,
      "error": false,
      "stderr": "<cwd>/dist/runtime.js:131
                    throw (0, source_maps_1.applySourceMapsToError)(sourceMaps, err);
                    ^

    [Error: Module not found: Tried to load "./not-there" from "<cwd>/cli-tests/runtime-unresolved/index.js"
      at unresolved:<cwd>/cli-tests/runtime-unresolved/index.js|./not-there:1:69
      at Object.run (<cwd>/dist/runtime.js:118:13)
      at Module._load (<cwd>/node_modules/commonjs-standalone/dist/index.js:43:22)
      at Module.require (<cwd>/node_modules/commonjs-standalone/dist/index.js:56:23)
      at <cwd>/cli-tests/runtime-unresolved/index.js:1:1
      at Object.run (<cwd>/dist/runtime.js:118:13)
      at Module._load (<cwd>/node_modules/commonjs-standalone/dist/index.js:43:22)
      at Runtime.load (<cwd>/dist/runtime.js:128:53)
      at Object.<anonymous> (<cwd>/dist/cli/cmd-run.js:13:9)
      at Module._compile (node:internal)

    Node.js v20.11.1
    ",
      "stdout": "",
    }
  `);
});
