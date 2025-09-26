var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { r as ChartFontFamily, y as HitTestResult, z as HitTarget, M as AreaName, A as AnchorPoint, b$ as SelectionRenderer, e as ensure, aY as TextToolType } from "./index-DSkroicZ.js";
import { g as getI18nService } from "./toolPaneView-BAEHHn7m.js";
import { b as BaseTextPaneView, B as BaseTextPrimitive, a as BaseTextTool } from "./textPaneView-DmGg5Esj.js";
import { P as PriceLabelPriceAxisView } from "./priceLabelPriceAxisView-d9Maj5lR.js";
import { T as TimeLabelTimeAxisView } from "./timeLabelTimeAxisView-BvW_UnA0.js";
import { C as CompositeRenderer } from "./composite-BOGQNAfc.js";
import { T as TextRenderer } from "./renderer-Bgvp02WJ.js";
import "./baseTool-BVX9dcKc.js";
import "./text-DNYLW3w-.js";
import "./text-FiPV6-V4.js";
import "./ctx-DYUP60aL.js";
class TextPaneView extends BaseTextPaneView {
  constructor() {
    super(...arguments);
    __publicField(this, "_renderer", new CompositeRenderer(this._hitTestCollector));
    __publicField(this, "_textRenderer", new TextRenderer());
  }
  renderer() {
    return this._renderer;
  }
  _updateImpl() {
    this._renderer.clear();
    const data = this._data;
    if (!data || data.points.length === 0) return;
    const props = this._source.properties();
    const textData = {
      points: this.points(),
      text: this._textDisplay(),
      color: this._textColor(),
      fontSize: props.fontSize,
      boxPadding: props.fontSize / 6,
      fontFamily: ChartFontFamily,
      vertAlign: "top",
      horzAlign: "left",
      offsetX: 0,
      offsetY: 0
    };
    this._textRenderer.setData(textData);
    this._textRenderer.setHitTestResult(
      new HitTestResult(HitTarget.MovePoint, {
        areaName: AreaName.Text,
        cursorType: this._textCursorType()
      })
    );
    if (this._isTextEditMode()) {
      this._updateEditor(this._textRenderer.getTextInfo());
    } else {
      this._renderer.append(this._textRenderer);
      const anchorPoint = data.points[0];
      const measurement = this._textRenderer.measure();
      const textWidth = measurement.width;
      const textHeight = measurement.height;
      const moveHandle = new AnchorPoint({
        x: anchorPoint.x + textWidth / 2,
        y: anchorPoint.y + textHeight
      });
      this._renderer.append(
        new SelectionRenderer({
          points: [moveHandle],
          bgColors: this._lineAnchorColors([moveHandle]),
          visible: this.areAnchorsVisible(),
          hitTarget: HitTarget.MovePoint
        })
      );
    }
  }
}
class TextPrimitive extends BaseTextPrimitive {
  constructor() {
    super(...arguments);
    __publicField(this, "_lines", new TextPaneView(this, this.model, this.editingHelper));
    __publicField(this, "_paneView", [this._lines]);
    __publicField(this, "_timeAxisViews", [new TimeLabelTimeAxisView(/* @__PURE__ */ Object.create(null))]);
    __publicField(this, "_priceAxisViews", [new PriceLabelPriceAxisView(/* @__PURE__ */ Object.create(null))]);
    __publicField(this, "_fixedPoint", null);
  }
  pointsCount() {
    return 1;
  }
  isFixed() {
    return this.properties().fixed;
  }
  addPoint(point, step) {
    if (this.isFixed()) {
      this._fixedPoint = this.pointToScreenPoint(point);
    }
    return super.addPoint(point, step);
  }
  updateAllViews() {
    if (!this.controlPoints.length) return;
    const anchorPoints = [];
    const [p0] = this.controlPoints;
    const screenPoint = this.isFixed() ? ensure(this._fixedPoint) : this.pointToScreenPoint(p0);
    if (!screenPoint) return;
    const anchorPoint = new AnchorPoint(screenPoint, {
      pointIndex: 0,
      hitTarget: HitTarget.ChangePoint
    });
    anchorPoints.push(anchorPoint);
    if (!this.isFixed()) {
      this._timeAxisViews[0].update(this._calculateTimeAxisViewData(p0.time, screenPoint.x));
      this._priceAxisViews[0].update(this._calculatePriceAxisViewData(p0.price, screenPoint.y));
    }
    this._lines.update({ points: anchorPoints });
  }
  isCreationFinished() {
    return this._lines.isCreationFinished();
  }
  startTextEditing() {
    return this._lines.startTextEditing();
  }
}
class TextTool extends BaseTextTool {
  constructor() {
    super(...arguments);
    __publicField(this, "type", TextToolType);
    __publicField(this, "fixed", false);
  }
  createPrimitive(drawingSession) {
    const i18nService = getI18nService(drawingSession);
    return new TextPrimitive(
      {
        id: this.id,
        points: [],
        text: "",
        placeholder: i18nService.t("tool.text.common.addText"),
        fontSize: 14,
        textColor: "#2962FFFF",
        wordWrap: false,
        fixed: this.fixed
      },
      ...this.getTextResetArgs(drawingSession)
    );
  }
}
export {
  TextTool
};
