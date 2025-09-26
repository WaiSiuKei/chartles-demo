var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { T as ToolPaneView, a as ToolPrimitive, D as DrawingTool } from "./toolPaneView-BAEHHn7m.js";
import { f as ArrowMarkerToolType } from "./index-DNbtFiKr.js";
import { P as PriceLabelPriceAxisView } from "./priceLabelPriceAxisView-d9Maj5lR.js";
import { T as TimeLabelTimeAxisView } from "./timeLabelTimeAxisView-BvW_UnA0.js";
import { bJ as MediaCoordinatesPaneRenderer, u as Point, y as HitTestResult, z as HitTarget, bQ as interactionTolerance, A as AnchorPoint } from "./index-DSkroicZ.js";
import { P as PriceRangeAxisPaneView, T as TimeRangeAxisPaneView } from "./axisPaneView-Pbgdotf1.js";
import { C as CompositeRenderer } from "./composite-BOGQNAfc.js";
import "./baseTool-BVX9dcKc.js";
class ArrowRenderer extends MediaCoordinatesPaneRenderer {
  drawImpl(scope) {
    if (!this._data) return;
    const points = this._data.points;
    if (points.length < 2) return;
    const ctx = scope.context;
    ctx.fillStyle = this._data.color;
    ctx.strokeStyle = this._data.color;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    let startPoint = new Point(points[0]);
    const endPoint = new Point(points[1]);
    let direction = endPoint.subtract(startPoint);
    const length = direction.length();
    if (length < 22) {
      startPoint = endPoint.addScaled(direction.normalized(), -22);
      direction = endPoint.subtract(startPoint);
    }
    const perpendicular = new Point(direction.y, -direction.x).normalized();
    const shapeProfile = this._arrowGeometry(direction.length());
    const unitDir = direction.normalized();
    ctx.lineWidth = (() => {
      let w = Math.round(0.02 * direction.length());
      w = Math.min(w, 5);
      w = Math.max(w, 2);
      return w;
    })();
    ctx.beginPath();
    ctx.moveTo(startPoint.x, startPoint.y);
    for (let i = 0; i < shapeProfile.length; i++) {
      const offset = shapeProfile[i];
      const p = startPoint.addScaled(unitDir, offset.x).addScaled(perpendicular, offset.y);
      ctx.lineTo(p.x, p.y);
    }
    ctx.lineTo(points[1].x, points[1].y);
    for (let i = shapeProfile.length - 1; i >= 0; i--) {
      const offset = shapeProfile[i];
      const p = startPoint.addScaled(unitDir, offset.x).addScaled(perpendicular, -offset.y);
      ctx.lineTo(p.x, p.y);
    }
    ctx.lineTo(startPoint.x, startPoint.y);
    ctx.stroke();
    ctx.fill();
  }
  _arrowGeometry(length) {
    const headWidth = calculateArrowHeadWidth(length);
    const points = [];
    const indentRatio = length >= 35 ? 0.1 : 0;
    const base = 0;
    const inset = length - headWidth + headWidth * indentRatio;
    const mid = length - headWidth;
    const tip = length;
    const offset = 1.22 * headWidth;
    points.push({ x: base, y: 0 });
    points.push({ x: inset, y: offset / 4 });
    points.push({ x: mid, y: offset / 2 });
    points.push({ x: tip, y: 0 });
    return points;
  }
  _hittestGeometry(length) {
    const headWidth = calculateArrowHeadWidth(length);
    const hitPoints = [];
    const baseX = 0;
    const shoulderX = length - headWidth;
    const tipX = length;
    const offsetY = 1.22 * headWidth;
    const shoulderY1 = offsetY / 4;
    const shoulderY2 = offsetY / 2;
    hitPoints.push({ x: baseX, y: 0 });
    hitPoints.push({ x: shoulderX, y: shoulderY1 });
    hitPoints.push({ x: shoulderX, y: shoulderY2 });
    hitPoints.push({ x: tipX, y: 0 });
    return hitPoints;
  }
  hitTest({ x, y }) {
    if (!this._data) return null;
    const points = this._data.points;
    if (points.length < 2) return null;
    const point = new Point(x, y);
    const end = new Point(points[1]);
    let start = new Point(points[0]);
    let direction = end.subtract(start);
    const length = direction.length();
    if (length < 22) {
      start = end.addScaled(direction.normalized(), -22);
      direction = end.subtract(start);
    }
    const toInput = point.subtract(start);
    const s = direction.dotProduct(toInput) / length;
    if (s < 0 || s > length) return null;
    const unitDir = direction.scaled(1 / length);
    const foot = start.addScaled(unitDir, s);
    const delta = point.subtract(foot);
    const tolerance = interactionTolerance().line;
    const geometry = this._hittestGeometry(length);
    for (let i = geometry.length - 2; i >= 0; i--) {
      const p0 = geometry[i];
      const p1 = geometry[i + 1];
      if (s >= p0.x) {
        const dx = p1.x - p0.x;
        const dy = p1.y - p0.y;
        const factor = (s - p0.x) / dx;
        const interpolatedWidth = p0.y + dy * factor;
        if (delta.length() <= interpolatedWidth + tolerance) {
          return new HitTestResult(HitTarget.MovePoint);
        } else {
          return null;
        }
      }
    }
    return delta.length() < 3 ? new HitTestResult(HitTarget.MovePoint) : null;
  }
}
function calculateArrowHeadWidth(length) {
  const MIN_HEAD_WIDTH = 18;
  const MAX_HEAD_WIDTH = 106;
  const HEAD_WIDTH_RATIO = 0.25;
  const MAX_HEAD_TO_LENGTH_RATIO = 0.9;
  if (length < 92) return MIN_HEAD_WIDTH;
  let headWidth = length * HEAD_WIDTH_RATIO;
  headWidth = Math.min(headWidth, MAX_HEAD_WIDTH);
  headWidth = Math.max(headWidth, MIN_HEAD_WIDTH);
  headWidth = Math.min(headWidth, length * MAX_HEAD_TO_LENGTH_RATIO);
  return headWidth;
}
class ArrowMarkerPaneView extends ToolPaneView {
  constructor() {
    super(...arguments);
    __publicField(this, "_renderer", new CompositeRenderer(this._hitTestCollector));
    __publicField(this, "_arrowRenderer", new ArrowRenderer());
  }
  renderer() {
    return this._renderer;
  }
  _updateImpl() {
    this._renderer.clear();
    const props = this._source.properties();
    this._arrowRenderer.setData({
      points: this.points(),
      color: props.color
    });
    this._renderer.append(this._arrowRenderer);
    this.addAnchors(this._renderer);
  }
}
class ArrowMarkerPrimitive extends ToolPrimitive {
  constructor() {
    super(...arguments);
    __publicField(this, "_lines", new ArrowMarkerPaneView(this, this.model));
    __publicField(this, "_paneView", [this._lines]);
    __publicField(this, "_priceAxisPaneViews", [new PriceRangeAxisPaneView(/* @__PURE__ */ Object.create(null))]);
    __publicField(this, "_timeAxisPaneViews", [new TimeRangeAxisPaneView(/* @__PURE__ */ Object.create(null))]);
    __publicField(this, "_timeAxisViews", [
      new TimeLabelTimeAxisView(/* @__PURE__ */ Object.create(null)),
      new TimeLabelTimeAxisView(/* @__PURE__ */ Object.create(null))
    ]);
    __publicField(this, "_priceAxisViews", [
      new PriceLabelPriceAxisView(/* @__PURE__ */ Object.create(null)),
      new PriceLabelPriceAxisView(/* @__PURE__ */ Object.create(null))
    ]);
  }
  pointsCount() {
    return 2;
  }
  updateAllViews() {
    if (!this.controlPoints.length) return;
    const points = [];
    const xs = [];
    const ys = [];
    for (let i = 0; i < this.controlPoints.length; i++) {
      const p = this.controlPoints[i];
      const drawPoint = this.pointToScreenPoint(p);
      if (!drawPoint) return;
      points.push(new AnchorPoint(drawPoint, { pointIndex: i }));
    }
    if (ys.length > 1) {
      this._priceAxisPaneViews[0].update(
        this._calculatePriceAxisPaneViewData(Math.min.apply(null, ys), Math.max.apply(null, ys))
      );
    }
    if (xs.length > 1) {
      this._timeAxisPaneViews[0].update(
        this._calculateTimeAxisPaneViewsData(Math.min.apply(null, xs), Math.max.apply(null, xs))
      );
    }
    this._lines.update({
      points
    });
  }
}
class ArrowMarkerTool extends DrawingTool {
  constructor() {
    super(...arguments);
    __publicField(this, "type", ArrowMarkerToolType);
  }
  createPrimitive() {
    return new ArrowMarkerPrimitive(
      {
        id: this.id,
        points: [],
        color: "#1E53E5FF"
      },
      ...this.resetArgs
    );
  }
}
export {
  ArrowMarkerTool
};
