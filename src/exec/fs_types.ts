export interface DirectoryInfo {
  name: string;
  isFile: boolean;
  isDirectory: boolean;
  isSymlink: boolean;
}

export interface FileInfo {
  name: string;

  path?: string;
  isFile: boolean;
  isDirectory: boolean;
  isSymlink: boolean;
  size: number;
  mtime: Date | null;
  atime: Date | null;
  birthtime: Date | null;
  dev: number;
  ino: number | null;
  mode: number | null;
  nlink: number | null;
  uid: number | null;
  gid: number | null;
  rdev: number | null;
  blksize: number | null;
  blocks: number | null;
  isBlockDevice: boolean | null;
  isCharDevice: boolean | null;
  isFifo: boolean | null;
  isSocket?: boolean | null;
}

export interface FileSystem {
  isDir(path: string | URL): Promise<boolean>;
  isDirSync(path: string | URL): boolean;
  isFile(path: string | URL): Promise<boolean>;
  isFileSync(path: string | URL): boolean;
  readDir(
    path: string | URL,
  ): AsyncIterable<DirectoryInfo>;
  readDirSync(
    path: string | URL,
  ): Iterable<DirectoryInfo>;
}
