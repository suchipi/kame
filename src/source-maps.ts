import util from "util";
import * as pheno from "pheno";
import ErrorStackParser from "error-stack-parser";
import { SourceMapConsumer } from "source-map";

export type SourceMap = {
  /**
   * Which version of the source map spec this map is following.
   */
  version: number;

  /**
   * An array of URLs to the original source files.
   */
  sources: Array<string>;

  /**
   * An array of identifiers which can be referenced by individual mappings.
   */
  names: Array<string>;

  /**
   * Optional. The URL root from which all sources are relative.
   */
  sourceRoot?: string;

  /**
   * Optional. An array of contents of the original source files.
   */
  sourcesContent?: Array<string>;

  /**
   * A string of base64 VLQs which contain the actual mappings.
   */
  mappings: string;

  /**
   * Optional. The generated filename this source map is associated with.
   */
  file?: string;
};

export function applySourceMapsToError(
  sourceMaps: { [key: string]: SourceMap },
  err: unknown
) {
  let error: Error;
  if (!pheno.isOfType(err, pheno.Error)) {
    error = new Error("Non-error value was thrown: " + util.inspect(err));
  } else {
    error = err;
  }

  const stackFrames = ErrorStackParser.parse(error);

  const newFrameLines: Array<string> = [];

  for (const frame of stackFrames) {
    let output = "  at ";

    if (frame.isConstructor) {
      output += "new ";
    }

    let fileNameShouldBeWrappedInParens = false;
    if (frame.functionName) {
      output += frame.functionName;
      output += " ";

      fileNameShouldBeWrappedInParens = true;
    }

    if (frame.fileName) {
      if (fileNameShouldBeWrappedInParens) {
        output += "(";
      }

      output += frame.fileName;

      if (frame.lineNumber) {
        let line = frame.lineNumber;
        let column = frame.columnNumber;

        if (sourceMaps[frame.fileName] != null) {
          const map = sourceMaps[frame.fileName];

          const consumer = new SourceMapConsumer(map as any);

          const pos = consumer.originalPositionFor({
            line: frame.lineNumber || 1,
            column: frame.columnNumber || 0,
          });

          line = pos.line;
          column = pos.column + 1;
        }

        output += ":";
        output += line;

        if (frame.columnNumber) {
          output += ":";
          output += column;
        }
      }

      if (fileNameShouldBeWrappedInParens) {
        output += ")";
      }
    }

    newFrameLines.push(output);
  }

  Object.defineProperty(error, "stack", {
    value: [
      error.name,
      ": ",
      error.message,
      "\n",
      newFrameLines.join("\n"),
    ].join(""),
  });

  return error;
}
