import { readFileSync } from 'fs';
import * as path from 'path';

type Location = { x: number; y: number };

type Sensor = {
  location: Location;
  closestBeacon: Location;
  distance: number;
};

function manhattenDistance(location1: Location, location2: Location): number {
  return Math.abs(location1.x - location2.x) + Math.abs(location1.y - location2.y);
}

function markVisibleLocations(sensor: Sensor, grid: Grid) {
  const { location, distance } = sensor;

  for (let x = -distance; x <= distance; x++) {
    const remaining = distance - Math.abs(x);
    for (let y = -remaining; y <= remaining; y++) {
      grid.markLocation({ x: x + location.x, y: y + location.y }, Marker.Known);
    }
  }
}

enum Marker {
  Known = '#',
  Beacon = 'B',
}

class Grid {
  private minX: number;
  private maxX: number;
  private minY: number;
  private maxY: number;

  private offsetX: number;
  private offsetY: number;

  public grid: Marker[][] = [];

  constructor(sensors: Sensor[]) {
    const xs = sensors.map((sensor) => sensor.location.x);
    const ys = sensors.map((sensor) => sensor.location.y);
    const maxDistance = Math.max(...sensors.map((sensor) => sensor.distance));

    this.minX = Math.min(...xs) - maxDistance;
    this.maxX = Math.max(...xs) + maxDistance;
    this.minY = Math.min(...ys) - maxDistance;
    this.maxY = Math.max(...ys) + maxDistance;

    this.offsetX = Math.abs(Math.min(this.minX, 0));
    this.offsetY = Math.abs(Math.min(this.minY, 0));

    sensors.forEach((sensor) => {
      this.markLocation(sensor.closestBeacon, Marker.Beacon);
    });
  }

  markLocation(loc: Location, marker: Marker) {
    const x = loc.x + this.offsetX;
    const y = loc.y + this.offsetY;
    if (!this.grid[y]) {
      this.grid[y] = [];
    }

    if (this.grid[y][x] !== Marker.Beacon) {
      this.grid[y][x] = marker;
    }
  }

  rowAt(y: number): Marker[] {
    return this.grid[y + this.offsetY];
  }

  draw() {
    let str = '';
    for (let y = this.minY; y <= this.maxY; y++) {
      str = str + y.toString().padStart(2, '0') + ' ';
      for (let x = this.minX; x <= this.maxX; x++) {
        str = str + `${this.grid[y + this.offsetY]?.[x + this.offsetX] || '.'}`;
      }
      str = str + '\n';
    }
    console.log(str);
  }
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

  const grid = new Grid(sensors);

  sensors.forEach((sensor, i) => {
    markVisibleLocations(sensor, grid);
    console.log(`Processed sensor ${i + 1} of ${sensors.length}`);
  });

  const interestingRow = 2000000;

  console.log(grid.rowAt(interestingRow).filter((cell) => cell === Marker.Known).length);
}

run();
