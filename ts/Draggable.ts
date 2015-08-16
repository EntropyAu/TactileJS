module Tactile {


  export class Draggable {

    static closest(el:HTMLElement):HTMLElement {
      el = Dom.closest(el, '[data-drag-handle],[data-drag-draggable],ol[data-drag-sortable] > li,ul[data-drag-canvas] > li');
      if (!el) return null;

      // if the pointer is over a handle element, ascend the DOM to find the
      // associated draggable item
      if (el.hasAttribute('data-drag-handle')) {
        el = Dom.closest(el, '[data-drag-draggable],ol[data-drag-sortable] > li,ul[data-drag-canvas] > li');
        return el;
      }

      // check all of the drag handles underneath this draggable element,
      // and make sure they all belong to other (child) draggables
      const handleEls = el.querySelectorAll('[data-drag-handle]');
      const numHandleEls = handleEls.length;
      for (let i = 0; i < numHandleEls; i++) {
        let handleEl = handleEls[i];
        if (Dom.closest(<HTMLElement>handleEl, '[data-drag-draggable],ol[data-drag-sortable] > li,ul[data-drag-canvas] > li') === el) {
          return null;
        }
      }
      return el;
    }


    static closestEnabled(el:HTMLElement):HTMLElement {
      el = this.closest(el);
      return el && !(el.hasAttribute('data-drag-disabled') || el.parentElement && el.parentElement.hasAttribute('data-drag-disabled'))
             ? el
             : null;
    }


    data:any;
    tags:string[];
    originalParentEl:HTMLElement;
    originalIndex:number;
    originalSize:[number,number];
    originalScale:[number,number];
    originalStyle:string;
    originalOffset:[number,number];


    constructor(public el:HTMLElement, public drag:Drag) {
      this.originalStyle = el.getAttribute('style');
      this.originalParentEl = el.parentElement;
      this.originalIndex = Dom.indexOf(el);
      this.originalSize = [this.el.offsetWidth, this.el.offsetHeight];
      this.originalScale = Dom.clientScale(el);
      let style = getComputedStyle(this.el);
      this.originalOffset = [parseInt(style.left, 10), parseInt(style.top, 10)];
      this.data = Attributes.get(el, 'data-drag-data');
      this.tags = el.hasAttribute('data-drag-tag')
                ? Attributes.getTags(el, 'data-drag-tag')
                : Attributes.getTags(el.parentElement, 'data-drag-tag');
    }


    finalizeMove(target:Container) {
      this.el.setAttribute('style', this.originalStyle);
      target.finalizePosition(this.el);
    }


    finalizeCopy(target:Container) {
      let el:HTMLElement = <HTMLElement>this.el.cloneNode(true);
      el.setAttribute('style', this.originalStyle);
      el.removeAttribute('id');
      el.removeAttribute('data-drag-placeholder');
      target.finalizePosition(el);
    }


    finalizeDelete() {
      Polyfill.remove(this.el);
    }


    finalizeRevert():void {
      this.el.setAttribute('style', this.originalStyle);
      this.originalParentEl.insertBefore(
        this.el,
        this.originalParentEl.children[this.originalIndex]);
    }
  }
}
