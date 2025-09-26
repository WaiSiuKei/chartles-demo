var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { bN as LineEnd, bJ as MediaCoordinatesPaneRenderer, y as HitTestResult, z as HitTarget, b3 as setLineStyle, bQ as interactionTolerance, A as AnchorPoint, L as LineStyleType } from "./index-DSkroicZ.js";
import { T as ToolPaneView, a as ToolPrimitive, D as DrawingTool } from "./toolPaneView-BAEHHn7m.js";
import { w as FibSpiralToolType } from "./index-DNbtFiKr.js";
import { P as PriceLabelPriceAxisView } from "./priceLabelPriceAxisView-d9Maj5lR.js";
import { T as TimeLabelTimeAxisView } from "./timeLabelTimeAxisView-BvW_UnA0.js";
import { P as PriceRangeAxisPaneView, T as TimeRangeAxisPaneView } from "./axisPaneView-Pbgdotf1.js";
import { C as CompositeRenderer } from "./composite-BOGQNAfc.js";
import { L as LineRenderer } from "./line-CuaAD_DW.js";
import "./baseTool-BVX9dcKc.js";
const M = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89];
class FibonacciSpiralRenderer extends MediaCoordinatesPaneRenderer {
  hitTest(mousePoint) {
    if (this._data === null || this._data.points.length < 2) return null;
    const p0 = this._data.points[0];
    const p1 = this._data.points[1];
    const vector = p1.subtract(p0);
    const ray = vector.normalized();
    const normal = ray.transposed();
    const diff = mousePoint.subtract(p0);
    const dirFlag = this._data.counterclockwise ? -1 : 1;
    const diffNorm = diff.normalized();
    let angle = Math.acos(ray.dotProduct(diffNorm));
    if (Math.asin(normal.dotProduct(diffNorm)) < 0) angle = 2 * Math.PI - angle;
    const distanceFromCenter = diff.length();
    const tolerance = interactionTolerance().curve;
    for (let i = 0; i < 4; i++) {
      const rotateFactor = dirFlag * angle / (0.5 * Math.PI);
      let spiralRadius = this._getFibonacciInterpolated(rotateFactor + i * 4);
      if (spiralRadius !== null) {
        spiralRadius *= vector.length() / 5;
        if (Math.abs(spiralRadius - distanceFromCenter) < tolerance) {
          return new HitTestResult(HitTarget.MovePoint);
        }
      }
    }
    return null;
  }
  drawImpl(scope) {
    if (this._data === null || this._data.points.length < 2) return;
    const ctx = scope.context;
    const p0 = this._data.points[0];
    const p1 = this._data.points[1];
    ctx.save();
    ctx.lineCap = "round";
    ctx.strokeStyle = this._data.color;
    ctx.translate(p0.x, p0.y);
    let direction = p1.subtract(p0);
    const length = direction.length();
    direction = direction.normalized();
    let rotationRad = Math.acos(direction.x);
    if (Math.asin(direction.y) < 0) rotationRad = 2 * Math.PI - rotationRad;
    ctx.rotate(rotationRad);
    ctx.scale(length / 5, length / 5);
    ctx.lineWidth = this._data.linewidth;
    setLineStyle(ctx, this._data.linestyle);
    const deltaAngle = Math.PI / 100;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    const dirFlag = this._data.counterclockwise ? -1 : 1;
    for (let i = 0; i < 50 * (M.length - 1); i++) {
      const angle = dirFlag * i * deltaAngle;
      const spiralRadius = this._getFibonacciInterpolated(i / 50);
      if (spiralRadius === null) break;
      const x = Math.cos(angle) * spiralRadius;
      const y = Math.sin(angle) * spiralRadius;
      ctx.lineTo(x, y);
    }
    ctx.scale(5 / length, 5 / length);
    ctx.rotate(-rotationRad);
    ctx.stroke();
    ctx.restore();
  }
  _getFibonacciInterpolated(t) {
    const tInt = Math.floor(t);
    const tNext = Math.ceil(t);
    if (tNext >= M.length) return null;
    let fraction = t - tInt;
    fraction = Math.pow(fraction, 1.15);
    return M[tInt] + (M[tNext] - M[tInt]) * fraction;
  }
}
class FibSpiralPaneView extends ToolPaneView {
  constructor() {
    super(...arguments);
    __publicField(this, "_trendLineRenderer", new LineRenderer());
    __publicField(this, "_spiralRenderer", new FibonacciSpiralRenderer());
    __publicField(this, "_renderer", new CompositeRenderer(this._hitTestCollector));
  }
  renderer() {
    return this._renderer;
  }
  _updateImpl() {
    this._renderer.clear();
    const points = this.points();
    if ((points == null ? void 0 : points.length) < 2) return;
    const props = this._source.properties();
    {
      const trendLineData = {
        points,
        lineColor: props.lineColor,
        lineWidth: props.lineWidth,
        lineStyle: props.lineStyle,
        extendLeft: false,
        extendRight: true,
        leftEnd: LineEnd.Normal,
        rightEnd: LineEnd.Normal
      };
      this._trendLineRenderer.setData(trendLineData);
      this._renderer.append(this._trendLineRenderer);
    }
    {
      const spiralData = {
        points,
        color: props.lineColor,
        linewidth: props.lineWidth,
        linestyle: props.lineStyle,
        counterclockwise: props.counterclockwise
      };
      this._spiralRenderer.setData(spiralData);
      this._renderer.append(this._spiralRenderer);
    }
    this.addAnchors(this._renderer);
  }
}
class FibSpiralPrimitive extends ToolPrimitive {
  constructor() {
    super(...arguments);
    __publicField(this, "_lines", new FibSpiralPaneView(this, this.model));
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
class FibSpiralTool extends DrawingTool {
  constructor() {
    super(...arguments);
    __publicField(this, "type", FibSpiralToolType);
  }
  createPrimitive() {
    return new FibSpiralPrimitive(
      {
        id: this.id,
        points: [],
        lineWidth: 2,
        lineColor: "#00BCD4",
        lineStyle: LineStyleType.solid,
        counterclockwise: false
      },
      ...this.resetArgs
    );
  }
}
export {
  FibSpiralTool
};
