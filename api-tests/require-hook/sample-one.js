const path = require("node:path");

const kame = require("../..").configure({
  // we use a custom resolver here to assert that kame's resolver behavior gets
  // used instead of the normal node behavior, as "TWO" won't resolve when using
  // the normal node behavior.
  resolver: (id, fromFilePath) => {
    if (id === "TWO") {
      return path.join(__dirname, "sample-two.ts");
    } else {
      throw new Error("idk how to resolve that");
    }
  },
});

const runtime = new kame.Runtime();
runtime.register();

const sampleTwo = require("TWO");
console.log(sampleTwo);
