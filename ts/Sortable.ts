module Tactile {

  export class Sortable extends Container {

    private index: number;
    private _direction: string;
    private _directionProperties: any;
    private _childEls: HTMLElement[];
    private _siblingEls: HTMLElement[];
    private _childGeometry: Cache;
    private _style: CSSStyleDeclaration = getComputedStyle(this.el);
    private _avoidDomMutations: boolean = true;
    private _mutObserver:MutationObserver;


    constructor(el: HTMLElement, drag: Drag) {
      super(el, drag);
      this._childGeometry = new Cache();
      this._initializeDirection();
      this._initializeMutationListener();
    }

    private _initializeMutationListener():void {
      if (!window["MutationObserver"]) return;
      this._mutObserver = new MutationObserver(this._onDomMutation.bind(this));
      this._mutObserver.observe(this.el, { childList: true, subtree: true });
    }

    private _onDomMutation(e):void {
      this._childGeometry.clear();
    }


    public enter(xy: [number, number]): void {
      if (!this.placeholder) {
        this.index = null;
        this._initializeChildAndSiblingEls();
        this._initializePlaceholder();
        this._updatePlaceholderPosition();
      }
      this.placeholder.setState("ghost");
      this.helperSize = this.placeholder.size;
      this.helperScale = this.placeholder.scale;
      this._childGeometry.clear();
      this.move(xy);
    }


    public move(xy: [number, number]): void {
      this._updateIndex(xy);
    }


    public leave(): void {
      if (this.leaveAction === "copy" && this.placeholder.isOriginalEl) {
        this.placeholder.setState("materialized");
      } else {
        this.index = null;
        this.placeholder.setState("hidden");
        this._clearChildTranslations();
        this._childGeometry.clear();
        this._updatePlaceholderPosition();
      }
    }


    public finalizePosition(el: HTMLElement): void {
      this.el.insertBefore(el, this._siblingEls[this.index]);
    }


    public dispose(): void {
      if (this.placeholder) this.placeholder.dispose()
      if (this._mutObserver) {
        this._mutObserver.disconnect();
        this._mutObserver = null;
      }

      this._clearChildTranslations();
      this._childGeometry.dispose();
    }


    private _updateIndex(xy: [number, number]): void {
      if (this._siblingEls.length === 0) {
        return this._setPlaceholderIndex(0);
      }
      if (this._direction !== 'wrap') {
        this._updateIndexViaOffset(xy);
      } else {
        this._updateIndexViaSelectionApi(xy);
      }
    }


    private _updateIndexViaOffset(xy: [number, number]): void {
      const bounds = this.drag.geometryCache.get(this.el, 'cr', () => this.el.getBoundingClientRect());
      const sl = this.drag.geometryCache.get(this.el, 'sl', () => this.el.scrollLeft);
      const st = this.drag.geometryCache.get(this.el, 'st', () => this.el.scrollTop);

      // calculate the position of the item relative to this container
      const innerXY = [xy[0] - bounds.left + sl - parseInt(this._style.paddingLeft, 10),
                       xy[1] - bounds.top + st - parseInt(this._style.paddingTop, 10)];
      let adjustedXY = [innerXY[0] - this.drag.helper.gripXY[0],
                        innerXY[1] - this.drag.helper.gripXY[1]];

      adjustedXY = [adjustedXY[0] / this.helperScale[0],
                    adjustedXY[1] / this.helperScale[1]];


      let naturalOffset = 0;
      let newIndex = 0;
      do {
        let geometry = this._getChildGeometry(this._siblingEls[newIndex]);
        if (adjustedXY[this._directionProperties.index] < naturalOffset + geometry.dimension / 2) break;
        naturalOffset += geometry.dimension;
        newIndex++;
      }
      while (newIndex < this._siblingEls.length);
      this._setPlaceholderIndex(newIndex);
    }


    private _updateIndexViaSelectionApi(xy: [number, number]): void {
      const closestElement = Dom.elementFromPointViaSelection(xy);
      const closestElementParents = Dom.ancestors(closestElement, 'li');
      const closestSiblingEl = this._siblingEls.filter(el => closestElementParents.indexOf(el) !== -1)[0];
      if (closestSiblingEl && !Dom.matches(closestSiblingEl, '.velocity-animating')) {
        let newIndex = this._siblingEls.indexOf(closestSiblingEl);
        const childBounds = closestSiblingEl.getBoundingClientRect();
        if (xy[0] > childBounds.left + childBounds.width / 2) newIndex++;
        this._setPlaceholderIndex(newIndex);
      }
    }


    private _initializeDirection(): void {
      this._direction = this.el.getAttribute('data-drag-sortable') || "vertical";
      this._directionProperties = this._direction === "vertical"
        ? {
          index: 1,
          translate: 'translateY',
          paddingStart: 'paddingTop',
          layoutOffset: 'offsetTop',
          outerDimension: 'outerHeight'
        }
        : {
          index: 0,
          translate: 'translateX',
          paddingStart: 'paddingLeft',
          layoutOffset: 'offsetLeft',
          outerDimension: 'outerWidth'
        };

      // the simple layout algorithm that uses transform:translate() rather than
      // repositioning the placeholders in the DOM does not support wrapping
      // sortable layouts. In this case revert to DOM-based positioning
      if (this._direction === 'wrap') {
        this._avoidDomMutations = false;
      } else {
        this._avoidDomMutations = this.drag.options.avoidDomMutations;
      }
    }


    private _initializePlaceholder(): void {
      if (this.drag.draggable.originalParentEl === this.el) {
        this.placeholder = new Placeholder(this.drag.draggable.el, this.drag);
        this.index = this._childEls.indexOf(this.drag.draggable.el);
      } else {
        this.placeholder = Placeholder.buildPlaceholder(this.el, this.drag);
      }
    }


    private _initializeChildAndSiblingEls(): void {
      this._childEls = Dom.children(this.el);
      this._siblingEls = this._childEls.slice(0);
      let draggableElIndex = this._childEls.indexOf(this.drag.draggable.el);
      if (draggableElIndex !== -1) {
        this._siblingEls.splice(draggableElIndex, 1);
      }
    }


    private _setPlaceholderIndex(newIndex: number): void {
      if (newIndex !== this.index) {
        this.index = newIndex;
        this._updatePlaceholderPosition();
      }
    }


    private _updatePlaceholderPosition(): void {
      if (this._avoidDomMutations) {
        this._updateChildTranslations();
      } else {
        this._updatePlaceholderIndex();
      }
    }


    private _getChildGeometry(el: HTMLElement): any {
      function getGeometry() {
        return {
          layoutOffset: el[this._directionProperties.layoutOffset] - parseInt(this._style[this._directionProperties.paddingStart], 10),
          dimension: Dom[this._directionProperties.outerDimension](el, true),
          translation: <number>null
        };
      }
      let geometry = this._childGeometry.get(el, 'geometry', getGeometry.bind(this));
      return geometry;
    }


    // reposition the placeholder at the new index position
    // this method is slower than using translations as it mutates the dom
    // and triggers a layout pass, however it supports all sortable directions
    private _updatePlaceholderIndex(): void {
      let domMutation = () => this.el.insertBefore(this.placeholder.el, this._siblingEls[this.index]);
      Animation.animateDomMutation(this.el, domMutation, { animationOptions: this.drag.options.reorderAnimation });
    }


    private _updateChildTranslations(): void {
      let offset: number = 0;
      let placeholderOffset: number = null;

      let els = []
      let elValues = [];

      this._siblingEls.forEach(function(el: HTMLElement, index: number) {
        if (index === this.index) {
          placeholderOffset = offset;
          offset += this.placeholder.outerSize[this._directionProperties.index];
        }
        let geometry = this._getChildGeometry(el);
        let newTranslation = offset - geometry.layoutOffset
        if (geometry.translation !== newTranslation) {
          geometry.translation = newTranslation;
          els.push(el);
          elValues.push(newTranslation);
        }
        offset += geometry.dimension;
      }.bind(this));

      const translate = this._directionProperties.translate;

      let props = { [translate]: function(i) { return elValues[i]; } };
      Animation.set(els, props, this.drag.options.reorderAnimation);


      if (placeholderOffset === null) placeholderOffset = offset;
      let placeholderGeometry = this._getChildGeometry(this.placeholder.el);
      let newPlaceholderTranslation = placeholderOffset - placeholderGeometry.layoutOffset;
      if (placeholderGeometry.translation !== newPlaceholderTranslation) {
        // teleport the placeholder into it's new position (no animation)
        Dom.transform(this.placeholder.el, { [translate]: newPlaceholderTranslation });
        placeholderGeometry.translation = newPlaceholderTranslation;
      }
    }


    private _clearChildTranslations(): void {
      // synchronously clear the transform styles (rather than calling
      // velocity.js) to avoid flickering when the dom elements are reordered
      Animation.stop(this._siblingEls || []);
      if (this._childEls) {
        this._childEls.forEach(function(el) {
          el.style.transform = '';
          el.style.webkitTransform = '';
        });
      }
      // clear any cached animation values in Velocity.js
      Animation.clear(this._siblingEls || []);
    }
  }
}
