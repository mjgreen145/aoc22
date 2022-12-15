import { readFileSync } from 'fs';
import * as path from 'path';

function first<T>(arr: T[]): T | null {
  return arr[0];
}

function last<T>(arr: T[]): T {
  return arr.slice(-1)[0];
}

function sum(a: BigInt, b: BigInt): BigInt {
  // @ts-ignore
  return a + b;
}

function mult(a: BigInt, b: BigInt): BigInt {
  // @ts-ignore
  return a * b;
}

function double(x: BigInt): BigInt {
  // @ts-ignore
  return x + x;
}

function square(x: BigInt): BigInt {
  // @ts-ignore
  return x * x;
}

function divisibleBy(divisor: BigInt, num: BigInt): boolean {
  // @ts-ignore
  return num % divisor === 0n;
}

interface Operation {
  (item: BigInt): BigInt;
}

interface Test {
  (item: BigInt): boolean;
}

type Action = {
  test: Test;
  trueTarget: Monkey;
  falseTarget: Monkey;
};

class Monkey {
  private items: BigInt[] = [];
  private operation: Operation | null = null;
  private action: Action | null = null;
  public numInspections: number = 0;

  constructor(private _commonDivisor: BigInt) {}

  getItems() {
    return this.items;
  }

  setItems(items: BigInt[]) {
    this.items = items;
  }

  setOperation(op: Operation) {
    this.operation = op;
  }

  setAction(action: Action) {
    this.action = action;
  }

  addItem(item: BigInt) {
    // @ts-ignore
    const divided: BigInt = item % this._commonDivisor;
    this.items = [...this.items, divided];
  }

  hasItems(): boolean {
    return this.items.length > 0;
  }

  processItem() {
    if (this.operation && this.action) {
      const item = this.items.shift();
      if (item === undefined) return;

      this.numInspections++;
      const newItem = this.operation(item);
      const target = this.action.test(newItem) ? this.action.trueTarget : this.action.falseTarget;

      target.addItem(newItem);
    } else {
      throw new Error('monkey not initialised');
    }
  }
}

function initMonkeysFromInput(monkeys: Monkey[], input: string) {
  input.split('\n\n').map((lines: string, index: number) => {
    const startingItems = lines
      .match(/Starting items: (.*)/)![1]
      .split(', ')
      .map((item) => BigInt(item));

    const operation = parseOperationText(lines.match(/Operation: new = (.*)/)![1]);

    const testDivisor = parseInt(lines.match(/Test: divisible by (\d+)/)![1]);

    const trueTargetNum = parseInt(lines.match(/If true: throw to monkey (\d+)/)![1]);
    const falseTargetNum = parseInt(lines.match(/If false: throw to monkey (\d+)/)![1]);

    monkeys[index].setItems(startingItems);
    monkeys[index].setOperation(operation);
    monkeys[index].setAction({
      test: divisibleBy.bind(null, BigInt(testDivisor)),
      trueTarget: monkeys[trueTargetNum],
      falseTarget: monkeys[falseTargetNum],
    });
  });
}

function parseOperationText(operationText: string): Operation {
  const [input1, op, input2] = operationText.split(' ');
  if (input1 !== 'old') {
    throw new Error(`Unsupported operation: ${operationText}`);
  }

  switch (true) {
    case op === '+': {
      if (input2 === 'old') return double;
      return sum.bind(null, BigInt(input2));
    }
    case op === '*': {
      if (input2 === 'old') return square;
      return mult.bind(null, BigInt(input2));
    }
    default:
      throw new Error(`Unrecognised operation: ${op}`);
  }
}

function run() {
  const input = readFileSync(path.resolve(__dirname, './input.txt'), { encoding: 'utf8' });

  const matches = input.match(/Monkey \d+:/g);
  if (!matches) {
    throw new Error('no monkeys found');
  }

  const allDivisors = input.match(/Test: divisible by (\d+)/g)!.map((text) => parseInt(last(text.split(' '))));

  const monkeys: Monkey[] = Array(matches.length)
    .fill(null)
    .map((_) => new Monkey(BigInt(allDivisors.reduce((product, num) => product * num, 1))));

  initMonkeysFromInput(monkeys, input);
  console.log(monkeys);

  const rounds = 10000;

  for (let i = 0; i < rounds; i++) {
    console.log(`Round ${i + 1}`);
    monkeys.forEach((monkey) => {
      while (monkey.hasItems()) {
        monkey.processItem();
      }
    });
  }

  console.log(monkeys.map((m) => m.getItems()));
  console.log(monkeys.map((m) => m.numInspections));
  const [one, two] = monkeys
    .map((m) => m.numInspections)
    .sort((a, b) => b - a)
    .slice(0, 2);

  console.log(one * two);
}

run();
