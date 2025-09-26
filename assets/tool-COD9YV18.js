var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { T as ToolPaneView, a as ToolPrimitive, D as DrawingTool } from "./toolPaneView-BAEHHn7m.js";
import { aq as TriangleToolType } from "./index-DNbtFiKr.js";
import { L as LineStyleType, A as AnchorPoint, z as HitTarget } from "./index-DSkroicZ.js";
import { P as PriceLabelPriceAxisView } from "./priceLabelPriceAxisView-d9Maj5lR.js";
import { T as TimeLabelTimeAxisView } from "./timeLabelTimeAxisView-BvW_UnA0.js";
import { P as PriceRangeAxisPaneView, T as TimeRangeAxisPaneView } from "./axisPaneView-Pbgdotf1.js";
import { C as CompositeRenderer } from "./composite-BOGQNAfc.js";
import { P as PolygonRenderer } from "./polygon-C6s4PX2h.js";
import "./baseTool-BVX9dcKc.js";
import "./line-CuaAD_DW.js";
class TrianglePaneView extends ToolPaneView {
  constructor() {
    super(...arguments);
    __publicField(this, "_renderer", new CompositeRenderer(this._hitTestCollector));
    __publicField(this, "_polygonRenderer", new PolygonRenderer());
  }
  renderer() {
    return this._renderer;
  }
  _updateImpl() {
    this._renderer.clear();
    const props = this._source.properties();
    this._polygonRenderer.setData({
      points: this.points(),
      lineColor: props.lineColor,
      lineWidth: props.lineWidth,
      lineStyle: LineStyleType.solid,
      filled: true,
      background: props.backgroundColor,
      transparency: props.transparency
    });
    this._renderer.append(this._polygonRenderer);
    this.addAnchors(this._renderer);
  }
}
class TrianglePrimitive extends ToolPrimitive {
  constructor() {
    super(...arguments);
    __publicField(this, "_lines", new TrianglePaneView(this, this.model));
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
    const xs = [];
    const ys = [];
    const anchorPoints = [];
    for (let i = 0; i < this.controlPoints.length; i++) {
      const p = this.controlPoints[i];
      const drawPoint = this.pointToScreenPoint(p);
      if (!drawPoint) return;
      xs.push(drawPoint.x);
      ys.push(drawPoint.y);
      const anchorPoint = new AnchorPoint(drawPoint, {
        pointIndex: i,
        hitTarget: HitTarget.ChangePoint
      });
      anchorPoints.push(anchorPoint);
      this._timeAxisViews[i].update(this._calculateTimeAxisViewData(p.time, drawPoint.x));
      this._priceAxisViews[i].update(this._calculatePriceAxisViewData(p.price, drawPoint.y));
    }
    if (xs.length) {
      this._timeAxisPaneViews[0].update(
        this._calculateTimeAxisPaneViewsData(Math.min.apply(null, xs), Math.max.apply(null, xs))
      );
    }
    if (ys.length) {
      this._priceAxisPaneViews[0].update(
        this._calculatePriceAxisPaneViewData(Math.min.apply(null, ys), Math.max.apply(null, ys))
      );
    }
    this._lines.update({ points: anchorPoints });
  }
}
class TriangleTool extends DrawingTool {
  constructor() {
    super(...arguments);
    __publicField(this, "type", TriangleToolType);
  }
  createPrimitive() {
    return new TrianglePrimitive(
      {
        id: this.id,
        points: [],
        lineColor: "#089981FF",
        lineWidth: 2,
        backgroundColor: "rgba(8, 153, 129, 0.2)",
        transparency: 80
      },
      ...this.resetArgs
    );
  }
}
export {
  TriangleTool
};
