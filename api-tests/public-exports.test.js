const kame = require("..");

test("public exports", () => {
  expect(kame).toMatchInlineSnapshot(`
    Object {
      "Bundler": [Function],
      "Runtime": [Function],
      "configure": [Function],
      "defaultLoader": Object {
        "load": [Function],
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
