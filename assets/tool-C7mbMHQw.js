var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { H as HorizontalLineRenderer, y as HitTestResult, z as HitTarget, A as AnchorPoint, L as LineStyleType } from "./index-NZHt9VGv.js";
import { T as ToolPaneView, a as ToolPrimitive, D as DrawingTool } from "./toolPaneView-3wj_on-u.js";
import { Q as CrossLineToolType } from "./index-TSHQCVD9.js";
import { P as PriceLabelPriceAxisView } from "./priceLabelPriceAxisView-d9Maj5lR.js";
import { T as TimeLabelTimeAxisView } from "./timeLabelTimeAxisView-BvW_UnA0.js";
import { C as CompositeRenderer } from "./composite-tvPrNHN0.js";
import { V as VerticalLineRenderer } from "./verticalLine-Bizl3Oqm.js";
import "./baseTool-CHlzZht2.js";
class CrossLinePaneView extends ToolPaneView {
  constructor() {
    super(...arguments);
    __publicField(this, "_renderer", new CompositeRenderer(this._hitTestCollector));
    __publicField(this, "_horizLineRenderer", new HorizontalLineRenderer(
      void 0,
      void 0,
      new HitTestResult(HitTarget.MovePoint)
    ));
    __publicField(this, "_vertLineRenderer", new VerticalLineRenderer());
  }
  renderer() {
    return this._renderer;
  }
  _updateImpl() {
    this._renderer.clear();
    const points = this.points();
    if ((points == null ? void 0 : points.length) === 0) return;
    const props = this._source.properties();
    this._horizLineRenderer.setData({
      lineColor: props.linecolor,
      lineStyle: props.linestyle,
      lineWidth: props.linewidth,
      y: points[0].y
    });
    this._vertLineRenderer.setData({
      lineColor: props.linecolor,
      lineStyle: props.linestyle,
      lineWidth: props.linewidth,
      x: points[0].x
    });
    this._vertLineRenderer.setHitTest(
      new HitTestResult(
        HitTarget.MovePoint
        //   {
        //   snappingIndex: this._source.points()[0].index,
        // }
      )
    );
    this._renderer.append(this._horizLineRenderer);
    this._renderer.append(this._vertLineRenderer);
    this.addAnchors(this._renderer);
  }
}
class CrossLinePrimitive extends ToolPrimitive {
  constructor() {
    super(...arguments);
    __publicField(this, "_line", new CrossLinePaneView(this, this.model));
    __publicField(this, "_paneView", [this._line]);
    __publicField(this, "_timeAxisViews", [new TimeLabelTimeAxisView(/* @__PURE__ */ Object.create(null))]);
    __publicField(this, "_priceAxisViews", [new PriceLabelPriceAxisView(/* @__PURE__ */ Object.create(null))]);
  }
  pointsCount() {
    return 1;
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
    this.controlPoints.forEach((p, i) => {
      this._timeAxisViews[i].update(this._calculateTimeAxisViewData(p.time, points[i].x));
      this._priceAxisViews[i].update(this._calculatePriceAxisViewData(p.price, points[i].y));
    });
    this._paneView[0].update({ points });
  }
  priceAxisViews() {
    return this.properties().showPrice ? this._priceAxisViews : [];
  }
  timeAxisViews() {
    return this.properties().showTime ? this._timeAxisViews : [];
  }
}
class CrossLineTool extends DrawingTool {
  constructor() {
    super(...arguments);
    __publicField(this, "type", CrossLineToolType);
  }
  createPrimitive() {
    return new CrossLinePrimitive(
      {
        id: this.id,
        points: [],
        linecolor: "#2A62FF",
        linestyle: LineStyleType.solid,
        linewidth: 2,
        showPrice: true,
        showTime: true
      },
      ...this.resetArgs
    );
  }
}
export {
  CrossLineTool
};
