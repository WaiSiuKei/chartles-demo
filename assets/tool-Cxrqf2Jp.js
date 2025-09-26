var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { b1 as rt, r as ChartFontFamily, G as PaneCursor, b$ as SelectionRenderer, z as HitTarget, B as BitmapCoordinatesPaneRenderer, w as box, u as Point, v as pointInBox, y as HitTestResult, M as AreaName, e as ensure, A as AnchorPoint, aW as PinToolType } from "./index-DSkroicZ.js";
import { g as getI18nService } from "./toolPaneView-BAEHHn7m.js";
import { b as BaseTextPaneView, B as BaseTextPrimitive, a as BaseTextTool } from "./textPaneView-DmGg5Esj.js";
import { P as PriceLabelPriceAxisView } from "./priceLabelPriceAxisView-d9Maj5lR.js";
import { T as TimeLabelTimeAxisView } from "./timeLabelTimeAxisView-BvW_UnA0.js";
import { i as isRtl, c as calcTextHorizontalShift } from "./text-FiPV6-V4.js";
import { d as drawScaled } from "./ctx-DYUP60aL.js";
import { m as makeFont } from "./font-0BY7UpRj.js";
import { C as CompositeRenderer } from "./composite-BOGQNAfc.js";
import { s as svgRenderer } from "./svg-qPFV6R3m.js";
import { w as wordWrap } from "./text-DNYLW3w-.js";
import "./baseTool-BVX9dcKc.js";
const icon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 30" width="24" height="30"><path fill="#2962FF" fill-rule="evenodd" d="m12 30 .88-.77C20.25 22.73 24 17.07 24 12.09 24 5.04 18.54 0 12 0S0 5.04 0 12.1c0 4.97 3.75 10.64 11.12 17.13L12 30Zm0-13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z"/></svg>\n';
let svg = void 0;
function getSvg() {
  return svg || (svg = svgRenderer(icon));
}
function drawTooltipPath(config) {
  const { ctx, scope, left, top, width, height, point, caretPos, mode } = config;
  const { horizontalPixelRatio: hRatio, verticalPixelRatio: vRatio } = scope;
  const halfPixelOffset = Math.max(1, Math.floor(hRatio)) % 2 / 2;
  const anchorX = Math.round(point.x * hRatio) + halfPixelOffset;
  const strokeWidth = mode === 0 ? Math.max(1, Math.floor(hRatio)) : 0;
  const x = Math.round(left * hRatio) + strokeWidth / 2;
  const y = Math.round(top * vRatio) + strokeWidth / 2;
  const w = Math.round(width * hRatio) - strokeWidth;
  const h = Math.round(height * vRatio) - strokeWidth;
  const caretWidth = Math.round(12 * hRatio);
  const caretHeight = Math.round(10 * vRatio);
  const caretLeft = anchorX - caretWidth / 2;
  const caretRight = anchorX + caretWidth / 2;
  const caretAngle = Math.atan(10 / 6);
  const caretCtrlX = 4 * Math.cos(caretAngle);
  const caretCtrlY = 4 * Math.sin(caretAngle);
  const borderRadius = 4 * hRatio;
  ctx.beginPath();
  ctx.moveTo(x, y + borderRadius);
  ctx.arcTo(x, y, x + borderRadius, y, borderRadius);
  if (caretPos === "top") {
    const tipY = y;
    const caretY = y - caretHeight;
    ctx.lineTo(caretLeft - borderRadius, tipY);
    ctx.arcTo(caretLeft, tipY, caretLeft + caretCtrlX, tipY - caretCtrlY, borderRadius);
    ctx.lineTo(anchorX - 1.2 * caretCtrlX, caretY + 1.2 * caretCtrlY);
    ctx.arcTo(
      anchorX,
      caretY,
      anchorX + 1.2 * caretCtrlX,
      caretY + 1.2 * caretCtrlY,
      1.2 * caretCtrlX
    );
    ctx.lineTo(caretRight - caretCtrlX, tipY - caretCtrlY);
    ctx.arcTo(caretRight, tipY, caretRight + borderRadius, tipY, borderRadius);
  }
  ctx.lineTo(x + w - borderRadius, y);
  ctx.arcTo(x + w, y, x + w, y + borderRadius, borderRadius);
  ctx.lineTo(x + w, y + h - borderRadius);
  ctx.arcTo(x + w, y + h, x + w - borderRadius, y + h, borderRadius);
  if (caretPos === "bottom") {
    const tipY = y + h;
    const caretY = tipY + caretHeight;
    ctx.lineTo(caretRight + borderRadius, tipY);
    ctx.arcTo(caretRight, tipY, caretRight - caretCtrlX, tipY + caretCtrlY, borderRadius);
    ctx.lineTo(anchorX + 1.2 * caretCtrlX, caretY - 1.2 * caretCtrlY);
    ctx.arcTo(
      anchorX,
      caretY,
      anchorX - 1.2 * caretCtrlX,
      caretY - 1.2 * caretCtrlY,
      1.2 * caretCtrlX
    );
    ctx.lineTo(caretLeft + caretCtrlX, tipY + caretCtrlY);
    ctx.arcTo(caretLeft, tipY, caretLeft - borderRadius, tipY, borderRadius);
  }
  ctx.lineTo(x + borderRadius, y + h);
  ctx.arcTo(x, y + h, x, y + h - borderRadius, borderRadius);
  ctx.closePath();
}
class PinRenderer extends BitmapCoordinatesPaneRenderer {
  hitTest(mouseXY) {
    if (this._data !== null) {
      const { point: anchorPoint, left, top, width, height, tooltipVisible } = this._data;
      const centerX = anchorPoint.x;
      const centerY = anchorPoint.y;
      const iconBoxSize = getSvg().viewBox();
      const markerHitBox = box(
        new Point(centerX - iconBoxSize.width / 2, centerY - iconBoxSize.height),
        new Point(centerX + iconBoxSize.width / 2, centerY)
      );
      if (pointInBox(mouseXY, markerHitBox)) {
        return new HitTestResult(HitTarget.MovePoint);
      }
      if (tooltipVisible) {
        const tooltipBox = box(new Point(left, top), new Point(left + width, top + height));
        if (pointInBox(mouseXY, tooltipBox)) {
          return new HitTestResult(HitTarget.MovePoint, {
            areaName: AreaName.Text,
            cursorType: this._data.cursorType
          });
        }
        const markerY = markerHitBox.min.y;
        const tooltipY = tooltipBox.min.y;
        const topY = tooltipY < markerY ? markerHitBox.max.y : tooltipBox.max.y;
        const bottomY = tooltipY < markerY ? tooltipY : markerY;
        const linkBox = box(
          new Point(markerHitBox.min.x - 8, topY),
          new Point(markerHitBox.max.x + 8, bottomY)
        );
        if (pointInBox(mouseXY, linkBox)) {
          return new HitTestResult(HitTarget.MovePoint);
        }
      }
    }
    return null;
  }
  drawImpl(scope) {
    if (!this._data) return;
    const { horizontalPixelRatio: hRatio, verticalPixelRatio: vRatio, context: ctx } = scope;
    const hOffset = Math.max(1, Math.floor(hRatio)) % 2 / 2;
    const vOffset = Math.max(1, Math.floor(vRatio)) % 2 / 2;
    const { point, markerColor } = this._data;
    const scaledX = Math.round(point.x * hRatio) + hOffset;
    const scaledY = Math.round(point.y * vRatio) + vOffset;
    const viewBox = getSvg().viewBox();
    ctx.fillStyle = markerColor;
    getSvg().render(ctx, {
      targetViewBox: {
        x: scaledX - hRatio * viewBox.width / 2,
        y: scaledY - hRatio * viewBox.height,
        // 注意这里按 horizontalRatio 计算高度是可能的简化优化
        width: hRatio * viewBox.width,
        height: hRatio * viewBox.height
      },
      doNotApplyColors: true
    });
    if (this._data.tooltipVisible) {
      this._drawTooltipOn(ctx, scope);
    }
  }
  _drawTooltipOn(ctx, scope) {
    ctx.save();
    const tooltipData = ensure(this._data);
    const {
      point,
      textColor,
      font,
      fontSize,
      backgroundColor,
      borderColor,
      boxShadowColor,
      width,
      textWidth,
      left,
      top,
      height,
      lineSpacing,
      caretPos,
      lines
    } = tooltipData;
    const { horizontalPixelRatio: hRatio, verticalPixelRatio: vRatio } = scope;
    ctx.font = font;
    if (backgroundColor) {
      ctx.fillStyle = backgroundColor;
      let usingShadow = false;
      if (boxShadowColor) {
        ctx.save();
        ctx.shadowColor = boxShadowColor;
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 2;
        usingShadow = true;
      }
      drawTooltipPath({
        ctx,
        scope,
        left,
        top,
        width,
        height,
        point,
        caretPos,
        mode: 1
        // Fill mode
      });
      ctx.fill();
      if (usingShadow) {
        ctx.restore();
      }
    }
    if (borderColor) {
      ctx.lineWidth = Math.max(1, Math.floor(hRatio));
      ctx.strokeStyle = borderColor;
      drawTooltipPath({
        ctx,
        scope,
        left,
        top,
        width,
        height,
        point,
        caretPos,
        mode: 0
        // Stroke mode
      });
      ctx.stroke();
    }
    ctx.textBaseline = "middle";
    ctx.fillStyle = textColor;
    ctx.textAlign = isRtl() ? "right" : "left";
    const textX = left + 12 + calcTextHorizontalShift(ctx, textWidth);
    let textY = top + 12 + fontSize / 2;
    drawScaled(ctx, hRatio, vRatio, () => {
      for (const line of lines) {
        ctx.fillText(line, textX, textY);
        textY += fontSize + lineSpacing;
      }
    });
    ctx.restore();
  }
  getTextInfo() {
    const { font, fontSize, width, left, top, height, lineSpacing } = ensure(this._data);
    return {
      font,
      fontSize,
      lineSpacing,
      textTop: top + 12,
      textBottom: top + height - 12,
      textLeft: left + 12,
      textRight: left + width - 12,
      textAlign: isRtl() ? "right" : "left"
    };
  }
}
class PinPaneView extends BaseTextPaneView {
  constructor() {
    super(...arguments);
    __publicField(this, "_renderer", new CompositeRenderer(this._hitTestCollector));
    __publicField(this, "_pinRenderer", new PinRenderer());
    __publicField(this, "_textWidthCache", new rt());
  }
  renderer() {
    return this._renderer;
  }
  isLabelVisible() {
    return this.isHoveredSource() || this.isSelectedSource();
  }
  _updateImpl() {
    this._renderer.clear();
    const data = this._data;
    if (!data || data.points.length === 0) return;
    const showTooltip = this.isLabelVisible();
    const props = this._source.properties();
    const font = makeFont(
      props.fontSize,
      ChartFontFamily,
      props.italic ? "italic" : void 0,
      props.bold ? "bold" : void 0
    );
    let backgroundColor = void 0;
    let boxShadowColor = void 0;
    if (props.drawBackground) {
      backgroundColor = props.backgroundColor;
      boxShadowColor = "rgba(0, 0, 0, 0.2)";
    }
    const { mediaSize } = this._source.getScope();
    const maxWidth = Math.min(236, mediaSize.width);
    const textWidth = maxWidth - 24;
    const anchor = this.points()[0];
    const wrappedLines = wordWrap(
      this._textDisplay(),
      font,
      this._textWidthCache,
      false,
      textWidth
    );
    const visibleLines = wrappedLines.filter((line) => !line.hidden).map((line) => line.text);
    const fontSize = props.fontSize;
    let height = visibleLines.length * fontSize + 24;
    if (visibleLines.length > 1) {
      height += 5 * (visibleLines.length - 1);
    }
    let left = Math.round(anchor.x - maxWidth / 2);
    const viewBox = getSvg().viewBox();
    let top = Math.round(anchor.y - viewBox.height - height - 13);
    const isNearEdgeX = anchor.x < 24 || anchor.x + 24 > mediaSize.width;
    let caretDirection = isNearEdgeX ? null : "top";
    if (top < 10) {
      top = anchor.y + 13;
    } else if (!isNearEdgeX) {
      caretDirection = "bottom";
    }
    if (left < 10) {
      left = 10;
    } else if (left + maxWidth + 10 > mediaSize.width) {
      left = mediaSize.width - maxWidth - 10;
    }
    this._pinRenderer.setData({
      linesIncludingHidden: wrappedLines,
      lines: this._isTextEditMode() ? [] : visibleLines,
      font,
      fontSize,
      backgroundColor,
      boxShadowColor,
      borderColor: props.drawBorder ? props.borderColor : void 0,
      textColor: this._textDisplayColor(),
      markerColor: props.markerColor,
      point: anchor,
      tooltipVisible: showTooltip,
      width: maxWidth,
      height,
      left,
      top,
      caretPos: caretDirection,
      lineSpacing: 5,
      textWidth,
      cursorType: this.isSelectedSource() ? PaneCursor.text : PaneCursor.unset
    });
    this._updateEditor(this._pinRenderer.getTextInfo());
    this._renderer.append(this._pinRenderer);
    const selectionRenderer = new SelectionRenderer({
      points: this.points(),
      bgColors: this._lineAnchorColors(this.points()),
      visible: this.areAnchorsVisible(),
      hitTarget: HitTarget.MovePoint
    });
    this._renderer.append(selectionRenderer);
  }
}
class PinPrimitive extends BaseTextPrimitive {
  constructor() {
    super(...arguments);
    __publicField(this, "_lines", new PinPaneView(this, this.model, this.editingHelper));
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
class PinTool extends BaseTextTool {
  constructor() {
    super(...arguments);
    __publicField(this, "type", PinToolType);
    __publicField(this, "fixed", false);
  }
  createPrimitive(drawingSession) {
    const i18nService = getI18nService(drawingSession);
    return new PinPrimitive(
      {
        id: this.id,
        points: [],
        text: "",
        placeholder: i18nService.t("tool.text.common.addText"),
        fontSize: 14,
        textColor: "#1A1A1AFF",
        markerColor: "#2962FFFF",
        drawBackground: true,
        backgroundColor: "#ffffff",
        drawBorder: false,
        borderColor: "#EBEBEBFF",
        wordWrap: true,
        fixed: this.fixed
      },
      ...this.getTextResetArgs(drawingSession)
    );
  }
}
export {
  PinTool
};
