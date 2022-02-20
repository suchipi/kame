const firstBase = require("first-base");
const { cli, path, read, write, remove } = require("../test-util");

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
    Object {
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
    Object {
      "index.js": "(function(global) {

    function factory() {
    var modules = {
    /* --- index.js --- */
    \\"index.js\\": (function (exports, _kame_require_, module, __filename, __dirname, _kame_dynamic_import_) {
    /* eslint-disable */
    _kame_require_(\\"unresolved:index.js|./not-there\\");
    }),
    /* --- unresolved:index.js|./not-there --- */
    \\"unresolved:index.js|./not-there\\": (function (exports, _kame_require_, module, __filename, __dirname, _kame_dynamic_import_) {
    throw new Error(\\"Module wasn't found at bundle time: Tried to load \\\\\\"./not-there\\\\\\" from \\\\\\"index.js\\\\\\"\\");
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

    		

    		__kame__.modules[name](exports, _kame_require_, module, __filename, __dirname );
    		return module.exports;
    	},
    	
    	modules: modules,
    };



    return __kame__.runModule(\\"index.js\\", true);
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
    }
  `);

  const run2 = firstBase.spawn("node", [path(__dirname, "dist", "index.js")]);

  await run2.completion;

  run2.result.stderr = run2.result.stderr.replace(
    new RegExp(process.cwd(), "g"),
    "<cwd>"
  );

  expect(run2.result).toMatchInlineSnapshot(`
    Object {
      "code": 1,
      "error": false,
      "stderr": "<cwd>/cli-tests/bundle-unresolved/dist/index.js:12
    throw new Error(\\"Module wasn't found at bundle time: Tried to load \\\\\\"./not-there\\\\\\" from \\\\\\"index.js\\\\\\"\\");
    ^

    Error: Module wasn't found at bundle time: Tried to load \\"./not-there\\" from \\"index.js\\"
        at Object.unresolved:index.js|./not-there (<cwd>/cli-tests/bundle-unresolved/dist/index.js:12:7)
        at Object.runModule (<cwd>/cli-tests/bundle-unresolved/dist/index.js:47:25)
        at require (<cwd>/cli-tests/bundle-unresolved/dist/index.js:32:14)
        at Object.index.js (<cwd>/cli-tests/bundle-unresolved/dist/index.js:8:1)
        at Object.runModule (<cwd>/cli-tests/bundle-unresolved/dist/index.js:47:25)
        at factory (<cwd>/cli-tests/bundle-unresolved/dist/index.js:56:17)
        at <cwd>/cli-tests/bundle-unresolved/dist/index.js:60:19
        at Object.<anonymous> (<cwd>/cli-tests/bundle-unresolved/dist/index.js:67:3)
        at Module._compile (node:internal/modules/cjs/loader:1103:14)
        at Object.Module._extensions..js (node:internal/modules/cjs/loader:1155:10)
    ",
      "stdout": "",
    }
  `);

  remove(__dirname, "dist");
});
