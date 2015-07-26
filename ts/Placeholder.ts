module Tactile {

  export class Placeholder {

    el:HTMLElement;
    drag:Drag;
    size:[number,number];
    scale:[number,number];
    outerSize:[number,number];
    isOriginalEl:boolean;
    state:string;

    _originalStyles: CSSStyleDeclaration;

    static buildPlaceholder(containerEl:HTMLElement, drag:Drag):Placeholder {
      let el:HTMLElement = <HTMLElement>drag.draggable.el.cloneNode(true);
      el.removeAttribute('id');
      containerEl.appendChild(el);
      return new Placeholder(el, drag, false);
    }


    constructor(el:HTMLElement, drag:Drag, isOriginalEl:boolean=true) {
      this.el = el;
      this.drag = drag;
      this.isOriginalEl = isOriginalEl;
      this._originalStyles = getComputedStyle(el);
      this._updateDimensions();
      Polyfill.addClass(this.el, this.drag.options.placeholderClass);
      this.el.setAttribute('data-drag-placeholder', '');
      this.el.style.opacity = "0";
    }


    private _updateDimensions():void {
      this.size =  [this.el.offsetWidth, this.el.offsetHeight];
      this.outerSize = [Dom.outerWidth(this.el, true), Dom.outerHeight(this.el, true)];
      this.scale = Dom.clientScale(this.el);
    }


    setState(state:string, animate:boolean = true):void {
        if (this.state === state) return;
        let velocityOptions = animate
                            ? { duration: 200, queue: false }
                            : { duration:   0, queue: false };
        switch (state) {
          case "hidden":
            // move the placeholder off the screen so it's no longer visible
            // but it maintains its measurements
            this.el.style.visibility = 'hidden';
            this.el.style.position = "absolute";
            this.el.style.top = "-10000px";
            this.el.style.left = "-10000px";
            break;
          case "ghost":
          case "materialized":
            this.el.style.visibility = '';
            this.el.style.position = "";
            this.el.style.top = '';
            this.el.style.left = '';
            Animation.set(this.el, { opacity: state === 'ghost' ? 0.1 : 1.0 }, velocityOptions);
            this._updateDimensions();
            break;
        }
        this.state = state;
    }


    dispose():void {
      Animation.stop(this.el);
      if (this.isOriginalEl) {
        this.el.removeAttribute('data-drag-placeholder');
        Polyfill.removeClass(this.el, this.drag.options.placeholderClass);
        this.el.style.visibility = '';
        this.el.style.opacity = '';
        this.el.style.transform = '';
      } else {
        Polyfill.remove(this.el);
        this.el = null;
      }
    }
  }
}
