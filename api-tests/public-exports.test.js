const kame = require("..");

test("public exports", () => {
  expect(kame).toMatchInlineSnapshot(`
    Object {
      "Bundler": [Function],
      "Runtime": [Function],
      "configure": [Function],
      "defaultLoader": [Function],
      "defaultResolver": [Function],
      "defaultRuntimeEval": [Function],
    }
  `);
});
