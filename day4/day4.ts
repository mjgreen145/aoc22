import { readFileSync } from 'fs';
import * as path from 'path';

function sum(x: number, y: number): number {
  return x + y;
}

class Range {
  constructor(private from: number, private to: number) {}

  contains(range: Range): boolean {
    return this.from <= range.from && this.to >= range.to;
  }

  overlaps(range: Range): boolean {
    return !(this.to < range.from || this.from > range.to);
  }
}

async function run() {
  const pairsTxt = readFileSync(path.resolve(__dirname, './input.txt'), { encoding: 'utf8' });

  const rangePairs = pairsTxt
    .split('\n')
    .map((pair) => pair.match(/\d+/g) as string[])
    .map((stringArr) => stringArr.map((str) => parseInt(str)))
    .map(([start1, end1, start2, end2]) => [new Range(start1, end1), new Range(start2, end2)]);

  // Part 1
  const containedPairs = rangePairs.filter(([range1, range2]) => range1.contains(range2) || range2.contains(range1));

  console.log(containedPairs.length);

  // Part 2
  const overlapPairs = rangePairs.filter(([range1, range2]) => range1.overlaps(range2) || range2.overlaps(range1));

  console.log(overlapPairs.length);
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
