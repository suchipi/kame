import { test, expect } from "vitest";

test("public exports", () => {
  const kame = require("..");

  expect(kame).toMatchInlineSnapshot(`
    {
      "Bundler": [Function],
      "Runtime": [Function],
      "configure": [Function],
      "defaultConfig": {
        "evaluate": [Function],
        "load": [Function],
        "resolve": [Function],
      },
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
