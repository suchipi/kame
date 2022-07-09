# kame

Kame (pronounced `kah-may`) is an extensible nodejs-based app runtime and bundler for JavaScript. It seeks to improve the user experience of using new JavaScript syntax features, "compiles-to-JavaScript" languages (like TypeScript, Flow, Coffeescript), and filetype loaders (like importing CSS/PNG/TTF files).

## Here's why I made it

I often write little scripts or modules on my machine to do stuff. I like being able to write those scripts using TypeScript, new ES20XX features, and maybe even the ability to import CSS/PNG files.

But, setting up a huge TypeScript/Babel/Webpack/whatever compilation pipeline for every little thing was really annoying.

I considered copy/pasting the same configs from project to project, or maybe by using a template repo, but I didn't like how messy it all felt, and if I wanted to update babel/webpack/etc in multiple repos all derived from the same template later, I would have to repeat the update for each repo.

So, I wrote a simple tool that works like node but it would compile stuff you loaded/imported at runtime. I could use it to call one-off scripts on my computer without needing to set all the compilation stuff up. Cool. I called this tool kame.

## But, what if...

But then, I thought to myself: well, what happens when I (inevitably) want to clean up a script and distribute it as a package on npm?

I could set up the package so that it uses kame to compile the package's src code every time someone loads it, but it felt wasteful to recompile it at runtime every time when the output was gonna be the same. So I extended kame so that it could also gather stuff up and compile it into an output bundle, like webpack.

This was where I noticed something interesting. For the vast majority of use-cases, the only things a user wants to tell a bundler are:

- Here's how to resolve modules on disk
- Here's how to convert each different filetype to JS

And for the majority of use-cases for a runtime compiler, the only things a user wants to tell the compiler are:

- Here's how to resolve modules on disk
- Here's how to convert each different filetype to JS

Sure, there are other features Webpack and friends have, like post-compilation steps, lots of places to hook into things and tweak them, various optimizations...

But from a user perspective, these are the only things people care about when starting out, and they're _exactly the same_.

So, I decided to implement a bundler into kame, but also to set up a configuration API that would let you use one config for both the runtume _and_ the bundler.

## Hear me out

That might not sound like a big deal, but consider the following situation:

- You wrote a React component in your app built with Webpack.
- Your webpack config lets you import css files via a loader.
- Now you want to test that component using Jest.
- But Jest runs in node, and running webpack output in node can get dicey.
- So you need to figure out how to make Jest able to import css files...
- So you end up writing two different implementations of "how to load css files (one of which might be a stub)", and then you have to keep them in sync over time.
- Then maybe later you decide to move the component into its own library on npm. Now you need to figure out how to load CSS in a way that doesn't depend on Webpack and won't mess up applications who load CSS differently from you.

It all gets really out of hand and painful fast. I ran into this way too many times, and would always be thinking to myself, "I shouldn't have to tell this to Babel AND Webpack AND Jest AND Storybook AND Karma AND..."

Anyway... since kame is both a runtime _and_ a bundler, you can use the runtime for stuff that runs in node (jest/etc), the bundler for stuff that runs in the browser (the app, karma/storybook, etc), and they both use the same config. So it's a ton easier.

## Config hell?

Of course, just saying "you can configure it to do what you want" isn't enough for a good user experience. It needs to have a good out-of-the-box experience. So, kame's default config (when you don't specify one) has these features:

- Seamless ESM/CommonJS interop
- React, JSX support
- Flow support (no typechecking, just strips out syntax)
- TypeScript support (no typechecking, just strips out syntax)
- Support for importing/requiring CSS files (same behavior as style-loader)
- Support for importing/requiring JSON files (same behavior as node)
- Support for import/requiring assets like images, fonts, etc (same behavior as url-loader)
- Doesn't compile js in node_modules

Again, these apply to both the runtime _and_ the bundler.

But, just having a zeroconf tool doesn't solve the problem entirely; the configuration experience needs to be good, too. That's why, compared to other bundlers/compilers, kame's configuration API is _ridiculously_ simple. Here's the TypeScript type for the entire config object:

```ts
export type Config = {
  /*
   * A function that, given a string passed to import/require and the absolute
   * path to the file that import/require appeared in, should return the
   * absolute path to the file that that import/require should be referring to
   */
  resolver: (id: string, fromFilePath: string) => string;

  /*
   * A function that, given the absolute path to a file on disk, reads that
   * file, transforms it into JS (if necessary), and returns a string
   * containing JS source code (and, optionally, a source map).
   */
  loader: (filename: string) => string | { code: string; map: any };

  /*
   * (USED BY RUNTIME ONLY, NOT BUNDLER)
   *
   * A function that, given a JS source code expression and the filename it
   * came from, executes the code and returns the result. This is only used by
   * the runtime, not the bundler.
   */
  runtimeEval: (code: string, filename: string) => any;
};
```

Because kame's configuration uses JavaScript functions instead of huge nested JSON-serializable structures or complicated order-dependent plugin systems, you can extend or modify its behavior by calling, wrapping, or replacing functions.

kame's default resolver, loader, and runtimeEval implementations can be required from kame directly:

```ts
const { defaultResolver, defaultLoader, defaultRuntimeEval } = require("kame");
```

As such, implementing your own changes on top of the defaults involves simply wrapping the default functions:

```ts
const { defaultLoader } = require("kame");

const myConfig = {
  loader: function load(filename: string) {
    if (filename.endsWith(".css")) {
      // handle css your own way
      return myJsCodeString;
    }

    return defaultLoader.load(filename);
  },
};
```

## Okay, I'm intrigued. How do I use it?

First, install kame via npm (or yarn):

```sh
npm install kame
```

Then, you can use it either via the node API, or via the command-line interface (CLI).

### Node API

If you just want to use the default config:

```ts
const { Runtime, Bundler } = require("kame");

// Running code
const runtime = new Runtime();
const result = runtime.load("./index.ts");

// Bundling code
const bundler = new Bundler();
const { warnings, writtenFiles } = bundler.bundle({
  input: "./index.ts",
  output: "./dist/index.js",
});
```

If you want to use a custom config:

```ts
const { configure } = require("kame");

const { Runtime, Bundler } = configure({
  // Provide your custom config here
  resolver: myResolverFunction,
});

// Then use `Runtime` and `Bundler` the same way as in the above code block
```

### CLI

Examples:

```sh
# Runs ./src/index.{tsx,ts,jsx,js} or ./index.{tsx,ts,jsx,js}, whichever exists
kame run

# Runs ./my-script.ts
kame run ./my-script.ts

# Runs ./my-script.ts (same as above)
kame run --input ./my-script.ts

# Bundles:
#   ./src/index.{tsx,ts,jsx,js} or ./index.{tsx,ts,jsx,js}, whichever exists
# into
#  ./dist/index.js
kame bundle

# Bundles ./my-library.ts into ./dist/my-library, and sets up the bundle so
# that if it's loaded in an environment without CommonJS/AMD (eg a browser),
# the exports of ./my-library.ts are put on the global 'MyLibrary'
kame bundle ./my-library.ts ./dist/my-library.js --global MyLibrary

# Run ./my-script.ts, using a custom loader (see \`--loader\` below)
kame run --loader ./my-loader.js --input ./my-script.ts

# Bundle ./my-script.ts, using a custom loader (see \`--loader\` below)
kame bundle --loader ./my-loader.js --input ./my-script.ts
```

For more info/options, run `kame --help`.

## License

MIT
