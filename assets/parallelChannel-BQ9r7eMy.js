var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { B as BitmapCoordinatesPaneRenderer, y as HitTestResult, z as HitTarget, bR as distanceToSegment, L as LineStyleType, b3 as setLineStyle, cl as drawPixelPerfectLine, cm as computeDashPattern, bS as arePointsEqual, ce as distanceToLine, u as Point, bQ as interactionTolerance, bU as lineThroughPoints, cj as halfplaneThroughPoint, ck as intersectPolygonAndHalfplane } from "./index-NZHt9VGv.js";
import { i as intersectLineWithViewport } from "./line-DZhB7Jxo.js";
class ParallelChannelRenderer extends BitmapCoordinatesPaneRenderer {
  constructor() {
    super(...arguments);
    __publicField(this, "_backgroundPolygon", null);
    __publicField(this, "_clippedLines", /* @__PURE__ */ new Map());
    __publicField(this, "_hitTest", new HitTestResult(HitTarget.MovePoint));
  }
  setData(data) {
    super.setData(data);
    this._backgroundPolygon = null;
    this._clippedLines.clear();
  }
  hitTest(pos, context) {
    if (!this._data) return null;
    const { line1, line2, middleLine } = this._data;
    const viewportSize = context.mediaSize;
    const tolerance = interactionTolerance().line;
    for (const line of [line1, line2, middleLine]) {
      if (!line) continue;
      const clipped = this._getClippedLine(line, this._data, viewportSize);
      if (clipped && distanceToSegment(clipped.points[0], clipped.points[1], pos).distance <= tolerance) {
        return this._hitTest;
      }
    }
    return null;
  }
  drawImpl(context) {
    if (!this._data) return;
    const {
      line1,
      line2,
      middleLine,
      skipLines,
      skipTopLine,
      fillBackground,
      backColor,
      excludeBoundaries
    } = this._data;
    const ctx = context.context;
    ctx.lineCap = "round";
    if (fillBackground && line2) {
      const polygon = this._getBackgroundPolygon(this._data, context.mediaSize);
      if (polygon.length > 0) {
        ctx.beginPath();
        const p0 = polygon[0];
        ctx.moveTo(p0.x * context.horizontalPixelRatio, p0.y * context.verticalPixelRatio);
        for (let i = 1; i < polygon.length; i++) {
          const p = polygon[i];
          ctx.lineTo(p.x * context.horizontalPixelRatio, p.y * context.verticalPixelRatio);
        }
        ctx.fillStyle = backColor;
        ctx.fill();
      }
    }
    if (!skipLines) {
      if (line1) this._drawLine(context, line1, this._data);
      if (!skipTopLine && line2) this._drawLine(context, line2, this._data);
      if (middleLine) this._drawLine(context, middleLine, this._data);
    }
    if (excludeBoundaries !== void 0) {
      ctx.restore();
    }
  }
  _drawLine(context, line, settings) {
    const clipped = this._getClippedLine(line, settings, context.mediaSize);
    if (!clipped) return;
    const ctx = context.context;
    ctx.lineWidth = Math.max(1, Math.floor(clipped.lineWidth * context.horizontalPixelRatio));
    ctx.lineCap = clipped.lineStyle === LineStyleType.solid ? "round" : "butt";
    setLineStyle(ctx, clipped.lineStyle);
    ctx.strokeStyle = clipped.color;
    const [start, end] = clipped.points;
    const x1 = start.x * context.horizontalPixelRatio;
    const y1 = start.y * context.verticalPixelRatio;
    const x2 = end.x * context.horizontalPixelRatio;
    const y2 = end.y * context.verticalPixelRatio;
    drawPixelPerfectLine(ctx, x1, y1, x2, y2);
  }
  _getClippedLine(line, data, viewport) {
    if (this._clippedLines.has(line)) {
      return this._clippedLines.get(line) ?? null;
    }
    const [p1, p2] = line.points;
    const needClip = p1.x !== p2.x ? { extendLeft: data.extendLeft, extendRight: data.extendRight } : void 0;
    const dashSize = computeDashPattern(line.lineWidth, line.lineStyle);
    const clippedPts = intersectLineWithViewport(
      p1,
      p2,
      !!(needClip == null ? void 0 : needClip.extendLeft),
      !!(needClip == null ? void 0 : needClip.extendRight),
      viewport.width,
      viewport.height,
      sumArrayValues(dashSize)
    );
    const result = clippedPts ? { ...line, points: clippedPts } : null;
    this._clippedLines.set(line, result);
    return result;
  }
  _getBackgroundPolygon(data, bounds) {
    if (!this._backgroundPolygon) {
      this._backgroundPolygon = this._getBackgroundPolygonImpl(data, bounds) ?? [];
    }
    return this._backgroundPolygon;
  }
  _getBackgroundPolygonImpl(data, bounds) {
    if (!data.line2) return null;
    const [p1, p2] = data.line1.points;
    const [p3, p4] = data.line2.points;
    if (arePointsEqual(p1, p2) || arePointsEqual(p3, p4) || distanceToLine(p1, p2, p3).distance < 1e-6 || distanceToLine(p1, p2, p4).distance < 1e-6) {
      return null;
    }
    if (bounds.width <= 0 || bounds.height <= 0) {
      return null;
    }
    let polygon = [
      new Point(0, 0),
      new Point(bounds.width, 0),
      new Point(bounds.width, bounds.height),
      new Point(0, bounds.height)
    ];
    polygon = clipStep(polygon, p1, p2, p4);
    if (!data.extendRight) polygon = clipStep(polygon, p2, p4, p3);
    polygon = clipStep(polygon, p4, p3, p1);
    if (!data.extendLeft) polygon = clipStep(polygon, p3, p1, p2);
    return polygon;
  }
}
function clipStep(polygon, from, to, include) {
  if (polygon === null) return null;
  const line = lineThroughPoints(from, to);
  const half = halfplaneThroughPoint(line, include);
  return intersectPolygonAndHalfplane(polygon, half);
}
function safeSumBy(array, iteratee) {
  let result = void 0;
  for (let i = 0; i < array.length; i++) {
    const value = iteratee(array[i]);
    if (value !== void 0) {
      result = result === void 0 ? value : result + value;
    }
  }
  return result;
}
function sumArrayValues(array) {
  if (!array || array.length === 0) return 0;
  return safeSumBy(array, (e) => e) ?? 0;
}
export {
  ParallelChannelRenderer as P
};
