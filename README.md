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
  load: (filename: string) => string | { code: string; map: import("kame").SourceMap };

  /*
   * A function that, given a JS source code expression and the filename it
   * came from, executes the code and returns the result. This is only used by
   * the runtime, not the bundler.
   */
  evaluate: (code: string, filename: string) => any;
};
```

For more information behind the inspiration and design, see [./RATIONALE.md](./RATIONALE.md).

## Starter Config

The default config is usually good enough, but if you need to stub out certain modules or find-and-replace content in certain modules, you'll want to define your own config. Generally, it makes sense to use the default config behavior as a fallback. Kame relies on function composition to combine configs, so you'll want to require the default behavior and call it:

`kame.config.ts`

```js
import { defineConfig, defaultConfig } from "kame";

export default defineConfig({
  resolve(id, fromFilePath) {
    // Add your own override logic here via early returns

    return defaultConfig.resolve(id, fromFilePath);
  },
  load(filename) {
    // Add your own override logic here via early returns

    return defaultConfig.load(filename);
  },
  evaluate(code, filename) {
    // Override, or rely on the default behavior:
    return defaultConfig.evaluate(code, filename);
  },
});
```

> Note: `defineConfig` is an optional pass-through function which provides type/intellisense autocomplete. You don't have to use it; you can export the object you pass into it directly instead.

Kame automatically picks up files named `kame.config.js` or `kame.config.ts` when present in the current working directory where kame was invoked from. To use a different path, specify the config via the `--config` flag.

## Runtime usage example (CLI)

```sh
npx kame run src/my-entrypoint.ts
```

## Runtime usage example (Node API)

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

## Bundler usage example (CLI)

```sh
npx kame bundle src/my-entrypoint.ts dist/my-bundle.js
```

## Bundler usage example (API)

```js
const kame = require("kame");

const Bundler = kame.Bundler;
// or, to override the config:
// const Bundler = kame.configure({ /* ... */ }).Bundler;

const bundler = new Bundler();

const { warnings, writtenFiles } = bundler.bundle({
  input: "src/my-entrypoint.js";
  output: "dist/my-bundle.js";
});
```
