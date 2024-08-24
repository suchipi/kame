import { test, expect } from "vitest";
import path from "path";
import kame from "..";

const rootDir = path.resolve(__dirname, "..");
function replaceRootDir(input: string) {
  // @ts-ignore wants es2021 config but this file is excluded from tsconfig
  return input.replaceAll(rootDir, "<rootDir>");
}

test("input config", () => {
  const calls: Array<any> = [];

  const myConfig: kame.Config = {
    loader: (filename) => {
      calls.push(["loader", replaceRootDir(filename)]);
      return kame.defaultLoader.load(filename);
    },
    resolver: (id, fromFilePath) => {
      calls.push(["resolver", id, replaceRootDir(fromFilePath)]);
      return kame.defaultResolver.resolve(id, fromFilePath);
    },
    runtimeEval: (code, filename) => {
      calls.push(["runtimeEval", code, replaceRootDir(filename)]);
      return kame.defaultRuntimeEval.evaluate(code, filename);
    },
  };

  const myKame = kame.configure(myConfig);

  const runtime = new myKame.Runtime();

  const result = runtime.load(path.join(__dirname, "fixture.ts"));

  expect(calls).toMatchInlineSnapshot(`
    [
      [
        "resolver",
        "/Users/suchipi/Code/kame/api-tests/fixture.ts",
        "<rootDir>/__kame-runtime-load.js",
      ],
      [
        "loader",
        "<rootDir>/api-tests/fixture.ts",
      ],
      [
        "runtimeEval",
        "(function (exports, require, module, __filename, __dirname) { "use strict";
    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    Object.defineProperty(exports, "four", {
        enumerable: true,
        get: function() {
            return four;
        }
    });
    var _interop_require_default = require("@swc/helpers/_/_interop_require_default");
    var _path = /*#__PURE__*/ _interop_require_default._(require("path"));
    _path.default.basename(__filename);
    var four = 4;

    })
    ",
        "<rootDir>/api-tests/fixture.ts",
      ],
      [
        "resolver",
        "@swc/helpers/_/_interop_require_default",
        "<rootDir>/api-tests/fixture.ts",
      ],
      [
        "loader",
        "<rootDir>/node_modules/@swc/helpers/cjs/_interop_require_default.cjs",
      ],
      [
        "runtimeEval",
        "(function (exports, require, module, __filename, __dirname) { "use strict";

    function _interop_require_default(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
    }
    exports._ = _interop_require_default;

    })
    ",
        "<rootDir>/node_modules/@swc/helpers/cjs/_interop_require_default.cjs",
      ],
      [
        "resolver",
        "path",
        "<rootDir>/api-tests/fixture.ts",
      ],
    ]
  `);
  expect(result).toMatchInlineSnapshot(`
    {
      "four": 4,
    }
  `);
});
