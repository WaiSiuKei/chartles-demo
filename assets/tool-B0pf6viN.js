var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { A as AnchorPoint, bN as LineEnd, y as HitTestResult, z as HitTarget, L as LineStyleType } from "./index-NZHt9VGv.js";
import { T as ToolPaneView, a as ToolPrimitive, D as DrawingTool } from "./toolPaneView-3wj_on-u.js";
import { E as PitchfanToolType } from "./index-TSHQCVD9.js";
import { P as PriceLabelPriceAxisView } from "./priceLabelPriceAxisView-d9Maj5lR.js";
import { T as TimeLabelTimeAxisView } from "./timeLabelTimeAxisView-BvW_UnA0.js";
import { P as PriceRangeAxisPaneView, T as TimeRangeAxisPaneView } from "./axisPaneView-Pbgdotf1.js";
import { C as ChannelRenderer } from "./channel-Bwda4fFe.js";
import { C as CompositeRenderer } from "./composite-tvPrNHN0.js";
import { L as LineRenderer } from "./line-DFhYRKvt.js";
import "./baseTool-CHlzZht2.js";
class PitchfanPaneView extends ToolPaneView {
  constructor() {
    super(...arguments);
    __publicField(this, "_medianRenderer", new LineRenderer());
    __publicField(this, "_sideRenderer", new LineRenderer());
    __publicField(this, "_renderer", new CompositeRenderer(this._hitTestCollector));
  }
  renderer() {
    return this._renderer;
  }
  _updateImpl() {
    this._renderer.clear();
    const points = this.points();
    if ((points == null ? void 0 : points.length) < 2) return;
    const [startPoint] = points;
    const medianPoint = new AnchorPoint(
      points.length === 3 ? points[1].add(points[2]).scaled(0.5) : points.length === 2 ? points[1] : startPoint,
      { pointIndex: 3 }
    );
    const props = this._source.properties();
    const medianProps = props.median;
    const medianLineConfig = {
      points: [startPoint, medianPoint.point],
      lineColor: medianProps.color,
      lineWidth: medianProps.linewidth,
      lineStyle: medianProps.linestyle,
      extendLeft: false,
      extendRight: true,
      leftEnd: LineEnd.Normal,
      rightEnd: LineEnd.Normal
    };
    this._medianRenderer.setData(medianLineConfig);
    this._renderer.append(this._medianRenderer);
    if (points.length < 3) {
      this.addAnchors(this._renderer);
      return;
    }
    const sideLineConfig = {
      points: [points[1], points[2]],
      lineColor: medianProps.color,
      lineWidth: medianProps.linewidth,
      lineStyle: medianProps.linestyle,
      extendLeft: false,
      extendRight: false,
      leftEnd: LineEnd.Normal,
      rightEnd: LineEnd.Normal
    };
    this._sideRenderer.setData(sideLineConfig);
    this._renderer.append(this._sideRenderer);
    const directionVector = points[2].subtract(points[1]).scaled(0.5);
    const fillBackground = props.fillBackground;
    const transparency = props.transparency;
    let prevCoeff = 0;
    props.levels.forEach((levelProps) => {
      const coeff = levelProps.coeff;
      const color = levelProps.color;
      const positiveOffset = medianPoint.point.addScaled(directionVector, coeff);
      const negativeOffset = medianPoint.point.addScaled(directionVector, -coeff);
      if (fillBackground) {
        const channel1 = new ChannelRenderer();
        channel1.setData({
          p1: startPoint,
          p2: positiveOffset,
          p3: startPoint,
          p4: medianPoint.point.addScaled(directionVector, prevCoeff),
          color,
          transparency,
          hittestOnBackground: true,
          extendLeft: false
        });
        this._renderer.append(channel1);
        const channel2 = new ChannelRenderer();
        channel2.setData({
          p1: startPoint,
          p2: negativeOffset,
          p3: startPoint,
          p4: medianPoint.point.addScaled(directionVector, -prevCoeff),
          color,
          transparency,
          hittestOnBackground: true,
          extendLeft: false
        });
        this._renderer.append(channel2);
      }
      prevCoeff = coeff;
      const line1 = new LineRenderer();
      line1.setData({
        points: [startPoint, positiveOffset],
        lineColor: color,
        lineWidth: props.levelsStyle.linewidth,
        lineStyle: props.levelsStyle.linestyle,
        extendLeft: false,
        extendRight: true,
        leftEnd: LineEnd.Normal,
        rightEnd: LineEnd.Normal
      });
      line1.setHitTest(new HitTestResult(HitTarget.MovePoint));
      this._renderer.append(line1);
      const line2 = new LineRenderer();
      line2.setData({
        points: [startPoint, negativeOffset],
        lineColor: color,
        lineWidth: props.levelsStyle.linewidth,
        lineStyle: props.levelsStyle.linestyle,
        extendLeft: false,
        extendRight: true,
        leftEnd: LineEnd.Normal,
        rightEnd: LineEnd.Normal
      });
      line2.setHitTest(new HitTestResult(HitTarget.MovePoint));
      this._renderer.append(line2);
    });
    this.addAnchors(this._renderer);
  }
}
class PitchfanPrimitive extends ToolPrimitive {
  constructor() {
    super(...arguments);
    __publicField(this, "_lines", new PitchfanPaneView(this, this.model));
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
    this._lines.update({ points });
  }
}
class PitchfanTool extends DrawingTool {
  constructor() {
    super(...arguments);
    __publicField(this, "type", PitchfanToolType);
  }
  createPrimitive() {
    return new PitchfanPrimitive(
      {
        id: this.id,
        points: [],
        fillBackground: true,
        transparency: 80,
        levelsStyle: { linewidth: 2, linestyle: LineStyleType.solid },
        levels: [
          {
            coeff: 0.5,
            color: "#00BCD4"
          },
          {
            coeff: 1,
            color: "#2962FF"
          }
        ],
        median: {
          visible: true,
          color: "#F23645",
          linewidth: 2,
          linestyle: LineStyleType.solid
        }
      },
      ...this.resetArgs
    );
  }
}
export {
  PitchfanTool
};
