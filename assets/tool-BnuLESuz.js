var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { T as ToolPaneView, a as ToolPrimitive, D as DrawingTool, g as getI18nService } from "./toolPaneView-3wj_on-u.js";
import { _ as DateRangeToolType } from "./index-TSHQCVD9.js";
import { L as LineStyleType, u as Point, bN as LineEnd, r as ChartFontFamily, y as HitTestResult, z as HitTarget, A as AnchorPoint, e as ensure } from "./index-NZHt9VGv.js";
import { P as PriceLabelPriceAxisView } from "./priceLabelPriceAxisView-d9Maj5lR.js";
import { T as TimeLabelTimeAxisView } from "./timeLabelTimeAxisView-BvW_UnA0.js";
import { P as PriceRangeAxisPaneView, T as TimeRangeAxisPaneView } from "./axisPaneView-Pbgdotf1.js";
import { H as HorizontalAlign, V as VerticalAlign, c as calculateLabelPosition } from "./text-CtvZov1L.js";
import { C as CompositeRenderer } from "./composite-tvPrNHN0.js";
import { L as LineRenderer } from "./line-DFhYRKvt.js";
import { R as RectangleRenderer } from "./rectangle-CfXWJsDB.js";
import { T as TextRenderer } from "./renderer-CPHquQ6g.js";
import "./baseTool-CHlzZht2.js";
import "./text-8RrTwjoh.js";
import "./ctx-Bv0u81rl.js";
class DateRangePaneView extends ToolPaneView {
  constructor() {
    super(...arguments);
    __publicField(this, "_leftBorderRenderer", new LineRenderer());
    __publicField(this, "_rightBorderRenderer", new LineRenderer());
    __publicField(this, "_distancePriceRenderer", new LineRenderer());
    __publicField(this, "_backgroundRenderer", new RectangleRenderer());
    __publicField(this, "_textRenderer", new TextRenderer());
    __publicField(this, "_renderer", new CompositeRenderer(this._hitTestCollector));
  }
  renderer() {
    return this._renderer;
  }
  _updateImpl() {
    this._renderer.clear();
    if (this.points().length < 2) return;
    const props = this._source.properties();
    const extendTop = props.extendTop;
    const extendBottom = props.extendBottom;
    const [point1, point2] = this.points();
    const {
      mediaSize: { height: canvasH }
    } = this._source.getScope();
    const topY = extendTop ? 0 : Math.min(point1.y, point2.y);
    const bottomY = extendBottom ? canvasH : Math.max(point1.y, point2.y);
    this._backgroundRenderer.setData({
      points: [new Point(point1.x, topY), new Point(point2.x, bottomY)],
      color: "white",
      lineWidth: 0,
      lineStyle: LineStyleType.solid,
      backColor: props.background,
      extendLeft: false,
      extendRight: false
    });
    this._renderer.append(this._backgroundRenderer);
    const renderVerticalLine = (renderer, from, to) => {
      renderer.setData({
        points: [from, to],
        lineColor: props.lineColor,
        lineWidth: props.lineWidth,
        lineStyle: LineStyleType.solid,
        extendLeft: false,
        extendRight: false,
        leftEnd: LineEnd.Normal,
        rightEnd: LineEnd.Normal
      });
      this._renderer.append(renderer);
    };
    renderVerticalLine(
      this._leftBorderRenderer,
      new Point(point1.x, topY),
      new Point(point1.x, bottomY)
    );
    renderVerticalLine(
      this._rightBorderRenderer,
      new Point(point2.x, topY),
      new Point(point2.x, bottomY)
    );
    const midY = Math.round((point1.y + point2.y) / 2);
    const pointLeft = new Point(point1.x, midY);
    const pointRight = new Point(point2.x, midY);
    this._distancePriceRenderer.setData({
      points: [pointLeft, pointRight],
      lineColor: props.lineColor,
      lineWidth: props.lineWidth,
      lineStyle: LineStyleType.solid,
      extendLeft: false,
      extendRight: false,
      leftEnd: LineEnd.Normal,
      rightEnd: Math.abs(pointLeft.x - pointRight.x) >= 15 * props.lineWidth ? LineEnd.Arrow : LineEnd.Normal
    });
    this._renderer.append(this._distancePriceRenderer);
    const textOffset = { x: 0, y: 10 };
    const fontSize = props.fontSize;
    const labelTextOptions = {
      points: this.points(),
      text: this._data.labelText,
      color: props.textColor,
      fontFamily: ChartFontFamily,
      offsetX: textOffset.x,
      offsetY: textOffset.y,
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
    this._textRenderer.setData(labelTextOptions);
    const textSize = this._textRenderer.measure();
    const labelPoint = calculateLabelPosition(textSize, point1, point2, textOffset, canvasH);
    this._textRenderer.setPoint(labelPoint);
    this._textRenderer.setHitTestResult(new HitTestResult(HitTarget.MovePoint));
    this._renderer.append(this._textRenderer);
    this.addAnchors(this._renderer);
  }
}
class DateRangePrimitive extends ToolPrimitive {
  constructor() {
    super(...arguments);
    __publicField(this, "_lines", new DateRangePaneView(this, this.model));
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
    const startIndex = ensure(this.chart.timeScale().timeToIndexEx(p0.time));
    const endIndex = ensure(this.chart.timeScale().timeToIndexEx(p1.time));
    const barCount = endIndex - startIndex;
    const timeSpan = this._ctx.timeSpanFormatter(p0.time, p1.time);
    this._lines.update({
      points: anchorPoints,
      labelText: `${this._props.formatBarCount(barCount)}, ${timeSpan}`
    });
  }
}
class DateRangeTool extends DrawingTool {
  constructor() {
    super(...arguments);
    __publicField(this, "type", DateRangeToolType);
  }
  createPrimitive(drawingSession) {
    return new DateRangePrimitive(
      {
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
        drawBorder: false,
        borderWidth: 2,
        borderColor: "#2962FFFF",
        boxShadow: "#00000033",
        showVolume: false,
        extendTop: false,
        extendBottom: false
      },
      ...this.resetArgs
    );
  }
}
export {
  DateRangeTool
};
