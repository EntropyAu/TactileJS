export function getTokenSet(el, attr) {
  const set = new Set();
  (el.getAttribute(attr) || '').split(' ').forEach(t => set.add(t));
  return set;
}



export function overrideOptions(el) {
  for (let option of el.attributes) {

  }
}