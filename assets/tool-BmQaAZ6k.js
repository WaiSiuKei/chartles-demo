var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { L as LineStyleType, r as ChartFontFamily, bN as LineEnd, A as AnchorPoint, c5 as getLightenRGBA } from "./index-DSkroicZ.js";
import { T as ToolPaneView, a as ToolPrimitive, D as DrawingTool } from "./toolPaneView-BAEHHn7m.js";
import { a0 as PatternABCDToolType } from "./index-DNbtFiKr.js";
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
class PatternABCDPaneView extends ToolPaneView {
  constructor() {
    super(...arguments);
    __publicField(this, "_renderer", new CompositeRenderer(this._hitTestCollector));
    __publicField(this, "_abRetracementTrend", new LineRenderer());
    __publicField(this, "_cdRetracementTrend", new LineRenderer());
    __publicField(this, "_polylineRenderer", new PolygonRenderer());
    __publicField(this, "_abLabelRenderer", new BaseTextRenderer());
    __publicField(this, "_cdLabelRenderer", new BaseTextRenderer());
    __publicField(this, "_textRendererALabel", new BaseTextRenderer());
    __publicField(this, "_textRendererBLabel", new BaseTextRenderer());
    __publicField(this, "_textRendererCLabel", new BaseTextRenderer());
    __publicField(this, "_textRendererDLabel", new BaseTextRenderer());
  }
  renderer() {
    return this._renderer;
  }
  _updateImpl() {
    this._renderer.clear();
    const points = this.points();
    if ((points == null ? void 0 : points.length) < 2) {
      return;
    }
    const props = this._source.properties();
    const makeLabelConfig = (point, text) => ({
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
      backgroundColor: props.color,
      backgroundRoundRect: 4
    });
    const makeLineConfig = (from, to) => ({
      points: [from, to],
      lineColor: props.color,
      lineWidth: props.lineWidth,
      lineStyle: LineStyleType.dotted,
      extendLeft: false,
      extendRight: false,
      leftEnd: LineEnd.Normal,
      rightEnd: LineEnd.Normal
    });
    const [pointA, pointB, pointC, pointD] = points;
    const polylineConfig = {
      points: this.points(),
      lineColor: props.color,
      lineWidth: props.lineWidth,
      lineStyle: LineStyleType.solid,
      filled: false,
      background: "rgba(0, 0, 0, 0)"
    };
    this._polylineRenderer.setData(polylineConfig);
    this._renderer.append(this._polylineRenderer);
    const labelA = makeLabelConfig(pointA, "A");
    labelA.vertAlign = pointB.y > pointA.y ? VerticalAlign.Bottom : VerticalAlign.Top;
    labelA.offsetY = 5;
    this._textRendererALabel.setData(labelA);
    this._renderer.append(this._textRendererALabel);
    const labelB = makeLabelConfig(pointB, "B");
    labelB.vertAlign = pointB.y < pointA.y ? VerticalAlign.Bottom : VerticalAlign.Top;
    labelB.offsetY = 5;
    this._textRendererBLabel.setData(labelB);
    this._renderer.append(this._textRendererBLabel);
    if (points.length > 2) {
      const labelC = makeLabelConfig(pointC, "C");
      labelC.vertAlign = pointC.y < pointB.y ? VerticalAlign.Bottom : VerticalAlign.Top;
      labelC.offsetY = 5;
      this._textRendererCLabel.setData(labelC);
      this._renderer.append(this._textRendererCLabel);
    }
    if (points.length > 3) {
      const labelD = makeLabelConfig(pointD, "D");
      labelD.vertAlign = pointD.y < pointC.y ? VerticalAlign.Bottom : VerticalAlign.Top;
      labelD.offsetY = 5;
      this._textRendererDLabel.setData(labelD);
      this._renderer.append(this._textRendererDLabel);
    }
    const numericFormatter = getNumericFormatter(3);
    if (points.length >= 3) {
      this._abRetracementTrend.setData(makeLineConfig(pointA, pointC));
      this._renderer.append(this._abRetracementTrend);
      const abMid = pointA.add(pointC).scaled(0.5);
      const abLabel = makeLabelConfig(abMid, numericFormatter.format(this._data.abRatio));
      this._abLabelRenderer.setData(abLabel);
      this._renderer.append(this._abLabelRenderer);
    }
    if (points.length >= 4) {
      this._cdRetracementTrend.setData(makeLineConfig(pointB, pointD));
      this._renderer.append(this._cdRetracementTrend);
      const cdMid = pointB.add(pointD).scaled(0.5);
      const cdLabel = makeLabelConfig(cdMid, numericFormatter.format(this._data.cdRatio));
      this._cdLabelRenderer.setData(cdLabel);
      this._renderer.append(this._cdLabelRenderer);
    }
    this.addAnchors(this._renderer);
  }
}
class PatternABCDPrimitive extends ToolPrimitive {
  constructor() {
    super(...arguments);
    __publicField(this, "_lines", new PatternABCDPaneView(this, this.model));
    __publicField(this, "_paneView", [this._lines]);
    __publicField(this, "_priceAxisPaneViews", [new PriceRangeAxisPaneView(/* @__PURE__ */ Object.create(null))]);
    __publicField(this, "_timeAxisPaneViews", [new TimeRangeAxisPaneView(/* @__PURE__ */ Object.create(null))]);
    __publicField(this, "_timeAxisViews", [
      new TimeLabelTimeAxisView(/* @__PURE__ */ Object.create(null)),
      new TimeLabelTimeAxisView(/* @__PURE__ */ Object.create(null)),
      new TimeLabelTimeAxisView(/* @__PURE__ */ Object.create(null)),
      new TimeLabelTimeAxisView(/* @__PURE__ */ Object.create(null))
    ]);
    __publicField(this, "_priceAxisViews", [
      new PriceLabelPriceAxisView(/* @__PURE__ */ Object.create(null)),
      new PriceLabelPriceAxisView(/* @__PURE__ */ Object.create(null)),
      new PriceLabelPriceAxisView(/* @__PURE__ */ Object.create(null)),
      new PriceLabelPriceAxisView(/* @__PURE__ */ Object.create(null))
    ]);
  }
  pointsCount() {
    return 4;
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
      abRatio: NaN,
      cdRatio: NaN
    };
    if (points.length >= 3) {
      const [srcA, srcB, srcC] = this.controlPoints;
      data.abRatio = Math.round(Math.abs((srcC.price - srcB.price) / (srcB.price - srcA.price)) * 1e3) / 1e3;
    }
    if (points.length >= 4) {
      const [, srcB, srcC, srcD] = this.controlPoints;
      data.cdRatio = Math.round(Math.abs((srcD.price - srcC.price) / (srcC.price - srcB.price)) * 1e3) / 1e3;
    }
    this._lines.update(data);
  }
}
class PatternABCDTool extends DrawingTool {
  constructor() {
    super(...arguments);
    __publicField(this, "type", PatternABCDToolType);
  }
  createPrimitive() {
    return new PatternABCDPrimitive(
      {
        id: this.id,
        points: [],
        color: "#089981FF",
        lineWidth: 2,
        background: getLightenRGBA("#089981FF", 0.15),
        textColor: "#ffffff",
        textFontSize: 12
      },
      ...this.resetArgs
    );
  }
}
export {
  PatternABCDTool
};
