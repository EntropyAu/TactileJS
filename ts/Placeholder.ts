module Tactile {

  export class Placeholder {

    el:HTMLElement;
    drag:Drag;
    size:[number,number];
    scale:[number,number];
    outerSize:[number,number];
    isOriginalEl:boolean;
    state:string;


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
      this._updateDimensions();
      this.el.classList.add(this.drag.options.placeholderClass);
      this.el.setAttribute('data-drag-placeholder', '');
      this.setState("ghost", false);
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
            this.el.style.visibility = 'hidden';
            break;
          case "ghost":
            this.el.style.visibility = '';
            Animation.set(this.el, { opacity: 0.1 }, velocityOptions);
            break;
          case "materialized":
            this.el.style.visibility = '';
            Animation.set(this.el, { opacity: 1.0 }, velocityOptions);
            break;
        }
        this.state = state;
    }


    dispose():void {
      switch (this.state) {
        case "hidden":
          this.el.remove();
          this.el = null;
          break;
        case "ghost":
        case "materialized":
          if (this.el) {
            // restore the original draggable element settings
            this.el.removeAttribute('data-drag-placeholder');
            this.el.classList.remove('dd-drag-placeholder');
            this.el.style.visibility = '';
            this.el.style.opacity = '';
          }
          break;
      }
    }
  }
}
