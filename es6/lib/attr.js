export function getTokenSet(el, attr, def = '') {
  const set = new Set();
  (el.getAttribute(attr) || def).split(' ').forEach(t => set.add(t));
  return set;
}



export function overrideOptions(el) {
  for (let option of el.attributes) {

  }
}