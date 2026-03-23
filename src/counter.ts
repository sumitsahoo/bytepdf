export function setupCounter(element: HTMLButtonElement): void {
  let count = 0;
  const setCounter = (c: number) => {
    count = c;
    element.innerHTML = `count is ${count}`;
  };
  element.addEventListener("click", () => setCounter(count + 1));
  setCounter(0);
}
