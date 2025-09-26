var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { u as Point, bN as LineEnd, r as ChartFontFamily, y as HitTestResult, z as HitTarget, bJ as MediaCoordinatesPaneRenderer, bM as generateColor, e as ensure, bS as arePointsEqual, ce as distanceToLine, ch as clipPolygonByEdge, A as AnchorPoint, L as LineStyleType } from "./index-NZHt9VGv.js";
import { T as ToolPaneView, a as ToolPrimitive, D as DrawingTool } from "./toolPaneView-3wj_on-u.js";
import { v as FibSpeedResistanceFanToolType } from "./index-TSHQCVD9.js";
import { P as PriceLabelPriceAxisView } from "./priceLabelPriceAxisView-d9Maj5lR.js";
import { T as TimeLabelTimeAxisView } from "./timeLabelTimeAxisView-BvW_UnA0.js";
import { P as PriceRangeAxisPaneView, T as TimeRangeAxisPaneView } from "./axisPaneView-Pbgdotf1.js";
import { B as BaseTextRenderer, H as HorizontalAlign, V as VerticalAlign } from "./text-CtvZov1L.js";
import { b as getNumericFormatter } from "./formatter-_n1ErJyi.js";
import { C as CompositeRenderer } from "./composite-tvPrNHN0.js";
import { L as LineRenderer } from "./line-DFhYRKvt.js";
import "./baseTool-CHlzZht2.js";
import "./text-8RrTwjoh.js";
import "./ctx-Bv0u81rl.js";
import "./numericFormatter-Dh0kn-kp.js";
class ChannelRenderer extends MediaCoordinatesPaneRenderer {
  // public hitTest(mousePoint: Point,  ): HitTestResult | null {
  //   if (this._data === null || !this._data.hittestOnBackground) return null;
  //
  //   const polygon = this._getVisiblePolygon(renderContext.mediaSize);
  //   if (polygon !== null && pointInPolygon(mousePoint, polygon)) {
  //     return new HitTestResult(HitTarget.MovePointBackground);
  //   }
  //
  //   return null;
  // }
  drawImpl(render) {
    if (this._data === null) return;
    const ctx = render.context;
    const polygon = this._getVisiblePolygon(render.mediaSize);
    if (polygon !== null) {
      ctx.beginPath();
      ctx.moveTo(polygon[0].x, polygon[0].y);
      for (let i = 1; i < polygon.length; i++) {
        ctx.lineTo(polygon[i].x, polygon[i].y);
      }
      ctx.fillStyle = generateColor(this._data.color, this._data.transparency, true);
      ctx.fill();
    }
  }
  _getVisiblePolygon(mediaSize) {
    const data = ensure(this._data);
    const { p1, p2, p3, p4 } = data;
    if (arePointsEqual(p1, p2) || arePointsEqual(p3, p4) || distanceToLine(p1, p2, p3).distance < 1e-6 && distanceToLine(p1, p2, p4).distance < 1e-6) {
      return null;
    }
    if (mediaSize.width <= 0 || mediaSize.height <= 0) {
      return null;
    }
    let visibleBox = [
      new Point(0, 0),
      new Point(mediaSize.width, 0),
      new Point(mediaSize.width, mediaSize.height),
      new Point(0, mediaSize.height)
    ];
    visibleBox = clipPolygonByEdge(visibleBox, p1, p2, [p4, p3]);
    visibleBox = clipPolygonByEdge(visibleBox, p4, p3, [p1, p2]);
    const needThirdClip = !arePointsEqual(p3, p1) && !data.extendLeft;
    if (needThirdClip) {
      visibleBox = clipPolygonByEdge(visibleBox, p3, p1, [p2, p4]);
    }
    return visibleBox;
  }
}
class FibSpeedResistanceFanPaneView extends ToolPaneView {
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
    if (points.length < 2) return;
    const props = this._source.properties();
    const [screenPointA, screenPointB] = points;
    const minX = Math.min(screenPointA.x, screenPointB.x);
    const maxX = Math.max(screenPointA.x, screenPointB.x);
    const minY = Math.min(screenPointA.y, screenPointB.y);
    const maxY = Math.max(screenPointA.y, screenPointB.y);
    const gridColor = props.grid.color;
    const gridWidth = props.grid.linewidth;
    const gridStyle = props.grid.linestyle;
    const showGridLines = props.grid.visible;
    const formatter = getNumericFormatter();
    for (let i = 0; i < props.hLevels.length; i++) {
      const level = props.hLevels[i];
      const y = this._data.hLevels[i].y;
      const left = new Point(minX, y);
      const right = new Point(maxX, y);
      if (showGridLines) {
        const line = new LineRenderer();
        line.setData({
          points: [left, right],
          lineColor: gridColor,
          lineWidth: gridWidth,
          lineStyle: gridStyle,
          extendLeft: false,
          extendRight: false,
          leftEnd: LineEnd.Normal,
          rightEnd: LineEnd.Normal
        });
        this._renderer.append(line);
      }
      if (props.showLeftLabels) {
        const labelData = {
          points: [left],
          text: formatter.format(level.coeff),
          color: level.color,
          vertAlign: VerticalAlign.Middle,
          horzAlign: HorizontalAlign.Right,
          fontFamily: ChartFontFamily,
          offsetX: 5,
          offsetY: 0,
          fontSize: 12,
          forceTextAlign: true
        };
        const r = this.getTextRenderers("left", i);
        r.setData(labelData);
        this._renderer.append(r);
      }
      if (props.showRightLabels) {
        const labelData = {
          points: [right],
          text: formatter.format(level.coeff),
          color: level.color,
          vertAlign: VerticalAlign.Middle,
          horzAlign: HorizontalAlign.Left,
          fontFamily: ChartFontFamily,
          offsetX: 5,
          offsetY: 0,
          fontSize: 12,
          forceTextAlign: true
        };
        const r = this.getTextRenderers("right", i);
        r.setData(labelData);
        this._renderer.append(r);
      }
    }
    for (let i = 0; i < props.vLevels.length; i++) {
      const level = props.vLevels[i];
      const x = this._data.vLevels[i].x;
      const top = new Point(x, minY);
      const bottom = new Point(x, maxY);
      if (showGridLines) {
        const line = new LineRenderer();
        line.setData({
          points: [top, bottom],
          lineColor: gridColor,
          lineWidth: gridWidth,
          lineStyle: gridStyle,
          extendLeft: false,
          extendRight: false,
          leftEnd: LineEnd.Normal,
          rightEnd: LineEnd.Normal
        });
        this._renderer.append(line);
      }
      if (props.showTopLabels) {
        const labelData = {
          points: [top],
          text: formatter.format(level.coeff),
          color: level.color,
          vertAlign: VerticalAlign.Bottom,
          horzAlign: HorizontalAlign.Center,
          fontFamily: ChartFontFamily,
          offsetX: 0,
          offsetY: 5,
          fontSize: 12
        };
        const r = this.getTextRenderers("top", i);
        r.setData(labelData);
        this._renderer.append(r);
      }
      if (props.showBottomLabels) {
        const labelData = {
          points: [bottom],
          text: formatter.format(level.coeff),
          color: level.color,
          vertAlign: VerticalAlign.Top,
          horzAlign: HorizontalAlign.Center,
          fontFamily: ChartFontFamily,
          offsetX: 0,
          offsetY: 5,
          fontSize: 12
        };
        const r = this.getTextRenderers("bottom", i);
        r.setData(labelData);
        this._renderer.append(r);
      }
    }
    const fillBackground = props.fillBackground;
    const transparency = props.transparency;
    for (let i = 0; i < props.hLevels.length; i++) {
      const currY = this._data.hLevels[i].y;
      const prevY = i > 0 ? this._data.hLevels[i - 1].y : null;
      if (i > 0 && fillBackground) {
        const fill = new ChannelRenderer();
        fill.setData({
          p1: screenPointA,
          p2: new Point(screenPointB.x, currY),
          p3: screenPointA,
          p4: new Point(screenPointB.x, prevY),
          color: props.hLevels[i].color,
          transparency,
          hittestOnBackground: true,
          extendLeft: false
        });
        this._renderer.append(fill);
      }
      const border = new LineRenderer();
      border.setData({
        points: [screenPointA, new Point(screenPointB.x, currY)],
        lineColor: props.hLevels[i].color,
        lineWidth: props.linewidth,
        lineStyle: props.linestyle,
        extendLeft: false,
        extendRight: true,
        leftEnd: LineEnd.Normal,
        rightEnd: LineEnd.Normal
      });
      border.setHitTest(new HitTestResult(HitTarget.MovePoint));
      this._renderer.append(border);
    }
    for (let i = 0; i < props.vLevels.length; i++) {
      const currX = this._data.vLevels[i].x;
      const prevX = i > 0 ? this._data.vLevels[i - 1].x : null;
      if (i > 0 && fillBackground) {
        const fill = new ChannelRenderer();
        fill.setData({
          p1: screenPointA,
          p2: new Point(currX, screenPointB.y),
          p3: screenPointA,
          p4: new Point(prevX, screenPointB.y),
          color: props.vLevels[i].color,
          transparency,
          hittestOnBackground: true,
          extendLeft: false
        });
        this._renderer.append(fill);
      }
      const border = new LineRenderer();
      border.setData({
        points: [screenPointA, new Point(currX, screenPointB.y)],
        lineColor: props.vLevels[i].color,
        lineWidth: props.linewidth,
        lineStyle: props.linestyle,
        extendLeft: false,
        extendRight: true,
        leftEnd: LineEnd.Normal,
        rightEnd: LineEnd.Normal
      });
      border.setHitTest(new HitTestResult(HitTarget.MovePoint));
      this._renderer.append(border);
    }
    this.addAnchors(this._renderer);
  }
}
class FibSpeedResistanceFanPrimitive extends ToolPrimitive {
  constructor() {
    super(...arguments);
    __publicField(this, "_lines", new FibSpeedResistanceFanPaneView(
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
    let hLevels = [];
    let vLevels = [];
    if (points.length > 1) {
      const [pointA, pointB] = this.controlPoints;
      const reverse = this._props.reverse;
      const priceDelta = reverse ? pointB.price - pointA.price : pointA.price - pointB.price;
      const basePrice = reverse ? pointA.price : pointB.price;
      hLevels = this._props.hLevels.reduce(
        (acc, level) => {
          const coeff = level.coeff;
          const price = basePrice + coeff * priceDelta;
          const y = ensure(this.series.priceToCoordinate(price));
          acc.push({
            y
          });
          return acc;
        },
        []
      );
      const indexA = ensure(this.chart.timeScale().timeToIndexEx(pointA.time));
      const indexB = ensure(this.chart.timeScale().timeToIndexEx(pointB.time));
      const indexDelta = reverse ? indexB - indexA : indexA - indexB;
      const baseIndex = reverse ? indexA : indexB;
      vLevels = this._props.vLevels.reduce(
        (acc, level) => {
          const coeff = level.coeff;
          const barIndex = Math.round(baseIndex + coeff * indexDelta);
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
class FibSpeedResistanceFanTool extends DrawingTool {
  constructor() {
    super(...arguments);
    __publicField(this, "type", FibSpeedResistanceFanToolType);
  }
  createPrimitive() {
    return new FibSpeedResistanceFanPrimitive(
      {
        id: this.id,
        points: [],
        fillBackground: true,
        transparency: 80,
        grid: {
          color: "rgba(21, 56, 153, 0.8)",
          linewidth: 1,
          linestyle: LineStyleType.solid,
          visible: true
        },
        linewidth: 2,
        linestyle: LineStyleType.solid,
        showTopLabels: true,
        showBottomLabels: true,
        showLeftLabels: true,
        showRightLabels: true,
        reverse: false,
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
        ]
      },
      ...this.resetArgs
    );
  }
}
export {
  FibSpeedResistanceFanTool
};
