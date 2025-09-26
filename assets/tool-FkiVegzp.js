var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { T as ToolPaneView, a as ToolPrimitive, D as DrawingTool } from "./toolPaneView-3wj_on-u.js";
import { N as GannSquareToolType } from "./index-TSHQCVD9.js";
import { bN as LineEnd, L as LineStyleType, u as Point, r as ChartFontFamily, s as should, cq as vi, e as ensure, A as AnchorPoint } from "./index-NZHt9VGv.js";
import { N as NumericFormatter } from "./numericFormatter-Dh0kn-kp.js";
import { P as PriceLabelPriceAxisView } from "./priceLabelPriceAxisView-d9Maj5lR.js";
import { T as TimeLabelTimeAxisView } from "./timeLabelTimeAxisView-BvW_UnA0.js";
import { P as PriceRangeAxisPaneView, T as TimeRangeAxisPaneView } from "./axisPaneView-Pbgdotf1.js";
import { B as BaseTextRenderer, H as HorizontalAlign, V as VerticalAlign } from "./text-CtvZov1L.js";
import { f as forceLTRStr } from "./text-8RrTwjoh.js";
import { C as CompositeRenderer } from "./composite-tvPrNHN0.js";
import { L as LineRenderer } from "./line-DFhYRKvt.js";
import { G as GannArcRenderer } from "./gannArc-CwoUiOLb.js";
import "./baseTool-CHlzZht2.js";
import "./ctx-Bv0u81rl.js";
class LimitedPrecisionNumericFormatter {
  constructor(precision, ignoreLocaleNumberFormat) {
    __publicField(this, "_precision");
    __publicField(this, "_numericFormatter");
    this._precision = precision ?? 1;
    this._numericFormatter = new NumericFormatter({
      precision: this._precision,
      ignoreLocaleNumberFormat
    });
  }
  format(value, opts) {
    const fixedStr = value.toFixed(this._precision);
    const minimal = Math.pow(10, -this._precision);
    const adjusted = Math.max(parseFloat(fixedStr), minimal);
    return this._numericFormatter.format(adjusted, opts);
  }
  parse(str, opts) {
    const result = this._numericFormatter.parse(str, opts);
    if (result.res) {
      return {
        res: true,
        value: result.value,
        suggest: this.format(result.value)
      };
    }
    return result;
  }
}
class GannSquarePaneView extends ToolPaneView {
  constructor() {
    super(...arguments);
    __publicField(this, "_verticalLevelsRenderers", /* @__PURE__ */ new Map());
    __publicField(this, "_horizontalLevelsRenderers", /* @__PURE__ */ new Map());
    __publicField(this, "_fanRenderers", /* @__PURE__ */ new Map());
    __publicField(this, "_arcRenderers", /* @__PURE__ */ new Map());
    __publicField(this, "_priceDiffTextRenderer", new BaseTextRenderer());
    __publicField(this, "_indexDiffTextRenderer", new BaseTextRenderer());
    __publicField(this, "_ratioTextRenderer", new BaseTextRenderer());
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
    const points = this.points();
    if (points.length < 2) {
      this.addAnchors(this._renderer);
      return;
    }
    let [p0, p1] = points;
    const props = this._source.properties();
    const reversed = props.reverse;
    if (reversed) {
      [p0, p1] = [p1, p0];
    }
    const deltaX = p1.x - p0.x;
    const deltaY = p1.y - p0.y;
    const startPoint = p0;
    const endPoint = p1;
    const context = {
      barsCoordsRange: deltaX,
      // 横向跨度（像素）
      priceCoordsRange: deltaY,
      // 纵向跨度（像素）
      startPoint,
      // 起点坐标
      endPoint,
      // 终点坐标
      p1: p0,
      // 原始点（可能后续 anchor 用）
      p2: p1,
      isLabelsVisible: props.showLabels,
      reversed
    };
    this._prepareLevels(context);
    this._prepareFanLines(context);
    this._prepareArcs(context);
    this._prepareLabels(context);
    const anchorPoints = [p0, p1];
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
  /**
   * 绘制三个文本标签：
   * 1. 价格差 label；
   * 2. bar 数差 label；
   * 3. 比例比 label；
   */
  _prepareLabels(ctx) {
    const { p1, p2, isLabelsVisible, reversed } = ctx;
    if (!isLabelsVisible) return;
    let priceDiff = this._data.priceDiff;
    let barDiff = this._data.barDiff;
    if (priceDiff == null || barDiff == null) return;
    if (reversed) {
      priceDiff = -priceDiff;
      barDiff = -barDiff;
    }
    const priceLabelPoint = new Point(p1.x, p2.y);
    const priceLabelText = forceLTRStr(this._data.priceDiffStr);
    const priceLabelData = this._getLabelData(priceLabelPoint, priceLabelText);
    priceLabelData.horzAlign = barDiff > 0 ? HorizontalAlign.Right : HorizontalAlign.Left;
    priceLabelData.vertAlign = priceDiff > 0 ? VerticalAlign.Bottom : VerticalAlign.Top;
    priceLabelData.offsetX = 10;
    priceLabelData.offsetY = priceDiff > 0 ? 8 : 10;
    priceLabelData.forceTextAlign = true;
    this._priceDiffTextRenderer.setData(priceLabelData);
    this._renderer.append(this._priceDiffTextRenderer);
    const barLabelPoint = new Point(p2.x, p1.y);
    const barText = forceLTRStr(barDiff.toString());
    const barLabelData = this._getLabelData(barLabelPoint, barText);
    barLabelData.horzAlign = barDiff > 0 ? HorizontalAlign.Left : HorizontalAlign.Right;
    barLabelData.vertAlign = priceDiff > 0 ? VerticalAlign.Top : VerticalAlign.Bottom;
    barLabelData.offsetX = 10;
    barLabelData.offsetY = priceDiff > 0 ? 10 : 8;
    barLabelData.forceTextAlign = true;
    this._indexDiffTextRenderer.setData(barLabelData);
    this._renderer.append(this._indexDiffTextRenderer);
    const ratio = this._data.scaleRatio;
    if (!ratio) return;
    const ratioText = forceLTRStr(this._data.scaleRatioStr);
    const ratioLabelData = this._getLabelData(p2, ratioText);
    ratioLabelData.horzAlign = barDiff > 0 ? HorizontalAlign.Left : HorizontalAlign.Right;
    ratioLabelData.vertAlign = priceDiff > 0 ? VerticalAlign.Bottom : VerticalAlign.Top;
    ratioLabelData.offsetX = 10;
    ratioLabelData.offsetY = priceDiff > 0 ? 8 : 10;
    ratioLabelData.forceTextAlign = true;
    this._ratioTextRenderer.setData(ratioLabelData);
    this._renderer.append(this._ratioTextRenderer);
  }
  _getLabelData(pos, text) {
    const style = this._source.properties().labelsStyle;
    const levels = this._source.properties().levels;
    return {
      points: [pos],
      text,
      fontFamily: ChartFontFamily,
      fontSize: style.fontSize,
      bold: style.bold,
      italic: style.italic,
      color: levels[levels.length - 1].color,
      backgroundColor: "transparent",
      horzAlign: HorizontalAlign.Center,
      vertAlign: VerticalAlign.Top,
      offsetX: 0,
      offsetY: 0,
      backgroundRoundRect: 4
    };
  }
}
class GannSquarePrimitive extends ToolPrimitive {
  constructor() {
    super(...arguments);
    __publicField(this, "_lines", new GannSquarePaneView(this, this.model));
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
    __publicField(this, "_scaleRatioFormatter", new LimitedPrecisionNumericFormatter(7));
    __publicField(this, "scaleRatio", null);
  }
  pointsCount() {
    return 2;
  }
  addPoint(point, step) {
    if (this.controlPoints.length > 1) {
      this.controlPoints.pop();
    }
    const resp = super.addPoint(point, step);
    should(this.series.priceScale().options().mode !== vi.Logarithmic);
    if (step === 1) {
      this.adjustEndPoint();
    }
    return resp;
  }
  setPoint(index, point, details) {
    super.setPoint(index, point, details);
    if (details.shiftkey) {
      this._correctPoint(index);
    } else {
      this._correctScaleRatio();
    }
  }
  _correctScaleRatio() {
    this.scaleRatio = this.getScaleRatio();
  }
  getPriceDiff() {
    const e = this.controlPoints;
    if (e.length < 2) return null;
    const [t, s] = e;
    return s.price - t.price;
  }
  getIndexDiff() {
    const e = this.controlPoints;
    if (e.length < 2) return null;
    const [t, s] = e;
    return ensure(this.chart.timeScale().timeToIndexEx(s.time)) - ensure(this.chart.timeScale().timeToIndexEx(t.time));
  }
  getScaleRatio() {
    const priceDiff = this.getPriceDiff();
    const indexDiff = this.getIndexDiff();
    if (priceDiff !== null && indexDiff !== null && indexDiff !== 0) {
      return Math.abs(priceDiff / indexDiff);
    }
    return null;
  }
  adjustEndPoint() {
    const [p0, p1] = this.controlPoints;
    const drawPoint0 = ensure(this.pointToScreenPoint(p0));
    const drawPoint1 = ensure(this.pointToScreenPoint(p1));
    const dx = Math.abs(drawPoint1.x - drawPoint0.x);
    if (drawPoint1.y > drawPoint0.y) {
      drawPoint1.y = drawPoint0.y + dx;
    } else if (drawPoint1.y < drawPoint0.y) {
      drawPoint1.y = drawPoint0.y - dx;
    } else {
      drawPoint1.y = drawPoint0.y;
    }
    p1.price = ensure(this.series.coordinateToPrice(drawPoint1.y));
  }
  isReversed() {
    return this._props.reverse;
  }
  _correctFirstPoint() {
    this._correctPoint(this.isReversed() ? 0 : 1);
  }
  /**
   * 校正指定点 index 为 e（0 或 1），使其与另一个点保持指定的 scaleRatio 比例。
   */
  _correctPoint(e) {
    if (this.controlPoints.length < 2) return;
    const barDiff = this.getIndexDiff();
    if (barDiff === null) return;
    const scaleRatio = this.scaleRatio;
    if (scaleRatio === null) return;
    const thisPoint = this.controlPoints[e];
    const otherPoint = this.controlPoints[e === 0 ? 1 : 0];
    const priceUp = thisPoint.price - otherPoint.price > 0;
    const indexRight = ensure(this.chart.timeScale().timeToIndexEx(thisPoint.time)) - ensure(this.chart.timeScale().timeToIndexEx(otherPoint.time)) > 0;
    let direction = priceUp && !indexRight || !priceUp && indexRight ? -1 : 1;
    if (e === 0) {
      direction = -direction;
    }
    thisPoint.price = otherPoint.price + direction * barDiff * scaleRatio;
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
    const priceDiff = this.getPriceDiff();
    const scaleRatio = this.getScaleRatio();
    this._lines.update({
      points,
      priceDiff,
      priceDiffStr: priceDiff ? this.series.priceFormatter().format(priceDiff) : "",
      barDiff: this.getIndexDiff(),
      scaleRatio,
      scaleRatioStr: scaleRatio ? this._scaleRatioFormatter.format(scaleRatio) : ""
    });
  }
}
class GannSquareTool extends DrawingTool {
  constructor() {
    super(...arguments);
    __publicField(this, "type", GannSquareToolType);
  }
  createPrimitive() {
    return new GannSquarePrimitive(
      {
        id: this.id,
        points: [],
        fillBackground: false,
        arcsBackground: {
          fillBackground: true,
          transparency: 80
        },
        reverse: false,
        showLabels: true,
        labelsStyle: {
          fontSize: 12,
          bold: false,
          italic: false
        },
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
  GannSquareTool
};
