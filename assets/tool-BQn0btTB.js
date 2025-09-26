var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { T as ToolPaneView, a as ToolPrimitive, D as DrawingTool } from "./toolPaneView-3wj_on-u.js";
import { ah as ArcToolType } from "./index-TSHQCVD9.js";
import { ce as distanceToLine, u as Point, A as AnchorPoint, bJ as MediaCoordinatesPaneRenderer, y as HitTestResult, z as HitTarget, bQ as interactionTolerance, e as ensure } from "./index-NZHt9VGv.js";
import { a as translationMatrix, t as transformPoint, r as rotationMatrix, s as scalingMatrix } from "./transform-DmMOnC2_.js";
import { P as PriceLabelPriceAxisView } from "./priceLabelPriceAxisView-d9Maj5lR.js";
import { T as TimeLabelTimeAxisView } from "./timeLabelTimeAxisView-BvW_UnA0.js";
import { P as PriceRangeAxisPaneView, T as TimeRangeAxisPaneView } from "./axisPaneView-Pbgdotf1.js";
import { t as thirdPointCursorType } from "./handle-CW7PoDcs.js";
import { C as CompositeRenderer } from "./composite-tvPrNHN0.js";
import "./baseTool-CHlzZht2.js";
class ArcRenderer extends MediaCoordinatesPaneRenderer {
  drawImpl(scope) {
    const data = this._data;
    if (!data || data.points.length < 2) return;
    const ctx = scope.context;
    const p0 = data.points[0];
    const p1 = data.points[1];
    if (data.points.length < 3) {
      ctx.strokeStyle = data.lineColor;
      ctx.lineWidth = data.lineWidth;
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.stroke();
      return;
    }
    let controlPoint = data.points[2];
    const { distance } = distanceToLine(p0, p1, controlPoint);
    if (distance < 1) {
      ctx.strokeStyle = data.lineColor;
      ctx.lineWidth = data.lineWidth;
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.stroke();
      return;
    }
    const chord = p1.subtract(p0);
    const center = p0.add(p1).scaled(0.5);
    const normal = new Point(-chord.y, chord.x).normalized();
    controlPoint = center.add(normal.scaled(distance));
    ctx.strokeStyle = data.lineColor;
    ctx.lineWidth = data.lineWidth;
    const chordLength = chord.length();
    const cosTheta = chord.x / chordLength;
    const sinTheta = chord.y / chordLength;
    let angle = Math.acos(cosTheta);
    if (sinTheta < 0) angle = -angle;
    let transformedCP = data.points[2];
    let transform = translationMatrix(-center.x, -center.y);
    transformedCP = transformPoint(transform, transformedCP);
    transform = rotationMatrix(-angle);
    transformedCP = transformPoint(transform, transformedCP);
    transform = scalingMatrix(1, chordLength / (2 * distance));
    transformedCP = transformPoint(transform, transformedCP);
    const clockwise = transformedCP.y < 0;
    ctx.save();
    ctx.beginPath();
    ctx.translate(p0.x, p0.y);
    ctx.rotate(angle);
    const arcRadius = chordLength;
    const arcLengthFactor = 1 - Math.sqrt(3) / 2;
    const arcYScale = distance / (chordLength * arcLengthFactor);
    ctx.scale(1, arcYScale);
    if (clockwise) {
      const arcStart = -2 * Math.PI / 3;
      const arcEnd = -Math.PI / 3;
      ctx.arc(
        0.5 * chordLength,
        chordLength * Math.sqrt(3) / 2,
        arcRadius,
        arcStart,
        arcEnd,
        false
      );
    } else {
      const arcStart = Math.PI / 3;
      const arcEnd = 2 * Math.PI / 3;
      ctx.arc(
        0.5 * chordLength,
        -chordLength * Math.sqrt(3) / 2,
        arcRadius,
        arcStart,
        arcEnd,
        false
      );
    }
    ctx.restore();
    ctx.stroke();
    ctx.fillStyle = data.background;
    ctx.fill();
  }
  hitTest(point) {
    if (!this._data || this._data.points.length < 3) return null;
    const tolerance = interactionTolerance().curve;
    const p0 = this._data.points[0];
    const p1 = this._data.points[1];
    let control = this._data.points[2];
    const distance = distanceToLine(p0, p1, control).distance;
    if (distance < 1) {
      const straightDist = distanceToLine(p0, p1, point).distance;
      if (straightDist < tolerance) {
        return new HitTestResult(HitTarget.MovePoint);
      } else {
        return null;
      }
    }
    const chord = p1.subtract(p0);
    const chordLength = chord.length();
    const center = p0.add(p1).scaled(0.5);
    let unitNormal = control.subtract(center).normalized();
    control = center.add(unitNormal.scaled(distance));
    const cosθ = chord.x / chordLength;
    const sinθ = chord.y / chordLength;
    let angle = Math.acos(cosθ);
    if (sinθ < 0) angle = -angle;
    let mat = translationMatrix(-p0.x, -p0.y);
    point = transformPoint(mat, point);
    unitNormal = transformPoint(mat, unitNormal);
    mat = rotationMatrix(-angle);
    point = transformPoint(mat, point);
    unitNormal = transformPoint(mat, unitNormal);
    const scaleY = chordLength * (1 - Math.sqrt(3) / 2) / distance;
    mat = scalingMatrix(1, scaleY);
    point = transformPoint(mat, point);
    unitNormal = transformPoint(mat, unitNormal);
    if (point.y * unitNormal.y < 0) return null;
    let arcCenter;
    if (point.y < 0) {
      arcCenter = new Point(0.5 * chordLength, chordLength * Math.sqrt(3) / 2);
    } else {
      arcCenter = new Point(0.5 * chordLength, -chordLength * Math.sqrt(3) / 2);
    }
    const distToArcCenter = point.subtract(arcCenter).length();
    return Math.abs(distToArcCenter - chordLength) <= tolerance ? new HitTestResult(HitTarget.MovePoint) : null;
  }
}
class ArcPaneView extends ToolPaneView {
  constructor() {
    super(...arguments);
    __publicField(this, "_renderer", new CompositeRenderer(this._hitTestCollector));
    __publicField(this, "_arcRenderer", new ArcRenderer());
  }
  renderer() {
    return this._renderer;
  }
  _updateImpl() {
    this._renderer.clear();
    const props = this._source.properties();
    this._arcRenderer.setData({
      points: this.points(),
      lineColor: props.lineColor,
      lineWidth: props.lineWidth,
      background: props.backgroundColor
    });
    this._renderer.append(this._arcRenderer);
    if (this.points().length <= 2) {
      this.addAnchors(this._renderer);
      return;
    }
    const [p0, p1, controlPoint] = this.points();
    const anchors = [p0, p1];
    const { distance: d } = distanceToLine(p0, p1, controlPoint);
    const chord = p1.subtract(p0);
    const mid = p0.add(p1).scaled(0.5);
    const normal = new Point(-chord.y, chord.x).normalized();
    const correctedPointA = mid.add(normal.scaled(d));
    const correctedPointB = mid.add(normal.scaled(-d));
    const chordLength = chord.length();
    const cosθ = chord.x / chordLength;
    const sinθ = chord.y / chordLength;
    let angle = Math.acos(cosθ);
    if (sinθ < 0) angle = -angle;
    let L = controlPoint;
    let mat = translationMatrix(-mid.x, -mid.y);
    L = transformPoint(mat, L);
    mat = rotationMatrix(-angle);
    L = transformPoint(mat, L);
    mat = scalingMatrix(1, chordLength / (2 * d));
    L = transformPoint(mat, L);
    const usePoint = L.y >= 0 ? correctedPointA : correctedPointB;
    const anchor2 = new AnchorPoint(usePoint, {
      pointIndex: 2,
      cursorType: thirdPointCursorType(p0, p1)
    });
    anchors.push(anchor2);
    const anchorRenderer = this.createLineAnchor({ points: anchors });
    this._renderer.append(anchorRenderer);
  }
}
class ArcPrimitive extends ToolPrimitive {
  constructor() {
    super(...arguments);
    __publicField(this, "_lines", new ArcPaneView(this, this.model));
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
    __publicField(this, "_dist", null);
  }
  pointsCount() {
    return 3;
  }
  startChanging() {
    const [p0, p1, p2] = this.controlPoints;
    const sp0 = ensure(this.pointToScreenPoint(p0));
    const sp1 = ensure(this.pointToScreenPoint(p1));
    const sp2 = ensure(this.pointToScreenPoint(p2));
    const dist = distanceToLine(sp0, sp1, sp2).distance;
    const chord = sp1.subtract(sp0);
    const normal = new Point(-chord.y, chord.x);
    const mid = sp0.add(sp1).scaled(0.5);
    const isBelow = sp2.subtract(mid).dotProduct(normal) < 0;
    this._dist = isBelow ? -dist : dist;
  }
  onDragEnd() {
    super.onDragEnd();
    this._dist = null;
  }
  setPoint(pointIndex, point, details) {
    const screenP0 = ensure(this.pointToScreenPoint(this.controlPoints[0]));
    const screenP1 = ensure(this.pointToScreenPoint(this.controlPoints[1]));
    const dist = ensure(this._dist);
    switch (pointIndex) {
      case 0: {
        const newPoint = {
          time: ensure(details.startPoint).time + details.deltaTime,
          price: ensure(details.startPoint).price + details.deltaPrice
        };
        const screenNew = ensure(this.pointToScreenPoint(newPoint));
        const chord = screenP1.subtract(screenNew);
        const mid = screenNew.add(screenP1).scaled(0.5);
        const normal = new Point(-chord.y, chord.x).normalized();
        const controlScreen = mid.add(normal.scaled(dist));
        this.controlPoints[0] = newPoint;
        this.controlPoints[2] = this.screenPointToPoint(controlScreen);
        break;
      }
      case 1: {
        const newPoint = {
          time: ensure(details.startPoint).time + details.deltaTime,
          price: ensure(details.startPoint).price + details.deltaPrice
        };
        const screenNew = ensure(this.pointToScreenPoint(newPoint));
        const chord = screenNew.subtract(screenP0);
        const mid = screenP0.add(screenNew).scaled(0.5);
        const normal = new Point(-chord.y, chord.x).normalized();
        const controlScreen = mid.add(normal.scaled(dist));
        this.controlPoints[1] = newPoint;
        this.controlPoints[2] = this.screenPointToPoint(controlScreen);
        break;
      }
      // ========================
      // ➤ 拖动第 2 个控制点：修正控制方向
      // ========================
      case 2: {
        let screenNew = new Point(details.screenPoint);
        const chord = screenP1.subtract(screenP0);
        const mid = screenP0.add(screenP1).scaled(0.5);
        const { distance: d } = distanceToLine(screenP0, screenP1, screenNew);
        const normal = new Point(-chord.y, chord.x).normalized();
        const controlUp = mid.add(normal.scaled(d));
        const controlDown = mid.add(normal.scaled(-d));
        const chordLength = chord.length();
        const cosθ = chord.x / chordLength;
        const sinθ = chord.y / chordLength;
        let angle = Math.acos(cosθ);
        if (sinθ < 0) angle = -angle;
        let trans = translationMatrix(-mid.x, -mid.y);
        screenNew = transformPoint(trans, screenNew);
        let controlCandidate = transformPoint(trans, controlUp);
        trans = rotationMatrix(-angle);
        screenNew = transformPoint(trans, screenNew);
        controlCandidate = transformPoint(trans, controlCandidate);
        trans = scalingMatrix(1, chordLength / (2 * d));
        screenNew = transformPoint(trans, screenNew);
        controlCandidate = transformPoint(trans, controlCandidate);
        const finalControl = screenNew.y * controlCandidate.y >= 0 ? controlUp : controlDown;
        this.controlPoints[2] = this.screenPointToPoint(finalControl);
        break;
      }
    }
  }
  updateAllViews() {
    if (!this.controlPoints.length) return;
    const xs = [];
    const ys = [];
    const anchorPoints = [];
    for (let i = 0; i < this.controlPoints.length; i++) {
      const point = this.controlPoints[i];
      const drawPoint = this.pointToScreenPoint(point);
      if (!drawPoint) return;
      xs.push(drawPoint.x);
      ys.push(drawPoint.y);
      const anchorPoint = new AnchorPoint(drawPoint, {
        pointIndex: i,
        hitTarget: HitTarget.ChangePoint
      });
      anchorPoints.push(anchorPoint);
      this._timeAxisViews[i].update(this._calculateTimeAxisViewData(point.time, drawPoint.x));
      this._priceAxisViews[i].update(this._calculatePriceAxisViewData(point.price, drawPoint.y));
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
class ArcTool extends DrawingTool {
  constructor() {
    super(...arguments);
    __publicField(this, "type", ArcToolType);
  }
  createPrimitive() {
    return new ArcPrimitive(
      {
        id: this.id,
        points: [],
        lineColor: "#E91E63FF",
        lineWidth: 2,
        backgroundColor: "#E91E6333"
      },
      ...this.resetArgs
    );
  }
}
export {
  ArcTool
};
