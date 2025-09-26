var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { ct as intersectLineSegments, L as LineStyleType, bN as LineEnd, r as ChartFontFamily, A as AnchorPoint, c5 as getLightenRGBA, ap as IIntlService } from "./index-DSkroicZ.js";
import { T as ToolPaneView, a as ToolPrimitive, D as DrawingTool } from "./toolPaneView-BAEHHn7m.js";
import { a2 as PatternHeadAndShouldersToolType } from "./index-DNbtFiKr.js";
import { P as PriceLabelPriceAxisView } from "./priceLabelPriceAxisView-d9Maj5lR.js";
import { T as TimeLabelTimeAxisView } from "./timeLabelTimeAxisView-BvW_UnA0.js";
import { P as PriceRangeAxisPaneView, T as TimeRangeAxisPaneView } from "./axisPaneView-Pbgdotf1.js";
import { B as BaseTextRenderer, V as VerticalAlign, H as HorizontalAlign } from "./text-DNYLW3w-.js";
import { C as CompositeRenderer } from "./composite-BOGQNAfc.js";
import { L as LineRenderer } from "./line-CuaAD_DW.js";
import { P as PolygonRenderer } from "./polygon-C6s4PX2h.js";
import { T as TriangleRenderer } from "./triangle-CGp_dGCX.js";
import "./baseTool-BVX9dcKc.js";
import "./text-FiPV6-V4.js";
import "./ctx-DYUP60aL.js";
import "./line-tUhOmrMF.js";
class PatternHeadAndShouldersPaneView extends ToolPaneView {
  constructor() {
    super(...arguments);
    __publicField(this, "_renderer", new CompositeRenderer(this._hitTestCollector));
    __publicField(this, "_trendLineRenderer", new LineRenderer());
    __publicField(this, "_triangleRendererPoints234", new TriangleRenderer());
    __publicField(this, "_intersect1Renderer", new TriangleRenderer());
    __publicField(this, "_intersect2Renderer", new TriangleRenderer());
    __publicField(this, "_polyLineRenderer", new PolygonRenderer());
    __publicField(this, "_leftShoulderLabelRenderer", new BaseTextRenderer());
    __publicField(this, "_headLabelRenderer", new BaseTextRenderer());
    __publicField(this, "_rightShoulderLabelRenderer", new BaseTextRenderer());
  }
  renderer() {
    return this._renderer;
  }
  _updateImpl() {
    this._renderer.clear();
    const points = this.points();
    if (!(points == null ? void 0 : points.length)) return;
    let intersectA;
    let intersectB;
    const [pt0, pt1, pt2, pt3, pt4, pt5, pt6] = points;
    if (points.length >= 5) {
      const intersection1 = intersectLineSegments(pt2, pt4, pt0, pt1);
      if (intersection1) {
        const vec = pt4.subtract(pt2);
        intersectA = pt2.add(vec.scaled(intersection1));
      }
      if (points.length === 7) {
        const intersection2 = intersectLineSegments(pt2, pt4, pt5, pt6);
        if (intersection2) {
          const vec = pt4.subtract(pt2);
          intersectB = pt2.add(vec.scaled(intersection2));
        }
      }
    }
    if (points.length < 2) return;
    const props = this._source.properties();
    const makeLabelConfig = (point, text) => ({
      points: [point],
      text,
      color: props.textColor,
      horzAlign: HorizontalAlign.Center,
      vertAlign: VerticalAlign.Middle,
      fontFamily: ChartFontFamily,
      offsetX: 0,
      offsetY: 0,
      // bold: props.bold?.value(),
      // italic: props.italic?.value(),
      fontSize: props.textFontSize,
      backgroundColor: props.lineColor,
      backgroundRoundRect: 4
    });
    const makeTriangleFill = (p1, p2, p3) => ({
      points: [p1, p2, p3],
      color: "rgba(0, 0, 0, 0)",
      lineWidth: 0,
      backColor: props.background,
      fillBackground: props.fillBackground
    });
    const polyConfig = {
      points,
      lineColor: props.lineColor,
      lineWidth: props.lineWidth,
      lineStyle: LineStyleType.solid,
      filled: false,
      background: "rgba(0, 0, 0, 0)"
    };
    this._polyLineRenderer.setData(polyConfig);
    this._renderer.append(this._polyLineRenderer);
    if (points.length >= 5) {
      let lineStart = pt2;
      let lineEnd = pt4;
      let extendLeft = false;
      let extendRight = false;
      if (intersectA) {
        lineStart = intersectA;
      } else {
        lineStart = pt2;
        extendLeft = true;
      }
      if (intersectB) {
        lineEnd = intersectB;
      } else {
        lineEnd = pt4;
        extendRight = true;
      }
      const neckline = {
        points: [lineStart, lineEnd],
        lineColor: props.lineColor,
        lineWidth: props.lineWidth,
        lineStyle: LineStyleType.dotted,
        extendLeft,
        extendRight,
        leftEnd: LineEnd.Normal,
        rightEnd: LineEnd.Normal
      };
      this._trendLineRenderer.setData(neckline);
      this._renderer.append(this._trendLineRenderer);
      const triangleFill = makeTriangleFill(pt2, pt3, pt4);
      this._triangleRendererPoints234.setData(triangleFill);
      this._renderer.append(this._triangleRendererPoints234);
    }
    if (intersectA) {
      const intersectionTriangle = makeTriangleFill(intersectA, pt1, pt2);
      this._intersect1Renderer.setData(intersectionTriangle);
      this._renderer.append(this._intersect1Renderer);
    }
    if (intersectB) {
      const intersectionTriangle = makeTriangleFill(pt4, pt5, intersectB);
      this._intersect2Renderer.setData(intersectionTriangle);
      this._renderer.append(this._intersect2Renderer);
    }
    if (points.length >= 2) {
      const labelLeft = makeLabelConfig(pt1, "Left Shoulder");
      labelLeft.vertAlign = pt1.y < pt0.y ? VerticalAlign.Bottom : VerticalAlign.Top;
      labelLeft.offsetY = 5;
      this._leftShoulderLabelRenderer.setData(labelLeft);
      this._renderer.append(this._leftShoulderLabelRenderer);
    }
    if (points.length >= 4) {
      const labelHead = makeLabelConfig(pt3, "Head");
      labelHead.vertAlign = pt3.y < pt2.y ? VerticalAlign.Bottom : VerticalAlign.Top;
      labelHead.offsetY = 5;
      this._headLabelRenderer.setData(labelHead);
      this._renderer.append(this._headLabelRenderer);
    }
    if (points.length >= 6) {
      const labelRight = makeLabelConfig(pt5, "Right Shoulder");
      labelRight.vertAlign = pt5.y < pt4.y ? VerticalAlign.Bottom : VerticalAlign.Top;
      labelRight.offsetY = 5;
      this._rightShoulderLabelRenderer.setData(labelRight);
      this._renderer.append(this._rightShoulderLabelRenderer);
    }
    this.addAnchors(this._renderer);
  }
}
class PatternHeadAndShouldersPrimitive extends ToolPrimitive {
  constructor() {
    super(...arguments);
    __publicField(this, "_lines", new PatternHeadAndShouldersPaneView(
      this,
      this.model
    ));
    __publicField(this, "_paneView", [this._lines]);
    __publicField(this, "_priceAxisPaneViews", [new PriceRangeAxisPaneView(/* @__PURE__ */ Object.create(null))]);
    __publicField(this, "_timeAxisPaneViews", [new TimeRangeAxisPaneView(/* @__PURE__ */ Object.create(null))]);
    __publicField(this, "_timeAxisViews", [
      new TimeLabelTimeAxisView(/* @__PURE__ */ Object.create(null)),
      new TimeLabelTimeAxisView(/* @__PURE__ */ Object.create(null)),
      new TimeLabelTimeAxisView(/* @__PURE__ */ Object.create(null)),
      new TimeLabelTimeAxisView(/* @__PURE__ */ Object.create(null)),
      new TimeLabelTimeAxisView(/* @__PURE__ */ Object.create(null)),
      new TimeLabelTimeAxisView(/* @__PURE__ */ Object.create(null)),
      new TimeLabelTimeAxisView(/* @__PURE__ */ Object.create(null))
    ]);
    __publicField(this, "_priceAxisViews", [
      new PriceLabelPriceAxisView(/* @__PURE__ */ Object.create(null)),
      new PriceLabelPriceAxisView(/* @__PURE__ */ Object.create(null)),
      new PriceLabelPriceAxisView(/* @__PURE__ */ Object.create(null)),
      new PriceLabelPriceAxisView(/* @__PURE__ */ Object.create(null)),
      new PriceLabelPriceAxisView(/* @__PURE__ */ Object.create(null)),
      new PriceLabelPriceAxisView(/* @__PURE__ */ Object.create(null)),
      new PriceLabelPriceAxisView(/* @__PURE__ */ Object.create(null))
    ]);
  }
  pointsCount() {
    return 7;
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
    this._lines.update({
      points
    });
  }
}
class PatternHeadAndShouldersTool extends DrawingTool {
  constructor() {
    super(...arguments);
    __publicField(this, "type", PatternHeadAndShouldersToolType);
  }
  createPrimitive() {
    return new PatternHeadAndShouldersPrimitive(
      {
        id: this.id,
        points: [],
        lineColor: "#089981FF",
        lineWidth: 2,
        fillBackground: true,
        background: getLightenRGBA("#089981FF", 0.15),
        textColor: "#ffffff",
        textFontSize: 12,
        leftText: this.chartService.invokeWithinContext((accessor) => {
          return accessor.get(IIntlService).t("tool.headAndShoulders.left");
        }),
        headText: this.chartService.invokeWithinContext((accessor) => {
          return accessor.get(IIntlService).t("tool.headAndShoulders.head");
        }),
        rightText: this.chartService.invokeWithinContext((accessor) => {
          return accessor.get(IIntlService).t("tool.headAndShoulders.right");
        })
      },
      ...this.resetArgs
    );
  }
}
export {
  PatternHeadAndShouldersTool
};
