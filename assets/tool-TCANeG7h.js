var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { T as ToolPaneView, a as ToolPrimitive, D as DrawingTool } from "./toolPaneView-3wj_on-u.js";
import { av as PriceNoteToolType } from "./index-TSHQCVD9.js";
import { u as Point, G as PaneCursor, r as ChartFontFamily, B as BitmapCoordinatesPaneRenderer, y as HitTestResult, z as HitTarget, bR as distanceToSegment, b3 as setLineStyle, L as LineStyleType, cz as createCircle, bO as addExclusionAreaByScope, cA as drawLine, bQ as interactionTolerance, A as AnchorPoint } from "./index-NZHt9VGv.js";
import { P as PriceLabelPriceAxisView } from "./priceLabelPriceAxisView-d9Maj5lR.js";
import { T as TimeLabelTimeAxisView } from "./timeLabelTimeAxisView-BvW_UnA0.js";
import { P as PriceRangeAxisPaneView, T as TimeRangeAxisPaneView } from "./axisPaneView-Pbgdotf1.js";
import { B as BaseTextRenderer, V as VerticalAlign, g as getTextBoundaries, e as alignByAngle } from "./text-CtvZov1L.js";
import { C as CompositeRenderer } from "./composite-tvPrNHN0.js";
import "./baseTool-CHlzZht2.js";
import "./text-8RrTwjoh.js";
import "./ctx-Bv0u81rl.js";
function fillScaledRadius(coordinate, pixelRatio) {
  const width = Math.max(1, Math.floor(pixelRatio));
  const offset = width % 2 === 1 ? 0.5 : 0;
  return Math.round(coordinate * pixelRatio) + offset;
}
class PriceNodeRenderer extends BitmapCoordinatesPaneRenderer {
  constructor() {
    super(...arguments);
    __publicField(this, "_priceLabelRenderer", new BaseTextRenderer(new HitTestResult(HitTarget.MovePoint)));
  }
  setData(data) {
    this._data = data;
    const start = data.points[0];
    const end = data.points[1];
    const angleDegrees = Math.round(180 * Math.atan2(end.y - start.y, end.x - start.x) / Math.PI);
    this._priceLabelRenderer.setData({
      ...alignByAngle(angleDegrees),
      // 根据角度自动对齐标签
      points: [end],
      // 将标签锚点定位于线段末端
      text: data.text,
      color: data.textColor,
      fontFamily: ChartFontFamily,
      // 应用全局字体样式
      fontSize: data.fontSize,
      bold: data.bold,
      italic: data.italic,
      offsetX: 0,
      offsetY: 0,
      borderColor: data.borderColor,
      borderWidth: 1,
      backgroundColor: data.backgroundColor,
      backgroundRoundRect: 4,
      // 圆角背景框
      boxPaddingVert: 6,
      // 垂直内边距
      boxPaddingHorz: 8
      // 水平内边距
    });
  }
  hitTest(point) {
    const data = this._data;
    if (data === null) return null;
    const tolerance = interactionTolerance().line;
    const isNearLine = distanceToSegment(data.points[0], data.points[1], point).distance <= tolerance;
    return isNearLine ? new HitTestResult(HitTarget.MovePoint) : this._priceLabelRenderer.hitTest(point);
  }
  drawImpl(scope) {
    const data = this._data;
    if (data === null || data.points.length < 2) return;
    const { horizontalPixelRatio: hRatio, verticalPixelRatio: vRatio, context: ctx } = scope;
    ctx.save();
    const x0 = Math.round(data.points[0].x * hRatio);
    const y0 = Math.round(data.points[0].y * vRatio);
    const x1 = Math.round(data.points[1].x * hRatio);
    const y1 = Math.round(data.points[1].y * vRatio);
    ctx.lineCap = "round";
    setLineStyle(ctx, LineStyleType.solid);
    ctx.strokeStyle = data.lineColor;
    ctx.fillStyle = data.lineColor;
    ctx.lineWidth = Math.round(hRatio);
    const radius = fillScaledRadius(2, hRatio);
    createCircle(ctx, x0, y0, radius);
    ctx.fill();
    if (data.excludeBoundaries !== void 0) {
      ctx.save();
      addExclusionAreaByScope(scope, data.excludeBoundaries);
    }
    drawLine(ctx, x0, y0, x1, y1);
    if (data.excludeBoundaries !== void 0) {
      ctx.restore();
    }
    this._priceLabelRenderer.drawImpl(scope);
    const borderLineWidth = hRatio;
    ctx.strokeStyle = data.circleBorderColor;
    ctx.lineWidth = borderLineWidth;
    const borderRadius = radius + borderLineWidth / 2;
    createCircle(ctx, x0, y0, borderRadius);
    ctx.stroke();
    ctx.restore();
  }
}
class PriceNotePaneView extends ToolPaneView {
  constructor() {
    super(...arguments);
    __publicField(this, "_renderer", new CompositeRenderer(this._hitTestCollector));
    __publicField(this, "_priceNoteRenderer", new PriceNodeRenderer());
    __publicField(this, "_customLabelRenderer", new BaseTextRenderer());
  }
  renderer() {
    return this._renderer;
  }
  _updateImpl() {
    this._renderer.clear();
    if (!this._data) return;
    const anchorPoints = this.points();
    if (anchorPoints.length < 2) return;
    const props = this._source.properties();
    const themeCircleBorderColor = "#ffffff";
    const priceLabelData = {
      text: this._data.labelText,
      points: anchorPoints,
      lineColor: props.lineColor,
      circleBorderColor: themeCircleBorderColor,
      backgroundColor: props.labelBackgroundColor,
      borderColor: props.labelBorderColor,
      textColor: props.labelTextColor,
      fontSize: props.labelFontSize,
      bold: props.labelBold,
      italic: props.labelItalic,
      excludeBoundaries: void 0
    };
    if (props.showLineText) {
      const pointA = anchorPoints[0];
      const pointB = anchorPoints[1];
      const leftPoint = pointA.x < pointB.x ? pointA : pointB;
      const rightPoint = leftPoint === pointA ? pointB : pointA;
      const vertAlign = props.vertTextAlign;
      const horzAlign = props.horzTextAlign;
      let textAnchor;
      if (horzAlign === "left") {
        textAnchor = leftPoint.clone();
      } else if (horzAlign === "right") {
        textAnchor = rightPoint.clone();
      } else {
        textAnchor = new Point((pointA.x + pointB.x) / 2, (pointA.y + pointB.y) / 2);
      }
      const angleRad = Math.atan((rightPoint.y - leftPoint.y) / (rightPoint.x - leftPoint.x));
      const labelData = {
        points: [textAnchor],
        text: props.text,
        color: props.textColor,
        vertAlign,
        horzAlign,
        fontFamily: ChartFontFamily,
        offsetX: 0,
        offsetY: 0,
        bold: props.bold,
        italic: props.italic,
        fontSize: props.fontSize,
        forceTextAlign: true,
        angle: angleRad,
        cursorType: PaneCursor.unset
      };
      this._customLabelRenderer.setData(labelData);
      this._renderer.append(this._customLabelRenderer);
      if (vertAlign === VerticalAlign.Middle) {
        const {
          mediaSize: { width, height }
        } = this._source.getScope();
        priceLabelData.excludeBoundaries = getTextBoundaries(this._customLabelRenderer, width, height) ?? void 0;
      }
    }
    this._priceNoteRenderer.setData(priceLabelData);
    this._renderer.append(this._priceNoteRenderer);
    this._renderer.append(this.createLineAnchor({ points: this.points() }, 0));
  }
}
class PriceNotePrimitive extends ToolPrimitive {
  constructor() {
    super(...arguments);
    __publicField(this, "_lines", new PriceNotePaneView(this, this.model));
    __publicField(this, "_paneView", [this._lines]);
    __publicField(this, "_timeAxisViews", [
      new TimeLabelTimeAxisView(/* @__PURE__ */ Object.create(null)),
      new TimeLabelTimeAxisView(/* @__PURE__ */ Object.create(null))
    ]);
    __publicField(this, "_priceAxisViews", [
      new PriceLabelPriceAxisView(/* @__PURE__ */ Object.create(null)),
      new PriceLabelPriceAxisView(/* @__PURE__ */ Object.create(null))
    ]);
    __publicField(this, "_priceAxisPaneViews", [new PriceRangeAxisPaneView()]);
    __publicField(this, "_timeAxisPaneViews", [new TimeRangeAxisPaneView()]);
  }
  pointsCount() {
    return 2;
  }
  updateAllViews() {
    if (!this.controlPoints.length) return;
    const anchorPoints = [];
    const xs = [];
    const ys = [];
    const labelText = this._ctx.priceLabelFormatter(this.controlPoints[0].price);
    for (let i = 0; i < this.controlPoints.length; i++) {
      const point = this.controlPoints[i];
      const screenPoint = this.pointToScreenPoint(point);
      if (!screenPoint) return;
      xs.push(screenPoint.x);
      ys.push(screenPoint.y);
      const anchorPoint = new AnchorPoint(screenPoint, {
        pointIndex: i,
        hitTarget: HitTarget.ChangePoint
      });
      anchorPoints.push(anchorPoint);
      this._timeAxisViews[i].update(this._calculateTimeAxisViewData(point.time, screenPoint.x));
      this._priceAxisViews[i].update(this._calculatePriceAxisViewData(point.price, screenPoint.y));
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
    this._lines.update({ points: anchorPoints, labelText });
  }
}
class PriceNoteTool extends DrawingTool {
  constructor() {
    super(...arguments);
    __publicField(this, "type", PriceNoteToolType);
  }
  createPrimitive() {
    return new PriceNotePrimitive(
      {
        id: this.id,
        points: [],
        showLineText: false,
        text: "",
        fontSize: 14,
        textColor: "#2962FFFF",
        vertTextAlign: "top",
        horzTextAlign: "center",
        labelTextColor: "#ffffff",
        labelFontSize: 12,
        labelBold: false,
        labelItalic: false,
        labelBackgroundColor: "#2962FFFF",
        labelBorderColor: "#2962FFFF",
        lineColor: "#2962FFFF"
      },
      ...this.resetArgs
    );
  }
}
export {
  PriceNoteTool
};
