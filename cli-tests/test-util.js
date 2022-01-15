const fs = require("fs");
const path = require("path");
const rimraf = require("rimraf");
const mkdirp = require("mkdirp");

const rootDir = (...parts) => path.resolve(__dirname, "..", ...parts);

const cli = rootDir("dist", "cli.js");

function joinPath(...parts) {
  return path.resolve(...parts);
}

function remove(...parts) {
  rimraf.sync(joinPath(...parts));
}

function write(...parts) {
  const content = parts.pop();
  fs.writeFileSync(joinPath(...parts), content);
}

function read(...parts) {
  const target = joinPath(...parts);
  if (!fs.existsSync(target)) {
    throw new Error(`File does not exist: ${target}`);
  }

  const stats = fs.statSync(target);
  if (stats.isDirectory()) {
    const dir = {};
    const contents = fs.readdirSync(target);
    contents.forEach((content) => {
      dir[content] = read(target, content);
    });
    return dir;
  } else {
    return fs.readFileSync(target, "utf-8");
  }
}

module.exports = {
  cli,
  path: joinPath,
  remove,
  write,
  read,
  rootDir,
};
