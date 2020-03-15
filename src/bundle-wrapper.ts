function withGlobal(bodyCode: string) {
  return `(function(global) {
${bodyCode}
})(
	typeof global !== "undefined" ? global :
	typeof window !== "undefined" ? window :
	typeof self !== "undefined" ? self :
	typeof this === "object" ? this :
	new Function("return this")()
);
`;
}

function umdWrapper(globalName: string | void, bodyCode: string) {
  return withGlobal(`
function factory() {
${bodyCode}
}

if (typeof exports === 'object' && typeof module !== 'undefined') {
	module.exports = factory();
} else if (typeof define === 'function' && define.amd) {
	define([], factory);
} else {
	${
    globalName == null
      ? "factory()"
      : `global[${JSON.stringify(globalName)}] = factory();`
  }
}
`);
}

function stringifyModules(modules: { [id: string]: string }) {
  return `{\n${Object.keys(modules)
    .map((key, index, all) => {
      return `/* --- ${key} --- */\n${JSON.stringify(
        key
      )}: (function (exports, _kame_require_, module, __filename, __dirname, _kame_dynamic_import_) {\n${
        modules[key]
      }\n})${index === all.length - 1 ? "" : ","}`;
    })
    .join("\n")}\n/* --- end of modules --- */}`;
}

export function entryWrapper({
  entryId,
  globalName,
  codeSplittingId,
  modules,
  chunkUrls,
}: {
  entryId: string;
  globalName?: string;
  codeSplittingId: string;
  modules: { [id: string]: string };
  chunkUrls: { [id: string]: string };
}) {
  const hasChunks = Object.keys(chunkUrls).length > 0;

  return umdWrapper(
    globalName,
    `var modules = ${stringifyModules(modules)};

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

		${
      hasChunks
        ? `var _kame_dynamic_import_ = function dynamicImport(id) {
			return __kame__.loadChunk(id).then(function() { return _kame_require_(id) });
		}`
        : ""
    }

		__kame__.modules[name](exports, _kame_require_, module, __filename, __dirname ${
      hasChunks ? ", _kame_dynamic_import_" : ""
    });
		return module.exports;
	},
	${
    hasChunks
      ? `
	chunkUrls: ${JSON.stringify(chunkUrls, null, 2)},
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
			? __kame__.basedir + "/" + __kame__.chunkUrls[id]
			: __kame__.chunkUrls[id];

		if (typeof require !== "undefined") {
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

	`
      : ""
  }
	modules: modules,
};

${
  hasChunks
    ? `global.__kame_instances__ = global.__kame_instances__ || {}; global.__kame_instances__[${JSON.stringify(
        codeSplittingId
      )}] = __kame__;`
    : ""
}

return __kame__.runModule(${JSON.stringify(entryId)}, true);`
  );
}

export function chunkWrapper({
  entryId,
  modules,
  codeSplittingId,
}: {
  entryId: string;
  modules: { [id: string]: string };
  codeSplittingId: string;
}) {
  return withGlobal(`
var modules = ${stringifyModules(modules)};
var __kame__ = global.__kame_instances__[${JSON.stringify(codeSplittingId)}];

for (var key in modules) {
	if ({}.hasOwnProperty.call(modules, key)) {
		__kame__.modules[key] = modules[key];
	}
}

__kame__.resolveChunk(${JSON.stringify(entryId)});
`);
}
