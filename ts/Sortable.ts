module Tactile {

  export class Sortable extends Container {

    private index:number;
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
      this.placeholderSize = this.placeholder.size;
      this.placeholderScale = this.placeholder.scale;
      this.move(xy);
      this._childMeasures.clear();
    }


    move(xy:[number,number]):void {
      if (this._siblingEls.length === 0) {
        if (this.index !== 0) {
          this.index = 0;
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
      this._setPlaceholderIndex(newIndex);
    }

    _setPlaceholderIndex(newIndex:number):void {
      if (newIndex !== this.index) {
        this.index = newIndex;
        this._updateChildTranslations();
      }
    }


    leave():void {
      if (this.leaveAction === "copy" && this.placeholder.isOriginalEl) {
        this.placeholder.setState("materialized");
      } else {
        this.index = null;
        this._childMeasures.clear();
        this.placeholder.setState("hidden");
        this._updateChildTranslations();
      }
    }


    finalizeDrop(draggable:Draggable):void {
      this._clearChildTranslations();
      this.el.insertBefore(this.placeholder.el, this._siblingEls[this.index]);
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

      let els = [];
      let values = [];
      this._siblingEls.forEach(function (el:HTMLElement, index:number) {
        if (index === this.index) {
          placeholderOffset = offset;
          offset += this.placeholder.outerSize[this._directionProperties.index];
        }
        let measure = this._getChildMeasure(el);
        let newTranslation = offset - measure.offset
        if (measure.translation !== newTranslation || this._forceFeedRequired) {
          measure.translation = newTranslation;
          els.push(el);
          values.push(measure.translation);
        }
        offset += measure.measure;
      }.bind(this));

      if (this._forceFeedRequired)
        Animation.set(els, { translateY: [function(i) { return values[i]; }, function(i) { return values[i] + Math.random() / 100; }]}, this.drag.options.reorderAnimation);
      else
        Animation.set(els, { translateY: function(i) { return values[i]; }}, this.drag.options.reorderAnimation);


      if (placeholderOffset === null)  placeholderOffset = offset;
      let placeholderMeasure = this._getChildMeasure(this.placeholder.el);
      let newPlaceholderTranslation = placeholderOffset - placeholderMeasure.offset;
      if (placeholderMeasure.translation !== newPlaceholderTranslation || this._forceFeedRequired) {
        // teleport the placeholder into it's new position (no animation)
        Dom.transform(this.placeholder.el, { [this._directionProperties.translate]: newPlaceholderTranslation });
        placeholderMeasure.translation = newPlaceholderTranslation;
      }
      this._forceFeedRequired = false;
    }


    private _clearChildTranslations():void {
      // synchronously clear the transform styles (rather than calling
      // velocity.js) to avoid flickering when the dom elements are reordered
      Animation.stop(this._siblingEls || []);
      if (this._childEls) {
      this._childEls.forEach(function(el) {
        el.style.transform = '';
        el.style.webkitTransform = '';
      });
      }
      this._forceFeedRequired = true;
    }


    dispose():void {
      if (this.placeholder) this.placeholder.dispose()
      this._clearChildTranslations();
      this._childMeasures.dispose();
    }
  }
}
