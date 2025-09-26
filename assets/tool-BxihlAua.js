var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { g as getTextBoundaries, V as VerticalAlign, H as HorizontalAlign } from "./text-CtvZov1L.js";
import { bN as LineEnd, e as ensure, bM as generateColor, A as AnchorPoint, L as LineStyleType } from "./index-NZHt9VGv.js";
import { a as ToolPrimitive, D as DrawingTool } from "./toolPaneView-3wj_on-u.js";
import { r as FibChannelToolType } from "./index-TSHQCVD9.js";
import { P as PriceLabelPriceAxisView } from "./priceLabelPriceAxisView-d9Maj5lR.js";
import { T as TimeLabelTimeAxisView } from "./timeLabelTimeAxisView-BvW_UnA0.js";
import { P as PriceRangeAxisPaneView, T as TimeRangeAxisPaneView } from "./axisPaneView-Pbgdotf1.js";
import { C as CompositeRenderer } from "./composite-tvPrNHN0.js";
import { L as LineRenderer } from "./line-DFhYRKvt.js";
import { P as ParallelChannelRenderer } from "./parallelChannel-BQ9r7eMy.js";
import { F as FibWIthLabelsPaneView } from "./paneView-CDEaluuO.js";
import "./text-8RrTwjoh.js";
import "./ctx-Bv0u81rl.js";
import "./baseTool-CHlzZht2.js";
import "./line-DZhB7Jxo.js";
import "./formatter-_n1ErJyi.js";
import "./numericFormatter-Dh0kn-kp.js";
class FibChannelRenderer extends ParallelChannelRenderer {
  _drawLine(scope, line, settings) {
    var _a;
    const { context, bitmapSize } = scope;
    const clipPath = (_a = this._data) == null ? void 0 : _a.excludeBoundaries;
    if (clipPath !== void 0) {
      context.save();
      context.beginPath();
      context.rect(0, 0, bitmapSize.width, bitmapSize.height);
      for (let i = 0; i < clipPath.length; i++) {
        const { x, y } = clipPath[i];
        const px = x * scope.horizontalPixelRatio;
        const py = y * scope.verticalPixelRatio;
        if (i === 0) {
          context.moveTo(px, py);
        } else {
          context.lineTo(px, py);
        }
      }
      context.closePath();
      context.clip("evenodd");
    }
    super._drawLine(scope, line, settings);
    if (clipPath !== void 0) {
      context.restore();
    }
  }
}
class FibChannelPaneView extends FibWIthLabelsPaneView {
  constructor() {
    super(...arguments);
    __publicField(this, "_baseLineRenderer", new LineRenderer());
    __publicField(this, "_lastLevelTrendRenderer", new LineRenderer());
    __publicField(this, "_renderer", new CompositeRenderer(this._hitTestCollector));
  }
  renderer() {
    return this._renderer;
  }
  _updateImpl() {
    this._renderer.clear();
    const points = this.points();
    if (points.length < 2) {
      this.addAnchors(this._renderer);
      return;
    }
    const props = this._source.properties();
    const pointA = points[0];
    const pointB = points[1];
    if (points.length < 3) {
      const baseLine = {
        points: [pointA, pointB],
        lineColor: props.levels[0].color,
        lineWidth: props.levelsStyle.linewidth,
        lineStyle: props.levelsStyle.linestyle,
        extendLeft: props.extendLeft,
        extendRight: props.extendRight,
        leftEnd: LineEnd.Normal,
        rightEnd: LineEnd.Normal
      };
      this._baseLineRenderer.setData(baseLine);
      this._renderer.append(this._baseLineRenderer);
      this.addAnchors(this._renderer);
      return;
    }
    const { width, height } = this._source.getScope().mediaSize;
    for (let levelIndex = 0; levelIndex < props.levels.length; levelIndex++) {
      const levelProps = props.levels[levelIndex];
      if (!levelProps.visible) continue;
      let nextLevelProps = null;
      for (let t = levelIndex + 1; t < props.levels.length; t++) {
        const nextProps = props.levels[t];
        if (nextProps.visible) {
          nextLevelProps = nextProps;
          break;
        }
      }
      if (!nextLevelProps) break;
      const color = levelProps.color;
      const extendLeft = props.extendLeft;
      const extendRight = props.extendRight;
      const lineStyle = props.levelsStyle.linestyle;
      const lineWidth = props.levelsStyle.linewidth;
      const l = this._data.levels[levelIndex];
      const labelRenderer = this._updateLabelForLevel({
        levelIndex,
        coeff: levelProps.coeff,
        leftPoint: l.leftPoint1,
        rightPoint: ensure(l.rightPoint2),
        price: l.price,
        color,
        horzAlign: props.horzLabelsAlign,
        vertAlign: props.vertLabelsAlign
      });
      let excludeBounds;
      if (labelRenderer !== null) {
        this._renderer.append(labelRenderer);
        excludeBounds = getTextBoundaries(labelRenderer, width, height) ?? void 0;
      }
      const regionRendererData = {
        line1: {
          color,
          lineStyle,
          lineWidth,
          points: [l.leftPoint1, l.rightPoint1]
        },
        line2: {
          color,
          lineStyle,
          lineWidth,
          points: [ensure(l.leftPoint2), ensure(l.rightPoint2)]
        },
        extendLeft,
        extendRight,
        backColor: generateColor(color, props.transparency, true),
        skipTopLine: true,
        fillBackground: props.fillBackground,
        hittestOnBackground: true,
        excludeBoundaries: excludeBounds
      };
      const regionRenderer = new FibChannelRenderer();
      regionRenderer.setData(regionRendererData);
      this._renderer.append(regionRenderer);
    }
    let lastVisibleLevelIndex = null;
    for (let i = props.levels.length - 1; i >= 0; i--) {
      const levelProps = props.levels[i];
      if (levelProps.visible) {
        lastVisibleLevelIndex = i;
        break;
      }
    }
    if (lastVisibleLevelIndex !== null) {
      const levelProps = props.levels[lastVisibleLevelIndex];
      if (levelProps.visible) {
        const l = this._data.levels[lastVisibleLevelIndex];
        const labelRenderer = this._updateLabelForLevel({
          levelIndex: lastVisibleLevelIndex,
          coeff: levelProps.coeff,
          leftPoint: l.leftPoint1,
          rightPoint: l.rightPoint1,
          price: l.price,
          color: levelProps.color,
          horzAlign: props.horzLabelsAlign,
          vertAlign: props.vertLabelsAlign
        });
        let bounds;
        if (labelRenderer !== null) {
          this._renderer.append(labelRenderer);
          bounds = getTextBoundaries(labelRenderer, width, height) ?? void 0;
        }
        const finalLine = {
          points: [l.leftPoint1, l.rightPoint1],
          lineColor: levelProps.color,
          lineWidth: props.levelsStyle.linewidth,
          lineStyle: props.levelsStyle.linestyle,
          extendLeft: props.extendLeft,
          extendRight: props.extendRight,
          leftEnd: LineEnd.Normal,
          rightEnd: LineEnd.Normal,
          excludeBoundaries: bounds ? [bounds] : void 0
        };
        this._lastLevelTrendRenderer.setData(finalLine);
        this._renderer.append(this._lastLevelTrendRenderer);
      }
    }
    this.addAnchors(this._renderer);
  }
}
class FibChannelPrimitive extends ToolPrimitive {
  constructor() {
    super(...arguments);
    __publicField(this, "_lines", new FibChannelPaneView(this, this.model));
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
    const norm = points.length > 2 ? points[2].subtract(points[0]) : null;
    const pointA = points[0];
    const pointB = points[1];
    const levels = this._props.levels.reduce(
      (acc, level, i) => {
        if (!level.visible) return acc;
        if (!norm) return acc;
        const offset1 = norm.scaled(level.coeff);
        const leftPoint1 = pointA.add(offset1);
        const rightPoint1 = pointB.add(offset1);
        let leftPoint2 = null;
        let rightPoint2 = null;
        let nextLevelProps = null;
        for (let t = i + 1; t < this._props.levels.length; t++) {
          const nextProps = this._props.levels[t];
          if (nextProps.visible) {
            nextLevelProps = nextProps;
            break;
          }
        }
        if (nextLevelProps) {
          const offset2 = norm.scaled(nextLevelProps.coeff);
          leftPoint2 = pointA.add(offset2);
          rightPoint2 = pointB.add(offset2);
        }
        const price = ensure(this.series.coordinateToPrice(leftPoint1.y));
        acc.push({
          leftPoint1,
          rightPoint1,
          leftPoint2,
          rightPoint2,
          price: this.series.priceFormatter().format(price)
        });
        return acc;
      },
      []
    );
    this._lines.update({ points, levels });
  }
}
class FibChannelTool extends DrawingTool {
  constructor() {
    super(...arguments);
    __publicField(this, "type", FibChannelToolType);
  }
  createPrimitive() {
    return new FibChannelPrimitive(
      {
        id: this.id,
        points: [],
        showCoeffs: true,
        showPrices: true,
        fillBackground: true,
        transparency: 80,
        extendLeft: false,
        extendRight: false,
        horzLabelsAlign: HorizontalAlign.Left,
        vertLabelsAlign: VerticalAlign.Middle,
        coeffsAsPercents: false,
        labelFontSize: 12,
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
  FibChannelTool
};
