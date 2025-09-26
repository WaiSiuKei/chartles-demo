var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { g as getI18nService } from "./toolPaneView-3wj_on-u.js";
import { b as BaseTextPaneView, T as TextMode, B as BaseTextPrimitive, a as BaseTextTool } from "./textPaneView-DMnMnXxK.js";
import { ar as CalloutToolType } from "./index-TSHQCVD9.js";
import { b1 as rt, r as ChartFontFamily, y as HitTestResult, z as HitTarget, M as AreaName, A as AnchorPoint, bJ as MediaCoordinatesPaneRenderer, b5 as isEqual, e as ensure } from "./index-NZHt9VGv.js";
import { P as PriceLabelPriceAxisView } from "./priceLabelPriceAxisView-d9Maj5lR.js";
import { T as TimeLabelTimeAxisView } from "./timeLabelTimeAxisView-BvW_UnA0.js";
import { P as PriceRangeAxisPaneView, T as TimeRangeAxisPaneView } from "./axisPaneView-Pbgdotf1.js";
import { m as measureText, i as isRtl, c as calcTextHorizontalShift } from "./text-8RrTwjoh.js";
import { m as makeFont } from "./font-0BY7UpRj.js";
import { C as CompositeRenderer } from "./composite-tvPrNHN0.js";
import { w as wordWrap } from "./text-CtvZov1L.js";
import "./baseTool-CHlzZht2.js";
import "./ctx-Bv0u81rl.js";
class CalloutRenderer extends MediaCoordinatesPaneRenderer {
  constructor() {
    super(...arguments);
    __publicField(this, "_textInfoCache", null);
    __publicField(this, "_hitTest", null);
  }
  _calcTextSize() {
    if (this._data === null || this._data.points.length < 2) return null;
    if (this._textInfoCache === null) {
      const fontSize = this._data.textData.fontSize;
      const lineCount = this._data.textData.lines.length;
      const textHeight = fontSize * lineCount;
      const textWidth = this._data.textData.maxWidth;
      const paddingAndBorder = 2 * 2 + 2 * 8;
      this._textInfoCache = {
        textWidth,
        textHeight,
        // 总宽度 = 文本宽度 + 两侧 padding + 边框
        totalWidth: textWidth + paddingAndBorder,
        // 总高度 = 文本内容高度 + padding + 边框
        totalHeight: textHeight + paddingAndBorder
      };
    }
    return this._textInfoCache;
  }
  setData(data) {
    if (this._data === null || !isEqual(this._data.textData.lines, data.textData.lines) || this._data.textData.font !== data.textData.font || this._data.textData.maxWidth !== data.textData.maxWidth) {
      this._textInfoCache = null;
    }
    this._data = data;
  }
  setHitTestResult(h) {
    this._hitTest = h;
  }
  hitTest(point) {
    if (this._data === null || this._data.points.length < 2) return null;
    const startPoint = this._data.points[0];
    const textAnchor = this._data.points[1];
    if (startPoint.subtract(point).length() < 3) {
      return new HitTestResult(HitTarget.ChangePoint);
    }
    const textSize = ensure(this._calcTextSize());
    const boxLeft = textAnchor.x - textSize.totalWidth / 2;
    const boxTop = textAnchor.y - textSize.totalHeight / 2;
    const isInsideTextBox = point.x >= boxLeft && point.x <= boxLeft + textSize.totalWidth && point.y >= boxTop && point.y <= boxTop + textSize.totalHeight;
    return isInsideTextBox ? this._hitTest : null;
  }
  getTextInfo() {
    const data = ensure(this._data);
    const textAlign = isRtl() ? "right" : "left";
    const anchorPoint = data.points[1].clone();
    const textSize = ensure(this._calcTextSize());
    const totalWidth = textSize.totalWidth;
    const totalHeight = textSize.totalHeight;
    const left = anchorPoint.x - totalWidth / 2;
    const top = anchorPoint.y - totalHeight / 2;
    return {
      font: data.textData.font,
      fontSize: data.textData.fontSize,
      lineSpacing: 0,
      // 行间距固定为 0
      textTop: top + 10,
      // 添加 10px 内边距
      textBottom: top + totalHeight - 10,
      textLeft: left + 10,
      textRight: left + totalWidth - 10,
      textAlign
    };
  }
  drawImpl(scope) {
    if (this._data === null || this._data.points.length < 2) return;
    const startPoint = this._data.points[0].clone();
    const anchorPoint = this._data.points[1].clone();
    const ctx = scope.context;
    ctx.lineCap = "round";
    ctx.strokeStyle = this._data.borderColor;
    ctx.lineWidth = this._data.borderWidth;
    ctx.textBaseline = "bottom";
    ctx.font = this._data.textData.font;
    const { textWidth, textHeight, totalWidth, totalHeight } = ensure(this._calcTextSize());
    const left = anchorPoint.x - totalWidth / 2;
    const top = anchorPoint.y - totalHeight / 2;
    let cornerCode = 0;
    const hasMinWidth = textWidth + 4 > 16;
    const hasMinHeight = textHeight + 4 > 16;
    ctx.textAlign = isRtl() ? "right" : "left";
    const textHorizontalShift = calcTextHorizontalShift(ctx, textWidth);
    if (startPoint.x > left + totalWidth) {
      cornerCode = 20;
    } else if (startPoint.x > left) {
      cornerCode = 10;
    }
    if (startPoint.y > top + totalHeight) {
      cornerCode += 2;
    } else if (startPoint.y > top) {
      cornerCode += 1;
    }
    ctx.translate(left, top);
    startPoint.x -= left;
    startPoint.y -= top;
    anchorPoint.x -= left;
    anchorPoint.y -= top;
    ctx.beginPath();
    ctx.moveTo(8, 0);
    if (cornerCode === 10) {
      if (hasMinWidth) {
        ctx.lineTo(anchorPoint.x - 8, 0);
        ctx.lineTo(startPoint.x, startPoint.y);
        ctx.lineTo(anchorPoint.x + 8, 0);
        ctx.lineTo(totalWidth - 8, 0);
      } else {
        ctx.lineTo(startPoint.x, startPoint.y);
        ctx.lineTo(totalWidth - 8, 0);
      }
    } else {
      ctx.lineTo(totalWidth - 8, 0);
    }
    if (cornerCode === 20) {
      ctx.lineTo(startPoint.x, startPoint.y);
      ctx.lineTo(totalWidth, 8);
    } else {
      ctx.arcTo(totalWidth, 0, totalWidth, 8, 8);
    }
    if (cornerCode === 21) {
      if (hasMinHeight) {
        ctx.lineTo(totalWidth, anchorPoint.y - 8);
        ctx.lineTo(startPoint.x, startPoint.y);
        ctx.lineTo(totalWidth, anchorPoint.y + 8);
        ctx.lineTo(totalWidth, totalHeight - 8);
      } else {
        ctx.lineTo(startPoint.x, startPoint.y);
        ctx.lineTo(totalWidth, totalHeight - 8);
      }
    } else {
      ctx.lineTo(totalWidth, totalHeight - 8);
    }
    if (cornerCode === 22) {
      ctx.lineTo(startPoint.x, startPoint.y);
      ctx.lineTo(totalWidth - 8, totalHeight);
    } else {
      ctx.arcTo(totalWidth, totalHeight, totalWidth - 8, totalHeight, 8);
    }
    if (cornerCode === 12) {
      if (hasMinWidth) {
        ctx.lineTo(anchorPoint.x + 8, totalHeight);
        ctx.lineTo(startPoint.x, startPoint.y);
        ctx.lineTo(anchorPoint.x - 8, totalHeight);
        ctx.lineTo(8, totalHeight);
      } else {
        ctx.lineTo(startPoint.x, startPoint.y);
        ctx.lineTo(8, totalHeight);
      }
    } else {
      ctx.lineTo(8, totalHeight);
    }
    if (cornerCode === 2) {
      ctx.lineTo(startPoint.x, startPoint.y);
      ctx.lineTo(0, totalHeight - 8);
    } else {
      ctx.arcTo(0, totalHeight, 0, totalHeight - 8, 8);
    }
    if (cornerCode === 1) {
      if (hasMinHeight) {
        ctx.lineTo(0, anchorPoint.y + 8);
        ctx.lineTo(startPoint.x, startPoint.y);
        ctx.lineTo(0, anchorPoint.y - 8);
        ctx.lineTo(0, 8);
      } else {
        ctx.lineTo(startPoint.x, startPoint.y);
        ctx.lineTo(0, 8);
      }
    } else {
      ctx.lineTo(0, 8);
    }
    if (cornerCode === 0) {
      ctx.lineTo(startPoint.x, startPoint.y);
      ctx.lineTo(8, 0);
    } else {
      ctx.arcTo(0, 0, 8, 0, 8);
    }
    ctx.stroke();
    ctx.fillStyle = this._data.backColor;
    ctx.fill();
    ctx.translate(-left, -top);
    if (!this._data.skipTextDrawing) {
      ctx.fillStyle = this._data.color;
      let textY = top + 8 + 2 + this._data.textData.fontSize;
      const textX = left + 8 + 2 + textHorizontalShift;
      for (const line of this._data.textData.lines) {
        ctx.fillText(line.text, textX, textY);
        textY += this._data.textData.fontSize;
      }
    }
  }
}
class CalloutPaneView extends BaseTextPaneView {
  constructor() {
    super(...arguments);
    __publicField(this, "_renderer", new CompositeRenderer(this._hitTestCollector));
    __publicField(this, "_calloutRenderer", new CalloutRenderer());
    __publicField(this, "_textWidthCache", new rt());
    __publicField(this, "_mode", TextMode.Preview);
  }
  renderer() {
    return this._renderer;
  }
  _updateImpl() {
    this._renderer.clear();
    if (this.points().length < 2) return;
    const props = this._source.properties();
    const [startPoint, endPoint] = this.points();
    const fontStyle = makeFont(
      props.fontSize,
      ChartFontFamily,
      (props.bold ? "bold " : "") + (props.italic ? "italic " : "")
    );
    const wrapWidth = props.wordWrap ? props.wordWrapWidth : void 0;
    const wrappedLines = wordWrap(
      this._textDisplay(),
      fontStyle,
      this._textWidthCache,
      false,
      wrapWidth
    );
    const visibleLines = wrappedLines.filter((line) => !line.hidden);
    let maxTextWidth;
    if (wrapWidth !== void 0) {
      maxTextWidth = wrapWidth;
    } else {
      maxTextWidth = visibleLines.reduce((max, line) => {
        return Math.max(max, measureText(line.text, fontStyle, this._textWidthCache).width);
      }, 0);
    }
    const calloutData = {
      points: [startPoint, endPoint],
      color: this._textDisplayColor(),
      backColor: props.backgroundColor,
      textData: {
        originalText: this._textDisplay(),
        linesIncludingHidden: wrappedLines,
        lines: visibleLines,
        maxWidth: maxTextWidth,
        font: fontStyle,
        fontSize: props.fontSize
      },
      borderColor: props.borderColor,
      borderWidth: props.borderWidth,
      skipTextDrawing: this._isTextEditMode()
    };
    this._calloutRenderer.setData(calloutData);
    this._calloutRenderer.setHitTestResult(
      new HitTestResult(HitTarget.MovePoint, {
        areaName: AreaName.Text,
        cursorType: this._textCursorType()
      })
    );
    this._renderer.append(this._calloutRenderer);
    this._updateEditor(this._calloutRenderer.getTextInfo());
    const startAnchor = this.createLineAnchor(
      {
        points: [startPoint]
      },
      0
    );
    this._renderer.append(startAnchor);
    if (wrapWidth !== void 0) {
      const anchorPoint = new AnchorPoint(
        {
          x: endPoint.x + wrapWidth / 2 + 10,
          y: endPoint.y
        },
        { pointIndex: 1 }
      );
      const endAnchor = this.createLineAnchor(
        {
          points: [anchorPoint]
        },
        1
      );
      this._renderer.append(endAnchor);
    }
  }
}
class CalloutPrimitive extends BaseTextPrimitive {
  constructor() {
    super(...arguments);
    __publicField(this, "_lines", new CalloutPaneView(this, this.model, this.editingHelper));
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
class CalloutTool extends BaseTextTool {
  constructor() {
    super(...arguments);
    __publicField(this, "type", CalloutToolType);
  }
  createPrimitive(drawingSession) {
    const i18nService = getI18nService(drawingSession);
    return new CalloutPrimitive(
      {
        id: this.id,
        points: [],
        text: "",
        placeholder: i18nService.t("tool.text.common.addText"),
        fontSize: 14,
        textColor: "#ffffff",
        backgroundColor: "#0097A7B2",
        borderColor: "#0097A7FF",
        borderWidth: 2,
        wordWrap: false,
        wordWrapWidth: 100
      },
      ...this.getTextResetArgs(drawingSession)
    );
  }
}
export {
  CalloutTool
};
