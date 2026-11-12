/**
 * Roving focus for a vertical list of actions. Same keys as a Radix accordion:
 * ArrowUp, ArrowDown, Home, End. No React here, so the movement is unit-tested on its own.
 * Enter and Space are not handled: they activate the focused button.
 */

export function nextEnabledIndex(
  current: number,
  count: number,
  key: string,
  isDisabled: (index: number) => boolean = () => false,
): number | null {
  if (count <= 0) return null;

  const enabled = (index: number) => index >= 0 && index < count && !isDisabled(index);

  if (key === "Home" || key === "End") {
    const start = key === "Home" ? 0 : count - 1;
    const step = key === "Home" ? 1 : -1;
    for (let index = start; index >= 0 && index < count; index += step) {
      if (enabled(index)) return index;
    }
    return null;
  }

  const delta = key === "ArrowDown" ? 1 : key === "ArrowUp" ? -1 : 0;
  if (delta === 0) return null;

  for (let step = 1; step <= count; step += 1) {
    const index = mod(current + delta * step, count);
    if (enabled(index)) return index;
  }
  return null;
}

function mod(value: number, count: number): number {
  return ((value % count) + count) % count;
}
