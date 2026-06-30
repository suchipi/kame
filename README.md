# kame

Kame (pronounced `kah-may`) is an extensible Node.js-based app runtime and bundler for JavaScript. It seeks to improve the user experience of using new JavaScript syntax features, "compiles-to-JavaScript" languages (like TypeScript, Flow, Coffeescript), and filetype loaders (like importing CSS/PNG/TTF files).

Its default config out of the box should be capable for most needs, but is also easy to override. The config API is very small:

```ts
type Config = {
  /*
   * A function that, given a string passed to import/require and the absolute
   * path to the file that import/require appeared in, should return the
   * absolute path to the file that that import/require should be referring to
   */
  resolve: (id: string, fromFilePath: string) => string;

  /*
   * A function that, given the absolute path to a file on disk, reads that
   * file, transforms it into JS (if necessary), and returns a string
   * containing JS source code (and, optionally, a source map).
   */
  load: (filename: string) => string | { code: string; map: any };

  /*
   * A function that, given a JS source code expression and the filename it
   * came from, executes the code and returns the result. This is only used by
   * the runtime, not the bundler.
   */
  evaluate: (code: string, filename: string) => any;
};
```

## Starter Config

The default config is usually good enough, but if you need to stub out certain modules or find-and-replace content in certain modules, you'll want to define your own config. Generally, it makes sense to use the default config as a starting point. Kame relies on function composition to combine configs, so you'll want to require the default behavior and call it:

`kame-config.js`

```js
const { defaultResolver, defaultLoader, defaultRuntimeEval } = require("kame");

module.exports = {
  resolve(id, fromFilePath) {
    // Add your own override logic here via early returns

    return defaultResolver.resolve(id, fromFilePath);
  },
  load(filename) {
    // Add your own override logic here via early returns

    return defaultLoader.load(filename);
  },
  evaluate(code, filename) {
    // Override, or rely on the default behavior:
    return defaultRuntimeEval.evaluate(code, filename);
  },
};
```

## Runtime usage example (CLI)

Using the default config:

`kame run src/my-entrypoint.ts`

Specify `--config` to override the config using a config file:

## Runtime usage

```js
const kame = require("kame");

const Runtime = kame.Runtime;
// or, to override the config:
// const Runtime = kame.configure({ /* ... */ }).Runtime;

const runtime = new Runtime();

// run your app entrypoint
runtime.load("my-entrypoint.js");
// or, to inject into Node.js's require mechanism ala @babel/register:
runtime.register();
```

## Bundler usage example

Optionally make a config:

`kame-config.js`

```js
const { defaultResolver, defaultLoader } = require("kame");

module.exports = {
  resolve(id, fromFilePath) {
    // Add your own logic here

    return defaultResolver.resolve(id, fromFilePath);
  },
  load(filename) {
    // Add your own logic here

    return defaultLoader.load(filename);
  },
};
```

Then run:

```
npx kame bundle
```
