var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { B as BitmapCoordinatesPaneRenderer, e as ensure, bM as generateColor, w as box, bZ as fillRectWithBorder, y as HitTestResult, z as HitTarget, u as Point, bR as distanceToSegment, v as pointInBox, bS as arePointsEqual } from "./index-NZHt9VGv.js";
class RectangleRenderer extends BitmapCoordinatesPaneRenderer {
  constructor() {
    super(...arguments);
    __publicField(this, "_scope");
  }
  getColor() {
    const data = ensure(this._data);
    if (!data.backColor) return data.backColor;
    if (data.transparency === void 0) {
      return data.backColor;
    } else {
      return generateColor(data.backColor, data.transparency, true);
    }
  }
  drawImpl(scope) {
    const data = this._data;
    this._scope = scope;
    if (!data || data.points.length < 2 || data.lineWidth <= 0 && !data.backColor) {
      return;
    }
    const { horizontalPixelRatio: hRatio, verticalPixelRatio: vRatio, bitmapSize } = scope;
    const { extendLeft, extendRight, lineWidth, middleLine, color } = data;
    const [p0, p1] = data.points;
    const bounds = box(p0, p1);
    const borderWidthPx = lineWidth ? Math.max(1, Math.floor(lineWidth * hRatio)) : 0;
    const backgroundColor = this.getColor();
    const pixel = Math.max(1, Math.floor(hRatio));
    const leftPx = extendLeft ? -lineWidth : Math.round(bounds.min.x * hRatio);
    const rightPx = extendRight ? bitmapSize.width + lineWidth : Math.round(bounds.max.x * hRatio);
    const topPx = Math.round(bounds.min.y * vRatio);
    const bottomPx = Math.round(bounds.max.y * vRatio);
    fillRectWithBorder(
      scope,
      leftPx,
      rightPx,
      topPx,
      bottomPx,
      pixel,
      // 使用整数像素宽度
      backgroundColor ? { color: backgroundColor } : void 0,
      borderWidthPx === 0 ? void 0 : {
        color,
        lineStyle: data.lineStyle,
        borderWidth: borderWidthPx,
        borderMode: "center"
      },
      middleLine ? {
        ...middleLine,
        lineWidth: Math.max(1, Math.floor(middleLine.lineWidth * vRatio))
      } : void 0
    );
  }
  hitTest(point) {
    if (!this._data || this._data.points.length < 2 || !this._scope) {
      return null;
    }
    const hit = new HitTestResult(HitTarget.MovePoint);
    const canvasWidth = this._scope.mediaSize.width;
    const [p0, p1] = this._data.points;
    const boundingBox = box(p0, p1);
    const topLeft = boundingBox.min;
    const bottomRight = boundingBox.max;
    const topRight = new Point(bottomRight.x, topLeft.y);
    const bottomLeft = new Point(topLeft.x, bottomRight.y);
    const topEdgeHit = this._extendAndHitTestLineSegment(point, topLeft, topRight, canvasWidth);
    if (topEdgeHit) {
      return hit;
    }
    const bottomEdgeHit = this._extendAndHitTestLineSegment(
      point,
      bottomLeft,
      bottomRight,
      canvasWidth
    );
    if (bottomEdgeHit) {
      return hit;
    }
    let result = distanceToSegment(topRight, bottomRight, point);
    if (result.distance <= 3) {
      return hit;
    }
    result = distanceToSegment(topLeft, bottomLeft, point);
    if (result.distance <= 3) {
      return hit;
    }
    if (this._data.middleLine) {
      const centerY = boundingBox.min.add(boundingBox.max).scaled(0.5).y;
      const middleLineStart = new Point(boundingBox.min.x, centerY);
      const middleLineEnd = new Point(boundingBox.max.x, centerY);
      const middleLineHit = this._extendAndHitTestLineSegment(
        point,
        middleLineStart,
        middleLineEnd,
        canvasWidth
      );
      if (middleLineHit) return hit;
    }
    if (this._data.fillBackground) {
      return this._hitTestBackground(point, topLeft, bottomRight, canvasWidth);
    }
    return null;
  }
  _hitTestBackground(point, p1, p2, pixelRatio) {
    var _a, _b;
    const clippedSegment = this._extendAndClipLineSegment(p1, p2, pixelRatio);
    if (clippedSegment !== null && pointInBox(point, box(clippedSegment[0], clippedSegment[1]))) {
      return this._backgroundHitTest ?? (((_a = this._data) == null ? void 0 : _a.backgroundHitTarget) ? new HitTestResult((_b = this._data) == null ? void 0 : _b.backgroundHitTarget) : null);
    }
    return null;
  }
  _extendAndHitTestLineSegment(point, start, end, canvasWidth) {
    const extendedSegment = this._extendAndClipLineSegment(start, end, canvasWidth);
    if (extendedSegment !== null) {
      const [clippedStart, clippedEnd] = extendedSegment;
      const distanceInfo = distanceToSegment(clippedStart, clippedEnd, point);
      if (distanceInfo.distance <= 3) {
        return true;
      }
    }
    return false;
  }
  /**
   * 根据元素配置对水平线段进行左右方向的扩展和裁剪，确保线段在画布可视区域内。
   *
   * @param start 起点坐标（左侧）
   * @param end 终点坐标（右侧）
   * @param canvasWidth 当前画布宽度（用于限制线段的左右扩展）
   * @returns 返回被扩展和裁剪后的线段两个端点（Point[]），无有效线段则返回 null
   */
  _extendAndClipLineSegment(start, end, canvasWidth) {
    const data = ensure(this._data);
    if (arePointsEqual(start, end) && !data.extendLeft && !data.extendRight) {
      return null;
    }
    const minX = Math.min(start.x, end.x);
    const maxX = Math.max(start.x, end.x);
    const extendedLeftX = data.extendLeft ? 0 : Math.max(minX, 0);
    const extendedRightX = data.extendRight ? canvasWidth : Math.min(maxX, canvasWidth);
    if (extendedLeftX > extendedRightX || extendedRightX <= 0 || extendedLeftX >= canvasWidth) {
      return null;
    }
    return [new Point(extendedLeftX, start.y), new Point(extendedRightX, end.y)];
  }
}
export {
  RectangleRenderer as R
};
