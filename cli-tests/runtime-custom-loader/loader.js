const fs = require("fs");

module.exports = (filename) => {
  const code = fs.readFileSync(filename, "utf-8");
  return code.replace(/hi/, "yo");
};
