import type { DirectoryInfo } from "../fs_types.ts";

export function isDir(path: string | URL): Promise<boolean> {
  return Deno.stat(path)
    .then((stat) => stat.isDirectory)
    .catch(() => false);
}

export function isDirSync(path: string | URL): boolean {
  try {
    return Deno.statSync(path).isDirectory;
  } catch {
    return false;
  }
}

export function isFile(path: string | URL): Promise<boolean> {
  return Deno.stat(path)
    .then((stat) => stat.isFile)
    .catch(() => false);
}

export function isFileSync(path: string | URL): boolean {
  try {
    return Deno.statSync(path).isFile;
  } catch {
    return false;
  }
}

export function readDir(
  path: string | URL,
): AsyncIterable<DirectoryInfo> {
  return Deno.readDir(path);
}

export function readDirSync(
  path: string | URL,
): Iterable<DirectoryInfo> {
  return Deno.readDirSync(path);
}
