import { bR as distanceToSegment, N as clamp, bJ as MediaCoordinatesPaneRenderer, b3 as setLineStyle, bN as LineEnd, y as HitTestResult, z as HitTarget, cd as dpr1PixelRatioInfo, bQ as interactionTolerance } from "./index-DSkroicZ.js";
import { d as drawArrow } from "./line-CuaAD_DW.js";
function quadroBezierHitTest(p0, p2, p1, testPoint, tolerance) {
  const estLength = p1.subtract(p0).length() + p1.subtract(p2).length();
  const step = Math.max(3 / estLength, 0.02);
  let prevPoint;
  for (let t = 0; ; t += step) {
    if (t > 1) t = 1;
    const a = p0.scaled((1 - t) * (1 - t));
    const b = p1.scaled(2 * t * (1 - t));
    const c = p2.scaled(t * t);
    const bezierPoint = a.add(b).add(c);
    if (prevPoint !== void 0) {
      const { distance } = distanceToSegment(bezierPoint, prevPoint, testPoint);
      if (distance < tolerance) return true;
    } else {
      if (bezierPoint.subtract(testPoint).length() < tolerance) return true;
    }
    prevPoint = bezierPoint;
    if (t === 1) break;
  }
  return false;
}
function cubicBezierHitTest(p0, p1, p2, p3, testPoint, tolerance) {
  const estLength = p1.subtract(p0).length() + p2.subtract(p1).length() + p3.subtract(p2).length();
  const step = Math.max(3 / estLength, 0.02);
  let prevPoint;
  for (let t = 0; ; t += step) {
    if (t > 1) t = 1;
    const bezPoint = evaluateCubicBezierPoint(p0, p1, p2, p3, t);
    if (prevPoint !== void 0) {
      const { distance } = distanceToSegment(bezPoint, prevPoint, testPoint);
      if (distance < tolerance) return true;
    } else {
      if (bezPoint.subtract(testPoint).length() < tolerance) return true;
    }
    prevPoint = bezPoint;
    if (t >= 1) break;
  }
  return false;
}
function evaluateCubicBezierPoint(p0, p1, p2, p3, t) {
  t = clamp(t, 0, 1);
  const u = 1 - t;
  const term0 = p0.scaled(u * u * u);
  const term1 = p1.scaled(3 * u * u * t);
  const term2 = p2.scaled(3 * u * t * t);
  const term3 = p3.scaled(t * t * t);
  return term0.add(term1).add(term2).add(term3);
}
function buildExtendedSegments(ctx, segments) {
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    const start = segment[0];
    ctx.moveTo(start.x, start.y);
    for (let j = 1; j < segment.length; j++) {
      const pt = segment[j];
      ctx.lineTo(pt.x, pt.y);
    }
  }
}
function hitTestExtendedPoints(point, tolerance, lineSegments) {
  for (const segment of lineSegments) {
    for (let i = 1; i < segment.length; i++) {
      const p1 = segment[i - 1];
      const p2 = segment[i];
      const { distance } = distanceToSegment(p1, p2, point);
      if (distance < tolerance) {
        return new HitTestResult(HitTarget.MovePoint);
      }
    }
  }
  return null;
}
class BezierQuadroRenderer extends MediaCoordinatesPaneRenderer {
  drawImpl(scope) {
    if (!this._data) return;
    const [p0, p1, p2] = this._data.points;
    const ctx = scope.context;
    ctx.lineCap = "round";
    ctx.strokeStyle = this._data.lineColor;
    ctx.lineWidth = this._data.lineWidth;
    setLineStyle(ctx, this._data.lineStyle);
    if (this._data.points.length === 2) {
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.stroke();
      return;
    }
    const chord = p1.subtract(p0);
    const control1 = p2.subtract(chord.scaled(0.25));
    const control2 = p2.add(chord.scaled(0.25));
    if (this._data.fillBack && this._data.points.length > 2) {
      ctx.fillStyle = this._data.backColor;
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.quadraticCurveTo(control1.x, control1.y, p2.x, p2.y);
      ctx.quadraticCurveTo(control2.x, control2.y, p1.x, p1.y);
      ctx.fill();
    }
    ctx.beginPath();
    buildExtendedSegments(ctx, this._data.extendLeftSegments);
    ctx.moveTo(p0.x, p0.y);
    ctx.quadraticCurveTo(control1.x, control1.y, p2.x, p2.y);
    ctx.quadraticCurveTo(control2.x, control2.y, p1.x, p1.y);
    buildExtendedSegments(ctx, this._data.extendRightSegments);
    if (this._data.leftEnd === LineEnd.Arrow) {
      drawArrow(control1, p0, ctx, ctx.lineWidth, dpr1PixelRatioInfo);
    }
    if (this._data.rightEnd === LineEnd.Arrow) {
      drawArrow(control2, p1, ctx, ctx.lineWidth, dpr1PixelRatioInfo);
    }
    ctx.stroke();
  }
  hitTest(point) {
    if (this._data && this._data.points.length === 3) {
      const tolerance = interactionTolerance().curve;
      const [p0, p1, p2] = this._data.points;
      const chord = p1.subtract(p0);
      const control1 = p2.subtract(chord.scaled(0.25));
      const control2 = p2.add(chord.scaled(0.25));
      if (quadroBezierHitTest(p2, p0, control1, point, tolerance)) {
        return new HitTestResult(HitTarget.MovePoint);
      }
      if (quadroBezierHitTest(p2, p1, control2, point, tolerance)) {
        return new HitTestResult(HitTarget.MovePoint);
      }
      let extendedHit = hitTestExtendedPoints(point, tolerance, this._data.extendLeftSegments);
      if (extendedHit === null) {
        extendedHit = hitTestExtendedPoints(point, tolerance, this._data.extendRightSegments);
      }
      return extendedHit;
    }
    return null;
  }
}
export {
  BezierQuadroRenderer as B,
  buildExtendedSegments as b,
  cubicBezierHitTest as c,
  hitTestExtendedPoints as h,
  quadroBezierHitTest as q
};
