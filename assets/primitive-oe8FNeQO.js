var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { bJ as MediaCoordinatesPaneRenderer, bM as generateColor, u as Point, bN as LineEnd, y as HitTestResult, z as HitTarget, A as AnchorPoint, e as ensure } from "./index-DSkroicZ.js";
import { P as PriceLabelPriceAxisView } from "./priceLabelPriceAxisView-d9Maj5lR.js";
import { T as TimeLabelTimeAxisView } from "./timeLabelTimeAxisView-BvW_UnA0.js";
import { P as PriceRangeAxisPaneView, T as TimeRangeAxisPaneView } from "./axisPaneView-Pbgdotf1.js";
import { a as ToolPrimitive } from "./toolPaneView-BAEHHn7m.js";
import { V as VerticalAlign, H as HorizontalAlign } from "./text-DNYLW3w-.js";
import { C as CompositeRenderer } from "./composite-BOGQNAfc.js";
import { L as LineRenderer } from "./line-CuaAD_DW.js";
import { F as FibWIthLabelsPaneView } from "./paneView-C9pa4pz3.js";
class ArcWedgeRenderer extends MediaCoordinatesPaneRenderer {
  hitTest(mousePoint) {
    if (this._data === null) return null;
    const delta = mousePoint.subtract(this._data.center);
    const distance = delta.length();
    if (Math.abs(distance - this._data.radius) <= 4) {
      const d1 = mousePoint.subtract(this._data.p1).length();
      const d2 = mousePoint.subtract(this._data.p2).length();
      if (Math.max(d1, d2) <= this._data.p1.subtract(this._data.p2).length()) {
        return this._hitTest;
      }
    }
    if (this._data.fillBackground && distance <= this._data.radius) {
      const fromCenterToP1 = this._data.p1.subtract(this._data.center).normalized();
      const fromCenterToP2 = this._data.p2.subtract(this._data.center).normalized();
      const toMouse = delta.normalized();
      const dot12 = fromCenterToP1.dotProduct(fromCenterToP2);
      const dotMouseP1 = toMouse.dotProduct(fromCenterToP1);
      const dotMouseP2 = toMouse.dotProduct(fromCenterToP2);
      if (dotMouseP1 >= dot12 && dotMouseP2 >= dot12) {
        return this._backgroundHitTest;
      }
    }
    return null;
  }
  drawImpl(renderCtx) {
    if (this._data === null) return;
    const ctx = renderCtx.context;
    ctx.beginPath();
    ctx.strokeStyle = this._data.color;
    ctx.lineWidth = this._data.linewidth;
    ctx.arc(
      this._data.center.x,
      this._data.center.y,
      this._data.radius,
      this._data.angle1,
      this._data.angle2
    );
    ctx.stroke();
    if (!this._data.fillBackground) return;
    ctx.arc(
      this._data.center.x,
      this._data.center.y,
      this._data.prevRadius,
      this._data.angle2,
      this._data.angle1,
      true
    );
    if (this._data.gradient) {
      const gradient = ctx.createRadialGradient(
        this._data.center.x,
        this._data.center.y,
        this._data.prevRadius,
        this._data.center.x,
        this._data.center.y,
        this._data.radius
      );
      gradient.addColorStop(0, generateColor(this._data.color1, this._data.transparency));
      gradient.addColorStop(1, generateColor(this._data.color2, this._data.transparency));
      ctx.fillStyle = gradient;
    } else {
      ctx.fillStyle = generateColor(this._data.color, this._data.transparency, true);
    }
    ctx.fill();
  }
}
class FibWedgePaneView extends FibWIthLabelsPaneView {
  constructor() {
    super(...arguments);
    __publicField(this, "_renderer", new CompositeRenderer(this._hitTestCollector));
    __publicField(this, "_baseTrendRenderer", new LineRenderer());
    __publicField(this, "_edgeTrendRenderer", new LineRenderer());
  }
  renderer() {
    return this._renderer;
  }
  _updateImpl() {
    this._renderer.clear();
    const points = this.points();
    if (!(points == null ? void 0 : points.length)) return;
    if (points.length < 3) {
      this._updateRenderer();
      return;
    }
    const [centerPoint, radiusPoint, directionPoint] = points;
    const vector1 = radiusPoint.subtract(centerPoint).normalized();
    const vector2 = directionPoint.subtract(centerPoint).normalized();
    const unitX = new Point(1, 0);
    const unitY = new Point(0, 1);
    let angle1 = Math.acos(vector1.dotProduct(unitX));
    if (vector1.dotProduct(unitY) < 0) angle1 = 2 * Math.PI - angle1;
    let angle2 = Math.acos(vector2.dotProduct(unitX));
    if (vector2.dotProduct(unitY) < 0) angle2 = 2 * Math.PI - angle2;
    if (angle2 < angle1) {
      [angle1, angle2] = [angle2, angle1];
    }
    if (Math.abs(angle1 - angle2) > Math.PI) {
      const min = Math.min(angle1, angle2);
      angle1 = Math.max(angle1, angle2);
      angle2 = min + 2 * Math.PI;
    }
    const props = this._source.properties();
    if (points.length >= 2) {
      const levels = props.levels.reduce((acc, levelProps, i) => {
        const coeff = levelProps.coeff;
        const color = levelProps.color;
        const radiusLen = Math.abs(radiusPoint.subtract(centerPoint).length() * coeff);
        const centerDirection = vector1.add(vector2).scaled(0.5).normalized().scaled(radiusLen);
        const labelPosition = centerPoint.add(centerDirection);
        const p1 = centerPoint.add(vector1.scaled(radiusLen));
        const p2 = centerPoint.add(vector2.scaled(radiusLen));
        acc.push({
          coeff,
          color,
          radius: radiusLen,
          labelPoint: labelPosition,
          p1,
          p2,
          linewidth: props.levelsStyle.linewidth,
          linestyle: props.levelsStyle.linestyle,
          index: i
        });
        return acc;
      }, []);
      this._updateRenderer(angle1, angle2, levels);
    }
  }
  _updateRenderer(angle1 = NaN, angle2 = NaN, levels = []) {
    var _a;
    if (((_a = this.points()) == null ? void 0 : _a.length) < 2) return;
    const props = this._source.properties();
    const [centerPoint, radiusPoint] = this.points();
    const trendVisible = props.trendline.visible;
    const trendLineWidth = trendVisible ? props.trendline.linewidth : 0;
    const trendStyle = props.trendline.linestyle;
    this._baseTrendRenderer.setData({
      points: [centerPoint, radiusPoint],
      lineColor: props.trendline.color,
      lineWidth: trendLineWidth,
      lineStyle: trendStyle,
      extendLeft: false,
      extendRight: false,
      leftEnd: LineEnd.Normal,
      rightEnd: LineEnd.Normal
    });
    this._renderer.append(this._baseTrendRenderer);
    if (this.points().length < 3) {
      this.addAnchors(this._renderer);
      return;
    }
    let thirdPoint = this.points()[2];
    const baseLength = radiusPoint.subtract(centerPoint).length();
    const direction = thirdPoint.subtract(centerPoint).normalized();
    thirdPoint = centerPoint.add(direction.scaled(baseLength));
    this._edgeTrendRenderer.setData({
      points: [centerPoint, thirdPoint],
      lineColor: props.trendline.color,
      lineWidth: trendLineWidth,
      lineStyle: trendStyle,
      extendLeft: false,
      extendRight: false,
      leftEnd: LineEnd.Normal,
      rightEnd: LineEnd.Normal
    });
    this._renderer.append(this._edgeTrendRenderer);
    for (let i = levels.length - 1; i >= 0; i--) {
      const level = levels[i];
      const arcRenderer = new ArcWedgeRenderer();
      arcRenderer.setData({
        center: this.points()[0],
        radius: level.radius,
        prevRadius: i > 0 ? levels[i - 1].radius : 0,
        color: level.color,
        linewidth: level.linewidth,
        angle1,
        angle2,
        p1: level.p1,
        p2: level.p2,
        fillBackground: props.fillBackground,
        transparency: props.transparency,
        color1: "",
        color2: ""
      });
      arcRenderer.setHitTest(new HitTestResult(HitTarget.MovePoint));
      this._renderer.append(arcRenderer);
      const labelRenderer = this._updateLabelForLevel({
        levelIndex: level.index,
        coeff: level.coeff,
        color: level.color,
        leftPoint: level.labelPoint,
        rightPoint: level.labelPoint,
        price: "",
        horzAlign: HorizontalAlign.Left,
        vertAlign: VerticalAlign.Middle
      });
      if (labelRenderer) {
        this._renderer.append(labelRenderer);
      }
    }
    const anchorPoints = [centerPoint, radiusPoint];
    if (this._model.currentCreating !== this._source) {
      anchorPoints.push(new AnchorPoint(thirdPoint, { pointIndex: 2 }));
    }
    const anchors = this.createLineAnchor(
      {
        points: anchorPoints
      },
      0
    );
    this._renderer.append(anchors);
  }
}
class FibWedgePrimitive extends ToolPrimitive {
  constructor() {
    super(...arguments);
    __publicField(this, "_lines", new FibWedgePaneView(this, this.model));
    __publicField(this, "_paneView", [this._lines]);
    __publicField(this, "_priceAxisPaneViews", [new PriceRangeAxisPaneView(/* @__PURE__ */ Object.create(null))]);
    __publicField(this, "_timeAxisPaneViews", [new TimeRangeAxisPaneView(/* @__PURE__ */ Object.create(null))]);
    __publicField(this, "_timeAxisViews", [
      new TimeLabelTimeAxisView(/* @__PURE__ */ Object.create(null)),
      new TimeLabelTimeAxisView(/* @__PURE__ */ Object.create(null)),
      new TimeLabelTimeAxisView(/* @__PURE__ */ Object.create(null))
    ]);
    __publicField(this, "_priceAxisViews", [
      new PriceLabelPriceAxisView(/* @__PURE__ */ Object.create(null)),
      new PriceLabelPriceAxisView(/* @__PURE__ */ Object.create(null)),
      new PriceLabelPriceAxisView(/* @__PURE__ */ Object.create(null))
    ]);
  }
  pointsCount() {
    return 3;
  }
  setPoint(index, point, details) {
    super.setPoint(index, point, details);
    if (index === 2) {
      const screenP0 = ensure(this.pointToScreenPoint(this.controlPoints[0]));
      let screenP1 = ensure(this.pointToScreenPoint(this.controlPoints[1]));
      const screenP2 = ensure(this.pointToScreenPoint(this.controlPoints[2]));
      const radialLength = screenP2.subtract(screenP0).length();
      let baseVector = screenP1.subtract(screenP0);
      if (baseVector.length() <= 0) baseVector = new Point(1, 0);
      screenP1 = screenP0.add(baseVector.normalized().scaled(radialLength));
      const newPointData = ensure(this.screenPointToPoint(screenP1));
      this.controlPoints[1] = newPointData;
    } else {
      const screenP0 = ensure(this.pointToScreenPoint(this.controlPoints[0]));
      const screenP1 = ensure(this.pointToScreenPoint(this.controlPoints[1]));
      let screenP2 = ensure(this.pointToScreenPoint(this.controlPoints[2]));
      const radialLength = screenP1.subtract(screenP0).length();
      let directionVector = screenP2.subtract(screenP0);
      if (directionVector.length() <= 0) directionVector = new Point(1, 0);
      screenP2 = screenP0.add(directionVector.normalized().scaled(radialLength));
      const newPointData = ensure(this.screenPointToPoint(screenP2));
      this.controlPoints[2] = newPointData;
    }
  }
  addPoint(point, step) {
    if (step === 2) {
      const screenP0 = ensure(this.pointToScreenPoint(this.controlPoints[0]));
      const screenP1 = ensure(this.pointToScreenPoint(this.controlPoints[1]));
      let screenP2 = ensure(this.pointToScreenPoint(point));
      const radiusLength = screenP1.subtract(screenP0).length();
      const direction = screenP2.subtract(screenP0).normalized();
      screenP2 = screenP0.add(direction.scaled(radiusLength));
      point = this.screenPointToPoint(screenP2);
    }
    return super.addPoint(point, step);
  }
  updateAllViews() {
    if (!this.controlPoints.length) return;
    const points = [];
    for (let i = 0; i < this.controlPoints.length; i++) {
      const p = this.controlPoints[i];
      const drawPoint = this.pointToScreenPoint(p);
      if (!drawPoint) return;
      points.push(new AnchorPoint(drawPoint, { pointIndex: i }));
    }
    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);
    this.controlPoints.forEach((p, i) => {
      this._timeAxisViews[i].update(this._calculateTimeAxisViewData(p.time, points[i].x));
      this._priceAxisViews[i].update(this._calculatePriceAxisViewData(p.price, points[i].y));
    });
    if (xs.length > 1) {
      this._timeAxisPaneViews[0].update(
        this._calculateTimeAxisPaneViewsData(Math.min.apply(null, xs), Math.max.apply(null, xs))
      );
    }
    if (ys.length > 1) {
      this._priceAxisPaneViews[0].update(
        this._calculatePriceAxisPaneViewData(Math.min.apply(null, ys), Math.max.apply(null, ys))
      );
    }
    this._lines.update({ points });
  }
}
export {
  ArcWedgeRenderer as A,
  FibWedgePrimitive as F,
  FibWedgePaneView as a
};
