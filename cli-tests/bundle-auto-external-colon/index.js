// All of these should be considered externals except file://
require("node:fs");
require("quickjs:std");
require("file:///tmp/something/somewhere");
require("https://something.com/somewhere");
