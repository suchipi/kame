(function(global) {

function factory() {
var modules = {
/* --- something.ts --- */
"something.ts": (function (exports, _kame_require_, module, __filename, __dirname, _kame_dynamic_import_) {
console.log("hi theres!");
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



return __kame__.runModule("something.ts", true);
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
