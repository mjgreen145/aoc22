import { readFileSync } from 'fs';
import * as path from 'path';

function last<T>(arr: T[]): T {
  return arr.slice(-1)[0];
}

function sum(a: number, b: number): number {
  return a + b;
}

function run() {
  const input = readFileSync(path.resolve(__dirname, './input.txt'), { encoding: 'utf8' });

  const cmds = input.split('\n');

  const startingRegisterValues: number[] = [1];

  const registerValues = cmds.reduce<number[]>((registerValues, cmd) => {
    const currentValue = last(registerValues);

    if (cmd === 'noop') {
      return [...registerValues, currentValue];
    }

    if (cmd.startsWith('addx')) {
      const x = parseInt(cmd.split(' ')[1]);
      return [...registerValues, currentValue, currentValue + x];
    }

    return registerValues;
  }, startingRegisterValues);

  const interestingCycles = [20, 60, 100, 140, 180, 220];
  console.log(interestingCycles.map((cycleNum) => registerValues[cycleNum - 1] * cycleNum).reduce(sum, 0));

  // part 2

  const output = registerValues.reduce<string>((output, value, index) => {
    const rowPosition = index % 40;
    console.log(rowPosition, value);
    const newOutput = [value - 1, value, value + 1].includes(rowPosition) ? `${output}#` : `${output}.`;

    return (index + 1) % 40 === 0 ? `${newOutput}\n` : newOutput;
  }, '');

  console.log(output);
}

run();
