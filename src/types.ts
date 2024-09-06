import type { EventEmitter } from "@denosaurs/event";

/**
 * Options for the YTDLWrapper
 */
export type YTDLWrapperOptions = {
  /** Regular expression used to parse progress data from yt-dlp */
  progressRegex?: RegExp;
};

/**
 * Progress data
 *
 * This is emitted by the `progress` event
 */
export type Progress = {
  /** Percentage of the download */
  percent?: number | null;
  /** Total size of the download */
  totalSize?: string;
  /** Download speed */
  currentSpeed?: string;
  /** ETA of the download */
  eta?: string;
};

/**
 * Event types emitted by YTDLEventEmitter
 *
 * @see {@link YTDLEventEmitter}
 */
export type Events = {
  /** Emitted when the process is closed */
  close: [number | null];
  /** Emitted when the process is closed with an error */
  closeWithError: [Error];
  /** Emitted when an error occurs */
  error: [Error];
  /** Emitted when progress is made */
  progress: [Progress];
  /** Emitted when an event occurs */
  event: [eventType: string, eventData: string];
  /** Emitted if the line is not recognized as an event */
  debug: [string];
};

/**
 * Event emitter for yt-dlp events
 *
 * @see {@link Events}
 */
export type YTDLEventEmitter = EventEmitter<Events>;

/**
 * Media info object
 *
 * This is returned by `YTDLWrapper.getMediaInfo`
 *
 * @see {@link YTDLWrapper.getMediaInfo}
 */
export type MediaInfo = Record<string, unknown> & {
  _type: string;
  _version: {
    version: string;
  } & Record<string, unknown>;
};

/**
 * Errpr Type for when the media is not found
 *
 * This is thrown by `YTDLWrapper.execPromise`
 *
 * @see {@link YTDLWrapper.execPromise}
 */
export type NotFoundError = Error;
