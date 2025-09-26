var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { T as ToolPaneView, a as ToolPrimitive, D as DrawingTool } from "./toolPaneView-3wj_on-u.js";
import { ap as RotatedRectangleToolType } from "./index-TSHQCVD9.js";
import { ce as distanceToLine, bN as LineEnd, L as LineStyleType, u as Point, A as AnchorPoint, e as ensure } from "./index-NZHt9VGv.js";
import { P as PriceRangeAxisPaneView, T as TimeRangeAxisPaneView } from "./axisPaneView-Pbgdotf1.js";
import { t as thirdPointCursorType } from "./handle-CW7PoDcs.js";
import { C as CompositeRenderer } from "./composite-tvPrNHN0.js";
import { L as LineRenderer } from "./line-DFhYRKvt.js";
import { P as PolygonRenderer } from "./polygon-CB5TCmTw.js";
import "./baseTool-CHlzZht2.js";
class RotatedRectanglePaneView extends ToolPaneView {
  constructor() {
    super(...arguments);
    __publicField(this, "_renderer", new CompositeRenderer(this._hitTestCollector));
    __publicField(this, "_poligonRenderer", new PolygonRenderer());
  }
  renderer() {
    return this._renderer;
  }
  _updateImpl() {
    this._renderer.clear();
    const points = this.points();
    if (!(points == null ? void 0 : points.length)) return;
    let offsetDistance = 0;
    if (points.length === 3) {
      offsetDistance = distanceToLine(points[0], points[1], points[2]).distance;
    }
    const properties = this._source.properties();
    const [point1, point2] = points;
    const anchorPoints = [];
    anchorPoints.push(point1);
    if (point2) {
      anchorPoints.push(point2);
    }
    if (points.length === 2) {
      const trendLineData = {
        points,
        lineColor: properties.color,
        lineWidth: 1,
        lineStyle: LineStyleType.solid,
        extendLeft: false,
        extendRight: false,
        leftEnd: LineEnd.Normal,
        rightEnd: LineEnd.Normal
      };
      const trendLineRenderer = new LineRenderer();
      trendLineRenderer.setData(trendLineData);
      this._renderer.append(trendLineRenderer);
    } else if (points.length === 3) {
      const directionVector = point2.subtract(point1);
      const perpendicular = new Point(directionVector.y, -directionVector.x).normalized().scaled(offsetDistance);
      const oppositePerpendicular = perpendicular.scaled(-1);
      const corner1 = point1.add(perpendicular);
      const corner2 = point2.add(perpendicular);
      const corner3 = point2.add(oppositePerpendicular);
      const corner4 = point1.add(oppositePerpendicular);
      const polygonData = {
        points: [corner1, corner2, corner3, corner4],
        lineColor: properties.color,
        lineWidth: properties.linewidth,
        lineStyle: LineStyleType.solid,
        filled: properties.fillBackground,
        background: properties.backgroundColor,
        transparency: properties.transparency
      };
      this._poligonRenderer.setData(polygonData);
      this._renderer.append(this._poligonRenderer);
      const cursorType = thirdPointCursorType(point1, point2);
      anchorPoints.push(
        ...polygonData.points.map((pt) => new AnchorPoint(pt, { pointIndex: 2, cursorType }))
      );
    }
    const anchorRenderer = this.createLineAnchor({ points: anchorPoints }, 0);
    this._renderer.append(anchorRenderer);
  }
}
class RotatedRectanglePrimitive extends ToolPrimitive {
  constructor() {
    super(...arguments);
    __publicField(this, "_lines", new RotatedRectanglePaneView(this, this.model));
    __publicField(this, "_paneView", [this._lines]);
    __publicField(this, "_priceAxisPaneViews", [new PriceRangeAxisPaneView(/* @__PURE__ */ Object.create(null))]);
    __publicField(this, "_timeAxisPaneViews", [new TimeRangeAxisPaneView(/* @__PURE__ */ Object.create(null))]);
    __publicField(this, "_distance", null);
  }
  pointsCount() {
    return 3;
  }
  startChanging(index) {
    super.startChanging(index);
    if (index === 0 || index === 1) {
      const p0 = ensure(this.pointToScreenPoint(this.controlPoints[0]));
      const p1 = ensure(this.pointToScreenPoint(this.controlPoints[1]));
      const p2 = ensure(this.pointToScreenPoint(this.controlPoints[2]));
      this._distance = distanceToLine(p0, p1, p2).distance;
    }
  }
  endChanging() {
    this._distance = null;
  }
  setPoint(index, point, details) {
    super.setPoint(index, point, details);
    if (index == 0 || index === 1) {
      const points = this.controlPoints;
      const screenP0 = ensure(this.pointToScreenPoint(points[0]));
      const screenP1 = ensure(this.pointToScreenPoint(points[1]));
      const directionVector = screenP1.subtract(screenP0);
      const perpendicularVector = new Point(directionVector.y, -directionVector.x).normalized().scaled(ensure(this._distance));
      const screenP2 = screenP0.add(perpendicularVector);
      const dataPointP2 = ensure(this.screenPointToPoint(screenP2));
      this.controlPoints[2] = dataPointP2;
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
    this._lines.update({ points });
  }
}
class RotatedRectangleTool extends DrawingTool {
  constructor() {
    super(...arguments);
    __publicField(this, "type", RotatedRectangleToolType);
  }
  createPrimitive() {
    return new RotatedRectanglePrimitive(
      {
        id: this.id,
        points: [],
        backgroundColor: "#4caf50",
        color: "#4caf50",
        fillBackground: true,
        linewidth: 2,
        transparency: 80
      },
      ...this.resetArgs
    );
  }
}
export {
  RotatedRectangleTool
};
