function positionsBox(position1Media, position2Media, pixelRatio) {
  const scaledPosition1 = Math.round(pixelRatio * position1Media);
  const scaledPosition2 = Math.round(pixelRatio * position2Media);
  return {
    position: Math.min(scaledPosition1, scaledPosition2),
    length: Math.abs(scaledPosition2 - scaledPosition1) + 1
  };
}
class AxisPaneRenderer {
  constructor(_data, _vertical) {
    this._data = _data;
    this._vertical = _vertical;
    this._vertical = _vertical;
  }
  draw(target) {
    target.useBitmapCoordinateSpace((scope) => {
      if (!this._data) return;
      const { p0, p1, background, maxDimension, visible } = this._data;
      if (!visible) return;
      if (p0 === null || p1 === null) return;
      const ctx = scope.context;
      const positions = positionsBox(
        p0,
        p1,
        this._vertical ? scope.verticalPixelRatio : scope.horizontalPixelRatio
      );
      ctx.fillStyle = background;
      if (this._vertical) {
        ctx.fillRect(
          0,
          positions.position,
          maxDimension * scope.horizontalPixelRatio,
          positions.length
        );
      } else {
        ctx.fillRect(
          positions.position,
          0,
          positions.length,
          maxDimension * scope.verticalPixelRatio
        );
      }
    });
  }
}
class AxisPaneView {
  constructor(_data, _vertical) {
    this._data = _data;
    this._vertical = _vertical;
  }
  update(data) {
    this._data = data;
  }
  renderer() {
    return new AxisPaneRenderer(this._data, this._vertical);
  }
  zOrder() {
    return "bottom";
  }
}
class PriceRangeAxisPaneView extends AxisPaneView {
  constructor(data = null) {
    super(data, true);
  }
}
class TimeRangeAxisPaneView extends AxisPaneView {
  constructor(data = null) {
    super(data, false);
  }
}
export {
  PriceRangeAxisPaneView as P,
  TimeRangeAxisPaneView as T
};
