import { readFileSync } from 'fs';
import * as path from 'path';

enum Move {
  Rock,
  Paper,
  Scissors,
}

const moveScores = {
  [Move.Rock]: 1,
  [Move.Paper]: 2,
  [Move.Scissors]: 3,
};

const stringToMoves: Record<string, Move> = {
  A: Move.Rock,
  B: Move.Paper,
  C: Move.Scissors,
  X: Move.Rock,
  Y: Move.Paper,
  Z: Move.Scissors,
};

enum Outcome {
  Win,
  Draw,
  Lose,
}

const stringToOutcome: Record<string, Outcome> = {
  X: Outcome.Lose,
  Y: Outcome.Draw,
  Z: Outcome.Win,
};

const gameScores = {
  [Outcome.Lose]: 0,
  [Outcome.Draw]: 3,
  [Outcome.Win]: 6,
};

function sum(x: number, y: number): number {
  return x + y;
}

function gameScore(myMove: Move, oppMove: Move): number {
  const diff = moveScores[myMove] - moveScores[oppMove];
  const result = (diff + 3) % 3;
  if (result === 1) return gameScores[Outcome.Win];
  if (result === 2) return gameScores[Outcome.Lose];
  return gameScores[Outcome.Draw];
}

function getMove(oppMove: Move, desiredOutcome: Outcome): Move {
  const moveOrder = [Move.Rock, Move.Paper, Move.Scissors];
  const oppMoveIndex = moveOrder.indexOf(oppMove);
  if (desiredOutcome === Outcome.Win) return moveOrder[(oppMoveIndex + 1) % 3];
  if (desiredOutcome === Outcome.Lose) return moveOrder[(oppMoveIndex + 2) % 3];
  return oppMove;
}

async function run() {
  const strategies = readFileSync(path.resolve(__dirname, './input.txt'), { encoding: 'utf8' });

  const moves = strategies.split('\n').map((line) => line.split(' '));

  // part 1
  const score = moves
    .map(
      ([oppMove, myMove]) =>
        gameScore(stringToMoves[myMove], stringToMoves[oppMove]) + moveScores[stringToMoves[myMove]],
    )
    .reduce(sum, 0);

  console.log(score);

  // part 2
  const score2 = moves
    .map(([oppMoveStr, result]) => {
      const oppMove = stringToMoves[oppMoveStr];
      const myMove = getMove(oppMove, stringToOutcome[result]);
      return gameScores[stringToOutcome[result]] + moveScores[myMove];
    })
    .reduce(sum, 0);

  console.log(score2);
}

(async () => {
  await run();
  console.log('Done');
  process.exit(0);
})()
  .catch((e: any) => {
    console.error(e);
    console.error(e.stack);
    process.exit(1);
  })
  .then(() => {
    process.exit(0);
  });
