module Tactile {

  export class Sortable extends Container {

    private _index:number;
    private _direction:string;
    private _directionProperties:any;
    private _childEls:HTMLElement[];
    private _siblingEls:HTMLElement[];
    private _childMeasures:Cache;
    private _style:CSSStyleDeclaration = getComputedStyle(this.el);
    private _forceFeedRequired:boolean = true;


    constructor(el:HTMLElement, drag:Drag) {
      super(el, drag);
      this._childMeasures = new Cache();
      this._initializeDirection();
    }


    private _initializeDirection():void {
      this._direction = this.el.getAttribute('data-drag-sortable') || "vertical";
      this._directionProperties = this._direction === "vertical"
                                ? {
                                    index: 1,
                                    translate: 'translateY',
                                    paddingStart: 'paddingTop',
                                    endMargin: 'marginBottom',
                                    layoutOffset: 'offsetTop',
                                    outerDimension: 'outerHeight'
                                  }
                                : {
                                    index: 0,
                                    translate: 'translateX',
                                    paddingStart: 'paddingLeft',
                                    endMargin: 'marginRight',
                                    layoutOffset: 'offsetLeft',
                                    outerDimension: 'outerWidth'
                                  };
    }


    private _initializePlaceholder():void {
      if (this.drag.draggable.originalParentEl === this.el) {
        this.placeholder = new Placeholder(this.drag.draggable.el, this.drag);
      } else {
        this.placeholder = Placeholder.buildPlaceholder(this.el, this.drag);
      }
      this._offsetPlaceholderWithMargin();
    }


    private _initializeChildAndSiblingEls():void {
      this._childEls = Dom.children(this.el);
      this._siblingEls = this._childEls.slice(0);
      let placeholderElIndex = this._childEls.indexOf(this.placeholder.el);
      if (placeholderElIndex !== -1) {
        this._siblingEls.splice(placeholderElIndex, 1);
      }
    }


    enter(xy:[number,number]):void {
      if (!this.placeholder) {
        this._initializePlaceholder();
        this._initializeChildAndSiblingEls();
      }
      this.placeholder.setState("ghost");
      this._undoOffsetPlaceholder();
      this.placeholderSize = this.placeholder.size;
      this.placeholderScale = this.placeholder.scale;
      this.move(xy);
      this._childMeasures.clear();
    }


    move(xy:[number,number]):void {
      if (this._siblingEls.length === 0) {
        if (this._index !== 0) {
          this._index = 0;
          this._updateChildTranslations();
        }
        return;
      }

      const bounds = this.drag.scrollCache.get(this.el, 'cr', () => this.el.getBoundingClientRect());
      const sl = this.drag.scrollCache.get(this.el, 'sl', () => this.el.scrollLeft);
      const st = this.drag.scrollCache.get(this.el, 'st', () => this.el.scrollTop);
      // calculate the position of the item relative to this container
      const innerXY = [xy[0] - bounds.left + sl - parseInt(this._style.paddingLeft, 10),
                       xy[1] - bounds.top  + st - parseInt(this._style.paddingTop, 10)];
      let adjustedXY = [innerXY[0] - this.drag.helper.gripXY[0],
                        innerXY[1] - this.drag.helper.gripXY[1]];

      adjustedXY = [adjustedXY[0] / this.placeholderScale[0],
                    adjustedXY[1] / this.placeholderScale[1]];

      let naturalOffset = 0;
      let newIndex = 0;
      do {
        let measure = this._getChildMeasure(this._siblingEls[newIndex]);
        if (adjustedXY[this._directionProperties.index] < naturalOffset + measure.measure / 2) break;
        naturalOffset += measure.measure;
        newIndex++;
      }
      while (newIndex < this._siblingEls.length);

      if (this._index !== newIndex) {
        this._index = newIndex;
        this._updateChildTranslations();
      }
    }


    leave():void {
      if (this.leaveAction === "copy" && this.placeholder.isOriginalEl) {
        this.placeholder.setState("materialized");
      } else {
        this._index = null;
        this._forceFeedRequired = true;
        this._childMeasures.clear();
        this.placeholder.setState("hidden");
        this._offsetPlaceholderWithMargin();
        this._updateChildTranslations();
      }
    }


    private _offsetPlaceholderWithMargin():void {
      if (this.el.children.length > 0) {
        let lastChildEl = <HTMLElement>this.el.children[this.el.children.length - 1];
        let lastChildStyle = getComputedStyle(lastChildEl);
        let newMargin = parseInt(lastChildStyle[this._directionProperties.endMargin], 10) - this.placeholder.outerSize[this._directionProperties.index];
        lastChildEl.style[this._directionProperties.endMargin] = newMargin + 'px';
      }
    }


    private _undoOffsetPlaceholder():void {
      if (this.el.children.length > 0) {
        let lastChildEl = <HTMLElement>this.el.children[this.el.children.length - 1];
        lastChildEl.style[this._directionProperties.endMargin] = '';
      }
    }


    finalizeDrop(draggable:Draggable):void {
      this._clearChildTranslations();
      this.el.insertBefore(this.placeholder.el, this._siblingEls[this._index]);
      this.placeholder.dispose();
      this.placeholder = null;
    }


    private _getChildMeasure(el:HTMLElement):any {
      function getMeasure() {
        return {
          offset: el[this._directionProperties.layoutOffset] - parseInt(this._style[this._directionProperties.paddingStart], 10),
          measure: Dom[this._directionProperties.outerDimension](el, true),
          translation: <number>null
        };
      }
      let measure = this._childMeasures.get(el, 'measures', getMeasure.bind(this));
      return measure;
    }


    private _updateChildTranslations():void {
      let offset:number = 0;
      let placeholderOffset:number = null;

      this._siblingEls.forEach(function (el:HTMLElement, index:number) {
        if (index === this._index) {
          placeholderOffset = offset;
          offset += this.placeholder.outerSize[this._directionProperties.index];
        }
        let measure = this._getChildMeasure(el);
        let newTranslation = offset - measure.offset
        if (measure.translation !== newTranslation || this._forceFeedRequired) {
          measure.translation = newTranslation;
          let props = this._forceFeedRequired
                    ? { [this._directionProperties.translate]: [measure.translation, Math.random() / 100] }
                    : { [this._directionProperties.translate]: measure.translation + Math.random() / 100 };
          Animation.set(el, props, this.drag.options.reorderAnimation);
        }
        offset += measure.measure;
      }.bind(this));

      if (placeholderOffset === null)  placeholderOffset = offset;
      let placeholderMeasure = this._getChildMeasure(this.placeholder.el);
      let newPlaceholderTranslation = placeholderOffset - placeholderMeasure.offset;
      if (placeholderMeasure.translation !== newPlaceholderTranslation || this._forceFeedRequired) {
        Animation.set(this.placeholder.el, { [this._directionProperties.translate]: newPlaceholderTranslation });
        placeholderMeasure.translation = newPlaceholderTranslation;
      }
      this._forceFeedRequired = false;
    }


    private _clearChildTranslations():void {
      // synchronously clear the transform styles (rather than calling
      // velocity.js) to avoid flickering when the dom elements are reordered
      if (this._siblingEls) {
        this._siblingEls.forEach(function(el) {
          Animation.stop(el);
          el.setAttribute('style', '');
        });
      }
      this._forceFeedRequired = true;
    }


    dispose():void {
      this._clearChildTranslations();
      this._childMeasures.dispose();
      if (this.placeholder) this.placeholder.dispose()
    }
  }
}
