const firstBase = require("first-base");
const { cli, path, read, write, remove } = require("../test-util");

test("works", async () => {
  remove(__dirname, "dist");

  const run = firstBase.spawn(
    cli,
    ["bundle", "--input", "./index.js", "--output", "./dist/index.js"],
    { cwd: __dirname }
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
    var fs = _kame_require_("external:fs");
    console.log("fs:", Object.keys(fs));
    var child_process = _kame_require_("external:child_process");
    console.log("child_process", child_process);
    }),
    /* --- external:fs --- */
    "external:fs": (function (exports, _kame_require_, module, __filename, __dirname, _kame_dynamic_import_) {
    if (typeof require === "function") {
    	module.exports = require("fs");
    } else if (typeof fs !== "undefined") {
    	module.exports = fs;
    } else if (typeof Fs !== "undefined") {
    	module.exports = Fs;
    } else {
    	if ("test" !== "production") {
    		console.warn("Failed to load external " + "fs" + ". An empty module will be used instead, but this might cause problems in your code. Consider using a custom resolver to shim this external.");
    	}
    	module.exports = {};
    }
    }),
    /* --- external:child_process --- */
    "external:child_process": (function (exports, _kame_require_, module, __filename, __dirname, _kame_dynamic_import_) {
    if (typeof require === "function") {
    	module.exports = require("child_process");
    } else if (typeof childProcess !== "undefined") {
    	module.exports = childProcess;
    } else if (typeof ChildProcess !== "undefined") {
    	module.exports = ChildProcess;
    } else {
    	if ("test" !== "production") {
    		console.warn("Failed to load external " + "child_process" + ". An empty module will be used instead, but this might cause problems in your code. Consider using a custom resolver to shim this external.");
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

  const run2 = firstBase.spawn("node", [path(__dirname, "dist", "index.js")]);

  await run2.completion;

  expect(run2.result).toMatchInlineSnapshot(`
    {
      "code": 0,
      "error": false,
      "stderr": "",
      "stdout": "fs: [
      'appendFile',        'appendFileSync',   'access',
      'accessSync',        'chown',            'chownSync',
      'chmod',             'chmodSync',        'close',
      'closeSync',         'copyFile',         'copyFileSync',
      'cp',                'cpSync',           'createReadStream',
      'createWriteStream', 'exists',           'existsSync',
      'fchown',            'fchownSync',       'fchmod',
      'fchmodSync',        'fdatasync',        'fdatasyncSync',
      'fstat',             'fstatSync',        'fsync',
      'fsyncSync',         'ftruncate',        'ftruncateSync',
      'futimes',           'futimesSync',      'lchown',
      'lchownSync',        'lchmod',           'lchmodSync',
      'link',              'linkSync',         'lstat',
      'lstatSync',         'lutimes',          'lutimesSync',
      'mkdir',             'mkdirSync',        'mkdtemp',
      'mkdtempSync',       'open',             'openSync',
      'opendir',           'opendirSync',      'readdir',
      'readdirSync',       'read',             'readSync',
      'readv',             'readvSync',        'readFile',
      'readFileSync',      'readlink',         'readlinkSync',
      'realpath',          'realpathSync',     'rename',
      'renameSync',        'rm',               'rmSync',
      'rmdir',             'rmdirSync',        'stat',
      'statSync',          'symlink',          'symlinkSync',
      'truncate',          'truncateSync',     'unwatchFile',
      'unlink',            'unlinkSync',       'utimes',
      'utimesSync',        'watch',            'watchFile',
      'writeFile',         'writeFileSync',    'write',
      'writeSync',         'writev',           'writevSync',
      'Dir',               'Dirent',           'Stats',
      'ReadStream',        'WriteStream',      'FileReadStream',
      'FileWriteStream',   '_toUnixTimestamp', 'F_OK',
      'R_OK',              'W_OK',             'X_OK',
      'constants',
      ... 1 more item
    ]
    child_process {
      _forkChild: [Function: _forkChild],
      ChildProcess: [Function: ChildProcess],
      exec: [Function: exec],
      execFile: [Function: execFile],
      execFileSync: [Function: execFileSync],
      execSync: [Function: execSync],
      fork: [Function: fork],
      spawn: [Function: spawn],
      spawnSync: [Function: spawnSync]
    }
    ",
    }
  `);

  remove(__dirname, "dist");
});
