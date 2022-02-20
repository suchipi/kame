const path = require("path");

exports.evaluate = (code, filename) => {
  return function() {
    console.log(
      `Code from ${path.relative(process.cwd(), filename)}:\n${code}\n`
    );
  };
};
