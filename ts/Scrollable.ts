module Tactile {

  export class Scrollable {

    static closestReadyScrollable(el:HTMLElement, drag:Drag, xy:[number,number]):Scrollable {
      var scrollEls = Dom.ancestors(el || document.body, '[data-drag-scrollable]');
      for (let scrollEl of scrollEls) {
        let scrollable = new Scrollable(scrollEl, drag);
        if (scrollable.canScroll(xy)) return scrollable;
      }
      return null;
    }

    el:HTMLElement;
    drag:Drag;

    private _bounds:ClientRect = null;
    private _offset:[number,number] = null;
    private _velocity:[number,number] = [0,0];
    private _hEnabled:boolean = false;
    private _vEnabled:boolean = false;
    private _hSensitivity:number = 0;
    private _vSensitivity:number = 0;
    private _lastUpdate:Date = null;


    constructor(el:HTMLElement, drag:Drag) {
      this.el = el;
      this.drag = drag;

      // initialize directions
      const style = getComputedStyle(this.el);
      this._hEnabled = style.overflowX === 'auto' || style.overflowX === 'scroll';
      this._vEnabled = style.overflowY === 'auto' || style.overflowY === 'scroll';

      // initialize bounds
      if (this.el.tagName === 'BODY') {
        const w = document.documentElement.clientWidth;
        const h = document.documentElement.clientHeight;
        this._bounds = { left: 0, top: 0, width: w, height: h, right: w, bottom: h };
      } else {
        this._bounds = this.el.getBoundingClientRect();
      }

      // initialize sensitivity
      const sensitivity = this.drag.options.scrollSensitivity;
      const percent = sensitivity.toString().indexOf('%') !== -1
                    ? parseInt(sensitivity.toString(), 10) / 100
                    : null;
      this._hSensitivity = Math.min(percent ? percent * this._bounds.width  : parseInt(sensitivity.toString(), 10), this._bounds.width / 3);
      this._vSensitivity = Math.min(percent ? percent * this._bounds.height : parseInt(sensitivity.toString(), 10), this._bounds.height / 3);
    }


    canScroll(xy:[number,number]):boolean {
      this._updateVelocity(xy);
      return Vector.lengthSquared(this._velocity) > 0;
    }


    step(xy:[number,number]) {
      this._updateVelocity(xy);
      if (!this._lastUpdate) {
        this._offset = [this.el.scrollLeft, this.el.scrollTop];
      };

      // calculate the amount we want to scroll
      let currentUpdate = new Date();
      let elapsedTimeMs = this._lastUpdate !== null ? (currentUpdate.getTime() - this._lastUpdate.getTime()) : 16;
      this._offset = Vector.add(this._offset, Vector.multiplyScalar(this._velocity, elapsedTimeMs));

      // scroll the scrollable
      if (this._velocity[0] !== 0) this.el.scrollLeft = this._offset[0];
      if (this._velocity[1] !== 0) this.el.scrollTop  = this._offset[1];
      this._lastUpdate = currentUpdate;

      // schedule the next scroll update
      return (this._velocity[0] !== 0 || this._velocity[1] !== 0);
    }


    private _updateVelocity(xy:[number,number]):void {
      const maxV = this.drag.options.scrollSpeed;
      const b = this._bounds;

      let v:[number,number] = [0,0];
      if (Maths.contains(b, xy)) {
        if (this._hEnabled) {
          if (xy[0] > b.right - this._hSensitivity && Dom.canScrollRight(this.el)) v[0] = Maths.scale(xy[0], [b.right-this._hSensitivity, b.right], [0, +maxV]);
          if (xy[0] < b.left + this._hSensitivity && Dom.canScrollLeft(this.el)) v[0] = Maths.scale(xy[0], [b.left+this._hSensitivity, b.left], [0, -maxV]);
        }
        if (this._vEnabled) {
          if (xy[1] > b.bottom - this._vSensitivity && Dom.canScrollDown(this.el)) v[1] = Maths.scale(xy[1], [b.bottom-this._vSensitivity, b.bottom], [0, +maxV]);
          if (xy[1] < b.top + this._vSensitivity && Dom.canScrollUp(this.el)) v[1] = Maths.scale(xy[1], [b.top+this._vSensitivity, b.top], [0, -maxV]);
        }
      }
      this._velocity = v;
    }
  }
}
