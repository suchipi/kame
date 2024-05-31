import fs from "fs";
import path from "path";

const rootDir = (...parts: Array<string>) =>
  path.resolve(__dirname, "..", ...parts);

const cli = rootDir("dist", "cli.js");

function joinPath(...parts: Array<string>) {
  return path.resolve(...parts);
}

function remove(...parts: Array<string>) {
  const target = joinPath(...parts);
  if (fs.existsSync(target)) {
    fs.rmSync(target, { recursive: true });
  }
}

function write(...parts: Array<string>) {
  const content = parts.pop();
  fs.writeFileSync(joinPath(...parts), content!);
}

function read(...parts: Array<string>) {
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

export { cli, joinPath as path, remove, write, read, rootDir };
