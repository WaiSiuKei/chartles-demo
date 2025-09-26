import { bJ as MediaCoordinatesPaneRenderer, bM as generateColor, e as ensure, bS as arePointsEqual, ce as distanceToLine, u as Point, ch as clipPolygonByEdge } from "./index-NZHt9VGv.js";
class ChannelRenderer extends MediaCoordinatesPaneRenderer {
  // public hitTest(point: Point, context: IPartialScope): HitTestResult | null {
  //   if (this._data === null || !this._data.hittestOnBackground) return null;
  //
  //   const polygon = this._visiblePolygon(context.mediaSize);
  //
  //   if (polygon !== null && pointInPolygon(point, polygon)) {
  //     return new HitTestResult(HitTarget.MovePointBackground);
  //   }
  //
  //   return null;
  // }
  drawImpl(ctx) {
    if (this._data === null) return;
    const canvas = ctx.context;
    const polygon = this._visiblePolygon(ctx.mediaSize);
    if (polygon !== null) {
      canvas.beginPath();
      canvas.moveTo(polygon[0].x, polygon[0].y);
      for (let i = 1; i < polygon.length; i++) {
        canvas.lineTo(polygon[i].x, polygon[i].y);
      }
      canvas.fillStyle = generateColor(this._data.color, this._data.transparency, true);
      canvas.fill();
    }
  }
  _visiblePolygon(mediaSize) {
    const data = ensure(this._data);
    const p1 = data.p1;
    const p2 = data.p2;
    const p3 = data.p3;
    const p4 = data.p4;
    const isTopLineDegenerate = arePointsEqual(p1, p2);
    const isBottomLineDegenerate = arePointsEqual(p3, p4);
    const distanceToP3 = distanceToLine(p1, p2, p3).distance;
    const distanceToP4 = distanceToLine(p1, p2, p4).distance;
    const isQuadrilateralDegenerate = distanceToP3 < 1e-6 && distanceToP4 < 1e-6;
    if (isTopLineDegenerate || isBottomLineDegenerate || isQuadrilateralDegenerate) {
      return null;
    }
    if (mediaSize.width <= 0 || mediaSize.height <= 0) return null;
    let clipped = [
      new Point(0, 0),
      new Point(mediaSize.width, 0),
      new Point(mediaSize.width, mediaSize.height),
      new Point(0, mediaSize.height)
    ];
    clipped = clipPolygonByEdge(clipped, p1, p2, [p4, p3]);
    clipped = clipPolygonByEdge(clipped, p4, p3, [p1, p2]);
    if (!arePointsEqual(p3, p1) && !data.extendLeft) {
      clipped = clipPolygonByEdge(clipped, p3, p1, [p2, p4]);
    }
    return clipped;
  }
}
export {
  ChannelRenderer as C
};
