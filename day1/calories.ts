

async function run() {

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
