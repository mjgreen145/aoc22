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

type Graph = Record<string, ValveNode>;

// Doesn't return the same item together
function pairCombinations<T>(arr: T[]): T[][] {
  return arr.flatMap((x, i) => arr.slice(i + 1).map((y) => [x, y]));
}

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

function removeNode(graph: Graph, node: string): Graph {
  const { [node]: omit, ...rest } = graph;

  return Object.fromEntries(
    Object.entries(rest).map(([name, valve]) => {
      return [name, { ...valve, tunnels: valve.tunnels.filter((t) => t.name !== node) }];
    }),
  );
}

function buildFullyConnectedGraph(valves: Valve[], start: string): Graph {
  const valvesToKeep = valves.filter((v) => v.flowRate > 0 || v.name === start);

  const nodes: ValveNode[] = valvesToKeep.map((valve) => ({
    name: valve.name,
    flowRate: valve.flowRate,
    tunnels: valvesToKeep
      .filter((v) => v.name !== valve.name)
      .map((target) => ({
        name: target.name,
        distance: shortestPathBetween(valve.name, target.name, JSON.parse(JSON.stringify(valves)))!,
      })),
  }));

  const graph: Graph = {};
  nodes.forEach((node) => (graph[node.name] = node));
  return graph;
}

function walkGraph(
  graph: Graph,
  current: string,
  minutesLeft: number,
  pressureReleased: number,
  openValves: string[],
): number {
  if (minutesLeft <= 1) {
    return pressureReleased;
  }

  if (!openValves.includes(current) && graph[current].flowRate > 0) {
    return walkGraph(graph, current, minutesLeft - 1, pressureReleased + graph[current].flowRate * (minutesLeft - 1), [
      ...openValves,
      current,
    ]);
  }

  if (!graph[current].tunnels.length) {
    return pressureReleased;
  }

  return Math.max(
    ...graph[current].tunnels.map((target) =>
      walkGraph(removeNode(graph, current), target.name, minutesLeft - target.distance, pressureReleased, openValves),
    ),
  );
}

function walkGraph2People(
  graph: Graph,
  person1: { current: string; minutesLeft: number },
  person2: { current: string; minutesLeft: number },
  pressureReleased: number,
  openValves: string[],
): number {
  if (person1.minutesLeft <= 1 && person2.minutesLeft <= 1) {
    return pressureReleased;
  }

  if (person1.current === person2.current) {
    throw new Error(`Both people are at the same place: ${JSON.stringify(person1)}, ${JSON.stringify(person2)}`);
  }

  // Must open valves if you are at the location
  if (!openValves.includes(person1.current)) {
    return walkGraph2People(
      graph,
      { current: person1.current, minutesLeft: person1.minutesLeft - 1 },
      person2,
      pressureReleased + graph[person1.current].flowRate * (person1.minutesLeft - 1),
      [...openValves, person1.current],
    );
  }

  if (!openValves.includes(person2.current)) {
    return walkGraph2People(
      graph,
      person1,
      { current: person2.current, minutesLeft: person2.minutesLeft - 1 },
      pressureReleased + graph[person2.current].flowRate * (person2.minutesLeft - 1),
      [...openValves, person2.current],
    );
  }

  // Otherwise, determine next available moves (can't go to same location as other person)
  const options = [
    ...graph[person1.current].tunnels
      .filter((t) => t.name !== person2.current && t.distance < person1.minutesLeft)
      .map((target) =>
        walkGraph2People(
          removeNode(graph, person1.current),
          { current: target.name, minutesLeft: person1.minutesLeft - target.distance },
          person2,
          pressureReleased,
          openValves,
        ),
      ),
    ...graph[person2.current].tunnels
      .filter((t) => t.name !== person1.current && t.distance < person2.minutesLeft)
      .map((target) =>
        walkGraph2People(
          removeNode(graph, person2.current),
          person1,
          { current: target.name, minutesLeft: person2.minutesLeft - target.distance },
          pressureReleased,
          openValves,
        ),
      ),
  ];

  return Math.max(pressureReleased, ...options);
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
  const graph = buildFullyConnectedGraph(valveArr, start);

  // part 1
  // const result = walkGraph(graph, start, 30, 0, []);
  // console.log('part 1:', result);

  // part 2

  // Both people start at the same place, but must go to different valves to open..
  // Start has no flow rate, so don't bother opening it.
  const startOptions = pairCombinations(graph[start].tunnels);

  const result2 = Math.max(
    ...startOptions.map(([start1, start2], index) => {
      console.log(`Doing option ${index + 1} of ${startOptions.length}`);
      return walkGraph2People(
        removeNode(graph, start),
        { current: start1.name, minutesLeft: 26 - start1.distance },
        { current: start2.name, minutesLeft: 26 - start2.distance },
        0,
        [],
      );
    }),
  );
  console.log('part 2:', result2);
}

run();
