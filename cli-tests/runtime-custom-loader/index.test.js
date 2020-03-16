const firstBase = require("first-base");
const { cli, path, read, write, remove } = require("../test-util");

test("works", async () => {
  const run = firstBase.spawn(
    cli,
    [
      "run",
      "--input",
      "./index.js",
      "--loader",
      path(__dirname, "./loader.js"),
    ],
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
      "stdout": "yo
    ",
    }
  `);
});
