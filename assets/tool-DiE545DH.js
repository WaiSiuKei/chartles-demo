var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { g as getI18nService } from "./toolPaneView-BAEHHn7m.js";
import { b as BaseTextPaneView, B as BaseTextPrimitive, a as BaseTextTool } from "./textPaneView-DmGg5Esj.js";
import { as as CommentToolType } from "./index-DNbtFiKr.js";
import { r as ChartFontFamily, y as HitTestResult, z as HitTarget, M as AreaName, bJ as MediaCoordinatesPaneRenderer, w as box, u as Point, v as pointInBox, G as PaneCursor, b2 as drawRoundRect, A as AnchorPoint } from "./index-DSkroicZ.js";
import { P as PriceLabelPriceAxisView } from "./priceLabelPriceAxisView-d9Maj5lR.js";
import { T as TimeLabelTimeAxisView } from "./timeLabelTimeAxisView-BvW_UnA0.js";
import { H as HorizontalAlign, V as VerticalAlign } from "./text-DNYLW3w-.js";
import { C as CompositeRenderer } from "./composite-BOGQNAfc.js";
import { T as TextRenderer } from "./renderer-Bgvp02WJ.js";
import "./baseTool-BVX9dcKc.js";
import "./text-FiPV6-V4.js";
import "./ctx-DYUP60aL.js";
class CommentRenderer extends MediaCoordinatesPaneRenderer {
  hitTest(point) {
    if (this._data === null || this._data.points.length === 0) {
      return null;
    }
    const {
      points: [anchorPoint],
      // 拿到标签框的定位点（通常为左下角）
      innerWidth: width,
      // 宽度（一般为文本框宽）
      innerHeight: height
      // 高度（一般为文本框高）
    } = this._data;
    const boxLeft = anchorPoint.x;
    const boxTop = anchorPoint.y - height;
    const hitBox = box(
      new Point(boxLeft, boxTop),
      // 左上角
      new Point(boxLeft + width, boxTop + height)
      // 右下角
    );
    if (pointInBox(point, hitBox)) {
      return new HitTestResult(HitTarget.MovePoint, {
        areaName: AreaName.Text,
        cursorType: PaneCursor.text
      });
    }
    return null;
  }
  drawImpl(scope) {
    if (this._data === null || this._data.points.length === 0) return;
    const ctx = scope.context;
    const {
      points: [anchorPoint],
      // 拿到第一个锚点（描述框的 anchor 点）
      innerWidth: width,
      // 框的内部宽度
      innerHeight: height,
      // 框的内部高度
      backgroundColor,
      // 背景色
      borderColor,
      // 边框颜色
      borderRadius
      // 圆角大小
    } = this._data;
    const drawX = anchorPoint.x;
    const drawY = anchorPoint.y - height;
    ctx.translate(drawX, drawY);
    drawRoundRect(ctx, 0, 0, width, height, [borderRadius, borderRadius, borderRadius, 2]);
    ctx.fillStyle = backgroundColor;
    ctx.fill();
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();
  }
}
class CommentPaneView extends BaseTextPaneView {
  constructor() {
    super(...arguments);
    __publicField(this, "_renderer", new CompositeRenderer(this._hitTestCollector));
    __publicField(this, "_labelRenderer", new TextRenderer());
    __publicField(this, "_commentRenderer", new CommentRenderer());
  }
  renderer() {
    return this._renderer;
  }
  _updateImpl() {
    this._renderer.clear();
    const props = this._source.properties();
    const labelData = {
      text: this._textDisplay(),
      fontSize: props.fontSize,
      offsetX: 0,
      offsetY: 0,
      points: this.points(),
      vertAlign: VerticalAlign.Bottom,
      horzAlign: HorizontalAlign.Left,
      fontFamily: ChartFontFamily,
      color: this._textDisplayColor(),
      boxPaddingVert: Math.round(props.fontSize / 1.3),
      // 上下 padding
      boxPaddingHorz: 12
    };
    this._labelRenderer.setData(labelData);
    this._labelRenderer.setHitTestResult(
      new HitTestResult(HitTarget.MovePoint, {
        areaName: AreaName.Text,
        cursorType: this._textCursorType()
      })
    );
    const currentTextInfo = this._labelRenderer.getTextInfo();
    this._updateEditor(currentTextInfo);
    const labelBBox = this._labelRenderer.measure();
    const commentBoxData = {
      points: this.points(),
      borderColor: props.borderColor,
      backgroundColor: props.backgroundColor,
      innerWidth: labelBBox.width,
      innerHeight: labelBBox.height,
      borderRadius: Math.min(
        labelBBox.width,
        this._labelRenderer.lineHeight() + 2 * Math.round(props.fontSize / 1.3)
      ) / 2
      // 圆角半径：文字高度 + padding，取较小值除以2
    };
    this._commentRenderer.setData(commentBoxData);
    if (commentBoxData.points.length === 1) {
      const anchor = this.createLineAnchor(
        {
          points: commentBoxData.points
        },
        0
      );
      this._renderer.append(anchor);
    }
    this._renderer.append(this._commentRenderer);
    if (!this._isTextEditMode()) {
      this._renderer.append(this._labelRenderer);
    }
  }
}
class CommentPrimitive extends BaseTextPrimitive {
  constructor() {
    super(...arguments);
    __publicField(this, "_lines", new CommentPaneView(this, this.model, this.editingHelper));
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
    const point = this.controlPoints[0];
    const screenPoint = this.pointToScreenPoint(point);
    if (!screenPoint) return;
    const anchorPoint = new AnchorPoint(screenPoint, {
      pointIndex: 0,
      hitTarget: HitTarget.ChangePoint
    });
    anchorPoints.push(anchorPoint);
    this._timeAxisViews[0].update(this._calculateTimeAxisViewData(point.time, screenPoint.x));
    this._priceAxisViews[0].update(this._calculatePriceAxisViewData(point.price, screenPoint.y));
    this._lines.update({ points: anchorPoints });
  }
  isCreationFinished() {
    return this._lines.isCreationFinished();
  }
  startTextEditing() {
    this._lines.startTextEditing();
  }
}
class CommentTool extends BaseTextTool {
  constructor() {
    super(...arguments);
    __publicField(this, "type", CommentToolType);
  }
  createPrimitive(drawingSession) {
    const i18nService = getI18nService(drawingSession);
    return new CommentPrimitive(
      {
        id: this.id,
        points: [],
        text: "",
        placeholder: i18nService.t("tool.text.common.addText"),
        fontSize: 16,
        textColor: "#ffffff",
        backgroundColor: "#2962FFFF",
        borderColor: "#2962FFFF",
        wordWrap: false
      },
      ...this.getTextResetArgs(drawingSession)
    );
  }
}
export {
  CommentTool
};
