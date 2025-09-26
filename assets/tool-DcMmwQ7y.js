var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { u as Point, A as AnchorPoint, bN as LineEnd, L as LineStyleType } from "./index-DSkroicZ.js";
import { T as ToolPaneView, a as ToolPrimitive, D as DrawingTool } from "./toolPaneView-BAEHHn7m.js";
import { k as FlatTopBottomToolType } from "./index-DNbtFiKr.js";
import { P as PriceLabelPriceAxisView } from "./priceLabelPriceAxisView-d9Maj5lR.js";
import { T as TimeLabelTimeAxisView } from "./timeLabelTimeAxisView-BvW_UnA0.js";
import { P as PriceRangeAxisPaneView, T as TimeRangeAxisPaneView } from "./axisPaneView-Pbgdotf1.js";
import { C as CompositeRenderer } from "./composite-BOGQNAfc.js";
import { D as DisjointChannelRenderer } from "./disjointChannel-BFHt30t2.js";
import { L as LineRenderer } from "./line-CuaAD_DW.js";
import "./baseTool-BVX9dcKc.js";
import "./parallelChannel-Cc0CK6jv.js";
import "./line-tUhOmrMF.js";
class FlatTopBottomPaneView extends ToolPaneView {
  constructor() {
    super(...arguments);
    __publicField(this, "_trendLineRendererPoints12", new LineRenderer());
    __publicField(this, "_trendLineRendererPoints43", new LineRenderer());
    __publicField(this, "_disjointChannelRenderer", new DisjointChannelRenderer());
    // _p1LabelRenderer = new d.TextRenderer();
    // _p2LabelRenderer = new d.TextRenderer();
    // _p3LabelRenderer = new d.TextRenderer();
    // _p4LabelRenderer = new d.TextRenderer();
    // _labelTextRenderer = new d.TextRenderer();
    __publicField(this, "_renderer", new CompositeRenderer(this._hitTestCollector));
  }
  renderer() {
    return this._renderer;
  }
  _updateImpl() {
    this._renderer.clear();
    const points = this.points();
    if ((points == null ? void 0 : points.length) < 2) return;
    const [screenP1, screenP2] = points;
    const props = this._source.properties();
    let screenP3;
    let screenP4;
    if (points.length === 3) {
      screenP3 = new Point(screenP2.x, points[2].y);
      screenP4 = new Point(screenP1.x, screenP3.y);
      if (props.fillBackground) {
        this._disjointChannelRenderer.setData({
          extendleft: props.extendLeft,
          extendright: props.extendRight,
          points: [screenP1, screenP2, screenP3, screenP4],
          backcolor: props.backgroundColor,
          fillBackground: props.fillBackground
          // hittestOnBackground: CheckMobile.any(),
        });
        this._renderer.append(this._disjointChannelRenderer);
      }
    }
    const buildLineData = (p1, p2) => ({
      points: [p1, p2],
      lineColor: props.lineColor,
      lineWidth: props.lineWidth,
      lineStyle: props.lineStyle,
      extendLeft: props.extendLeft,
      extendRight: props.extendRight,
      leftEnd: props.leftEnd,
      rightEnd: props.rightEnd
    });
    this._trendLineRendererPoints12.setData(buildLineData(screenP1, screenP2));
    this._renderer.append(this._trendLineRendererPoints12);
    if (points.length === 2) {
      this.addAnchors(this._renderer);
      return;
    }
    if (!screenP3 || !screenP4) {
      this.addAnchors(this._renderer);
      return;
    }
    this._trendLineRendererPoints43.setData(buildLineData(screenP4, screenP3));
    this._renderer.append(this._trendLineRendererPoints43);
    const anchors = [
      screenP1,
      // P1
      screenP2,
      // P2
      new AnchorPoint(screenP3, { pointIndex: 2 }),
      new AnchorPoint(screenP4, { pointIndex: 3 })
    ];
    if (this._model.currentCreating === this._source) {
      anchors.pop();
    }
    this._renderer.append(this.createLineAnchor({ points: anchors }, 0));
  }
}
class FlatTopBottomPrimitive extends ToolPrimitive {
  constructor() {
    super(...arguments);
    __publicField(this, "_lines", new FlatTopBottomPaneView(this, this.model));
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
  setPoint(pointIndex, newPoint, details) {
    if (pointIndex === 2) {
      this.controlPoints[1].time = newPoint.time;
    } else if (pointIndex === 3) {
      this.controlPoints[0].time = newPoint.time;
      this.controlPoints[2].price = newPoint.price;
      return;
    }
    super.setPoint(pointIndex, newPoint, details);
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
class FlatTopBottomTool extends DrawingTool {
  constructor() {
    super(...arguments);
    __publicField(this, "type", FlatTopBottomToolType);
  }
  createPrimitive() {
    return new FlatTopBottomPrimitive(
      {
        id: this.id,
        points: [],
        lineColor: "#FF9800FF",
        lineStyle: LineStyleType.solid,
        lineWidth: 2,
        fillBackground: true,
        backgroundColor: "#FF980033",
        extendLeft: false,
        extendRight: false,
        leftEnd: LineEnd.Normal,
        rightEnd: LineEnd.Normal
      },
      ...this.resetArgs
    );
  }
}
export {
  FlatTopBottomTool
};
