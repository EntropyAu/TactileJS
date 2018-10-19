module Tactile {


  export class Draggable {

    static closest(el:HTMLElement):HTMLElement {
      el = Dom.closest(el, '[data-drag-handle],[data-drag-draggable],ol[data-drag-sortable] > li,ul[data-drag-canvas] > li');
      if (!el) return null;

      // don't commence pickup of a data-drag-helper
      if (el.hasAttribute('data-drag-helper')) return null;

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
    draggableId:string;
    tags:string[];
    originalParentEl:HTMLElement;
    originalIndex:number;
    originalSize:[number,number];
    originalScale:[number,number];
    originalStyle:string;
    originalOffset:[number,number];


    constructor(public el:HTMLElement, public drag:Drag) {
      this.draggableId = Attributes.get(el, 'data-drag-id');
      this.data = Attributes.get(el, 'data-drag-data');
      this.tags = el.hasAttribute('data-drag-tag')
                ? Attributes.getTags(el, 'data-drag-tag')
                : Attributes.getTags(el.parentElement, 'data-drag-tag');
      this._captureOriginalPosition();
    }


    public finalizeMove(target:Container) {
      this.el.setAttribute('style', this.originalStyle);
      target.finalizePosition(this.el);
    }


    public finalizeCopy(target:Container) {
      let el:HTMLElement = <HTMLElement>this.el.cloneNode(true);
      el.setAttribute('style', this.originalStyle);
      el.removeAttribute('id');
      el.removeAttribute('data-drag-placeholder');
      target.finalizePosition(el);
    }


    public finalizeDelete() {
      Polyfill.remove(this.el);
    }


    public finalizeRevert():void {
      this.el.setAttribute('style', this.originalStyle);
      this.originalParentEl.insertBefore(
        this.el,
        this.originalParentEl.children[this.originalIndex]);
    }

    public dispose():void {

    }


    private _captureOriginalPosition() {
      this.originalStyle = this.el.getAttribute('style');
      let style = getComputedStyle(this.el);
      this.originalParentEl = this.el.parentElement;
      this.originalIndex = Dom.indexOf(this.el);
      this.originalSize = [this.el.offsetWidth, this.el.offsetHeight];
      this.originalScale = Dom.clientScale(this.el);
      this.originalOffset = [parseInt(style.left, 10), parseInt(style.top, 10)];
    }


    private _onElementUpdated(e):void {
      console.log("Draggable._onElementUpdated", e);
      // update data-drag attributes
      // broadcast the updated event
    }


    private _onElementRemoved(e):void {
      console.log("Draggable._onElementRemoved", e);
      // if the element being dragged is no longer present in the DOM
      // cancel the drag in progress
      this.drag.cancel();
    }

  }
}
