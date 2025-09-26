var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { P as PriceLabelPriceAxisView } from "./priceLabelPriceAxisView-d9Maj5lR.js";
import { T as TimeLabelTimeAxisView } from "./timeLabelTimeAxisView-BvW_UnA0.js";
import { L as LineStyleType, cp as sign, cn as resetTransparency, y as HitTestResult, z as HitTarget, cC as AnchorResizeAll, M as AreaName, r as ChartFontFamily, B as BitmapCoordinatesPaneRenderer, u as Point, v as pointInBox, A as AnchorPoint } from "./index-NZHt9VGv.js";
import { P as PriceRangeAxisPaneView, T as TimeRangeAxisPaneView } from "./axisPaneView-Pbgdotf1.js";
import { T as ToolPaneView, a as ToolPrimitive } from "./toolPaneView-3wj_on-u.js";
import { d as drawScaled } from "./ctx-Bv0u81rl.js";
import { m as makeFont } from "./font-0BY7UpRj.js";
import { C as CompositeRenderer } from "./composite-tvPrNHN0.js";
import { P as PolygonRenderer } from "./polygon-CB5TCmTw.js";
class LabelRenderer extends BitmapCoordinatesPaneRenderer {
  constructor(data, hitTestResult) {
    super(data);
    __publicField(this, "_hitTestResult");
    this._hitTestResult = hitTestResult;
  }
  /**
   * 判断鼠标坐标是否命中圆圈区域
   */
  hitTest(mousePoint) {
    const center = this._getCenter();
    const radius = this.data().circleRadius;
    const boundingBox = {
      min: new Point(center.x - radius, center.y - radius),
      max: new Point(center.x + radius, center.y + radius)
    };
    return pointInBox(mousePoint, boundingBox) ? this._hitTestResult : null;
  }
  drawImpl(scope) {
    const ctx = scope.context;
    const { horizontalPixelRatio: hRatio, verticalPixelRatio: vRatio } = scope;
    const pixelOffset = Math.max(1, Math.floor(hRatio)) % 2 / 2;
    const center = this._getCenter();
    const drawX = Math.round(center.x * hRatio) + pixelOffset;
    const drawY = Math.round(center.y * vRatio) + pixelOffset;
    const data = this.data();
    if (data.showCircle) {
      const radius = Math.round(drawX + data.circleRadius * hRatio) - drawX - data.circleBorderWidth * hRatio / 2;
      ctx.strokeStyle = data.color;
      ctx.lineWidth = data.circleBorderWidth * hRatio;
      ctx.beginPath();
      ctx.moveTo(drawX + radius, drawY);
      ctx.arc(drawX, drawY, radius, 0, 2 * Math.PI);
      ctx.stroke();
    }
    ctx.font = makeFont(data.fontSize, data.font, data.bold ? "bold" : void 0);
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillStyle = data.color;
    drawScaled(ctx, hRatio, vRatio, () => {
      const pixelYOffset = 0.05 * data.fontSize;
      ctx.fillText(data.letter, drawX / hRatio, drawY / vRatio + pixelYOffset);
    });
    ctx.restore();
  }
  /**
   * 计算文字/圆心相对于 anchor 的位置
   */
  _getCenter() {
    const data = this.data();
    const direction = data.vertAlign === "bottom" ? -1 : 1;
    const y = data.point.y + direction * (data.yOffset + data.circleRadius);
    const x = data.point.x;
    return new Point(x, y);
  }
}
const LabelStylePreset = {
  4: { font: 24, circle: 36, circleBorderWidth: 1, bold: true },
  3: { font: 20, circle: 28, circleBorderWidth: 1, bold: false },
  2: { font: 18, circle: 22, circleBorderWidth: 1, bold: false },
  1: { font: 16, circle: 22, circleBorderWidth: 1, bold: false },
  0: { font: 11, circle: 14, circleBorderWidth: 1, bold: true }
};
class Wave3PaneView extends ToolPaneView {
  constructor() {
    super(...arguments);
    __publicField(this, "_renderer", new CompositeRenderer(this._hitTestCollector));
    __publicField(this, "_polylineRenderer", new PolygonRenderer());
  }
  renderer() {
    return this._renderer;
  }
  _updateImpl() {
    this.renderer().clear();
    const props = this._source.properties();
    if (props.showWave) {
      const polylineData = {
        points: this.points(),
        lineColor: props.color,
        lineWidth: props.lineWidth,
        lineStyle: LineStyleType.solid,
        filled: false,
        background: "rgba(0, 0, 0, 0)",
        lineJoin: "round"
      };
      this._polylineRenderer.setData(polylineData);
      this._renderer.append(this._polylineRenderer);
    }
    const anchorOffset = this.areAnchorsVisible() ? 0 : 1;
    let direction = 1;
    if (this.points().length > 2) {
      const p2 = this.points()[2];
      const p1 = this.points()[1];
      direction = sign(p2.y - p1.y);
    }
    let skipLast = 0;
    if (this._model.currentCreating === this._source) {
      skipLast = 1;
    }
    const labelColor = resetTransparency(props.color);
    for (let i = 0; i < this.points().length - skipLast; i++, direction = -direction) {
      if (i < anchorOffset) continue;
      const labelObj = this._data.labels[i];
      let labelText = labelObj.label;
      if (labelObj.decoration === "circle") ;
      else if (labelObj.decoration === "brackets") {
        labelText = "(" + labelText + ")";
      }
      const labelStyle = LabelStylePreset[labelObj.group];
      const hitTest = new HitTestResult(HitTarget.ChangePoint, {
        areaName: AreaName.AnchorPoint,
        componentIndex: i,
        resizeDirections: AnchorResizeAll
      });
      this._renderer.append(
        new LabelRenderer(
          {
            point: this.points()[i],
            letter: labelText,
            color: labelColor,
            font: ChartFontFamily,
            fontSize: labelStyle.font,
            bold: labelStyle.bold,
            showCircle: labelObj.decoration === "circle",
            circleRadius: labelStyle.circle / 2,
            circleBorderWidth: labelStyle.circleBorderWidth,
            yOffset: 10,
            vertAlign: direction === 1 ? "top" : "bottom"
          },
          hitTest
        )
      );
    }
    const anchorPoints = this.points().slice();
    if (this._model.currentCreating === this._source) {
      anchorPoints.pop();
    }
    this._renderer.append(this.createLineAnchor({ points: anchorPoints }, 0));
  }
}
const u = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
class WavePrimitive extends ToolPrimitive {
  constructor() {
    super(...arguments);
    __publicField(this, "_lines", new Wave3PaneView(this, this.model));
    __publicField(this, "_paneView", [this._lines]);
    __publicField(this, "_priceAxisPaneViews", [new PriceRangeAxisPaneView(/* @__PURE__ */ Object.create(null))]);
    __publicField(this, "_timeAxisPaneViews", [new TimeRangeAxisPaneView(/* @__PURE__ */ Object.create(null))]);
    __publicField(this, "_timeAxisViews", []);
    __publicField(this, "_priceAxisViews", []);
  }
  updateAllViews() {
    if (!this.controlPoints.length) return;
    const screenPoints = [];
    for (let i = 0; i < this.controlPoints.length; i++) {
      const point = this.controlPoints[i];
      const screenPoint = this.pointToScreenPoint(point);
      if (!screenPoint) return;
      screenPoints.push(new AnchorPoint(screenPoint, { pointIndex: i }));
    }
    const data = {
      points: screenPoints,
      labels: []
    };
    const xs = screenPoints.map((p) => p.x);
    const ys = screenPoints.map((p) => p.y);
    this.controlPoints.forEach((p, i) => {
      this._timeAxisViews[i].update(this._calculateTimeAxisViewData(p.time, screenPoints[i].x));
      this._priceAxisViews[i].update(this._calculatePriceAxisViewData(p.price, screenPoints[i].y));
      data.labels[i] = this.getLabelStyle(i);
    });
    if (xs.length > 1) {
      this._timeAxisPaneViews[0].update(
        this._calculateTimeAxisPaneViewsData(Math.min.apply(null, xs), Math.max.apply(null, xs))
      );
    }
    if (ys.length > 1) {
      this._priceAxisPaneViews[0].update(
        this._calculatePriceAxisPaneViewData(Math.min.apply(null, ys), Math.max.apply(null, ys))
      );
    }
    this._lines.update(data);
  }
  getLabelStyle(pointIndex) {
    const degree = this.properties().degree;
    const totalLabelsCount = u.length;
    const labelTypeIndex = totalLabelsCount - degree - 1;
    const groupIndex = Math.floor(labelTypeIndex / 3);
    const labelText = this.labelsGroup()[groupIndex][pointIndex];
    return {
      group: groupIndex,
      bold: groupIndex % 2 !== 0,
      // 奇数组加粗，偶数组正常
      decoration: ["", "brackets", "circle"][labelTypeIndex % 3],
      label: labelText
    };
  }
}
class Wave3Primitive extends WavePrimitive {
  constructor() {
    super(...arguments);
    __publicField(this, "_timeAxisViews", [
      new TimeLabelTimeAxisView(/* @__PURE__ */ Object.create(null)),
      new TimeLabelTimeAxisView(/* @__PURE__ */ Object.create(null)),
      new TimeLabelTimeAxisView(/* @__PURE__ */ Object.create(null)),
      new TimeLabelTimeAxisView(/* @__PURE__ */ Object.create(null))
    ]);
    __publicField(this, "_priceAxisViews", [
      new PriceLabelPriceAxisView(/* @__PURE__ */ Object.create(null)),
      new PriceLabelPriceAxisView(/* @__PURE__ */ Object.create(null)),
      new PriceLabelPriceAxisView(/* @__PURE__ */ Object.create(null)),
      new PriceLabelPriceAxisView(/* @__PURE__ */ Object.create(null))
    ]);
  }
  pointsCount() {
    return 4;
  }
}
class Wave5Primitive extends WavePrimitive {
  constructor() {
    super(...arguments);
    __publicField(this, "_timeAxisViews", [
      new TimeLabelTimeAxisView(/* @__PURE__ */ Object.create(null)),
      new TimeLabelTimeAxisView(/* @__PURE__ */ Object.create(null)),
      new TimeLabelTimeAxisView(/* @__PURE__ */ Object.create(null)),
      new TimeLabelTimeAxisView(/* @__PURE__ */ Object.create(null)),
      new TimeLabelTimeAxisView(/* @__PURE__ */ Object.create(null)),
      new TimeLabelTimeAxisView(/* @__PURE__ */ Object.create(null))
    ]);
    __publicField(this, "_priceAxisViews", [
      new PriceLabelPriceAxisView(/* @__PURE__ */ Object.create(null)),
      new PriceLabelPriceAxisView(/* @__PURE__ */ Object.create(null)),
      new PriceLabelPriceAxisView(/* @__PURE__ */ Object.create(null)),
      new PriceLabelPriceAxisView(/* @__PURE__ */ Object.create(null)),
      new PriceLabelPriceAxisView(/* @__PURE__ */ Object.create(null)),
      new PriceLabelPriceAxisView(/* @__PURE__ */ Object.create(null))
    ]);
  }
  pointsCount() {
    return 6;
  }
}
export {
  Wave5Primitive as W,
  Wave3Primitive as a
};
