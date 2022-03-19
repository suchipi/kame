const kame = require("..");

test("public exports", () => {
  expect(kame).toMatchInlineSnapshot(`
    Object {
      "Bundler": [Function],
      "Runtime": [Function],
      "configure": [Function],
      "defaultLoader": Object {
        "load": [Function],
        "loadCss": [Function],
        "loadFile": [Function],
        "loadJsCompiled": [Function],
        "loadJsUncompiled": [Function],
        "loadJson": [Function],
        "stripShebang": [Function],
      },
      "defaultResolver": Object {
        "resolve": [Function],
      },
      "defaultRuntimeEval": Object {
        "evaluate": [Function],
      },
    }
  `);
});
