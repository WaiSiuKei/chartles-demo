var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { A as AnchorPoint, z as HitTarget, b$ as SelectionRenderer, u as Point, L as LineStyleType, a_ as generateUuid, aG as InputEventType, e as ensure, i as isValidPosition, bY as euclideanDistanceBetweenPoints, cb as last, aH as getXCoordinate } from "./index-DSkroicZ.js";
import { T as ToolPaneView, a as ToolPrimitive, c as DrawingAbortBehavior, D as DrawingTool } from "./toolPaneView-BAEHHn7m.js";
import { B as BrushToolType } from "./index-DNbtFiKr.js";
import { P as PriceRangeAxisPaneView, T as TimeRangeAxisPaneView } from "./axisPaneView-Pbgdotf1.js";
import { C as CompositeRenderer } from "./composite-BOGQNAfc.js";
import { P as PolygonRenderer } from "./polygon-C6s4PX2h.js";
class BrushPaneView extends ToolPaneView {
  constructor() {
    super(...arguments);
    __publicField(this, "_renderer", new CompositeRenderer(this._hitTestCollector));
    __publicField(this, "_polygonRenderer", new PolygonRenderer());
  }
  renderer() {
    return this._renderer;
  }
  _updateImpl() {
    this._renderer.clear();
    const points = this.points();
    if (points.length === 0) {
      return;
    }
    const interpolatedPoints = [points[0]];
    const smoothFactor = Math.max(1, this._source.properties().smooth);
    for (let i = 1; i < points.length; i++) {
      const vec = points[i].subtract(points[i - 1]);
      const segLength = vec.length();
      const subdivisions = Math.min(5, Math.floor(segLength / smoothFactor));
      const stepVec = vec.normalized().scaled(segLength / subdivisions);
      for (let j = 0; j < subdivisions - 1; j++) {
        const interpPoint = points[i - 1].add(stepVec.scaled(j));
        interpolatedPoints.push(interpPoint);
      }
      interpolatedPoints.push(points[i]);
    }
    const smoothedPoints = this._smoothArray(interpolatedPoints, smoothFactor);
    const polygonRenderData = this._createPolygonRendererData(smoothedPoints);
    this._polygonRenderer.setData(polygonRenderData);
    this._renderer.append(this._polygonRenderer);
    if (this._source.isCreationFinished()) {
      const total = polygonRenderData.points.length;
      if (total > 0) {
        const anchorPoints = total > 1 ? [
          new AnchorPoint(polygonRenderData.points[0], {
            hitTarget: HitTarget.Regular,
            pointIndex: 0
          }),
          new AnchorPoint(polygonRenderData.points[total - 1], {
            hitTarget: HitTarget.Regular,
            pointIndex: 1
          })
        ] : [
          new AnchorPoint(polygonRenderData.points[0], {
            hitTarget: HitTarget.Regular,
            pointIndex: 0
          })
        ];
        const selectionRenderer = new SelectionRenderer({
          points: anchorPoints,
          bgColors: this._lineAnchorColors(anchorPoints),
          visible: this.areAnchorsVisible(),
          hitTarget: HitTarget.Regular
        });
        this._renderer.append(selectionRenderer);
      }
    }
  }
  _smoothArray(rawPoints, smoothFactor) {
    if (rawPoints.length === 1) return rawPoints;
    const smoothedPoints = new Array(rawPoints.length);
    for (let index = 0; index < rawPoints.length; index++) {
      let sum = new Point(0, 0);
      for (let offset = 0; offset < smoothFactor; offset++) {
        const leftIndex = Math.max(index - offset, 0);
        const rightIndex = Math.min(index + offset, rawPoints.length - 1);
        sum = sum.add(rawPoints[leftIndex]);
        sum = sum.add(rawPoints[rightIndex]);
      }
      smoothedPoints[index] = sum.scaled(0.5 / smoothFactor);
    }
    smoothedPoints.push(rawPoints[rawPoints.length - 1]);
    return smoothedPoints;
  }
  _createPolygonRendererData(points) {
    const props = this._source.properties();
    return {
      points,
      lineColor: props.lineColor,
      lineWidth: props.lineWidth,
      lineStyle: LineStyleType.solid
    };
  }
}
class BrushPrimitive extends ToolPrimitive {
  constructor() {
    super(...arguments);
    __publicField(this, "_lines", new BrushPaneView(this, this.model));
    __publicField(this, "_paneView", [this._lines]);
    __publicField(this, "_priceAxisPaneViews", [new PriceRangeAxisPaneView(/* @__PURE__ */ Object.create(null))]);
    __publicField(this, "_timeAxisPaneViews", [new TimeRangeAxisPaneView(/* @__PURE__ */ Object.create(null))]);
  }
  pointsCount() {
    return Infinity;
  }
  updateDrag(componentId, startPoints, startTime, endTime, startPrice, endPrice) {
    this._currentDragTarget = componentId;
    const deltaTime = endTime - startTime;
    const deltaPrice = endPrice - startPrice;
    this._props.points.forEach((point, idx) => {
      point.time = startPoints[idx].time + deltaTime;
      point.price = startPoints[idx].price + deltaPrice;
    });
    this.updateAllViews();
    this.requestUpdate();
  }
  updateStroke(point) {
    this.controlPoints.push(point);
    this.updateAllViews();
    this.requestUpdate();
  }
  abort() {
    return DrawingAbortBehavior.None;
  }
  updateAllViews() {
    const points = [];
    const xs = [];
    const ys = [];
    for (let i = 0; i < this.controlPoints.length; i++) {
      const p = this.controlPoints[i];
      const drawPoint = this.pointToScreenPoint(p);
      if (!drawPoint) return;
      points.push(new AnchorPoint(drawPoint, { pointIndex: i }));
    }
    this._priceAxisPaneViews[0].update(
      this._calculatePriceAxisPaneViewData(Math.min.apply(null, ys), Math.max.apply(null, ys))
    );
    this._timeAxisPaneViews[0].update(
      this._calculateTimeAxisPaneViewsData(Math.min.apply(null, xs), Math.max.apply(null, xs))
    );
    this._lines.update({
      points
    });
  }
}
const threshold = 3;
class BrushTool extends DrawingTool {
  constructor() {
    super(...arguments);
    __publicField(this, "type", BrushToolType);
    __publicField(this, "_drawPoints", []);
  }
  createPrimitive() {
    return new BrushPrimitive(
      {
        id: generateUuid(),
        points: [],
        smooth: 5,
        lineColor: "#00BCD4FF",
        lineWidth: 2
      },
      ...this.resetArgs
    );
  }
  processEvent(e) {
    var _a;
    switch (e.type) {
      case InputEventType.DRAG_START: {
        const event = ensure(e.asMouseInputEvent());
        const pos = event.source.chartApi.getCrosshairPosition();
        if (!isValidPosition(pos)) return;
        const paneIndex = ensure(pos.paneIndex);
        const session = this._startCreationOnChart(event.source, paneIndex, false, false);
        const drawPoint = pos;
        const time = ensure(
          getXCoordinate(this.chartService, pos.x, {
            useExtended: !this.disableExtendTime
          })
        );
        const price = ensure(session.getTargetSeries().coordinateToPrice(pos.y));
        event.accept();
        this._disableDefaultDrag();
        this._drawPoints.push(drawPoint);
        const primitive = this.createPrimitive();
        session.startDrawing(primitive);
        primitive.updateStroke({ time, price });
        break;
      }
      case InputEventType.MOUSE_MOVE: {
        e.accept();
        break;
      }
      case InputEventType.DRAG: {
        const event = ensure(e.asMouseInputEvent());
        const pos = event.source.chartApi.getCrosshairPosition();
        if (!isValidPosition(pos)) return;
        const drawPoint = pos;
        const distance = euclideanDistanceBetweenPoints(drawPoint, ensure(last(this._drawPoints)));
        if (distance > threshold) {
          const time = ensure(
            getXCoordinate(this.chartService, pos.x, {
              useExtended: !this.disableExtendTime
            })
          );
          const price = ensure((_a = this._drawingSession) == null ? void 0 : _a.getTargetSeries().coordinateToPrice(pos.y));
          const controlPoint = { time, price };
          this._drawPoints.push(drawPoint);
          this.primitive.updateStroke(controlPoint);
        }
        event.accept();
        break;
      }
      case InputEventType.DRAG_END: {
        const event = ensure(e.asMouseInputEvent());
        event.accept();
        this.abortDrawing();
        break;
      }
      case InputEventType.DROP: {
        const event = ensure(e.asMouseInputEvent());
        event.accept();
        if (this._drawingSession) {
          this.finishDrawing();
        }
        break;
      }
    }
  }
  _disableDefaultDrag() {
    this.chartService.chartApi.applyOptions({
      handleScale: false,
      handleScroll: false
    });
  }
  _enableDefaultDrag() {
    this.chartService.chartApi.applyOptions({
      handleScale: true,
      handleScroll: true
    });
  }
  finishDrawing() {
    super.finishDrawing();
    this._enableDefaultDrag();
    this._drawPoints = [];
  }
  useMagnetedPosition() {
    return false;
  }
}
const tool = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  BrushTool
}, Symbol.toStringTag, { value: "Module" }));
export {
  BrushTool as B,
  BrushPrimitive as a,
  tool as t
};
