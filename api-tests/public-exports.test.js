const kame = require("..");

test("public exports", () => {
  expect(kame).toMatchInlineSnapshot(`
    {
      "Bundler": [Function],
      "Runtime": [Function],
      "configure": [Function],
      "defaultLoader": {
        "load": [Function],
        "loadCss": [Function],
        "loadFile": [Function],
        "loadJsCompiled": [Function],
        "loadJsUncompiled": [Function],
        "loadJson": [Function],
        "stripShebang": [Function],
      },
      "defaultResolver": {
        "resolve": [Function],
      },
      "defaultRuntimeEval": {
        "evaluate": [Function],
      },
    }
  `);
});
