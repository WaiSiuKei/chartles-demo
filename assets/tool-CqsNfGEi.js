var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { V as VerticalAlign, H as HorizontalAlign } from "./text-DNYLW3w-.js";
import { e as ensure, bN as LineEnd, u as Point, A as AnchorPoint, cq as vi, L as LineStyleType } from "./index-DSkroicZ.js";
import { a as ToolPrimitive, D as DrawingTool } from "./toolPaneView-BAEHHn7m.js";
import { G as TrendBasedFibExtensionToolType } from "./index-DNbtFiKr.js";
import { P as PriceLabelPriceAxisView } from "./priceLabelPriceAxisView-d9Maj5lR.js";
import { T as TimeLabelTimeAxisView } from "./timeLabelTimeAxisView-BvW_UnA0.js";
import { P as PriceRangeAxisPaneView, T as TimeRangeAxisPaneView } from "./axisPaneView-Pbgdotf1.js";
import { F as FibHorizontalLevelsPaneView, f as fibLevelCoordinate, a as fibLevelPrice } from "./horizontalLevelsPaneView-CA_TCwW3.js";
import { L as LineRenderer } from "./line-CuaAD_DW.js";
import { R as RectangleRenderer } from "./rectangle-DSOKVUU-.js";
import "./text-FiPV6-V4.js";
import "./ctx-DYUP60aL.js";
import "./baseTool-BVX9dcKc.js";
import "./composite-BOGQNAfc.js";
import "./paneView-C9pa4pz3.js";
import "./formatter-Drv30PyG.js";
import "./numericFormatter-6U8WkLAS.js";
class TrendBasedFibExtensionPaneView extends FibHorizontalLevelsPaneView {
  constructor() {
    super(...arguments);
    __publicField(this, "_trendLineRendererPoints12", new LineRenderer());
    __publicField(this, "_trendLineRendererPoints23", new LineRenderer());
    __publicField(this, "_rectangleRenderers", /* @__PURE__ */ new Map());
  }
  renderer() {
    return this._renderer;
  }
  getRectRenderer(idx) {
    if (!this._rectangleRenderers.has(idx)) {
      this._rectangleRenderers.set(idx, new RectangleRenderer());
    }
    return ensure(this._rectangleRenderers.get(idx));
  }
  _updateImpl() {
    this._renderer.clear();
    const points = this.points();
    if (points.length < 2) return;
    const [pointA, pointB] = points;
    const props = this._source.properties();
    const trendlineProps = props.trendline;
    if (trendlineProps.visible) {
      const trendLineData = {
        points: [pointA, pointB],
        lineColor: trendlineProps.color,
        lineWidth: trendlineProps.linewidth,
        lineStyle: trendlineProps.linestyle,
        extendLeft: false,
        extendRight: false,
        leftEnd: LineEnd.Normal,
        rightEnd: LineEnd.Normal
      };
      this._trendLineRendererPoints12.setData(trendLineData);
      this._renderer.append(this._trendLineRendererPoints12);
    }
    if (points.length < 3) {
      this.addAnchors(this._renderer);
      return;
    }
    const levels = props.levels.reduce((acc, l, i) => {
      const levelProps = props.levels[i];
      if (!levelProps.visible) return acc;
      const coeff = levelProps.coeff;
      const color = levelProps.color;
      acc.push({
        color,
        coeff,
        price: this._data.levels[i].price,
        y: this._data.levels[i].y,
        linewidth: props.levelsStyle.linewidth,
        linestyle: props.levelsStyle.linestyle,
        index: i
      });
      return acc;
    }, []);
    const pointC = points[2];
    let trendLineRenderer23 = null;
    if (trendlineProps.visible) {
      trendLineRenderer23 = this._trendLineRendererPoints23;
      trendLineRenderer23.setData({
        points: [pointB, pointC],
        lineColor: trendlineProps.color,
        lineWidth: trendlineProps.linewidth,
        lineStyle: trendlineProps.linestyle,
        extendLeft: false,
        extendRight: false,
        leftEnd: LineEnd.Normal,
        rightEnd: LineEnd.Normal
      });
    }
    const fillEnabled = props.fillBackground;
    const transparency = props.transparency;
    const extendLeft = props.extendLinesLeft;
    const extendRight = props.extendLines;
    const fillLeftX = Math.min(pointC.x, pointB.x);
    const fillRightX = Math.max(pointC.x, pointB.x);
    if (fillEnabled) {
      for (let i = 1; i < levels.length; i++) {
        const levelAbove = levels[i - 1];
        const levelBelow = levels[i];
        const rectData = {
          points: [new Point(fillLeftX, levelBelow.y), new Point(fillRightX, levelAbove.y)],
          color: levelBelow.color,
          lineWidth: 0,
          backColor: levelBelow.color,
          // fillBackground: true,
          transparency,
          extendLeft,
          extendRight
        };
        const rectRenderer = this.getRectRenderer(i);
        rectRenderer.setData(rectData);
        this._renderer.append(rectRenderer);
      }
    }
    const scope = this._source.getScope();
    this._addLevels({
      levels,
      mediaSize: scope.mediaSize,
      left: fillLeftX,
      right: fillRightX,
      showLabel: props.showCoeffs || props.showPrices,
      showText: props.showText,
      labelAlign: [props.horzLabelsAlign, props.vertLabelsAlign],
      textAlign: [props.horzTextAlign, props.vertTextAlign],
      extendLeft,
      extendRight,
      fontSize: props.labelFontSize,
      isOnScreen: true,
      trendLineRenderer: trendLineRenderer23
    });
    this.addAnchors(this._renderer);
  }
}
class TrendBasedFibExtensionPrimitive extends ToolPrimitive {
  constructor() {
    super(...arguments);
    __publicField(this, "_lines", new TrendBasedFibExtensionPaneView(
      this,
      this.model
    ));
    __publicField(this, "_paneView", [this._lines]);
    __publicField(this, "_priceAxisPaneViews", [new PriceRangeAxisPaneView(/* @__PURE__ */ Object.create(null))]);
    __publicField(this, "_timeAxisPaneViews", [new TimeRangeAxisPaneView(/* @__PURE__ */ Object.create(null))]);
    __publicField(this, "_timeAxisViews", [
      new TimeLabelTimeAxisView(/* @__PURE__ */ Object.create(null)),
      new TimeLabelTimeAxisView(/* @__PURE__ */ Object.create(null)),
      new TimeLabelTimeAxisView(/* @__PURE__ */ Object.create(null))
    ]);
    __publicField(this, "_priceAxisViews", [
      new PriceLabelPriceAxisView(/* @__PURE__ */ Object.create(null)),
      new PriceLabelPriceAxisView(/* @__PURE__ */ Object.create(null)),
      new PriceLabelPriceAxisView(/* @__PURE__ */ Object.create(null))
    ]);
  }
  pointsCount() {
    return 3;
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
    let levels = [];
    if (this.controlPoints.length > 2) {
      const [point1, point2, point3] = this.controlPoints;
      const reversed = this._props.reverse ?? false;
      const fromPrice = reversed ? point1.price : point2.price;
      const toPrice = reversed ? point2.price : point1.price;
      const priceDiff = fromPrice - toPrice;
      let deltaCoord = 0;
      let thirdPointCoord;
      const isLog = this.chart.options().rightPriceScale.mode === vi.Logarithmic;
      const useLog = isLog && this._props.fibLevelsBasedOnLogScale;
      if (useLog) {
        const baseCoord = ensure(this.priceScale().priceToCoordinate(fromPrice));
        deltaCoord = baseCoord - ensure(this.priceScale().priceToCoordinate(toPrice));
        thirdPointCoord = ensure(this.priceScale().priceToCoordinate(point3.price));
      }
      const base = {
        price: point3.price,
        coordinate: thirdPointCoord ?? NaN
      };
      const diff = {
        price: priceDiff,
        coordinate: deltaCoord
      };
      levels = this._props.levels.reduce(
        (acc, level) => {
          if (!level.visible) return acc;
          const y = fibLevelCoordinate(base, diff, level.coeff, this.series, useLog);
          const price = fibLevelPrice(base, diff, level.coeff, this.series, useLog);
          acc.push({
            y,
            price: this.series.priceFormatter().format(price)
          });
          return acc;
        },
        []
      );
    }
    this._lines.update({ points, levels });
  }
}
class TrendBasedFibExtensionTool extends DrawingTool {
  constructor() {
    super(...arguments);
    __publicField(this, "type", TrendBasedFibExtensionToolType);
  }
  createPrimitive() {
    return new TrendBasedFibExtensionPrimitive(
      {
        id: this.id,
        points: [],
        showCoeffs: true,
        showPrices: true,
        fillBackground: true,
        transparency: 80,
        extendLines: false,
        extendLinesLeft: false,
        horzLabelsAlign: HorizontalAlign.Left,
        vertLabelsAlign: VerticalAlign.Middle,
        showText: true,
        horzTextAlign: HorizontalAlign.Center,
        vertTextAlign: VerticalAlign.Middle,
        reverse: false,
        coeffsAsPercents: false,
        fibLevelsBasedOnLogScale: false,
        labelFontSize: 12,
        trendline: {
          visible: true,
          color: "#808080",
          linewidth: 2,
          linestyle: LineStyleType.dashed
        },
        levelsStyle: { linewidth: 2, linestyle: LineStyleType.solid },
        levels: [
          {
            visible: true,
            coeff: 0,
            color: "#808080"
          },
          {
            visible: true,
            coeff: 0.236,
            color: "#F23645"
          },
          {
            visible: true,
            coeff: 0.382,
            color: "#FF9800"
          },
          {
            visible: true,
            coeff: 0.5,
            color: "#4CAF50"
          },
          {
            visible: true,
            coeff: 0.618,
            color: "#089981"
          },
          {
            visible: true,
            coeff: 0.786,
            color: "#00BCD4"
          },
          {
            visible: true,
            coeff: 1,
            color: "#808080"
          },
          {
            visible: true,
            coeff: 1.618,
            color: "#2962FF"
          },
          {
            visible: true,
            coeff: 2.618,
            color: "#F23645"
          },
          {
            visible: true,
            coeff: 3.618,
            color: "#9C27B0"
          },
          {
            visible: true,
            coeff: 4.236,
            color: "#E91E63"
          }
        ]
      },
      ...this.resetArgs
    );
  }
}
export {
  TrendBasedFibExtensionTool
};
