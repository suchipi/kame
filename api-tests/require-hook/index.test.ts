import { test, expect } from "vitest";
import firstBase from "first-base";

test("works", async () => {
  const run = firstBase.spawn("node", ["./sample-one.js"], { cwd: __dirname });

  await run.completion;

  expect(run.result).toMatchInlineSnapshot(`
    {
      "code": 0,
      "error": false,
      "stderr": "Config provided resolve function via the 'resolver' key, which is deprecated. Please use the key 'resolve'.
    ",
      "stdout": "{ potato: [Getter] }
    ",
    }
  `);
});
