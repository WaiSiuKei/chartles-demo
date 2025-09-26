import { B as BitmapCoordinatesPaneRenderer, b3 as setLineStyle, bO as addExclusionAreaByScope, co as drawVerticalLine, bQ as interactionTolerance } from "./index-DSkroicZ.js";
class VerticalLineRenderer extends BitmapCoordinatesPaneRenderer {
  /**
   * 命中检测（交互响应）
   */
  hitTest(point) {
    if (!this._data || !this._hitTest) return null;
    const tol = interactionTolerance().line;
    const xMatch = Math.abs(point.x - this._data.x) <= tol + this._data.lineWidth / 2;
    const topInBounds = this._data.top === void 0 || this._data.top - point.y <= tol;
    const bottomInBounds = this._data.bottom === void 0 || point.y - this._data.bottom <= tol;
    return xMatch && topInBounds && bottomInBounds ? this._hitTest : null;
  }
  drawImpl(renderParams) {
    if (!this._data || this._data.lineWidth <= 0) return;
    const {
      context: ctx,
      horizontalPixelRatio: hpx,
      verticalPixelRatio: vpx,
      mediaSize
    } = renderParams;
    const xPixel = this._data.x;
    if (xPixel < -this._data.lineWidth / 2 || xPixel > mediaSize.width + this._data.lineWidth / 2) {
      return;
    }
    ctx.lineCap = "butt";
    ctx.strokeStyle = this._data.lineColor;
    ctx.lineWidth = Math.max(1, Math.floor(this._data.lineWidth * hpx));
    if (this._data.lineStyle !== void 0) {
      setLineStyle(ctx, this._data.lineStyle);
    }
    const yTop = this._data.top !== void 0 ? Math.max(0, this._data.top) : 0;
    const yBottom = this._data.bottom !== void 0 ? Math.min(mediaSize.height, this._data.bottom) : mediaSize.height;
    const x = Math.round(xPixel * hpx);
    const y1 = Math.floor(yTop * vpx);
    const y2 = Math.ceil(yBottom * vpx);
    if (this._data.excludeBoundaries !== void 0) {
      addExclusionAreaByScope(renderParams, this._data.excludeBoundaries);
    }
    drawVerticalLine(ctx, x, y1, y2);
  }
}
export {
  VerticalLineRenderer as V
};
