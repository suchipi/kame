import kleur from "kleur";

const seenWarningMessages: Record<string, true> = {};

export function warnOnce(message: string) {
  if (!seenWarningMessages[message]) {
    console.warn(kleur.yellow(message));
  }
  seenWarningMessages[message] = true;
}
