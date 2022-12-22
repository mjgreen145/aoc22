import { readFileSync } from 'fs';
import * as path from 'path';
import { repeatFn } from '../utils';

enum Cell {
  Open,
  Rock,
  Void,
}

enum Direction {
  Right = 0,
  Down = 1,
  Left = 2,
  Up = 3,
}

enum Turn {
  Left = 'L',
  Right = 'R',
}

const charToCell: Record<string, Cell> = {
  '.': Cell.Open,
  '#': Cell.Rock,
  ' ': Cell.Void,
};

function notVoid(cell: Cell | undefined): boolean {
  return cell === Cell.Rock || cell === Cell.Open;
}

function isVoid(cell: Cell | undefined): boolean {
  return cell === Cell.Void || cell === undefined;
}

class Grid {
  private cells: Cell[][];
  private currentPosition: { row: number; column: number; facing: Direction };

  constructor(input: string) {
    this.cells = input.split('\n').map((line) => line.split('').map((char) => charToCell[char]));
    this.currentPosition = { row: 0, column: this.cells[0].findIndex((c) => c === Cell.Open), facing: Direction.Right };
  }

  get position(): { row: number; column: number; facing: Direction } {
    return this.currentPosition;
  }

  cellAt(row: number, column: number): Cell | undefined {
    return this.cells[row]?.[column];
  }

  nextPosition(row: number, column: number, facing: Direction): { row: number; column: number } {
    const nextRow = row + (facing === Direction.Down ? 1 : facing === Direction.Up ? -1 : 0);
    const nextCol = column + (facing === Direction.Right ? 1 : facing === Direction.Left ? -1 : 0);

    const nextCell = this.cellAt(nextRow, nextCol);
    if (nextCell === Cell.Rock) {
      return { row, column }; // Can't move through rock.
    }
    if (nextCell === Cell.Open) {
      return { row: nextRow, column: nextCol }; // Move one space
    }

    let r = row;
    let c = column;

    while (true) {
      const nextR = r + (facing === Direction.Down ? -1 : facing === Direction.Up ? 1 : 0);
      const nextC = c + (facing === Direction.Right ? -1 : facing === Direction.Left ? 1 : 0);

      if (isVoid(this.cellAt(nextR, nextC))) {
        break;
      }
      r = nextR;
      c = nextC;
    }
    if (this.cellAt(r, c) === Cell.Rock) {
      return { row, column };
    }
    return { row: r, column: c };
  }

  move() {
    const { row, column, facing } = this.currentPosition;
    const nextPosition = this.nextPosition(row, column, facing);
    this.currentPosition = { ...nextPosition, facing };
  }

  turn(turnDir: Turn) {
    const dirs = [Direction.Right, Direction.Down, Direction.Left, Direction.Up];
    const currentIndex = dirs.indexOf(this.currentPosition.facing);
    const next = currentIndex + (turnDir === Turn.Right ? 1 : -1);
    this.currentPosition.facing = dirs[(next + dirs.length) % dirs.length];
  }
}

function run() {
  const input = readFileSync(path.resolve(__dirname, './input.txt'), { encoding: 'utf8' });
  const [gridTxt, instructionTxt] = input.split('\n\n');

  const instructions: (number | Turn)[] = instructionTxt
    .match(/(\d+[RL]?)/g)!
    .flatMap((x: string) =>
      x.endsWith('R') || x.endsWith('L') ? [parseInt(x.slice(0, -1)), x.slice(-1) as Turn] : parseInt(x),
    );

  const grid = new Grid(gridTxt);

  for (const i of instructions) {
    if (typeof i === 'number') {
      repeatFn(() => grid.move(), i);
    } else {
      grid.turn(i);
    }
  }

  const { row, column, facing } = grid.position;
  console.log(1000 * (row + 1) + 4 * (column + 1) + facing);
}

run();
