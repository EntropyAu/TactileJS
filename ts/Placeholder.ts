module Tactile {

  export enum PlaceholderState {
    Materialized,
    Ghost,
    Hidden
  }

  export class Placeholder {
    draggable:Draggable;
    size:[number,number];
    scale:[number,number];
    outerSize:[number,number];
    isOriginalEl:boolean;
    state:PlaceholderState;

    static buildPlaceholder(containerEl:HTMLElement, drag:Drag):Placeholder {
      let el:HTMLElement = <HTMLElement>drag.draggable.el.cloneNode(true);
      el.removeAttribute("id");
      containerEl.appendChild(el);
      return new Placeholder(el, drag, false);
    }


    constructor(
      public el:HTMLElement,
      public drag:Drag,
      isOriginalEl:boolean=true)
    {
      this.draggable = drag.draggable;
      this.isOriginalEl = isOriginalEl;
      this._updateMeasurementsFromDOM();
      Polyfill.addClass(this.el, this.drag.options.placeholderClass);
      Attributes.set(this.el, "data-drag-placeholder");
      this.el.style.opacity = "0";
    }


    public setState(
      state:PlaceholderState,
      animate:boolean=true):void
    {
      if (this.state === state) return;
      this.state = state;
      this._updateDOMToReflectState(animate);
    }


    public dispose():void {
      if (!this.el) return;
      Animation.stop(this.el);
      if (this.isOriginalEl) {
        Attributes.remove(this.el, "data-drag-placeholder")
        Polyfill.removeClass(this.el, this.drag.options.placeholderClass);
        this.el.style.visibility = "";
        this.el.style.opacity = "";
        this.el.style.transform = "";
      } else {
        Polyfill.remove(this.el);
        this.el = null;
      }
    }


    private _updateMeasurementsFromDOM():void {
      this.size =  [this.el.offsetWidth, this.el.offsetHeight];
      this.outerSize = [Dom.outerWidth(this.el, true), Dom.outerHeight(this.el, true)];
      this.scale = Dom.clientScale(this.el);
    }


    private _updateDOMToReflectState(animate:boolean) {
      let velocityOptions = animate
                          ? { duration: 200, queue: false }
                          : { duration:   0, queue: false };
      switch (this.state) {
        case PlaceholderState.Hidden:
          // move the placeholder off the screen so it"s no longer visible
          // but it maintains its measurements
          this.el.style.visibility = "hidden";
          this.el.style.position = "absolute";
          this.el.style.top = "-10000px";
          this.el.style.left = "-10000px";
          this.drag.geometryCache.clear();
          break;
        case PlaceholderState.Ghost:
        case PlaceholderState.Materialized:
          this.el.style.visibility = "";
          this.el.style.position = "";
          this.el.style.top = "";
          this.el.style.left = "";
          Animation.set(this.el, { opacity: this.state === PlaceholderState.Ghost ? 0.1 : 1.0 }, velocityOptions);
          this.drag.geometryCache.clear();
          this._updateMeasurementsFromDOM();
          break;
      }
    }


    private _onDraggableElementUpdated(e):void {
      console.log("Placeholder._draggableElementUpdated", e);
      // replace the current element with a fresh copy
      this._updateMeasurementsFromDOM();
      this._updateDOMToReflectState(false);
    }


    private _onElementRemoved(e):void {
      console.log("Placeholder._onElementRemoved", e);
      this.el = null;
      // somebody has removed this element from the DOM
      // let"s recreate it
    }
  }
}
