var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { T as ToolPaneView, a as ToolPrimitive, D as DrawingTool } from "./toolPaneView-3wj_on-u.js";
import { $ as PriceRangeToolType } from "./index-TSHQCVD9.js";
import { P as PriceLabelPriceAxisView } from "./priceLabelPriceAxisView-d9Maj5lR.js";
import { T as TimeLabelTimeAxisView } from "./timeLabelTimeAxisView-BvW_UnA0.js";
import { L as LineStyleType, u as Point, bN as LineEnd, r as ChartFontFamily, y as HitTestResult, z as HitTarget, A as AnchorPoint } from "./index-NZHt9VGv.js";
import { P as PriceRangeAxisPaneView, T as TimeRangeAxisPaneView } from "./axisPaneView-Pbgdotf1.js";
import { H as HorizontalAlign, V as VerticalAlign, c as calculateLabelPosition } from "./text-CtvZov1L.js";
import { C as CompositeRenderer } from "./composite-tvPrNHN0.js";
import { L as LineRenderer } from "./line-DFhYRKvt.js";
import { R as RectangleRenderer } from "./rectangle-CfXWJsDB.js";
import { T as TextRenderer } from "./renderer-CPHquQ6g.js";
import "./baseTool-CHlzZht2.js";
import "./text-8RrTwjoh.js";
import "./ctx-Bv0u81rl.js";
class PriceRangePaneView extends ToolPaneView {
  constructor() {
    super(...arguments);
    __publicField(this, "_topBorderRenderer", new LineRenderer());
    __publicField(this, "_bottomBorderRenderer", new LineRenderer());
    __publicField(this, "_distanceRenderer", new LineRenderer());
    __publicField(this, "_backgroundRenderer", new RectangleRenderer());
    __publicField(this, "_labelRenderer", new TextRenderer());
    __publicField(this, "_renderer", new CompositeRenderer(this._hitTestCollector));
  }
  renderer() {
    return this._renderer;
  }
  _updateImpl() {
    this._renderer.clear();
    if (this.points().length < 2) return;
    const props = this._source.properties();
    const extendLeft = props.extendLeft;
    const extendRight = props.extendRight;
    const [point1, point2] = this.points();
    const leftX = Math.min(point1.x, point2.x);
    const rightX = Math.max(point1.x, point2.x);
    this._backgroundRenderer.setData({
      points: [new Point(leftX, point1.y), new Point(rightX, point2.y)],
      color: "white",
      lineWidth: 0,
      lineStyle: LineStyleType.solid,
      backColor: props.background,
      extendLeft,
      extendRight
    });
    this._renderer.append(this._backgroundRenderer);
    const drawLine = (renderer, start, end) => {
      renderer.setData({
        points: [start, end],
        lineColor: props.lineColor,
        lineWidth: props.lineWidth,
        lineStyle: LineStyleType.solid,
        extendLeft,
        extendRight,
        leftEnd: LineEnd.Normal,
        rightEnd: LineEnd.Normal
      });
      this._renderer.append(renderer);
    };
    let adjustedLeftX = leftX;
    let adjustedRightX = rightX;
    if (adjustedLeftX === adjustedRightX) {
      if (extendLeft) adjustedLeftX -= 1;
      if (extendRight) adjustedRightX += 1;
    }
    drawLine(
      this._topBorderRenderer,
      new Point(adjustedLeftX, point1.y),
      new Point(adjustedRightX, point1.y)
    );
    drawLine(
      this._bottomBorderRenderer,
      new Point(adjustedLeftX, point2.y),
      new Point(adjustedRightX, point2.y)
    );
    const midX = Math.round((point1.x + point2.x) / 2);
    const topPoint = new Point(midX, point1.y);
    const bottomPoint = new Point(midX, point2.y);
    const {
      mediaSize: { height: canvasHeight }
    } = this._source.getScope();
    this._distanceRenderer.setData({
      points: [topPoint, bottomPoint],
      lineColor: props.lineColor,
      lineWidth: props.lineWidth,
      lineStyle: LineStyleType.solid,
      extendLeft: false,
      extendRight: false,
      leftEnd: LineEnd.Normal,
      rightEnd: Math.abs(topPoint.y - bottomPoint.y) >= 15 * props.lineWidth ? LineEnd.Arrow : LineEnd.Normal
    });
    this._renderer.append(this._distanceRenderer);
    let labelPoint;
    if (point2.y > point1.y) {
      labelPoint = new Point(0.5 * (point1.x + point2.x), point2.y - 2 * props.fontSize);
    } else {
      labelPoint = new Point(0.5 * (point1.x + point2.x), point2.y + 0.7 * props.fontSize);
    }
    const labelOffset = { x: 0, y: 10 };
    const fontSize = props.fontSize;
    const labelOptions = {
      points: [labelPoint],
      text: this._data.labelText,
      color: props.textColor,
      fontFamily: ChartFontFamily,
      offsetX: labelOffset.x,
      offsetY: labelOffset.y,
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
    this._labelRenderer.setData(labelOptions);
    const labelSize = this._labelRenderer.measure();
    const adjustedTextPoint = calculateLabelPosition(
      labelSize,
      point1,
      point2,
      labelOffset,
      canvasHeight
    );
    this._labelRenderer.setPoint(adjustedTextPoint);
    this._labelRenderer.setHitTestResult(new HitTestResult(HitTarget.MovePoint));
    this._renderer.append(this._labelRenderer);
    this.addAnchors(this._renderer);
  }
}
class PriceRangePrimitive extends ToolPrimitive {
  constructor() {
    super(...arguments);
    __publicField(this, "_lines", new PriceRangePaneView(this, this.model));
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
    const priceChange = p1.price - p0.price;
    const priceChangPercentage = priceChange / p0.price;
    const bp = priceChange * this._props.base;
    this._lines.update({
      points: anchorPoints,
      labelText: `${this._ctx.priceLabelFormatter(priceChange)} (${this._ctx.percentageFormatter(priceChangPercentage)}) ${bp.toFixed(0)}`
    });
  }
}
class PriceRangeTool extends DrawingTool {
  constructor() {
    super(...arguments);
    __publicField(this, "type", PriceRangeToolType);
  }
  createPrimitive() {
    return new PriceRangePrimitive(
      {
        id: this.id,
        points: [],
        lineColor: "#2962FFFF",
        lineWidth: 2,
        background: "#2962FF26",
        textColor: "#000000FF",
        fontSize: 12,
        labelBackground: "#FFFFFF",
        base: this.chartService.symbolInfo().pricescale,
        drawBorder: false,
        borderWidth: 2,
        borderColor: "#2962FFFF",
        boxShadow: "#00000033",
        extendLeft: false,
        extendRight: false
      },
      ...this.resetArgs
    );
  }
}
export {
  PriceRangeTool
};
