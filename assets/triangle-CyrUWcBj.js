import { bJ as MediaCoordinatesPaneRenderer, bR as distanceToSegment, y as HitTestResult, z as HitTarget, L as LineStyleType, b3 as setLineStyle, u as Point, ch as clipPolygonByEdge, bQ as interactionTolerance } from "./index-NZHt9VGv.js";
import { i as intersectLineWithViewport } from "./line-DZhB7Jxo.js";
class TriangleRenderer extends MediaCoordinatesPaneRenderer {
  hitTest(point) {
    if (this._data == null || this._data.points.length < 2) return null;
    const [p1, p2] = this._data.points;
    let distanceInfo = distanceToSegment(p1, p2, point);
    const tolerance = interactionTolerance().line;
    if (distanceInfo.distance <= tolerance) return new HitTestResult(HitTarget.MovePoint);
    if (this._data.points.length !== 3) return null;
    const p3 = this._data.points[2];
    distanceInfo = distanceToSegment(p2, p3, point);
    if (distanceInfo.distance <= tolerance) return new HitTestResult(HitTarget.MovePoint);
    distanceInfo = distanceToSegment(p3, p1, point);
    if (distanceInfo.distance <= tolerance) return new HitTestResult(HitTarget.MovePoint);
    return null;
  }
  drawImpl(scope) {
    if (this._data == null || this._data.points.length < 2) return;
    const ctx = scope.context;
    const lineCap = (this._data.lineStyle ?? LineStyleType.solid) === LineStyleType.solid ? "round" : "butt";
    ctx.lineCap = lineCap;
    ctx.lineJoin = "round";
    ctx.strokeStyle = this._data.color;
    ctx.lineWidth = this._data.lineWidth;
    if (this._data.lineStyle !== void 0) {
      setLineStyle(ctx, this._data.lineStyle);
    }
    const [p1, p2, p3 = p2] = this._data.points;
    const { mediaSize } = scope;
    if (this._data.fillBackground && Math.abs((p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y)) > 1e-10) {
      let clipPolygon = [
        new Point(0, 0),
        new Point(mediaSize.width, 0),
        new Point(mediaSize.width, mediaSize.height),
        new Point(0, mediaSize.height)
      ];
      clipPolygon = clipPolygonByEdge(clipPolygon, p1, p2, [p2, p3]);
      clipPolygon = clipPolygonByEdge(clipPolygon, p2, p3, [p3, p1]);
      clipPolygon = clipPolygonByEdge(clipPolygon, p3, p1, [p1, p2]);
      if (clipPolygon && clipPolygon.length > 1) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(clipPolygon[0].x, clipPolygon[0].y);
        for (let i = 1; i < clipPolygon.length; i++) {
          ctx.lineTo(clipPolygon[i].x, clipPolygon[i].y);
        }
        ctx.fillStyle = this._data.backColor;
        ctx.fill();
        ctx.restore();
      }
    }
    const visibleLines = [];
    const lineDashTotal = ctx.getLineDash().reduce((sum, value) => sum + value, 0);
    [
      [p1, p2],
      [p2, p3],
      [p3, p1]
    ].forEach(([from, to]) => {
      const clipped = intersectLineWithViewport(
        from,
        to,
        false,
        false,
        mediaSize.width,
        mediaSize.height,
        lineDashTotal
      );
      if (clipped) visibleLines.push(clipped);
    });
    if (visibleLines.length > 0) {
      ctx.beginPath();
      visibleLines.forEach(([from, to]) => {
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
      });
      ctx.stroke();
    }
  }
}
export {
  TriangleRenderer as T
};
