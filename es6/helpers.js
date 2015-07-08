


export function fuzzyBinarySearch(elements, value, accessor) {
  let lo = 0,
      hi = elements.length - 1,
      best = null,
      bestValue = null;

  while (lo <= hi) {
    let mid = (lo + hi) >>> 1;
    let midValue = accessor(elements[mid]);
    if (bestValue === null || Math.abs(midValue - value) < Math.abs(bestValue - value)) {
      best = mid;
      bestValue = midValue;
    }
    if (midValue < value) { lo = mid + 1; continue; }
    if (midValue > value) { hi = mid - 1; continue; }
    break;
  }
  return best;
}
