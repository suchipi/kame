const fs = require("fs");

exports.load = (filename) => {
  const code = fs.readFileSync(filename, "utf-8");
  return code;
};
