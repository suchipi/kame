const path = require("path");

module.exports = (code, filename) => {
  return function() {
    console.log(
      `Code from ${path.relative(process.cwd(), filename)}:\n${code}\n`
    );
  };
};
