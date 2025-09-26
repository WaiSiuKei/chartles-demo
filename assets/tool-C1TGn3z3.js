var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { T as ToolPaneView, a as ToolPrimitive, i as isPointAccepted, D as DrawingTool } from "./toolPaneView-3wj_on-u.js";
import { aa as BarsPatternMode, ab as BarsPatternToolType } from "./index-TSHQCVD9.js";
import { u as Point, b6 as NOTIMPLEMENTED, L as LineStyleType, bN as LineEnd, e as ensure, c as cloneDeep, A as AnchorPoint } from "./index-NZHt9VGv.js";
import { P as PriceLabelPriceAxisView } from "./priceLabelPriceAxisView-d9Maj5lR.js";
import { T as TimeLabelTimeAxisView } from "./timeLabelTimeAxisView-BvW_UnA0.js";
import { P as PriceRangeAxisPaneView, T as TimeRangeAxisPaneView } from "./axisPaneView-Pbgdotf1.js";
import { C as CompositeRenderer } from "./composite-tvPrNHN0.js";
import { L as LineRenderer } from "./line-DFhYRKvt.js";
import { R as RectangleRenderer } from "./rectangle-CfXWJsDB.js";
import { V as VerticalLineRenderer } from "./verticalLine-Bizl3Oqm.js";
import "./baseTool-CHlzZht2.js";
const patternValueExtractors = {
  [BarsPatternMode.Bars]: (bar) => [bar[2], bar[3]],
  // High/Low
  [BarsPatternMode.Line]: (bar) => bar[4],
  // Close
  [BarsPatternMode.OpenClose]: (bar) => [bar[1], bar[4]],
  // Open/Close
  [BarsPatternMode.LineOpen]: (bar) => bar[1],
  // Open
  [BarsPatternMode.LineHigh]: (bar) => bar[2],
  // High
  [BarsPatternMode.LineLow]: (bar) => bar[3],
  // Low
  [BarsPatternMode.LineHL2]: (bar) => (bar[2] + bar[3]) / 2
  // HL2 = (High + Low) / 2
};
const defaultColor = "#808080";
class BarsPatternPaneView extends ToolPaneView {
  constructor() {
    super(...arguments);
    __publicField(this, "_vertLineRenderer1", new VerticalLineRenderer());
    __publicField(this, "_vertLineRenderer2", new VerticalLineRenderer());
    __publicField(this, "_medianRenderer", new LineRenderer());
    __publicField(this, "_renderer", new CompositeRenderer(this._hitTestCollector));
  }
  renderer() {
    return this._renderer;
  }
  _updateImpl() {
    this._renderer.clear();
    const points = this.points();
    if ((points == null ? void 0 : points.length) < 2) return;
    const linePoints = this._source.controlPoints;
    const patternData = this._data.patternData;
    const patternLength = patternData.length;
    if (patternLength > 0 && linePoints.length === 2) {
      const properties = this._source.properties();
      const mode = properties.mode;
      const color = properties.color;
      const stepX = Math.abs((points[0].x - points[1].x) / (patternLength - 1));
      const scaleMultiplier = this._data.scale;
      const valueToY = (v) => ensure(this._source.priceScale().priceToCoordinate(v)) * scaleMultiplier;
      const [{ time: time1 }, { time: time2 }] = linePoints;
      const anchorPoint = time1 < time2 ? points[0] : points[1];
      const startX = anchorPoint.x;
      const deltaY = anchorPoint.y - valueToY(this._data.firstPatternPrice);
      if (mode === BarsPatternMode.Bars || mode === BarsPatternMode.OpenClose) {
        const barRectGenerator = patternValueExtractors[mode];
        for (let i = 0; i < patternLength; i++) {
          const centerX = Math.round(startX + i * stepX + 0.5);
          const barPoints = barRectGenerator(patternData[i]).map((value, j) => {
            const offsetX = 2 * j - 1;
            const x = centerX + offsetX;
            const y = Math.round(valueToY(value)) + deltaY;
            return new Point(x, y);
          });
          const rectRenderer = new RectangleRenderer();
          rectRenderer.setData({
            points: barPoints,
            color,
            backColor: color,
            lineWidth: 1,
            // fillBackground: true,
            transparency: 10,
            extendLeft: false,
            extendRight: false
          });
          this._renderer.append(rectRenderer);
        }
        const anchorProps = {
          points
        };
        this._renderer.append(this.createLineAnchor(anchorProps, 0));
      } else {
        NOTIMPLEMENTED();
      }
    } else {
      this._vertLineRenderer1.setData({
        x: points[0].x,
        lineColor: defaultColor,
        lineWidth: 1,
        lineStyle: LineStyleType.solid
      });
      this._renderer.append(this._vertLineRenderer1);
      this._vertLineRenderer2.setData({
        x: points[1].x,
        lineColor: defaultColor,
        lineWidth: 1,
        lineStyle: LineStyleType.solid
      });
      this._renderer.append(this._vertLineRenderer2);
      this._medianRenderer.setData({
        points,
        lineColor: defaultColor,
        lineWidth: 1,
        lineStyle: LineStyleType.solid,
        extendLeft: false,
        extendRight: false,
        leftEnd: LineEnd.Normal,
        rightEnd: LineEnd.Normal
      });
      this._renderer.append(this._medianRenderer);
    }
  }
}
const primaryIndexMap = {
  0: 2,
  1: 4,
  2: 1,
  3: 1,
  4: 2,
  5: 3,
  6: -1
};
const flippedIndexMap = {
  0: 3,
  1: 4,
  2: 4,
  3: 1,
  4: 2,
  5: 3,
  6: -1
};
class BarsPatternPrimitive extends ToolPrimitive {
  constructor() {
    super(...arguments);
    __publicField(this, "_lines", new BarsPatternPaneView(this, this.model));
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
    __publicField(this, "_pattern", []);
    __publicField(this, "_scale", 1);
    __publicField(this, "_pointsCoordinatePricesDiff", null);
  }
  pointsCount() {
    return 2;
  }
  addPoint(point, step) {
    const resp = super.addPoint(point, step);
    if (isPointAccepted(resp) && step == 1) {
      const [point1, point2] = this.controlPoints;
      const index1 = ensure(this.chart.timeScale().timeToIndex(point1.time, true));
      const index2 = ensure(this.chart.timeScale().timeToIndex(point2.time, true));
      const startIndex = Math.min(index1, index2);
      const endIndex = Math.max(index1, index2);
      this._pattern = this._createPattern(startIndex, endIndex);
      if (this._pattern.length > 0) {
        if (index1 > index2) {
          this.controlPoints.reverse();
        }
        const priceDelta = this._patternPriceDiff();
        this.controlPoints[1].price = this.controlPoints[0].price + priceDelta;
        this.controlPoints[1].time = this.series.dataByIndex(endIndex).time;
      }
      this._updatePointsCoordinatePricesDiff();
    }
    this.updateProps({
      indexPoints: cloneDeep(this.controlPoints.slice()),
      points: this.controlPoints.map((point2) => {
        const idx = ensure(this.chart.timeScale().timeToIndex(point2.time));
        const bar = ensure(this.series.dataByIndex(idx));
        const high = bar.customValues.high;
        const y = ensure(this.series.priceToCoordinate(high));
        point2.price = ensure(this.series.coordinateToPrice(y - 33));
        return point2;
      })
    });
    return resp;
  }
  setPoint(pointIndex, pointData, details) {
    if (pointIndex === 1 && pointData.time <= this.controlPoints[0].time) {
      const index0 = ensure(this.chart.timeScale().timeToIndex(this.controlPoints[0].time));
      pointData.time = ensure(this.series.dataByIndex(index0 + 1)).time;
    }
    if (pointIndex === 0 && pointData.time >= this.controlPoints[1].time) {
      const index1 = ensure(this.chart.timeScale().timeToIndex(this.controlPoints[1].time));
      pointData.time = ensure(this.series.dataByIndex(index1 - 1)).time;
    }
    super.setPoint(pointIndex, pointData, details);
  }
  _updatePointsCoordinatePricesDiff() {
    this._pointsCoordinatePricesDiff = this._calculatePointsCoordinatePricesDiff();
  }
  _calculatePointsCoordinatePricesDiff() {
    if (2 === this.controlPoints.length) {
      const [{ price: t }, { price: e }] = this.controlPoints;
      return this._priceCoordinateDiff([t, e]) ?? null;
    }
    return null;
  }
  _priceCoordinateDiff(t) {
    const e = this._pricesToCoordinates(t);
    if (e) return e[1] - e[0];
  }
  _pricesToCoordinates(t) {
    return t.map((t2) => ensure(this.series.priceToCoordinate(t2)));
  }
  firstPatternPrice() {
    const { mode, flipped } = this.properties();
    const patternPoint = this._pattern[0];
    if (mode === BarsPatternMode.LineHL2) {
      return (patternPoint[2] + patternPoint[3]) / 2;
    }
    const modeValue = mode;
    return flipped ? patternPoint[flippedIndexMap[modeValue]] : patternPoint[primaryIndexMap[modeValue]];
  }
  lastPatternPrice() {
    const { mode, flipped } = this.properties();
    const patternPoint = this._pattern[this._pattern.length - 1];
    if (mode === BarsPatternMode.LineHL2) {
      return (patternPoint[2] + patternPoint[3]) / 2;
    }
    const modeValue = mode;
    return flipped ? patternPoint[flippedIndexMap[modeValue]] : patternPoint[primaryIndexMap[modeValue]];
  }
  _patternPriceDiff() {
    return this.lastPatternPrice() - this.firstPatternPrice();
  }
  _createPattern(startIndex, endIndex) {
    const dataSeries = this.series.data();
    const pattern = [];
    for (let i = startIndex; i <= endIndex; i++) {
      const row = ensure(dataSeries[i]);
      pattern.push([
        row.time,
        row.customValues.open,
        row.customValues.high,
        row.customValues.low,
        row.customValues.close
      ]);
    }
    return pattern;
  }
  _calculateScale() {
    let scale = 1;
    if (this.controlPoints.length === 2) {
      const patternPriceDiff = this._calculatePatternCoordinatePricesDiff();
      if (!patternPriceDiff) {
        return scale;
      }
      const pointsPriceDiff = this._calculatePointsCoordinatePricesDiff();
      if (pointsPriceDiff !== null) {
        scale = parseFloat((pointsPriceDiff / patternPriceDiff).toFixed(8));
      }
      if (this._pointsCoordinatePricesDiff !== pointsPriceDiff) {
        if (this._scale !== scale) {
          this._updateLastPoint();
          return this._scale;
        }
        this._updatePointsCoordinatePricesDiff();
      }
    }
    return scale;
  }
  _calculatePatternCoordinatePricesDiff() {
    return this._pattern.length > 0 ? this._priceCoordinateDiff([this.firstPatternPrice(), this.lastPatternPrice()]) ?? null : null;
  }
  _updateLastPoint() {
    if (this.controlPoints.length < 2) return;
    const scale = this._scale;
    const patternPriceDiff = this._calculatePatternCoordinatePricesDiff();
    const priceCoordinates = this._pricesToCoordinates([this.controlPoints[0].price]);
    if (patternPriceDiff !== null && priceCoordinates) {
      const offsetY = +(scale * patternPriceDiff).toFixed(8);
      const finalCoordinate = offsetY + priceCoordinates[0];
      const updatedPrice = ensure(this.series.coordinateToPrice(finalCoordinate));
      this.controlPoints[1].price = updatedPrice;
      this._updatePointsCoordinatePricesDiff();
    }
  }
  getScale() {
    return this._scale = this._calculateScale();
  }
  updateAllViews() {
    if (!this.controlPoints.length) return;
    let scale = NaN;
    let firstPatternPrice = NaN;
    let pattern = [];
    if (!this.isDrawing) {
      scale = this.getScale();
      firstPatternPrice = this.firstPatternPrice();
      pattern = this._pattern;
    }
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
    this._paneView[0].update({ points, scale, firstPatternPrice, patternData: pattern });
  }
}
class BarsPatternTool extends DrawingTool {
  constructor() {
    super(...arguments);
    __publicField(this, "type", BarsPatternToolType);
    __publicField(this, "disableExtendTime", true);
  }
  createPrimitive() {
    return new BarsPatternPrimitive(
      {
        id: this.id,
        points: [],
        color: "#2962FF",
        indexPoints: [],
        mode: BarsPatternMode.Bars,
        flipped: false,
        mirrored: false
      },
      ...this.resetArgs
    );
  }
  onlyDrawingOnMainSeries() {
    return true;
  }
}
export {
  BarsPatternTool
};
