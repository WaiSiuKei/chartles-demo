var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { T as ToolPaneView, a as ToolPrimitive, D as DrawingTool } from "./toolPaneView-BAEHHn7m.js";
import { au as PriceLabelToolType } from "./index-DNbtFiKr.js";
import { r as ChartFontFamily, b$ as SelectionRenderer, z as HitTarget, bJ as MediaCoordinatesPaneRenderer, w as box, u as Point, v as pointInBox, y as HitTestResult, A as AnchorPoint } from "./index-DSkroicZ.js";
import { P as PriceLabelPriceAxisView } from "./priceLabelPriceAxisView-d9Maj5lR.js";
import { T as TimeLabelTimeAxisView } from "./timeLabelTimeAxisView-BvW_UnA0.js";
import { c as calcTextHorizontalShift, i as isRtl } from "./text-FiPV6-V4.js";
import { m as makeFont } from "./font-0BY7UpRj.js";
import { C as CompositeRenderer } from "./composite-BOGQNAfc.js";
import "./baseTool-BVX9dcKc.js";
class PriceLabelRenderer extends MediaCoordinatesPaneRenderer {
  constructor() {
    super(...arguments);
    __publicField(this, "_measureCache", null);
  }
  drawImpl(scope) {
    if (this._data === null || this._data.points.length === 0) return;
    const ctx = scope.context;
    ctx.font = this._data.font;
    const textMetrics = ctx.measureText(this._data.label);
    const fontSize = this._data.fontSize;
    const horizontalPadding = 10;
    const verticalPadding = 5;
    const innerWidth = textMetrics.width + 2 * horizontalPadding;
    const innerHeight = fontSize + 2 * verticalPadding;
    const tailLeft = -9;
    const tailHeight = 15;
    const originX = this._data.points[0].x + 9;
    const originY = this._data.points[0].y - (innerHeight + tailHeight);
    const horizontalShift = calcTextHorizontalShift(ctx, textMetrics.width);
    this._measureCache = {
      innerWidth,
      innerHeight,
      tailLeft,
      tailHeight
    };
    ctx.textAlign = isRtl() ? "right" : "left";
    ctx.translate(originX, originY);
    ctx.beginPath();
    ctx.moveTo(12, innerHeight);
    ctx.lineTo(-9, innerHeight + tailHeight);
    ctx.lineTo(5, innerHeight);
    ctx.lineTo(3, innerHeight);
    ctx.arcTo(0, innerHeight, 0, 0, 3);
    ctx.lineTo(0, 3);
    ctx.arcTo(0, 0, innerWidth, 0, 3);
    ctx.lineTo(innerWidth - 3, 0);
    ctx.arcTo(innerWidth, 0, innerWidth, innerHeight, 3);
    ctx.lineTo(innerWidth, innerHeight - 3);
    ctx.arcTo(innerWidth, innerHeight, 0, innerHeight, 3);
    ctx.lineTo(12, innerHeight);
    ctx.fillStyle = this._data.backgroundColor;
    ctx.fill();
    ctx.strokeStyle = this._data.borderColor;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = this._data.color;
    const textX = horizontalPadding + horizontalShift;
    const textY = innerHeight / 2 + Math.floor(0.35 * fontSize);
    ctx.fillText(this._data.label, textX, textY);
    ctx.beginPath();
    ctx.arc(-9, innerHeight + 15, 2.5, 0, 2 * Math.PI, false);
    ctx.fillStyle = this._data.borderColor;
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.closePath();
  }
  hitTest(point) {
    if (this._data === null || this._data.points.length === 0 || !this._measureCache) {
      return null;
    }
    const anchorX = this._data.points[0].x;
    const anchorY = this._data.points[0].y;
    const boxX = anchorX - this._measureCache.tailLeft;
    const boxY = anchorY - (this._measureCache.innerHeight + this._measureCache.tailHeight);
    const hitBox = box(
      new Point(boxX, boxY),
      new Point(boxX + this._measureCache.innerWidth, boxY + this._measureCache.innerHeight)
    );
    if (pointInBox(point, hitBox)) {
      return new HitTestResult(HitTarget.MovePoint);
    }
    return null;
  }
}
class PriceLabelPaneView extends ToolPaneView {
  constructor() {
    super(...arguments);
    __publicField(this, "_renderer", new CompositeRenderer(this._hitTestCollector));
    __publicField(this, "_priceLabelRenderer", new PriceLabelRenderer());
  }
  renderer() {
    return this._renderer;
  }
  _updateImpl() {
    this._renderer.clear();
    if (!this._data) return;
    this._renderer.clear();
    const props = this._source.properties();
    const fontSize = props.fontSize;
    const labelRenderData = {
      points: this.points(),
      borderColor: props.borderColor,
      backgroundColor: props.backgroundColor,
      color: props.color,
      font: makeFont(fontSize, ChartFontFamily, "", props.fontWeight),
      fontSize,
      label: this._data.label
    };
    this._priceLabelRenderer.setData(labelRenderData);
    this._renderer.append(this._priceLabelRenderer);
    this._renderer.append(
      new SelectionRenderer({
        points: this.points(),
        bgColors: this._lineAnchorColors(labelRenderData.points),
        visible: this.areAnchorsVisible(),
        hitTarget: HitTarget.MovePoint
      })
    );
  }
}
class PriceLabelPrimitive extends ToolPrimitive {
  constructor() {
    super(...arguments);
    __publicField(this, "_lines", new PriceLabelPaneView(this, this.model));
    __publicField(this, "_paneView", [this._lines]);
    __publicField(this, "_timeAxisViews", [new TimeLabelTimeAxisView(/* @__PURE__ */ Object.create(null))]);
    __publicField(this, "_priceAxisViews", [new PriceLabelPriceAxisView(/* @__PURE__ */ Object.create(null))]);
  }
  pointsCount() {
    return 1;
  }
  updateAllViews() {
    if (!this.controlPoints.length) return;
    const anchorPoints = [];
    const label = this._ctx.priceLabelFormatter(this.controlPoints[0].price);
    for (let i = 0; i < this.controlPoints.length; i++) {
      const p = this.controlPoints[i];
      const screenPoint = this.pointToScreenPoint(p);
      if (!screenPoint) return;
      const anchorPoint = new AnchorPoint(screenPoint, {
        pointIndex: i,
        hitTarget: HitTarget.ChangePoint
      });
      anchorPoints.push(anchorPoint);
      this._timeAxisViews[i].update(this._calculateTimeAxisViewData(p.time, screenPoint.x));
      this._priceAxisViews[i].update(this._calculatePriceAxisViewData(p.price, screenPoint.y));
    }
    this._lines.update({ points: anchorPoints, label });
  }
}
class PriceLabelTool extends DrawingTool {
  constructor() {
    super(...arguments);
    __publicField(this, "type", PriceLabelToolType);
  }
  createPrimitive() {
    return new PriceLabelPrimitive(
      {
        id: this.id,
        points: [],
        fontSize: 14,
        fontWeight: "bold",
        color: "#ffffff",
        backgroundColor: "#2962FFFF",
        borderColor: "#2962FFFF"
      },
      ...this.resetArgs
    );
  }
}
export {
  PriceLabelTool
};
