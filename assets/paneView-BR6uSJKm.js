var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { D as DrawingTool, a as ToolPrimitive, T as ToolPaneView } from "./toolPaneView-3wj_on-u.js";
import { e as ensure, u as Point, A as AnchorPoint, z as HitTarget, bL as AnchorStyle, bM as generateColor, bJ as MediaCoordinatesPaneRenderer, y as HitTestResult } from "./index-NZHt9VGv.js";
import { t as transformPoint, r as rotationMatrix } from "./transform-DmMOnC2_.js";
import { P as PriceLabelPriceAxisView } from "./priceLabelPriceAxisView-d9Maj5lR.js";
import { T as TimeLabelTimeAxisView } from "./timeLabelTimeAxisView-BvW_UnA0.js";
import { t as thirdPointCursorType } from "./handle-CW7PoDcs.js";
import { C as CompositeRenderer } from "./composite-tvPrNHN0.js";
import { s as svgRenderer } from "./svg-C4bIXpLS.js";
class SvgIconTool extends DrawingTool {
}
class SvgIconPrimitive extends ToolPrimitive {
  constructor() {
    super(...arguments);
    __publicField(this, "_lines");
    __publicField(this, "_timeAxisViews", [new TimeLabelTimeAxisView(/* @__PURE__ */ Object.create(null))]);
    __publicField(this, "_priceAxisViews", [new PriceLabelPriceAxisView(/* @__PURE__ */ Object.create(null))]);
    __publicField(this, "_changePointData", null);
  }
  startChanging(index, targetPoint) {
    const centerScreenPoint = ensure(this.pointToScreenPoint(this.controlPoints[0]));
    const properties = this.properties();
    const initialSize = properties.size;
    let controlScreenPoint;
    if (targetPoint) {
      controlScreenPoint = ensure(this.pointToScreenPoint(targetPoint));
    } else {
      const offsetPoint = new Point(0, Math.max(80, initialSize) / 2);
      const angle = properties.angle;
      const rotationMat = rotationMatrix(angle);
      const transformedPoint = transformPoint(rotationMat, offsetPoint);
      controlScreenPoint = centerScreenPoint.add(transformedPoint);
    }
    const initialLength = centerScreenPoint.subtract(controlScreenPoint).length();
    this._changePointData = {
      centerPoint: centerScreenPoint,
      initialLength,
      initialSize
    };
  }
  setPoint(index, point) {
    const { centerPoint, initialLength, initialSize } = ensure(this._changePointData);
    const screenPoint = ensure(this.pointToScreenPoint(point));
    const properties = this.properties();
    if (index === 0 || index === 1) {
      const direction = screenPoint.subtract(centerPoint).normalized();
      let angle = Math.acos(-direction.x);
      if (Math.asin(direction.y) > 0) {
        angle = 2 * Math.PI - angle;
      }
      if (index === 0) {
        angle += Math.PI;
      }
      properties.angle = angle;
    } else {
      const scale = centerPoint.subtract(screenPoint).length() / initialLength;
      const newSize = initialSize * scale;
      properties.size = newSize;
    }
  }
  updateAllViews() {
    if (!this.controlPoints.length) return;
    const anchorPoints = [];
    for (let i = 0; i < this.controlPoints.length; i++) {
      const point = this.controlPoints[i];
      const drawPoint = this.pointToScreenPoint(point);
      if (!drawPoint) return;
      const anchorPoint = new AnchorPoint(drawPoint, {
        pointIndex: i,
        hitTarget: HitTarget.ChangePoint
      });
      anchorPoints.push(anchorPoint);
      this._timeAxisViews[i].update(this._calculateTimeAxisViewData(point.time, drawPoint.x));
      this._priceAxisViews[i].update(this._calculatePriceAxisViewData(point.price, drawPoint.y));
    }
    this._lines.update({ points: anchorPoints });
  }
}
class SvgIconRenderer extends MediaCoordinatesPaneRenderer {
  drawImpl(scope) {
    if (this._data === null) return;
    const { size, svg, point: center, angle, color, background, selected } = this._data;
    const ctx = scope.context;
    ctx.translate(center.x, center.y);
    const adjustedRotation = angle - Math.PI / 2;
    ctx.rotate(adjustedRotation);
    const halfSize = size / 2;
    if (selected) {
      ctx.fillStyle = background;
      ctx.strokeStyle = "#1E53E5";
      ctx.beginPath();
      ctx.rect(-halfSize, -halfSize, size, size);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    if (svg) {
      ctx.translate(-halfSize, -halfSize);
      if (color !== null) {
        ctx.fillStyle = color;
      }
      svg.render(ctx, {
        targetViewBox: {
          x: 0,
          y: 0,
          width: size,
          height: size
        },
        doNotApplyColors: color !== null
        // 如果 color 存在，则跳过内置颜色（统一外部颜色）
      });
    }
  }
  hitTest(testPoint) {
    if (this._data === null) return null;
    const {
      size: iconSize,
      // 图标尺寸（正方形边长）
      angle: rotationAngle,
      // 图标旋转角度（弧度）
      point: centerPoint
      // 图标中心点坐标
    } = this._data;
    const inverseRotationMat = rotationMatrix(-rotationAngle);
    const localPoint = transformPoint(inverseRotationMat, testPoint.subtract(centerPoint));
    const halfSize = iconSize / 2;
    const isInside = Math.abs(localPoint.x) <= halfSize && Math.abs(localPoint.y) <= halfSize;
    return isInside ? new HitTestResult(HitTarget.MovePoint) : null;
  }
  isOutOfScreen(screenHeight, screenWidth) {
    if (this._data === null) return true;
    const { size: iconSize, point: position, angle } = this._data;
    let radius;
    if (angle % (Math.PI / 2) === 0) {
      radius = iconSize / 2;
    } else {
      radius = Math.sqrt(iconSize ** 2 * 2) / 2;
    }
    const isOut = position.x + radius < 0 || position.x - radius > screenWidth || position.y + radius < 0 || position.y - radius > screenHeight;
    return isOut;
  }
}
class SvgIconPaneView extends ToolPaneView {
  constructor() {
    super(...arguments);
    __publicField(this, "_renderer", new CompositeRenderer(this._hitTestCollector));
    __publicField(this, "_iconRenderer", new SvgIconRenderer());
    __publicField(this, "_svgRenderer");
  }
  renderer() {
    return this._renderer;
  }
  _updateImpl() {
    this._renderer.clear();
    if (this.points().length < 1) return;
    const props = this._source.properties();
    const iconSize = props.size;
    const iconAngle = props.angle;
    const anchorVisible = this.areAnchorsVisible();
    if (!this._svgRenderer) {
      this._svgRenderer = svgRenderer(props.icon);
    }
    const iconSpec = {
      point: this.points()[0],
      color: this._iconColor(),
      background: this._calculateBackgroundColor(),
      svg: this._svgRenderer,
      size: iconSize,
      angle: iconAngle,
      selected: anchorVisible
    };
    this._iconRenderer.setData(iconSpec);
    const scope = this._source.getScope();
    const {
      mediaSize: { width, height }
    } = scope;
    if (!this._iconRenderer.isOutOfScreen(height, width)) {
      this._renderer.append(this._iconRenderer);
    }
    const [anchorPoint] = this.points();
    const anchorLimit = 80;
    const halfSize = Math.max(anchorLimit, iconSize) / 2;
    let offsetX = new Point(halfSize, 0);
    let offsetY = new Point(0, halfSize);
    const rotationMat = rotationMatrix(iconAngle);
    offsetX = transformPoint(rotationMat, offsetX);
    offsetY = transformPoint(rotationMat, offsetY);
    const pointTop = anchorPoint.add(offsetX);
    const pointBottom = anchorPoint.subtract(offsetX);
    const pointLeft = anchorPoint.add(offsetY);
    const pointRight = anchorPoint.subtract(offsetY);
    const cursorStyle = thirdPointCursorType(pointTop, pointBottom);
    const anchorPoints = [
      new AnchorPoint(pointTop, {
        pointIndex: 0
      }),
      new AnchorPoint(pointBottom, {
        pointIndex: 1
      }),
      new AnchorPoint(pointLeft, {
        pointIndex: 2,
        cursorType: cursorStyle,
        style: AnchorStyle.square
      }),
      new AnchorPoint(pointRight, {
        pointIndex: 3,
        cursorType: cursorStyle,
        style: AnchorStyle.square
      })
    ];
    const anchorRenderer = this.createLineAnchor({ points: anchorPoints }, 0);
    this._renderer.append(anchorRenderer);
  }
  _calculateBackgroundColor() {
    return generateColor(
      this._model.backgroundColorAtYPercentFromTop(
        this.points()[0].y / this._source.series.getPane().getHeight()
      ),
      60,
      true
    );
  }
}
export {
  SvgIconPaneView as S,
  SvgIconPrimitive as a,
  SvgIconTool as b
};
