import { readFileSync } from 'fs';
import * as path from 'path';

type Packet = Array<number | Packet>;

function sum(a: number, b: number): number {
  return a + b;
}

function isNil(x: any): boolean {
  return x === undefined || x === null;
}

function correctOrder(leftPacket: Packet, rightPacket: Packet): boolean | null {
  const [left, ...restLeft] = leftPacket;
  const [right, ...restRight] = rightPacket;

  if (isNil(left) && isNil(right)) {
    return null; // BUG
  }
  if (isNil(left)) return true;
  if (isNil(right)) return false;

  if (typeof left === 'number' && typeof right === 'number') {
    if (left === right) return correctOrder(restLeft, restRight);
    return left < right;
  }

  const leftAsList = Array.isArray(left) ? left : [left];
  const rightAsList = Array.isArray(right) ? right : [right];

  const result = correctOrder(leftAsList, rightAsList);
  if (result === null) {
    return correctOrder(restLeft, restRight);
  }
  return result;
}

function run() {
  const input = readFileSync(path.resolve(__dirname, './input.txt'), { encoding: 'utf8' });

  // part 1
  const packetPairs = input
    .split('\n\n')
    .map((pair) => pair.split('\n').map((packetString) => JSON.parse(packetString) as Packet));

  const total = packetPairs
    .map(([left, right], index) => {
      return { correct: correctOrder(left, right), index: index + 1 };
    })
    .filter((result) => result.correct)
    .map((result) => result.index)
    .reduce(sum, 0);

  console.log(total);

  // part 2
  const decoderPackets = [[[2]], [[6]]];

  const packets = input
    .split('\n')
    .filter((line) => line)
    .map((packetString) => JSON.parse(packetString) as Packet)
    .concat(decoderPackets);

  packets.sort((a, b) => {
    const result = correctOrder(a, b);
    if (result === null) return 0;
    return result ? -1 : 1;
  });

  const decoder1Index = packets.findIndex(packet => packet === decoderPackets[0]) + 1;
  const decoder2Index = packets.findIndex(packet => packet === decoderPackets[1]) + 1;

  console.log(decoder1Index * decoder2Index);
}

run();
