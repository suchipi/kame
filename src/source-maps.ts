import util from "util";
import {
  ParsedError,
  applySourceMapsToParsedError,
  SourceMap,
  isError,
} from "@suchipi/error-utils";

export type { SourceMap };

export function applySourceMapsToError(
  sourceMaps: { [key: string]: SourceMap },
  err: unknown
): Error {
  let error: Error;
  if (!isError(err)) {
    error = new Error("Non-error value was thrown: " + util.inspect(err));
  } else {
    error = err;
  }

  const parsed = new ParsedError(error);
  const mapped = applySourceMapsToParsedError(sourceMaps, parsed);

  Object.defineProperties(error, {
    stack: {
      value: mapped.stack,
      writable: true,
      enumerable: false,
      configurable: true,
    },
  });

  return error;
}
