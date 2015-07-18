export function contains(rect, xy) {
  return xy[0] >= rect.left && xy[0] <= rect.right
      && xy[1] >= rect.top && xy[1] <= rect.bottom;
}
