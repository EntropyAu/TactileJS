module Tactile.Geometry {
  export function rectContains(rect:ClientRect, xy:[number,number]):boolean {
    return xy[0] >= rect.left && xy[0] <= rect.right
        && xy[1] >= rect.top && xy[1] <= rect.bottom;
  }
}
