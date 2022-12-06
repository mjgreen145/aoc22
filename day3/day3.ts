import { readFileSync } from 'fs';
import * as path from 'path';
import assert from 'assert';

function sum(x: number, y: number): number {
  return x + y;
}

function setIntersection<T>(a: Set<T>, b: Set<T>): Set<T> {
  return new Set([...a].filter((x) => b.has(x)));
}

function chunk<T>(arr: T[], chunkSize: number): T[][] {
  if (chunkSize < 1) {
    throw new Error('must chunk in positive amounts');
  }
  let chunks = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    chunks.push(arr.slice(i, i + chunkSize));
  }
  return chunks;
}

const priorities = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

async function run() {
  const text = readFileSync(path.resolve(__dirname, './input.txt'), { encoding: 'utf8' });

  // Part 1
  const sumPriorities = text
    .split('\n')
    .map((itemsStr) => {
      assert(itemsStr.length % 2 === 0, 'Odd number of items in the bag');
      const half = itemsStr.length / 2;
      const firstItems = new Set([...itemsStr.substring(0, half)]);
      const secondItems = new Set([...itemsStr.substring(half, itemsStr.length)]);

      const sharedItems = setIntersection(firstItems, secondItems);

      return [...sharedItems].map((item) => priorities.indexOf(item) + 1).reduce(sum, 0);
    })
    .reduce(sum, 0);

  console.log(sumPriorities);

  // Part 2
  const badgePrioritySum = chunk(text.split('\n'), 3).map(([elf1, elf2, elf3]) => {
    const shared = setIntersection(new Set([...elf1]), setIntersection(new Set([...elf2]), new Set([...elf3])));

    assert(shared.size === 1, 'There was not a single shared item');

    return priorities.indexOf([...shared][0]) + 1;
  }).reduce(sum, 0);

  console.log(badgePrioritySum);
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
