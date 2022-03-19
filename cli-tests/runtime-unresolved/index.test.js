const firstBase = require("first-base");
const { cli, path, read, write, remove } = require("../test-util");

test("works", async () => {
  const run = firstBase.spawn(cli, ["run", "--input", "./index.js"], {
    cwd: __dirname,
    env: Object.assign({}, process.env, {
      KAME_ALLOW_UNRESOLVED: "true",
    }),
  });

  await run.completion;

  run.result.stderr = run.result.stderr.replace(
    new RegExp(process.cwd(), "g"),
    "<cwd>"
  );

  expect(run.result).toMatchInlineSnapshot(`
    Object {
      "code": 1,
      "error": false,
      "stderr": "Running ./index.js
    <cwd>/dist/runtime.js:134
                    throw (0, source_maps_1.applySourceMapsToError)(sourceMaps, err);
                    ^

    [Error: Module not found: Tried to load \\"./not-there\\" from \\"<cwd>/cli-tests/runtime-unresolved/index.js\\"
      at unresolved:<cwd>/cli-tests/runtime-unresolved/index.js|./not-there:1:69
      at Object.run (<cwd>/dist/runtime.js:118:13)
      at Function._load (<cwd>/node_modules/commonjs-standalone/dist/index.js:57:16)
      at Module.require (<cwd>/node_modules/commonjs-standalone/dist/index.js:72:19)
      at <cwd>/cli-tests/runtime-unresolved/index.js:2:1
      at Object.run (<cwd>/dist/runtime.js:118:13)
      at Function._load (<cwd>/node_modules/commonjs-standalone/dist/index.js:57:16)
      at Runtime.load (<cwd>/dist/runtime.js:131:53)
      at Object.<anonymous> (<cwd>/dist/cli.js:84:17)
      at Module._compile (node:internal/modules/cjs/loader:1101:14)]
    ",
      "stdout": "",
    }
  `);
});
