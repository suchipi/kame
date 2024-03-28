import { test, expect } from "vitest";
import firstBase from "first-base";
import { cli, path, read, write, remove, cleanResult } from "../test-util";

test("works", async () => {
  remove(__dirname, "dist");

  const run = firstBase.spawn(
    cli,
    ["bundle", "--input", "./index.js", "--output", "./dist/index.js"],
    {
      cwd: __dirname,
      env: Object.assign({}, process.env, {
        KAME_ALLOW_UNRESOLVED: "true",
      }),
    }
  );

  await run.completion;

  expect(run.result).toMatchInlineSnapshot(`
    {
      "code": 0,
      "error": false,
      "stderr": "Files created:
    ",
      "stdout": "dist/index.js
    ",
    }
  `);

  const output = read(__dirname, "dist");

  expect(output).toMatchInlineSnapshot(`
    {
      "index.js": "(function(global) {

    function factory() {
    var modules = {
    /* --- index.js --- */
    "index.js": (function (exports, _kame_require_, module, __filename, __dirname, _kame_dynamic_import_) {
    "use strict";

    _kame_require_("unresolved:index.js|./not-there");
    }),
    /* --- unresolved:index.js|./not-there --- */
    "unresolved:index.js|./not-there": (function (exports, _kame_require_, module, __filename, __dirname, _kame_dynamic_import_) {
    throw new Error("Module wasn't found at bundle time: Tried to load \\"./not-there\\" from \\"index.js\\"");
    })
    /* --- end of modules --- */};

    var __kame__ = {
    	basedir: typeof __dirname === 'string' ? __dirname : "",
    	cache: {},
    	runModule: function runModule(name, isMain) {
    		var exports = {};
    		var module = {
    			id: name,
    			exports: exports,
    		};

    		__kame__.cache[name] = module;

    		var _kame_require_ = function require(id) {
    			if (__kame__.cache[id]) {
    				return __kame__.cache[id].exports;
    			} else {
    				__kame__.runModule(id, false);
    				return __kame__.cache[id].exports;
    			}
    		};
    		_kame_require_.cache = __kame__.cache;

    		if (isMain) {
    			_kame_require_.main = module;
    		}

    		var __filename = __kame__.basedir + "/" + name;
    		var __dirname = __kame__.basedir + "/" + name.split("/").slice(0, -1).join("/");

    		

    		__kame__.modules[name](exports, _kame_require_, module, __filename, __dirname );
    		return module.exports;
    	},
    	
    	modules: modules,
    };



    return __kame__.runModule("index.js", true);
    }

    if (typeof exports === 'object' && typeof module !== 'undefined') {
    	module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
    	define([], factory);
    } else {
    	factory()
    }

    })(
    	typeof global !== "undefined" ? global :
    	typeof window !== "undefined" ? window :
    	typeof self !== "undefined" ? self :
    	typeof this === "object" ? this :
    	new Function("return this")()
    );
    ",
    }
  `);

  const run2 = firstBase.spawn("node", [path(__dirname, "dist", "index.js")]);

  await run2.completion;

  expect(cleanResult(run2.result)).toMatchInlineSnapshot(`
    {
      "code": 1,
      "error": false,
      "stderr": "<rootDir>/cli-tests/bundle-unresolved/dist/index.js:13
    throw new Error("Module wasn't found at bundle time: Tried to load \\"./not-there\\" from \\"index.js\\"");
    ^

    Error: Module wasn't found at bundle time: Tried to load "./not-there" from "index.js"
        at unresolved:index.js|./not-there (<rootDir>/cli-tests/bundle-unresolved/dist/index.js:13:7)
        at Object.runModule (<rootDir>/cli-tests/bundle-unresolved/dist/index.js:48:25)
        at require (<rootDir>/cli-tests/bundle-unresolved/dist/index.js:33:14)
        at index.js (<rootDir>/cli-tests/bundle-unresolved/dist/index.js:9:1)
        at Object.runModule (<rootDir>/cli-tests/bundle-unresolved/dist/index.js:48:25)
        at factory (<rootDir>/cli-tests/bundle-unresolved/dist/index.js:57:17)
        at <rootDir>/cli-tests/bundle-unresolved/dist/index.js:61:19
        at Object.<anonymous> (<rootDir>/cli-tests/bundle-unresolved/dist/index.js:68:3)
        at Module._compile (node:internal)
        at Module._extensions..js (node:internal)

    Node.js v20.11.1
    ",
      "stdout": "",
    }
  `);

  remove(__dirname, "dist");
});
