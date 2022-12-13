import { readFileSync } from 'fs';
import * as path from 'path';

type Move = 'U' | 'D' | 'L' | 'R';

function repeat<T>(thing: T, times: number): T[] {
  return Array(times).fill(thing);
}

function last<T>(arr: T[]): T {
  return arr.slice(-1)[0];
}

type Coordinate = { x: number; y: number };

function processMove(rope: Coordinate[], move: Move): Coordinate[] {
  const [head, ...tails] = rope;
  let nextHead;
  switch (move) {
    case 'U':
      nextHead = { x: head.x, y: head.y + 1 };
      break;
    case 'D':
      nextHead = { x: head.x, y: head.y - 1 };
      break;
    case 'R':
      nextHead = { x: head.x + 1, y: head.y };
      break;
    case 'L':
      nextHead = { x: head.x - 1, y: head.y };
      break;
  }

  return tails.reduce<Coordinate[]>(
    (rope, tail) => {
      return [...rope, newTailPosition(last(rope), tail)];
    },
    [nextHead],
  );
}

function tooFarApartX(head: Coordinate, tail: Coordinate): boolean {
  return Math.abs(head.x - tail.x) > 1;
}

function tooFarApartY(head: Coordinate, tail: Coordinate): boolean {
  return Math.abs(head.y - tail.y) > 1;
}

function newTailPosition(head: Coordinate, tail: Coordinate): Coordinate {
  if (tooFarApartX(head, tail) && tooFarApartY(head, tail)) {
    return {
      x: head.x + (head.x > tail.x ? -1 : 1),
      y: head.y + (head.y > tail.y ? -1 : 1),
    };
  }

  if (tooFarApartX(head, tail)) {
    return head.x > tail.x ? { x: head.x - 1, y: head.y } : { x: head.x + 1, y: head.y };
  }
  if (tooFarApartY(head, tail)) {
    return head.y > tail.y ? { x: head.x, y: head.y - 1 } : { x: head.x, y: head.y + 1 };
  }

  return tail;
}

function coordToString(coord: Coordinate): string {
  return `${coord.x}-${coord.y}`;
}

function run() {
  const input = readFileSync(path.resolve(__dirname, './input.txt'), { encoding: 'utf8' });

  const moves = input
    .split('\n')
    .map((line) => line.split(' '))
    .flatMap(([move, times]) => repeat(move as Move, parseInt(times)));

  const start: Coordinate = { x: 0, y: 0 };
  const ropeLength2 = repeat(start, 2);
  const ropeLength10 = repeat(start, 10);

  // part 1
  const tailLocationsLength2 = new Set();
  moves.reduce<Coordinate[]>((rope, move) => {
    const newRope = processMove(rope, move);
    tailLocationsLength2.add(coordToString(last(newRope)));
    return newRope;
  }, ropeLength2);

  console.log(tailLocationsLength2.size);

  // part 2
  const tailLocationsLength10 = new Set();
  moves.reduce<Coordinate[]>((rope, move) => {
    const newRope = processMove(rope, move);
    tailLocationsLength10.add(coordToString(last(newRope)));
    return newRope;
  }, ropeLength10);

  console.log(tailLocationsLength10.size);
}

run();
