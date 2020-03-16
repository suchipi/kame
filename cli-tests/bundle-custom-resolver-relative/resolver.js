const path = require("path");

exports.resolve = (id, fromFilePath) => {
  return path.resolve(__dirname, id);
};
