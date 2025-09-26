import { bJ as MediaCoordinatesPaneRenderer, u as Point, y as HitTestResult, z as HitTarget, bM as generateColor } from "./index-DSkroicZ.js";
class GannArcRenderer extends MediaCoordinatesPaneRenderer {
  hitTest(p) {
    if (this._data === null) return null;
    const {
      center,
      edge,
      point
      /* prevPoint, fillBack*/
    } = this._data;
    const relative = p.subtract(center);
    const slope = edge.y / edge.x;
    const adjustedRelative = new Point(relative.x, relative.y / slope);
    const adjustedPoint = new Point(point.subtract(center).x, point.subtract(center).y / slope);
    const radius = adjustedPoint.length();
    const dist = adjustedRelative.length();
    const inQuadrant = edge.x * adjustedRelative.x >= 0 && edge.y * adjustedRelative.y >= 0;
    if (Math.abs(dist - radius) < 5 && inQuadrant) {
      return new HitTestResult(HitTarget.MovePoint);
    }
    return null;
  }
  drawImpl(ctx) {
    if (this._data === null) return;
    const canvas = ctx.context;
    const { center, edge, point, prevPoint, color, linewidth, transparency, fillBack } = this._data;
    const baseVector = edge.subtract(center);
    const slope = baseVector.y / baseVector.x;
    canvas.lineCap = "butt";
    canvas.strokeStyle = color;
    canvas.lineWidth = linewidth;
    canvas.translate(center.x, center.y);
    const adjustedPoint = new Point(point.subtract(center).x, point.subtract(center).y / slope);
    const adjustedPrev = new Point(
      prevPoint.subtract(center).x,
      prevPoint.subtract(center).y / slope
    );
    let radius = adjustedPoint.length();
    let prevRadius = adjustedPrev.length();
    canvas.scale(1, slope);
    const maxX = Math.abs(edge.x - center.x);
    if (Math.abs(radius) > maxX) {
      const clipX = Math.sign(edge.x - center.x) * maxX;
      canvas.rect(0, 0, clipX, clipX);
      canvas.clip();
    }
    if (fillBack) {
      if (point.x < center.x) {
        radius = -radius;
        prevRadius = -prevRadius;
      }
      canvas.beginPath();
      canvas.moveTo(prevRadius, 0);
      canvas.lineTo(radius, 0);
      canvas.arcTo(radius, radius, 0, radius, Math.abs(radius));
      canvas.lineTo(0, prevRadius);
      canvas.arcTo(prevRadius, prevRadius, prevRadius, 0, Math.abs(prevRadius));
      canvas.fillStyle = generateColor(color, transparency, true);
      canvas.fill();
    }
    canvas.beginPath();
    if (point.x > center.x) {
      canvas.arc(0, 0, Math.abs(radius), 0, Math.PI / 2, false);
    } else {
      canvas.arc(0, 0, Math.abs(radius), -Math.PI / 2, -Math.PI, true);
    }
    canvas.scale(1, 1 / slope);
    canvas.stroke();
  }
}
export {
  GannArcRenderer as G
};
