export function coerce(value, min, max) {
  return value > max ? max : (value < min ? min : value);
}

export function midpointTop(clientRect) {
  return clientRect.top + clientRect.height / 2;
}

export function midpointLeft(clientRect) {
  return clientRect.left + clientRect.width / 2;
}

export function distance(p1, p2) {
  return Math.sqrt(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2));
}