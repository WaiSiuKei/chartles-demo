var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { bJ as MediaCoordinatesPaneRenderer, b3 as setLineStyle, bN as LineEnd, y as HitTestResult, z as HitTarget, cd as dpr1PixelRatioInfo, bQ as interactionTolerance, L as LineStyleType, e as ensure, A as AnchorPoint } from "./index-DSkroicZ.js";
import { T as ToolPaneView, a as ToolPrimitive, D as DrawingTool } from "./toolPaneView-BAEHHn7m.js";
import { ak as DoubleCurveToolType } from "./index-DNbtFiKr.js";
import { P as PriceLabelPriceAxisView } from "./priceLabelPriceAxisView-d9Maj5lR.js";
import { T as TimeLabelTimeAxisView } from "./timeLabelTimeAxisView-BvW_UnA0.js";
import { P as PriceRangeAxisPaneView, T as TimeRangeAxisPaneView } from "./axisPaneView-Pbgdotf1.js";
import { b as buildExtendedSegments, q as quadroBezierHitTest, c as cubicBezierHitTest, h as hitTestExtendedPoints } from "./bezierQuadro-D4dBmMa7.js";
import { d as drawArrow } from "./line-CuaAD_DW.js";
import { C as CompositeRenderer } from "./composite-BOGQNAfc.js";
import "./baseTool-BVX9dcKc.js";
class BezierCubicRenderer extends MediaCoordinatesPaneRenderer {
  drawImpl(scope) {
    if (!this._data) return;
    const ctx = scope.context;
    ctx.lineCap = "round";
    ctx.strokeStyle = this._data.lineColor;
    ctx.lineWidth = this._data.lineWidth;
    setLineStyle(ctx, this._data.lineStyle);
    const p0 = this._data.points[0];
    const p1 = this._data.points[1];
    if (this._data.points.length === 2) {
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.stroke();
      if (this._data.leftEnd === LineEnd.Arrow) {
        drawArrow(p1, p0, ctx, ctx.lineWidth, dpr1PixelRatioInfo);
      }
      if (this._data.rightEnd === LineEnd.Arrow) {
        drawArrow(p0, p1, ctx, ctx.lineWidth, dpr1PixelRatioInfo);
      }
    } else {
      const cp1 = this._data.points[2];
      const cp2 = this._data.points[3];
      const v_c = cp2.subtract(p0);
      const leftCP1 = cp1.subtract(v_c.scaled(0.25));
      const leftCP2 = cp1.add(v_c.scaled(0.25));
      const v_r = cp2.subtract(cp1);
      const rightCP1 = cp2.subtract(v_r.scaled(0.25));
      const rightCP2 = cp2.add(v_r.scaled(0.25));
      if (this._data.fillBack && this._data.points.length > 2) {
        ctx.fillStyle = this._data.backColor;
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.quadraticCurveTo(leftCP1.x, leftCP1.y, cp1.x, cp1.y);
        ctx.bezierCurveTo(leftCP2.x, leftCP2.y, rightCP1.x, rightCP1.y, cp2.x, cp2.y);
        ctx.quadraticCurveTo(rightCP2.x, rightCP2.y, p1.x, p1.y);
        ctx.fill();
      }
      ctx.beginPath();
      buildExtendedSegments(ctx, this._data.extendLeftPoints);
      ctx.moveTo(p0.x, p0.y);
      ctx.quadraticCurveTo(leftCP1.x, leftCP1.y, cp1.x, cp1.y);
      ctx.bezierCurveTo(leftCP2.x, leftCP2.y, rightCP1.x, rightCP1.y, cp2.x, cp2.y);
      ctx.quadraticCurveTo(rightCP2.x, rightCP2.y, p1.x, p1.y);
      buildExtendedSegments(ctx, this._data.extendRightPoints);
      if (this._data.leftEnd === LineEnd.Arrow) {
        drawArrow(leftCP1, p0, ctx, ctx.lineWidth, dpr1PixelRatioInfo);
      }
      if (this._data.rightEnd === LineEnd.Arrow) {
        drawArrow(rightCP2, p1, ctx, ctx.lineWidth, dpr1PixelRatioInfo);
      }
      ctx.stroke();
    }
  }
  hitTest(point) {
    const data = this._data;
    if (!data) return null;
    if (data.points.length !== 4) return null;
    const tolerance = interactionTolerance().curve;
    const [p0, p1, cp1, cp2] = data.points;
    const vectorP0ToCp2 = cp2.subtract(p0);
    const leftQuadCP = cp1.subtract(vectorP0ToCp2.scaled(0.25));
    const cubicCP1 = cp1.add(vectorP0ToCp2.scaled(0.25));
    const vectorInner = p1.subtract(cp1);
    const cubicCP2 = cp2.subtract(vectorInner.scaled(0.25));
    const rightQuadCP = cp2.add(vectorInner.scaled(0.25));
    const hitOnLeft = quadroBezierHitTest(cp1, p0, leftQuadCP, point, tolerance);
    const hitOnCenter = cubicBezierHitTest(cp1, cubicCP1, cubicCP2, cp2, point, tolerance);
    const hitOnRight = quadroBezierHitTest(cp2, p1, rightQuadCP, point, tolerance);
    if (hitOnLeft || hitOnCenter || hitOnRight) {
      return new HitTestResult(HitTarget.MovePoint);
    }
    let result = hitTestExtendedPoints(point, tolerance, data.extendLeftPoints);
    if (result === null) {
      result = hitTestExtendedPoints(point, tolerance, data.extendRightPoints);
    }
    return result;
  }
}
class DoubleCurvePaneView extends ToolPaneView {
  constructor() {
    super(...arguments);
    __publicField(this, "_renderer", new CompositeRenderer(this._hitTestCollector));
    __publicField(this, "_bezierCubicRenderer", new BezierCubicRenderer());
  }
  renderer() {
    return this._renderer;
  }
  _updateImpl() {
    this._renderer.clear();
    if (this.points().length < 2) return;
    const props = this._source.properties();
    const extendLeft = [];
    const extendRight = [];
    const curvePoints = this.points();
    const renderData = {
      points: curvePoints,
      lineColor: props.lineColor,
      lineWidth: props.lineWidth,
      lineStyle: LineStyleType.solid,
      leftEnd: props.leftEnd,
      rightEnd: props.rightEnd,
      fillBack: props.fillBack,
      backColor: props.backColor,
      extendLeftPoints: extendLeft,
      extendRightPoints: extendRight
    };
    this._bezierCubicRenderer.setData(renderData);
    this._renderer.append(this._bezierCubicRenderer);
    this.addAnchors(this._renderer);
  }
}
class DoubleCurvePrimitive extends ToolPrimitive {
  constructor() {
    super(...arguments);
    __publicField(this, "_lines", new DoubleCurvePaneView(this, this.model));
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
  updateMove(point, step) {
    super.updateMove(point, step);
    if (step === 1) {
      this._updateControlPoints();
    }
  }
  addPoint(point, step) {
    const resp = super.addPoint(point, step);
    if (step === 1) {
      this._updateControlPoints();
    }
    return resp;
  }
  _updateControlPoints() {
    const controlPoints = this._calculateControlPoints();
    this.controlPoints[2] = controlPoints[0];
    this.controlPoints[3] = controlPoints[1];
  }
  _calculateControlPoints() {
    const screenStart = ensure(this.pointToScreenPoint(this.controlPoints[0]));
    const screenEnd = ensure(this.pointToScreenPoint(this.controlPoints[1]));
    const middleVec = screenEnd.subtract(screenStart);
    const perpendicular = middleVec.scaled(0.5).transposed().scaled(0.3);
    const oneThird = screenStart.add(screenEnd).scaled(1 / 3);
    const twoThird = screenStart.add(screenEnd).scaled(2 / 3);
    const controlPoint1_screen = oneThird.add(perpendicular);
    const controlPoint2_screen = twoThird.subtract(perpendicular);
    const controlPoint1 = this.screenPointToPoint(controlPoint1_screen);
    const controlPoint2 = this.screenPointToPoint(controlPoint2_screen);
    return [controlPoint1, controlPoint2];
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
      if (i < 2) {
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
class DoubleCurveTool extends DrawingTool {
  constructor() {
    super(...arguments);
    __publicField(this, "type", DoubleCurveToolType);
  }
  createPrimitive() {
    return new DoubleCurvePrimitive(
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
  DoubleCurveTool
};
