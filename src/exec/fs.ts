import { RUNTIME } from "@gnome/runtime-info/js";
import type { FileSystem } from "./fs_types.ts";

let fs: FileSystem;

// deno-lint-ignore no-explicit-any
const g = globalThis as any;
if (g.process && g.process.versions && g.process.versions.node) {
  fs = await import("./node/fs.ts");
} else if (g.Deno) {
  fs = await import("./deno/fs.ts");
} else {
  throw new Error(`Unsupported runtime ${RUNTIME}`);
}

export const isDir = fs.isDir;
export const isDirSync = fs.isDirSync;
export const isFile = fs.isFile;
export const isFileSync = fs.isFileSync;
export const readDir = fs.readDir;
export const readDirSync = fs.readDirSync;

export default {
  isDir,
  isDirSync,
  isFile,
  isFileSync,
  readDir,
  readDirSync,
} as FileSystem;
