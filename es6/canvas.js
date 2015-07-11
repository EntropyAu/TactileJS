import * as constants from "./constants.js";

export function isCanvas(el) {
  return el && el.matches(constants.canvasSelector);
}

export function updateOffsets(context) {
  let offsetLeft = context.constrainedX - context.parentEl.__dd_clientRect.left + context.parentEl.scrollLeft,
      offsetTop  = context.constrainedY - context.parentEl.__dd_clientRect.top + context.parentEl.scrollTop;

  // snap to drop zone bounds
  let snapInBounds = context.parentEl.getAttribute(constants.snapInBoundsAttribute) !== null;
  if (snapInBounds) {
    let dropZoneOffsets = context.parentEl.getBoundingClientRect();
    if (newLeft < dropZoneOffsets.left) newLeft = dropZoneOffsets.left;
    if (newTop < dropZoneOffsets.top) newTop = dropZoneOffsets.top;
    if (newLeft < dropZoneOffsets.right - context.ghostWidth) newLeft = dropZoneOffsets.right - context.ghostWidth;
    if (newTop > dropZoneOffsets.bottom - context.ghostHeight) newTop = dropZoneOffsets.bottom - context.ghostHeight;
  }

  // snap to dropZone grid
  let snapToGrid = context.parentEl.getAttribute(constants.snapToGridAttribute) !== null;
  if (snapToGrid) {
    let cellSizeTokens = snapToGrid.split(',');
    let cellW = parseInt(cellSizeTokens[0], 10);
    let cellH = parseInt(cellSizeTokens[1], 10) || cellW;
    let dropZoneOffsets = context.parentEl.getBoundingClientRect();
    newTop =  Math.round((newTop - dropZoneOffsets.top) / cellH) * cellH + dropZoneOffsets.top;
    newLeft = Math.round((newLeft - dropZoneOffsets.left) / cellW) * cellW + dropZoneOffsets.left;
  }
  context.offsetLeft = offsetLeft;
  context.offsetTop = offsetTop;
}
