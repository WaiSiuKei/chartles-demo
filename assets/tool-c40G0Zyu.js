var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { T as ToolPaneView, a as ToolPrimitive, D as DrawingTool } from "./toolPaneView-BAEHHn7m.js";
import { al as EllipseToolType } from "./index-DNbtFiKr.js";
import { ce as distanceToLine, u as Point, A as AnchorPoint, bJ as MediaCoordinatesPaneRenderer, cy as TwoPI, y as HitTestResult, z as HitTarget, bQ as interactionTolerance, e as ensure } from "./index-DSkroicZ.js";
import { P as PriceLabelPriceAxisView } from "./priceLabelPriceAxisView-d9Maj5lR.js";
import { T as TimeLabelTimeAxisView } from "./timeLabelTimeAxisView-BvW_UnA0.js";
import { P as PriceRangeAxisPaneView, T as TimeRangeAxisPaneView } from "./axisPaneView-Pbgdotf1.js";
import { a as translationMatrix, t as transformPoint, r as rotationMatrix, s as scalingMatrix } from "./transform-BQU5urRN.js";
import { t as thirdPointCursorType } from "./handle-CjXYvPYx.js";
import { C as CompositeRenderer } from "./composite-BOGQNAfc.js";
import "./baseTool-BVX9dcKc.js";
class EllipseRenderer extends MediaCoordinatesPaneRenderer {
  drawImpl(scope) {
    if (!this._data || this._data.points.length < 2) return;
    const ctx = scope.context;
    const [start, end] = this._data.points;
    if (this._data.points.length < 3) {
      ctx.strokeStyle = this._data.color;
      ctx.lineWidth = this._data.lineWidth;
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
      return;
    }
    const control = this._data.points[2];
    const distance = distanceToLine(start, end, control).distance;
    if (distance < 1) {
      ctx.strokeStyle = this._data.color;
      ctx.lineWidth = this._data.lineWidth;
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
      return;
    }
    const chord = end.subtract(start);
    const center = start.add(end).scaled(0.5);
    ctx.strokeStyle = this._data.color;
    ctx.lineWidth = this._data.lineWidth;
    const chordLength = chord.length();
    const unitX = chord.x / chordLength;
    const unitY = chord.y / chordLength;
    let angle = Math.acos(unitX);
    if (unitY < 0) angle = -angle;
    let transformed = this._data.points[2];
    let matrix = translationMatrix(-center.x, -center.y);
    transformed = transformPoint(matrix, transformed);
    matrix = rotationMatrix(-angle);
    transformed = transformPoint(matrix, transformed);
    matrix = scalingMatrix(1, chordLength / (2 * distance));
    transformed = transformPoint(matrix, transformed);
    const clockwise = transformed.y < 0;
    ctx.save();
    ctx.beginPath();
    ctx.translate(center.x, center.y);
    ctx.rotate(angle);
    ctx.scale(1, 2 * distance / chordLength);
    ctx.arc(0, 0, 0.5 * chordLength, 0, TwoPI, clockwise);
    ctx.restore();
    ctx.stroke();
    ctx.fillStyle = this._data.background;
    ctx.fill();
  }
  hitTest(point) {
    if (!this._data || this._data.points.length < 3) {
      return null;
    }
    const [start, end, originalControl] = this._data.points;
    const chord = end.subtract(start);
    const center = start.add(end).scaled(0.5);
    const distance = distanceToLine(start, end, originalControl).distance;
    const chordLength = chord.length();
    const unitX = chord.x / chordLength;
    const unitY = chord.y / chordLength;
    let angle = Math.acos(unitX);
    if (unitY < 0) angle = -angle;
    let matrix = translationMatrix(-center.x, -center.y);
    let transformedPoint = transformPoint(matrix, point);
    matrix = rotationMatrix(-angle);
    transformedPoint = transformPoint(matrix, transformedPoint);
    matrix = scalingMatrix(1, chordLength / (2 * distance));
    transformedPoint = transformPoint(matrix, transformedPoint);
    const radius = 0.5 * chordLength;
    const tolerance = interactionTolerance().curve;
    const distanceFromCenter = transformedPoint.length();
    if (Math.abs(distanceFromCenter - radius) <= tolerance) {
      return new HitTestResult(HitTarget.MovePoint);
    }
    return null;
  }
}
class EllipsePaneView extends ToolPaneView {
  constructor() {
    super(...arguments);
    __publicField(this, "_renderer", new CompositeRenderer(this._hitTestCollector));
    __publicField(this, "_ellipseRenderer", new EllipseRenderer());
  }
  renderer() {
    return this._renderer;
  }
  _updateImpl() {
    this._renderer.clear();
    if (this.points().length < 2) return;
    const props = this._source.properties();
    this._ellipseRenderer.setData({
      points: this.points(),
      color: props.lineColor,
      lineWidth: props.lineWidth,
      background: props.backgroundColor
    });
    this._renderer.append(this._ellipseRenderer);
    if (this.points().length === 2) {
      this.addAnchors(this._renderer);
      return;
    }
    const [p0, p1, p2] = this.points();
    const controlDistance = distanceToLine(p0, p1, p2).distance;
    const chord = p1.subtract(p0);
    const center = p0.add(p1).scaled(0.5);
    const normal = new Point(-chord.y, chord.x).normalized();
    const control = center.add(normal.scaled(controlDistance));
    const oppositeControl = center.add(normal.scaled(-controlDistance));
    const cursor = thirdPointCursorType(p0, p1);
    const anchors = [
      p0,
      p1,
      new AnchorPoint(control, { pointIndex: 2, cursorType: cursor }),
      new AnchorPoint(oppositeControl, { pointIndex: 3, cursorType: cursor })
    ];
    this._renderer.append(this.createLineAnchor({ points: anchors }));
  }
}
class EllipsePrimitive extends ToolPrimitive {
  constructor() {
    super(...arguments);
    __publicField(this, "_lines", new EllipsePaneView(this, this.model));
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
    __publicField(this, "_fakePointAdded", false);
    __publicField(this, "_dist", null);
  }
  pointsCount() {
    return 3;
  }
  startChanging() {
    const p0 = ensure(this.pointToScreenPoint(this.controlPoints[0]));
    const p1 = ensure(this.pointToScreenPoint(this.controlPoints[1]));
    const p2 = ensure(this.pointToScreenPoint(this.controlPoints[2]));
    this._dist = distanceToLine(p0, p1, p2).distance;
  }
  onDragEnd() {
    super.onDragEnd();
    this._dist = null;
  }
  setPoint(pointIndex, point, details) {
    switch (pointIndex) {
      case 0: {
        const newPoint = {
          time: ensure(details.startPoint).time + details.deltaTime,
          price: ensure(details.startPoint).price + details.deltaPrice
        };
        if (details.shiftkey) {
          this._snapPoint45Degree(newPoint, this.controlPoints[1]);
          this.controlPoints[0] = newPoint;
          this.controlPoints[2] = this._preparePointInternal(this.controlPoints[2], details, true);
          if (this.controlPoints[0].time === this.controlPoints[1].time) {
            this._fixVerticalDiameterPoints(
              this.controlPoints[0],
              this.controlPoints[1],
              this.controlPoints[2]
            );
          }
        } else {
          const p0Screen = ensure(this.pointToScreenPoint(newPoint));
          const p1Screen = ensure(this.pointToScreenPoint(this.controlPoints[1]));
          const chord = p1Screen.subtract(p0Screen);
          const center = p0Screen.add(p1Screen).scaled(0.5);
          const normal = new Point(-chord.y, chord.x).normalized();
          const offset = normal.scaled(ensure(this._dist));
          const updatedP2Screen = center.add(offset);
          this.controlPoints[0] = newPoint;
          this.controlPoints[2] = this.screenPointToPoint(updatedP2Screen);
        }
        break;
      }
      case 1: {
        const newPoint = {
          time: ensure(details.startPoint).time + details.deltaTime,
          price: ensure(details.startPoint).price + details.deltaPrice
        };
        if (details.shiftkey) {
          this._snapPoint45Degree(newPoint, this.controlPoints[0]);
          this.controlPoints[1] = newPoint;
          this.controlPoints[2] = this._preparePointInternal(this.controlPoints[2], details, true);
          if (this.controlPoints[0].time === this.controlPoints[1].time) {
            this._fixVerticalDiameterPoints(
              this.controlPoints[1],
              this.controlPoints[0],
              this.controlPoints[2]
            );
          }
        } else {
          const p0Screen = ensure(this.pointToScreenPoint(this.controlPoints[0]));
          const p1Screen = ensure(this.pointToScreenPoint(newPoint));
          const chord = p1Screen.subtract(p0Screen);
          const center = p0Screen.add(p1Screen).scaled(0.5);
          const normal = new Point(-chord.y, chord.x).normalized();
          const offset = normal.scaled(ensure(this._dist));
          const updatedP2Screen = center.add(offset);
          this.controlPoints[1] = newPoint;
          this.controlPoints[2] = this.screenPointToPoint(updatedP2Screen);
        }
        break;
      }
      case 2:
      case 3: {
        const movedScreen = new Point(details.screenPoint);
        const p0Screen = ensure(this.pointToScreenPoint(this.controlPoints[0]));
        const p1Screen = ensure(this.pointToScreenPoint(this.controlPoints[1]));
        const chord = p1Screen.subtract(p0Screen);
        const center = p0Screen.add(p1Screen).scaled(0.5);
        const normal = new Point(-chord.y, chord.x).normalized();
        const dist = distanceToLine(p0Screen, p1Screen, movedScreen).distance;
        const controlPos = center.add(normal.scaled(dist));
        this.controlPoints[2] = this.screenPointToPoint(controlPos);
        break;
      }
    }
  }
  /**
   * 修正垂直方向上的锚点（当两个点 index 相同即垂直连线的情况下），
   * 计算第三点 i（通常是控制点）与 e/c 的垂直距离，并反推 e 的 price 值。
   *
   * @param e 起点（会被修改）
   * @param t 终点（通常在下方）
   * @param i 控制点（圆心朝向的控制点）
   */
  _fixVerticalDiameterPoints(e, t, i) {
    const p0Screen = ensure(this.pointToScreenPoint(e));
    const p1Screen = ensure(this.pointToScreenPoint(t));
    const timeScale = this.chart.timeScale();
    const index0Coord = ensure(timeScale.timeToCoordinateEx(e.time));
    const index2Coord = ensure(timeScale.timeToCoordinateEx(i.time));
    let h = 2 * Math.abs(index0Coord - index2Coord);
    h *= t.price > e.price ? 1 : -1;
    const updatedPoint = this.screenPointToPoint(new Point(p0Screen.x, p1Screen.y + h));
    e.price = updatedPoint.price;
  }
  /**
   * 吸附点到 45 度方向（基于屏幕坐标的显示对齐）
   * @param point 要吸附的点（数据坐标空间 - 会修改该对象）
   * @param basePoint 参考点（通常是另一端点）
   */
  _snapPoint45Degree(point, basePoint) {
    const timeScale = this.chart.timeScale();
    const screenPoint = ensure(this.pointToScreenPoint(point));
    const screenBasePoint = ensure(this.pointToScreenPoint(basePoint));
    const dx = screenPoint.x - screenBasePoint.x;
    const dy = screenPoint.y - screenBasePoint.y;
    const dirX = dx < 0 ? -1 : 1;
    const dirY = dy < 0 ? -1 : 1;
    const maxDelta = Math.max(Math.abs(dx), Math.abs(dy));
    const snappedTime = ensure(
      timeScale.coordinateToTimeEx(screenBasePoint.x + maxDelta * dirX)
    );
    const snappedX = ensure(timeScale.timeToCoordinateEx(snappedTime));
    const xDiff = Math.abs(snappedX - screenBasePoint.x);
    const snappedPrice = ensure(this.series.coordinateToPrice(screenBasePoint.y + xDiff * dirY));
    point.time = snappedTime;
    point.price = snappedPrice;
  }
  _preparePointInternal(rawPoint, modifiers, force = false) {
    let resultPoint = { ...rawPoint };
    if (modifiers == null ? void 0 : modifiers.shiftkey) {
      const pointCount = this.controlPoints.length;
      const shouldAddFake = this._fakePointAdded || pointCount === 2 || force;
      if (!this._fakePointAdded && pointCount === 3 && !force) {
        return resultPoint;
      }
      if (shouldAddFake) {
        this._snapPoint45Degree(rawPoint, this.controlPoints[0]);
        if (this._fakePointAdded) {
          this.controlPoints[1] = rawPoint;
        } else if (!force) {
          this._fakePointAdded = true;
          this.controlPoints.push(rawPoint);
        }
        const p0 = ensure(this.pointToScreenPoint(this.controlPoints[0]));
        const p1 = ensure(this.pointToScreenPoint(this.controlPoints[1]));
        const dx = p1.x - p0.x;
        const dy = p1.y - p0.y;
        const radius = Math.sqrt(dx * dx + dy * dy) / 2;
        const chordVector = p1.subtract(p0);
        const center = p0.add(p1).scaled(0.5);
        const normal = new Point(-chordVector.y, chordVector.x).normalized();
        const controlScreen = center.add(normal.scaled(radius));
        let transformedPoint = this.screenPointToPoint(controlScreen);
        if (isNaN(transformedPoint.price) || isNaN(transformedPoint.time)) {
          transformedPoint = this.screenPointToPoint(center);
        }
        resultPoint = transformedPoint;
      }
    } else if (this._fakePointAdded) {
      this.controlPoints.splice(1, 1);
      this._fakePointAdded = false;
    }
    return resultPoint;
  }
  updateAllViews() {
    if (!this.controlPoints.length) return;
    const xs = [];
    const ys = [];
    const [p0, p1, p2] = this.controlPoints;
    const anchorPoints = [];
    for (let i = 0; i < this.controlPoints.length; i++) {
      const p = this.controlPoints[i];
      const drawPoint = this.pointToScreenPoint(p);
      if (!drawPoint) return;
      xs.push(drawPoint.x);
      ys.push(drawPoint.y);
      const anchorPoint = new AnchorPoint(drawPoint, {
        pointIndex: i,
        hitTarget: HitTarget.ChangePoint
      });
      anchorPoints.push(anchorPoint);
    }
    this._timeAxisViews[0].update(this._calculateTimeAxisViewData(p0.time, anchorPoints[0].x));
    this._priceAxisViews[0].update(this._calculatePriceAxisViewData(p0.price, anchorPoints[0].y));
    if (p1) {
      this._timeAxisViews[1].update(this._calculateTimeAxisViewData(p1.time, anchorPoints[1].x));
      this._priceAxisViews[1].update(this._calculatePriceAxisViewData(p1.price, anchorPoints[1].y));
    }
    if (p2) {
      this._timeAxisViews[2].update(this._calculateTimeAxisViewData(p2.time, anchorPoints[2].x));
      this._priceAxisViews[2].update(this._calculatePriceAxisViewData(p2.price, anchorPoints[2].y));
    }
    if (xs.length) {
      this._timeAxisPaneViews[0].update(
        this._calculateTimeAxisPaneViewsData(Math.min.apply(null, xs), Math.max.apply(null, xs))
      );
    }
    if (ys.length) {
      this._priceAxisPaneViews[0].update(
        this._calculatePriceAxisPaneViewData(Math.min.apply(null, ys), Math.max.apply(null, ys))
      );
    }
    this._lines.update({ points: anchorPoints });
  }
}
class EllipseTool extends DrawingTool {
  constructor() {
    super(...arguments);
    __publicField(this, "type", EllipseToolType);
  }
  createPrimitive() {
    return new EllipsePrimitive(
      {
        id: this.id,
        points: [],
        lineColor: "#F23645FF",
        lineWidth: 2,
        backgroundColor: "#F2364533"
      },
      ...this.resetArgs
    );
  }
}
export {
  EllipseTool
};
