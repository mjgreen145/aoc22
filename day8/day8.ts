import { readFileSync } from 'fs';
import * as path from 'path';

function parseGrid(text: string): number[][] {
  const rows = text.split('\n');
  return rows.map((row) => [...row].map((char) => parseInt(char)));
}

function isVisible(grid: number[][], x: number, y: number): boolean {
  const height = grid[y][x];

  return (
    Math.max(...grid[y].slice(0, x)) < height ||
    Math.max(...grid[y].slice(x + 1)) < height ||
    Math.max(...grid.map((row) => row[x]).slice(0, y)) < height ||
    Math.max(...grid.map((row) => row[x]).slice(y + 1)) < height
  );
}

function scenicScore(grid: number[][], x: number, y: number): number {
  const height = grid[y][x];

  const treesRight = grid[y].slice(x + 1);
  const treesLeft = grid[y].slice(0, x).reverse();
  const treesUp = grid
    .map((row) => row[x])
    .slice(0, y)
    .reverse();
  const treesDown = grid.map((row) => row[x]).slice(y + 1);

  return (
    takeWhileVisible(treesRight, height).length *
    takeWhileVisible(treesLeft, height).length *
    takeWhileVisible(treesUp, height).length *
    takeWhileVisible(treesDown, height).length
  );
}

function takeWhileVisible(trees: number[], height: number): number[] {
  const index = trees.findIndex((tree) => tree >= height);
  if (index === -1) return trees;
  return trees.slice(0, index + 1);
}

async function run() {
  const input = readFileSync(path.resolve(__dirname, './input.txt'), { encoding: 'utf8' });
  const grid = parseGrid(input);

  // part 1
  const numVisible = grid.flatMap((row, y) => row.map((_, x) => isVisible(grid, x, y))).filter((x) => x).length;

  console.log(numVisible);

  // part 2

  const maxScore = Math.max(...grid.flatMap((row, y) => row.map((_, x) => scenicScore(grid, x, y))))

  console.log(maxScore);
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
