import { EventEmitter } from "@denosaurs/event";
import { type CommandOptions, type Output, output, spawn } from "@gnome/exec";

import type { MediaInfo, YTDLEventEmitter, YTDLWrapperOptions } from "./types.ts";
import { bindAbortSignal, createError, createNotFoundError, emitYoutubeDlEvents, readStream } from "./utils.ts";

/**
 * Wrapper for the yt-dlp command line tool
 */
export class YTDLWrapper {
  #path: string;
  #progressRegex: RegExp = /\[download\] *(.*) of[ ~]*([^ ]*)(:? *at *([^ ]*))?(:? *ETA *([^ ]*))?/i;

  /**
   * Create a new YTDLWrapper
   *
   * @param path Path to the yt-dlp executable (default: "yt-dlp", needs to be in the PATH). If you want to use a specific yt-dlp binary, you can specify the path here, this needs to be an absolute path.
   * @param options Options for the wrapper
   */
  constructor(path: string = "yt-dlp", options: YTDLWrapperOptions = {}) {
    this.#path = path;

    if (options.progressRegex) {
      this.#progressRegex = options.progressRegex;
    }
  }

  /**
   * Path to the yt-dlp executable
   */
  get path(): string {
    return this.#path;
  }

  set path(path: string) {
    this.#path = path;
  }

  /**
   * Regular expression used to parse progress data from yt-dlp
   */
  get progressRegex(): RegExp {
    return this.#progressRegex;
  }

  set progressRegex(regex: RegExp) {
    this.#progressRegex = regex;
  }

  /**
   * Execute yt-dlp with the given arguments
   *
   * @param args Arguments to pass to yt-dlp
   * @param options Options to pass to the command
   * @param abortSignal Abort signal to cancel the command
   * @returns EventEmitter that emits events from yt-dlp
   */
  exec(
    args: string[] = [],
    options: CommandOptions = {},
    abortSignal: AbortSignal | null = null,
  ): YTDLEventEmitter {
    const execEventEmitter = new EventEmitter() as YTDLEventEmitter;
    const proc = spawn(this.path, args, {
      ...options,
      stderr: "piped",
      stdout: "piped",
      signal: abortSignal || undefined,
    });

    bindAbortSignal(abortSignal, proc);

    let errorText = "";

    const streamPromises = [
      readStream(proc.stdout, (data) => emitYoutubeDlEvents(data, execEventEmitter, this.progressRegex)),
      readStream(proc.stderr, (data) => {
        errorText += data;
      }),
    ];

    const procPromise = proc.status.then((status) => {
      if (!status.success) {
        execEventEmitter.emit("closeWithError", createError(status.code, errorText));
      }
    });

    Promise.all([...streamPromises, procPromise]).then(() => {
      if (errorText) {
        execEventEmitter.emit("error", createError(null, errorText));
      } else {
        execEventEmitter.emit("close", 0);
      }
    });

    return execEventEmitter;
  }

  /**
   * Execute yt-dlp with the given arguments and return the output
   *
   * @param args Arguments to pass to yt-dlp
   * @param options Options to pass to the command
   * @param abortSignal Abort signal to cancel the command
   * @returns Promise that resolves with the output of the command
   */
  execPromise(
    args: string[] = [],
    options: CommandOptions = {},
    abortSignal: AbortSignal | null = null,
  ): Promise<Output> {
    const ytDlpPromise = new Promise<Output>(
      (resolve, reject) => {
        output(
          this.path,
          args,
          {
            ...options,
            signal: abortSignal || undefined,
          },
        ).then((output) => {
          if (output.success) {
            resolve(output);
          } else {
            if (output.errorLines().find((line) => line.includes("HTTP Error 404: Not Found"))) {
              reject(createNotFoundError(args));
              return;
            }
            reject(output.errorText());
          }
        });
      },
    );
    return ytDlpPromise;
  }

  /**
   * Execute yt-dlp with the given arguments and return the output as a string
   *
   * @param args Arguments to pass to yt-dlp
   * @param options Options to pass to the command
   * @param abortSignal Abort signal to cancel the command
   * @returns Promise that resolves with the output of the command as a string
   * @see execPromise
   */
  execPromiseString(
    args: string[] = [],
    options: CommandOptions = {},
    abortSignal: AbortSignal | null = null,
  ): Promise<string> {
    return this.execPromise(args, options, abortSignal).then((output) => output.text());
  }

  /**
   * Get a list of all available extractors
   *
   * @returns Promise that resolves with an array of extractor names
   */
  getExtractors(): Promise<string[]> {
    return this.execPromiseString(["--list-extractors"]).then((s) =>
      s.split("\n").map((s) => s.trim()).filter((s) => s)
    );
  }

  /**
   * Get a list of all available extractor descriptions
   *
   * @returns Promise that resolves with an array of extractor descriptions
   */
  getExtractorDescriptions(): Promise<string[]> {
    return this.execPromiseString(["--extractor-descriptions"]).then((s) =>
      s.split("\n").map((s) => s.trim()).filter((s) => s)
    );
  }

  /**
   * Get the help text from yt-dlp
   *
   * @returns Promise that resolves with the help text
   */
  getHelp(): Promise<string> {
    return this.execPromiseString(["--help"]);
  }

  /**
   * Get the user agent string used by yt-dlp
   *
   * @returns Promise that resolves with the user agent string
   */
  getUserAgent(): Promise<string> {
    return this.execPromiseString(["--dump-user-agent"]);
  }

  /**
   * Get the version of yt-dlp
   *
   * @returns Promise that resolves with the version string
   * @throws Error if there is an error
   */
  getVersion(): Promise<string> {
    return this.execPromiseString(["--version"]);
  }

  /**
   * Get media information from yt-dlp
   *
   * @param args Arguments to pass to yt-dlp
   * @returns Promise that resolves with the media information
   */
  async getMediaInfo(args: string | string[]): Promise<MediaInfo | Array<MediaInfo>> {
    if (typeof args == "string") args = [args];
    if (!args.includes("-f") && !args.includes("--format")) {
      args = args.concat(["-f", "best"]);
    }

    const output = await this.execPromiseString(
      args.concat(["--dump-json"]),
    );

    try {
      return JSON.parse(output) as MediaInfo;
    } catch (_e) {
      const cleaned = output
        .replace(/\n/g, ",")
        .replace(/,(\s+)?$/, "");
      return JSON.parse(`[${cleaned}]`) as Array<MediaInfo>;
    }
  }
}
