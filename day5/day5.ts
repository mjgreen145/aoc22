import { readFileSync } from 'fs';
import * as path from 'path';

function sum(x: number, y: number): number {
  return x + y;
}

function chunkString<T>(str: string, chunkSize: number): string[] {
  if (chunkSize < 1) {
    throw new Error('must chunk in positive amounts');
  }
  let chunks = [];
  for (let i = 0; i < str.length; i += chunkSize) {
    chunks.push(str.slice(i, i + chunkSize));
  }
  return chunks;
}

type Stack = string[];

type Move = {
  from: number;
  to: number;
  numCrates: number;
};

function repeat<T>(thing: T, times: number): T[] {
  return new Array(times).fill(null).map((x) => thing);
}

function last<T>(arr: T[]): T {
  return arr.slice(-1)[0];
}

function repeatTimes(fn: Function, times: number) {
  for (let i = 0; i < times; i++) {
    fn();
  }
}

function parseInput(input: string): { stacks: Stack[]; moves: Move[] } {
  const [stacksTxt, movesTxt] = input.split('\n\n');

  const crates = stacksTxt
    .split('\n')
    .reverse()
    .slice(1)
    .map((s) => chunkString(s, 4).map((str) => str.trim()));

  const numStacks = Math.max(...crates.map((c) => c.length));

  const stacks: Stack[] = [];

  crates.forEach((crateRow) => {
    crateRow.forEach((crate, i) => {
      if (!stacks[i]) {
        stacks[i] = [];
      }
      const char = crate[1];
      if (char) {
        stacks[i].push(char);
      }
    });
  });

  return {
    stacks: stacks,
    moves: movesTxt
      .split('\n')
      .map((moveStr) => moveStr.match(/^move (\d+) from (\d+) to (\d+)$/)!.slice(1, 4))
      .map(([numCrates, from, to]: string[]) => ({
        from: parseInt(from) - 1,
        to: parseInt(to) - 1,
        numCrates: parseInt(numCrates),
      })),
  };
}

async function run() {
  const input = readFileSync(path.resolve(__dirname, './input.txt'), { encoding: 'utf8' });

  const { stacks, moves } = parseInput(input);
  const part1Stacks: Stack[] = JSON.parse(JSON.stringify(stacks));
  const part2Stacks: Stack[] = JSON.parse(JSON.stringify(stacks));

  // part 1
  moves.forEach(({ from, to, numCrates }) => {
    repeatTimes(() => {
      let crate = part1Stacks[from].pop();
      if (!crate) {
        throw new Error('no crate to move');
      }
      part1Stacks[to].push(crate);
    }, numCrates);
  });

  console.log(part1Stacks.map((stack) => last(stack)).join(''));

  // Part 2
  moves.forEach(({ from, to, numCrates }) => {
    let crates = part2Stacks[from].splice(part2Stacks[from].length - numCrates);
    part2Stacks[to] = part2Stacks[to].concat(crates);
  });

  console.log(part2Stacks.map((stack) => last(stack)).join(''));
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
