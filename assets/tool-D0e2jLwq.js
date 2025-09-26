var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { y as HitTestResult, z as HitTarget, u as Point, bN as LineEnd, r as ChartFontFamily, A as AnchorPoint, L as LineStyleType } from "./index-DSkroicZ.js";
import { T as ToolPaneView, a as ToolPrimitive, D as DrawingTool } from "./toolPaneView-BAEHHn7m.js";
import { K as GannFanToolType } from "./index-DNbtFiKr.js";
import { P as PriceLabelPriceAxisView } from "./priceLabelPriceAxisView-d9Maj5lR.js";
import { T as TimeLabelTimeAxisView } from "./timeLabelTimeAxisView-BvW_UnA0.js";
import { P as PriceRangeAxisPaneView, T as TimeRangeAxisPaneView } from "./axisPaneView-Pbgdotf1.js";
import { B as BaseTextRenderer, H as HorizontalAlign, V as VerticalAlign } from "./text-DNYLW3w-.js";
import { b as getNumericFormatter } from "./formatter-Drv30PyG.js";
import { C as ChannelRenderer } from "./channel-BYLWF8B5.js";
import { C as CompositeRenderer } from "./composite-BOGQNAfc.js";
import { L as LineRenderer } from "./line-CuaAD_DW.js";
import "./baseTool-BVX9dcKc.js";
import "./text-FiPV6-V4.js";
import "./ctx-DYUP60aL.js";
import "./numericFormatter-6U8WkLAS.js";
class GannFanPaneView extends ToolPaneView {
  constructor() {
    super(...arguments);
    __publicField(this, "_renderer", new CompositeRenderer(this._hitTestCollector));
    __publicField(this, "_textRenderers", /* @__PURE__ */ new Map());
  }
  renderer() {
    return this._renderer;
  }
  getTextRenderer(idx) {
    let r = this._textRenderers.get(idx);
    if (!r) {
      r = new BaseTextRenderer(new HitTestResult(HitTarget.MovePoint));
      this._textRenderers.set(idx, r);
    }
    return r;
  }
  _updateImpl() {
    this._renderer.clear();
    const points = this.points();
    if ((points == null ? void 0 : points.length) < 2) return;
    const start = points[0];
    const end = points[1];
    const deltaX = end.x - start.x;
    const deltaY = end.y - start.y;
    const props = this._source.properties();
    const fillEnabled = props.fillBackground;
    const transparency = props.transparency;
    const showLabels = props.showLabels;
    const formatter = getNumericFormatter();
    const levels = props.levels.reduce(
      (acc, levelProps, i) => {
        const coeff1 = levelProps.coeff1;
        const coeff2 = levelProps.coeff2;
        const ratio = coeff1 / coeff2;
        const label = `${formatter.format(coeff1)}/${formatter.format(coeff2)}`;
        const color = levelProps.color;
        let targetX;
        let targetY;
        if (coeff1 > coeff2) {
          targetX = end.x;
          targetY = start.y + deltaY / ratio;
        } else {
          targetX = start.x + deltaX * ratio;
          targetY = end.y;
        }
        acc.push({
          label,
          color,
          x: targetX,
          y: targetY,
          // linewidth: thickness,
          // linestyle: style,
          index: i
        });
        return acc;
      },
      []
    );
    for (let i = 0; i < levels.length; i++) {
      const level = levels[i];
      const point = new Point(level.x, level.y);
      if (fillEnabled) {
        const shouldDrawUp = level.index < 4;
        const shouldDrawDown = level.index > 4 && i > 0;
        if (shouldDrawUp) {
          const nextLevel = levels[i + 1];
          if (nextLevel) {
            const bg = new ChannelRenderer();
            bg.setData({
              p1: start,
              p2: point,
              p3: start,
              p4: new Point(nextLevel.x, nextLevel.y),
              color: level.color,
              transparency,
              hittestOnBackground: true,
              extendLeft: false
            });
            this._renderer.append(bg);
          }
        } else if (shouldDrawDown) {
          const prevLevel = levels[i - 1];
          if (prevLevel) {
            const bg = new ChannelRenderer();
            bg.setData({
              p1: start,
              p2: point,
              p3: start,
              p4: new Point(prevLevel.x, prevLevel.y),
              color: level.color,
              transparency,
              hittestOnBackground: true,
              extendLeft: false
            });
            this._renderer.append(bg);
          }
        }
      }
      const trendLine = new LineRenderer();
      trendLine.setData({
        points: [start, point],
        lineColor: level.color,
        lineWidth: props.levelsStyle.linewidth,
        lineStyle: props.levelsStyle.linestyle,
        extendLeft: false,
        extendRight: true,
        leftEnd: LineEnd.Normal,
        rightEnd: LineEnd.Normal
      });
      trendLine.setHitTest(new HitTestResult(HitTarget.MovePoint));
      this._renderer.append(trendLine);
      if (showLabels) {
        const textLabel = this.getTextRenderer(i);
        textLabel.setData({
          points: [point],
          text: level.label,
          color: level.color,
          vertAlign: VerticalAlign.Middle,
          horzAlign: HorizontalAlign.Left,
          fontFamily: ChartFontFamily,
          offsetX: 0,
          offsetY: 5,
          fontSize: 12
        });
        this._renderer.append(textLabel);
      }
    }
    this.addAnchors(this._renderer);
  }
}
class GannFanPrimitive extends ToolPrimitive {
  constructor() {
    super(...arguments);
    __publicField(this, "_lines", new GannFanPaneView(this, this.model));
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
    this._lines.update({ points });
  }
}
class GannFanTool extends DrawingTool {
  constructor() {
    super(...arguments);
    __publicField(this, "type", GannFanToolType);
  }
  createPrimitive() {
    return new GannFanPrimitive(
      {
        id: this.id,
        points: [],
        linewidth: 2,
        showLabels: true,
        fillBackground: true,
        transparency: 80,
        levelsStyle: { linewidth: 2, linestyle: LineStyleType.solid },
        levels: [
          {
            coeff1: 1,
            coeff2: 8,
            color: "#FF9800"
          },
          {
            coeff1: 1,
            coeff2: 4,
            color: "#089981"
          },
          {
            coeff1: 1,
            coeff2: 3,
            color: "#4CAF50"
          },
          {
            coeff1: 1,
            coeff2: 2,
            color: "#089981"
          },
          {
            coeff1: 1,
            coeff2: 1,
            color: "#00BCD4"
          },
          {
            coeff1: 2,
            coeff2: 1,
            color: "#2962FF"
          },
          {
            coeff1: 3,
            coeff2: 1,
            color: "#9C27B0"
          },
          {
            coeff1: 4,
            coeff2: 1,
            color: "#E91E63"
          },
          {
            coeff1: 8,
            coeff2: 1,
            color: "#F23645"
          }
        ]
      },
      ...this.resetArgs
    );
  }
}
export {
  GannFanTool
};
