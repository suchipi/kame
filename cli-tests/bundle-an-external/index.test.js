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
    var fs = _kame_require_(\\"external:fs\\");

    console.log(\\"fs:\\", fs);

    var child_process = _kame_require_(\\"external:child_process\\");

    console.log(\\"child_process\\", child_process);
    }),
    /* --- external:fs --- */
    \\"external:fs\\": (function (exports, _kame_require_, module, __filename, __dirname, _kame_dynamic_import_) {
    if (typeof require === \\"function\\") {
    	module.exports = require(\\"fs\\");
    } else if (typeof fs !== \\"undefined\\") {
    	module.exports = fs;
    } else if (typeof Fs !== \\"undefined\\") {
    	module.exports = Fs;
    } else {
    	if (\\"test\\" !== \\"production\\") {
    		console.warn(\\"Failed to load external \\" + \\"fs\\" + \\". An empty module will be used instead, but this might cause problems in your code. Consider using a custom resolver to shim this external.\\");
    	}
    	module.exports = {};
    }
    }),
    /* --- external:child_process --- */
    \\"external:child_process\\": (function (exports, _kame_require_, module, __filename, __dirname, _kame_dynamic_import_) {
    if (typeof require === \\"function\\") {
    	module.exports = require(\\"child_process\\");
    } else if (typeof childProcess !== \\"undefined\\") {
    	module.exports = childProcess;
    } else if (typeof ChildProcess !== \\"undefined\\") {
    	module.exports = ChildProcess;
    } else {
    	if (\\"test\\" !== \\"production\\") {
    		console.warn(\\"Failed to load external \\" + \\"child_process\\" + \\". An empty module will be used instead, but this might cause problems in your code. Consider using a custom resolver to shim this external.\\");
    	}
    	module.exports = {};
    }
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

  expect(run2.result).toMatchInlineSnapshot(`
    Object {
      "code": 0,
      "error": false,
      "stderr": "",
      "stdout": "fs: {
      appendFile: [Function: appendFile],
      appendFileSync: [Function: appendFileSync],
      access: [Function: access],
      accessSync: [Function: accessSync],
      chown: [Function: chown],
      chownSync: [Function: chownSync],
      chmod: [Function: chmod],
      chmodSync: [Function: chmodSync],
      close: [Function: close],
      closeSync: [Function: closeSync],
      copyFile: [Function: copyFile],
      copyFileSync: [Function: copyFileSync],
      cp: [Function: cp],
      cpSync: [Function: cpSync],
      createReadStream: [Function: createReadStream],
      createWriteStream: [Function: createWriteStream],
      exists: [Function: exists],
      existsSync: [Function: existsSync],
      fchown: [Function: fchown],
      fchownSync: [Function: fchownSync],
      fchmod: [Function: fchmod],
      fchmodSync: [Function: fchmodSync],
      fdatasync: [Function: fdatasync],
      fdatasyncSync: [Function: fdatasyncSync],
      fstat: [Function: fstat],
      fstatSync: [Function: fstatSync],
      fsync: [Function: fsync],
      fsyncSync: [Function: fsyncSync],
      ftruncate: [Function: ftruncate],
      ftruncateSync: [Function: ftruncateSync],
      futimes: [Function: futimes],
      futimesSync: [Function: futimesSync],
      lchown: [Function: lchown],
      lchownSync: [Function: lchownSync],
      lchmod: undefined,
      lchmodSync: undefined,
      link: [Function: link],
      linkSync: [Function: linkSync],
      lstat: [Function: lstat],
      lstatSync: [Function: lstatSync],
      lutimes: [Function: lutimes],
      lutimesSync: [Function: lutimesSync],
      mkdir: [Function: mkdir],
      mkdirSync: [Function: mkdirSync],
      mkdtemp: [Function: mkdtemp],
      mkdtempSync: [Function: mkdtempSync],
      open: [Function: open],
      openSync: [Function: openSync],
      opendir: [Function: opendir],
      opendirSync: [Function: opendirSync],
      readdir: [Function: readdir],
      readdirSync: [Function: readdirSync],
      read: [Function: read],
      readSync: [Function: readSync],
      readv: [Function: readv],
      readvSync: [Function: readvSync],
      readFile: [Function: readFile],
      readFileSync: [Function: readFileSync],
      readlink: [Function: readlink],
      readlinkSync: [Function: readlinkSync],
      realpath: [Function: realpath] { native: [Function (anonymous)] },
      realpathSync: [Function: realpathSync] { native: [Function (anonymous)] },
      rename: [Function: rename],
      renameSync: [Function: renameSync],
      rm: [Function: rm],
      rmSync: [Function: rmSync],
      rmdir: [Function: rmdir],
      rmdirSync: [Function: rmdirSync],
      stat: [Function: stat],
      statSync: [Function: statSync],
      symlink: [Function: symlink],
      symlinkSync: [Function: symlinkSync],
      truncate: [Function: truncate],
      truncateSync: [Function: truncateSync],
      unwatchFile: [Function: unwatchFile],
      unlink: [Function: unlink],
      unlinkSync: [Function: unlinkSync],
      utimes: [Function: utimes],
      utimesSync: [Function: utimesSync],
      watch: [Function: watch],
      watchFile: [Function: watchFile],
      writeFile: [Function: writeFile],
      writeFileSync: [Function: writeFileSync],
      write: [Function: write],
      writeSync: [Function: writeSync],
      writev: [Function: writev],
      writevSync: [Function: writevSync],
      Dir: [class Dir],
      Dirent: [class Dirent],
      Stats: [Function: Stats],
      ReadStream: [Getter/Setter],
      WriteStream: [Getter/Setter],
      FileReadStream: [Getter/Setter],
      FileWriteStream: [Getter/Setter],
      _toUnixTimestamp: [Function: toUnixTimestamp],
      F_OK: 0,
      R_OK: 4,
      W_OK: 2,
      X_OK: 1,
      constants: [Object: null prototype] {
        UV_FS_SYMLINK_DIR: 1,
        UV_FS_SYMLINK_JUNCTION: 2,
        O_RDONLY: 0,
        O_WRONLY: 1,
        O_RDWR: 2,
        UV_DIRENT_UNKNOWN: 0,
        UV_DIRENT_FILE: 1,
        UV_DIRENT_DIR: 2,
        UV_DIRENT_LINK: 3,
        UV_DIRENT_FIFO: 4,
        UV_DIRENT_SOCKET: 5,
        UV_DIRENT_CHAR: 6,
        UV_DIRENT_BLOCK: 7,
        S_IFMT: 61440,
        S_IFREG: 32768,
        S_IFDIR: 16384,
        S_IFCHR: 8192,
        S_IFBLK: 24576,
        S_IFIFO: 4096,
        S_IFLNK: 40960,
        S_IFSOCK: 49152,
        O_CREAT: 64,
        O_EXCL: 128,
        UV_FS_O_FILEMAP: 0,
        O_NOCTTY: 256,
        O_TRUNC: 512,
        O_APPEND: 1024,
        O_DIRECTORY: 65536,
        O_NOATIME: 262144,
        O_NOFOLLOW: 131072,
        O_SYNC: 1052672,
        O_DSYNC: 4096,
        O_DIRECT: 16384,
        O_NONBLOCK: 2048,
        S_IRWXU: 448,
        S_IRUSR: 256,
        S_IWUSR: 128,
        S_IXUSR: 64,
        S_IRWXG: 56,
        S_IRGRP: 32,
        S_IWGRP: 16,
        S_IXGRP: 8,
        S_IRWXO: 7,
        S_IROTH: 4,
        S_IWOTH: 2,
        S_IXOTH: 1,
        F_OK: 0,
        R_OK: 4,
        W_OK: 2,
        X_OK: 1,
        UV_FS_COPYFILE_EXCL: 1,
        COPYFILE_EXCL: 1,
        UV_FS_COPYFILE_FICLONE: 2,
        COPYFILE_FICLONE: 2,
        UV_FS_COPYFILE_FICLONE_FORCE: 4,
        COPYFILE_FICLONE_FORCE: 4
      },
      promises: [Getter]
    }
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
