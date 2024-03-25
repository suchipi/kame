const kame = require("../..");

const runtime = new kame.Runtime();
runtime.register();

// not ideal: have to specify file extension. kame's loader is used, but its
// resolver isn't.
const sampleTwo = require("./sample-two.ts");
console.log(sampleTwo);
