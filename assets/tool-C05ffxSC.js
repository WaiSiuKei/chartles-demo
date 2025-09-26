var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { T as ToolPaneView, a as ToolPrimitive, D as DrawingTool } from "./toolPaneView-BAEHHn7m.js";
import { ai as CircleToolType } from "./index-DNbtFiKr.js";
import { B as BitmapCoordinatesPaneRenderer, cc as pointInCircle, y as HitTestResult, z as HitTarget, bQ as interactionTolerance, A as AnchorPoint } from "./index-DSkroicZ.js";
import { P as PriceLabelPriceAxisView } from "./priceLabelPriceAxisView-d9Maj5lR.js";
import { T as TimeLabelTimeAxisView } from "./timeLabelTimeAxisView-BvW_UnA0.js";
import { P as PriceRangeAxisPaneView, T as TimeRangeAxisPaneView } from "./axisPaneView-Pbgdotf1.js";
import { C as CompositeRenderer } from "./composite-BOGQNAfc.js";
import "./baseTool-BVX9dcKc.js";
class CircleRenderer extends BitmapCoordinatesPaneRenderer {
  drawImpl(scope) {
    if (!this._data) return;
    const {
      center,
      // 中心点坐标 { x, y }
      radius,
      // 原始半径（逻辑单位）
      lineWidth,
      // 描边线宽（逻辑单位）
      color,
      // 描边颜色
      background
      // 填充颜色
    } = this._data;
    const ctx = scope.context;
    ctx.save();
    const { horizontalPixelRatio, verticalPixelRatio } = scope;
    const scaledPixel = Math.max(1, Math.floor(horizontalPixelRatio));
    const pixelOffset = scaledPixel % 2 / 2;
    const cx = Math.round(center.x * horizontalPixelRatio) + pixelOffset;
    const cy = Math.round(center.y * verticalPixelRatio) + pixelOffset;
    const cRight = Math.round(cx + radius * horizontalPixelRatio);
    const scaledLineWidth = Math.max(1, Math.floor(lineWidth * horizontalPixelRatio));
    const fillRadius = cRight - cx - scaledLineWidth;
    if (fillRadius > 0) {
      ctx.fillStyle = background;
      ctx.beginPath();
      ctx.moveTo(cx + fillRadius, cy);
      ctx.arc(cx, cy, fillRadius, 0, 2 * Math.PI, false);
      ctx.fill();
    }
    const strokeRadius = Math.max(scaledPixel / 2, cRight - cx - scaledLineWidth / 2);
    ctx.strokeStyle = color;
    ctx.lineWidth = scaledLineWidth;
    ctx.beginPath();
    ctx.moveTo(cx + strokeRadius, cy);
    ctx.arc(cx, cy, strokeRadius, 0, 2 * Math.PI, false);
    ctx.stroke();
  }
  hitTest(point) {
    if (!this._data) return null;
    const { center, radius } = this._data;
    const tolerance = interactionTolerance().curve;
    if (!pointInCircle(point, center, radius + tolerance)) {
      return null;
    }
    if (radius > tolerance && pointInCircle(point, center, radius - tolerance)) ;
    else {
      return new HitTestResult(HitTarget.MovePoint);
    }
    return null;
  }
}
class CirclePaneView extends ToolPaneView {
  constructor() {
    super(...arguments);
    __publicField(this, "_renderer", new CompositeRenderer(this._hitTestCollector));
    __publicField(this, "_circleRenderer", new CircleRenderer());
  }
  renderer() {
    return this._renderer;
  }
  _updateImpl() {
    this._renderer.clear();
    if (this.points().length < 2) return;
    const props = this._source.properties();
    const [p0, p1] = this.points();
    const radius = Math.hypot(p0.x - p1.x, p0.y - p1.y);
    this._circleRenderer.setData({
      center: p0,
      radius,
      color: props.lineColor,
      lineWidth: props.lineWidth,
      background: props.backgroundColor
    });
    this._renderer.append(this._circleRenderer);
    this._renderer.append(
      this.createLineAnchor({
        points: [p0, p1]
      })
    );
  }
}
class CirclePrimitive extends ToolPrimitive {
  constructor() {
    super(...arguments);
    __publicField(this, "_lines", new CirclePaneView(this, this.model));
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
    const xs = [];
    const ys = [];
    const [p0, p1] = this.controlPoints;
    const anchorPoints = [];
    for (let i = 0; i < this.controlPoints.length; i++) {
      const p = this.controlPoints[i];
      const drawPoint = this.pointToScreenPoint(p);
      if (!drawPoint) return;
      xs.push(drawPoint.x);
      ys.push(drawPoint.y);
      const anchorPoint = new AnchorPoint(drawPoint, {
        pointIndex: i,
        hitTarget: i === 0 ? HitTarget.MovePoint : HitTarget.ChangePoint
      });
      anchorPoints.push(anchorPoint);
    }
    this._timeAxisViews[0].update(this._calculateTimeAxisViewData(p0.time, anchorPoints[0].x));
    this._priceAxisViews[0].update(this._calculatePriceAxisViewData(p0.price, anchorPoints[0].y));
    if (p1) {
      this._timeAxisViews[1].update(this._calculateTimeAxisViewData(p1.time, anchorPoints[1].x));
      this._priceAxisViews[1].update(this._calculatePriceAxisViewData(p1.price, anchorPoints[1].y));
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
class CircleTool extends DrawingTool {
  constructor() {
    super(...arguments);
    __publicField(this, "type", CircleToolType);
  }
  createPrimitive() {
    return new CirclePrimitive(
      {
        id: this.id,
        points: [],
        lineColor: "#FF9800FF",
        lineWidth: 2,
        backgroundColor: "#FF980033"
      },
      ...this.resetArgs
    );
  }
}
export {
  CircleTool
};
