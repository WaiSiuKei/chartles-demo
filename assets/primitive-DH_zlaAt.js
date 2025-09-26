var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { e as ensure, A as AnchorPoint, u as Point, cs as AnchorResizeHorz, J as AnchorResizeVert, z as HitTarget, bN as LineEnd, L as LineStyleType, cq as vi, c0 as isFunction, cn as resetTransparency, r as ChartFontFamily, cx as Tt } from "./index-DSkroicZ.js";
import { a as getPipFormatter, b as getNumericFormatter, g as getPercentageFormatter } from "./formatter-Drv30PyG.js";
import { P as PriceLabelPriceAxisView } from "./priceLabelPriceAxisView-d9Maj5lR.js";
import { T as TimeLabelTimeAxisView } from "./timeLabelTimeAxisView-BvW_UnA0.js";
import { T as ToolPaneView, a as ToolPrimitive, A as AddPointResponse } from "./toolPaneView-BAEHHn7m.js";
import { P as PriceRangeAxisPaneView, T as TimeRangeAxisPaneView } from "./axisPaneView-Pbgdotf1.js";
import { B as BaseTextRenderer, V as VerticalAlign } from "./text-DNYLW3w-.js";
import { f as forceLTRStr } from "./text-FiPV6-V4.js";
import { C as CompositeRenderer } from "./composite-BOGQNAfc.js";
import { L as LineRenderer } from "./line-CuaAD_DW.js";
import { R as RectangleRenderer } from "./rectangle-DSOKVUU-.js";
function calculateLevel(drawingSession) {
  const range = ensure(drawingSession.chartService.chartApi.timeScale().getVisibleLogicalRange());
  let minValue = Number.POSITIVE_INFINITY;
  let maxValue = Number.NEGATIVE_INFINITY;
  const series = drawingSession.chartService.mainSeriesApi.getSeries();
  for (let i = range.from; i <= range.to; i++) {
    const bar = series.dataByIndex(Math.round(i));
    if (!bar) {
      break;
    }
    const { high, low } = bar.customValues;
    minValue = Math.min(low, minValue);
    maxValue = Math.max(high, maxValue);
  }
  const priceRange = Math.abs(maxValue - minValue);
  const symbolInfo = drawingSession.chartService.symbolInfo();
  const base = symbolInfo.pricescale / symbolInfo.minmov;
  return Math.round(0.2 * priceRange * base);
}
var RiskRewardPointIndex = /* @__PURE__ */ ((RiskRewardPointIndex2) => {
  RiskRewardPointIndex2[RiskRewardPointIndex2["Entry"] = 0] = "Entry";
  RiskRewardPointIndex2[RiskRewardPointIndex2["Close"] = 1] = "Close";
  RiskRewardPointIndex2[RiskRewardPointIndex2["ActualEntry"] = 2] = "ActualEntry";
  RiskRewardPointIndex2[RiskRewardPointIndex2["ActualClose"] = 3] = "ActualClose";
  return RiskRewardPointIndex2;
})(RiskRewardPointIndex || {});
var RiskDisplayMode = /* @__PURE__ */ ((RiskDisplayMode2) => {
  RiskDisplayMode2["Percentage"] = "percents";
  RiskDisplayMode2["Money"] = "money";
  return RiskDisplayMode2;
})(RiskDisplayMode || {});
class PositionPaneView extends ToolPaneView {
  constructor() {
    super(...arguments);
    __publicField(this, "_entryLineRenderer", new LineRenderer());
    __publicField(this, "_stopLineRenderer", new LineRenderer());
    __publicField(this, "_targetLineRenderer", new LineRenderer());
    __publicField(this, "_positionLineRenderer", new LineRenderer());
    __publicField(this, "_fullStopBgRenderer", new RectangleRenderer());
    __publicField(this, "_stopBgRenderer", new RectangleRenderer());
    __publicField(this, "_fullTargetBgRenderer", new RectangleRenderer());
    __publicField(this, "_targetBgRenderer", new RectangleRenderer());
    __publicField(this, "_stopLabelRenderer", new BaseTextRenderer());
    __publicField(this, "_middleLabelRenderer", new BaseTextRenderer());
    __publicField(this, "_profitLabelRenderer", new BaseTextRenderer());
    __publicField(this, "_renderer", new CompositeRenderer(this._hitTestCollector));
  }
  isLabelVisible() {
    return this.isHoveredSource() || this.isSelectedSource() || this._source.properties().alwaysShowStats;
  }
  renderer() {
    return this._renderer;
  }
  _updateImpl() {
    this._renderer.clear();
    const points = this.points();
    if ((points == null ? void 0 : points.length) < 2) return;
    const isClosed = points.length === 4;
    const lastBar = this._source.lastBarData();
    if (!lastBar) return;
    const currentPrice = lastBar.closePrice;
    const stopPrice = this._source.stopPrice();
    const profitPrice = this._source.profitPrice();
    const pl = this._source.calculatePL(currentPrice);
    const symbolInfo = this._source.symbolInfo();
    if (!symbolInfo) return;
    const priceScale = this._source.priceScale();
    const timeScale = this._source.timeScale();
    const entryY = points[RiskRewardPointIndex.Entry].y;
    const stopY = ensure(priceScale.priceToCoordinate(stopPrice));
    const profitY = ensure(priceScale.priceToCoordinate(profitPrice));
    const closeY = ensure(priceScale.priceToCoordinate(currentPrice));
    const closeX = ensure(timeScale.logicalToCoordinate(lastBar.index));
    const entryX = points[RiskRewardPointIndex.Entry].x;
    const actualEntryX = points[RiskRewardPointIndex.ActualEntry] ? points[RiskRewardPointIndex.ActualEntry].x : points[RiskRewardPointIndex.Close].x;
    const actualCloseX = points[RiskRewardPointIndex.ActualClose] ? points[RiskRewardPointIndex.ActualClose].x : points[RiskRewardPointIndex.Close].x;
    const edgeX = points[RiskRewardPointIndex.Close].x;
    const entryPrice = this._source.entryPrice();
    const stop = this._source.stopPrice();
    const profit = this._source.profitPrice();
    const layout = {
      pl,
      isClosed,
      entryLevel: entryY,
      stopLevel: stopY,
      profitLevel: profitY,
      closeLevel: closeY,
      closeBar: closeX,
      left: entryX,
      entryX: actualEntryX,
      right: actualCloseX,
      edge: edgeX,
      entryPrice,
      stopPrice: stop,
      profitPrice: profit,
      currentPrice
    };
    const {
      mediaSize: { width: canvasWidth, height: canvasHeight }
    } = this._source.getScope();
    let outOfScreen = edgeX < -5 || entryX > canvasWidth + 5;
    this._createBackgroundRenderers(layout);
    this._createLinesRenderers(layout);
    const pipFormatter = getPipFormatter(symbolInfo);
    this._createLabelsRenderers(layout, pipFormatter);
    outOfScreen = [
      this._profitLabelRenderer,
      this._stopLabelRenderer,
      this._middleLabelRenderer
    ].reduce(
      (acc, renderer) => acc && renderer.isOutOfScreen(canvasWidth, canvasHeight),
      outOfScreen
    );
    if (outOfScreen) return;
    const [firstPoint] = points;
    const anchors = [
      new AnchorPoint(new Point(entryX, firstPoint.y), { pointIndex: 0 }),
      new AnchorPoint(new Point(edgeX, firstPoint.y), {
        pointIndex: 1,
        resizeDirections: AnchorResizeHorz
      }),
      new AnchorPoint(new Point(entryX, stopY), {
        pointIndex: 2,
        resizeDirections: AnchorResizeVert
      }),
      new AnchorPoint(new Point(entryX, profitY), {
        pointIndex: 3,
        resizeDirections: AnchorResizeVert
      })
    ];
    this._renderer.append(this.createLineAnchor({ points: anchors }, 0));
  }
  _createBackgroundRenderers(data) {
    const props = this._source.properties();
    {
      const stopArea = {
        points: [new Point(data.left, data.entryLevel), new Point(data.edge, data.stopLevel)],
        color: "white",
        lineWidth: 0,
        backColor: props.stopBackground,
        transparency: props.stopBackgroundTransparency,
        extendLeft: false,
        extendRight: false,
        fillBackground: true,
        backgroundHitTarget: HitTarget.MovePoint
      };
      this._fullStopBgRenderer.setData(stopArea);
      this._renderer.append(this._fullStopBgRenderer);
    }
    if (data.pl < 0 && data.entryX !== data.right) {
      const from = new Point(data.entryX, data.entryLevel);
      const to = new Point(data.right, data.closeLevel);
      const transparencyPercent = 0.01 * props.stopBackgroundTransparency;
      const adjustedTransparency = 100 - 100 * (1 - transparencyPercent ** 3);
      const partialStop = {
        points: [from, to],
        color: "white",
        lineWidth: 0,
        backColor: props.stopBackground,
        fillBackground: true,
        transparency: adjustedTransparency,
        extendLeft: false,
        extendRight: false,
        backgroundHitTarget: HitTarget.MovePoint
      };
      this._stopBgRenderer.setData(partialStop);
      this._renderer.append(this._stopBgRenderer);
    }
    {
      const profitArea = {
        points: [new Point(data.left, data.entryLevel), new Point(data.edge, data.profitLevel)],
        color: "white",
        lineWidth: 0,
        backColor: props.profitBackground,
        fillBackground: true,
        transparency: props.profitBackgroundTransparency,
        extendLeft: false,
        extendRight: false,
        backgroundHitTarget: HitTarget.MovePoint
      };
      this._fullTargetBgRenderer.setData(profitArea);
      this._renderer.append(this._fullTargetBgRenderer);
    }
    if (data.pl > 0 && data.entryX !== data.right) {
      const from = new Point(data.entryX, data.entryLevel);
      const to = new Point(data.right, data.closeLevel);
      const transparencyPercent = 0.01 * props.profitBackgroundTransparency;
      const adjustedTransparency = 100 - 100 * (1 - transparencyPercent ** 3);
      const partialProfit = {
        points: [from, to],
        color: "white",
        lineWidth: 0,
        backColor: props.profitBackground,
        fillBackground: true,
        transparency: adjustedTransparency,
        extendLeft: false,
        extendRight: false,
        backgroundHitTarget: HitTarget.MovePoint
      };
      this._targetBgRenderer.setData(partialProfit);
      this._renderer.append(this._targetBgRenderer);
    }
  }
  _createLinesRenderers(data) {
    const points = this.points();
    const props = this._source.properties();
    const setLine = (renderer, from, to, color) => {
      const lineData = {
        points: [from, to],
        lineColor: color ?? props.linecolor,
        lineWidth: props.linewidth,
        lineStyle: LineStyleType.solid,
        extendLeft: false,
        extendRight: false,
        leftEnd: LineEnd.Normal,
        rightEnd: LineEnd.Normal
      };
      renderer.setData(lineData);
      this._renderer.append(renderer);
    };
    if (points[RiskRewardPointIndex.ActualEntry]) {
      const from = points[RiskRewardPointIndex.ActualEntry];
      const to = data.isClosed ? points[RiskRewardPointIndex.ActualClose] : new Point(data.closeBar, data.closeLevel);
      const positionLineData = {
        points: [from, to],
        lineColor: props.linecolor,
        lineWidth: 1,
        lineStyle: LineStyleType.dashed,
        extendLeft: false,
        extendRight: false,
        leftEnd: LineEnd.Normal,
        rightEnd: LineEnd.Arrow
      };
      this._positionLineRenderer.setData(positionLineData);
      this._renderer.append(this._positionLineRenderer);
    }
    {
      const from = new Point(data.left, points[RiskRewardPointIndex.Entry].y);
      const to = new Point(data.edge, points[RiskRewardPointIndex.Entry].y);
      setLine(this._entryLineRenderer, from, to);
    }
    {
      const from = new Point(data.left, data.stopLevel);
      const to = new Point(data.edge, data.stopLevel);
      setLine(this._stopLineRenderer, from, to, props.stopBackground);
    }
    {
      const from = new Point(data.left, data.profitLevel);
      const to = new Point(data.edge, data.profitLevel);
      setLine(this._targetLineRenderer, from, to, props.profitBackground);
    }
  }
  _createLabelsRenderers(layout, formatter) {
    if (!this.isLabelVisible()) {
      return;
    }
    const points = this.points();
    const middleLabelData = this._creareMiddleLabel(layout);
    const stopLabelData = this._createStopLabel(layout, formatter);
    const targetLabelData = this._createTargetLabel(layout, formatter);
    const maxLabelWidth = [
      this._profitLabelRenderer,
      this._stopLabelRenderer,
      this._middleLabelRenderer
    ].reduce((max, renderer) => Math.max(max, renderer.measure().width), 0);
    const horizontalSpan = layout.edge - layout.left;
    const anchorGap = this._anchorRadius();
    if (horizontalSpan - maxLabelWidth - anchorGap <= 8) {
      if (targetLabelData) {
        targetLabelData.offsetY += anchorGap + 8;
        this._profitLabelRenderer.setData(targetLabelData);
      }
      if (stopLabelData) {
        stopLabelData.offsetY += anchorGap + 8;
        this._stopLabelRenderer.setData(stopLabelData);
      }
      if (middleLabelData) {
        let direction;
        if (this._source.chart.options().rightPriceScale.mode === vi.Logarithmic) {
          const toStop = Math.abs(points[0].y - layout.stopLevel);
          const toProfit = Math.abs(points[0].y - layout.profitLevel);
          direction = toProfit - toStop > 1 ? -1 : 1;
        } else {
          const stopDiff = Math.abs(layout.stopPrice - layout.entryPrice);
          const profitDiff = Math.abs(layout.profitPrice - layout.entryPrice);
          direction = profitDiff - stopDiff > 1 ? -1 : 1;
        }
        const yDirection = layout.profitLevel < layout.stopLevel ? 1 : -1;
        const originalPoint = ensure(middleLabelData.points)[0];
        const offsetAmount = 0.5 * this._middleLabelRenderer.measure().height + anchorGap + 8;
        const newPoint = originalPoint.add(new Point(0, yDirection * direction * offsetAmount));
        middleLabelData.points = [newPoint];
        this._middleLabelRenderer.setData(middleLabelData);
      }
    }
  }
  _creareMiddleLabel(layout) {
    const { entryPrice, profitPrice, stopPrice, currentPrice, pl, left, edge, isClosed } = layout;
    const profitLossRatio = Math.abs(entryPrice - profitPrice) / Math.abs(entryPrice - stopPrice);
    const props = this._source.properties();
    const centerPoint = new Point((left + edge) / 2, Math.round(this.points()[0].y));
    let labelText = "";
    let pnlText = "";
    const formattedRatio = getNumericFormatter().format(Math.round(profitLossRatio * 100) / 100);
    if (this.points()[1]) {
      const priceFormatter = this._source.series.priceFormatter();
      if ("formatChange" in priceFormatter && isFunction(priceFormatter.formatChange)) {
        const maxPrice = Math.max(currentPrice, entryPrice);
        const minPrice = Math.min(currentPrice, entryPrice);
        pnlText = pl >= 0 ? priceFormatter.formatChange(maxPrice, minPrice) : priceFormatter.formatChange(minPrice, maxPrice);
      } else {
        pnlText = priceFormatter.format(pl);
      }
    }
    const qty = this._data.qty / props.lotSize;
    const formattedQty = Math.floor(qty);
    if (props.compact) {
      if (pnlText) {
        labelText += pnlText + " ~ ";
      }
      labelText += formattedQty + "\n";
      labelText += formattedRatio;
    } else {
      const status = isClosed ? props.closeText : props.openText;
      if (pnlText) {
        labelText += props.formatStatusAndPnl({ status, pnl: pnlText }) + ", ";
      }
      labelText += props.formatQty({ qty: String(formattedQty) }) + "\n";
      labelText += props.formatRatio({ riskRewardRatio: formattedRatio }) + " ";
    }
    let color = props.linecolor;
    if (pl < 0) {
      color = props.stopBackground;
    } else if (pl > 0) {
      color = props.profitBackground;
    }
    return this._addCenterLabel(this._middleLabelRenderer, {
      p: centerPoint,
      txt: labelText,
      color,
      vertAlign: VerticalAlign.Middle,
      offsetY: 0,
      border: "white"
    });
  }
  _addCenterLabel(renderer, i) {
    const props = this._source.properties();
    const data = {
      fontFamily: ChartFontFamily,
      offsetX: 3,
      horzAlign: "center",
      backgroundRoundRect: 4,
      points: [i.p],
      text: i.txt,
      color: props.textcolor,
      offsetY: i.offsetY,
      vertAlign: i.vertAlign,
      backgroundColor: resetTransparency(i.color),
      fontSize: props.fontsize,
      borderColor: i.border
    };
    renderer.setData(data);
    this._renderer.append(renderer);
    return data;
  }
  _createStopLabel(layout, pipFormatter) {
    var _a;
    const { stopPrice, entryPrice, left, edge, stopLevel } = layout;
    const props = this._source.properties();
    const stopDiff = Math.abs(stopPrice - entryPrice);
    const stopPercent = Math.round(stopDiff / entryPrice * 1e4) / 100;
    const labelPos = new Point((left + edge) / 2, stopLevel);
    const priceFormatter = this._source.series.priceFormatter();
    const formattedChange = "formatChange" in priceFormatter && isFunction(priceFormatter.formatChange) ? (_a = priceFormatter.formatChange) == null ? void 0 : _a.call(
      priceFormatter,
      Math.max(stopPrice, entryPrice),
      Math.min(stopPrice, entryPrice)
    ) : priceFormatter.format(stopDiff);
    const percentFormatter = getPercentageFormatter();
    const formattedPercent = percentFormatter.format(stopPercent);
    let labelText = "";
    if (props.compact) {
      labelText = `${formattedChange} (${formattedPercent}) ${this._data.amountStop}`;
    } else {
      labelText = props.formatTextStop({
        stopChange: forceLTRStr(formattedChange),
        stopChangePercent: forceLTRStr(formattedPercent),
        stopChangePip: pipFormatter ? forceLTRStr(pipFormatter.format(stopDiff)) : "",
        amount: forceLTRStr(String(this._data.amountStop))
      });
    }
    return this._addCenterLabel(this._stopLabelRenderer, {
      p: labelPos,
      txt: labelText,
      color: props.stopBackground,
      vertAlign: entryPrice < stopPrice ? VerticalAlign.Bottom : VerticalAlign.Top,
      offsetY: 0
    });
  }
  _createTargetLabel(layout, pipFormatter) {
    var _a;
    const { profitPrice, entryPrice, stopPrice, left, edge, profitLevel } = layout;
    const props = this._source.properties();
    const diff = Math.abs(profitPrice - entryPrice);
    const percent = Math.round(diff / entryPrice * 1e4) / 100;
    const position = new Point((left + edge) / 2, profitLevel);
    const formatter = this._source.series.priceFormatter();
    const formattedChange = "formatChange" in formatter && isFunction(formatter.formatChange) ? (_a = formatter.formatChange) == null ? void 0 : _a.call(
      formatter,
      Math.max(profitPrice, entryPrice),
      Math.min(profitPrice, entryPrice)
    ) : formatter.format(diff);
    const percentFormatter = getPercentageFormatter();
    const formattedPercent = percentFormatter.format(percent);
    let text = "";
    if (props.compact) {
      text = `${formattedChange} (${formattedPercent}) ${this._data.amountTarget}`;
    } else {
      text = props.formatTextTarget({
        profitChange: formattedChange,
        profitChangePercent: forceLTRStr(percentFormatter.format(percent)),
        profitChangePip: pipFormatter ? forceLTRStr(pipFormatter.format(diff)) : "",
        amount: forceLTRStr("" + this._data.amountTarget)
      });
    }
    return this._addCenterLabel(this._profitLabelRenderer, {
      p: position,
      txt: text,
      color: props.profitBackground,
      vertAlign: entryPrice < stopPrice ? VerticalAlign.Top : VerticalAlign.Bottom,
      offsetY: 0
    });
  }
}
class PositionBasePrimitive extends ToolPrimitive {
  constructor() {
    super(...arguments);
    __publicField(this, "_lines", new PositionPaneView(this, this.model));
    __publicField(this, "_paneView", [this._lines]);
    __publicField(this, "_priceAxisPaneViews", [new PriceRangeAxisPaneView(/* @__PURE__ */ Object.create(null))]);
    __publicField(this, "_timeAxisPaneViews", [new TimeRangeAxisPaneView(/* @__PURE__ */ Object.create(null))]);
    __publicField(this, "_timeAxisViews", [
      new TimeLabelTimeAxisView(/* @__PURE__ */ Object.create(null)),
      new TimeLabelTimeAxisView(/* @__PURE__ */ Object.create(null))
    ]);
    __publicField(this, "_priceAxisViews", [
      new PriceLabelPriceAxisView(/* @__PURE__ */ Object.create(null)),
      new PriceLabelPriceAxisView(/* @__PURE__ */ Object.create(null)),
      new PriceLabelPriceAxisView(/* @__PURE__ */ Object.create(null))
    ]);
    __publicField(this, "_data", Object.defineProperties(
      {
        riskSize: NaN,
        qty: NaN,
        amountStop: NaN,
        amountTarget: NaN,
        _stopPrice: NaN,
        stopPrice: NaN,
        _targetPrice: NaN,
        targetPrice: NaN
      },
      {
        stopPrice: {
          get: () => {
            return this._data._stopPrice;
          },
          set: (val) => {
            this._props.stopLevel = Math.round(
              Math.abs(val - this.entryPrice()) * this.ownerSourceBase()
            );
            this._data._stopPrice = val;
            return true;
          }
        },
        targetPrice: {
          get: () => {
            return this._data._targetPrice;
          },
          set: (val) => {
            this._props.profitLevel = Math.round(
              Math.abs(val - this.entryPrice()) * this.ownerSourceBase()
            );
            this._data._targetPrice = val;
            return true;
          }
        }
      }
    ));
  }
  pointsCount() {
    return 1;
  }
  addPoint(point, step) {
    point.price = this._roundPrice(point.price);
    super.addPoint(point, step);
    const closePointIndex = this._getClosePointIndex(this.getIndex(point));
    const bar = this.series.dataByIndex(closePointIndex);
    const closePoint = { price: point.price, time: bar.time };
    this.controlPoints[1] = closePoint;
    const actualEntry = this._calculateActualEntry(point, closePoint);
    if (actualEntry) {
      this.controlPoints[2] = actualEntry;
      const actualClose = this._findClosePoint(actualEntry, closePoint);
      if (actualClose) {
        this.controlPoints[3] = actualClose;
      }
    }
    this._data._stopPrice = this.stopPrice();
    this._data._targetPrice = this.profitPrice();
    return AddPointResponse.Accept;
  }
  setPoint(index, point, details) {
    switch (index) {
      case 0:
        this._changeEntryPoint(point);
        break;
      case 2:
        this._data.stopPrice = this.prepareStopPrice(point.price);
        break;
      case 3:
        this._data.targetPrice = this.prepareProfitPrice(point.price);
        break;
      case 1:
        point.price = this.controlPoints[0].price;
        super.setPoint(1, point, details);
        this.recalculate();
        break;
    }
  }
  move() {
    this.recalculate();
  }
  _getClosePointIndex(e) {
    const t = this.timeScale();
    const i = Math.round(t.width() / t.barSpacing());
    return e + Math.max(3, Math.round(0.15 * i));
  }
  lastBarData() {
    const barsProvider = this.series.barsProvider();
    const firstIndex = barsProvider.firstIndex();
    const lastIndex = barsProvider.lastIndex();
    if (firstIndex === null || lastIndex === null || isNaN(firstIndex) || isNaN(lastIndex)) {
      return null;
    }
    const points = this.controlPoints;
    if (points.length === 4) {
      const actualClosePoint = points[RiskRewardPointIndex.ActualClose];
      const actualClosePointIndex = this.getIndex(actualClosePoint);
      if (actualClosePointIndex < firstIndex) {
        return null;
      }
      return {
        closePrice: actualClosePoint.price,
        index: Math.min(lastIndex, actualClosePointIndex)
      };
    }
    const closePoint = points[RiskRewardPointIndex.Close];
    const closePointIndex = this.getIndex(closePoint);
    if (closePointIndex < firstIndex) {
      return null;
    }
    const searchIndex = Math.min(lastIndex, closePointIndex);
    const foundBar = this.series.dataByIndex(
      searchIndex,
      Tt.NearestLeft
    );
    if (foundBar === null) {
      return null;
    }
    return {
      closePrice: ensure(foundBar.customValues.close),
      // 索引 4 通常是收盘价
      index: ensure(this.timeScale().timeToIndexEx(foundBar.time))
    };
  }
  isLogPriceScale() {
    return this.chart.options().rightPriceScale.mode === vi.Logarithmic;
  }
  symbolInfo() {
    return this._ctx.chartService.symbolInfo();
  }
  ownerSourceBase() {
    const e = this._ctx.chartService.symbolInfo();
    return e ? e.pricescale / e.minmov : 100;
  }
  _roundPrice(e) {
    const t = this.ownerSourceBase();
    return Math.round(e * t) / t;
  }
  entryPrice() {
    const e = this.controlPoints;
    return e[0].price;
  }
  _riskFormatter(e) {
    return e === RiskDisplayMode.Percentage ? getNumericFormatter(2) : getNumericFormatter();
  }
  recalculate() {
    const points = this.controlPoints;
    if (points.length === 0) {
      return;
    }
    const newPoints = [points[0], points[1]];
    const actualEntry = this._calculateActualEntry(points[0], points[1]);
    if (actualEntry) {
      newPoints.push(actualEntry);
      const closePoint = this._findClosePoint(actualEntry, points[1]);
      if (closePoint) {
        newPoints.push(closePoint);
      }
    }
    this.controlPoints.length = 0;
    this.controlPoints.push(...newPoints);
    this._data._stopPrice = this.stopPrice();
    this._data._targetPrice = this.profitPrice();
  }
  _recalculateRiskSize() {
    const props = this.properties();
    const risk = props.risk;
    const mode = props.riskDisplayMode;
    const accountSize = props.accountSize;
    if (mode === "percents") {
      this._data.riskSize = risk / 100 * accountSize;
    } else {
      if (risk > accountSize) {
        props.risk = accountSize;
        this._data.riskSize = accountSize;
      } else {
        this._data.riskSize = risk;
      }
    }
  }
  _recalculateRisk() {
    const props = this.properties();
    const mode = props.riskDisplayMode;
    const riskSize = this._data.riskSize;
    const accountSize = props.accountSize;
    let risk = props.risk;
    risk = mode === "percents" ? roundValue(riskSize / accountSize * 100) : roundValue(accountSize / 100 * risk);
    props.risk = parseFloat(
      this._riskFormatter(mode).format(risk, { ignoreLocaleNumberFormat: true })
    );
  }
  _recalculateAmount() {
    if (this.controlPoints.length === 0) {
      return;
    }
    const props = this.properties();
    const accountSize = props.accountSize;
    const entry = this.entryPrice();
    const qty = this._data.qty;
    const stop = this.stopPrice();
    const target = this.profitPrice();
    const pointValue = this._ownerSourcePointValue();
    this._data.amountTarget = this._amountTarget(accountSize, target, entry, qty, pointValue);
    this._data.amountStop = this._amountStop(accountSize, stop, entry, qty, pointValue);
  }
  _recalculateQty() {
    if (this.controlPoints.length === 0) {
      return;
    }
    const entry = this.entryPrice();
    const stop = this.stopPrice();
    const riskSize = this._data.riskSize;
    const rate = this._entryPointCurrencyRate();
    const qty = rate === null ? NaN : riskSize / (Math.abs(entry - stop) * this._ownerSourcePointValue() * rate);
    this._data.qty = qty;
  }
  _entryPointCurrencyRate() {
    return 1;
  }
  _closePointCurrencyRate() {
    return 1;
  }
  _ownerSourcePointValue() {
    return 1;
  }
  _changeEntryPoint(entry) {
    const stop = this._data.stopPrice;
    const target = this._data.targetPrice;
    const minDelta = 1 / this.ownerSourceBase();
    const minBound = Math.min(stop, target) + minDelta;
    const maxBound = Math.max(stop, target) - minDelta;
    entry.price = Math.max(minBound, Math.min(maxBound, this._roundPrice(entry.price)));
    this.controlPoints[0] = entry;
    this.controlPoints[1] = { ...this.controlPoints[1], price: entry.price };
    this._data.stopPrice = stop;
    this._data.targetPrice = target;
    this.recalculate();
  }
  _calculateActualEntry(entryPoint, closePoint) {
    const barProvider = this.series.barsProvider();
    const firstIndex = ensure(barProvider.firstIndex());
    const entryIndex = this.getIndex(entryPoint);
    const startIndex = Math.max(entryIndex, firstIndex);
    const entryPrice = entryPoint.price;
    const lastIndex = ensure(barProvider.lastIndex());
    const closePointIndex = this.getIndex(closePoint);
    const endIndex = Math.min(lastIndex, closePointIndex - 1);
    if (startIndex > endIndex) return null;
    for (let i = startIndex; i < endIndex + 1; i++) {
      const bar = this.series.dataByIndex(i);
      if (bar.customValues.high >= entryPrice && bar.customValues.low <= entryPrice) {
        return {
          time: bar.time,
          price: entryPrice
        };
      }
    }
    return null;
  }
  _findClosePoint(actualEntry, closePoint) {
    const bars = this.series.barsProvider();
    const firstIndex = ensure(bars.firstIndex());
    const startIndex = Math.max(this.getIndex(actualEntry), firstIndex);
    const lastIndex = ensure(bars.lastIndex());
    const endIndex = Math.min(lastIndex, this.getIndex(closePoint) - 1);
    if (startIndex > endIndex) return null;
    for (let i = startIndex; i < endIndex + 1; i++) {
      const bar = this.series.dataByIndex(i);
      const stopPrice = this._checkStopPrice(bar);
      if (stopPrice != null) {
        return {
          time: bar.time,
          price: stopPrice
        };
      }
    }
    return null;
  }
  updateAllViews() {
    if (!this.controlPoints.length) return;
    this._recalculateRiskSize();
    this._recalculateRisk();
    this._recalculateQty();
    this._recalculateAmount();
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
      if (i > 1) return;
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
    this._paneView[0].update({ points, ...this._data });
  }
}
function roundValue(e) {
  return parseFloat(e.toFixed(2));
}
export {
  PositionBasePrimitive as P,
  calculateLevel as c,
  roundValue as r
};
