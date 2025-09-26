var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { bN as LineEnd, L as LineStyleType, r as ChartFontFamily, A as AnchorPoint, c5 as getLightenRGBA } from "./index-DSkroicZ.js";
import { T as ToolPaneView, a as ToolPrimitive, D as DrawingTool } from "./toolPaneView-BAEHHn7m.js";
import { a3 as PatternThreeDrivesToolType } from "./index-DNbtFiKr.js";
import { P as PriceLabelPriceAxisView } from "./priceLabelPriceAxisView-d9Maj5lR.js";
import { T as TimeLabelTimeAxisView } from "./timeLabelTimeAxisView-BvW_UnA0.js";
import { P as PriceRangeAxisPaneView, T as TimeRangeAxisPaneView } from "./axisPaneView-Pbgdotf1.js";
import { B as BaseTextRenderer, H as HorizontalAlign, V as VerticalAlign } from "./text-DNYLW3w-.js";
import { b as getNumericFormatter } from "./formatter-Drv30PyG.js";
import { C as CompositeRenderer } from "./composite-BOGQNAfc.js";
import { L as LineRenderer } from "./line-CuaAD_DW.js";
import { P as PolygonRenderer } from "./polygon-C6s4PX2h.js";
import "./baseTool-BVX9dcKc.js";
import "./text-FiPV6-V4.js";
import "./ctx-DYUP60aL.js";
import "./numericFormatter-6U8WkLAS.js";
class PatternThreeDrivesPaneView extends ToolPaneView {
  constructor() {
    super(...arguments);
    __publicField(this, "_renderer", new CompositeRenderer(this._hitTestCollector));
    __publicField(this, "_retrace1LabelRenderer", new BaseTextRenderer());
    __publicField(this, "_retrace12LabelRenderer", new BaseTextRenderer());
    __publicField(this, "_polyLineRenderer", new PolygonRenderer());
  }
  renderer() {
    return this._renderer;
  }
  _updateImpl() {
    this._renderer.clear();
    const points = this.points();
    if ((points == null ? void 0 : points.length) < 2) return;
    const props = this._source.properties();
    const makeLabel = (point, text) => ({
      points: [point],
      text,
      color: props.textColor,
      vertAlign: VerticalAlign.Middle,
      horzAlign: HorizontalAlign.Center,
      fontFamily: ChartFontFamily,
      offsetX: 0,
      offsetY: 0,
      // bold: props.bold?.value(),
      // italic: props.italic?.value(),
      fontSize: props.textFontSize,
      backgroundColor: props.lineColor,
      backgroundRoundRect: 4
    });
    const makeDottedLine = (from, to) => ({
      points: [from, to],
      lineColor: props.lineColor,
      lineWidth: props.lineWidth,
      lineStyle: LineStyleType.dotted,
      extendLeft: false,
      extendRight: false,
      leftEnd: LineEnd.Normal,
      rightEnd: LineEnd.Normal
    });
    const mainLineConfig = {
      points,
      lineColor: props.lineColor,
      lineWidth: props.lineWidth,
      lineStyle: LineStyleType.solid,
      leftEnd: LineEnd.Normal,
      rightEnd: LineEnd.Normal,
      background: "rgba(0, 0, 0, 0)",
      filled: false
    };
    this._polyLineRenderer.setData(mainLineConfig);
    this._renderer.append(this._polyLineRenderer);
    const formatter = getNumericFormatter(3);
    if (!isNaN(this._data.retrace1Ratio)) {
      const trend = new LineRenderer();
      trend.setData(makeDottedLine(points[1], points[3]));
      this._renderer.append(trend);
      const midPoint = points[1].add(points[3]).scaled(0.5);
      const label = makeLabel(midPoint, formatter.format(this._data.retrace1Ratio));
      this._retrace1LabelRenderer.setData(label);
      this._renderer.append(this._retrace1LabelRenderer);
    }
    if (!isNaN(this._data.retrace2Ratio)) {
      const trend = new LineRenderer();
      trend.setData(makeDottedLine(points[3], points[5]));
      this._renderer.append(trend);
      const midPoint = points[3].add(points[5]).scaled(0.5);
      const label = makeLabel(midPoint, formatter.format(this._data.retrace2Ratio));
      this._retrace12LabelRenderer.setData(label);
      this._renderer.append(this._retrace12LabelRenderer);
    }
    this.addAnchors(this._renderer);
  }
}
class PatternThreeDrivesPrimitive extends ToolPrimitive {
  constructor() {
    super(...arguments);
    __publicField(this, "_lines", new PatternThreeDrivesPaneView(this, this.model));
    __publicField(this, "_paneView", [this._lines]);
    __publicField(this, "_priceAxisPaneViews", [new PriceRangeAxisPaneView(/* @__PURE__ */ Object.create(null))]);
    __publicField(this, "_timeAxisPaneViews", [new TimeRangeAxisPaneView(/* @__PURE__ */ Object.create(null))]);
    __publicField(this, "_timeAxisViews", [
      new TimeLabelTimeAxisView(/* @__PURE__ */ Object.create(null)),
      new TimeLabelTimeAxisView(/* @__PURE__ */ Object.create(null)),
      new TimeLabelTimeAxisView(/* @__PURE__ */ Object.create(null)),
      new TimeLabelTimeAxisView(/* @__PURE__ */ Object.create(null)),
      new TimeLabelTimeAxisView(/* @__PURE__ */ Object.create(null)),
      new TimeLabelTimeAxisView(/* @__PURE__ */ Object.create(null)),
      new TimeLabelTimeAxisView(/* @__PURE__ */ Object.create(null))
    ]);
    __publicField(this, "_priceAxisViews", [
      new PriceLabelPriceAxisView(/* @__PURE__ */ Object.create(null)),
      new PriceLabelPriceAxisView(/* @__PURE__ */ Object.create(null)),
      new PriceLabelPriceAxisView(/* @__PURE__ */ Object.create(null)),
      new PriceLabelPriceAxisView(/* @__PURE__ */ Object.create(null)),
      new PriceLabelPriceAxisView(/* @__PURE__ */ Object.create(null)),
      new PriceLabelPriceAxisView(/* @__PURE__ */ Object.create(null)),
      new PriceLabelPriceAxisView(/* @__PURE__ */ Object.create(null))
    ]);
  }
  pointsCount() {
    return 7;
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
    const data = {
      points,
      retrace1Ratio: NaN,
      retrace2Ratio: NaN
    };
    if (points.length >= 4) {
      const [, pt1, pt2, pt3] = this.controlPoints;
      data.retrace1Ratio = Math.round(100 * Math.abs((pt3.price - pt2.price) / (pt2.price - pt1.price))) / 100;
    }
    if (points.length >= 6) {
      const [, , , pt3, pt4, pt5] = this.controlPoints;
      data.retrace2Ratio = Math.round(100 * Math.abs((pt5.price - pt4.price) / (pt4.price - pt3.price))) / 100;
    }
    this._lines.update(data);
  }
}
class PatternThreeDrivesTool extends DrawingTool {
  constructor() {
    super(...arguments);
    __publicField(this, "type", PatternThreeDrivesToolType);
  }
  createPrimitive() {
    return new PatternThreeDrivesPrimitive(
      {
        id: this.id,
        points: [],
        lineColor: "#673AB7FF",
        lineWidth: 2,
        background: getLightenRGBA("#673AB7FF", 0.15),
        fillBackground: true,
        textColor: "#ffffff",
        textFontSize: 12
      },
      ...this.resetArgs
    );
  }
}
export {
  PatternThreeDrivesTool
};
