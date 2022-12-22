export function repeatFn(fn: Function, times: number) {
  for (let i = 0; i < times; i++) {
    fn();
  }
}