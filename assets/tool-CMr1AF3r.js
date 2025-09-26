var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { B as BaseTextRenderer, H as HorizontalAlign, g as getTextBoundaries, V as VerticalAlign } from "./text-DNYLW3w-.js";
import { y as HitTestResult, z as HitTarget, u as Point, r as ChartFontFamily, bN as LineEnd, A as AnchorPoint, e as ensure, L as LineStyleType } from "./index-DSkroicZ.js";
import { T as ToolPaneView, a as ToolPrimitive, D as DrawingTool } from "./toolPaneView-BAEHHn7m.js";
import { x as FibTimeZoneToolType } from "./index-DNbtFiKr.js";
import { P as PriceLabelPriceAxisView } from "./priceLabelPriceAxisView-d9Maj5lR.js";
import { T as TimeLabelTimeAxisView } from "./timeLabelTimeAxisView-BvW_UnA0.js";
import { P as PriceRangeAxisPaneView, T as TimeRangeAxisPaneView } from "./axisPaneView-Pbgdotf1.js";
import { C as CompositeRenderer } from "./composite-BOGQNAfc.js";
import { L as LineRenderer } from "./line-CuaAD_DW.js";
import { R as RectangleRenderer } from "./rectangle-DSOKVUU-.js";
import { V as VerticalLineRenderer } from "./verticalLine-oeLvAaCR.js";
import "./text-FiPV6-V4.js";
import "./ctx-DYUP60aL.js";
import "./baseTool-BVX9dcKc.js";
class FibTimeZonePaneView extends ToolPaneView {
  constructor() {
    super(...arguments);
    __publicField(this, "_trendRenderer", new LineRenderer());
    __publicField(this, "_renderer", new CompositeRenderer(this._hitTestCollector));
    __publicField(this, "_textRenderers", /* @__PURE__ */ new Map());
  }
  renderer() {
    return this._renderer;
  }
  getTextRenderer(idx) {
    let r = this._textRenderers.get(idx);
    if (!r) {
      r = new BaseTextRenderer();
      r.setHitTestResult(new HitTestResult(HitTarget.MovePoint));
      this._textRenderers.set(idx, r);
    }
    return r;
  }
  _updateImpl() {
    this._renderer.clear();
    const points = this.points();
    if ((points == null ? void 0 : points.length) < 1) return;
    const props = this._source.properties();
    const { width, height } = this._source.getScope().mediaSize;
    if (props.fillBackground) {
      const transparency = props.transparency;
      for (let i = 1; i < this._data.levels.length; i++) {
        const prev = this._data.levels[i - 1];
        const curr = this._data.levels[i];
        const color = props.levels[i].color;
        const fillData = {
          points: [new Point(curr.x, 0), new Point(prev.x, height)],
          color,
          lineWidth: 0,
          backColor: color,
          // fillBackground: true,
          transparency,
          extendLeft: false,
          extendRight: false
        };
        const rect = new RectangleRenderer();
        rect.setData(fillData);
        this._renderer.append(rect);
      }
    }
    let horzAlign = props.horzLabelsAlign;
    horzAlign = horzAlign === HorizontalAlign.Left ? HorizontalAlign.Right : horzAlign === HorizontalAlign.Right ? HorizontalAlign.Left : HorizontalAlign.Center;
    const vertAlign = props.vertLabelsAlign;
    const showLabels = props.showLabels;
    for (let i = 0; i < props.levels.length; i++) {
      const level = props.levels[i];
      let excludeBox;
      const { x } = this._data.levels[i];
      if (showLabels) {
        let labelPos;
        switch (vertAlign) {
          case "top":
            labelPos = new Point(x, 0);
            break;
          case "middle":
            labelPos = new Point(x, height * 0.5);
            break;
          default:
            labelPos = new Point(x, height);
            break;
        }
        const labelData = {
          points: [labelPos],
          text: String(level.coeff),
          color: level.color,
          vertAlign,
          horzAlign,
          fontFamily: ChartFontFamily,
          offsetX: 2,
          offsetY: 0,
          fontSize: 12
        };
        const textRenderer = this.getTextRenderer(i);
        textRenderer.setData(labelData);
        if (this._needLabelExclusionPath()) {
          excludeBox = getTextBoundaries(textRenderer, width, height) ?? void 0;
        }
        this._renderer.append(textRenderer);
      }
      const vLineData = {
        x,
        lineColor: level.color,
        lineWidth: props.levelsStyle.linewidth,
        lineStyle: props.levelsStyle.linestyle,
        excludeBoundaries: excludeBox
      };
      const lineRenderer = new VerticalLineRenderer();
      const hitTest = new HitTestResult(HitTarget.MovePoint);
      lineRenderer.setData(vLineData);
      lineRenderer.setHitTest(hitTest);
      this._renderer.append(lineRenderer);
    }
    if (points.length === 2) {
      const trendProps = props.trendline;
      const trendData = {
        points,
        lineColor: trendProps.color,
        lineWidth: trendProps.linewidth,
        lineStyle: trendProps.linestyle,
        extendLeft: false,
        extendRight: false,
        leftEnd: LineEnd.Normal,
        rightEnd: LineEnd.Normal
      };
      this._trendRenderer.setData(trendData);
      this._renderer.append(this._trendRenderer);
    }
    if (points.length === 2) {
      this._renderer.append(this.createLineAnchor({ points }, 0));
    } else if (points.length > 0) {
      const anchor = this.createLineAnchor(
        {
          points: [new AnchorPoint(new Point(points[0].x, height / 2))]
        },
        0
      );
      this._renderer.append(anchor);
    }
  }
  _needLabelExclusionPath() {
    return this._source.properties().horzLabelsAlign === "center";
  }
}
class FibTimeZonePrimitive extends ToolPrimitive {
  constructor() {
    super(...arguments);
    __publicField(this, "_lines", new FibTimeZonePaneView(this, this.model));
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
    const [startPoint, endPoint] = this.controlPoints;
    const baseIndex = ensure(this.chart.timeScale().timeToIndexEx(startPoint.time));
    const span = endPoint ? ensure(this.chart.timeScale().timeToIndexEx(endPoint.time)) - baseIndex : 1;
    const levels = this._props.levels.reduce(
      (acc, level) => {
        const barIndex = Math.round(baseIndex + level.coeff * span);
        const x = ensure(this.chart.timeScale().logicalToCoordinate(barIndex));
        acc.push({
          x
        });
        return acc;
      },
      []
    );
    this._lines.update({ points, levels });
  }
}
class FibTimeZoneTool extends DrawingTool {
  constructor() {
    super(...arguments);
    __publicField(this, "type", FibTimeZoneToolType);
  }
  createPrimitive() {
    return new FibTimeZonePrimitive(
      {
        id: this.id,
        points: [],
        horzLabelsAlign: HorizontalAlign.Right,
        vertLabelsAlign: VerticalAlign.Bottom,
        showLabels: true,
        fillBackground: false,
        transparency: 80,
        trendline: {
          visible: true,
          color: "#808080",
          linewidth: 1,
          linestyle: LineStyleType.dashed
        },
        levelsStyle: { linewidth: 2, linestyle: LineStyleType.solid },
        levels: [
          {
            coeff: 0,
            color: "#808080FF"
          },
          {
            coeff: 1,
            color: "#2962FFFF"
          },
          {
            coeff: 2,
            color: "#2962FFFF"
          },
          {
            coeff: 3,
            color: "#2962FFFF"
          },
          {
            coeff: 5,
            color: "#2962FFFF"
          },
          {
            coeff: 8,
            color: "#2962FFFF"
          },
          {
            coeff: 13,
            color: "#2962FFFF"
          },
          {
            coeff: 21,
            color: "#2962FFFF"
          },
          {
            coeff: 34,
            color: "#2962FFFF"
          },
          {
            coeff: 55,
            color: "#2962FFFF"
          },
          {
            coeff: 89,
            color: "#2962FFFF"
          }
        ]
      },
      ...this.resetArgs
    );
  }
}
export {
  FibTimeZoneTool
};
