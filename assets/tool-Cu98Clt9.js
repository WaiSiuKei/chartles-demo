var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { g as getI18nService } from "./toolPaneView-BAEHHn7m.js";
import { b as BaseTextPaneView, T as TextMode, B as BaseTextPrimitive, a as BaseTextTool } from "./textPaneView-DmGg5Esj.js";
import { aw as SignpostToolType } from "./index-DNbtFiKr.js";
import { A as AnchorPoint, u as Point, r as ChartFontFamily, y as HitTestResult, z as HitTarget, M as AreaName, b6 as NOTIMPLEMENTED, B as BitmapCoordinatesPaneRenderer, bR as distanceToSegment, bQ as interactionTolerance, J as AnchorResizeVert, bL as AnchorStyle, G as PaneCursor, cB as isSeriesData, e as ensure } from "./index-DSkroicZ.js";
import { T as TimeLabelTimeAxisView } from "./timeLabelTimeAxisView-BvW_UnA0.js";
import { H as HorizontalAlign, V as VerticalAlign } from "./text-DNYLW3w-.js";
import { C as CompositeRenderer } from "./composite-BOGQNAfc.js";
import { T as TextRenderer } from "./renderer-Bgvp02WJ.js";
import "./baseTool-BVX9dcKc.js";
import "./text-FiPV6-V4.js";
import "./ctx-DYUP60aL.js";
class SignpostRenderer extends BitmapCoordinatesPaneRenderer {
  hitTest(point) {
    if (this._data === null) return null;
    const [lineHit, emojiHit] = this._hitTestLineOrEmoji(this._data, point);
    if (lineHit || emojiHit) {
      return new HitTestResult(HitTarget.MovePoint);
    }
    return null;
  }
  _hitTestLineOrEmoji(data, testPoint) {
    const tolerance = interactionTolerance().line;
    const { x, poleTopY, poleBottomY, plate } = data;
    const lineSegmentStart = new Point(x, poleTopY);
    const lineSegmentEnd = new Point(x, poleBottomY);
    const isOverLine = distanceToSegment(lineSegmentStart, lineSegmentEnd, testPoint).distance < tolerance;
    const isOverEmojiCircle = false;
    if (!isOverLine && plate !== void 0) {
      NOTIMPLEMENTED();
    }
    return [isOverLine, isOverEmojiCircle];
  }
  drawImpl(scope) {
    if (!this._data) return;
    const ctx = scope.context;
    const { poleColor, plate } = this._data;
    const { horizontalPixelRatio: hRatio, verticalPixelRatio: vRatio } = scope;
    ctx.save();
    const pixelLineWidth = Math.max(1, Math.floor(hRatio));
    const pixelAlignFix = pixelLineWidth % 2 ? 0.5 : 0;
    ctx.beginPath();
    ctx.strokeStyle = poleColor;
    ctx.lineWidth = pixelLineWidth;
    const anchorX = Math.round(this._data.x * hRatio) + pixelAlignFix;
    const drawPoleTopY = Math.round(this._data.poleTopY * vRatio);
    const drawPoleBottomY = Math.round(this._data.poleBottomY * vRatio);
    ctx.moveTo(anchorX, drawPoleTopY);
    ctx.lineTo(anchorX, drawPoleBottomY);
    if (plate) {
      NOTIMPLEMENTED();
    }
    ctx.stroke();
    if (plate) {
      NOTIMPLEMENTED();
    }
    ctx.restore();
  }
}
class SignpostPaneView extends BaseTextPaneView {
  constructor() {
    super(...arguments);
    __publicField(this, "_renderer", new CompositeRenderer(this._hitTestCollector));
    __publicField(this, "_labelRenderer", new TextRenderer());
    __publicField(this, "_signpostRenderer", new SignpostRenderer());
    __publicField(this, "_mode", TextMode.Preview);
  }
  renderer() {
    return this._renderer;
  }
  _updateImpl() {
    this._renderer.clear();
    if (!this._data) return;
    if (!this.points().length) return;
    const positionInfo = this._updateLabelTextRenderer(this._source.getScope());
    this._updateTimelineRenderer(positionInfo);
    this._renderer.append(this._signpostRenderer);
    this._renderer.append(this._labelRenderer);
    const anchorPoint = this.points()[0];
    const anchorVisual = new AnchorPoint(positionInfo.point, anchorPoint);
    this._renderer.append(this.createLineAnchor({ points: [anchorVisual] }, 0));
  }
  _updateLabelTextRenderer(scope) {
    const props = this._source.properties();
    const { height: canvasHeight, width: canvasWidth } = scope.mediaSize;
    const point = this.points()[0];
    let shapeUpsideDown;
    let labelDirection;
    let labelY;
    if (this._data.startsOnSeriesData) {
      if (point.y > this._data.barLow) {
        shapeUpsideDown = true;
        labelY = Math.max(point.y, this._data.barLow);
        labelDirection = -1;
      } else {
        shapeUpsideDown = false;
        labelY = Math.min(point.y, this._data.barHigh);
        labelDirection = 1;
      }
    } else {
      shapeUpsideDown = false;
      labelY = point.y;
      if (point.y > canvasHeight / 2) {
        labelDirection = -1;
      } else {
        labelDirection = 1;
      }
    }
    if (labelY >= -1e-10 && labelY <= canvasHeight + 1e-10) {
      labelY = Math.min(canvasHeight - 2, Math.max(2, labelY));
    }
    const labelData = {
      text: this._textDisplay(),
      // 显示的文本
      fontSize: props.fontSize,
      bold: props.bold,
      italic: props.italic,
      offsetX: 0,
      offsetY: 0,
      points: [new Point(point.x, labelY)],
      forceCalculateMaxLineWidth: true,
      vertAlign: labelDirection === -1 ? VerticalAlign.Bottom : VerticalAlign.Top,
      horzAlign: HorizontalAlign.Center,
      fontFamily: ChartFontFamily,
      backgroundRoundRect: 4,
      boxPaddingVert: 6,
      boxPaddingHorz: 8,
      wordWrapWidth: 134,
      color: this._textDisplayColor(),
      borderColor: "#EBEBEB",
      borderWidth: 1,
      backgroundColor: "#ffffff",
      skipTextDrawing: this._isTextEditMode()
    };
    this._labelRenderer.setData(labelData);
    const labelHeight = this._labelRenderer.measure().height;
    const offset = 3;
    let finalY = labelY;
    let poleTopY;
    let poleBottomY;
    if (this._data.startsOnSeriesData) {
      if (shapeUpsideDown) {
        poleTopY = this._data.barLow + offset;
        finalY = Math.max(poleTopY + labelHeight, labelY);
        poleBottomY = finalY - labelHeight;
      } else {
        poleBottomY = this._data.barHigh - offset;
        finalY = Math.min(poleBottomY - labelHeight, labelY);
        poleTopY = finalY + labelHeight;
      }
    } else {
      poleBottomY = canvasHeight;
      poleTopY = labelDirection === -1 ? labelY : labelY + labelHeight;
    }
    let finalPosition = point;
    if (finalY !== labelY) {
      finalPosition = new Point(point.x, finalY);
      this._labelRenderer.setData({
        ...labelData,
        points: [finalPosition]
      });
    }
    this._labelRenderer.setHitTestResult(
      new HitTestResult(HitTarget.MovePoint, {
        areaName: AreaName.Text,
        cursorType: this._textCursorType()
      })
    );
    if (this._labelRenderer.isOutOfScreen(canvasWidth, canvasHeight)) {
      this._deactiveEditMode();
    } else {
      this._updateEditor(this._labelRenderer.getTextInfo());
    }
    return {
      point: finalPosition,
      shapeUpsideDown,
      poleTopY,
      poleBottomY,
      labelDirection
    };
  }
  _updateTimelineRenderer(positionInfo) {
    const props = this._source.properties();
    const signpostData = {
      emojiRadius: 16,
      // 图标范围半径
      poleColor: "#1A1A1AFF",
      // 标杆线的颜色
      // svgRenderer: this._emojiCache?.emojiSvgRenderer, // 表情 SVG 渲染器
      svgRenderer: void 0,
      // 表情 SVG 渲染器
      poleTopY: positionInfo.poleTopY,
      poleBottomY: positionInfo.poleBottomY,
      x: positionInfo.point.x
    };
    if (props.showImage) {
      NOTIMPLEMENTED();
    }
    this._signpostRenderer.setData(signpostData);
  }
}
class SignpostPrimitive extends BaseTextPrimitive {
  constructor() {
    super(...arguments);
    __publicField(this, "_lines", new SignpostPaneView(this, this.model, this.editingHelper));
    __publicField(this, "_paneView", [this._lines]);
    __publicField(this, "_timeAxisViews", [new TimeLabelTimeAxisView(/* @__PURE__ */ Object.create(null))]);
  }
  pointsCount() {
    return 1;
  }
  updateAllViews() {
    if (!this.controlPoints.length) return;
    const anchorPoints = [];
    const point = this.controlPoints[0];
    if (!isFinite(point.time) || !isFinite(point.price)) {
      this._lines.update({
        points: [],
        startsOnSeriesData: true,
        barHigh: NaN,
        barLow: NaN
      });
      this._timeAxisViews[0].update(/* @__PURE__ */ Object.create(null));
      return;
    }
    const screenPoint = this.pointToScreenPoint(point);
    if (!screenPoint) return;
    const anchorPoint = new AnchorPoint(screenPoint, {
      pointIndex: 0,
      hitTarget: HitTarget.ChangePoint,
      cursorType: PaneCursor.ns,
      style: AnchorStyle.square,
      resizeDirections: AnchorResizeVert
    });
    anchorPoints.push(anchorPoint);
    this._timeAxisViews[0].update(this._calculateTimeAxisViewData(point.time, screenPoint.x));
    const idx = this.chart.timeScale().timeToIndex(point.time);
    let high = NaN;
    let low = NaN;
    if (idx !== null) {
      const bar = this.series.dataByIndex(idx);
      if (bar && isSeriesData(bar)) {
        high = ensure(this.series.priceToCoordinate(bar.customValues.high));
        low = ensure(this.series.priceToCoordinate(bar.customValues.low));
      }
    }
    this._lines.update({
      points: anchorPoints,
      startsOnSeriesData: isFinite(high) && isFinite(low) && idx !== null,
      barHigh: high,
      barLow: low
    });
  }
  addPoint(point, step) {
    const resp = super.addPoint(point, step);
    if (!point.isTempForPreview) {
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
class SignpostTool extends BaseTextTool {
  constructor() {
    super(...arguments);
    __publicField(this, "type", SignpostToolType);
    __publicField(this, "previewBeforePlace", true);
  }
  createPrimitive(drawingSession) {
    const i18nService = getI18nService(drawingSession);
    return new SignpostPrimitive(
      {
        id: this.id,
        points: [],
        text: "",
        placeholder: i18nService.t("tool.text.common.addText"),
        fontSize: 12,
        textColor: "#1A1A1AFF",
        wordWrap: false,
        emoji: "",
        showImage: false,
        position: 50
      },
      ...this.getTextResetArgs(drawingSession)
    );
  }
}
export {
  SignpostTool
};
