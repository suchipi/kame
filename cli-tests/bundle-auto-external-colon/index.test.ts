import { test, expect } from "vitest";
import firstBase from "first-base";
import { cli, path, read, write, remove } from "../test-util";

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

    // All of these should be considered externals except file://
    _kame_require_("external:events");
    _kame_require_("external:node:fs");
    _kame_require_("external:quickjs:std");
    _kame_require_("unresolved:index.js|file:///tmp/something/somewhere");
    _kame_require_("external:https://something.com/somewhere");
    }),
    /* --- external:events --- */
    "external:events": (function (exports, _kame_require_, module, __filename, __dirname, _kame_dynamic_import_) {
    if (typeof require === "function") {
    	module.exports = require("events");
    } else if (typeof events !== "undefined") {
    	module.exports = events;
    } else if (typeof Events !== "undefined") {
    	module.exports = Events;
    } else {
    	if ("test" !== "production") {
    		console.warn("Failed to load external " + "events" + ". An empty module will be used instead, but this might cause problems in your code. Consider using a custom resolver to shim this external.");
    	}
    	module.exports = {};
    }
    }),
    /* --- external:node:fs --- */
    "external:node:fs": (function (exports, _kame_require_, module, __filename, __dirname, _kame_dynamic_import_) {
    if (typeof require === "function") {
    	module.exports = require("node:fs");
    } else if (typeof nodeFs !== "undefined") {
    	module.exports = nodeFs;
    } else if (typeof NodeFs !== "undefined") {
    	module.exports = NodeFs;
    } else {
    	if ("test" !== "production") {
    		console.warn("Failed to load external " + "node:fs" + ". An empty module will be used instead, but this might cause problems in your code. Consider using a custom resolver to shim this external.");
    	}
    	module.exports = {};
    }
    }),
    /* --- external:quickjs:std --- */
    "external:quickjs:std": (function (exports, _kame_require_, module, __filename, __dirname, _kame_dynamic_import_) {
    if (typeof require === "function") {
    	module.exports = require("quickjs:std");
    } else if (typeof quickjsStd !== "undefined") {
    	module.exports = quickjsStd;
    } else if (typeof QuickjsStd !== "undefined") {
    	module.exports = QuickjsStd;
    } else {
    	if ("test" !== "production") {
    		console.warn("Failed to load external " + "quickjs:std" + ". An empty module will be used instead, but this might cause problems in your code. Consider using a custom resolver to shim this external.");
    	}
    	module.exports = {};
    }
    }),
    /* --- unresolved:index.js|file:///tmp/something/somewhere --- */
    "unresolved:index.js|file:///tmp/something/somewhere": (function (exports, _kame_require_, module, __filename, __dirname, _kame_dynamic_import_) {
    throw new Error("Module wasn't found at bundle time: Tried to load \\"file:///tmp/something/somewhere\\" from \\"index.js\\"");
    }),
    /* --- external:https://something.com/somewhere --- */
    "external:https://something.com/somewhere": (function (exports, _kame_require_, module, __filename, __dirname, _kame_dynamic_import_) {
    if (typeof require === "function") {
    	module.exports = require("https://something.com/somewhere");
    } else if (typeof httpsSomethingComSomewhere !== "undefined") {
    	module.exports = httpsSomethingComSomewhere;
    } else if (typeof HttpsSomethingComSomewhere !== "undefined") {
    	module.exports = HttpsSomethingComSomewhere;
    } else {
    	if ("test" !== "production") {
    		console.warn("Failed to load external " + "https://something.com/somewhere" + ". An empty module will be used instead, but this might cause problems in your code. Consider using a custom resolver to shim this external.");
    	}
    	module.exports = {};
    }
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

  remove(__dirname, "dist");
});
