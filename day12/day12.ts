import { readFileSync } from 'fs';
import * as path from 'path';

const elevations = 'abcdefghijklmnopqrstuvwxyz';

type Position = {
  x: number;
  y: number;
  elevation: number;
  stepsToGoal: number;
};

type Grid = Position[][];

function generateGrid(input: string): { grid: Grid; start: Position; goal: Position } {
  let start: Position | null = null;
  let goal: Position | null = null;

  const grid = input.split('\n').map((line, y) => {
    return line.split('').map((char, x) => {
      if (char === 'S') {
        start = { elevation: elevations.indexOf('a'), stepsToGoal: Infinity, x, y };
        return start;
      }
      if (char === 'E') {
        goal = { elevation: elevations.indexOf('z'), stepsToGoal: Infinity, x, y };
        return goal;
      }
      return { elevation: elevations.indexOf(char), stepsToGoal: Infinity, x, y };
    });
  });

  if (goal && start) {
    return { grid, goal, start };
  }
  throw new Error('Failed to find both start and goal of grid');
}

function evaluatePosition(position: Position, currentSteps: number, grid: Grid) {
  if (position.stepsToGoal <= currentSteps) {
    return;
  }
  position.stepsToGoal = currentSteps;

  [
    grid[position.y][position.x + 1],
    grid[position.y][position.x - 1],
    grid[position.y + 1]?.[position.x],
    grid[position.y - 1]?.[position.x],
  ]
    .filter((x) => x)
    .filter((nextPosition) => nextPosition.elevation >= position.elevation - 1)
    .forEach((pos) => evaluatePosition(pos, currentSteps + 1, grid));
}

function run() {
  const input = readFileSync(path.resolve(__dirname, './input.txt'), { encoding: 'utf8' });

  const { grid, start, goal } = generateGrid(input);

  evaluatePosition(goal, 0, grid);

  // part 1
  console.log(start.stepsToGoal);

  // part 2
  const shortestPath = Math.min(
    ...grid
      .flat()
      .filter((position) => position.elevation === elevations.indexOf('a'))
      .map((position) => position.stepsToGoal),
  );
  console.log(shortestPath);
}

run();
