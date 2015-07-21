module Tactile {


  export class Draggable {

    private static handleSelector = '[data-drag-handle]';
    private static draggableSelector = '[data-drag-draggable],[data-drag-sortable] > *,[data-drag-canvas] > *';
    private static handleOrDraggableSelector = '[data-drag-handle],[data-drag-draggable],[data-drag-sortable] > *,[data-drag-canvas] > *';

    static closest(el:HTMLElement):HTMLElement {
      el = Dom.closest(el, this.handleOrDraggableSelector);
      if (!el) return null;

      // if the pointer is over a handle element, ascend the DOM to find the
      // associated draggable item
      if (el.hasAttribute('data-drag-handle')) {
        el = Dom.closest(el, this.draggableSelector);
        return el;
      }

      // check all of the drag handles underneath this draggable element,
      // and make sure they all belong to other (child) draggables
      const handleEls = el.querySelectorAll(this.handleSelector);
      const numHandleEls = handleEls.length;
      for (let i = 0; i < numHandleEls; i++) {
        let handleEl = handleEls[i];
        if (Dom.closest(<HTMLElement>handleEl, this.draggableSelector) === el) {
          return null;
        }
      }

      return el;
    }


    static closestEnabled(el:HTMLElement):HTMLElement {
      el = this.closest(el);
      return el && !(el.hasAttribute('data-drag-disabled')
                    || el.parentElement && el.parentElement.hasAttribute('data-drag-disabled'))
            ? el
            : null;
    }



    el:HTMLElement;
    data:any;
    drag:Drag;
    tags:string[];
    originalParentEl:HTMLElement;
    originalIndex:number;
    originalSize:[number,number];
    originalOffset:[number,number];
    originalScale:[number,number];


    constructor(el:HTMLElement, drag:Drag) {
      this.el = el;
      this.drag = drag;
      this.originalParentEl = el.parentElement;
      this.originalIndex = Dom.indexOf(el);
      this.originalSize = [this.el.offsetWidth, this.el.offsetHeight];
      this.originalOffset = [this.el.offsetLeft, this.el.offsetTop];
      this.originalScale = Dom.clientScale(el);
      this.data = Attributes.get(el, 'data-drag-data');
      this.tags = el.hasAttribute('data-drag-tag')
                ? Attributes.getTags(el, 'data-drag-tag')
                : Attributes.getTags(el.parentElement, 'data-drag-tag');
    }


    finalizeRevert():void {
      this.originalParentEl.insertBefore(
        this.el,
        this.originalParentEl.children[this.originalIndex]);
    }
  }
}
