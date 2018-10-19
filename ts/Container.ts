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
      if (Dom.matches(el, '[data-drag-sortable]')) return new Sortable(el, drag);
      if (Dom.matches(el, '[data-drag-droppable]')) return new Droppable(el, drag);
      return null;
    }


    placeholder:Placeholder;
    helperSize:[number,number];
    helperScale:[number,number];
    accepts:string[];
    leaveAction:DragAction;
    enterAction:DragAction;
    isSource:boolean;


    constructor(public el:HTMLElement, public drag:Drag) {
      this.isSource = false;

      this.accepts = el.hasAttribute('data-drag-accepts')
                   ? Attributes.getTags(el, 'data-drag-accepts')
                   : Attributes.getTags(el, 'data-drag-tag');

      this.leaveAction = DragAction[Text.toProperCase(Attributes.get(el, 'data-drag-leave-action', 'move'))];
      this.enterAction = DragAction[Text.toProperCase(Attributes.get(el, 'data-drag-enter-action', 'move'))];
    }


    public willAccept(draggable:Draggable):boolean {
      if (this.el === draggable.originalParentEl) return true;
      if (this.el.hasAttribute('data-drag-disabled')) return false;
      return this.accepts.indexOf('*') !== -1 || draggable.tags.some(t => this.accepts.indexOf(t) !== -1);
    }


    public enter(xy:[number,number]):void { }


    public move(xy:[number,number]):void { }


    public leave():void { }


    public finalizePosition(el:HTMLElement):void { }


    public dispose():void { }


    protected onElementUpdated(e):void {
      console.log("Container.onElementUpdated", e);
    }


    protected onElementRemoved(e):void {
      console.log("Container.onElementRemoved", e);
      this.dispose();
    }
  }
}
