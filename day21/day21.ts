import { readFileSync } from 'fs';
import * as path from 'path';

function sum(a: number, b: number): number {
  return a + b;
}

function minus(a: number, b: number): number {
  return a - b;
}

function mult(a: number, b: number): number {
  return a * b;
}

function div(a: number, b: number): number {
  return a / b;
}

function memoize<T>(fn: (arg: string) => T): (arg: string) => T {
  const answers: Record<string, T> = {};

  return (arg: string) => {
    if (answers[arg]) {
      return answers[arg];
    }
    const ans = fn(arg);
    answers[arg] = ans;
    return ans;
  };
}

enum Op {
  Sum = '+',
  Minus = '-',
  Mult = '*',
  Div = '/',
}

const ops = {
  [Op.Sum]: sum,
  [Op.Minus]: minus,
  [Op.Mult]: mult,
  [Op.Div]: div,
};

type Puzzle = {
  key: string;
  arg1: string;
  arg2: string;
  op: Op;
};

function part1() {
  const input = readFileSync(path.resolve(__dirname, './input.txt'), { encoding: 'utf8' });

  const known: Map<string, number> = new Map();
  const puzzles: Puzzle[] = [];

  input.split('\n').map((line) => {
    const [key, value] = line.split(': ');
    if (/^\d+$/.test(value)) {
      known.set(key, parseInt(value));
    } else {
      const [arg1, op, arg2] = value.split(' ');
      puzzles.push({ key, arg1, arg2, op: op as Op });
    }
  });

  while (puzzles.length) {
    puzzles.forEach(({ key, arg1, arg2, op }, index) => {
      const number1 = known.get(arg1);
      const number2 = known.get(arg2);
      if (number1 && number2) {
        const answer = ops[op](number1, number2);
        known.set(key, answer);

        puzzles.splice(index, 1);
      }
    });
  }

  console.log(known.get('root'));
}

function part2() {
  const input = readFileSync(path.resolve(__dirname, './input.txt'), { encoding: 'utf8' });

  const known: Map<string, number> = new Map();
  const puzzles: Puzzle[] = [];
  let root: { arg1: string; arg2: string };

  input.split('\n').forEach((line) => {
    const [key, value] = line.split(': ');
    if (key == 'humn') {
      return;
    }
    if (/^\d+$/.test(value)) {
      known.set(key, parseInt(value));
    } else {
      const [arg1, op, arg2] = value.split(' ');

      if (key === 'root') {
        root = { arg1, arg2 };
      }

      puzzles.push({ key, arg1, arg2, op: op as Op });
    }
  });

  let numPuzzles = puzzles.length;

  // solve as many as possible
  while (true) {
    puzzles.forEach(({ key, arg1, arg2, op }, index) => {
      const number1 = known.get(arg1);
      const number2 = known.get(arg2);
      if (number1 && number2) {
        const answer = ops[op](number1, number2);
        known.set(key, answer);

        puzzles.splice(index, 1);
      }
    });

    if (numPuzzles === puzzles.length) {
      break;
    }
    numPuzzles = puzzles.length;
  }

  if (!known.get(root!.arg1) && !known.get(root!.arg2)) {
    throw new Error('neither root args have a value');
  }
  if (known.get(root!.arg1)) {
    known.set(root!.arg2, known.get(root!.arg1)!);
  } else {
    known.set(root!.arg1, known.get(root!.arg2)!);
  }

  const valueOf = memoize((key: string): number => {
    const knownAnswer = known.get(key);
    if (knownAnswer) {
      return knownAnswer;
    }

    const p = puzzles.find((p) => p.arg1 === key || p.arg2 === key)!;

    if (p.arg1 === key) {
      switch (p.op) {
        case Op.Sum:
          return minus(valueOf(p.key), valueOf(p.arg2));
        case Op.Mult:
          return div(valueOf(p.key), valueOf(p.arg2));
        case Op.Minus:
          return sum(valueOf(p.key), valueOf(p.arg2));
        case Op.Div:
          return mult(valueOf(p.key), valueOf(p.arg2));
      }
    } else {
      switch (p.op) {
        case Op.Sum:
          return minus(valueOf(p.key), valueOf(p.arg1));
        case Op.Mult:
          return div(valueOf(p.key), valueOf(p.arg1));
        case Op.Minus:
          return minus(valueOf(p.arg1), valueOf(p.key));
        case Op.Div:
          return div(valueOf(p.arg1), valueOf(p.key));
      }
    }
  });

  const humn = valueOf('humn');

  console.log(humn);
}

part1();
part2();
