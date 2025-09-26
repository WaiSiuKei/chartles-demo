var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { T as ToolPaneView, a as ToolPrimitive, A as AddPointResponse, c as DrawingAbortBehavior, D as DrawingTool } from "./toolPaneView-3wj_on-u.js";
import { af as GhostFeedToolType } from "./index-TSHQCVD9.js";
import { B as BitmapCoordinatesPaneRenderer, y as HitTestResult, z as HitTarget, cu as ye, e as ensure, bQ as interactionTolerance, cv as z, cw as Te, bN as LineEnd, L as LineStyleType, A as AnchorPoint } from "./index-NZHt9VGv.js";
import { P as PriceRangeAxisPaneView, T as TimeRangeAxisPaneView } from "./axisPaneView-Pbgdotf1.js";
import { C as CompositeRenderer } from "./composite-tvPrNHN0.js";
import { L as LineRenderer } from "./line-DFhYRKvt.js";
import "./baseTool-CHlzZht2.js";
class PaneRendererSeriesBase extends BitmapCoordinatesPaneRenderer {
  constructor() {
    super(...arguments);
    __publicField(this, "_bars", []);
  }
  hitTest(pos) {
    const bars = this._bars;
    if (bars.length === 0) return null;
    const tolerance = this._getTolerance();
    const first = bars[0], last = bars[bars.length - 1];
    if (pos.x < first.left - tolerance || pos.x > last.right + tolerance) return null;
    let left = 0, right = bars.length - 1;
    let foundIndex = -1;
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const bar = bars[mid];
      if (pos.x >= bar.left && pos.x <= bar.right) {
        foundIndex = mid;
        break;
      }
      if (pos.x > bar.right) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
    if (foundIndex === -1) return null;
    if (this._isPointAtBar(bars[foundIndex], pos.y, tolerance)) {
      return this._getHitTest();
    }
    let from = foundIndex;
    while (from >= 1 && pos.x - bars[from - 1].right < tolerance) from--;
    let to = foundIndex;
    while (to <= bars.length - 2 && bars[to + 1].left - pos.x < tolerance) to++;
    for (let i = from; i <= to; i++) {
      if (i !== foundIndex && this._isPointAtBar(bars[i], pos.y, tolerance)) {
        return this._getHitTest();
      }
    }
    return null;
  }
  // 命中返回值
  _getHitTest() {
    return new HitTestResult(HitTarget.Regular);
  }
  // 判断 y 坐标是否落入柱状区间（高低 + tolerence）
  _isPointAtBar(bar, y, tolerance) {
    const top = Math.min(bar.high, bar.low);
    const bottom = Math.max(bar.high, bar.low);
    return top - tolerance <= y && y <= bottom + tolerance;
  }
}
function computeCandleGeometry(rawBars, horizRatio, vertRatio, scaleCoeff) {
  const roundH = Math.floor(horizRatio);
  return rawBars.map((bar) => {
    let candleWidth = Te((bar.right - bar.left) * scaleCoeff, horizRatio);
    if (candleWidth >= 2 && roundH % 2 !== candleWidth % 2) {
      candleWidth--;
    }
    const halfWidth = Math.floor(0.5 * candleWidth);
    const borderWidth = function(width, hRatio) {
      let bw = Math.floor(1 * hRatio);
      if (width <= 2 * bw) {
        bw = Math.floor(0.5 * (width - 1));
      }
      const fallback = Math.max(Math.floor(hRatio), bw);
      if (width <= 2 * fallback) {
        return Math.max(Math.floor(hRatio), Math.floor(1 * hRatio));
      }
      return fallback;
    }(candleWidth, horizRatio);
    const center = Math.round(bar.center * horizRatio);
    const left = center - halfWidth;
    const right = left + candleWidth - 1;
    const openCloseDiff = Math.abs(Math.max(bar.open, bar.close) - Math.min(bar.open, bar.close)) * vertRatio;
    const top = Math.round(Math.min(bar.open, bar.close) * vertRatio);
    const bottom = Math.round(Math.max(bar.open, bar.close) * vertRatio);
    let wickWidth = Math.min(Math.floor(horizRatio), Math.floor(candleWidth * horizRatio));
    wickWidth = Math.max(Math.floor(horizRatio), Math.min(wickWidth, candleWidth));
    const wickOffset = Math.floor(0.5 * wickWidth);
    return {
      rawBodyHeight: openCloseDiff,
      top,
      bottom,
      center,
      left,
      right,
      candleWidth,
      high: Math.round(bar.high * vertRatio),
      low: Math.round(bar.low * vertRatio),
      wickWidth,
      wickOffset,
      borderWidth
    };
  });
}
class PaneRendererCandles extends PaneRendererSeriesBase {
  constructor() {
    super(...arguments);
    __publicField(this, "_scaleCoeff", 1);
    __publicField(this, "_borderVisible", false);
    __publicField(this, "_wickVisible", false);
    __publicField(this, "_bodyVisible", true);
    __publicField(this, "_borderColor");
    __publicField(this, "_wickColor");
    __publicField(this, "_isPriceScaleInverted", false);
  }
  setData(data) {
    super.setData(data);
    this._bars = data.bars;
    this._scaleCoeff = data.scaleCoeff ?? 1;
    this._borderVisible = data.borderVisible;
    this._bodyVisible = data.bodyVisible;
    this._wickVisible = data.wickVisible;
    this._borderColor = data.borderColor;
    this._wickColor = data.wickColor;
    this._hitTest = data.hittest;
    this._isPriceScaleInverted = data.isPriceScaleInverted;
  }
  hitTest(pos) {
    if (!this._wickVisible && !this._borderVisible && !this._bodyVisible) return null;
    return super.hitTest(pos);
  }
  drawImpl(renderParams) {
    var _a;
    const { context, horizontalPixelRatio, verticalPixelRatio } = renderParams;
    if (!this._data) return;
    if (((_a = this._bars) == null ? void 0 : _a.length) === 0) return;
    const items = computeCandleGeometry(
      this._bars,
      horizontalPixelRatio,
      verticalPixelRatio,
      this._scaleCoeff
    );
    if (this._wickVisible) this._drawWicks(context, items);
    if (this._borderVisible) this._drawBorder(context, items);
    if (this._bodyVisible) this._drawCandles(context, items);
  }
  _calcBarWidth(pixelRatio) {
    const limit = Math.floor(pixelRatio);
    return Math.max(limit, Math.floor(ye(ensure(this._data).barSpacing, pixelRatio)));
  }
  _getTolerance() {
    return interactionTolerance().series;
  }
  _getHitTest() {
    return this._hitTest || new HitTestResult(HitTarget.Regular);
  }
  _isPointAtBar(bar, y, tolerance) {
    const body = this._bodyVisible || this._borderVisible;
    const wick = this._wickVisible;
    if (!body && !wick) return false;
    if (body) {
      const min = wick ? Math.min(bar.high, bar.low) : Math.min(bar.open, bar.close);
      const max = wick ? Math.max(bar.high, bar.low) : Math.max(bar.open, bar.close);
      return min - tolerance <= y && y <= max + tolerance;
    } else {
      const minOC = Math.min(bar.open, bar.close);
      const maxOC = Math.max(bar.open, bar.close);
      return bar.high - tolerance <= y && y <= minOC + tolerance || maxOC - tolerance <= y && y <= bar.low + tolerance;
    }
  }
  _drawWicks(ctx, items) {
    let lastColor = "";
    let lastRight = null;
    this._bars.forEach((bar, i) => {
      const wickColor = bar.wickColor ?? ensure(this._wickColor);
      if (wickColor !== lastColor) {
        ctx.fillStyle = wickColor;
        lastColor = wickColor;
      }
      let { top, bottom } = items[i];
      const { rawBodyHeight, borderWidth, center, high, low, wickWidth, wickOffset } = items[i];
      if (this._isPriceScaleInverted) {
        [top, bottom] = [bottom, top];
      }
      let x = center - wickOffset;
      const x2 = x + wickWidth - 1;
      if (lastRight !== null) {
        x = Math.max(lastRight + 1, x);
        x = Math.min(x, x2);
      }
      const wickPixelWidth = x2 - x + 1;
      if (rawBodyHeight <= borderWidth) {
        if (top !== high) {
          top = Math.round(top - 0.5 * borderWidth);
        }
        bottom = bottom !== low ? Math.round(top - 0.5 * borderWidth) + borderWidth - 1 : low - 1;
      }
      if (top !== high) {
        ctx.fillRect(x, high, wickPixelWidth, top - high);
      }
      if (low - bottom - 1) {
        ctx.fillRect(x, bottom + 1, wickPixelWidth, low - bottom - 1);
      }
      lastRight = x2;
    });
  }
  _drawBorder(ctx, items) {
    let lastColor = "";
    let lastRight = null;
    this._bars.forEach((bar, i) => {
      const color = bar.borderColor ?? ensure(this._borderColor);
      if (color !== lastColor) {
        ctx.fillStyle = color;
        lastColor = color;
      }
      if (this._bodyVisible && bar.hollow) return;
      let { left } = items[i];
      const { rawBodyHeight, top, bottom, right, borderWidth } = items[i];
      if (lastRight !== null) {
        left = Math.max(lastRight + 1, left);
        left = Math.min(left, right);
      }
      const width = right - left + 1;
      if (rawBodyHeight <= borderWidth) {
        ctx.fillRect(left, Math.round(top - 0.5 * borderWidth), width, borderWidth);
      } else if (width > 2 * borderWidth) {
        z(ctx, left, top, width, bottom - top + 1, borderWidth);
      } else {
        ctx.fillRect(left, top, width, bottom - top + 1);
      }
      lastRight = right;
    });
  }
  _drawCandles(ctx, items) {
    let lastColor = "";
    this._bars.forEach((bar, i) => {
      let { top, bottom, left, right } = items[i];
      const { rawBodyHeight, borderWidth, candleWidth } = items[i];
      const innerWidth = right - left + 1;
      if (!(this._borderVisible && candleWidth <= 2 * borderWidth) || bar.hollow) {
        if (bar.color !== lastColor) {
          ctx.fillStyle = bar.color;
          lastColor = bar.color;
        }
        if (bar.hollow) {
          ctx.fillStyle = bar.color;
          if (rawBodyHeight <= borderWidth) {
            ctx.fillRect(left, Math.round(top - 0.5 * borderWidth), candleWidth, borderWidth);
          } else {
            z(ctx, left, top, innerWidth, bottom - top + 1, borderWidth);
          }
        } else {
          if (!this._borderVisible && rawBodyHeight <= borderWidth) {
            ctx.fillRect(left, Math.round(top - 0.5 * borderWidth), candleWidth, borderWidth);
          } else {
            if (this._borderVisible) {
              left += borderWidth;
              top += borderWidth;
              right -= borderWidth;
              bottom -= borderWidth;
            }
            if (top > bottom) return;
            ctx.fillRect(left, top, right - left + 1, bottom - top + 1);
          }
        }
      }
    });
  }
}
class GhostFeedPaneView extends ToolPaneView {
  constructor() {
    super(...arguments);
    __publicField(this, "_renderer", new CompositeRenderer(this._hitTestCollector));
  }
  renderer() {
    return this._renderer;
  }
  _updateImpl() {
    this._renderer.clear();
    const points = this.points();
    if (!(points == null ? void 0 : points.length)) return;
    const priceScale = this._source.priceScale();
    const properties = this._source.properties();
    const candleProps = properties.candleStyle;
    const upColor = candleProps.upColor;
    const downColor = candleProps.downColor;
    const borderUpColor = candleProps.borderUpColor;
    const borderDownColor = candleProps.borderDownColor;
    const barSpacing = this._source.timeScale().barSpacing();
    const barWidth = barSpacing;
    const segments = this._data.segments.map((segment, i) => {
      if (i >= points.length - 1) return null;
      let pA = points[i];
      let pB = points[i + 1];
      let pointA = this._source.controlPoints[i];
      let pointB = this._source.controlPoints[i + 1];
      let priceA = this._source.controlPoints[i].price;
      let priceB = this._source.controlPoints[i + 1].price;
      let direction = 1;
      if (pA.x > pB.x) {
        [pA, pB] = [pB, pA];
        [priceA, priceB] = [priceB, priceA];
        [pointA, pointB] = [pointB, pointA];
        direction = -1;
      }
      const indexStart = ensure(this._source.timeScale().timeToIndexEx(pointA.time));
      const yA = ensure(priceScale.priceToCoordinate(priceA));
      const yB = ensure(priceScale.priceToCoordinate(priceB));
      const bars = segment.bars();
      const barCount = bars.length;
      const dy = (yB - yA) / (barCount - 1);
      const barItems = [];
      let barIndex = direction > 0 ? 0 : barCount - 1;
      const endIndex = direction > 0 ? barCount : -1;
      for (let local = 0; barIndex !== endIndex; barIndex += direction, local++) {
        const centerY = yA + local * dy;
        const priceAtY = ensure(priceScale.coordinateToPrice(centerY));
        const candle = bars[barIndex];
        const isUp = candle.c >= candle.o;
        const center = ensure(
          this._source.timeScale().logicalToCoordinate(indexStart + local)
        );
        barItems.push({
          open: ensure(priceScale.priceToCoordinate(priceAtY + candle.o)),
          high: ensure(priceScale.priceToCoordinate(priceAtY + candle.h)),
          low: ensure(priceScale.priceToCoordinate(priceAtY + candle.l)),
          close: ensure(priceScale.priceToCoordinate(priceAtY + candle.c)),
          color: isUp ? upColor : downColor,
          borderColor: isUp ? borderUpColor : borderDownColor,
          hollow: false,
          center,
          left: center - barWidth / 2,
          right: center + barWidth / 2,
          timePointIndex: indexStart + local
        });
      }
      return { bars: barItems };
    }).filter((item) => item !== null);
    for (let i = 1; i < this.points().length; i++) {
      const lineOptions = {
        points: [this.points()[i - 1], this.points()[i]],
        lineColor: "#000",
        // default color or configurable
        lineWidth: 1,
        lineStyle: LineStyleType.solid,
        extendLeft: false,
        extendRight: false,
        leftEnd: LineEnd.Normal,
        rightEnd: LineEnd.Normal
      };
      const trendRenderer = new LineRenderer();
      trendRenderer.setData(lineOptions);
      trendRenderer.setHitTest(new HitTestResult(HitTarget.MovePoint));
      this._renderer.append(trendRenderer);
    }
    const showWick = candleProps.drawWick;
    const showBorder = candleProps.drawBorder;
    const defaultBorderColor = candleProps.borderColor;
    const defaultWickColor = candleProps.wickColor;
    const candleAlpha = 1 - properties.transparency / 100;
    const candleGroup = new CompositeRenderer();
    candleGroup.setGlobalAlpha(candleAlpha);
    for (const segment of segments) {
      const candleRenderer = new PaneRendererCandles();
      candleRenderer.setData({
        bars: segment.bars,
        barSpacing,
        wickVisible: showWick,
        bodyVisible: true,
        borderVisible: showBorder,
        borderColor: defaultBorderColor,
        wickColor: defaultWickColor,
        barWidth,
        hittest: new HitTestResult(HitTarget.MovePoint),
        // isPriceScaleInverted: priceScale.isInverted(),
        isPriceScaleInverted: false
      });
      candleGroup.append(candleRenderer);
    }
    this._renderer.append(candleGroup);
    this.addAnchors(this._renderer);
  }
}
class Segment {
  constructor(_source, _segmentIndex, _bars = []) {
    this._source = _source;
    this._segmentIndex = _segmentIndex;
    this._bars = _bars;
  }
  setBars(bars) {
    this._bars = bars;
  }
  generate() {
    this._bars = [];
    const points = this._source.controlPoints;
    const currentPoint = points[this._segmentIndex];
    const nextPoint = points[this._segmentIndex + 1];
    if (!currentPoint) return;
    if (!nextPoint) return;
    const currentPointIndex = this._source.getIndex(currentPoint);
    const nextPointIndex = this._source.getIndex(nextPoint);
    if (currentPointIndex === nextPointIndex) return;
    const startIndex = this._segmentIndex ? currentPointIndex + 1 : currentPointIndex;
    const direction = Math.sign(nextPointIndex - currentPointIndex);
    for (let index = startIndex; index !== nextPointIndex; index += direction) {
      this._bars.push(this._createBar());
    }
  }
  bars() {
    return this._bars;
  }
  setSize(targetSize) {
    if (targetSize < this._bars.length) {
      this._bars.splice(targetSize, this._bars.length - targetSize);
    } else {
      while (this._bars.length < targetSize) {
        this._bars.push(this._createBar());
      }
    }
  }
  _createBar() {
    const averageHL = this._source.properties().averageHL;
    const variance = this._source.properties().variance / 100;
    const base = this._source.properties().base;
    let randomFactor1 = Math.random();
    const range = averageHL * (1 - 2 * randomFactor1) * variance;
    randomFactor1 = Math.random();
    const offset = averageHL * (1 + (0.5 - randomFactor1) * variance);
    const low = range - offset / 2;
    const high = low + offset;
    return {
      o: (low + Math.random() * offset) / base,
      h: high / base,
      l: low / base,
      c: (low + Math.random() * offset) / base
    };
  }
}
class GhostFeedPrimitive extends ToolPrimitive {
  constructor() {
    super(...arguments);
    __publicField(this, "_lines", new GhostFeedPaneView(this, this.model));
    __publicField(this, "_paneView", [this._lines]);
    __publicField(this, "_priceAxisPaneViews", [new PriceRangeAxisPaneView(/* @__PURE__ */ Object.create(null))]);
    __publicField(this, "_timeAxisPaneViews", [new TimeRangeAxisPaneView(/* @__PURE__ */ Object.create(null))]);
    __publicField(this, "_segments", []);
  }
  pointsCount() {
    return Infinity;
  }
  addPoint(point, step) {
    super.addPoint(point, step);
    if (this.controlPoints.length > 2) {
      this._generateBars(this.controlPoints.length - 3);
    }
    return AddPointResponse.Accept;
  }
  setPoint(index, point, details) {
    super.setPoint(index, point, details);
    if (index > 0) {
      const currentIndex = this.getIndex(this.controlPoints[index]);
      const prevIndex = this.getIndex(this.controlPoints[index - 1]);
      const indexDelta = currentIndex - prevIndex;
      this._segments[index - 1].setSize(Math.abs(indexDelta));
    }
    if (index < this.controlPoints.length - 1) {
      const currentIndex = this.getIndex(this.controlPoints[index + 1]);
      const prevIndex = this.getIndex(this.controlPoints[index]);
      const indexDelta = currentIndex - prevIndex;
      this._segments[index].setSize(Math.abs(indexDelta));
    }
  }
  _generateBars(segmentIndex) {
    if (this._segments.length <= segmentIndex) {
      this._segments.push(new Segment(this, segmentIndex));
      this._segments[segmentIndex].generate();
    }
  }
  abort() {
    this.model.markCreatingFinishedOrAborted(this);
    this.controlPoints.pop();
    return this._props.points.length < 2 ? DrawingAbortBehavior.Remove : DrawingAbortBehavior.None;
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
    this._paneView[0].update({ points, segments: this._segments });
  }
}
class GhostFeedTool extends DrawingTool {
  constructor() {
    super(...arguments);
    __publicField(this, "type", GhostFeedToolType);
  }
  createPrimitive(drawingSession) {
    const atr = this._calculateATR(drawingSession);
    const base = drawingSession.chartService.symbolInfo().pricescale;
    return new GhostFeedPrimitive(
      {
        id: this.id,
        points: [],
        base,
        averageHL: atr * base,
        variance: 50,
        candleStyle: {
          upColor: "#ACE5DC",
          downColor: "#FAA1A4",
          drawWick: true,
          drawBorder: true,
          borderColor: "#378658",
          borderUpColor: "#089981",
          borderDownColor: "#F23645",
          wickColor: "#808080"
        },
        transparency: 50
      },
      ...this.resetArgs
    );
  }
  _calculateATR(drawingSession) {
    const bars = getMainSeries(drawingSession).data();
    const trueRanges = [];
    bars.forEach((bar) => {
      const { high, low } = bar.customValues;
      trueRanges.push(high - low);
    });
    const atr = trueRanges.length === 0 ? 0 : trueRanges.reduce((sum, value) => sum + value, 0) / trueRanges.length;
    return atr;
  }
  onlyDrawingOnMainSeries() {
    return true;
  }
}
function getMainSeries(session) {
  return session.chartService.mainSeriesApi.getSeries();
}
export {
  GhostFeedTool
};
