const firstBase = require("first-base");
const { cli, path, read, write, remove } = require("../test-util");
const { diff } = require("jest-diff");

test("works", async () => {
  remove(__dirname, "dist");

  const run1 = firstBase.spawn(
    cli,
    ["bundle", "--input", "./src/index.js", "--output", "./dist/index.js"],
    { cwd: __dirname }
  );

  await run1.completion;
  const output1 = read(__dirname, "dist");
  remove(__dirname, "dist");

  const run2 = firstBase.spawn(
    cli,
    ["bundle", "--input", "./src/index.js", "--output", "./dist/index.js"],
    { cwd: __dirname }
  );

  await run2.completion;
  const output2 = read(__dirname, "dist");
  remove(__dirname, "dist");

  expect(diff(run1.result, run2.result)).not.toBe(
    "\u001b[2mCompared values have no visual difference.\u001b[22m"
  );

  expect(diff(output1, output2)).not.toBe(
    "\u001b[2mCompared values have no visual difference.\u001b[22m"
  );
});
