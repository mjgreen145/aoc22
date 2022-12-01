import { readFileSync } from 'fs';
import * as path from 'path';

function sum(x: number, y: number): number {
  return x + y;
}

async function run() {
  const allText = readFileSync(path.resolve(__dirname, './calories.txt'), { encoding: 'utf8' });

  const totals = allText.split('\n\n').map((text) =>
    text
      .split('\n')
      .map((numStr) => parseInt(numStr))
      .reduce(sum, 0),
  );

  // Part 1
  console.log(Math.max(...totals));

  const sortedTotalsDesc = totals.sort((a: number, b: number) => b - a);

  // Part 2
  console.log(sortedTotalsDesc[0] + sortedTotalsDesc[1] + sortedTotalsDesc[2]);
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
