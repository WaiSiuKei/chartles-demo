var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { y as HitTestResult, z as HitTarget, bN as LineEnd, bJ as MediaCoordinatesPaneRenderer, cp as sign, bM as generateColor, bQ as interactionTolerance, A as AnchorPoint, u as Point, L as LineStyleType } from "./index-NZHt9VGv.js";
import { a as ToolPrimitive, D as DrawingTool } from "./toolPaneView-3wj_on-u.js";
import { u as FibSpeedResistanceArcsToolType } from "./index-TSHQCVD9.js";
import { P as PriceLabelPriceAxisView } from "./priceLabelPriceAxisView-d9Maj5lR.js";
import { T as TimeLabelTimeAxisView } from "./timeLabelTimeAxisView-BvW_UnA0.js";
import { P as PriceRangeAxisPaneView, T as TimeRangeAxisPaneView } from "./axisPaneView-Pbgdotf1.js";
import { V as VerticalAlign, H as HorizontalAlign } from "./text-CtvZov1L.js";
import { C as CompositeRenderer } from "./composite-tvPrNHN0.js";
import { L as LineRenderer } from "./line-DFhYRKvt.js";
import { F as FibWIthLabelsPaneView } from "./paneView-CDEaluuO.js";
import "./baseTool-CHlzZht2.js";
import "./text-8RrTwjoh.js";
import "./ctx-Bv0u81rl.js";
import "./formatter-_n1ErJyi.js";
import "./numericFormatter-Dh0kn-kp.js";
class ArcRenderer extends MediaCoordinatesPaneRenderer {
  hitTest(point) {
    const data = this._data;
    if (data === null) return null;
    const pointDir = sign(point.y - data.center.y);
    if (pointDir !== data.dir && !data.fullCircles) return null;
    const distance = point.subtract(data.center).length();
    const tolerance = interactionTolerance().curve;
    if (Math.abs(distance - data.radius) < tolerance) {
      return this._hitTest;
    } else if (data.hittestOnBackground && Math.abs(distance) <= data.radius + tolerance) {
      return this._backgroundHitTest;
    }
    return null;
  }
  drawImpl(renderContext) {
    const data = this._data;
    if (!data) return;
    const ctx = renderContext.context;
    ctx.lineCap = "round";
    ctx.strokeStyle = data.color;
    ctx.lineWidth = data.linewidth;
    ctx.translate(data.center.x, data.center.y);
    ctx.beginPath();
    if (data.fullCircles) {
      ctx.arc(0, 0, data.radius, 0, 2 * Math.PI, false);
    } else if (data.dir > 0) {
      ctx.arc(0, 0, data.radius, 0, Math.PI, false);
    } else {
      ctx.arc(0, 0, data.radius, Math.PI, 0, false);
    }
    ctx.stroke();
    if (data.fillBackground) {
      if (data.radius2) {
        if (data.fullCircles) {
          ctx.arc(0, 0, data.radius2, 0, 2 * Math.PI, true);
        } else if (data.dir > 0) {
          ctx.arc(0, 0, data.radius2, Math.PI, 0, true);
        } else {
          ctx.arc(0, 0, data.radius2, 0, Math.PI, true);
        }
      }
      ctx.fillStyle = generateColor(data.color, data.transparency, true);
      ctx.fill();
    }
  }
}
class FibSpeedResistanceArcsPaneView extends FibWIthLabelsPaneView {
  constructor() {
    super(...arguments);
    __publicField(this, "_trendLineRenderer", new LineRenderer());
    __publicField(this, "_renderer", new CompositeRenderer(this._hitTestCollector));
  }
  renderer() {
    return this._renderer;
  }
  _updateImpl() {
    var _a;
    this._renderer.clear();
    const points = this.points();
    if ((points == null ? void 0 : points.length) < 2) return;
    const props = this._source.properties();
    const pointA = points[0];
    const pointB = points[1];
    const fillBackground = props.fillBackground;
    const transparency = props.transparency;
    const fullCircles = props.fullCircles;
    for (let i = 0; i < this._data.levels.length; i++) {
      const level = this._data.levels[i];
      const circleData = {
        center: pointA,
        color: props.levels[i].color,
        linewidth: props.levelsStyle.linewidth,
        radius: level.radius,
        dir: level.dir,
        transparency,
        fillBackground,
        hittestOnBackground: true,
        fullCircles,
        radius2: i > 0 ? (_a = this._data.levels[i - 1]) == null ? void 0 : _a.radius : void 0
        // 若为内部圆，用于绘制环形区域
      };
      const hitTest = new HitTestResult(HitTarget.MovePoint);
      const r = new ArcRenderer(circleData);
      r.setHitTest(hitTest);
      this._renderer.append(r);
      const labelRenderer = this._updateLabelForLevel({
        levelIndex: i,
        coeff: props.levels[i].coeff,
        leftPoint: level.labelPoint,
        rightPoint: level.labelPoint,
        price: "",
        color: props.levels[i].color,
        horzAlign: HorizontalAlign.Left,
        vertAlign: VerticalAlign.Middle
      });
      if (labelRenderer !== null) {
        this._renderer.append(labelRenderer);
      }
    }
    const trendProps = props.trendline;
    if (trendProps.visible) {
      const lineData = {
        points: [pointA, pointB],
        lineColor: trendProps.color,
        lineWidth: trendProps.linewidth,
        lineStyle: trendProps.linestyle,
        extendLeft: false,
        extendRight: false,
        leftEnd: LineEnd.Normal,
        rightEnd: LineEnd.Normal
      };
      this._trendLineRenderer.setData(lineData);
      this._renderer.append(this._trendLineRenderer);
    }
    this.addAnchors(this._renderer);
  }
}
class FibSpeedResistanceArcsPrimitive extends ToolPrimitive {
  constructor() {
    super(...arguments);
    __publicField(this, "_lines", new FibSpeedResistanceArcsPaneView(
      this,
      this.model
    ));
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
    let levels = [];
    if (points.length > 1) {
      const pointA = points[0];
      const pointB = points[1];
      const baseLength = pointA.subtract(pointB).length();
      levels = this._props.levels.reduce(
        (acc, level) => {
          if (!level.visible) return acc;
          const coeff = level.coeff;
          const radius = Math.abs(baseLength * coeff);
          const direction = sign(pointB.y - pointA.y);
          const labelPoint = new Point(pointA.x, pointA.y + direction * radius);
          acc.push({
            radius,
            dir: direction,
            labelPoint
          });
          return acc;
        },
        []
      );
    }
    this._lines.update({ points, levels });
  }
}
class FibSpeedResistanceArcsTool extends DrawingTool {
  constructor() {
    super(...arguments);
    __publicField(this, "type", FibSpeedResistanceArcsToolType);
  }
  createPrimitive() {
    return new FibSpeedResistanceArcsPrimitive(
      {
        id: this.id,
        points: [],
        showCoeffs: true,
        fillBackground: true,
        transparency: 80,
        fullCircles: false,
        trendline: {
          visible: true,
          color: "#808080",
          linewidth: 2,
          linestyle: LineStyleType.dashed
        },
        levelsStyle: { linewidth: 2, linestyle: LineStyleType.solid },
        levels: [
          {
            visible: true,
            coeff: 0.236,
            color: "#F23645"
          },
          {
            visible: true,
            coeff: 0.382,
            color: "#FF9800"
          },
          {
            visible: true,
            coeff: 0.5,
            color: "#4CAF50"
          },
          {
            visible: true,
            coeff: 0.618,
            color: "#089981"
          },
          {
            visible: true,
            coeff: 0.786,
            color: "#00BCD4"
          },
          {
            visible: true,
            coeff: 1,
            color: "#808080"
          },
          {
            visible: true,
            coeff: 1.618,
            color: "#2962FF"
          },
          {
            visible: true,
            coeff: 2.618,
            color: "#E91E63"
          },
          {
            visible: true,
            coeff: 3.618,
            color: "#2962FF"
          },
          {
            visible: true,
            coeff: 4.236,
            color: "#E91E63"
          },
          {
            visible: true,
            coeff: 4.618,
            color: "#F23645"
          }
        ]
      },
      ...this.resetArgs
    );
  }
}
export {
  FibSpeedResistanceArcsTool
};
