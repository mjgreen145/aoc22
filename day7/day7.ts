import { readFileSync } from 'fs';
import * as path from 'path';

function first<T>(arr: T[]): T {
  return arr[0];
}

function sum(x: number, y: number): number {
  return x + y;
}

function isDirectory(item: any): item is Directory {
  return item.constructor === Directory;
}

class File {
  constructor(public name: string, public size: number) {}

  get totalSize(): number {
    return this.size;
  }
}

class Directory {
  public contents: Record<string, Directory | File> = {};

  constructor(public name: string, private _parent: Directory | null) {}

  get parent(): Directory {
    return this._parent || this;
  }

  addFile(file: File) {
    this.contents[file.name] = file;
  }

  addDir(dir: Directory) {
    this.contents[dir.name] = dir;
  }

  get totalSize(): number {
    return Object.values(this.contents)
      .map((item) => item.totalSize)
      .reduce(sum, 0);
  }
}

function dirWalker<T>(rootDir: Directory, fn: (dir: Directory) => T, results: T[] = []): T[] {
  const childDirs = Object.values(rootDir.contents).filter(isDirectory);

  return [...results, fn(rootDir), ...childDirs.flatMap((dir) => dirWalker(dir, fn))];
}

function sizeNotBiggerThan(size: number, item: Directory | File): boolean {
  return item.totalSize <= size;
}

async function run() {
  const input = readFileSync(path.resolve(__dirname, './input.txt'), { encoding: 'utf8' });
  const lines = input.split('\n');
  const root = new Directory('/', null);

  function processLine(line: string, currentDir: Directory): Directory {
    if (/^\$ cd/.test(line)) {
      return processCdCmd(line, currentDir);
    }
    if (/^\$ ls/.test(line)) {
      return currentDir;
    }
    if (/^dir/.test(line)) {
      const [_input, dirName] = line.match(/^dir (.*)$/)!;
      currentDir.addDir(new Directory(dirName, currentDir));
      return currentDir;
    }
    if (/^\d+/.test(line)) {
      const [_input, fileSize, fileName] = line.match(/^(\d+) (.*)$/)!;
      currentDir.addFile(new File(fileName, parseInt(fileSize)));
      return currentDir;
    }

    return currentDir;
  }

  function processCdCmd(cmd: string, currentDir: Directory): Directory {
    const [_input, target] = cmd.match(/^\$ cd (.*)$/)!;
    switch (target) {
      case '/':
        return root;
      case '..':
        return currentDir.parent;
      default: {
        if (!currentDir.contents[target]) {
          currentDir.addDir(new Directory(target, currentDir));
        }
        return currentDir.contents[target] as Directory;
      }
    }
  }

  lines.reduce<Directory>((currentDir, line) => processLine(line, currentDir), root);

  const allDirs = dirWalker(root, (dir) => dir);

  const totalUsed = allDirs
    .filter((dir) => sizeNotBiggerThan(100000, dir))
    .map((dir) => dir.totalSize)
    .reduce(sum, 0);

  console.log('part 1:', totalUsed);

  // Part 2
  const totalAvailableSize = 70_000_000;
  const spaceRequiredForUpdate = 30_000_000;
  const freeSpace = totalAvailableSize - root.totalSize;
  const freeSpaceRequired = spaceRequiredForUpdate - freeSpace;

  const smallestDeletable = first(
    allDirs
      .map((dir) => dir.totalSize)
      .sort((a, b) => a - b)
      .filter((size) => size >= freeSpaceRequired),
  );

  console.log('part 2:', smallestDeletable);
}

(async () => {
  await run();
  console.log('Done');
  process.exit(0);
})()
  .catch((e: any) => {
    console.error(e);
    console.error(e.stack);
    process.exit(1);
  })
  .then(() => {
    process.exit(0);
  });
