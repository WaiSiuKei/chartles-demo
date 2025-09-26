import { bJ as MediaCoordinatesPaneRenderer, L as LineStyleType, b3 as setLineStyle, bM as generateColor, bN as LineEnd, u as Point, bQ as interactionTolerance, y as HitTestResult, z as HitTarget, cc as pointInCircle, bR as distanceToSegment, cd as dpr1PixelRatioInfo } from "./index-DSkroicZ.js";
import { d as drawArrow } from "./line-CuaAD_DW.js";
class PolygonRenderer extends MediaCoordinatesPaneRenderer {
  drawImpl(scope) {
    const ctx = scope.context;
    const data = this._data;
    if (!data) return;
    const pointCount = data.points.length;
    if (!pointCount) return;
    if (pointCount === 1) {
      const point = data.points[0];
      const radius = data.lineWidth / 2;
      this._drawPoint(ctx, point, radius, data.lineColor);
    }
    ctx.beginPath();
    const defaultCapStyle = data.lineStyle === LineStyleType.solid ? "round" : "butt";
    const lineCap = data.lineCap ?? defaultCapStyle;
    ctx.lineCap = lineCap;
    ctx.strokeStyle = data.lineColor;
    ctx.lineWidth = data.lineWidth;
    ctx.lineJoin = data.lineJoin ?? "round";
    setLineStyle(ctx, data.lineStyle);
    const firstPoint = data.points[0];
    ctx.moveTo(firstPoint.x, firstPoint.y);
    for (const point of data.points) {
      ctx.lineTo(point.x, point.y);
    }
    if (data.background && data.filled) {
      ctx.fillStyle = generateColor(data.background, data.transparency);
      ctx.fill();
    }
    if (data.background && data.filled && !data.skipClosePath) {
      ctx.closePath();
    }
    if (pointCount > 1) {
      if (data.leftEnd === LineEnd.Arrow) {
        const arrow = this._correctArrowPoints(
          new Point(data.points[1]),
          new Point(data.points[0]),
          ctx.lineWidth,
          lineCap
        );
        drawArrow(arrow[0], arrow[1], ctx, ctx.lineWidth, dpr1PixelRatioInfo);
      }
      if (data.rightEnd === LineEnd.Arrow) {
        const arrow = this._correctArrowPoints(
          new Point(data.points[pointCount - 2]),
          new Point(data.points[pointCount - 1]),
          ctx.lineWidth,
          lineCap
        );
        drawArrow(arrow[0], arrow[1], ctx, ctx.lineWidth, dpr1PixelRatioInfo);
      }
    }
    if (data.lineWidth > 0) {
      ctx.stroke();
    }
  }
  _drawPoint(ctx, t, i, n) {
    if (i) {
      ctx.beginPath();
      ctx.fillStyle = n;
      ctx.arc(t.x, t.y, i, 0, 2 * Math.PI, true);
      ctx.fill();
      ctx.closePath();
    }
  }
  _correctArrowPoints(from, to, lineWidth, lineCap) {
    const direction = to.subtract(from);
    const length = direction.length();
    if (lineCap === "butt" || length < 1) {
      return [from, to];
    }
    const offsetLength = length + lineWidth / 2;
    const correctedTo = direction.scaled(offsetLength / length).add(from);
    return [from, correctedTo];
  }
  hitTest(point) {
    const data = this._data;
    if (!data) return null;
    const { points } = data;
    const tolerance = Math.max(interactionTolerance().line, Math.ceil(data.lineWidth / 2));
    const totalPoints = points.length;
    const hit = new HitTestResult(HitTarget.MovePoint);
    if (totalPoints === 1) {
      const onlyPoint = points[0];
      return pointInCircle(point, onlyPoint, tolerance) ? hit : null;
    }
    for (let i = 1; i < totalPoints; i++) {
      const start = points[i - 1];
      const end = points[i];
      const result = distanceToSegment(start, end, point);
      if (result.distance <= tolerance) {
        return hit;
      }
    }
    if (data.background && totalPoints > 0) {
      const first = points[0];
      const last = points[totalPoints - 1];
      const result = distanceToSegment(first, last, point);
      if (result.distance <= tolerance) {
        return hit;
      }
    }
    return null;
  }
}
export {
  PolygonRenderer as P
};
