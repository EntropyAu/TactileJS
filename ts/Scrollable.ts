module Tactile {

  export enum Direction {
    Neither,
    Horizontal,
    Vertical,
    Both
  }

  export class Scrollable {

    private static _overflowScrollValues = /^(auto|scroll)$/;

    private static _detectScrollableDirection(el:HTMLElement):Direction {
      const style = getComputedStyle(el);
      return ([Direction.Neither,
               Direction.Horizontal,
               Direction.Vertical,
               Direction.Both])[
        (this._overflowScrollValues.test(style.overflowX) ? 1 : 0) +
        (this._overflowScrollValues.test(style.overflowY) ? 2 : 0)
      ];
    }


    private static _getScrollableDirection(drag:Drag, el:HTMLElement):Direction {
      let directionText = Attributes.get(el, "data-drag-scrollable", Direction[Direction.Both], null);
      let direction:Direction = Direction[Text.toProperCase(directionText)];
      if (direction === undefined && drag.options.scrollAutoDetect) {
        return drag.containerCache.get(el, "scrollDirection", () => this._detectScrollableDirection(el))
      } else {
        return direction || Direction.Neither;
      }
    }


    public static closestScrollableScrollable(drag:Drag, xy:[number,number], xyEl:HTMLElement) {
      let cursorEl:HTMLElement = xyEl;
      while (cursorEl !== null) {
        if (this._getScrollableDirection(drag, cursorEl) != Direction.Neither) {
          let scrollable = drag.containerCache.get(cursorEl, "Scrollable", () => new Scrollable(cursorEl, drag));
          if (scrollable.canScroll(xy)) {
            return scrollable;
          }
        }
        cursorEl = cursorEl.parentElement;
      }
      return null;
    }


    private _bounds:ClientRect = null;
    private _offset:[number,number] = null;
    private _velocity:[number,number] = [0,0];
    private _direction:Direction = Direction.Neither;
    private _sensitivity:[number,number] = [0,0];
    private _lastUpdate:Date = null;


    constructor(public el:HTMLElement, public drag:Drag) {
      // initialize directions
      this._direction = Scrollable._getScrollableDirection(drag, this.el);

      // initialize bounds
      if (this.el.tagName === 'BODY') {
        const w = document.documentElement.clientWidth;
        const h = document.documentElement.clientHeight;
        this._bounds = { left: 0, top: 0, width: w, height: h, right: w, bottom: h };
      } else {
        this._bounds = this.drag.geometryCache.get(this.el, 'cr', () => this.el.getBoundingClientRect());
      }

      // initialize sensitivity
      const sensitivity:string|number = this.drag.options.scrollSensitivity;
      const percent = sensitivity.toString().indexOf('%') !== -1
                    ? parseInt(sensitivity.toString(), 10) / 100
                    : null;
      this._sensitivity = [
        Math.min(percent ? percent * this._bounds.width  : parseInt(sensitivity.toString(), 10), this._bounds.width / 3),
        Math.min(percent ? percent * this._bounds.height : parseInt(sensitivity.toString(), 10), this._bounds.height / 3)
      ]
    }


    canScroll(xy:[number,number]):boolean {
      this._updateVelocity(xy);
      return Vector.lengthSquared(this._velocity) > 0;
    }


    continueScroll(xy:[number,number]) {

      // if this is the first movement of the scrollable, record the current
      // scroll position. We keep track of this separately to allow for
      // subpixel scrolling
      if (!this._lastUpdate) {
        this._offset = [this.el.scrollLeft, this.el.scrollTop];
      };

      this._updateVelocity(xy);

      let currentUpdate = new Date();
      let elapsedTimeMs = this._lastUpdate !== null
                        ? (currentUpdate.getTime() - this._lastUpdate.getTime())
                        : 16;

      // scroll the scrollable
      this._offset = Vector.add(this._offset, Vector.multiplyScalar(this._velocity, elapsedTimeMs));
      if (this._velocity[0] !== 0) this.el.scrollLeft = this._offset[0];
      if (this._velocity[1] !== 0) this.el.scrollTop  = this._offset[1];
      this._lastUpdate = currentUpdate;

      return Vector.lengthSquared(this._velocity) > 0;
    }


    private _updateVelocity(xy:[number,number]):void {
      const maxV = this.drag.options.scrollSpeed;
      const b = this._bounds;

      let v:[number,number] = [0,0];
      if (Geometry.rectContains(b, xy)) {
        if (this._direction === Direction.Horizontal || this._direction === Direction.Both) {
          if (xy[0] > b.right - this._sensitivity[0] && Dom.canScrollRight(this.el)) v[0] = Maths.scale(xy[0], [b.right-this._sensitivity[0], b.right], [0, +maxV]);
          if (xy[0] < b.left + this._sensitivity[0] && Dom.canScrollLeft(this.el)) v[0] = Maths.scale(xy[0], [b.left+this._sensitivity[0], b.left], [0, -maxV]);
        }
        if (this._direction === Direction.Vertical || this._direction === Direction.Both) {
          if (xy[1] > b.bottom - this._sensitivity[1] && Dom.canScrollDown(this.el)) v[1] = Maths.scale(xy[1], [b.bottom-this._sensitivity[1], b.bottom], [0, +maxV]);
          if (xy[1] < b.top + this._sensitivity[1] && Dom.canScrollUp(this.el)) v[1] = Maths.scale(xy[1], [b.top+this._sensitivity[1], b.top], [0, -maxV]);
        }
      }
      this._velocity = v;
    }
  }
}
