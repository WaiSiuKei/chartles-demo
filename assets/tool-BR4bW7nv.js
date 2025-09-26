var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { u as Point, bN as LineEnd, r as ChartFontFamily, A as AnchorPoint, e as ensure, L as LineStyleType } from "./index-NZHt9VGv.js";
import { T as ToolPaneView, a as ToolPrimitive, D as DrawingTool } from "./toolPaneView-3wj_on-u.js";
import { J as GannBoxToolType } from "./index-TSHQCVD9.js";
import { P as PriceLabelPriceAxisView } from "./priceLabelPriceAxisView-d9Maj5lR.js";
import { T as TimeLabelTimeAxisView } from "./timeLabelTimeAxisView-BvW_UnA0.js";
import { P as PriceRangeAxisPaneView, T as TimeRangeAxisPaneView } from "./axisPaneView-Pbgdotf1.js";
import { B as BaseTextRenderer, V as VerticalAlign, H as HorizontalAlign } from "./text-CtvZov1L.js";
import { b as getNumericFormatter } from "./formatter-_n1ErJyi.js";
import { C as CompositeRenderer } from "./composite-tvPrNHN0.js";
import { L as LineRenderer } from "./line-DFhYRKvt.js";
import { R as RectangleRenderer } from "./rectangle-CfXWJsDB.js";
import "./baseTool-CHlzZht2.js";
import "./text-8RrTwjoh.js";
import "./ctx-Bv0u81rl.js";
import "./numericFormatter-Dh0kn-kp.js";
class GannBoxPaneView extends ToolPaneView {
  constructor() {
    super(...arguments);
    __publicField(this, "_renderer", new CompositeRenderer(this._hitTestCollector));
    __publicField(this, "_leftTextRenderers", /* @__PURE__ */ new Map());
    __publicField(this, "_rightTextRenderers", /* @__PURE__ */ new Map());
    __publicField(this, "_topTextRenderers", /* @__PURE__ */ new Map());
    __publicField(this, "_bottomTextRenderers", /* @__PURE__ */ new Map());
  }
  getTextRenderers(key, idx) {
    const map = {
      left: this._leftTextRenderers,
      right: this._rightTextRenderers,
      top: this._topTextRenderers,
      bottom: this._bottomTextRenderers
    };
    let r = map[key].get(idx);
    if (!r) {
      r = new BaseTextRenderer();
      map[key].set(idx, r);
    }
    return r;
  }
  renderer() {
    return this._renderer;
  }
  _updateImpl() {
    this._renderer.clear();
    const points = this.points();
    if ((points == null ? void 0 : points.length) < 2) return;
    const props = this._source.properties();
    if (points.length < 2) {
      this.addAnchors(this._renderer);
      return;
    }
    const p0 = points[0];
    const p1 = points[1];
    const left = Math.min(p0.x, p1.x);
    const top = Math.min(p0.y, p1.y);
    const right = Math.max(p0.x, p1.x);
    const bottom = Math.max(p0.y, p1.y);
    const fillHorz = props.fillHorzBackground;
    const horzTransp = props.horzTransparency;
    const fillVert = props.fillVertBackground;
    const vertTransp = props.vertTransparency;
    const formatter = getNumericFormatter();
    for (let i = 0; i < props.hLevels.length; i++) {
      if (i > 0 && fillHorz) {
        const fillRect = new RectangleRenderer();
        fillRect.setData({
          points: [
            new Point(left, this._data.hLevels[i].y),
            new Point(right, this._data.hLevels[i - 1].y)
          ],
          color: props.hLevels[i].color,
          backColor: props.hLevels[i].color,
          // fillBackground: true,
          transparency: horzTransp,
          lineWidth: 0,
          extendLeft: false,
          extendRight: false
        });
        this._renderer.append(fillRect);
      }
      const lineRenderer = new LineRenderer();
      const start = new Point(left, this._data.hLevels[i].y);
      const end = new Point(right, this._data.hLevels[i].y);
      lineRenderer.setData({
        points: [start, end],
        lineColor: props.hLevels[i].color,
        lineWidth: props.linewidth,
        lineStyle: props.linestyle,
        extendLeft: false,
        extendRight: false,
        leftEnd: LineEnd.Normal,
        rightEnd: LineEnd.Normal
      });
      this._renderer.append(lineRenderer);
      if (props.showLeftLabels) {
        const label = this.getTextRenderers("left", i);
        label.setData({
          points: [start],
          text: formatter.format(props.hLevels[i].coeff),
          color: props.hLevels[i].color,
          horzAlign: HorizontalAlign.Right,
          vertAlign: VerticalAlign.Middle,
          fontFamily: ChartFontFamily,
          offsetX: 5,
          offsetY: 0,
          fontSize: 12,
          forceTextAlign: true
        });
        this._renderer.append(label);
      }
      if (props.showRightLabels) {
        const label = this.getTextRenderers("right", i);
        label.setData({
          points: [end],
          text: formatter.format(props.hLevels[i].coeff),
          color: props.hLevels[i].color,
          horzAlign: HorizontalAlign.Left,
          vertAlign: VerticalAlign.Middle,
          fontFamily: ChartFontFamily,
          offsetX: 5,
          offsetY: 0,
          fontSize: 12
        });
        this._renderer.append(label);
      }
    }
    for (let i = 0; i < props.vLevels.length; i++) {
      const x = this._data.vLevels[i].x;
      if (i > 0 && fillVert) {
        const bg = new RectangleRenderer();
        bg.setData({
          points: [new Point(this._data.vLevels[i - 1].x, top), new Point(x, bottom)],
          color: props.vLevels[i].color,
          backColor: props.vLevels[i].color,
          // fillBackground: true,
          transparency: vertTransp,
          lineWidth: 0,
          extendLeft: false,
          extendRight: false
        });
        this._renderer.append(bg);
      }
      const lineRenderer = new LineRenderer();
      const start = new Point(x, top);
      const end = new Point(x, bottom);
      lineRenderer.setData({
        points: [start, end],
        lineColor: props.vLevels[i].color,
        lineWidth: props.linewidth,
        lineStyle: props.linestyle,
        extendLeft: false,
        extendRight: false,
        leftEnd: LineEnd.Normal,
        rightEnd: LineEnd.Normal
      });
      this._renderer.append(lineRenderer);
      if (props.showTopLabels) {
        const label = this.getTextRenderers("top", i);
        label.setData({
          points: [start],
          text: formatter.format(props.vLevels[i].coeff),
          color: props.vLevels[i].color,
          vertAlign: VerticalAlign.Bottom,
          horzAlign: HorizontalAlign.Center,
          fontFamily: ChartFontFamily,
          offsetX: 0,
          offsetY: 3,
          fontSize: 12
        });
        this._renderer.append(label);
      }
      if (props.showBottomLabels) {
        const label = this.getTextRenderers("bottom", i);
        label.setData({
          points: [end],
          text: formatter.format(props.vLevels[i].coeff),
          color: props.vLevels[i].color,
          vertAlign: VerticalAlign.Top,
          horzAlign: HorizontalAlign.Center,
          fontFamily: ChartFontFamily,
          offsetX: 0,
          offsetY: 5,
          fontSize: 12
        });
        this._renderer.append(label);
      }
    }
    const cross1 = new AnchorPoint(new Point(points[0].x, points[1].y), { pointIndex: 2 });
    const cross2 = new AnchorPoint(new Point(points[1].x, points[0].y), { pointIndex: 3 });
    const anchors = this.createLineAnchor(
      {
        points: [...points, cross1, cross2]
      },
      0
    );
    this._renderer.append(anchors);
  }
}
class GannBoxPrimitive extends ToolPrimitive {
  constructor() {
    super(...arguments);
    __publicField(this, "_lines", new GannBoxPaneView(this, this.model));
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
  setPoint(index, point, details) {
    switch (index) {
      case 2: {
        this.controlPoints[0].time = point.time;
        this.controlPoints[1].price = point.price;
        break;
      }
      case 3: {
        this.controlPoints[1].time = point.time;
        this.controlPoints[0].price = point.price;
        break;
      }
      default: {
        super.setPoint(index, point, details);
      }
    }
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
    let hLevels = [];
    let vLevels = [];
    if (this.controlPoints.length > 1 && this.chart.timeScale().getVisibleRange()) {
      const [point1, point2] = this.controlPoints;
      const reverse = this._props.reverse;
      const priceDiff = reverse ? point1.price - point2.price : point2.price - point1.price;
      const basePrice = reverse ? point2.price : point1.price;
      hLevels = this._props.hLevels.reduce(
        (acc, level) => {
          const coeff = level.coeff;
          const levelPrice = basePrice + coeff * priceDiff;
          acc.push({
            y: ensure(this.series.priceToCoordinate(levelPrice))
          });
          return acc;
        },
        []
      );
      const index1 = ensure(this.chart.timeScale().timeToIndexEx(point1.time));
      const index2 = ensure(this.chart.timeScale().timeToIndexEx(point2.time));
      const indexDiff = reverse ? index1 - index2 : index2 - index1;
      const baseIndex = reverse ? index2 : index1;
      vLevels = this._props.vLevels.reduce(
        (acc, level) => {
          const coeff = level.coeff;
          const barIndex = Math.round(baseIndex + coeff * indexDiff);
          const x = ensure(this.chart.timeScale().logicalToCoordinate(barIndex));
          acc.push({
            x
          });
          return acc;
        },
        []
      );
    }
    this._lines.update({ points, hLevels, vLevels });
  }
}
class GannBoxTool extends DrawingTool {
  constructor() {
    super(...arguments);
    __publicField(this, "type", GannBoxToolType);
  }
  createPrimitive() {
    return new GannBoxPrimitive(
      {
        id: this.id,
        points: [],
        color: "rgba(21, 56, 153, 0.8)",
        linewidth: 2,
        linestyle: LineStyleType.solid,
        showTopLabels: true,
        showBottomLabels: true,
        showLeftLabels: true,
        showRightLabels: true,
        fillHorzBackground: true,
        horzTransparency: 80,
        fillVertBackground: true,
        vertTransparency: 80,
        reverse: false,
        fans: { color: "rgb(156, 156, 156)", visible: false },
        hLevels: [
          {
            coeff: 0,
            color: "#808080"
          },
          {
            coeff: 0.25,
            color: "#FF9800"
          },
          {
            coeff: 0.382,
            color: "#00BCD4"
          },
          {
            coeff: 0.5,
            color: "#4CAF50"
          },
          {
            coeff: 0.618,
            color: "#089981"
          },
          {
            coeff: 0.75,
            color: "#2962FF"
          },
          {
            coeff: 1,
            color: "#808080"
          }
        ],
        vLevels: [
          {
            coeff: 0,
            color: "#808080 "
          },
          {
            coeff: 0.25,
            color: "#FF9800"
          },
          {
            coeff: 0.382,
            color: "#00BCD4"
          },
          {
            coeff: 0.5,
            color: "#4CAF50"
          },
          {
            coeff: 0.618,
            color: "#089981"
          },
          {
            coeff: 0.75,
            color: "#2962FF"
          },
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
  GannBoxTool
};
