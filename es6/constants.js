export const acceptsAttribute      = 'data-drag-accepts';
export const canvasAttribute       = 'data-drag-canvas';
export const sortableAttribute     = 'data-drag-sortable';
export const droppableAttribute    = 'data-drag-droppable';
export const snapInBoundsAttribute = 'data-drag-snap-in-bounds';
export const snapToGridAttribute   = 'data-drag-snap-to-grid';
export const scrollableAttribute   = 'data-drag-scrollable';
export const disabledAttribute     = 'data-drag-disabled';

export const draggableSelector  = '[data-draggable],[data-drag-sortable] > *,[data-drag-canvas] > *';
export const handleSelector     = '[data-drag-handle]';
export const sortableSelector   = `[${sortableAttribute}]`;
export const canvasSelector     = `[${canvasAttribute}]`;
export const valueSelector      = '[data-drag-value]';
export const droppableSelector  = `[${droppableAttribute}]`;
export const dropZoneSelector   = '[data-drag-sortable],[data-drag-droppable],[data-drag-canvas]';
export const disabledSelector   = `[${disabledAttribute}]`;
export const scrollableSelector = `[${scrollableAttribute}]`;
