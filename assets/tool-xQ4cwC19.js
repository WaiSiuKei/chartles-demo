var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { u as Point, bN as LineEnd, L as LineStyleType, e as ensure, r as ChartFontFamily, A as AnchorPoint, c5 as getLightenRGBA } from "./index-DSkroicZ.js";
import { T as ToolPaneView, a as ToolPrimitive, D as DrawingTool } from "./toolPaneView-BAEHHn7m.js";
import { a4 as PatternTriangleToolType } from "./index-DNbtFiKr.js";
import { P as PriceLabelPriceAxisView } from "./priceLabelPriceAxisView-d9Maj5lR.js";
import { T as TimeLabelTimeAxisView } from "./timeLabelTimeAxisView-BvW_UnA0.js";
import { P as PriceRangeAxisPaneView, T as TimeRangeAxisPaneView } from "./axisPaneView-Pbgdotf1.js";
import { B as BaseTextRenderer, H as HorizontalAlign, V as VerticalAlign } from "./text-DNYLW3w-.js";
import { C as CompositeRenderer } from "./composite-BOGQNAfc.js";
import { L as LineRenderer } from "./line-CuaAD_DW.js";
import { T as TriangleRenderer } from "./triangle-CGp_dGCX.js";
import "./baseTool-BVX9dcKc.js";
import "./text-FiPV6-V4.js";
import "./ctx-DYUP60aL.js";
import "./line-tUhOmrMF.js";
class PatternTrianglePaneView extends ToolPaneView {
  constructor() {
    super(...arguments);
    __publicField(this, "_renderer", new CompositeRenderer(this._hitTestCollector));
    __publicField(this, "_trendLineRendererPoints01", new LineRenderer());
    __publicField(this, "_trendLineRendererPoints12", new LineRenderer());
    __publicField(this, "_trendLineRendererPoints23", new LineRenderer());
    __publicField(this, "_intersectionRenderer", new TriangleRenderer());
    __publicField(this, "_aLabelRenderer", new BaseTextRenderer());
    __publicField(this, "_bLabelRenderer", new BaseTextRenderer());
    __publicField(this, "_cLabelRenderer", new BaseTextRenderer());
    __publicField(this, "_dLabelRenderer", new BaseTextRenderer());
  }
  renderer() {
    return this._renderer;
  }
  _updateImpl() {
    this._renderer.clear();
    const points = this.points();
    if ((points == null ? void 0 : points.length) < 2) return;
    const [ptA, ptB, ptC, ptD] = points;
    let crossPt, extendedA, extendedB;
    if (points.length === 4) {
      if (Math.abs(ptC.x - ptA.x) < 1 || Math.abs(ptD.x - ptB.x) < 1) return;
      const leftX = Math.min(ptA.x, ptB.x, ptC.x, ptD.x);
      const slopeAB = (ptC.y - ptA.y) / (ptC.x - ptA.x);
      const yAB = ptA.y + (leftX - ptA.x) * slopeAB;
      const slopeCD = (ptD.y - ptB.y) / (ptD.x - ptB.x);
      const yCD = ptB.y + (leftX - ptB.x) * slopeCD;
      if (Math.abs(slopeAB - slopeCD) < 1e-6) return;
      extendedA = new Point(leftX, yAB);
      extendedB = new Point(leftX, yCD);
      const intersectionX = (ptB.y - ptA.y + (ptA.x * slopeAB - ptB.x * slopeCD)) / (slopeAB - slopeCD);
      if (intersectionX < leftX) {
        const rightX = Math.max(ptA.x, ptB.x, ptC.x, ptD.x);
        extendedA = new Point(rightX, ptA.y + (rightX - ptA.x) * slopeAB);
        extendedB = new Point(rightX, ptB.y + (rightX - ptB.x) * slopeCD);
      }
      const intersectionY = ptA.y + (intersectionX - ptA.x) * slopeAB;
      crossPt = new Point(intersectionX, intersectionY);
    }
    const props = this._source.properties();
    const makeLabel = (point, text) => ({
      points: [point],
      text,
      color: props.textColor,
      fontFamily: ChartFontFamily,
      vertAlign: VerticalAlign.Middle,
      horzAlign: HorizontalAlign.Center,
      offsetX: 0,
      offsetY: 0,
      // bold: props.bold?.value(),
      // italic: props.italic?.value(),
      fontSize: props.textFontSize,
      backgroundColor: props.lineColor,
      backgroundRoundRect: 4
    });
    const makeLine = (p1, p2) => ({
      points: [p1, p2],
      lineColor: props.lineColor,
      lineWidth: props.lineWidth,
      lineStyle: LineStyleType.solid,
      extendLeft: false,
      extendRight: false,
      leftEnd: LineEnd.Normal,
      rightEnd: LineEnd.Normal
    });
    this._trendLineRendererPoints01.setData(makeLine(ptA, ptB));
    this._renderer.append(this._trendLineRendererPoints01);
    if (points.length >= 3) {
      this._trendLineRendererPoints12.setData(makeLine(ptB, ptC));
      this._renderer.append(this._trendLineRendererPoints12);
    }
    if (points.length === 4) {
      this._trendLineRendererPoints23.setData(makeLine(ptC, ptD));
      this._renderer.append(this._trendLineRendererPoints23);
      if (crossPt && extendedA && extendedB) {
        const area = {
          points: [ensure(extendedA), ensure(extendedB), crossPt],
          color: props.lineColor,
          lineWidth: props.lineWidth,
          backColor: props.background,
          fillBackground: props.fillBackground,
          lineStyle: LineStyleType.dotted
        };
        this._intersectionRenderer.setData(area);
        this._renderer.append(this._intersectionRenderer);
      }
    }
    const labelA = makeLabel(ptA, "A");
    labelA.vertAlign = ptB.y > ptA.y ? VerticalAlign.Bottom : VerticalAlign.Top;
    labelA.offsetY = 5;
    this._aLabelRenderer.setData(labelA);
    this._renderer.append(this._aLabelRenderer);
    const labelB = makeLabel(ptB, "B");
    labelB.vertAlign = ptB.y < ptA.y ? VerticalAlign.Bottom : VerticalAlign.Top;
    labelB.offsetY = 5;
    this._bLabelRenderer.setData(labelB);
    this._renderer.append(this._bLabelRenderer);
    if (points.length > 2) {
      const labelC = makeLabel(ptC, "C");
      labelC.vertAlign = ptC.y < ptB.y ? VerticalAlign.Bottom : VerticalAlign.Top;
      labelC.offsetY = 5;
      this._cLabelRenderer.setData(labelC);
      this._renderer.append(this._cLabelRenderer);
    }
    if (points.length > 3) {
      const labelD = makeLabel(ptD, "D");
      labelD.vertAlign = ptD.y < ptC.y ? VerticalAlign.Bottom : VerticalAlign.Top;
      labelD.offsetY = 5;
      this._dLabelRenderer.setData(labelD);
      this._renderer.append(this._dLabelRenderer);
    }
    this.addAnchors(this._renderer);
  }
}
class PatternTrianglePrimitive extends ToolPrimitive {
  constructor() {
    super(...arguments);
    __publicField(this, "_lines", new PatternTrianglePaneView(this, this.model));
    __publicField(this, "_paneView", [this._lines]);
    __publicField(this, "_priceAxisPaneViews", [new PriceRangeAxisPaneView(/* @__PURE__ */ Object.create(null))]);
    __publicField(this, "_timeAxisPaneViews", [new TimeRangeAxisPaneView(/* @__PURE__ */ Object.create(null))]);
    __publicField(this, "_timeAxisViews", [
      new TimeLabelTimeAxisView(/* @__PURE__ */ Object.create(null)),
      new TimeLabelTimeAxisView(/* @__PURE__ */ Object.create(null)),
      new TimeLabelTimeAxisView(/* @__PURE__ */ Object.create(null)),
      new TimeLabelTimeAxisView(/* @__PURE__ */ Object.create(null))
    ]);
    __publicField(this, "_priceAxisViews", [
      new PriceLabelPriceAxisView(/* @__PURE__ */ Object.create(null)),
      new PriceLabelPriceAxisView(/* @__PURE__ */ Object.create(null)),
      new PriceLabelPriceAxisView(/* @__PURE__ */ Object.create(null)),
      new PriceLabelPriceAxisView(/* @__PURE__ */ Object.create(null))
    ]);
  }
  pointsCount() {
    return 4;
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
class PatternTriangleTool extends DrawingTool {
  constructor() {
    super(...arguments);
    __publicField(this, "type", PatternTriangleToolType);
  }
  createPrimitive() {
    return new PatternTrianglePrimitive(
      {
        id: this.id,
        points: [],
        lineColor: "#673AB7FF",
        lineWidth: 2,
        background: getLightenRGBA("#673AB7FF", 0.15),
        fillBackground: true,
        textColor: "#ffffff",
        textFontSize: 12
      },
      ...this.resetArgs
    );
  }
}
export {
  PatternTriangleTool
};
