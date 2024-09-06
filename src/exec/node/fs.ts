import fs from "node:fs";
import fsa from "node:fs/promises";
import { basename, join } from "@std/path";
import type { DirectoryInfo, FileInfo } from "../fs_types.ts";
import { isDebugEnabled, writeLine } from "@gnome/debug";

export function isDir(path: string | URL): Promise<boolean> {
  return fsa.stat(path)
    .then((stat) => stat.isDirectory())
    .catch(() => false);
}

export function isDirSync(path: string | URL): boolean {
  try {
    return fs.statSync(path).isDirectory();
  } catch {
    return false;
  }
}

export function isFile(path: string | URL): Promise<boolean> {
  return fsa.stat(path)
    .then((stat) => stat.isFile())
    .catch(() => false);
}

export function isFileSync(path: string | URL): boolean {
  try {
    return fs.statSync(path).isFile();
  } catch {
    return false;
  }
}

export function lstat(path: string | URL): Promise<FileInfo> {
  return fsa.lstat(path).then((stat) => {
    const p = path instanceof URL ? path.toString() : path;
    return {
      isFile: stat.isFile(),
      isDirectory: stat.isDirectory(),
      isSymlink: stat.isSymbolicLink(),
      name: basename(p),
      path: p,
      size: stat.size,
      birthtime: stat.birthtime,
      mtime: stat.mtime,
      atime: stat.atime,
      mode: stat.mode,
      uid: stat.uid,
      gid: stat.gid,
      dev: stat.dev,
      blksize: stat.blksize,
      ino: stat.ino,
      nlink: stat.nlink,
      rdev: stat.rdev,
      blocks: stat.blocks,
      isBlockDevice: stat.isBlockDevice(),
      isCharDevice: stat.isCharacterDevice(),
      isSocket: stat.isSocket(),
      isFifo: stat.isFIFO(),
    } as FileInfo;
  });
}

export function lstatSync(path: string | URL): FileInfo {
  const stat = fs.lstatSync(path);
  const p = path instanceof URL ? path.toString() : path;
  return {
    isFile: stat.isFile(),
    isDirectory: stat.isDirectory(),
    isSymlink: stat.isSymbolicLink(),
    name: basename(p),
    path: p,
    size: stat.size,
    birthtime: stat.birthtime,
    mtime: stat.mtime,
    atime: stat.atime,
    mode: stat.mode,
    uid: stat.uid,
    gid: stat.gid,
    dev: stat.dev,
    blksize: stat.blksize,
    ino: stat.ino,
    nlink: stat.nlink,
    rdev: stat.rdev,
    blocks: stat.blocks,
    isBlockDevice: stat.isBlockDevice(),
    isCharDevice: stat.isCharacterDevice(),
    isSocket: stat.isSocket(),
    isFifo: stat.isFIFO(),
  };
}

export function readDir(
  path: string | URL,
): AsyncIterable<DirectoryInfo> {
  if (path instanceof URL) {
    path = path.toString();
  }

  const iterator = async function* () {
    const data = await fsa.readdir(path);
    for (const d of data) {
      const next = join(path, d);
      try {
        const info = await lstat(join(path, d));
        yield {
          name: d,
          isFile: info.isFile,
          isDirectory: info.isDirectory,
          isSymlink: info.isSymlink,
        };
      } catch (e) {
        if (isDebugEnabled()) {
          const message = e.stack ?? e.message;
          const e2 = e as NodeJS.ErrnoException;
          if (e2.code) {
            writeLine(`Failed to lstat ${next}\n${e2.code}\n${message}`);
          } else {
            writeLine(`Failed to lstat ${next}\n${message}`);
          }
        }
      }
    }
  };

  return iterator();
}

export function* readDirSync(
  path: string | URL,
): Iterable<DirectoryInfo> {
  if (path instanceof URL) {
    path = path.toString();
  }

  const data = fs.readdirSync(path);
  for (const d of data) {
    const next = join(path, d);
    try {
      const info = lstatSync(next);

      yield {
        name: d,
        isFile: info.isFile,
        isDirectory: info.isDirectory,
        isSymlink: info.isSymlink,
      };
    } catch (e) {
      if (isDebugEnabled()) {
        const message = e.stack ?? e.message;
        const e2 = e as NodeJS.ErrnoException;
        if (e2.code) {
          writeLine(`Failed to lstat ${next}\n${e2.code}\n ${message}`);
        } else {
          writeLine(`Failed to lstat ${next}\n${message}`);
        }
      }
    }
  }
}
