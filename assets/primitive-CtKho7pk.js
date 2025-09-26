var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { P as PriceLabelPriceAxisView } from "./priceLabelPriceAxisView-d9Maj5lR.js";
import { T as TimeLabelTimeAxisView } from "./timeLabelTimeAxisView-BvW_UnA0.js";
import { L as LineStyleType, r as ChartFontFamily, bN as LineEnd, A as AnchorPoint } from "./index-NZHt9VGv.js";
import { P as PriceRangeAxisPaneView, T as TimeRangeAxisPaneView } from "./axisPaneView-Pbgdotf1.js";
import { T as ToolPaneView, a as ToolPrimitive } from "./toolPaneView-3wj_on-u.js";
import { B as BaseTextRenderer, H as HorizontalAlign, V as VerticalAlign } from "./text-CtvZov1L.js";
import { b as getNumericFormatter } from "./formatter-_n1ErJyi.js";
import { C as CompositeRenderer } from "./composite-tvPrNHN0.js";
import { L as LineRenderer } from "./line-DFhYRKvt.js";
import { P as PolygonRenderer } from "./polygon-CB5TCmTw.js";
import { T as TriangleRenderer } from "./triangle-CyrUWcBj.js";
class PatternXABCDPaneView extends ToolPaneView {
  constructor() {
    super(...arguments);
    __publicField(this, "_renderer", new CompositeRenderer(this._hitTestCollector));
    __publicField(this, "_bcRetracementTrend", new LineRenderer());
    __publicField(this, "_xdRetracementTrend", new LineRenderer());
    __publicField(this, "_xbTrend", new LineRenderer());
    __publicField(this, "_bdTrend", new LineRenderer());
    __publicField(this, "_polylineRenderer", new PolygonRenderer());
    __publicField(this, "_mainTriangleRenderer", new TriangleRenderer());
    __publicField(this, "_triangleRendererPoints234", new TriangleRenderer());
    __publicField(this, "_xbLabelRenderer", new BaseTextRenderer());
    __publicField(this, "_acLabelRenderer", new BaseTextRenderer());
    __publicField(this, "_bdLabelRenderer", new BaseTextRenderer());
    __publicField(this, "_xdLabelRenderer", new BaseTextRenderer());
    __publicField(this, "_textRendererALabel", new BaseTextRenderer());
    __publicField(this, "_textRendererBLabel", new BaseTextRenderer());
    __publicField(this, "_textRendererCLabel", new BaseTextRenderer());
    __publicField(this, "_textRendererDLabel", new BaseTextRenderer());
    __publicField(this, "_textRendererXLabel", new BaseTextRenderer());
  }
  renderer() {
    return this._renderer;
  }
  _updateImpl() {
    this._renderer.clear();
    const points = this.points();
    if ((points == null ? void 0 : points.length) < 2) return;
    const properties = this._source.properties();
    const createLabel = (point, text) => ({
      points: [point],
      text,
      color: properties.textColor,
      vertAlign: VerticalAlign.Middle,
      horzAlign: HorizontalAlign.Center,
      fontFamily: ChartFontFamily,
      offsetX: 0,
      offsetY: 0,
      // bold: properties.bold,
      // italic: properties.italic,
      fontSize: properties.textFontSize,
      backgroundColor: properties.color,
      backgroundRoundRect: 4
    });
    const createLine = (from, to) => ({
      points: [from, to],
      lineColor: properties.color,
      lineWidth: 1,
      lineStyle: LineStyleType.dotted,
      extendLeft: false,
      extendRight: false,
      leftEnd: LineEnd.Normal,
      rightEnd: LineEnd.Normal
    });
    const [pointX, pointA, pointB, pointC, pointD] = points;
    const mainTriangleData = {
      points: [pointX, pointA, points.length < 3 ? pointA : pointB],
      color: "rgba(0, 0, 0, 0)",
      lineWidth: properties.lineWidth,
      backColor: properties.background,
      fillBackground: true
    };
    this._mainTriangleRenderer.setData(mainTriangleData);
    this._renderer.append(this._mainTriangleRenderer);
    if (points.length > 3) {
      const triangleData = {
        points: [pointB, pointC, points.length === 5 ? pointD : pointC],
        color: "rgba(0, 0, 0, 0)",
        lineWidth: properties.lineWidth,
        backColor: properties.background,
        fillBackground: true
      };
      this._triangleRendererPoints234.setData(triangleData);
      this._renderer.append(this._triangleRendererPoints234);
    }
    const polylineData = {
      points,
      lineColor: properties.color,
      lineWidth: properties.lineWidth,
      background: properties.background,
      lineStyle: LineStyleType.solid,
      filled: false
    };
    this._polylineRenderer.setData(polylineData);
    this._renderer.append(this._polylineRenderer);
    const formatter = getNumericFormatter(3);
    if (points.length >= 3) {
      const abMid = pointX.add(pointB).scaled(0.5);
      const abLabel = createLabel(abMid, formatter.format(this._data.abRetracement));
      this._xbLabelRenderer.setData(abLabel);
      this._renderer.append(this._xbLabelRenderer);
      const abLine = createLine(pointX, pointB);
      this._xbTrend.setData(abLine);
      this._renderer.append(this._xbTrend);
    }
    if (points.length >= 4) {
      const bcMid = pointA.add(pointC).scaled(0.5);
      const bcLabel = createLabel(bcMid, formatter.format(this._data.bcRetracement));
      this._acLabelRenderer.setData(bcLabel);
      this._renderer.append(this._acLabelRenderer);
      const bcLine = createLine(pointA, pointC);
      this._bcRetracementTrend.setData(bcLine);
      this._renderer.append(this._bcRetracementTrend);
    }
    if (points.length >= 5) {
      const cdMid = pointB.add(pointD).scaled(0.5);
      const cdLabel = createLabel(cdMid, formatter.format(this._data.cdRetracement));
      this._bdLabelRenderer.setData(cdLabel);
      this._renderer.append(this._bdLabelRenderer);
      const xdTrend = createLine(pointX, pointD);
      this._xdRetracementTrend.setData(xdTrend);
      this._renderer.append(this._xdRetracementTrend);
      const xdMid = pointX.add(pointD).scaled(0.5);
      const xdLabel = createLabel(xdMid, formatter.format(this._data.xdRetracement));
      this._xdLabelRenderer.setData(xdLabel);
      this._renderer.append(this._xdLabelRenderer);
      const bdLine = createLine(pointB, pointD);
      this._bdTrend.setData(bdLine);
      this._renderer.append(this._bdTrend);
    }
    const labelX = createLabel(pointX, "X");
    labelX.vertAlign = pointA.y > pointX.y ? VerticalAlign.Bottom : VerticalAlign.Top;
    labelX.offsetY = 5;
    this._textRendererXLabel.setData(labelX);
    this._renderer.append(this._textRendererXLabel);
    const labelA = createLabel(pointA, "A");
    labelA.vertAlign = pointA.y < pointX.y ? VerticalAlign.Bottom : VerticalAlign.Top;
    labelA.offsetY = 5;
    this._textRendererALabel.setData(labelA);
    this._renderer.append(this._textRendererALabel);
    if (points.length > 2) {
      const labelB = createLabel(pointB, "B");
      labelB.vertAlign = pointB.y < pointA.y ? VerticalAlign.Bottom : VerticalAlign.Top;
      labelB.offsetY = 5;
      this._textRendererBLabel.setData(labelB);
      this._renderer.append(this._textRendererBLabel);
    }
    if (points.length > 3) {
      const labelC = createLabel(pointC, "C");
      labelC.vertAlign = pointC.y < pointB.y ? VerticalAlign.Bottom : VerticalAlign.Top;
      labelC.offsetY = 5;
      this._textRendererCLabel.setData(labelC);
      this._renderer.append(this._textRendererCLabel);
    }
    if (points.length > 4) {
      const labelD = createLabel(pointD, "D");
      labelD.vertAlign = pointD.y < pointC.y ? VerticalAlign.Bottom : VerticalAlign.Top;
      labelD.offsetY = 5;
      this._textRendererDLabel.setData(labelD);
      this._renderer.append(this._textRendererDLabel);
    }
    this.addAnchors(this._renderer);
  }
}
class PatternXABCDPrimitive extends ToolPrimitive {
  constructor() {
    super(...arguments);
    __publicField(this, "_lines", new PatternXABCDPaneView(this, this.model));
    __publicField(this, "_paneView", [this._lines]);
    __publicField(this, "_priceAxisPaneViews", [new PriceRangeAxisPaneView(/* @__PURE__ */ Object.create(null))]);
    __publicField(this, "_timeAxisPaneViews", [new TimeRangeAxisPaneView(/* @__PURE__ */ Object.create(null))]);
    __publicField(this, "_timeAxisViews", [
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
      new PriceLabelPriceAxisView(/* @__PURE__ */ Object.create(null))
    ]);
  }
  pointsCount() {
    return 5;
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
      abRetracement: NaN,
      bcRetracement: NaN,
      cdRetracement: NaN,
      xdRetracement: NaN
    };
    this._updateBaseData(data);
    this._lines.update(data);
  }
  _updateBaseData(data) {
    const points = data.points;
    if (points.length >= 3) {
      const [pointX, pointA, pointB] = this.controlPoints;
      const ab = Math.abs((pointB.price - pointA.price) / (pointA.price - pointX.price));
      data.abRetracement = Math.round(ab * 1e3) / 1e3;
    }
    if (points.length >= 4) {
      const [, pointA, pointB, pointC] = this.controlPoints;
      const bc = Math.abs((pointC.price - pointB.price) / (pointB.price - pointA.price));
      data.bcRetracement = Math.round(bc * 1e3) / 1e3;
    }
    if (points.length >= 5) {
      const [pointX, pointA, pointB, pointC, pointD] = this.controlPoints;
      const cd = Math.abs((pointD.price - pointC.price) / (pointC.price - pointB.price));
      const xd = Math.abs((pointD.price - pointA.price) / (pointA.price - pointX.price));
      data.cdRetracement = Math.round(cd * 1e3) / 1e3;
      data.xdRetracement = Math.round(xd * 1e3) / 1e3;
    }
  }
}
export {
  PatternXABCDPrimitive as P
};
