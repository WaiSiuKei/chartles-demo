var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { L as LineStyleType, bM as generateColor, y as HitTestResult, z as HitTarget, cn as resetTransparency, e as ensure, bN as LineEnd, r as ChartFontFamily, A as AnchorPoint, u as Point } from "./index-DSkroicZ.js";
import { T as ToolPaneView, a as ToolPrimitive, D as DrawingTool } from "./toolPaneView-BAEHHn7m.js";
import { R as RegressionTrendToolType } from "./index-DNbtFiKr.js";
import { P as PriceLabelPriceAxisView } from "./priceLabelPriceAxisView-d9Maj5lR.js";
import { T as TimeLabelTimeAxisView } from "./timeLabelTimeAxisView-BvW_UnA0.js";
import { P as PriceRangeAxisPaneView, T as TimeRangeAxisPaneView } from "./axisPaneView-Pbgdotf1.js";
import { B as BaseTextRenderer, H as HorizontalAlign, V as VerticalAlign } from "./text-DNYLW3w-.js";
import { C as CompositeRenderer } from "./composite-BOGQNAfc.js";
import { L as LineRenderer } from "./line-CuaAD_DW.js";
import { P as ParallelChannelRenderer } from "./parallelChannel-Cc0CK6jv.js";
import { V as VerticalLineRenderer } from "./verticalLine-oeLvAaCR.js";
import "./baseTool-BVX9dcKc.js";
import "./text-FiPV6-V4.js";
import "./ctx-DYUP60aL.js";
import "./line-tUhOmrMF.js";
function linearRegression(data) {
  var m;
  var b;
  var dataLength = data.length;
  if (dataLength === 1) {
    m = 0;
    b = data[0][1];
  } else {
    var sumX = 0;
    var sumY = 0;
    var sumXX = 0;
    var sumXY = 0;
    var point;
    var x;
    var y;
    for (var i = 0; i < dataLength; i++) {
      point = data[i];
      x = point[0];
      y = point[1];
      sumX += x;
      sumY += y;
      sumXX += x * x;
      sumXY += x * y;
    }
    m = (dataLength * sumXY - sumX * sumY) / (dataLength * sumXX - sumX * sumX);
    b = sumY / dataLength - m * sumX / dataLength;
  }
  return {
    m,
    b
  };
}
function sum(x) {
  if (x.length === 0) {
    return 0;
  }
  var sum2 = x[0];
  var correction = 0;
  var transition;
  if (typeof sum2 !== "number") {
    return Number.NaN;
  }
  for (var i = 1; i < x.length; i++) {
    if (typeof x[i] !== "number") {
      return Number.NaN;
    }
    transition = sum2 + x[i];
    if (Math.abs(sum2) >= Math.abs(x[i])) {
      correction += sum2 - transition + x[i];
    } else {
      correction += x[i] - transition + sum2;
    }
    sum2 = transition;
  }
  return sum2 + correction;
}
function mean(x) {
  if (x.length === 0) {
    throw new Error("mean requires at least one data point");
  }
  return sum(x) / x.length;
}
function sumNthPowerDeviations(x, n) {
  var meanValue = mean(x);
  var sum2 = 0;
  var tempValue;
  var i;
  {
    for (i = 0; i < x.length; i++) {
      tempValue = x[i] - meanValue;
      sum2 += tempValue * tempValue;
    }
  }
  return sum2;
}
function variance(x) {
  if (x.length === 0) {
    throw new Error("variance requires at least one data point");
  }
  return sumNthPowerDeviations(x) / x.length;
}
function standardDeviation(x) {
  if (x.length === 1) {
    return 0;
  }
  var v = variance(x);
  return Math.sqrt(v);
}
const placeholderColor = "#808080";
class RegressionTrendPaneView extends ToolPaneView {
  constructor() {
    super(...arguments);
    __publicField(this, "_pearsonsLabelRenderer", new BaseTextRenderer());
    __publicField(this, "_renderer", new CompositeRenderer(this._hitTestCollector));
  }
  renderer() {
    return this._renderer;
  }
  _updateImpl() {
    this._renderer.clear();
    const points = this.points();
    if (!(points == null ? void 0 : points.length)) return;
    const data = this._buildGraphicData();
    const lines = [data.lines[1], data.lines[0], data.lines[2]].filter(
      Boolean
    );
    if (!lines.length) {
      this._renderer.append(
        ...points.map((p) => {
          return new VerticalLineRenderer({
            x: p.x,
            lineColor: placeholderColor,
            lineWidth: 1
          });
        })
      );
      if (points.length > 1) {
        this._renderer.append(
          new LineRenderer({
            points,
            lineColor: placeholderColor,
            lineWidth: 1,
            lineStyle: LineStyleType.solid
          })
        );
      }
      return;
    }
    const transparency = this._source.properties().transparency;
    for (let i = 1; i < lines.length; i++) {
      const currentLine = lines[i];
      const previousLine = lines[i - 1];
      const channelRenderData = {
        line1: {
          color: currentLine.lineColor,
          lineStyle: currentLine.lineStyle,
          lineWidth: currentLine.lineWidth,
          points: [currentLine.points[0], currentLine.points[1]]
        },
        line2: {
          color: currentLine.lineColor,
          lineStyle: currentLine.lineStyle,
          lineWidth: currentLine.lineWidth,
          points: [previousLine.points[0], previousLine.points[1]]
        },
        extendLeft: false,
        extendRight: currentLine.extendRight,
        backColor: generateColor(currentLine.lineColor, transparency),
        skipLines: true,
        fillBackground: true
      };
      const channelRenderer = new ParallelChannelRenderer();
      channelRenderer.setHitTest(new HitTestResult(HitTarget.Regular));
      channelRenderer.setData(channelRenderData);
      this._renderer.append(channelRenderer);
    }
    const resetLineRenderData = this._getTransparencyResetLines(lines);
    for (let i = 0; i < lines.length; i++) {
      const trendRenderer = new LineRenderer();
      trendRenderer.setData(resetLineRenderData[i]);
      trendRenderer.setHitTest(new HitTestResult(HitTarget.Regular));
      this._renderer.append(trendRenderer);
    }
    if (data.pearsons) {
      data.pearsons.color = resetTransparency(data.pearsons.color);
      this._pearsonsLabelRenderer.setData(data.pearsons);
      this._renderer.append(this._pearsonsLabelRenderer);
    }
    this.addAnchors(this._renderer);
  }
  _getTransparencyResetLines(lines) {
    return lines.map((l) => ({ ...l, lineColor: resetTransparency(l.lineColor) }));
  }
  _buildGraphicData() {
    const result = {
      lines: [],
      pearsons: null
    };
    const props = this._source.properties();
    const lines = [this._data.baseLine, this._data.downLine, this._data.upLine].filter(Boolean);
    const styleLines = [props.baseLine, props.downLine, props.upLine];
    for (let i = 0; i < lines.length; i++) {
      const line = ensure(lines[i]);
      const style = styleLines[i];
      result.lines.push({
        points: line.points,
        lineColor: style.color,
        lineWidth: style.lineWidth,
        lineStyle: style.lineStyle,
        extendLeft: false,
        extendRight: props.extendLines,
        leftEnd: LineEnd.Normal,
        rightEnd: LineEnd.Normal
      });
    }
    if (this._data.pearsons && props.showPearsons) {
      result.pearsons = {
        points: [this._data.pearsons.point],
        text: String(this._data.pearsons.value),
        color: props.downLine.color,
        vertAlign: VerticalAlign.Top,
        horzAlign: HorizontalAlign.Center,
        fontFamily: ChartFontFamily,
        offsetX: 0,
        offsetY: 4,
        fontSize: 12
      };
    }
    return result;
  }
}
class RegressionTrendPrimitive extends ToolPrimitive {
  constructor() {
    super(...arguments);
    __publicField(this, "disableExtendTime", true);
    __publicField(this, "_lines", new RegressionTrendPaneView(this, this.model));
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
    __publicField(this, "_regressionCache", null);
  }
  pointsCount() {
    return 2;
  }
  setPoint(index, point, details) {
    super.setPoint(index, point, details);
    this._regressionCache = null;
  }
  _calculateRegression() {
    const [p0, p1] = this.controlPoints;
    const index0 = ensure(this.chart.timeScale().timeToIndex(p0.time));
    const index1 = ensure(this.chart.timeScale().timeToIndex(p1.time));
    const startIndex = Math.min(index0, index1);
    const endIndex = Math.max(index0, index1);
    const allBars = this.series.data();
    const bars = allBars.slice(startIndex, endIndex + 1);
    const closes = bars.map((b2) => b2.customValues.close);
    const sigma = standardDeviation(closes);
    const { m, b } = linearRegression(
      bars.map((bar, i) => {
        return [i, bar.customValues.close];
      })
    );
    const d0 = 0;
    const d1 = endIndex - startIndex;
    const price0 = m * d0 + b;
    const price1 = m * d1 + b;
    const upPrice0 = m * d0 + b + 2 * sigma;
    const upPrice1 = m * d1 + b + 2 * sigma;
    const downPrice0 = m * d0 + b - 2 * sigma;
    const downPrice1 = m * d1 + b - 2 * sigma;
    return {
      time0: p0.time,
      time1: p1.time,
      price0,
      price1,
      upPrice0,
      upPrice1,
      downPrice0,
      downPrice1
    };
  }
  updateAllViews() {
    if (!this.controlPoints.length) return;
    const data = /* @__PURE__ */ Object.create(null);
    const [p0, p1] = this.controlPoints;
    const points = [];
    for (let i = 0; i < this.controlPoints.length; i++) {
      const p = this.controlPoints[i];
      const drawPoint = this.pointToScreenPoint(p);
      if (!drawPoint) return;
      points.push(new AnchorPoint(drawPoint, { pointIndex: i }));
    }
    if (this.isDrawing || this._currentDragTarget) {
      this._timeAxisViews[0].update(this._calculateTimeAxisViewData(p0.time, points[0].x));
      this._priceAxisViews[0].update(this._calculatePriceAxisViewData(p0.price, points[0].y));
      if (p1) {
        this._timeAxisViews[1].update(this._calculateTimeAxisViewData(p1.time, points[1].x));
        this._priceAxisViews[1].update(this._calculatePriceAxisViewData(p1.price, points[1].y));
        this._priceAxisPaneViews[0].update(
          this._calculatePriceAxisPaneViewData(points[1].y, points[1].y)
        );
        this._timeAxisPaneViews[0].update(
          this._calculateTimeAxisPaneViewsData(points[0].x, points[1].x)
        );
      }
      data.points = points;
    } else {
      if (!this._regressionCache) this._regressionCache = this._calculateRegression();
      const { time0, time1, price0, price1, upPrice0, upPrice1, downPrice0, downPrice1 } = this._regressionCache;
      const x0 = ensure(this.chart.timeScale().timeToCoordinate(time0));
      const x1 = ensure(this.chart.timeScale().timeToCoordinate(time1));
      const y0 = ensure(this.series.priceToCoordinate(price0));
      const y1 = ensure(this.series.priceToCoordinate(price1));
      const upY0 = ensure(this.series.priceToCoordinate(upPrice0));
      const upY1 = ensure(this.series.priceToCoordinate(upPrice1));
      const downY0 = ensure(this.series.priceToCoordinate(downPrice0));
      const downY1 = ensure(this.series.priceToCoordinate(downPrice1));
      this._timeAxisViews[0].update(this._calculateTimeAxisViewData(time0, x0));
      this._timeAxisViews[1].update(this._calculateTimeAxisViewData(time1, x1));
      this._priceAxisViews[0].update(this._calculatePriceAxisViewData(price0, y0));
      this._priceAxisViews[1].update(this._calculatePriceAxisViewData(price1, y1));
      this._priceAxisPaneViews[0].update(this._calculatePriceAxisPaneViewData(y0, y1));
      this._timeAxisPaneViews[0].update(this._calculateTimeAxisPaneViewsData(x0, x1));
      const baseLinePoints = [
        new AnchorPoint(new Point(x0, y0), { pointIndex: 0 }),
        new AnchorPoint(new Point(x1, y1), { pointIndex: 1 })
      ];
      data.baseLine = {
        points: baseLinePoints
      };
      data.upLine = {
        points: [new Point(x0, upY0), new Point(x1, upY1)]
      };
      data.downLine = {
        points: [new Point(x0, downY0), new Point(x1, downY1)]
      };
      data.points = baseLinePoints;
    }
    this._lines.update(data);
  }
}
class RegressionTrendTool extends DrawingTool {
  constructor() {
    super(...arguments);
    __publicField(this, "type", RegressionTrendToolType);
    __publicField(this, "disableExtendTime", true);
  }
  createPrimitive() {
    return new RegressionTrendPrimitive(
      {
        id: this.id,
        points: [],
        baseLine: {
          color: "#F23645",
          lineStyle: LineStyleType.dashed,
          lineWidth: 1
        },
        upLine: {
          color: "#2962FF",
          lineStyle: LineStyleType.solid,
          lineWidth: 2
        },
        downLine: {
          color: "#2962FF",
          lineStyle: LineStyleType.solid,
          lineWidth: 2
        },
        extendLines: false,
        showPearsons: false,
        transparency: 70
      },
      ...this.resetArgs
    );
  }
}
export {
  RegressionTrendTool
};
