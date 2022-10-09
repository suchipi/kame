const firstBase = require("first-base");
const { cli, path, read, write, remove } = require("../test-util");

test("works", async () => {
  jest.setTimeout(20 * 1000);

  remove(__dirname, "dist");

  const run = firstBase.spawn(
    cli,
    ["bundle", "--input", "./index.js", "--output", "./dist/index.js"],
    { cwd: __dirname }
  );

  await run.completion;

  expect(run.result.code).toBe(0);

  const run2 = firstBase.spawn("node", [path(__dirname, "dist", "index.js")]);

  await run2.completion;

  expect(run2.result).toMatchInlineSnapshot(`
    {
      "code": 0,
      "error": false,
      "stderr": "",
      "stdout": "{
      configure: [Function: configure],
      defaultLoader: {
        stripShebang: [Function: stripShebang],
        loadJson: [Function: loadJson],
        loadCss: [Function: loadCss],
        loadJsUncompiled: [Function: loadJsUncompiled],
        loadJsCompiled: [Function: loadJsCompiled],
        loadFile: [Function: loadFile],
        load: [Function: defaultLoader]
      },
      defaultResolver: { resolve: [Function: defaultResolver] },
      defaultRuntimeEval: { evaluate: [Function: defaultRuntimeEval] },
      Runtime: [Getter],
      Bundler: [Getter]
    }
    ",
    }
  `);

  remove(__dirname, "dist");
});
