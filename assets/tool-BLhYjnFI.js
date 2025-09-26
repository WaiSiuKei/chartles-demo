var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { T as ToolPaneView, a as ToolPrimitive, A as AddPointResponse, D as DrawingTool } from "./toolPaneView-BAEHHn7m.js";
import { an as PolylineToolType } from "./index-DNbtFiKr.js";
import { L as LineStyleType, e as ensure, bY as euclideanDistanceBetweenPoints, bQ as interactionTolerance, A as AnchorPoint } from "./index-DSkroicZ.js";
import { P as PriceRangeAxisPaneView, T as TimeRangeAxisPaneView } from "./axisPaneView-Pbgdotf1.js";
import { C as CompositeRenderer } from "./composite-BOGQNAfc.js";
import { P as PolygonRenderer } from "./polygon-C6s4PX2h.js";
import "./baseTool-BVX9dcKc.js";
import "./line-CuaAD_DW.js";
class PolylinePaneView extends ToolPaneView {
  constructor() {
    super(...arguments);
    __publicField(this, "_renderer", new CompositeRenderer(this._hitTestCollector));
    __publicField(this, "_polygonRenderer", new PolygonRenderer());
  }
  renderer() {
    return this._renderer;
  }
  _updateImpl() {
    this._renderer.clear();
    const props = this._source.properties();
    this._polygonRenderer.setData({
      points: this.points(),
      lineColor: props.lineColor,
      lineWidth: props.lineWidth,
      lineStyle: LineStyleType.solid,
      filled: this._data.filled,
      background: props.backgroundColor,
      transparency: props.transparency
    });
    this._renderer.append(this._polygonRenderer);
    this.addAnchors(this._renderer);
  }
}
class PolylinePrimitive extends ToolPrimitive {
  constructor() {
    super(...arguments);
    __publicField(this, "_lines", new PolylinePaneView(this, this.model));
    __publicField(this, "_paneView", [this._lines]);
    __publicField(this, "_priceAxisPaneViews", [new PriceRangeAxisPaneView(/* @__PURE__ */ Object.create(null))]);
    __publicField(this, "_timeAxisPaneViews", [new TimeRangeAxisPaneView(/* @__PURE__ */ Object.create(null))]);
    __publicField(this, "_filled", false);
  }
  pointsCount() {
    return Infinity;
  }
  addPoint(point, step) {
    if (this.controlPoints.length > 1) {
      const screenPoint = ensure(this.pointToScreenPoint(point));
      const lastControlPoint = this.controlPoints[this.controlPoints.length - 2];
      const lastScreenPoint = ensure(this.pointToScreenPoint(lastControlPoint));
      const distanceToLast = euclideanDistanceBetweenPoints(screenPoint, lastScreenPoint);
      const tolerance = interactionTolerance().minDistanceBetweenPoints;
      if (distanceToLast < tolerance) {
        return AddPointResponse.Reject;
      }
      const firstScreenPoint = ensure(this.pointToScreenPoint(this.controlPoints[0]));
      const distanceToFirst = euclideanDistanceBetweenPoints(screenPoint, firstScreenPoint);
      if (distanceToFirst < tolerance) {
        this._filled = true;
        this.controlPoints.splice(step, 1);
        return AddPointResponse.AcceptAndFinish;
      }
    }
    return super.addPoint(point, step);
  }
  setPoint(pointIndex, point, details) {
    const isHeadOrTail = pointIndex === 0 || pointIndex === this.controlPoints.length - 1;
    if (!isHeadOrTail) return;
    const anchorPoint = pointIndex === this.controlPoints.length - 1 ? this.controlPoints[0] : this.controlPoints[this.controlPoints.length - 1];
    const anchorScreenPoint = ensure(this.pointToScreenPoint(anchorPoint));
    const distance = euclideanDistanceBetweenPoints(details.screenPoint, anchorScreenPoint);
    if (distance < interactionTolerance().minDistanceBetweenPoints) {
      this._filled = true;
    }
  }
  updateAllViews() {
    if (!this.controlPoints.length) return;
    const xs = [];
    const ys = [];
    const points = [];
    for (let i = 0; i < this.controlPoints.length; i++) {
      const p = this.controlPoints[i];
      const drawPoint = this.pointToScreenPoint(p);
      if (!drawPoint) return;
      points.push(new AnchorPoint(drawPoint, { pointIndex: i }));
    }
    if (xs.length) {
      this._timeAxisPaneViews[0].update(
        this._calculateTimeAxisPaneViewsData(Math.min.apply(null, xs), Math.max.apply(null, xs))
      );
    }
    if (ys.length) {
      this._priceAxisPaneViews[0].update(
        this._calculatePriceAxisPaneViewData(Math.min.apply(null, ys), Math.max.apply(null, ys))
      );
    }
    this._lines.update({ points, filled: this._filled });
  }
}
class PolylineTool extends DrawingTool {
  constructor() {
    super(...arguments);
    __publicField(this, "type", PolylineToolType);
  }
  createPrimitive() {
    return new PolylinePrimitive(
      {
        id: this.id,
        points: [],
        lineColor: "#00BCD4",
        lineWidth: 2,
        backgroundColor: "#00BCD4",
        transparency: 80
      },
      ...this.resetArgs
    );
  }
}
export {
  PolylineTool
};
