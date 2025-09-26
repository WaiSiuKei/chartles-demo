var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { g as getI18nService } from "./toolPaneView-BAEHHn7m.js";
import { b as BaseTextPaneView, T as TextMode, B as BaseTextPrimitive, a as BaseTextTool } from "./textPaneView-DmGg5Esj.js";
import { at as NoteToolType } from "./index-DNbtFiKr.js";
import { y as HitTestResult, z as HitTarget, M as AreaName, B as BitmapCoordinatesPaneRenderer, G as PaneCursor, r as ChartFontFamily, u as Point, e as ensure, bR as distanceToSegment, w as box, v as pointInBox, bP as addPixelPerfectLineToPath, bQ as interactionTolerance, A as AnchorPoint } from "./index-DSkroicZ.js";
import { P as PriceLabelPriceAxisView } from "./priceLabelPriceAxisView-d9Maj5lR.js";
import { T as TimeLabelTimeAxisView } from "./timeLabelTimeAxisView-BvW_UnA0.js";
import { P as PriceRangeAxisPaneView, T as TimeRangeAxisPaneView } from "./axisPaneView-Pbgdotf1.js";
import { B as BaseTextRenderer, V as VerticalAlign, H as HorizontalAlign, e as alignByAngle } from "./text-DNYLW3w-.js";
import { i as isRtl } from "./text-FiPV6-V4.js";
import { C as CompositeRenderer } from "./composite-BOGQNAfc.js";
import "./baseTool-BVX9dcKc.js";
import "./ctx-DYUP60aL.js";
const Styles = {
  CircleRadius: 2,
  RoundRectRadius: 4,
  LabelVertPadding: 6,
  LabelHorzPadding: 8,
  TextMargins: 2,
  Blur: 4,
  ShadowOffsetY: 2
};
class NoteRenderer extends BitmapCoordinatesPaneRenderer {
  constructor() {
    super(...arguments);
    __publicField(this, "_textLabelRenderer", new BaseTextRenderer());
    __publicField(this, "_textInfoCache", null);
    __publicField(this, "_lineHitTest", new HitTestResult(HitTarget.MovePoint));
    __publicField(this, "_textHitTest", new HitTestResult(HitTarget.MovePoint, {
      areaName: AreaName.Text,
      cursorType: PaneCursor.text
    }));
  }
  setTextHitTestResult(h) {
    this._textHitTest = h;
  }
  // 计算注释文字区域尺寸，包括内容 + 边框 + 边距，同时加入缓存
  _calcTextSize() {
    if (this._data === null || this._data.points.length < 2) {
      return null;
    }
    if (this._textInfoCache === null) {
      const lineInfo = this._textLabelRenderer.getLinesInfo();
      const textHeight = this._data.textData.fontSize * lineInfo.lines.length;
      const textWidth = lineInfo.linesMaxWidth;
      const roundRectRadius = Styles.RoundRectRadius;
      const textMargins = Styles.TextMargins;
      const paddingTotal = 2 * textMargins + 2 * roundRectRadius;
      this._textInfoCache = {
        textWidth,
        textHeight,
        totalWidth: textWidth + paddingTotal,
        totalHeight: textHeight + paddingTotal
      };
    }
    return this._textInfoCache;
  }
  setData(data) {
    if (this._data === null || this._data.textData.text !== data.textData.text || this._data.textData.fontSize !== data.textData.fontSize) {
      this._textInfoCache = null;
    }
    this._data = data;
    const textPoint = data.points[1];
    this._textLabelRenderer.setData({
      horzAlign: HorizontalAlign.Left,
      vertAlign: VerticalAlign.Middle,
      points: [textPoint],
      // 用于定位标签
      text: data.textData.text || " ",
      color: data.textData.color,
      fontFamily: ChartFontFamily,
      fontSize: data.textData.fontSize,
      bold: data.textData.bold,
      italic: data.textData.italic,
      offsetX: 0,
      offsetY: 0,
      borderColor: data.drawBorder ? data.borderColor : void 0,
      borderWidth: 1,
      backgroundColor: data.drawBackground ? data.backgroundColor : void 0,
      backgroundRoundRect: Styles.RoundRectRadius,
      boxPaddingVert: Styles.LabelVertPadding,
      boxPaddingHorz: Styles.LabelHorzPadding,
      boxShadow: data.drawBorder || data.drawBackground ? {
        shadowColor: data.shadowColor,
        shadowBlur: Styles.Blur,
        shadowOffsetY: Styles.ShadowOffsetY
      } : void 0,
      skipTextDrawing: data.skipTextDrawing
    });
    const textRect = this._textLabelRenderer.rect();
    const lineStartPoint = data.points[0];
    const lineEndPoint = data.points[1];
    const angleDeg = Math.round(
      Math.atan2(lineEndPoint.y - lineStartPoint.y, lineEndPoint.x - lineStartPoint.x) * 180 / Math.PI
    );
    const alignment = alignByAngle(angleDeg);
    let anchorPosition = lineEndPoint;
    switch (alignment.horzAlign) {
      case HorizontalAlign.Center:
        anchorPosition = anchorPosition.add(new Point(-0.5 * textRect.width, 0));
        break;
      case HorizontalAlign.Right:
        anchorPosition = anchorPosition.add(new Point(-textRect.width, 0));
        break;
    }
    switch (alignment.vertAlign) {
      case VerticalAlign.Top:
        anchorPosition = anchorPosition.add(new Point(0, 0.5 * textRect.height));
        break;
      case VerticalAlign.Bottom:
        anchorPosition = anchorPosition.add(new Point(0, -0.5 * textRect.height));
        break;
    }
    this._textLabelRenderer.setPoint(anchorPosition);
  }
  getTextInfo() {
    var _a, _b;
    const data = ensure(this._data);
    const textAlign = isRtl() ? "right" : "left";
    const borderRadius = Styles.RoundRectRadius;
    const textMargins = Styles.TextMargins;
    const textSize = ensure(this._calcTextSize());
    const labelRect = this._textLabelRenderer.rect();
    const anchorPoint = ensure((_b = (_a = this._textLabelRenderer.data()) == null ? void 0 : _a.points) == null ? void 0 : _b[0]).add(
      new Point(0, -0.5 * labelRect.height)
    );
    const { totalWidth, totalHeight } = textSize;
    const padding = borderRadius + textMargins;
    return {
      font: ChartFontFamily,
      fontSize: data.textData.fontSize,
      lineSpacing: 0,
      textTop: Math.round(anchorPoint.y + padding),
      textBottom: anchorPoint.y + totalHeight - padding,
      textLeft: Math.floor(anchorPoint.x + padding),
      textRight: Math.ceil(anchorPoint.x + totalWidth - padding),
      textAlign
    };
  }
  hitTest(point) {
    const data = this._data;
    if (data === null || data.points.length < 2) {
      return null;
    }
    const tolerance = interactionTolerance().line + 0.5;
    const startPoint = data.points[0];
    const endPoint = data.points[1];
    const hitInfo = distanceToSegment(startPoint, endPoint, point);
    if (hitInfo.distance <= tolerance) {
      return this._lineHitTest;
    }
    const labelRect = this._textLabelRenderer.rect();
    const boundingBox = box(
      new Point(labelRect.x, labelRect.y),
      new Point(labelRect.x + labelRect.width, labelRect.y + labelRect.height)
    );
    if (pointInBox(point, boundingBox)) {
      return this._textHitTest;
    }
    return null;
  }
  drawImpl(scope) {
    const data = this._data;
    if (data === null || data.points.length < 2) {
      return;
    }
    const ctx = scope.context;
    const startPoint = data.points[0];
    const endPoint = data.points[1];
    ctx.strokeStyle = data.lineColor;
    ctx.lineWidth = Math.max(1, Math.floor(scope.horizontalPixelRatio));
    ctx.beginPath();
    const [headX, headY] = addPixelPerfectLineToPath(
      ctx,
      startPoint.x,
      startPoint.y,
      endPoint.x,
      endPoint.y,
      scope
    );
    ctx.stroke();
    const radius = Math.round(Styles.CircleRadius * scope.horizontalPixelRatio);
    ctx.fillStyle = data.lineColor;
    ctx.beginPath();
    ctx.arc(headX, headY, radius, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.beginPath();
    ctx.strokeStyle = data.circleBorderColor;
    ctx.lineWidth = 1;
    const strokeRadius = Math.round(
      Styles.CircleRadius * scope.horizontalPixelRatio + 0.5 * scope.horizontalPixelRatio
    );
    ctx.arc(headX, headY, strokeRadius, 0, 2 * Math.PI, false);
    ctx.stroke();
    this._textLabelRenderer.drawImpl(scope);
  }
}
class NotePaneView extends BaseTextPaneView {
  constructor() {
    super(...arguments);
    __publicField(this, "_renderer", new CompositeRenderer(this._hitTestCollector));
    __publicField(this, "_noteRenderer", new NoteRenderer());
    __publicField(this, "_mode", TextMode.Preview);
  }
  renderer() {
    return this._renderer;
  }
  _updateImpl() {
    this._renderer.clear();
    if (!this._data) return;
    if (this._data.points.length < 2) return;
    const properties = this._source.properties();
    const circleBorderColor = "#ffffff";
    const shadowColor = "rgba(0, 0, 0, 0.2)";
    const noteRenderData = {
      textData: {
        fontSize: properties.fontSize,
        text: this._textDisplay(),
        color: this._textDisplayColor(),
        bold: properties.bold,
        italic: properties.italic
      },
      shadowColor,
      points: this.points(),
      lineColor: properties.lineColor,
      drawBackground: properties.drawBackground,
      drawBorder: properties.drawBorder,
      backgroundColor: properties.backgroundColor,
      borderColor: properties.borderColor,
      circleBorderColor,
      skipTextDrawing: this._isTextEditMode()
    };
    this._renderer.append(this._noteRenderer);
    this._noteRenderer.setData(noteRenderData);
    this._noteRenderer.setTextHitTestResult(
      new HitTestResult(HitTarget.MovePoint, {
        areaName: AreaName.Text,
        cursorType: this._textCursorType()
      })
    );
    this._renderer.append(this.createLineAnchor({ points: this.points() }, 0));
    const textInfo = this._noteRenderer.getTextInfo();
    this._updateEditor(textInfo);
  }
}
class NotePrimitive extends BaseTextPrimitive {
  constructor() {
    super(...arguments);
    __publicField(this, "_lines", new NotePaneView(this, this.model, this.editingHelper));
    __publicField(this, "_paneView", [this._lines]);
    __publicField(this, "_timeAxisViews", [
      new TimeLabelTimeAxisView(/* @__PURE__ */ Object.create(null)),
      new TimeLabelTimeAxisView(/* @__PURE__ */ Object.create(null))
    ]);
    __publicField(this, "_priceAxisViews", [
      new PriceLabelPriceAxisView(/* @__PURE__ */ Object.create(null)),
      new PriceLabelPriceAxisView(/* @__PURE__ */ Object.create(null))
    ]);
    __publicField(this, "_priceAxisPaneViews", [new PriceRangeAxisPaneView()]);
    __publicField(this, "_timeAxisPaneViews", [new TimeRangeAxisPaneView()]);
  }
  pointsCount() {
    return 2;
  }
  updateAllViews() {
    if (!this.controlPoints.length) return;
    const anchorPoints = [];
    const xs = [];
    const ys = [];
    for (let i = 0; i < this.controlPoints.length; i++) {
      const p = this.controlPoints[i];
      const screenPoint = this.pointToScreenPoint(p);
      if (!screenPoint) return;
      xs.push(screenPoint.x);
      ys.push(screenPoint.y);
      const anchorPoint = new AnchorPoint(screenPoint, {
        pointIndex: i,
        hitTarget: HitTarget.ChangePoint
      });
      anchorPoints.push(anchorPoint);
      this._timeAxisViews[i].update(this._calculateTimeAxisViewData(p.time, screenPoint.x));
      this._priceAxisViews[i].update(this._calculatePriceAxisViewData(p.price, screenPoint.y));
    }
    if (xs.length) {
      this._timeAxisPaneViews[0].update(
        this._calculateTimeAxisPaneViewsData(Math.min.apply(null, xs), Math.max.apply(null, xs))
      );
    }
    if (ys.length) {
      this._priceAxisPaneViews[0].update(
        this._calculatePriceAxisPaneViewData(Math.min.apply(null, ys), Math.max.apply(null, ys))
      );
    }
    this._lines.update({ points: anchorPoints });
  }
  addPoint(point, step) {
    const resp = super.addPoint(point, step);
    if (step === 1 && !point.isTempForPreview) {
      this.startTextEditing();
    }
    return resp;
  }
  isCreationFinished() {
    return this._lines.isCreationFinished();
  }
  startTextEditing() {
    this._lines.startTextEditing();
  }
}
class NoteTool extends BaseTextTool {
  constructor() {
    super(...arguments);
    __publicField(this, "type", NoteToolType);
  }
  createPrimitive(drawingSession) {
    const i18nService = getI18nService(drawingSession);
    return new NotePrimitive(
      {
        id: this.id,
        points: [],
        text: "",
        placeholder: i18nService.t("tool.text.common.addText"),
        fontSize: 14,
        textColor: "#1A1A1AFF",
        drawBackground: true,
        backgroundColor: "#ffffff",
        drawBorder: false,
        borderColor: "#EBEBEBFF",
        lineColor: "#1A1A1AFF",
        wordWrap: true
      },
      ...this.getTextResetArgs(drawingSession)
    );
  }
}
export {
  NoteTool
};
