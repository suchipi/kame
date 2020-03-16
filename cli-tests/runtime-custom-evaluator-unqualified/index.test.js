const firstBase = require("first-base");
const { cli, path, read, write, remove } = require("../test-util");

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
    Object {
      "code": 0,
      "error": false,
      "stderr": "Running ./index.js
    ",
      "stdout": "Code from index.js:
    (function (exports, require, module, __filename, __dirname) { console.log(\\"hi\\");
    })


    ",
    }
  `);
});
