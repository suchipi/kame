const firstBase = require("first-base");
const { cli, path, read, write, remove } = require("../test-util");

test("works", async () => {
  const run = firstBase.spawn(
    cli,
    ["run", "--input", "./src/index.js", "--resolver", "resolver.js"],
    {
      cwd: __dirname,
    }
  );

  await run.completion;

  expect(run.result).toMatchInlineSnapshot(`
    {
      "code": 0,
      "error": false,
      "stderr": "",
      "stdout": "hi
    hi from something
    ",
    }
  `);
});
