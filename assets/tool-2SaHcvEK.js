var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { A as AnchorPoint, bN as LineEnd, L as LineStyleType } from "./index-NZHt9VGv.js";
import { T as ToolPaneView, a as ToolPrimitive, D as DrawingTool } from "./toolPaneView-3wj_on-u.js";
import { ag as ProjectionToolType } from "./index-TSHQCVD9.js";
import { P as PriceLabelPriceAxisView } from "./priceLabelPriceAxisView-d9Maj5lR.js";
import { T as TimeLabelTimeAxisView } from "./timeLabelTimeAxisView-BvW_UnA0.js";
import { P as PriceRangeAxisPaneView, T as TimeRangeAxisPaneView } from "./axisPaneView-Pbgdotf1.js";
import { A as ArcWedgeRenderer, a as FibWedgePaneView, F as FibWedgePrimitive } from "./primitive-Cpd7e52D.js";
import { C as CompositeRenderer } from "./composite-tvPrNHN0.js";
import { L as LineRenderer } from "./line-DFhYRKvt.js";
import "./baseTool-CHlzZht2.js";
import "./text-CtvZov1L.js";
import "./text-8RrTwjoh.js";
import "./ctx-Bv0u81rl.js";
import "./paneView-CDEaluuO.js";
import "./formatter-_n1ErJyi.js";
import "./numericFormatter-Dh0kn-kp.js";
class ProjectionPaneView extends ToolPaneView {
  constructor() {
    super(...arguments);
    __publicField(this, "_arcWedgeRenderer", new ArcWedgeRenderer());
    __publicField(this, "_baseTrendRenderer", new LineRenderer());
    __publicField(this, "_edgeTrendRenderer", new LineRenderer());
    __publicField(this, "_renderer", new CompositeRenderer(this._hitTestCollector));
  }
  renderer() {
    return this._renderer;
  }
  _updateImpl() {
    FibWedgePaneView.prototype._updateImpl.call(this);
  }
  /**
   * 获取用于绘图的三个主点。
   * 若只有两个点，则返回当前 points。
   * 若存在第三点，需将其重新计算为从第一点出发、等长度的方向投影，并保留原索引。
   */
  _getPoints() {
    const points = this.points();
    if (points.length < 3) return points;
    const [centerPoint, radiusPoint, rawDirectionPoint] = points;
    const dirIndex = rawDirectionPoint.pointIndex;
    const radiusVectorLength = radiusPoint.subtract(centerPoint).length();
    const directionVector = rawDirectionPoint.subtract(centerPoint).normalized().scaled(radiusVectorLength);
    const projectedDirectionPoint = new AnchorPoint(centerPoint.add(directionVector), {
      pointIndex: dirIndex
    });
    return [centerPoint, radiusPoint, projectedDirectionPoint];
  }
  /**
   * 使用当前点与属性生成多个渲染器图层（线条、扇形等）。
   * @param angle1 起始角度（弧度）
   * @param angle2 结束角度（弧度）
   */
  _updateRenderer(angle1 = NaN, angle2 = NaN, levels = []) {
    const points = this.points();
    if (points.length < 2) return;
    const props = this._source.properties();
    const [centerPoint, radiusPoint, directionPoint] = this._getPoints();
    const color = props.trendline.color;
    const lineWidth = props.lineWidth;
    const lineStyle = props.trendline.linestyle;
    this._baseTrendRenderer.setData({
      points: [centerPoint, radiusPoint],
      lineColor: color,
      lineWidth,
      lineStyle,
      extendLeft: false,
      extendRight: false,
      leftEnd: LineEnd.Normal,
      rightEnd: LineEnd.Normal
    });
    this._renderer.append(this._baseTrendRenderer);
    if (points.length < 3) {
      this.addAnchors(this._renderer);
      return;
    }
    this._edgeTrendRenderer.setData({
      points: [centerPoint, directionPoint],
      lineColor: color,
      lineWidth,
      lineStyle,
      extendLeft: false,
      extendRight: false,
      leftEnd: LineEnd.Normal,
      rightEnd: LineEnd.Normal
    });
    this._renderer.append(this._edgeTrendRenderer);
    const levelData = levels[0];
    this._arcWedgeRenderer.setData({
      center: centerPoint,
      radius: levelData.radius,
      prevRadius: 0,
      color,
      color1: props.color0,
      color2: props.color1,
      linewidth: lineWidth,
      angle1,
      angle2,
      p1: levelData.p1,
      p2: levelData.p2,
      fillBackground: props.fillBackground,
      transparency: props.transparency,
      gradient: true
      // 启用 radial 渐变两色填充
    });
    this._renderer.append(this._arcWedgeRenderer);
    this.addAnchors(this._renderer);
  }
}
class ProjectionPrimitive extends ToolPrimitive {
  constructor() {
    super(...arguments);
    __publicField(this, "_lines", new ProjectionPaneView(this, this.model));
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
  setPoint(index, point, details) {
    FibWedgePrimitive.prototype.setPoint.call(this, index, point, details);
  }
  addPoint(point, step) {
    return FibWedgePrimitive.prototype.addPoint.call(this, point, step);
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
class ProjectionTool extends DrawingTool {
  constructor() {
    super(...arguments);
    __publicField(this, "type", ProjectionToolType);
  }
  createPrimitive() {
    return new ProjectionPrimitive(
      {
        id: this.id,
        points: [],
        showCoeffs: true,
        fillBackground: true,
        transparency: 80,
        color0: "#2962FF",
        color1: "#9C27B0",
        lineWidth: 2,
        trendline: { visible: true, color: "#9C9C9C", linestyle: LineStyleType.solid },
        levelsStyle: { linewidth: 2, linestyle: LineStyleType.solid },
        levels: [
          {
            coeff: 1,
            color: "#808080"
          }
        ]
      },
      ...this.resetArgs
    );
  }
}
export {
  ProjectionTool
};
