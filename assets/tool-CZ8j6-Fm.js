var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { H as HorizontalLineRenderer, y as HitTestResult, z as HitTarget, u as Point, r as ChartFontFamily, A as AnchorPoint, J as AnchorResizeVert, aR as HorizontalLineToolType, e as ensure } from "./index-DSkroicZ.js";
import { g as getTextBoundaries, n as needTextExclusionPath, V as VerticalAlign, H as HorizontalAlign } from "./text-DNYLW3w-.js";
import { g as getI18nService } from "./toolPaneView-BAEHHn7m.js";
import { b as BaseTextPaneView, T as TextMode, B as BaseTextPrimitive, a as BaseTextTool } from "./textPaneView-DmGg5Esj.js";
import { P as PriceLabelPriceAxisView } from "./priceLabelPriceAxisView-d9Maj5lR.js";
import { P as PlusTextRendererDecorator } from "./PlusTextRendererDecorator-C8ewAP0n.js";
import { C as CompositeRenderer } from "./composite-BOGQNAfc.js";
import { T as TextRenderer } from "./renderer-Bgvp02WJ.js";
import "./text-FiPV6-V4.js";
import "./ctx-DYUP60aL.js";
import "./baseTool-BVX9dcKc.js";
class HorizontalLinePaneView extends BaseTextPaneView {
  constructor() {
    super(...arguments);
    __publicField(this, "_renderer", new CompositeRenderer(this._hitTestCollector));
    __publicField(this, "_lineRenderer", new HorizontalLineRenderer(
      void 0,
      void 0,
      new HitTestResult(HitTarget.MovePoint)
    ));
    __publicField(this, "_labelRenderer", new TextRenderer());
    __publicField(this, "_mode", TextMode.Preview);
  }
  renderer() {
    return this._renderer;
  }
  _updateImpl() {
    this._renderer.clear();
    const points = this.points();
    if ((points == null ? void 0 : points.length) === 0) return;
    const properties = this._source.properties();
    let shouldCloseEditor = true;
    const {
      mediaSize: { width, height }
    } = this._source.getScope();
    const textValue = properties.text;
    const isEditingText = this._isTextEditMode();
    const isPlaceholderMode = this._placeHolderMode();
    let excludeBoundaries = void 0;
    if (properties.showLabel && textValue || isPlaceholderMode || isEditingText) {
      const verticalAlign = properties.vertLabelsAlign;
      const horizontalAlign = properties.horzLabelsAlign;
      let offsetX = 0;
      let positionX = 0;
      if (horizontalAlign === "left") {
        positionX = 3;
      } else if (horizontalAlign === "right") {
        positionX = width;
        offsetX = 3;
      } else {
        positionX = width / 2;
      }
      const point = new Point(positionX, points[0].y);
      this._labelRenderer.setData({
        points: [point],
        text: this._textDisplay(),
        color: this._textDisplayColor(),
        vertAlign: verticalAlign,
        horzAlign: horizontalAlign,
        fontFamily: ChartFontFamily,
        offsetX,
        offsetY: 0,
        bold: properties.bold,
        italic: properties.italic,
        fontSize: properties.fontSize,
        forceTextAlign: true,
        decorator: isPlaceholderMode ? PlusTextRendererDecorator.instance() : void 0
        // ...this._inplaceTextHighlight(),
      });
      this._labelRenderer.setCursorType(this._textCursorType());
      if (!this._isTextEditMode()) {
        this._renderer.append(this._labelRenderer);
      }
      if (this._needLabelExclusionPath(this._labelRenderer)) {
        excludeBoundaries = getTextBoundaries(this._labelRenderer, width, height) ?? void 0;
      }
      shouldCloseEditor = this._labelRenderer.isOutOfScreen(width, height);
      if (shouldCloseEditor) {
        this.closeTextEditor();
      } else {
        this._updateEditor(this._labelRenderer.getTextInfo());
      }
    }
    const lineData = {
      y: points[0].y,
      lineColor: properties.lineColor,
      lineWidth: properties.lineWidth,
      lineStyle: properties.lineStyle,
      excludeBoundaries
    };
    this._lineRenderer.setData(lineData);
    const price = this._source.controlPoints[0].price;
    this._lineRenderer.setHitTest(new HitTestResult(HitTarget.MovePoint, { snappingPrice: price }));
    const yThreshold = lineData.lineWidth / 2 + 1;
    shouldCloseEditor = shouldCloseEditor && (lineData.y < -yThreshold || lineData.y > height + yThreshold);
    this._renderer.insert(this._lineRenderer, 0);
    if (!shouldCloseEditor) {
      if (points.length === 1 && !this._isTextEditMode()) {
        const anchorPoint = new AnchorPoint(new Point(0.9 * width, points[0].y), {
          pointIndex: 0,
          resizeDirections: AnchorResizeVert
        });
        const anchor = this.createLineAnchor({ points: [anchorPoint] }, 0);
        this._renderer.append(anchor);
      }
    }
  }
  _needLabelExclusionPath(e, t) {
    const i = this._source.properties();
    return "middle" === (t ?? i.vertLabelsAlign) && needTextExclusionPath(e);
  }
}
class HorizontalLinePrimitive extends BaseTextPrimitive {
  constructor() {
    super(...arguments);
    __publicField(this, "_lines", new HorizontalLinePaneView(
      this,
      this.model,
      this.editingHelper
    ));
    __publicField(this, "_paneView", [this._lines]);
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
      this._priceAxisViews[i].update(
        this._calculatePriceAxisViewData(p.price, points[i].y, {
          visible: true,
          background: this._props.lineColor
        })
      );
    });
    this._paneView[0].update({ points });
  }
  isCreationFinished() {
    return this._lines.isCreationFinished();
  }
  startTextEditing() {
    return this._lines.startTextEditing();
  }
}
class HorizontalLineTool extends BaseTextTool {
  constructor() {
    super(...arguments);
    __publicField(this, "type", HorizontalLineToolType);
  }
  createPrimitive(drawingSession) {
    const i18nService = getI18nService(drawingSession);
    return new HorizontalLinePrimitive(
      {
        id: this.id,
        points: [],
        lineColor: "#2962FF",
        lineWidth: 2,
        lineStyle: 0,
        showPrice: true,
        showLabel: true,
        textColor: "#2962FF",
        fontSize: 12,
        bold: false,
        italic: false,
        horzLabelsAlign: HorizontalAlign.Center,
        vertLabelsAlign: VerticalAlign.Middle,
        wordWrap: true,
        text: "",
        placeholder: i18nService.t("tool.text.common.addText")
      },
      ...this.getTextResetArgs(drawingSession)
    );
  }
  finishDrawing() {
    ensure(this._drawingSession).finishDrawing();
  }
}
export {
  HorizontalLineTool
};
