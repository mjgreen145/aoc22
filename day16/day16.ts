import { readFileSync } from 'fs';
import * as path from 'path';

function sum(a: number, b: number): number {
  return a + b;
}

function notNil<T>(x: T | null | undefined): x is T {
  return x !== null && x !== undefined;
}

type Valve = {
  name: string;
  flowRate: number;
  tunnels: string[];
  maxPressures: Record<number, number>;
};

function run() {
  const input = readFileSync(path.resolve(__dirname, './input.txt'), { encoding: 'utf8' });

  const valveArr: Valve[] = input.split('\n').map((line) => {
    const [, valveName] = line.match(/Valve ([A-Z]+) has/)!;
    const [, flowRateStr] = line.match(/flow rate=(\d+)/)!;
    const [, tunnelsStr] = line.match(/to valves? (.*)/)!;

    const flowRate = parseInt(flowRateStr);
    return {
      name: valveName,
      flowRate: flowRate,
      tunnels: tunnelsStr.split(', '),
      maxPressures: { 0: 0, 1: 0, 2: flowRate }
    };
  });

  for (let i = 3; i <= 30; i++) {
    valveArr.forEach(valve => {
      // valve.maxPressures[i] = ???
    })
  }

  const start = 'AA';
}

run();
