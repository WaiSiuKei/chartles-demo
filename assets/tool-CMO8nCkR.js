var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { u as Point, bJ as MediaCoordinatesPaneRenderer, y as HitTestResult, z as HitTarget, b3 as setLineStyle, A as AnchorPoint, e as ensure, L as LineStyleType } from "./index-NZHt9VGv.js";
import { T as ToolPaneView, a as ToolPrimitive, D as DrawingTool } from "./toolPaneView-3wj_on-u.js";
import { q as TimeCyclesToolType } from "./index-TSHQCVD9.js";
import { P as PriceLabelPriceAxisView } from "./priceLabelPriceAxisView-d9Maj5lR.js";
import { T as TimeLabelTimeAxisView } from "./timeLabelTimeAxisView-BvW_UnA0.js";
import { T as TimeRangeAxisPaneView } from "./axisPaneView-Pbgdotf1.js";
import { C as CompositeRenderer } from "./composite-tvPrNHN0.js";
import "./baseTool-CHlzZht2.js";
class ArcRenderer extends MediaCoordinatesPaneRenderer {
  /**
   * 命中测试：判断是否点击在半弧边缘位置
   */
  hitTest(point) {
    if (this._data === null) return null;
    const { point: origin, width, height } = this._data;
    if (point.y > origin.y) return null;
    if (point.x < origin.x || point.x > origin.x + width) return null;
    const center = new Point(origin.x + width / 2, origin.y);
    let diff = point.subtract(center);
    const aspectRatio = height / width;
    diff = new Point(diff.x, diff.y / aspectRatio);
    const dist = diff.length();
    const radius = width / 2;
    if (Math.abs(dist - radius) < 3) {
      return new HitTestResult(HitTarget.MovePoint);
    }
    return null;
  }
  /**
   * 绘图逻辑：绘制顶部半圆帽（带样式、背景可选）
   */
  drawImpl(scope) {
    if (this._data === null) return;
    const ctx = scope.context;
    ctx.strokeStyle = this._data.color;
    ctx.lineWidth = this._data.linewidth;
    setLineStyle(ctx, this._data.linestyle);
    ctx.save();
    ctx.translate(this._data.point.x + 1, this._data.point.y);
    ctx.scale(this._data.width, this._data.height);
    ctx.beginPath();
    ctx.arc(0.5, 0, 0.5, Math.PI, 0, false);
    ctx.restore();
    ctx.stroke();
    if (this._data.fillBackground) {
      ctx.fillStyle = this._data.backcolor;
      ctx.fill();
    }
  }
}
class TimeCyclesPaneView extends ToolPaneView {
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
    const props = this._source.properties();
    for (let i = 0; i < this._data.xPositions.length; i++) {
      const boxParams = {
        point: new Point(this._data.xPositions[i], this._data.baseY),
        width: this._data.boxWidth,
        height: this._data.boxWidth,
        color: props.lineColor,
        linewidth: props.lineWidth,
        linestyle: props.lineStyle,
        fillBackground: props.fillBackground,
        backcolor: props.background
      };
      const box = new ArcRenderer(boxParams);
      this._renderer.append(box);
    }
    this.addAnchors(this._renderer);
  }
}
class TimeCyclesPrimitive extends ToolPrimitive {
  constructor() {
    super(...arguments);
    __publicField(this, "_lines", new TimeCyclesPaneView(this, this.model));
    __publicField(this, "_paneView", [this._lines]);
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
  addPoint(point, step) {
    if (step === 1) {
      point.price = this.controlPoints[0].price;
    }
    return super.addPoint(point, step);
  }
  setPoint(index, point, details) {
    super.setPoint(index, point, details);
    this.controlPoints.forEach((p) => p.price = point.price);
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
    this.controlPoints.forEach((p, i) => {
      this._timeAxisViews[i].update(this._calculateTimeAxisViewData(p.time, points[i].x));
      this._priceAxisViews[i].update(this._calculatePriceAxisViewData(p.price, points[i].y));
    });
    if (xs.length > 1) {
      this._timeAxisPaneViews[0].update(
        this._calculateTimeAxisPaneViewsData(Math.min.apply(null, xs), Math.max.apply(null, xs))
      );
    }
    const idx0 = ensure(this.chart.timeScale().timeToIndexEx(this.controlPoints[0].time));
    const idx1 = ensure(this.chart.timeScale().timeToIndexEx(this.controlPoints[1].time));
    const indexStart = Math.min(idx0, idx1);
    const indexEnd = Math.max(idx0, idx1);
    const indexInterval = indexEnd - indexStart;
    if (indexInterval === 0) return;
    const screenPointA = points[0];
    const screenPointB = points[1];
    const boxWidth = Math.abs(screenPointA.x - screenPointB.x);
    const baseY = screenPointA.y;
    let xLeft = Math.min(screenPointA.x, screenPointB.x);
    const xPositions = [];
    for (let index = indexStart; xLeft > -boxWidth; index -= indexInterval) {
      xLeft = ensure(this.chart.timeScale().logicalToCoordinate(index));
      xPositions.push(xLeft);
    }
    let xRight = Math.max(screenPointA.x, screenPointB.x);
    for (let index = indexEnd; xRight < this.chart.timeScale().width(); index += indexInterval) {
      xRight = ensure(this.chart.timeScale().logicalToCoordinate(index));
      xPositions.push(xRight);
    }
    this._lines.update({ points, boxWidth, baseY, xPositions });
  }
}
class TimeCyclesTool extends DrawingTool {
  constructor() {
    super(...arguments);
    __publicField(this, "type", TimeCyclesToolType);
  }
  createPrimitive() {
    return new TimeCyclesPrimitive(
      {
        id: this.id,
        points: [],
        lineColor: "#159980FF",
        background: "#6AA84F7F",
        fillBackground: true,
        lineWidth: 2,
        lineStyle: LineStyleType.solid
      },
      ...this.resetArgs
    );
  }
}
export {
  TimeCyclesTool
};
