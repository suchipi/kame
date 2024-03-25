import { test, expect } from "vitest";
import firstBase from "first-base";
import { cli, path, read, write, remove } from "../test-util";
import { diff } from "jest-diff";

test("works", async () => {
  remove(__dirname, "dist");

  const run1 = firstBase.spawn(
    cli,
    [
      "bundle",
      "--input",
      "./src/index.js",
      "--output",
      "./dist/index.js",
      "--code-splitting-id",
      "first",
    ],
    { cwd: __dirname }
  );

  await run1.completion;
  const output1 = read(__dirname, "dist");
  remove(__dirname, "dist");

  const run2 = firstBase.spawn(
    cli,
    [
      "bundle",
      "--input",
      "./src/index.js",
      "--output",
      "./dist/index.js",
      "--code-splitting-id",
      "second",
    ],
    { cwd: __dirname }
  );

  await run2.completion;
  const output2 = read(__dirname, "dist");
  remove(__dirname, "dist");

  const identity = (a) => a;

  const diffOptions = {
    aColor: identity,
    bColor: identity,
    changeColor: identity,
    commonColor: identity,
    patchColor: identity,
    aIndicator: "<",
    bIndicator: ">",
    aAnnotation: "First run",
    bAnnotation: "Second run",
  };

  expect(diff(run1.result, run2.result, diffOptions)).toMatchInlineSnapshot(`
    "< First run
    > Second run

      Object {
        "code": 0,
        "error": false,
        "stderr": "Files created:
      ",
    <   "stdout": "dist/db77225ac4584726c04425503fd4a31f.js
    >   "stdout": "dist/c9def26683603b140b8462741097d0fb.js
      dist/index.js
      ",
      }"
  `);

  expect(diff(output1, output2, diffOptions)).toMatchInlineSnapshot(`
    "< First run
    > Second run

      Object {
    <   "db77225ac4584726c04425503fd4a31f.js": "(function(global) {
    >   "c9def26683603b140b8462741097d0fb.js": "(function(global) {

      var modules = {
      /* --- src/other.js --- */
      \\"src/other.js\\": (function (exports, _kame_require_, module, __filename, __dirname, _kame_dynamic_import_) {
      \\"use strict\\";

      console.log(\\"hi from other\\");
      })
      /* --- end of modules --- */};
    < var __kame__ = global.__kame_instances__[\\"first\\"];
    > var __kame__ = global.__kame_instances__[\\"second\\"];

      for (var key in modules) {
      	if ({}.hasOwnProperty.call(modules, key)) {
      		__kame__.modules[key] = modules[key];
      	}
      }

      __kame__.resolveChunk(\\"src/other.js\\");

      })(
      	typeof global !== \\"undefined\\" ? global :
      	typeof window !== \\"undefined\\" ? window :
      	typeof self !== \\"undefined\\" ? self :
      	typeof this === \\"object\\" ? this :
      	new Function(\\"return this\\")()
      );
      ",
        "index.js": "(function(global) {

      function factory() {
      var modules = {
      /* --- src/index.js --- */
      \\"src/index.js\\": (function (exports, _kame_require_, module, __filename, __dirname, _kame_dynamic_import_) {
      \\"use strict\\";

      console.log(\\"hi\\");
      _kame_dynamic_import_(\\"src/other.js\\");
      })
      /* --- end of modules --- */};

      var __kame__ = {
      	basedir: typeof __dirname === 'string' ? __dirname : \\"\\",
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

      		var __filename = __kame__.basedir + \\"/\\" + name;
      		var __dirname = __kame__.basedir + \\"/\\" + name.split(\\"/\\").slice(0, -1).join(\\"/\\");

      		var _kame_dynamic_import_ = function dynamicImport(id) {
      			return __kame__.loadChunk(id).then(function() { return _kame_require_(id) });
      		}

      		__kame__.modules[name](exports, _kame_require_, module, __filename, __dirname , _kame_dynamic_import_);
      		return module.exports;
      	},
      	
      	chunkUrls: {
    <   \\"src/other.js\\": \\"db77225ac4584726c04425503fd4a31f.js\\"
    >   \\"src/other.js\\": \\"c9def26683603b140b8462741097d0fb.js\\"
      },
      	loadChunk: function loadChunk(id) {
      		var resolve, reject;
      		var p = new Promise(function (_resolve, _reject) {
      			resolve = _resolve;
      			reject = _reject;
      		});
      		__kame__.pendingChunks[id] = {
      			resolve: resolve,
      		};

      		var url = __kame__.basedir
      			? __kame__.basedir + \\"/\\" + __kame__.chunkUrls[id]
      			: __kame__.chunkUrls[id];

      		if (typeof require !== \\"undefined\\") {
      			try {
      				Promise.resolve().then(function () {
      					return require(url);
      				});
      			} catch (err) {
      				reject(err);
      			}
      		} else {
      			try {
      				fetch(url).then(function (response) {
      					return response.text();
      				}).then(function (code) {
      					eval(code);
      				}).catch(reject);
      			} catch (err) {
      				reject(err);
      			}
      		}
      		return p;
      	},
      	pendingChunks: {},
      	resolveChunk: function resolveChunk(id) {
      		if (__kame__.pendingChunks[id]) {
      			__kame__.pendingChunks[id].resolve();
      		}
      	},

      	
      	modules: modules,
      };

    < global.__kame_instances__ = global.__kame_instances__ || {}; global.__kame_instances__[\\"first\\"] = __kame__;
    > global.__kame_instances__ = global.__kame_instances__ || {}; global.__kame_instances__[\\"second\\"] = __kame__;

      return __kame__.runModule(\\"src/index.js\\", true);
      }

      if (typeof exports === 'object' && typeof module !== 'undefined') {
      	module.exports = factory();
      } else if (typeof define === 'function' && define.amd) {
      	define([], factory);
      } else {
      	factory()
      }

      })(
      	typeof global !== \\"undefined\\" ? global :
      	typeof window !== \\"undefined\\" ? window :
      	typeof self !== \\"undefined\\" ? self :
      	typeof this === \\"object\\" ? this :
      	new Function(\\"return this\\")()
      );
      ",
      }"
  `);
});
