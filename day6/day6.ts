import { readFileSync } from 'fs';
import * as path from 'path';

async function run() {
  const text = readFileSync(path.resolve(__dirname, './input.txt'), { encoding: 'utf8' });

  for (let i = 4; i < text.length; i++) {
    if (new Set([...text.substring(i - 4, i)]).size === 4) {
      console.log(`Answer: ${i}`);
      break;
    }
  }

  for (let i = 14; i < text.length; i++) {
    if (new Set([...text.substring(i - 14, i)]).size === 14) {
      console.log(`Answer: ${i}`);
      break;
    }
  }
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
