var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { T as ToolPaneView, a as ToolPrimitive, D as DrawingTool, g as getI18nService } from "./toolPaneView-BAEHHn7m.js";
import { D as DateAndPriceRangeToolType } from "./index-DNbtFiKr.js";
import { L as LineStyleType, u as Point, bN as LineEnd, r as ChartFontFamily, y as HitTestResult, z as HitTarget, A as AnchorPoint, e as ensure } from "./index-DSkroicZ.js";
import { P as PriceLabelPriceAxisView } from "./priceLabelPriceAxisView-d9Maj5lR.js";
import { T as TimeLabelTimeAxisView } from "./timeLabelTimeAxisView-BvW_UnA0.js";
import { P as PriceRangeAxisPaneView, T as TimeRangeAxisPaneView } from "./axisPaneView-Pbgdotf1.js";
import { B as BaseTextRenderer, H as HorizontalAlign, V as VerticalAlign, c as calculateLabelPosition } from "./text-DNYLW3w-.js";
import { C as CompositeRenderer } from "./composite-BOGQNAfc.js";
import { L as LineRenderer } from "./line-CuaAD_DW.js";
import { R as RectangleRenderer } from "./rectangle-DSOKVUU-.js";
class DateAndPriceRangePaneView extends ToolPaneView {
  constructor() {
    super(...arguments);
    __publicField(this, "_distanceLineRenderer", new LineRenderer());
    __publicField(this, "_distancePriceRenderer", new LineRenderer());
    __publicField(this, "_backgroundRenderer", new RectangleRenderer());
    __publicField(this, "_borderRenderer", new RectangleRenderer());
    __publicField(this, "_textRenderer", new BaseTextRenderer());
    __publicField(this, "_renderer", new CompositeRenderer(this._hitTestCollector));
  }
  renderer() {
    return this._renderer;
  }
  _updateImpl() {
    this._renderer.clear();
    if (this.points().length < 2) return;
    const props = this._source.properties();
    this._backgroundRenderer.setData({
      points: this.points(),
      color: "white",
      // 边线颜色其实无效（linewidth=0）
      lineWidth: 0,
      lineStyle: LineStyleType.solid,
      backColor: props.background,
      extendLeft: false,
      extendRight: false
    });
    this._renderer.append(this._backgroundRenderer);
    const [point1, point2] = this.points();
    if (props.drawBorder) {
      this._borderRenderer.setData({
        points: this.points(),
        color: props.borderColor,
        lineWidth: props.borderWidth,
        lineStyle: LineStyleType.solid,
        backColor: "",
        extendLeft: false,
        extendRight: false
      });
      this._renderer.append(this._borderRenderer);
    }
    const borderOffset = props.drawBorder ? props.borderWidth / 2 : 0;
    const {
      mediaSize: { height: canvasH }
    } = this._source.getScope();
    const yMid = Math.round((point1.y + point2.y) / 2);
    const distPoint1 = new Point(point1.x + Math.sign(point2.x - point1.x) * borderOffset, yMid);
    const distPoint2 = new Point(point2.x + Math.sign(point1.x - point2.x) * borderOffset, yMid);
    this._distanceLineRenderer.setData({
      points: [distPoint1, distPoint2],
      lineColor: props.lineColor,
      lineWidth: props.lineWidth,
      lineStyle: LineStyleType.solid,
      extendLeft: false,
      extendRight: false,
      leftEnd: LineEnd.Normal,
      rightEnd: Math.abs(point1.x - point2.x) >= 25 * props.lineWidth ? LineEnd.Arrow : LineEnd.Normal
      // excludeBoundaries: excludedBoundaries ? [excludedBoundaries] : undefined,
    });
    this._renderer.append(this._distanceLineRenderer);
    const xMid = Math.round((point1.x + point2.x) / 2);
    const pricePoint1 = new Point(xMid, point1.y + Math.sign(point2.y - point1.y) * borderOffset);
    const pricePoint2 = new Point(xMid, point2.y + Math.sign(point1.y - point2.y) * borderOffset);
    this._distancePriceRenderer.setData({
      points: [pricePoint1, pricePoint2],
      lineColor: props.lineColor,
      lineWidth: props.lineWidth,
      lineStyle: LineStyleType.solid,
      extendLeft: false,
      extendRight: false,
      leftEnd: LineEnd.Normal,
      rightEnd: Math.abs(pricePoint1.y - pricePoint2.y) >= 25 * props.lineWidth ? LineEnd.Arrow : LineEnd.Normal
      // excludeBoundaries: excludedBoundaries ? [excludedBoundaries] : undefined,
    });
    this._renderer.append(this._distancePriceRenderer);
    let labelPoint;
    if (point2.y > point1.y) {
      labelPoint = new Point(0.5 * (point1.x + point2.x), point2.y - 2 * props.fontSize);
    } else {
      labelPoint = new Point(0.5 * (point1.x + point2.x), point2.y + 0.7 * props.fontSize);
    }
    const offset = { x: 0, y: 10 };
    const fontSize = props.fontSize;
    const textRenderOptions = {
      points: [labelPoint],
      text: this._data.labelText,
      color: props.textColor,
      fontFamily: ChartFontFamily,
      offsetX: offset.x,
      offsetY: offset.y,
      lineSpacing: 8,
      vertAlign: VerticalAlign.Middle,
      horzAlign: HorizontalAlign.Center,
      fontSize,
      backgroundRoundRect: 4,
      boxPaddingHorz: 0.4 * fontSize + fontSize / 3,
      boxPaddingVert: 0.2 * fontSize + fontSize / 3,
      boxShadow: {
        shadowColor: props.boxShadow,
        shadowBlur: 4,
        shadowOffsetY: 1
      },
      backgroundColor: props.labelBackground
    };
    this._textRenderer.setData(textRenderOptions);
    const textSize = this._textRenderer.measure();
    const adjustedPoint = calculateLabelPosition(textSize, point1, point2, offset, canvasH);
    this._textRenderer.setPoint(adjustedPoint);
    this._textRenderer.setHitTestResult(new HitTestResult(HitTarget.MovePoint));
    this._renderer.append(this._textRenderer);
    if (props.showAnchors) {
      this.addAnchors(this._renderer);
    }
  }
}
class DateAndPriceRangePrimitive extends ToolPrimitive {
  constructor() {
    super(...arguments);
    __publicField(this, "_lines", new DateAndPriceRangePaneView(this, this.model));
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
    const [p0, p1] = this.controlPoints;
    if (!p1) return;
    const drawPoint0 = this.pointToScreenPoint(p0);
    if (!drawPoint0) return;
    const drawPoint1 = this.pointToScreenPoint(p1);
    if (!drawPoint1) return;
    const anchorPoints = [
      new AnchorPoint(drawPoint0, { pointIndex: 0 }),
      new AnchorPoint(drawPoint1, { pointIndex: 1 })
    ];
    this._timeAxisViews[0].update(this._calculateTimeAxisViewData(p0.time, drawPoint0.x));
    this._priceAxisViews[0].update(this._calculatePriceAxisViewData(p0.price, drawPoint0.y));
    this._timeAxisViews[1].update(this._calculateTimeAxisViewData(p1.time, drawPoint1.x));
    this._priceAxisViews[1].update(this._calculatePriceAxisViewData(p1.price, drawPoint1.y));
    this._priceAxisPaneViews[0].update(
      this._calculatePriceAxisPaneViewData(drawPoint0.y, drawPoint1.y)
    );
    this._timeAxisPaneViews[0].update(
      this._calculateTimeAxisPaneViewsData(drawPoint0.x, drawPoint1.x)
    );
    const contents = [];
    const priceChange = p1.price - p0.price;
    const priceChangPercentage = priceChange / p0.price;
    const bp = priceChange * this._props.base;
    contents.push(
      `${this._ctx.priceLabelFormatter(priceChange)} (${this._ctx.percentageFormatter(priceChangPercentage)}) ${bp.toFixed(0)}`
    );
    const startIndex = ensure(this.chart.timeScale().timeToIndexEx(p0.time));
    const endIndex = ensure(this.chart.timeScale().timeToIndexEx(p1.time));
    const barCount = endIndex - startIndex;
    const timeSpan = this._ctx.timeSpanFormatter(p0.time, p1.time);
    contents.push(`${this._props.formatBarCount(barCount)}, ${timeSpan}`);
    this._lines.update({
      points: anchorPoints,
      labelText: contents.join("\n")
    });
  }
}
class DateAndPriceRangeTool extends DrawingTool {
  constructor() {
    super(...arguments);
    __publicField(this, "type", DateAndPriceRangeToolType);
  }
  getProps(drawingSession) {
    return {
      id: this.id,
      points: [],
      lineColor: "#2962FFFF",
      lineWidth: 2,
      background: "#2962FF26",
      textColor: "#000000FF",
      fontSize: 12,
      labelBackground: "#FFFFFF",
      formatBarCount: (count) => {
        return getI18nService(drawingSession).t("tool.line.common.bars", { count });
      },
      base: this.chartService.symbolInfo().pricescale,
      drawBorder: false,
      borderWidth: 2,
      borderColor: "#2962FFFF",
      boxShadow: "#00000033",
      showVolume: true,
      showAnchors: true
    };
  }
  createPrimitive(drawingSession) {
    return new DateAndPriceRangePrimitive(this.getProps(drawingSession), ...this.resetArgs);
  }
}
const tool = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  DateAndPriceRangeTool
}, Symbol.toStringTag, { value: "Module" }));
export {
  DateAndPriceRangePrimitive as D,
  DateAndPriceRangeTool as a,
  tool as t
};
