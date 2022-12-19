import { readFileSync } from 'fs';
import * as path from 'path';

type Location = { x: number; y: number };

type Range = [number, number];

type Sensor = {
  location: Location;
  closestBeacon: Location;
  distance: number;
};

function sum(a: number, b: number): number {
  return a + b;
}

function isRange(x: any): x is Range {
  return Array.isArray(x) && x.length === 2;
}

function manhattenDistance(location1: Location, location2: Location): number {
  return Math.abs(location1.x - location2.x) + Math.abs(location1.y - location2.y);
}

function seenRange(sensor: Sensor, row: number): Range | null {
  const { location, distance } = sensor;

  const distanceFromRow = Math.abs(location.y - row);
  const rowDistanceFromSensor = distance - distanceFromRow;

  if (rowDistanceFromSensor < 0) {
    return null;
  }

  return [location.x - rowDistanceFromSensor, location.x + rowDistanceFromSensor];
}

function combineRanges(ranges: Range[]): Range[] {
  return [...ranges]
    .sort(([a], [b]) => a - b)
    .reduce<Range[]>((combinedRanges, range) => {
      if (combinedRanges.length === 0) {
        return [range];
      }

      const [lastStart, lastEnd] = combinedRanges.slice(-1)[0];
      const [start, end] = range;
      if (start > lastEnd + 1) {
        return [...combinedRanges, range];
      }
      return combinedRanges.slice(0, -1).concat([[lastStart, Math.max(lastEnd, end)]]);
    }, []);
}

function run() {
  const input = readFileSync(path.resolve(__dirname, './input.txt'), { encoding: 'utf8' });

  const sensors: Sensor[] = input.split('\n').map((line) => {
    const [sensorTxt, beaconTxt] = line.split(':');
    const [, sensorX] = sensorTxt.match(/x=([\d-]+)/)!;
    const [, sensorY] = sensorTxt.match(/y=([\d-]+)/)!;
    const [, beaconX] = beaconTxt.match(/x=([\d-]+)/)!;
    const [, beaconY] = beaconTxt.match(/y=([\d-]+)/)!;

    const sensor = { x: parseInt(sensorX), y: parseInt(sensorY) };
    const beacon = { x: parseInt(beaconX), y: parseInt(beaconY) };
    return {
      location: sensor,
      closestBeacon: beacon,
      distance: manhattenDistance(sensor, beacon),
    };
  });

  const interestingRow = 2000000;

  const numSeenOnRow = combineRanges(sensors.map((sensor) => seenRange(sensor, interestingRow)).filter(isRange))
    .map(([start, end]) => end - start + 1)
    .reduce(sum, 0);

  const numBeaconsOnRow = new Set(
    sensors
      .map((s) => s.closestBeacon)
      .filter((beacon) => beacon.y === interestingRow)
      .map((beacon) => beacon.x),
  );

  console.log(numSeenOnRow - numBeaconsOnRow.size);

  // part 2
  const MIN = 0;
  const MAX = 4000000;

  for (let y = MIN; y < MAX; y++) {
    const seenRanges = combineRanges(sensors.map((sensor) => seenRange(sensor, y)).filter(isRange));
    if (seenRanges.length > 1) {
      const x = seenRanges[0][1] + 1;
      console.log('Part 2:', x * 4000000 + y);
      break;
    }
    const [start, end] = seenRanges[0];
    if (start > MIN || end < MAX) {
      console.log(seenRanges, y);
    }
  }
}

run();
