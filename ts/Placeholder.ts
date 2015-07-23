module Tactile {

  export class Placeholder {

    el:HTMLElement;
    drag:Drag;
    size:[number,number];
    scale:[number,number];
    outerSize:[number,number];
    isOriginalEl:boolean;
    state:string;

    _originalStyle: string;
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
      this._originalStyle = el.getAttribute('style');
      this._originalStyles = getComputedStyle(el);
      this._updateDimensions();
      Polyfill.addClass(this.el, this.drag.options.placeholderClass);
      this.el.setAttribute('data-drag-placeholder', '');
      this.el.style.opacity = "0";
      this.setState("hidden", false);
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
            Animation.set(this.el,
              {
                marginBottom: -this.size[1],
                marginRight: -this.size[0]
              },
              animate ? this.drag.options.containerResizeAnimation : undefined);
            break;
          case "ghost":
          case "materialized":
            this.el.style.visibility = '';
            this.el.style.marginBottom = '';
            Animation.set(this.el, { opacity: state === 'ghost' ? 0.1 : 1.0 }, velocityOptions);
            Animation.set(this.el,
              {
                marginBottom: parseInt(this._originalStyles.marginBottom, 10),
                marginRight: parseInt(this._originalStyles.marginRight, 10)
              },
              animate ? this.drag.options.containerResizeAnimation : undefined);
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
