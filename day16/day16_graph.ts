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
};

type ValveNode = {
  name: string;
  flowRate: number;
  tunnels: { name: string; distance: number }[];
};

type MarkedValve = Valve & { distance?: number };

function shortestPathBetween(
  start: string,
  end: string,
  allValves: MarkedValve[],
  stepsTaken: number = 0,
): number | null {
  if (start === end) {
    return stepsTaken;
  }

  const startValve = allValves.find((v) => v.name === start)!;
  startValve.distance = stepsTaken;

  const reachableValves = allValves.filter((v) => startValve.tunnels.includes(v.name));
  const worthExploring = reachableValves.filter((v) => v.distance === undefined || v.distance > stepsTaken + 1);

  if (!worthExploring.length) {
    return null;
  }

  const results = worthExploring
    .map((target) => shortestPathBetween(target.name, end, allValves, stepsTaken + 1))
    .filter(notNil);

  return results.length ? Math.min(...results) : null;
}

function buildSimplifiedValveGraph(valves: Valve[], start: string): Map<string, ValveNode> {
  const valvesToKeep = valves.filter((v) => v.flowRate > 0 || v.name === start);

  const nodes = valvesToKeep.map((valve) => ({
    name: valve.name,
    flowRate: valve.flowRate,
    tunnels: valvesToKeep
      .filter((v) => v.name !== valve.name)
      .map((target) => ({
        name: target.name,
        distance: shortestPathBetween(valve.name, target.name, JSON.parse(JSON.stringify(valves))),
      })),
  }));

  const graph = new Map();
  nodes.forEach((node) => graph.set(node.name, node));
  return graph;
}

function processMinute(
  graph: Map<string, ValveNode>,
  currentLocation: string,
  minutesLeft: number,
  currentlyOpen: { name: string; pressure: number }[],
): number {
  if (minutesLeft === 0) {
    return currentlyOpen.map(({ pressure }) => pressure).reduce(sum, 0);
  }
  if (currentlyOpen.length === graph.size) {
    // All valves open, no need to continue.
    return currentlyOpen.map(({ pressure }) => pressure).reduce(sum, 0);
  }

  const currentValve = graph.get(currentLocation)!;
  const tryOpenValve =
    !currentlyOpen.find((openValve) => openValve.name === currentLocation) && currentValve.flowRate > 0;

  const options = currentValve.tunnels
    .filter((target) => target.distance < minutesLeft)
    .map((newLocation) => processMinute(graph, newLocation.name, minutesLeft - newLocation.distance, currentlyOpen));

  if (!tryOpenValve) {
    options.push(
      processMinute(graph, currentLocation, minutesLeft - 1, [
        ...currentlyOpen,
        { name: currentLocation, pressure: currentValve.flowRate * (minutesLeft - 1) },
      ]),
    );
  }

  return Math.max(...options);
}

function run() {
  const input = readFileSync(path.resolve(__dirname, './input.txt'), { encoding: 'utf8' });

  const valveArr: Valve[] = [];

  input.split('\n').map((line) => {
    const [, valveName] = line.match(/Valve ([A-Z]+) has/)!;
    const [, flowRateStr] = line.match(/flow rate=(\d+)/)!;
    const [, tunnelsStr] = line.match(/to valves? (.*)/)!;

    const valve = {
      name: valveName,
      flowRate: parseInt(flowRateStr),
      tunnels: tunnelsStr.split(', '),
    };
    valveArr.push(valve);
  });

  const start = 'AA';

  const graph = buildSimplifiedValveGraph(valveArr, start);

  const result = processMinute(graph, 'AA', 5, []);

  console.log(result);
}

run();
