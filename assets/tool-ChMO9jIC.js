var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { V as VerticalAlign, H as HorizontalAlign } from "./text-DNYLW3w-.js";
import { u as Point, bN as LineEnd, A as AnchorPoint, e as ensure, L as LineStyleType } from "./index-DSkroicZ.js";
import { a as ToolPrimitive, D as DrawingTool } from "./toolPaneView-BAEHHn7m.js";
import { t as FibRetracementToolType } from "./index-DNbtFiKr.js";
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
class FibRetracementPaneView extends FibHorizontalLevelsPaneView {
  constructor() {
    super(...arguments);
    __publicField(this, "_trendLineRenderer", new LineRenderer());
  }
  _updateImpl() {
    this._renderer.clear();
    const points = this.points();
    if ((points == null ? void 0 : points.length) < 2) return;
    const properties = this._source.properties();
    const p1 = points[0];
    const p2 = points[1];
    const leftX = Math.min(p1.x, p2.x);
    const rightX = Math.max(p1.x, p2.x);
    const fillBackground = properties.fillBackground;
    const transparency = properties.transparency;
    const extendLeft = properties.extendLinesLeft;
    const extendRight = properties.extendLines;
    const scope = this._source.getScope();
    const { width: chartWidth } = scope.mediaSize;
    const isVisible = !(leftX > chartWidth && !extendLeft || rightX < 0 && !extendRight);
    const levels = properties.levels.reduce((acc, level, levelIndex) => {
      acc.push({
        color: level.color,
        coeff: level.coeff,
        y: this._data.levels[levelIndex].y,
        price: this._data.levels[levelIndex].price,
        linewidth: properties.levelsStyle.linewidth,
        linestyle: properties.levelsStyle.linestyle,
        index: levelIndex
      });
      return acc;
    }, []);
    if (fillBackground && isVisible) {
      for (let i = 1; i < levels.length; i++) {
        const current = levels[i];
        const previous = levels[i - 1];
        const rectRenderer = new RectangleRenderer();
        rectRenderer.setData({
          points: [new Point(leftX, current.y), new Point(rightX, previous.y)],
          color: current.color,
          lineWidth: 0,
          backColor: current.color,
          transparency,
          extendLeft,
          extendRight
        });
        this._renderer.append(rectRenderer);
      }
    }
    let leftBound = leftX;
    let rightBound = rightX;
    if (leftBound === rightBound) {
      if (extendLeft) leftBound -= 1;
      if (extendRight) rightBound += 1;
    }
    const trendlineProps = properties.trendline;
    let trendLineRenderer = null;
    if (trendlineProps.visible && isVisible) {
      trendLineRenderer = this._trendLineRenderer;
      trendLineRenderer.setData({
        points: [p1, p2],
        lineColor: trendlineProps.color,
        lineWidth: trendlineProps.linewidth,
        lineStyle: trendlineProps.linestyle,
        extendLeft: false,
        extendRight: false,
        leftEnd: LineEnd.Normal,
        rightEnd: LineEnd.Normal
      });
    }
    this._addLevels({
      mediaSize: scope.mediaSize,
      levels,
      left: leftBound,
      right: rightBound,
      showLabel: properties.showCoeffs || properties.showPrices,
      showText: properties.showText,
      labelAlign: [properties.horzLabelsAlign, properties.vertLabelsAlign],
      textAlign: [properties.horzTextAlign, properties.vertTextAlign],
      extendLeft,
      extendRight,
      fontSize: properties.labelFontSize,
      isOnScreen: isVisible,
      trendLineRenderer
    });
    this.addAnchors(this._renderer);
  }
}
class FibRetracementPrimitive extends ToolPrimitive {
  constructor() {
    super(...arguments);
    __publicField(this, "_lines", new FibRetracementPaneView(this, this.model));
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
    const [firstPoint, secondPoint] = this.controlPoints;
    const isReversed = this._props.reverse;
    const highPrice = isReversed ? firstPoint.price : secondPoint.price;
    const lowPrice = isReversed ? secondPoint.price : firstPoint.price;
    const priceDiff = lowPrice - highPrice;
    const highCoordinate = ensure(this.series.priceToCoordinate(highPrice));
    const base = {
      price: highPrice,
      coordinate: highCoordinate
    };
    const vector = {
      price: priceDiff,
      coordinate: ensure(this.series.priceToCoordinate(lowPrice)) - highCoordinate
    };
    const isLogScale = false;
    const levels = this._props.levels.reduce(
      (acc, level, i) => {
        if (!level.visible) return acc;
        const coefficient = level.coeff;
        const yCoordinate = fibLevelCoordinate(
          base,
          vector,
          coefficient,
          this.series,
          // firstValue,
          isLogScale
        );
        const priceAtLevel = fibLevelPrice(base, vector, coefficient, this.series, isLogScale);
        acc.push({
          y: yCoordinate,
          price: this.series.priceFormatter().format(priceAtLevel),
          index: i
        });
        return acc;
      },
      []
    );
    this._lines.update({ points, levels });
  }
}
class FibRetracementTool extends DrawingTool {
  constructor() {
    super(...arguments);
    __publicField(this, "type", FibRetracementToolType);
  }
  createPrimitive() {
    return new FibRetracementPrimitive(
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
            coeff: 0,
            color: "#808080",
            visible: true
          },
          {
            coeff: 0.236,
            color: "#F23645",
            visible: true
          },
          {
            coeff: 0.382,
            color: "#FF9800",
            visible: true
          },
          {
            coeff: 0.5,
            color: "#4CAF50",
            visible: true
          },
          {
            coeff: 0.618,
            color: "#089981",
            visible: true
          },
          {
            coeff: 0.786,
            color: "#00BCD4",
            visible: true
          },
          {
            coeff: 1,
            color: "#808080",
            visible: true
          },
          {
            coeff: 1.618,
            color: "#2962FF",
            visible: true
          },
          {
            coeff: 2.618,
            color: "#F23645",
            visible: true
          },
          {
            coeff: 3.618,
            color: "#9C27B0",
            visible: true
          },
          {
            coeff: 4.236,
            color: "#E91E63",
            visible: true
          }
        ]
      },
      ...this.resetArgs
    );
  }
}
export {
  FibRetracementTool
};
