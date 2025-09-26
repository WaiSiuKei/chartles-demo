var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { b6 as NOTIMPLEMENTED, L as LineStyleType, e as ensure, A as AnchorPoint, z as HitTarget, bN as LineEnd } from "./index-DSkroicZ.js";
import { T as ToolPaneView, a as ToolPrimitive, i as isPointAccepted, D as DrawingTool } from "./toolPaneView-BAEHHn7m.js";
import { aj as CurveToolType } from "./index-DNbtFiKr.js";
import { P as PriceLabelPriceAxisView } from "./priceLabelPriceAxisView-d9Maj5lR.js";
import { T as TimeLabelTimeAxisView } from "./timeLabelTimeAxisView-BvW_UnA0.js";
import { P as PriceRangeAxisPaneView, T as TimeRangeAxisPaneView } from "./axisPaneView-Pbgdotf1.js";
import { B as BezierQuadroRenderer } from "./bezierQuadro-D4dBmMa7.js";
import { C as CompositeRenderer } from "./composite-BOGQNAfc.js";
import "./baseTool-BVX9dcKc.js";
import "./line-CuaAD_DW.js";
class CurvePaneView extends ToolPaneView {
  constructor() {
    super(...arguments);
    __publicField(this, "_renderer", new CompositeRenderer(this._hitTestCollector));
    __publicField(this, "_bezierQuadroRenderer", new BezierQuadroRenderer());
  }
  renderer() {
    return this._renderer;
  }
  _updateImpl() {
    this._renderer.clear();
    const props = this._source.properties();
    const extendLeftSegments = [];
    const extendRightSegments = [];
    const sourcePoints = this.points();
    if (sourcePoints.length === 3) {
      if (props.extendLeft) {
        NOTIMPLEMENTED();
      }
      if (props.extendRight) {
        NOTIMPLEMENTED();
      }
    }
    const renderingPoints = [...this.points()];
    const rendererData = {
      points: renderingPoints,
      lineColor: props.lineColor,
      lineWidth: props.lineWidth,
      lineStyle: LineStyleType.solid,
      leftEnd: props.leftEnd,
      rightEnd: props.rightEnd,
      fillBack: props.fillBack,
      backColor: props.backColor,
      extendLeftSegments,
      extendRightSegments
    };
    this._bezierQuadroRenderer.setData(rendererData);
    this._renderer.append(this._bezierQuadroRenderer);
    this.addAnchors(this._renderer);
  }
}
class CurvePrimitive extends ToolPrimitive {
  constructor() {
    super(...arguments);
    __publicField(this, "_lines", new CurvePaneView(this, this.model));
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
    return 2;
  }
  updateMove(point, step) {
    super.updateMove(point, step);
    if (step === 1) {
      this._updateControlPoint();
    }
  }
  addPoint(point, step) {
    const resp = super.addPoint(point, step);
    if (isPointAccepted(resp) && step === 1) {
      this._updateControlPoint();
    }
    return resp;
  }
  _updateControlPoint() {
    this.controlPoints[2] = this._calculateControlPoint();
  }
  _calculateControlPoint() {
    const screenPoint0 = ensure(this.pointToScreenPoint(this.controlPoints[0]));
    const screenPoint1 = ensure(this.pointToScreenPoint(this.controlPoints[1]));
    const directionVector = screenPoint1.subtract(screenPoint0);
    const perpendicularOffset = directionVector.scaled(0.5).transposed().scaled(0.3);
    const midpoint = screenPoint0.add(screenPoint1).scaled(0.5);
    const controlPointScreen = midpoint.add(perpendicularOffset);
    return this.screenPointToPoint(controlPointScreen);
  }
  updateAllViews() {
    if (!this.controlPoints.length) return;
    const xs = [];
    const ys = [];
    const anchorPoints = [];
    for (let i = 0; i < this.controlPoints.length; i++) {
      const point = this.controlPoints[i];
      const drawPoint = this.pointToScreenPoint(point);
      if (!drawPoint) return;
      xs.push(drawPoint.x);
      ys.push(drawPoint.y);
      const anchorPoint = new AnchorPoint(drawPoint, {
        pointIndex: i,
        hitTarget: HitTarget.ChangePoint
      });
      anchorPoints.push(anchorPoint);
      if (i <= 1) {
        this._timeAxisViews[i].update(this._calculateTimeAxisViewData(point.time, drawPoint.x));
        this._priceAxisViews[i].update(this._calculatePriceAxisViewData(point.price, drawPoint.y));
      }
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
    this._lines.update({ points: anchorPoints });
  }
}
class CurveTool extends DrawingTool {
  constructor() {
    super(...arguments);
    __publicField(this, "type", CurveToolType);
  }
  createPrimitive() {
    return new CurvePrimitive(
      {
        id: this.id,
        points: [],
        lineColor: "#2962FFFF",
        lineWidth: 2,
        leftEnd: LineEnd.Normal,
        rightEnd: LineEnd.Normal,
        extendLeft: false,
        extendRight: false,
        fillBack: false,
        backColor: "#2962FF33"
      },
      ...this.resetArgs
    );
  }
}
export {
  CurveTool
};
