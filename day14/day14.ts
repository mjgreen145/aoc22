import { readFileSync } from 'fs';
import * as path from 'path';

function slidingWindowOfSize2<T>(arr: T[]): T[][] {
  if (arr.length < 2) {
    throw new Error('Array contained less than 2 items');
  }
  if (arr.length === 2) {
    return [arr];
  }

  return [arr.slice(0, 2), ...slidingWindowOfSize2(arr.slice(1))];
}

enum Cell {
  Rock = '#',
  Air = '.',
  Sand = 'o',
}

type Grid = Cell[][];

type Coord = [number, number];

function sortNums(nums: number[]): number[] {
  return nums.sort((a, b) => a - b);
}

function cartesianProduct(xs: number[], ys: number[]): Coord[] {
  return xs.flatMap((x) => ys.map((y) => [x, y] as Coord));
}

function allCoordsBetween(coord1: Coord, coord2: Coord): Coord[] {
  const [x1, x2] = sortNums([coord1[0], coord2[0]]);
  const [y1, y2] = sortNums([coord1[1], coord2[1]]);

  const xs = Array(x2 - x1 + 1)
    .fill(null)
    .map((_, i) => i + x1);
  const ys = Array(y2 - y1 + 1)
    .fill(null)
    .map((_, i) => i + y1);

  return cartesianProduct(xs, ys);
}

function buildGridFromInput(input: string): Grid {
  let grid: Grid = [];

  input.split('\n').forEach((line) => {
    const coords: Array<Coord> = line
      .split(' -> ')
      .map((coordStr) => coordStr.split(',').map((coord) => parseInt(coord)) as Coord);

    slidingWindowOfSize2(coords).forEach(([coord1, coord2]) => {
      allCoordsBetween(coord1, coord2).forEach(([x, y]) => {
        if (!grid[x]) {
          grid[x] = [];
        }

        grid[x][y] = Cell.Rock;
      });
    });
  });

  return grid;
}

function isSolid(cell: Cell) {
  return cell === Cell.Rock || cell === Cell.Sand;
}

function dropGrain(grid: Grid, from: Coord, maxY: number): Coord {
  let [x, y] = from;

  while (!(isSolid(grid[x]?.[y + 1]) && isSolid(grid[x - 1]?.[y + 1]) && isSolid(grid[x + 1]?.[y + 1]))) {
    [x, y] = !isSolid(grid[x]?.[y + 1]) ? [x, y + 1] : !isSolid(grid[x - 1]?.[y + 1]) ? [x - 1, y + 1] : [x + 1, y + 1];
  }

  grid[x][y] = Cell.Sand;
  return [x, y];
}

function run() {
  const input = readFileSync(path.resolve(__dirname, './input.txt'), { encoding: 'utf8' });
  const sandStart: Coord = [500, 0];

  const grid = buildGridFromInput(input);
  const maxY = Math.max(...grid.map((row) => row.length).filter((x) => typeof x === 'number'));

  console.log(`Max grains: ${(maxY * maxY) / 2}`);

  for (let x = 0; x <= 1000; x++) {
    grid[x] = grid[x] || [];
    grid[x][maxY + 1] = Cell.Rock;
  }

  let part1Logged = false;
  while (true) {
    const [x, y] = dropGrain(grid, sandStart, maxY);

    // part 1
    if (y >= maxY && !part1Logged) {
      const settledSands = grid.flat().filter((cell) => cell === Cell.Sand);
      console.log(settledSands.length - 1);
      part1Logged = true;
    }

    if (x === sandStart[0] && y === sandStart[1]) {
      const settledSands = grid.flat().filter((cell) => cell === Cell.Sand);
      console.log(settledSands.length);
      break;
    }
  }
}

run();
