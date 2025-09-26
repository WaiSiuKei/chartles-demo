var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { bJ as MediaCoordinatesPaneRenderer, u as Point, b3 as setLineStyle, bM as generateColor, cp as sign, y as HitTestResult, z as HitTarget, bN as LineEnd, A as AnchorPoint, L as LineStyleType } from "./index-DSkroicZ.js";
import { a as ToolPrimitive, D as DrawingTool } from "./toolPaneView-BAEHHn7m.js";
import { s as FibCirclesToolType } from "./index-DNbtFiKr.js";
import { P as PriceLabelPriceAxisView } from "./priceLabelPriceAxisView-d9Maj5lR.js";
import { T as TimeLabelTimeAxisView } from "./timeLabelTimeAxisView-BvW_UnA0.js";
import { P as PriceRangeAxisPaneView, T as TimeRangeAxisPaneView } from "./axisPaneView-Pbgdotf1.js";
import { H as HorizontalAlign, V as VerticalAlign } from "./text-DNYLW3w-.js";
import { C as CompositeRenderer } from "./composite-BOGQNAfc.js";
import { L as LineRenderer } from "./line-CuaAD_DW.js";
import { F as FibWIthLabelsPaneView } from "./paneView-C9pa4pz3.js";
import "./baseTool-BVX9dcKc.js";
import "./text-FiPV6-V4.js";
import "./ctx-DYUP60aL.js";
import "./formatter-Drv30PyG.js";
import "./numericFormatter-6U8WkLAS.js";
class EllipseRendererSimple extends MediaCoordinatesPaneRenderer {
  /**
  
     判断鼠标是否命中当前椭圆路径或填充区域
     */
  hitTest(position) {
    var _a;
    if (!this._data) return null;
    if (((_a = this._data) == null ? void 0 : _a.points.length) < 2) return null;
    const point1 = this._data.points[0];
    const point2 = this._data.points[1];
    const halfWidth = 0.5 * Math.abs(point1.x - point2.x);
    const width = Math.abs(point1.x - point2.x);
    const height = Math.abs(point1.y - point2.y);
    if (width < 1 || height < 1) return null;
    const center = point1.add(point2).scaled(0.5);
    let transformed = position.subtract(center);
    const slope = (point2.y - point1.y) / (point2.x - point1.x);
    transformed = new Point(transformed.x, transformed.y / slope);
    let ellipseHit = transformed.x * transformed.x + transformed.y * transformed.y - halfWidth * halfWidth;
    ellipseHit = sign(ellipseHit) * Math.sqrt(Math.abs(ellipseHit / halfWidth));
    if (Math.abs(ellipseHit) < 3) {
      return this._hitTest;
    }
    if (this._data.fillBackground && !this._data.noHitTestOnBackground && ellipseHit < 3) {
      return this._backgroundHitTest;
    }
    return null;
  }
  /**
  
     具体的绘制逻辑
     */
  drawImpl(renderingContext) {
    if (!this._data) return;
    const ctx = renderingContext.context;
    ctx.lineCap = "butt";
    ctx.strokeStyle = this._data.color;
    ctx.lineWidth = this._data.linewidth;
    if (this._data.linestyle !== void 0) {
      setLineStyle(ctx, this._data.linestyle);
    }
    const point1 = this._data.points[0];
    const point2 = this._data.points[1];
    const width = Math.abs(point1.x - point2.x);
    const height = Math.abs(point1.y - point2.y);
    if (width < 1 || height < 1) return;
    const center = point1.add(point2).scaled(0.5);
    let innerRadius = 0;
    if (this._data.wholePoints) {
      const [innerPoint1, innerPoint2] = this._data.wholePoints;
      innerRadius = Math.abs(innerPoint1.x - innerPoint2.x);
    }
    ctx.save();
    ctx.translate(center.x, center.y);
    ctx.scale(1, height / width);
    ctx.beginPath();
    ctx.arc(0, 0, width / 2, 0, 2 * Math.PI, false);
    ctx.restore();
    ctx.stroke();
    if (this._data.fillBackground) {
      if (this._data.wholePoints) {
        ctx.translate(center.x, center.y);
        ctx.scale(1, height / width);
        ctx.arc(0, 0, innerRadius / 2, 0, 2 * Math.PI, true);
      }
      ctx.fillStyle = generateColor(this._data.backcolor, this._data.transparency, true);
      ctx.fill();
    }
  }
}
class FibCirclesPaneView extends FibWIthLabelsPaneView {
  constructor() {
    super(...arguments);
    __publicField(this, "_trendLineRenderer", new LineRenderer());
    __publicField(this, "_renderer", new CompositeRenderer(this._hitTestCollector));
  }
  renderer() {
    return this._renderer;
  }
  _updateImpl() {
    this._renderer.clear();
    const points = this.points();
    if ((points == null ? void 0 : points.length) < 2) return;
    const [startPoint, endPoint] = points;
    const midpoint = startPoint.add(endPoint).scaled(0.5);
    const width = Math.abs(endPoint.x - startPoint.x);
    const height = Math.abs(endPoint.y - startPoint.y);
    const ellipseLevels = [];
    const properties = this._source.properties();
    properties.levels.forEach((level, index) => {
      const coeff = level.coeff;
      const color = level.color;
      const ellipsePoints = [
        new Point(midpoint.x - 0.5 * width * coeff, midpoint.y - 0.5 * height * coeff),
        // top-left
        new Point(midpoint.x + 0.5 * width * coeff, midpoint.y + 0.5 * height * coeff)
        // bottom-right
      ];
      const labelPoint = new Point(midpoint.x, midpoint.y + 0.5 * height * coeff);
      ellipseLevels.push({
        color,
        points: ellipsePoints,
        labelPoint,
        linewidth: level.linewidth,
        linestyle: level.linestyle,
        index,
        coeff: level.coeff
      });
    });
    const fillBackground = properties.fillBackground;
    const transparency = properties.transparency;
    for (let i = 0; i < ellipseLevels.length; i++) {
      const level = ellipseLevels[i];
      const ellipseRenderer = new EllipseRendererSimple({
        points: level.points,
        color: level.color,
        linewidth: level.linewidth,
        backcolor: level.color,
        wholePoints: i > 0 ? ellipseLevels[i - 1].points : void 0,
        fillBackground,
        transparency
      });
      ellipseRenderer.setHitTest(new HitTestResult(HitTarget.MovePoint));
      this._renderer.append(ellipseRenderer);
      const labelRenderer = this._updateLabelForLevel({
        levelIndex: level.index,
        coeff: level.coeff,
        color: level.color,
        price: "",
        // 椭圆无价格定位，仅标记
        vertAlign: VerticalAlign.Middle,
        horzAlign: HorizontalAlign.Left,
        leftPoint: level.labelPoint,
        rightPoint: level.labelPoint
      });
      if (labelRenderer !== null) {
        this._renderer.append(labelRenderer);
      }
    }
    const trendLineProps = properties.trendline;
    if (trendLineProps.visible) {
      this._trendLineRenderer.setData({
        points: [startPoint, endPoint],
        lineColor: trendLineProps.color,
        lineWidth: trendLineProps.linewidth,
        lineStyle: trendLineProps.linestyle,
        extendLeft: false,
        extendRight: false,
        leftEnd: LineEnd.Normal,
        rightEnd: LineEnd.Normal
      });
      this._renderer.append(this._trendLineRenderer);
    }
    this.addAnchors(this._renderer);
  }
}
class FibCirclesPrimitive extends ToolPrimitive {
  constructor() {
    super(...arguments);
    __publicField(this, "_lines", new FibCirclesPaneView(this, this.model));
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
class FibCirclesTool extends DrawingTool {
  constructor() {
    super(...arguments);
    __publicField(this, "type", FibCirclesToolType);
  }
  createPrimitive() {
    return new FibCirclesPrimitive(
      {
        id: this.id,
        points: [],
        levels: [
          {
            coeff: 0.236,
            color: "#F23645",
            linestyle: LineStyleType.solid,
            linewidth: 2
          },
          {
            coeff: 0.382,
            color: "#FF9800",
            linestyle: LineStyleType.solid,
            linewidth: 2
          },
          {
            coeff: 0.5,
            color: "#4CAF50",
            linestyle: LineStyleType.solid,
            linewidth: 2
          },
          {
            coeff: 0.618,
            color: "#089981",
            linestyle: LineStyleType.solid,
            linewidth: 2
          },
          {
            coeff: 0.786,
            color: "#00BCD4",
            linestyle: LineStyleType.solid,
            linewidth: 2
          },
          {
            coeff: 1,
            color: "#808080",
            linestyle: LineStyleType.solid,
            linewidth: 2
          },
          {
            coeff: 1.618,
            color: "#2962FF",
            linestyle: LineStyleType.solid,
            linewidth: 2
          },
          {
            coeff: 2.618,
            color: "#E91E63",
            linestyle: LineStyleType.solid,
            linewidth: 2
          },
          {
            coeff: 3.618,
            color: "#2962FF",
            linestyle: LineStyleType.solid,
            linewidth: 2
          },
          {
            coeff: 4.236,
            color: "#E91E63",
            linestyle: LineStyleType.solid,
            linewidth: 2
          },
          {
            coeff: 4.618,
            color: "#F23645",
            linestyle: LineStyleType.solid,
            linewidth: 2
          }
        ],
        transparency: 80,
        fillBackground: true,
        showCoeffs: true,
        coeffsAsPercents: false,
        trendline: {
          visible: true,
          color: "#808080",
          linewidth: 2,
          linestyle: LineStyleType.dashed
        }
      },
      ...this.resetArgs
    );
  }
}
export {
  FibCirclesTool
};
