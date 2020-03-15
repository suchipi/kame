// @flow

// Use some Flow-specific syntax in this file to make sure Flow gets compiled..
// Make sure the syntax isn't also parseable as TypeScript.
import type { Whatever } from "react";
import typeof { Whatever2 } from "react";
import { type WhateverElse } from "react";
import { typeof WhateverElse2 } from "react";

const a = "a";
(a: mixed);

function idk(something: mixed): boolean %checks {
  return true;
}

console.log("hi");
