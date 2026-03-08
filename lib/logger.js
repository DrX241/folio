const isDev = process.env.NODE_ENV === "development";

function getConsole() {
  if (typeof globalThis === "undefined") {
    return null;
  }
  return globalThis["console"] || null;
}

export function debugLog(...args) {
  if (!isDev) {
    return;
  }
  const runtimeConsole = getConsole();
  if (runtimeConsole?.log) {
    runtimeConsole.log(...args);
  }
}

export function debugError(...args) {
  if (!isDev) {
    return;
  }
  const runtimeConsole = getConsole();
  if (runtimeConsole?.error) {
    runtimeConsole.error(...args);
  }
}
