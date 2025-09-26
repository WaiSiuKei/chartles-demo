var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { T as ToolPaneView, a as ToolPrimitive, D as DrawingTool } from "./toolPaneView-3wj_on-u.js";
import { O as GannSquareFixedToolType } from "./index-TSHQCVD9.js";
import { A as AnchorPoint, bN as LineEnd, L as LineStyleType, u as Point, e as ensure } from "./index-NZHt9VGv.js";
import { P as PriceLabelPriceAxisView } from "./priceLabelPriceAxisView-d9Maj5lR.js";
import { T as TimeLabelTimeAxisView } from "./timeLabelTimeAxisView-BvW_UnA0.js";
import { P as PriceRangeAxisPaneView, T as TimeRangeAxisPaneView } from "./axisPaneView-Pbgdotf1.js";
import { C as CompositeRenderer } from "./composite-tvPrNHN0.js";
import { L as LineRenderer } from "./line-DFhYRKvt.js";
import { G as GannArcRenderer } from "./gannArc-CwoUiOLb.js";
import "./baseTool-CHlzZht2.js";
class GannSquareFixedPaneView extends ToolPaneView {
  constructor() {
    super(...arguments);
    __publicField(this, "_verticalLevelsRenderers", /* @__PURE__ */ new Map());
    __publicField(this, "_horizontalLevelsRenderers", /* @__PURE__ */ new Map());
    __publicField(this, "_fanRenderers", /* @__PURE__ */ new Map());
    __publicField(this, "_arcRenderers", /* @__PURE__ */ new Map());
    __publicField(this, "_renderer", new CompositeRenderer(this._hitTestCollector));
  }
  getVerticalLevelRenderer(idx) {
    let r = this._verticalLevelsRenderers.get(idx);
    if (!r) {
      r = new LineRenderer();
      this._verticalLevelsRenderers.set(idx, r);
    }
    return r;
  }
  getHorizontalLevelRenderer(idx) {
    let r = this._horizontalLevelsRenderers.get(idx);
    if (!r) {
      r = new LineRenderer();
      this._horizontalLevelsRenderers.set(idx, r);
    }
    return r;
  }
  getFanRenderer(idx) {
    let r = this._fanRenderers.get(idx);
    if (!r) {
      r = new LineRenderer();
      this._fanRenderers.set(idx, r);
    }
    return r;
  }
  getArcRenderer(idx) {
    let r = this._arcRenderers.get(idx);
    if (!r) {
      r = new GannArcRenderer();
      this._arcRenderers.set(idx, r);
    }
    return r;
  }
  renderer() {
    return this._renderer;
  }
  _updateImpl() {
    this._renderer.clear();
    const logicalPoints = this.points().slice();
    const screenPoints = this._data.screenPoints;
    if (logicalPoints.length < 2 || screenPoints.length < 2) return;
    const [sp0, sp1] = screenPoints;
    logicalPoints[1] = new AnchorPoint(sp0, { pointIndex: 1 });
    logicalPoints[2] = new AnchorPoint(sp1, { pointIndex: 2 });
    const p0 = logicalPoints[0];
    const p2 = logicalPoints.length === 3 ? logicalPoints[2] : logicalPoints[1];
    const deltaX = p2.x - p0.x;
    const deltaY = p2.y - p0.y;
    const context = {
      barsCoordsRange: deltaX,
      priceCoordsRange: deltaY,
      startPoint: p0,
      endPoint: p2,
      p1: p0,
      p2
    };
    this._prepareLevels(context);
    this._prepareFanLines(context);
    this._prepareArcs(context);
    const anchorPoints = [p0, logicalPoints[1]];
    if (this._model.currentCreating === this._source) {
      anchorPoints.pop();
    }
    this._renderer.append(
      this.createLineAnchor(
        {
          points: anchorPoints
        },
        0
      )
    );
  }
  /**
   * 绘制纵向和横向等分线。
   */
  _prepareLevels(ctx) {
    const { startPoint, endPoint, barsCoordsRange, priceCoordsRange } = ctx;
    const levels = this._source.properties().levels;
    levels.forEach((level, index) => {
      if (!level.visible) return;
      const ratio = index / 5;
      const verticalX = startPoint.x + ratio * barsCoordsRange;
      const vLine = {
        points: [new Point(verticalX, startPoint.y), new Point(verticalX, endPoint.y)],
        lineColor: level.color,
        lineWidth: level.width,
        lineStyle: LineStyleType.solid,
        extendLeft: false,
        extendRight: false,
        leftEnd: LineEnd.Normal,
        rightEnd: LineEnd.Normal
      };
      const vRenderer = this.getVerticalLevelRenderer(index);
      vRenderer.setData(vLine);
      this._renderer.append(vRenderer);
      const horizontalY = startPoint.y + ratio * priceCoordsRange;
      const hLine = {
        points: [new Point(startPoint.x, horizontalY), new Point(endPoint.x, horizontalY)],
        lineColor: level.color,
        lineWidth: level.width,
        lineStyle: LineStyleType.solid,
        extendLeft: false,
        extendRight: false,
        leftEnd: LineEnd.Normal,
        rightEnd: LineEnd.Normal
      };
      const hRenderer = this.getHorizontalLevelRenderer(index);
      hRenderer.setData(hLine);
      this._renderer.append(hRenderer);
    });
  }
  /**
   * 绘制放射扇形（从起点以不同斜率往右下发散）
   */
  _prepareFanLines(ctx) {
    const { p1, startPoint, endPoint, barsCoordsRange, priceCoordsRange } = ctx;
    this._source.properties().fanlines.forEach((fan, index) => {
      if (!fan.visible) return;
      const dx = fan.x;
      const dy = fan.y;
      let endX;
      let endY;
      if (dx > dy) {
        endX = endPoint.x;
        endY = startPoint.y + dy / dx * priceCoordsRange;
      } else {
        endY = endPoint.y;
        endX = startPoint.x + dx / dy * barsCoordsRange;
      }
      const lineData = {
        points: [p1, new Point(endX, endY)],
        lineColor: fan.color,
        lineWidth: fan.width,
        lineStyle: LineStyleType.solid,
        extendLeft: false,
        extendRight: false,
        leftEnd: LineEnd.Normal,
        rightEnd: LineEnd.Normal
      };
      const fanRenderer = this.getFanRenderer(index);
      fanRenderer.setData(lineData);
      this._renderer.append(fanRenderer);
    });
  }
  /**
   * 用于绘制 Fibonacci Arc 等从起点 n 到不同半径 r 的扇形弧线
   */
  _prepareArcs(ctx) {
    const { p1, startPoint, endPoint, barsCoordsRange, priceCoordsRange } = ctx;
    let prevPoint = p1;
    const fillBackground = this._source.properties().arcsBackground.fillBackground;
    const transparency = this._source.properties().arcsBackground.transparency;
    this._source.properties().arcs.forEach((arc, index) => {
      if (!arc.visible) return;
      const relX = arc.x / 5;
      const relY = arc.y / 5;
      const arcX = startPoint.x + relX * barsCoordsRange;
      const arcY = startPoint.y + relY * priceCoordsRange;
      const arcData = {
        center: startPoint,
        point: new Point(arcX, arcY),
        // 外圆边缘
        edge: endPoint,
        color: arc.color,
        linewidth: arc.width,
        fillBack: fillBackground,
        transparency,
        prevPoint
      };
      const arcRenderer = this.getArcRenderer(index);
      arcRenderer.setData(arcData);
      this._renderer.append(arcRenderer);
      prevPoint = arcData.point;
    });
  }
}
class GannSquareFixedPrimitive extends ToolPrimitive {
  constructor() {
    super(...arguments);
    __publicField(this, "_lines", new GannSquareFixedPaneView(this, this.model));
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
  /**
   * 计算第一个点 → 第二个点的屏幕方向角度（以 X 轴正方向为 0，逆时针旋转）
   *
   * @returns 弧度角（radian ∈ [-π, π]），若无法计算则返回 null
   */
  _calcAngle() {
    const points = this.controlPoints;
    if (points.length < 2) return null;
    const [p0, p1] = points;
    const screenP0 = this.pointToScreenPoint(p0);
    const screenP1 = this.pointToScreenPoint(p1);
    if (screenP0 === null || screenP1 === null) return null;
    let vector = screenP1.subtract(screenP0);
    if (vector.length() <= 0) return null;
    vector = vector.normalized();
    let angle = Math.acos(vector.x);
    if (vector.y > 0) {
      angle = -angle;
    }
    return angle;
  }
  getScreenPoints() {
    const points = this.controlPoints;
    if (points.length < 2) return [];
    const angle = this._calcAngle();
    if (angle === null) return [];
    const [p0, p1] = points;
    const screenP0 = ensure(this.pointToScreenPoint(p0));
    const screenP1 = ensure(this.pointToScreenPoint(p1));
    const distance = Math.sqrt(
      Math.pow(screenP0.x - screenP1.x, 2) + Math.pow(screenP0.y - screenP1.y, 2)
    );
    const directionVec = new Point(Math.cos(angle), -Math.sin(angle));
    const normalized = directionVec.normalized();
    const xSign = normalized.x < 0 ? -1 : 1;
    const ySign = normalized.y < 0 ? -1 : 1;
    return [
      screenP0.addScaled(directionVec, distance),
      // 第一点：真实延伸终点
      screenP0.add(new Point(5 * distance * xSign, 5 * distance * ySign))
      // 第二点：辅助点
    ];
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
      points,
      screenPoints: this.getScreenPoints()
    });
  }
}
class GannSquareFixedTool extends DrawingTool {
  constructor() {
    super(...arguments);
    __publicField(this, "type", GannSquareFixedToolType);
  }
  createPrimitive() {
    return new GannSquareFixedPrimitive(
      {
        id: this.id,
        points: [],
        fillBackground: false,
        arcsBackground: {
          fillBackground: true,
          transparency: 80
        },
        reverse: false,
        levels: [
          {
            color: "#808080",
            width: 2,
            visible: true
          },
          {
            color: "#FF9800",
            width: 2,
            visible: true
          },
          {
            color: "#00bcd4",
            width: 2,
            visible: true
          },
          {
            color: "#4caf50",
            width: 2,
            visible: true
          },
          {
            color: "#089981",
            width: 2,
            visible: true
          },
          {
            color: "#808080",
            width: 2,
            visible: true
          }
        ],
        fanlines: [
          {
            color: "#B39DDB",
            visible: false,
            width: 2,
            x: 8,
            y: 1
          },
          {
            color: "#F23645",
            visible: false,
            width: 2,
            x: 5,
            y: 1
          },
          {
            color: "#808080",
            visible: false,
            width: 2,
            x: 4,
            y: 1
          },
          {
            color: "#FF9800",
            visible: false,
            width: 2,
            x: 3,
            y: 1
          },
          {
            color: "#00bcd4",
            visible: true,
            width: 2,
            x: 2,
            y: 1
          },
          {
            color: "#4caf50",
            visible: true,
            width: 2,
            x: 1,
            y: 1
          },
          {
            color: "#089981",
            visible: true,
            width: 2,
            x: 1,
            y: 2
          },
          {
            color: "#089981",
            visible: false,
            width: 2,
            x: 1,
            y: 3
          },
          {
            color: "#2962FF",
            visible: false,
            width: 2,
            x: 1,
            y: 4
          },
          {
            color: "#9575cd",
            visible: false,
            width: 2,
            x: 1,
            y: 5
          },
          {
            color: "#B39DDB",
            visible: false,
            width: 2,
            x: 1,
            y: 8
          }
        ],
        arcs: [
          {
            color: "#FF9800",
            visible: true,
            width: 2,
            x: 1,
            y: 0
          },
          {
            color: "#FF9800",
            visible: true,
            width: 2,
            x: 1,
            y: 1
          },
          {
            color: "#FF9800",
            visible: true,
            width: 2,
            x: 1.5,
            y: 0
          },
          {
            color: "#00bcd4",
            visible: true,
            width: 2,
            x: 2,
            y: 0
          },
          {
            color: "#00bcd4",
            visible: true,
            width: 2,
            x: 2,
            y: 1
          },
          {
            color: "#4caf50",
            visible: true,
            width: 2,
            x: 3,
            y: 0
          },
          {
            color: "#4caf50",
            visible: true,
            width: 2,
            x: 3,
            y: 1
          },
          {
            color: "#089981",
            visible: true,
            width: 2,
            x: 4,
            y: 0
          },
          {
            color: "#089981",
            visible: true,
            width: 2,
            x: 4,
            y: 1
          },
          {
            color: "#2962FF",
            visible: true,
            width: 2,
            x: 5,
            y: 0
          },
          {
            color: "#2962FF",
            visible: true,
            width: 2,
            x: 5,
            y: 1
          }
        ]
      },
      ...this.resetArgs
    );
  }
}
export {
  GannSquareFixedTool
};
