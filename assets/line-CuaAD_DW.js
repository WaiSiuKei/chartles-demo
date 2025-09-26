var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { B as BitmapCoordinatesPaneRenderer, bO as addExclusionAreaByScope, L as LineStyleType, b3 as setLineStyle, b6 as NOTIMPLEMENTED, bP as addPixelPerfectLineToPath, bQ as interactionTolerance, bR as distanceToSegment, y as HitTestResult, z as HitTarget, e as ensure, u as Point, bN as LineEnd, bS as arePointsEqual, w as box, bT as intersectLineAndBox, bU as lineThroughPoints, bV as intersectRayAndBox, bW as lineSegment, bX as intersectLineSegmentAndBox, bY as euclideanDistanceBetweenPoints } from "./index-DSkroicZ.js";
class LineRenderer extends BitmapCoordinatesPaneRenderer {
  constructor() {
    super(...arguments);
    __publicField(this, "_scope");
  }
  drawImpl(scope) {
    const ctx = scope.context;
    if (!this._data) return;
    const shapeData = this._data;
    if ("points" in shapeData && shapeData.points.length < 2) return;
    this._scope = scope;
    const { horizontalPixelRatio } = scope;
    if (shapeData.excludeBoundaries !== void 0) {
      ctx.save();
      for (const exclusionArea of shapeData.excludeBoundaries) {
        addExclusionAreaByScope(scope, exclusionArea);
      }
    }
    const lineStyle = shapeData.lineStyle;
    const lineCap = shapeData.lineCap ?? (lineStyle === LineStyleType.solid ? "round" : "butt");
    ctx.lineCap = lineCap;
    ctx.lineJoin = "round";
    ctx.strokeStyle = shapeData.lineColor;
    ctx.lineWidth = Math.max(1, Math.floor(shapeData.lineWidth * horizontalPixelRatio));
    setLineStyle(ctx, lineStyle);
    const startPoint = shapeData.points[0];
    const endPoint = shapeData.points[1];
    ctx.beginPath();
    if (shapeData.overlayLineEndings) {
      NOTIMPLEMENTED();
    } else {
      this._drawEnds(ctx, [startPoint, endPoint], shapeData.lineWidth, scope);
    }
    this._drawEnds(ctx, [startPoint, endPoint], shapeData.lineWidth, scope);
    const clippedSegment = this._extendAndClipLineSegment(startPoint, endPoint, scope);
    if (clippedSegment !== null && shapeData.lineWidth > 0) {
      addPixelPerfectLineToPath(
        ctx,
        clippedSegment[0].x,
        clippedSegment[0].y,
        clippedSegment[1].x,
        clippedSegment[1].y,
        scope
      );
    }
    if (shapeData.overlayLineEndings) {
      NOTIMPLEMENTED();
    }
    ctx.stroke();
    if (shapeData.excludeBoundaries !== void 0) {
      ctx.restore();
    }
  }
  hitTest(point) {
    const scope = this._scope;
    const data = this._data;
    if (!data || !scope) return null;
    if (data.points.length < 2) return null;
    const baseTolerance = data.hitTestTolerance ?? interactionTolerance().line;
    const tolerance = baseTolerance + data.lineWidth / 2;
    const start = data.points[0];
    const end = data.points[1];
    const clippedSegment = this._extendAndClipLineSegment(start, end, scope);
    if (clippedSegment !== null) {
      const distance = distanceToSegment(clippedSegment[0], clippedSegment[1], point).distance;
      if (distance <= tolerance) {
        return new HitTestResult(HitTarget.MovePoint);
      }
    }
    return null;
  }
  _extendAndClipLineSegment(start, end, scope) {
    const shapeData = ensure(this._data);
    const { width: mediaWidth, height: mediaHeight } = scope.mediaSize;
    const { extendLeft, extendRight } = shapeData;
    return extendAndClipLineSegment(
      new Point(start),
      new Point(end),
      mediaWidth,
      mediaHeight,
      !!extendLeft,
      !!extendRight
    );
  }
  _drawEnds(ctx, points, lineWidth, scope) {
    const [startPoint, endPoint] = points;
    const shapeData = ensure(this._data);
    switch (shapeData.leftEnd) {
      case LineEnd.Arrow:
        drawArrow(endPoint, startPoint, ctx, lineWidth, scope);
        break;
    }
    switch (shapeData.rightEnd) {
      case LineEnd.Arrow:
        drawArrow(startPoint, endPoint, ctx, lineWidth, scope);
        break;
    }
  }
}
function drawArrow(startPoint, endPoint, ctx, lineWidth, scope, isFill = false) {
  if (euclideanDistanceBetweenPoints(startPoint, endPoint) < 1) return;
  const arrowSegments = getArrowPoints(
    new Point(startPoint),
    new Point(endPoint),
    lineWidth,
    isFill,
    true
  ).slice(0, 2);
  let lastTargetPoint = null;
  const { horizontalPixelRatio: c, verticalPixelRatio: h } = scope;
  for (let i = 0; i < arrowSegments.length; ++i) {
    const from = arrowSegments[i][0];
    const to = arrowSegments[i][1];
    if (null === lastTargetPoint || euclideanDistanceBetweenPoints(lastTargetPoint, from) > 1) {
      ctx.moveTo(from.x * c, from.y * h);
    }
    ctx.lineTo(to.x * c, to.y * h);
    lastTargetPoint = to;
  }
}
function getArrowPoints(start, end, thickness, isFlatHead, isFilledHead) {
  const halfThickness = 0.5 * thickness;
  const sqrt2 = Math.sqrt(2);
  const direction = end.subtract(start);
  const unitDir = direction.normalized();
  let headLength = 5 * thickness;
  if (isFlatHead) {
    headLength = Math.min(headLength, 0.35 * direction.length());
  }
  const headWingLength = halfThickness * 1;
  if (headLength * sqrt2 * 0.2 <= headWingLength) return [];
  const headOffset = unitDir.scaled(headLength);
  const basePoint = end.subtract(headOffset);
  const unitPerp = unitDir.transposed();
  const wingOffset = unitPerp.scaled(headLength);
  const wingLeft = basePoint.add(wingOffset);
  const wingRight = basePoint.subtract(wingOffset);
  const toWingCenterL = wingLeft.subtract(end).normalized().scaled(headWingLength);
  const toWingCenterR = wingRight.subtract(end).normalized().scaled(headWingLength);
  const leftTip = isFilledHead ? end : end.add(toWingCenterL);
  const rightTip = isFilledHead ? end : end.add(toWingCenterR);
  const bodyWidthOffset = halfThickness * (sqrt2 - 1);
  const bodyPerpOffset = unitPerp.scaled(bodyWidthOffset);
  const bodyHalfLength = Math.min(headLength - halfThickness / sqrt2, halfThickness * sqrt2);
  const bodyLengthVec = unitDir.scaled(bodyHalfLength);
  const leftBase = end.subtract(bodyPerpOffset);
  const rightBase = end.add(bodyPerpOffset);
  const backPoint = end.subtract(bodyLengthVec);
  const leftBack = backPoint.subtract(bodyPerpOffset);
  const rightBack = backPoint.add(bodyPerpOffset);
  return [
    [wingLeft, leftTip],
    // 左角连接到顶部（箭头左边）
    [rightTip, wingRight],
    // 顶部连接到右角（箭头右边）
    [leftBase, leftBack],
    // 箭身左侧线段
    [rightBase, rightBack]
    // 箭身右侧线段
  ];
}
function extendAndClipLineSegment(start, end, rectWidth, rectHeight, extendLeft, extendRight) {
  if (arePointsEqual(start, end)) return null;
  const boxTopLeft = new Point(0, 0);
  const boxBottomRight = new Point(rectWidth, rectHeight);
  const clippingBox = box(boxTopLeft, boxBottomRight);
  if (extendLeft) {
    if (extendRight) {
      const intersection = intersectLineAndBox(lineThroughPoints(start, end), clippingBox);
      return Array.isArray(intersection) ? intersection : null;
    } else {
      const intersection = intersectRayAndBox(end, start, clippingBox);
      return intersection && !arePointsEqual(end, intersection) ? lineSegment(end, intersection) : null;
    }
  }
  if (extendRight) {
    const intersection = intersectRayAndBox(start, end, clippingBox);
    return intersection && !arePointsEqual(start, intersection) ? lineSegment(start, intersection) : null;
  } else {
    const intersection = intersectLineSegmentAndBox(lineSegment(start, end), clippingBox);
    return Array.isArray(intersection) ? intersection : null;
  }
}
export {
  LineRenderer as L,
  drawArrow as d
};
