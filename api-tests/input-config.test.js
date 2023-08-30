const path = require("path");
const kame = require("..");

const rootDir = path.resolve(__dirname, "..");
function replaceRootDir(input) {
  return input.replaceAll(rootDir, "<rootDir>");
}

test("input config", () => {
  const calls = [];

  const myConfig = {
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

    var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.four = void 0;
    var _path = _interopRequireDefault(require("path"));
    _path["default"].basename(__filename);
    var four = 4;
    exports.four = four;
    })
    ",
        "<rootDir>/api-tests/fixture.ts",
      ],
      [
        "resolver",
        "@babel/runtime/helpers/interopRequireDefault",
        "<rootDir>/api-tests/fixture.ts",
      ],
      [
        "loader",
        "<rootDir>/node_modules/@babel/runtime/helpers/interopRequireDefault.js",
      ],
      [
        "runtimeEval",
        "(function (exports, require, module, __filename, __dirname) { function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : {
        "default": obj
      };
    }
    module.exports = _interopRequireDefault, module.exports.__esModule = true, module.exports["default"] = module.exports;
    })
    ",
        "<rootDir>/node_modules/@babel/runtime/helpers/interopRequireDefault.js",
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
