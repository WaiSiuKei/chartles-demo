var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { u as Point, bJ as MediaCoordinatesPaneRenderer, y as HitTestResult, z as HitTarget, b3 as setLineStyle, A as AnchorPoint, L as LineStyleType } from "./index-NZHt9VGv.js";
import { T as ToolPaneView, a as ToolPrimitive, D as DrawingTool } from "./toolPaneView-3wj_on-u.js";
import { p as SineLineToolType } from "./index-TSHQCVD9.js";
import { P as PriceLabelPriceAxisView } from "./priceLabelPriceAxisView-d9Maj5lR.js";
import { T as TimeLabelTimeAxisView } from "./timeLabelTimeAxisView-BvW_UnA0.js";
import { P as PriceRangeAxisPaneView, T as TimeRangeAxisPaneView } from "./axisPaneView-Pbgdotf1.js";
import { C as CompositeRenderer } from "./composite-tvPrNHN0.js";
import "./baseTool-CHlzZht2.js";
class SineWaveRenderer extends MediaCoordinatesPaneRenderer {
  /**
   * 命中检测（用于拖动或交互）
   * 判断输入点 e 是否靠近当前正弦波
   */
  hitTest(e) {
    if (!this._data) return null;
    const localX = e.x - this._data.point.x;
    const angle = localX * Math.PI / this._data.width;
    const yLocal = Math.sin(angle - Math.PI / 2) * (this._data.height / 2);
    const yGlobal = this._data.point.y + yLocal + this._data.height / 2;
    return Math.abs(yGlobal - e.y) <= 3 ? new HitTestResult(HitTarget.MovePoint) : null;
  }
  drawImpl(scope) {
    if (!this._data) return;
    const ctx = scope.context;
    ctx.strokeStyle = this._data.color;
    ctx.lineWidth = this._data.lineWidth;
    setLineStyle(ctx, this._data.lineStyle);
    ctx.beginPath();
    ctx.moveTo(this._data.point.x, this._data.point.y);
    const step = Math.max(1, this._data.width / 30);
    const drawLength = scope.mediaSize.width - this._data.point.x + step;
    for (let offsetX = 1; offsetX <= drawLength; offsetX += step) {
      const angle = offsetX * Math.PI / this._data.width;
      const y = Math.sin(angle - Math.PI / 2) * (this._data.height / 2);
      const screenX = this._data.point.x + offsetX;
      const screenY = this._data.point.y + y + this._data.height / 2;
      ctx.lineTo(screenX, screenY);
    }
    ctx.stroke();
  }
}
class SineLinePaneView extends ToolPaneView {
  constructor() {
    super(...arguments);
    __publicField(this, "_renderer", new CompositeRenderer(this._hitTestCollector));
  }
  renderer() {
    return this._renderer;
  }
  _updateImpl() {
    this._renderer.clear();
    const points = this.points();
    if ((points == null ? void 0 : points.length) < 2) return;
    const canvasHeight = this._source.getScope().mediaSize.height;
    const [srcPoint1, srcPoint2] = points;
    if (2 * Math.abs(srcPoint1.x - srcPoint2.x) === 0) {
      this.addAnchors(this._renderer);
      return;
    }
    const [screenPt1, screenPt2] = points;
    const width = Math.abs(screenPt1.x - screenPt2.x);
    const height = screenPt2.y - screenPt1.y;
    const props = this._source.properties();
    const lineWidth = props.lineWidth;
    const outsideTop = screenPt1.y < -lineWidth && screenPt2.y < -lineWidth;
    const outsideBottom = screenPt1.y > canvasHeight + lineWidth && screenPt2.y > canvasHeight + lineWidth;
    if (outsideTop || outsideBottom) return;
    const repeatWidth = 2 * width;
    const alignedStartX = screenPt1.x > 0 ? screenPt1.x - Math.ceil(screenPt1.x / repeatWidth) * repeatWidth : screenPt1.x + Math.floor(-screenPt1.x / repeatWidth) * repeatWidth;
    const shapeParams = {
      point: new Point(alignedStartX, screenPt1.y),
      width,
      height,
      color: props.lineColor,
      lineWidth,
      lineStyle: props.lineStyle
    };
    this._renderer.append(new SineWaveRenderer(shapeParams));
    this.addAnchors(this._renderer);
  }
}
class SineLinePrimitive extends ToolPrimitive {
  constructor() {
    super(...arguments);
    __publicField(this, "_lines", new SineLinePaneView(this, this.model));
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
class SineLineTool extends DrawingTool {
  constructor() {
    super(...arguments);
    __publicField(this, "type", SineLineToolType);
  }
  createPrimitive() {
    return new SineLinePrimitive(
      {
        id: this.id,
        points: [],
        lineColor: "#159980FF",
        lineWidth: 2,
        lineStyle: LineStyleType.solid
      },
      ...this.resetArgs
    );
  }
}
export {
  SineLineTool
};
