const path = require("path");
const kame = require("..");

const rootDir = path.resolve(__dirname, "..");

test("input config", () => {
  const calls = [];

  const myConfig = {
    loader: (filename) => {
      calls.push(["loader", filename.replace(rootDir, "<rootDir>")]);
      return kame.defaultLoader.load(filename);
    },
    resolver: (id, fromFilePath) => {
      calls.push(["resolver", id, fromFilePath.replace(rootDir, "<rootDir>")]);
      return kame.defaultResolver.resolve(id, fromFilePath);
    },
    runtimeEval: (code, filename) => {
      calls.push(["runtimeEval", code, filename.replace(rootDir, "<rootDir>")]);
      return kame.defaultRuntimeEval.evaluate(code, filename);
    },
  };

  const myKame = kame.configure(myConfig);

  const runtime = new myKame.Runtime();

  const result = runtime.load(path.join(__dirname, "fixture.ts"));

  expect(calls).toMatchInlineSnapshot(`
    [
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
