const fs = require("fs");
const path = require("path");

exports.resolve = (id, fromFilePath) => {
  return path.resolve(__dirname, id);
};

exports.load = (filePath) => {
  const code = fs.readFileSync(filePath, "utf-8");
  return code.replace(/hi/, "yo");
};

exports.evaluate = (code, filePath) => {
  console.log("running", filePath);
  return eval(code);
};
