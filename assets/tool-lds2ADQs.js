var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { B as BaseTextRenderer, g as getTextBoundaries, n as needTextExclusionPath, V as VerticalAlign, H as HorizontalAlign } from "./text-CtvZov1L.js";
import { T as ToolPaneView, a as ToolPrimitive, D as DrawingTool } from "./toolPaneView-3wj_on-u.js";
import { V as HorizontalRayToolType } from "./index-TSHQCVD9.js";
import { P as PriceLabelPriceAxisView } from "./priceLabelPriceAxisView-d9Maj5lR.js";
import { u as Point, r as ChartFontFamily, y as HitTestResult, z as HitTarget, B as BitmapCoordinatesPaneRenderer, L as LineStyleType, b3 as setLineStyle, bO as addExclusionAreaByScope, cr as drawHorizontalLine, bQ as interactionTolerance, A as AnchorPoint } from "./index-NZHt9VGv.js";
import { C as CompositeRenderer } from "./composite-tvPrNHN0.js";
import "./text-8RrTwjoh.js";
import "./ctx-Bv0u81rl.js";
import "./baseTool-CHlzZht2.js";
class HorzRayRenderer extends BitmapCoordinatesPaneRenderer {
  hitTest(pos) {
    if (this._data === null || this._data.points.length === 0) {
      return null;
    }
    const point = this._data.points[0];
    if (pos.x < point.x) {
      return null;
    }
    const tolerance = interactionTolerance().line;
    if (Math.abs(pos.y - point.y) <= tolerance) {
      return this._hitTest;
    }
    return null;
  }
  drawImpl(scope) {
    if (this._data === null || this._data.points.length === 0) {
      return;
    }
    const { context, horizontalPixelRatio: hRatio, verticalPixelRatio: vRatio, bitmapSize } = scope;
    const canvasWidth = bitmapSize.width;
    const point = this._data.points[0];
    const y = point.y;
    const fromX = Math.max(0, point.x);
    const toX = Math.max(canvasWidth, point.x);
    const isSolidLine = this._data.linestyle === void 0 || this._data.linestyle === LineStyleType.solid;
    context.lineCap = isSolidLine ? "round" : "butt";
    context.strokeStyle = this._data.color;
    context.lineWidth = Math.max(1, Math.floor(this._data.linewidth * hRatio));
    if (this._data.linestyle !== void 0) {
      setLineStyle(context, this._data.linestyle);
    }
    if (this._data.excludeBoundaries !== void 0) {
      addExclusionAreaByScope(scope, this._data.excludeBoundaries);
    }
    drawHorizontalLine(
      context,
      Math.round(y * vRatio),
      Math.round(fromX * hRatio),
      Math.round(toX * hRatio)
    );
  }
}
class HorizontalRayPaneView extends ToolPaneView {
  constructor() {
    super(...arguments);
    __publicField(this, "_horzRayRenderer", new HorzRayRenderer());
    __publicField(this, "_labelRenderer", new BaseTextRenderer());
    __publicField(this, "_renderer", new CompositeRenderer(this._hitTestCollector));
  }
  renderer() {
    return this._renderer;
  }
  _updateImpl() {
    this._renderer.clear();
    const points = this.points();
    if ((points == null ? void 0 : points.length) === 0) return;
    const properties = this._source.properties();
    let exclusionBounds = void 0;
    let anchorPoint = points[0].clone();
    if (properties.showLabel && points.length === 1) {
      const verticalAlign = properties.vertLabelsAlign;
      const horizontalAlign = properties.horzLabelsAlign;
      const offsetY = 0;
      let offsetX = 0;
      const text = properties.text;
      const isBold = properties.bold;
      const isItalic = properties.italic;
      const fontSize = properties.fontSize;
      const { mediaSize } = this._source.getScope();
      const canvasWidth = mediaSize.width;
      if (horizontalAlign === "right") {
        const textWidth = this._labelRenderer.measure().width;
        if (anchorPoint.x + textWidth + 3 >= canvasWidth) {
          anchorPoint = anchorPoint.add(new Point(textWidth + 3, 0));
        } else {
          anchorPoint = new Point(canvasWidth, anchorPoint.y);
          offsetX = 3;
        }
      } else if (horizontalAlign === "center") {
        anchorPoint = new Point((anchorPoint.x + canvasWidth) / 2, anchorPoint.y);
      }
      const labelData = {
        points: [anchorPoint],
        text,
        color: properties.textColor,
        vertAlign: verticalAlign,
        horzAlign: horizontalAlign,
        fontFamily: ChartFontFamily,
        offsetX,
        offsetY,
        bold: isBold,
        italic: isItalic,
        fontSize,
        forceTextAlign: true
      };
      this._labelRenderer.setData(labelData);
      this._renderer.append(this._labelRenderer);
      if (this._needLabelExclusionPath(this._labelRenderer)) {
        const { width, height } = mediaSize;
        exclusionBounds = getTextBoundaries(this._labelRenderer, width, height) ?? void 0;
      }
    }
    const horzRayData = {
      points,
      color: properties.linecolor,
      linewidth: properties.linewidth,
      linestyle: properties.linestyle,
      excludeBoundaries: exclusionBounds
    };
    this._horzRayRenderer.setData(horzRayData);
    this._horzRayRenderer.setHitTest(
      new HitTestResult(HitTarget.MovePoint, {
        snappingPrice: this._source.controlPoints[0].price
      })
    );
    this._renderer.append(this._horzRayRenderer);
    this.addAnchors(this._renderer);
  }
  _needLabelExclusionPath(e, t) {
    const i = this._source.properties();
    return "middle" === (t ?? i.vertLabelsAlign) && needTextExclusionPath(e);
  }
}
class HorizontalRayPrimitive extends ToolPrimitive {
  constructor() {
    super(...arguments);
    __publicField(this, "_line", new HorizontalRayPaneView(this, this.model));
    __publicField(this, "_paneView", [this._line]);
    __publicField(this, "_priceAxisViews", [new PriceLabelPriceAxisView(/* @__PURE__ */ Object.create(null))]);
  }
  pointsCount() {
    return 1;
  }
  updateAllViews() {
    if (!this.controlPoints.length) return;
    const points = [];
    for (let i = 0; i < this.controlPoints.length; i++) {
      const p = this.controlPoints[i];
      const drawPoint = this.pointToScreenPoint(p);
      if (!drawPoint) return;
      points.push(new AnchorPoint(drawPoint, { pointIndex: i }));
    }
    this.controlPoints.forEach((p, i) => {
      this._priceAxisViews[i].update(this._calculatePriceAxisViewData(p.price, points[i].y));
    });
    this._paneView[0].update({ points });
  }
}
class HorizontalRayTool extends DrawingTool {
  constructor() {
    super(...arguments);
    __publicField(this, "type", HorizontalRayToolType);
  }
  createPrimitive() {
    return new HorizontalRayPrimitive(
      {
        id: this.id,
        points: [],
        linecolor: "#2962FF",
        linewidth: 2,
        linestyle: 0,
        showPrice: true,
        showLabel: false,
        textColor: "#2962FF",
        fontSize: 12,
        bold: false,
        italic: false,
        text: "",
        horzLabelsAlign: HorizontalAlign.Center,
        vertLabelsAlign: VerticalAlign.Top
      },
      ...this.resetArgs
    );
  }
}
export {
  HorizontalRayTool
};
