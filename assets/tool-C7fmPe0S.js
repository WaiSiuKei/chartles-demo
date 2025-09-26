var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { b$ as SelectionRenderer, z as HitTarget, bJ as MediaCoordinatesPaneRenderer, b2 as drawRoundRect, y as HitTestResult, A as AnchorPoint, aV as FlagMarkToolType } from "./index-NZHt9VGv.js";
import { T as ToolPaneView, a as ToolPrimitive, D as DrawingTool } from "./toolPaneView-3wj_on-u.js";
import { P as PriceLabelPriceAxisView } from "./priceLabelPriceAxisView-d9Maj5lR.js";
import { T as TimeLabelTimeAxisView } from "./timeLabelTimeAxisView-BvW_UnA0.js";
import { C as CompositeRenderer } from "./composite-tvPrNHN0.js";
import "./baseTool-CHlzZht2.js";
class FlagMarkRenderer extends MediaCoordinatesPaneRenderer {
  drawImpl(scope) {
    if (!this._data) return;
    const ctx = scope.context;
    const x = Math.round(this._data.point.x) - 0.5;
    const y = Math.round(this._data.point.y - 22) - 0.5;
    ctx.translate(x, y);
    ctx.fillStyle = "#434651";
    drawRoundRect(ctx, 0, 0, 2, 22, 1);
    ctx.fill();
    ctx.fillStyle = this._data.color;
    ctx.beginPath();
    ctx.moveTo(6.87, 0);
    ctx.bezierCurveTo(5.62, 0, 4.46, 0.23, 3.32, 0.69);
    ctx.bezierCurveTo(3.26, 0.71, 3.2, 0.75, 3.15, 0.8);
    ctx.bezierCurveTo(3.06, 0.89, 3, 1.02, 3, 1.16);
    ctx.lineTo(3, 1.19);
    ctx.lineTo(3, 12.5);
    ctx.bezierCurveTo(3, 12.8, 3.3, 13.02, 3.59, 12.93);
    ctx.bezierCurveTo(4.61, 12.64, 5.94, 12.44, 6.87, 12.44);
    ctx.bezierCurveTo(8.5, 12.44, 10.09, 12.83, 11.63, 13.21);
    ctx.bezierCurveTo(13.19, 13.6, 14.79, 14, 16.45, 14);
    ctx.bezierCurveTo(17.59, 14, 18.65, 13.81, 19.69, 13.43);
    ctx.bezierCurveTo(19.88, 13.36, 20, 13.18, 20, 12.98);
    ctx.lineTo(20, 1.19);
    ctx.bezierCurveTo(20, 1.06, 19.83, 0.93, 19.66, 0.99);
    ctx.bezierCurveTo(18.63, 1.38, 17.58, 1.56, 16.45, 1.56);
    ctx.bezierCurveTo(14.82, 1.56, 13.23, 1.17, 11.69, 0.79);
    ctx.bezierCurveTo(10.14, 0.4, 8.53, 0, 6.87, 0);
    ctx.closePath();
    ctx.fill();
  }
  hitTest(position) {
    if (!this._data) return null;
    const { x: targetX, y: targetY } = this._data.point;
    const inside = position.x >= targetX && position.x <= targetX + 20 && position.y >= targetY - 22 && position.y <= targetY;
    if (inside) {
      return new HitTestResult(HitTarget.MovePoint);
    } else {
      return null;
    }
  }
}
class FlagMarkPaneView extends ToolPaneView {
  constructor() {
    super(...arguments);
    __publicField(this, "_renderer", new CompositeRenderer(this._hitTestCollector));
    __publicField(this, "_flagMarkRenderer", new FlagMarkRenderer());
  }
  renderer() {
    return this._renderer;
  }
  _updateImpl() {
    this._renderer.clear();
    const props = this._source.properties();
    this._flagMarkRenderer.setData({
      point: this.points()[0],
      color: props.color
    });
    this._renderer.append(this._flagMarkRenderer);
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
class FlagMarkPrimitive extends ToolPrimitive {
  constructor() {
    super(...arguments);
    __publicField(this, "_lines", new FlagMarkPaneView(this, this.model));
    __publicField(this, "_paneView", [this._lines]);
    __publicField(this, "_timeAxisViews", [new TimeLabelTimeAxisView(/* @__PURE__ */ Object.create(null))]);
    __publicField(this, "_priceAxisViews", [new PriceLabelPriceAxisView(/* @__PURE__ */ Object.create(null))]);
  }
  pointsCount() {
    return 1;
  }
  updateAllViews() {
    if (!this.controlPoints.length) return;
    const anchorPoints = [];
    for (let i = 0; i < this.controlPoints.length; i++) {
      const p = this.controlPoints[i];
      const drawPoint = this.pointToScreenPoint(p);
      if (!drawPoint) return;
      const anchorPoint = new AnchorPoint(drawPoint, {
        pointIndex: i,
        hitTarget: HitTarget.ChangePoint
      });
      anchorPoints.push(anchorPoint);
      this._timeAxisViews[i].update(this._calculateTimeAxisViewData(p.time, drawPoint.x));
      this._priceAxisViews[i].update(this._calculatePriceAxisViewData(p.price, drawPoint.y));
    }
    this._lines.update({ points: anchorPoints });
  }
}
class FlagMarkTool extends DrawingTool {
  constructor() {
    super(...arguments);
    __publicField(this, "type", FlagMarkToolType);
  }
  createPrimitive() {
    return new FlagMarkPrimitive(
      {
        id: this.id,
        points: [],
        color: "#2962FFFF"
      },
      ...this.resetArgs
    );
  }
}
export {
  FlagMarkTool
};
