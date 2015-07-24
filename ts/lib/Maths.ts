module Tactile.Maths {
  export function coerce(value:number, min:number, max:number):number {
    return value > max ? max : (value < min ? min : value);
  }
  export function scale(value:number, domain:[number,number], range:[number,number]):number {
    return (value - domain[0]) / (domain[1] - domain[0]) * (range[1] - range[0]) + range[0];
  }
}
