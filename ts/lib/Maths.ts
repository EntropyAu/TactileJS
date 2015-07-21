module Tactile.Maths {
  export function coerce(value:number, min:number, max:number):number {
    return value > max ? max : (value < min ? min : value);
  }
  export function scale(value:number, domain:[number,number], range:[number,number]):number {
    return (value - domain[0]) / (domain[1] - domain[0]) * (range[1] - range[0]) + range[0];
  }
  export function contains(rect:ClientRect, xy:[number,number]):boolean {
    return xy[0] >= rect.left && xy[0] <= rect.right
        && xy[1] >= rect.top && xy[1] <= rect.bottom;
  }
}
