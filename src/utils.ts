import type { NotFoundError, YTDLEventEmitter } from "./types.ts";
import { type ChildProcess, runSync } from "./exec/mod.ts";
import { WINDOWS } from "@gnome/runtime-info";

/**
 * Create an error with the given code and error data
 *
 * @param code Error code
 * @param errData Error data
 * @returns Error
 * @internal
 */
export const createError = (
  code: number | null,
  errData: string,
): Error => {
  let errorMessage = "\nError code: " + code;
  if (errData) errorMessage += "\n\nError data:\n" + errData;
  return new Error(errorMessage);
};

/**
 * Create a NotFoundError with the given arguments
 *
 * @param args Arguments that were not found
 * @returns NotFoundError
 * @internal
 */
export const createNotFoundError = (args: string[]): NotFoundError => {
  return new Error(`Not found: [${args.join(", ")}]`) as NotFoundError;
};

/**
 * Adds an event listener to the abort signal that kills the process
 *
 * @param signal
 * @param process
 * @internal
 */
export const bindAbortSignal = (
  signal: AbortSignal | null,
  process: ChildProcess,
): void => {
  signal?.addEventListener("abort", () => {
    try {
      if (WINDOWS) {
        runSync(`taskkill /pid ${process.pid} /T /F`);
      } else {
        runSync(`pgrep -P ${process.pid} | xargs -L 1 kill`);
      }
    } finally {
      process.kill();
    }
  });
};

/**
 * Read a string coming from stdout and emit events
 *
 * @param stringData String data to read
 * @param emitFunction EventEmitter to emit events
 * @param progressRegex Regex to match progress lines
 * @internal
 */
export const emitYoutubeDlEvents = (
  stringData: string,
  emitter: YTDLEventEmitter,
  progressRegex: RegExp,
): void => {
  const outputLines = stringData.split(/\r|\n/g).filter(Boolean);
  for (const outputLineRaw of outputLines) {
    const outputLine = outputLineRaw.trim();
    if (outputLine.startsWith("[")) {
      const progressMatch = outputLine.match(progressRegex);
      if (progressMatch) {
        const percent = parseFloat(
          progressMatch[1].replace("%", ""),
        );
        const totalSize = progressMatch[2].replace("~", "");
        const currentSpeed = progressMatch[4];
        const eta = progressMatch[6];
        emitter.emit("progress", {
          percent: isNaN(percent) ? null : percent,
          totalSize,
          currentSpeed,
          eta,
        });
      }

      const eventType = outputLine
        .split(" ")[0]
        .replace("[", "")
        .replace("]", "")
        .toLowerCase()
        .trim();
      const eventData = outputLine.substring(
        outputLine.indexOf(" "),
        outputLine.length,
      ).trim();
      emitter.emit("event", eventType, eventData);
    } else {
      emitter.emit("event", "other", outputLine);
    }
  }
};

/**
 * Read a stream and call the onData function with the data
 *
 * @param stream Stream to read
 * @param onData Function to call with the data
 * @internal
 */
export async function readStream(stream: ReadableStream<Uint8Array>, onData: (chunk: string) => void) {
  const reader = stream.getReader();
  let result;
  while (!(result = await reader.read()).done) {
    const chunk = result.value;
    onData(new TextDecoder().decode(chunk));
  }
}
