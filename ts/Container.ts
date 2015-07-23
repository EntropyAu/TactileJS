module Tactile {

  export class Container {

    static closest(el:HTMLElement):HTMLElement {
      el = Dom.closest(el, '[data-drag-canvas],[data-drag-droppable],[data-drag-sortable]');
      while (el && Dom.closest(el, '[data-drag-placeholder]'))
        el = Dom.closest(el.parentElement, '[data-drag-canvas],[data-drag-droppable],[data-drag-sortable]')
      return el;
    }

    static closestAcceptingTarget(el:HTMLElement, draggable:Draggable):Container {
      let targetEl = this.closest(el);
      while (targetEl) {
        let target = draggable.drag.containerCache.get(targetEl, 'container', () => this.buildContainer(targetEl, draggable.drag));
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


    el:HTMLElement;
    drag:Drag;
    placeholder:Placeholder;
    helperSize:[number,number];
    helperScale:[number,number];
    accepts:string[];
    leaveAction:string;
    enterAction:string;
    isSource:boolean;


    constructor(el:HTMLElement, drag:Drag) {
      this.el = el;
      this.drag = drag;
      this.isSource = false;

      this.accepts = el.hasAttribute('data-drag-accepts')
                   ? Attributes.getTags(el, 'data-drag-accepts')
                   : Attributes.getTags(el, 'data-drag-tag');

      this.leaveAction = Attributes.get(el, 'data-drag-leave-action', 'move');
      this.enterAction = Attributes.get(el, 'data-drag-enter-action', 'move');
    }


    willAccept(draggable:Draggable):boolean {
      if (this.el === draggable.originalParentEl) return true;
      if (this.el.hasAttribute('data-drag-disabled')) return false;
      return this.accepts.indexOf('*') !== -1
          || draggable.tags.some(t => this.accepts.indexOf(t) !== -1);
    }


    enter(xy:[number,number]):void { }
    move(xy:[number,number]):void { }
    leave():void { }
    dispose():void { }
  }
}
