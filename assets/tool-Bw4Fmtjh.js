var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { L as LineStyleType, A as AnchorPoint, bN as LineEnd } from "./index-DSkroicZ.js";
import { T as ToolPaneView, a as ToolPrimitive, c as DrawingAbortBehavior, D as DrawingTool } from "./toolPaneView-BAEHHn7m.js";
import { am as PathToolType } from "./index-DNbtFiKr.js";
import { P as PriceRangeAxisPaneView, T as TimeRangeAxisPaneView } from "./axisPaneView-Pbgdotf1.js";
import { C as CompositeRenderer } from "./composite-BOGQNAfc.js";
import { P as PolygonRenderer } from "./polygon-C6s4PX2h.js";
import "./baseTool-BVX9dcKc.js";
import "./line-CuaAD_DW.js";
class PathPaneView extends ToolPaneView {
  constructor() {
    super(...arguments);
    __publicField(this, "_renderer", new CompositeRenderer(this._hitTestCollector));
    __publicField(this, "_poligonRenderer", new PolygonRenderer());
  }
  renderer() {
    return this._renderer;
  }
  _updateImpl() {
    this._renderer.clear();
    const props = this._source.properties();
    this._poligonRenderer.setData({
      points: this.points(),
      lineColor: props.lineColor,
      lineWidth: props.lineWidth,
      lineStyle: LineStyleType.solid,
      leftEnd: props.leftEnd,
      rightEnd: props.rightEnd
    });
    this._renderer.append(this._poligonRenderer);
    this.addAnchors(this._renderer);
  }
}
class PathPrimitive extends ToolPrimitive {
  constructor() {
    super(...arguments);
    __publicField(this, "_lines", new PathPaneView(this, this.model));
    __publicField(this, "_paneView", [this._lines]);
    __publicField(this, "_priceAxisPaneViews", [new PriceRangeAxisPaneView(/* @__PURE__ */ Object.create(null))]);
    __publicField(this, "_timeAxisPaneViews", [new TimeRangeAxisPaneView(/* @__PURE__ */ Object.create(null))]);
  }
  pointsCount() {
    return Infinity;
  }
  abort() {
    this.updateProps({
      points: this.controlPoints.slice(0, this.controlPoints.length - 1)
    });
    return this._props.points.length < 2 ? DrawingAbortBehavior.Remove : DrawingAbortBehavior.None;
  }
  updateAllViews() {
    if (!this.controlPoints.length) return;
    const xs = [];
    const ys = [];
    const points = [];
    for (let i = 0; i < this.controlPoints.length; i++) {
      const point = this.controlPoints[i];
      const screenPoint = this.pointToScreenPoint(point);
      if (!screenPoint) return;
      points.push(new AnchorPoint(screenPoint, { pointIndex: i }));
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
    this._lines.update({ points });
  }
}
class PathTool extends DrawingTool {
  constructor() {
    super(...arguments);
    __publicField(this, "type", PathToolType);
  }
  createPrimitive() {
    return new PathPrimitive(
      {
        id: this.id,
        points: [],
        lineColor: "#2962FFFF",
        lineWidth: 2,
        leftEnd: LineEnd.Normal,
        rightEnd: LineEnd.Arrow
      },
      ...this.resetArgs
    );
  }
}
export {
  PathTool
};
