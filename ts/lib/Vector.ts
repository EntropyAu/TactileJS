module Tactile.Vector {
  export function add(a:[number,number], b:[number,number]):[number,number] {
    return [a[0] + b[0], a[1] + b[1]];
  }

  export function subtract(a:[number,number], b:[number,number]):[number,number] {
    return [a[0] - b[0], a[1] - b[1]];
  }

  export function multiply(a:[number,number], b:[number,number]):[number,number] {
    return [a[0] * b[0], a[1] * b[1]];
  }

  export function multiplyScalar(a:[number,number], s:number):[number,number] {
    return [a[0] * s, a[1] * s];
  }

  export function divide(a:[number,number], b:[number,number]):[number,number] {
    return [a[0] / b[0], a[1] / b[1]];
  }

  export function divideScalar(v:[number,number], s:number):[number,number] {
    return [v[0] / s, v[1] / s];
  }

  export function lengthSquared(v:[number,number]):number {
    return v[0] * v[0] + v[1] * v[1];
  }

  export function length(v:[number,number]):number {
    return Math.sqrt(v[0] * v[0] + v[1] * v[1]);
  }

  export function equals(a:[number,number], b:[number,number]):boolean {
    return a && b && a[0] === b[0] && a[1] === b[1];
  }
}
