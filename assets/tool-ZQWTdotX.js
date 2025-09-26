var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { B as BaseTextRenderer, H as HorizontalAlign, g as getTextBoundaries, V as VerticalAlign } from "./text-CtvZov1L.js";
import { bN as LineEnd, u as Point, r as ChartFontFamily, y as HitTestResult, z as HitTarget, A as AnchorPoint, e as ensure, L as LineStyleType } from "./index-NZHt9VGv.js";
import { T as ToolPaneView, a as ToolPrimitive, D as DrawingTool } from "./toolPaneView-3wj_on-u.js";
import { I as TrendBasedFibTimeToolType } from "./index-TSHQCVD9.js";
import { P as PriceLabelPriceAxisView } from "./priceLabelPriceAxisView-d9Maj5lR.js";
import { T as TimeLabelTimeAxisView } from "./timeLabelTimeAxisView-BvW_UnA0.js";
import { P as PriceRangeAxisPaneView, T as TimeRangeAxisPaneView } from "./axisPaneView-Pbgdotf1.js";
import { C as CompositeRenderer } from "./composite-tvPrNHN0.js";
import { L as LineRenderer } from "./line-DFhYRKvt.js";
import { R as RectangleRenderer } from "./rectangle-CfXWJsDB.js";
import { V as VerticalLineRenderer } from "./verticalLine-Bizl3Oqm.js";
import "./text-8RrTwjoh.js";
import "./ctx-Bv0u81rl.js";
import "./baseTool-CHlzZht2.js";
class TrendBasedFibTimePaneView extends ToolPaneView {
  constructor() {
    super(...arguments);
    __publicField(this, "_trendLineRendererPoints12", new LineRenderer());
    __publicField(this, "_trendLineRendererPoints23", new LineRenderer());
    __publicField(this, "_textRenderers", /* @__PURE__ */ new Map());
    __publicField(this, "_renderer", new CompositeRenderer(this._hitTestCollector));
  }
  renderer() {
    return this._renderer;
  }
  getTextRenderers(idx) {
    let r = this._textRenderers.get(idx);
    if (!r) {
      r = new BaseTextRenderer();
      this._textRenderers.set(idx, r);
    }
    return r;
  }
  _needLabelExclusionPath() {
    return "center" === this._source.properties().horzLabelsAlign;
  }
  _updateImpl() {
    this._renderer.clear();
    const props = this._source.properties();
    const points = this.points();
    if ((points == null ? void 0 : points.length) < 2) return;
    const [pointStart, pointEnd] = points;
    const trendlineProps = props.trendline;
    if (trendlineProps.visible) {
      const trendLine1 = {
        points: [pointStart, pointEnd],
        lineColor: trendlineProps.color,
        lineWidth: trendlineProps.linewidth,
        lineStyle: trendlineProps.linestyle,
        extendLeft: false,
        extendRight: false,
        leftEnd: LineEnd.Normal,
        rightEnd: LineEnd.Normal
      };
      this._trendLineRendererPoints12.setData(trendLine1);
      this._renderer.append(this._trendLineRendererPoints12);
    }
    if (points.length < 3) {
      this.addAnchors(this._renderer);
      return;
    }
    const point3 = points[2];
    if (trendlineProps.visible) {
      const trendLine2 = {
        points: [pointEnd, point3],
        lineColor: trendlineProps.color,
        lineWidth: trendlineProps.linewidth,
        lineStyle: trendlineProps.linestyle,
        extendLeft: false,
        extendRight: false,
        leftEnd: LineEnd.Normal,
        rightEnd: LineEnd.Normal
      };
      this._trendLineRendererPoints23.setData(trendLine2);
      this._renderer.append(this._trendLineRendererPoints23);
    }
    const { width, height } = this._source.getScope().mediaSize;
    if (props.fillBackground) {
      const transparency = props.transparency;
      for (let i = 1; i < this._data.levels.length; i++) {
        const prevLevel = this._data.levels[i - 1];
        const currLevel = this._data.levels[i];
        const l = props.levels[i];
        const rectData = {
          points: [new Point(prevLevel.x, 0), new Point(currLevel.x, height)],
          color: l.color,
          lineWidth: 0,
          backColor: l.color,
          // fillBackground: true,
          transparency,
          extendLeft: false,
          extendRight: false
        };
        const rect = new RectangleRenderer();
        rect.setData(rectData);
        this._renderer.append(rect);
      }
    }
    let horzAlign = props.horzLabelsAlign;
    horzAlign = horzAlign === HorizontalAlign.Left ? HorizontalAlign.Right : horzAlign === HorizontalAlign.Right ? HorizontalAlign.Left : HorizontalAlign.Center;
    const vertAlign = props.vertLabelsAlign;
    const showLabels = props.showCoeffs;
    for (let i = 0; i < props.levels.length; i++) {
      const level = props.levels[i];
      const l = this._data.levels[i];
      let exclusionBox = void 0;
      if (showLabels) {
        let labelPoint;
        switch (vertAlign) {
          case "top":
            labelPoint = new Point(l.x, 0);
            break;
          case "middle":
            labelPoint = new Point(l.x, height / 2);
            break;
          default:
            labelPoint = new Point(l.x, height);
        }
        const labelData = {
          points: [labelPoint],
          text: String(level.coeff),
          color: level.color,
          vertAlign,
          horzAlign,
          fontFamily: ChartFontFamily,
          offsetX: 2,
          offsetY: 0,
          fontSize: 12
        };
        const textRenderer = this.getTextRenderers(i);
        textRenderer.setData(labelData);
        if (this._needLabelExclusionPath()) {
          exclusionBox = getTextBoundaries(textRenderer, width, height) ?? void 0;
        }
        this._renderer.append(textRenderer);
      }
      const vLineData = {
        x: l.x,
        lineColor: level.color,
        lineWidth: props.levelsStyle.linewidth,
        lineStyle: props.levelsStyle.linestyle,
        excludeBoundaries: exclusionBox
      };
      const hitResult = new HitTestResult(HitTarget.MovePoint);
      const vLine = new VerticalLineRenderer();
      vLine.setData(vLineData);
      vLine.setHitTest(hitResult);
      this._renderer.append(vLine);
    }
    this.addAnchors(this._renderer);
  }
}
class TrendBasedFibTimePrimitive extends ToolPrimitive {
  constructor() {
    super(...arguments);
    __publicField(this, "_lines", new TrendBasedFibTimePaneView(this, this.model));
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
    const [point1, point2, point3] = this.controlPoints;
    if (this.controlPoints.length > 2 && point2.time !== point1.time && this.chart.timeScale().getVisibleRange()) {
      const index1 = ensure(this.chart.timeScale().timeToIndexEx(point1.time));
      const index2 = ensure(this.chart.timeScale().timeToIndexEx(point2.time));
      const index3 = ensure(this.chart.timeScale().timeToIndexEx(point3.time));
      const timeDiff = index2 - index1;
      const baseIndex = index3;
      levels = this._props.levels.reduce(
        (acc, level) => {
          if (!level.visible) return acc;
          const coeff = level.coeff;
          const targetIndex = Math.round(baseIndex + coeff * timeDiff);
          acc.push({
            x: ensure(this.chart.timeScale().logicalToCoordinate(targetIndex))
          });
          return acc;
        },
        []
      );
    }
    this._lines.update({ points, levels });
  }
}
class TrendBasedFibTimeTool extends DrawingTool {
  constructor() {
    super(...arguments);
    __publicField(this, "type", TrendBasedFibTimeToolType);
  }
  createPrimitive() {
    return new TrendBasedFibTimePrimitive(
      {
        id: this.id,
        points: [],
        showCoeffs: true,
        fillBackground: true,
        transparency: 80,
        horzLabelsAlign: HorizontalAlign.Right,
        vertLabelsAlign: VerticalAlign.Bottom,
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
            coeff: 0.382,
            color: "#F23645"
          },
          {
            visible: true,
            coeff: 0.618,
            color: "#4CAF50"
          },
          {
            visible: true,
            coeff: 1,
            color: "#089981"
          },
          {
            visible: true,
            coeff: 1.382,
            color: "#00BCD4"
          },
          {
            visible: true,
            coeff: 1.618,
            color: "#808080"
          },
          {
            visible: true,
            coeff: 2,
            color: "#2962FF"
          },
          {
            visible: true,
            coeff: 2.382,
            color: "#E91E63"
          },
          {
            visible: true,
            coeff: 2.618,
            color: "#9C27B0"
          },
          {
            visible: true,
            coeff: 3,
            color: "#673AB7"
          }
        ]
      },
      ...this.resetArgs
    );
  }
}
export {
  TrendBasedFibTimeTool
};
