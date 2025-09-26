var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { bN as LineEnd, L as LineStyleType, A as AnchorPoint, e as ensure } from "./index-NZHt9VGv.js";
import { T as ToolPaneView, a as ToolPrimitive, D as DrawingTool } from "./toolPaneView-3wj_on-u.js";
import { o as CyclicLinesToolType } from "./index-TSHQCVD9.js";
import { P as PriceLabelPriceAxisView } from "./priceLabelPriceAxisView-d9Maj5lR.js";
import { T as TimeLabelTimeAxisView } from "./timeLabelTimeAxisView-BvW_UnA0.js";
import { P as PriceRangeAxisPaneView, T as TimeRangeAxisPaneView } from "./axisPaneView-Pbgdotf1.js";
import { C as CompositeRenderer } from "./composite-tvPrNHN0.js";
import { L as LineRenderer } from "./line-DFhYRKvt.js";
import { V as VerticalLineRenderer } from "./verticalLine-Bizl3Oqm.js";
import "./baseTool-CHlzZht2.js";
class CyclicLinesPaneView extends ToolPaneView {
  constructor() {
    super(...arguments);
    __publicField(this, "_renderer", new CompositeRenderer(this._hitTestCollector));
    __publicField(this, "_trendRenderer", new LineRenderer());
  }
  renderer() {
    return this._renderer;
  }
  _updateImpl() {
    this._renderer.clear();
    const points = this.points();
    if ((points == null ? void 0 : points.length) < 2) return;
    const props = this._source.properties();
    const trendLineConfig = {
      points,
      lineColor: "#808080",
      lineWidth: 1,
      lineStyle: LineStyleType.dashed,
      extendLeft: false,
      extendRight: false,
      leftEnd: LineEnd.Normal,
      rightEnd: LineEnd.Normal
    };
    this._trendRenderer.setData(trendLineConfig);
    this._renderer.append(this._trendRenderer);
    for (let i = 0; i < this._data.coordinates.length; i++) {
      const xCoord = this._data.coordinates[i];
      const verticalLineConfig = {
        x: xCoord,
        lineColor: props.lineColor,
        lineWidth: props.lineWidth,
        lineStyle: props.lineStyle
      };
      const verticalLine = new VerticalLineRenderer();
      verticalLine.setData(verticalLineConfig);
      this._renderer.append(verticalLine);
    }
    if (points.length === 2) {
      this._renderer.append(this.createLineAnchor({ points }, 0));
    } else {
      this._renderer.append(
        this.createLineAnchor(
          {
            points
          },
          1
        )
      );
    }
  }
}
class CyclicLinesPrimitive extends ToolPrimitive {
  constructor() {
    super(...arguments);
    __publicField(this, "_lines", new CyclicLinesPaneView(this, this.model));
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
    const data = {
      points,
      coordinates: []
    };
    const pointStart = this.controlPoints[0];
    const pointEnd = this.controlPoints[1];
    const startIdx = ensure(this.chart.timeScale().timeToIndexEx(pointStart.time));
    const endIndx = pointEnd ? this.chart.timeScale().timeToIndexEx(pointEnd.time) : null;
    const barInterval = pointEnd ? ensure(endIndx) - startIdx : 1;
    if (barInterval === 0) return;
    const visibleRange = this.chart.timeScale().getVisibleLogicalRange();
    if (visibleRange === null) return;
    if (barInterval > 0) {
      for (let i = startIdx; i <= visibleRange.to; i += barInterval) {
        data.coordinates.push(ensure(this.chart.timeScale().logicalToCoordinate(i)));
      }
    } else {
      for (let i = startIdx; i >= visibleRange.from; i += barInterval) {
        data.coordinates.push(ensure(this.chart.timeScale().logicalToCoordinate(i)));
      }
    }
    this._lines.update(data);
  }
}
class CyclicLinesTool extends DrawingTool {
  constructor() {
    super(...arguments);
    __publicField(this, "type", CyclicLinesToolType);
  }
  createPrimitive() {
    return new CyclicLinesPrimitive(
      {
        id: this.id,
        points: [],
        lineColor: "#80CCDBFF",
        lineWidth: 2,
        lineStyle: LineStyleType.solid
      },
      ...this.resetArgs
    );
  }
}
export {
  CyclicLinesTool
};
