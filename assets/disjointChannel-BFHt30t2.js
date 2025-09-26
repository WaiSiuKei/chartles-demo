var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { B as BitmapCoordinatesPaneRenderer, bS as arePointsEqual, ce as distanceToLine, cf as intersectLines, bU as lineThroughPoints, L as LineStyleType, cg as CanvasRenderingTarget2D, e as ensure, u as Point, ch as clipPolygonByEdge, ci as createLine, cj as halfplaneThroughPoint, ck as intersectPolygonAndHalfplane } from "./index-DSkroicZ.js";
import { P as ParallelChannelRenderer } from "./parallelChannel-Cc0CK6jv.js";
class DisjointChannelRenderer extends BitmapCoordinatesPaneRenderer {
  constructor() {
    super();
    __publicField(this, "_parallelChannelRenderer");
    __publicField(this, "_intersectionRenderer");
    __publicField(this, "_selectedRenderer");
    this._parallelChannelRenderer = new ParallelChannelRenderer();
    this._intersectionRenderer = new DisjointChannelIntersectionRenderer();
    this._selectedRenderer = this._intersectionRenderer;
  }
  /**
   * 设置数据并自动检测几何形态，选择使用哪一个渲染器。
   * @param data 图形结构数据，包含 4 个点 + 渲染配置
   */
  setData(data) {
    if (data.points.length < 4) return;
    const [pt1, pt2, pt3, pt4] = data.points;
    const topDegenerate = arePointsEqual(pt1, pt2);
    const bottomDegenerate = arePointsEqual(pt3, pt4);
    const topDistanceToLine = distanceToLine(pt1, pt2, pt3).distance;
    const bottomDistanceToLine = distanceToLine(pt1, pt2, pt4).distance;
    const isBottomLinesOnTop = topDistanceToLine < 1e-6 && bottomDistanceToLine < 1e-6;
    if (topDegenerate || bottomDegenerate || isBottomLinesOnTop) {
      this._selectedRenderer = null;
      return;
    }
    const intersection = intersectLines(lineThroughPoints(pt1, pt2), lineThroughPoints(pt3, pt4));
    if (intersection !== null) {
      this._intersectionRenderer.setData(data);
      this._selectedRenderer = this._intersectionRenderer;
    } else {
      this._parallelChannelRenderer.setData({
        line1: {
          color: "rgba(0,0,0,0)",
          // 不渲染线
          lineStyle: LineStyleType.solid,
          lineWidth: 0,
          points: [pt1, pt2]
        },
        line2: {
          color: "rgba(0,0,0,0)",
          lineStyle: LineStyleType.solid,
          lineWidth: 0,
          points: [pt4, pt3]
          // 注意顺序是 pt4 - pt3
        },
        extendLeft: data.extendleft,
        extendRight: data.extendright,
        skipLines: true,
        // 不绘制边框线
        fillBackground: true,
        backColor: data.backcolor,
        hittestOnBackground: data.hittestOnBackground
      });
      this._selectedRenderer = this._parallelChannelRenderer;
    }
  }
  /**
   * 命中测试，只有当当前存在 selectedRenderer 才执行
   */
  hitTest(pos, scope) {
    return this._selectedRenderer ? this._selectedRenderer.hitTest(pos, scope) : null;
  }
  /**
   * 执行绘制渲染
   */
  drawImpl(scope) {
    if (this._selectedRenderer) {
      this._selectedRenderer.drawImpl(scope);
    }
  }
}
class DisjointChannelIntersectionRenderer extends BitmapCoordinatesPaneRenderer {
  /**
   * 鼠标命中检测：如果用户点击了当前绘图区域，返回命中信息
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  hitTest(pos) {
    if (!this._data || !this._data.hittestOnBackground) return null;
    return null;
  }
  /**
   * 实际绘图实现：绘制交叉通道区域填充
   */
  drawImpl(bitmapScope) {
    const target = new CanvasRenderingTarget2D(
      bitmapScope.context,
      bitmapScope.mediaSize,
      bitmapScope.bitmapSize
    );
    return target.useMediaCoordinateSpace((scope) => {
      if (!this._data || this._data.points.length < 4) return;
      const ctx = scope.context;
      const fillColor = this._data.backcolor;
      ctx.fillStyle = fillColor;
      for (const poly of this._visiblePolygons(scope.mediaSize)) {
        ctx.beginPath();
        ctx.moveTo(poly[0].x, poly[0].y);
        for (let i = 1; i < poly.length; i++) {
          ctx.lineTo(poly[i].x, poly[i].y);
        }
        ctx.fill();
      }
    });
  }
  /**
   * 计算当前需要绘制的可见多边形区域
   * 即两个交叉通道延申后在可视区域内截取的 polygon
   */
  _visiblePolygons(mediaSize) {
    const data = ensure(this._data);
    const [p1, p2, p3, p4] = data.points;
    if (mediaSize.width <= 0 || mediaSize.height <= 0) return [];
    const intersectPoint = intersectLines(lineThroughPoints(p1, p2), lineThroughPoints(p3, p4));
    if (intersectPoint === null) return [];
    const screenRect = [
      new Point(0, 0),
      new Point(mediaSize.width, 0),
      new Point(mediaSize.width, mediaSize.height),
      new Point(0, mediaSize.height)
    ];
    const polygons = [];
    {
      const vectorA = p1.subtract(p2).add(intersectPoint);
      const vectorB = p4.subtract(p3).add(intersectPoint);
      let poly = clipPolygonByEdge(screenRect, intersectPoint, vectorA, [vectorB, vectorB]);
      poly = transformPolygonInDataSpace(poly, data);
      poly = clipPolygonByEdge(poly, vectorB, intersectPoint, [vectorA, vectorA]);
      if (poly !== null) polygons.push(poly);
    }
    {
      const vectorA = p2.subtract(p1).add(intersectPoint);
      const vectorB = p3.subtract(p4).add(intersectPoint);
      let poly = clipPolygonByEdge(screenRect, intersectPoint, vectorA, [vectorB, vectorB]);
      poly = transformPolygonInDataSpace(poly, data);
      poly = clipPolygonByEdge(poly, vectorB, intersectPoint, [vectorA, vectorA]);
      if (poly !== null) polygons.push(poly);
    }
    return polygons;
  }
}
function clipPolygonAlongVerticalX(polygon, startX, boundaryX) {
  if (polygon === null) return null;
  const lineEquation = createLine(1, 0, -boundaryX);
  const halfplane = halfplaneThroughPoint(lineEquation, new Point(startX, 0));
  return intersectPolygonAndHalfplane(polygon, halfplane);
}
function transformPolygonInDataSpace(polygon, props) {
  const [p1, p2] = props.points;
  if (!props.extendleft) {
    polygon = clipPolygonAlongVerticalX(polygon, p1.x, p2.x);
  }
  if (!props.extendright) {
    polygon = clipPolygonAlongVerticalX(polygon, p2.x, p1.x);
  }
  return polygon;
}
export {
  DisjointChannelRenderer as D
};
