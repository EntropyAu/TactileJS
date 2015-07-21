module Tactile {

  const containerSelector:string = '[data-drag-canvas],[data-drag-droppable],[data-drag-sortable]';
  const placeholderSelector:string = '[data-drag-placeholder]';

  export class Container {

    static selector = '';

    static closest(el:HTMLElement):HTMLElement {
      el = Dom.closest(el, containerSelector);
      while (el && Dom.closest(el, placeholderSelector))
        el = Dom.closest(el.parentElement, containerSelector)
      return el;
    }

    static matches(el:HTMLElement) {
      return Dom.matches(el, selector);
    }

    static closestAcceptingTarget(el:HTMLElement, draggable:Draggable):Container {
      let targetEl = this.closest(el);
      while (targetEl) {
        let target = this._getContainer(targetEl, draggable.drag);
        if (target.willAccept(draggable)) return target;
        targetEl = this.closest(targetEl.parentElement);
      }
      return null;
    }

    static buildContainer(el:HTMLElement, drag:Drag):Container {
      if (Dom.matches(el, '[data-drag-canvas]')) return new Canvas(el, drag);
      if (Dom.matches(el, '[data-drag-droppable]')) return new Droppable(el, drag);
      if (Dom.matches(el, '[data-drag-sortable]')) return new Sortable(el, drag);
      return null;
    }


    private static _getContainer(el:HTMLElement, drag:Drag):Container {
      let container = el['__tactileContainer'];
      if (!container) {
        container = el['__tactileContainer'] = this.buildContainer(el, drag);
      }
      return container;
    }


    el:HTMLElement;
    drag:Drag;
    placeholder:Placeholder;
    placeholderSize:[number,number];
    placeholderScale:[number,number];
    accepts:string[];
    leaveAction:DragAction;
    enterAction:DragAction;
    isSource:boolean;


    constructor(el:HTMLElement, drag:Drag) {
      this.el = el;
      this.drag = drag;
      this.isSource = false;

      this.accepts = el.hasAttribute('data-drag-accepts')
                   ? Attributes.getTags(el, 'data-drag-accepts')
                   : Attributes.getTags(el, 'data-drag-tag');

      this.leaveAction = DragAction[Attributes.get(el, 'data-drag-leave-action', 'move')];
      this.enterAction = DragAction[Attributes.get(el, 'data-drag-enter-action', 'move')];
    }


    willAccept(draggable:Draggable):boolean {
      if (this.el === draggable.originalParentEl) return true;
      if (this.el.hasAttribute('data-drag-disabled')) return false;
      return this.accepts.indexOf('*') !== -1
          || draggable.tags.some(t => this.accepts.indexOf(t) !== -1);
    }


    enter(xy:[number,number]):void {
      this.el.classList.add(this.drag.options.containerHoverClass);
    }



    move(xy:[number,number]):void {
      // do nothing
    }


    leave():void {
      this.el.classList.remove(this.drag.options.containerHoverClass);
    }


    dispose():void {
      this.el.classList.remove(this.drag.options.containerHoverClass);
    }
  }
}
