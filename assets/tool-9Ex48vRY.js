var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { T as ToolPaneView, a as ToolPrimitive, D as DrawingTool } from "./toolPaneView-BAEHHn7m.js";
import { P as PriceLabelPriceAxisView } from "./priceLabelPriceAxisView-d9Maj5lR.js";
import { T as TimeLabelTimeAxisView } from "./timeLabelTimeAxisView-BvW_UnA0.js";
import { B as BitmapCoordinatesPaneRenderer, y as HitTestResult, z as HitTarget, ca as ceiledEven, b$ as SelectionRenderer, A as AnchorPoint } from "./index-DSkroicZ.js";
import { C as CompositeRenderer } from "./composite-BOGQNAfc.js";
var ArrowMarkDirection = /* @__PURE__ */ ((ArrowMarkDirection2) => {
  ArrowMarkDirection2["up"] = "up";
  ArrowMarkDirection2["down"] = "down";
  ArrowMarkDirection2["left"] = "left";
  ArrowMarkDirection2["right"] = "right";
  return ArrowMarkDirection2;
})(ArrowMarkDirection || {});
class ArrowMarkRenderer extends BitmapCoordinatesPaneRenderer {
  drawImpl(scope) {
    if (!this._data) return;
    const { color, direction, points } = this._data;
    const point = points[0];
    const ctx = scope.context;
    ctx.fillStyle = color;
    if (direction === "up" || direction === "down") {
      this._drawVerticalArrow(ctx, point, direction, scope);
    } else if (direction === "left" || direction === "right") {
      this._drawHorizontalArrow(ctx, point, direction, scope);
    }
  }
  _drawVerticalArrow(context, point, direction, scope) {
    const { horizontalPixelRatio: hRatio, verticalPixelRatio: vRatio } = scope;
    const halfPixelOffset = Math.max(1, Math.floor(hRatio)) % 2 ? 0.5 : 0;
    const orientation = direction === "up" ? 1 : -1;
    const baseLineLength = orientation * Math.round(12 * vRatio);
    const baseWidth = ceiledEven(19.5 * hRatio) / 2 + halfPixelOffset;
    const tailLength = orientation * Math.round(10 * vRatio);
    const tailWidth = ceiledEven(10 * hRatio) / 2 + halfPixelOffset;
    const centerX = Math.round(point.x * hRatio) + halfPixelOffset;
    const centerY = Math.round(point.y * vRatio);
    context.beginPath();
    context.moveTo(centerX, centerY);
    context.lineTo(centerX + baseWidth, centerY + baseLineLength);
    context.lineTo(centerX + tailWidth, centerY + baseLineLength);
    context.lineTo(centerX + tailWidth, centerY + baseLineLength + tailLength);
    context.lineTo(centerX - tailWidth, centerY + baseLineLength + tailLength);
    context.lineTo(centerX - tailWidth, centerY + baseLineLength);
    context.lineTo(centerX - baseWidth, centerY + baseLineLength);
    context.closePath();
    context.fill();
  }
  _drawHorizontalArrow(context, point, direction, scope) {
    const { horizontalPixelRatio: hRatio, verticalPixelRatio: vRatio } = scope;
    const halfPixelOffset = Math.max(1, Math.floor(hRatio)) % 2 ? 0.5 : 0;
    const orientation = direction === "left" ? 1 : -1;
    const shaftLength = orientation * Math.round(12 * hRatio) + halfPixelOffset;
    const shaftHeight = ceiledEven(19.5 * vRatio) / 2 + halfPixelOffset;
    const tailLength = orientation * Math.round(22 * hRatio) + halfPixelOffset;
    const tailHeight = ceiledEven(10 * vRatio) / 2 + halfPixelOffset;
    const centerX = Math.round(point.x * hRatio) + halfPixelOffset;
    const centerY = Math.round(point.y * vRatio) + halfPixelOffset;
    context.beginPath();
    context.moveTo(centerX, centerY);
    context.lineTo(centerX + shaftLength, centerY + shaftHeight);
    context.lineTo(centerX + shaftLength, centerY + tailHeight);
    context.lineTo(centerX + tailLength, centerY + tailHeight);
    context.lineTo(centerX + tailLength, centerY - tailHeight);
    context.lineTo(centerX + shaftLength, centerY - tailHeight);
    context.lineTo(centerX + shaftLength, centerY - shaftHeight);
    context.closePath();
    context.fill();
  }
  hitTest(testPoint) {
    if (!this._data) return null;
    const { direction, points } = this._data;
    const point = points[0];
    const arrowWidth = 19.5;
    const arrowHeight = 12 + 10;
    const arrowSide = 12 + 10;
    const arrowThickness = 19.5;
    let left, right, top, bottom;
    switch (direction) {
      case "up":
        left = point.x - arrowWidth / 2;
        right = left + arrowWidth;
        top = point.y;
        bottom = top + arrowHeight;
        break;
      case "down":
        left = point.x - arrowWidth / 2;
        right = left + arrowWidth;
        bottom = point.y;
        top = bottom - arrowHeight;
        break;
      case "left":
        left = point.x;
        right = left + arrowSide;
        top = point.y - arrowThickness / 2;
        bottom = top + arrowThickness;
        break;
      case "right":
        right = point.x;
        left = right - arrowSide;
        top = point.y - arrowThickness / 2;
        bottom = top + arrowThickness;
        break;
      default:
        return null;
    }
    const { x, y } = testPoint;
    const isWithinBounds = x >= left && x <= right && y >= top && y <= bottom;
    return isWithinBounds ? new HitTestResult(HitTarget.MovePoint) : null;
  }
}
class ArrowMarkPaneView extends ToolPaneView {
  constructor() {
    super(...arguments);
    __publicField(this, "_renderer", new CompositeRenderer(this._hitTestCollector));
    __publicField(this, "_arrowMarkRenderer", new ArrowMarkRenderer());
  }
  renderer() {
    return this._renderer;
  }
  _updateImpl() {
    this._renderer.clear();
    const props = this._source.properties();
    this._arrowMarkRenderer.setData({
      points: this.points(),
      color: props.color,
      direction: props.direction
    });
    this._renderer.append(this._arrowMarkRenderer);
    this._renderer.append(
      new SelectionRenderer({
        points: this.points(),
        bgColors: this._lineAnchorColors(this.points()),
        visible: this.areAnchorsVisible(),
        hitTarget: HitTarget.MovePoint
      })
    );
  }
}
class ArrowMarkPrimitive extends ToolPrimitive {
  constructor() {
    super(...arguments);
    __publicField(this, "_lines", new ArrowMarkPaneView(this, this.model));
    __publicField(this, "_paneView", [this._lines]);
    __publicField(this, "_timeAxisViews", [new TimeLabelTimeAxisView(/* @__PURE__ */ Object.create(null))]);
    __publicField(this, "_priceAxisViews", [new PriceLabelPriceAxisView(/* @__PURE__ */ Object.create(null))]);
  }
  pointsCount() {
    return 1;
  }
  updateAllViews() {
    if (!this.controlPoints.length) return;
    const [p0] = this.controlPoints;
    const drawPoint = this.pointToScreenPoint(p0);
    if (!drawPoint) return;
    const anchorPoint = new AnchorPoint(drawPoint, { pointIndex: 0 });
    this._timeAxisViews[0].update(this._calculateTimeAxisViewData(p0.time, drawPoint.x));
    this._priceAxisViews[0].update(this._calculatePriceAxisViewData(p0.price, drawPoint.y));
    this._lines.update({
      points: [anchorPoint]
    });
  }
}
class ArrowMarkTool extends DrawingTool {
  constructor() {
    super(...arguments);
    __publicField(this, "direction", ArrowMarkDirection.up);
  }
  createPrimitive() {
    return new ArrowMarkPrimitive(
      {
        id: this.id,
        points: [],
        color: "#089981FF",
        direction: this.direction
      },
      ...this.resetArgs
    );
  }
}
export {
  ArrowMarkTool as A,
  ArrowMarkDirection as a
};
