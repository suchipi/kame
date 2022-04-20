const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

export function isRunning(pid: number): boolean {
  try {
    process.kill(pid, 0);
  } catch (err) {
    if ((err as any).code === "ESRCH") {
      return false;
    } else {
      return true;
    }
  }

  return true;
}

export function sendSignal(pid: number, signal: string) {
  try {
    process.kill(pid, signal);
  } catch (err) {}
}

export async function kill(pid: number): Promise<void> {
  if (!isRunning(pid)) return;

  // NB. sending kill with negative pid sends to all processes with
  // the absolute value of that pid as their group id, ie. the process
  // and any children it spawned
  const gid = -pid;

  // first try sigint
  sendSignal(gid, "SIGINT");

  await sleep(100);
  if (!isRunning(pid)) return;

  // if that didn't kill it within 100ms, try SIGTERM
  sendSignal(gid, "SIGTERM");
  await sleep(100);

  // if that didn't kill it within 100ms, try SIGKILL
  if (!isRunning(pid)) return;
  sendSignal(gid, "SIGKILL");

  // assume SIGKILL will work
  await sleep(5);
}
