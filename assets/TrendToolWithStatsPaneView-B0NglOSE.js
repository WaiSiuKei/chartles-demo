var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { u as Point, bS as arePointsEqual, w as box, bW as lineSegment, bX as intersectLineSegmentAndBox, c0 as isFunction, e as ensure, r as ChartFontFamily, B as BitmapCoordinatesPaneRenderer, y as HitTestResult, z as HitTarget, b1 as rt, b2 as drawRoundRect, v as pointInBox, c1 as size } from "./index-DSkroicZ.js";
import { H as HorizontalAlign, V as VerticalAlign, w as wordWrap } from "./text-DNYLW3w-.js";
import { f as forceLTRStr, s as startWithLTR } from "./text-FiPV6-V4.js";
import { d as drawScaled, c as createDisconnectedCanvas, g as getPrescaledContext2D } from "./ctx-DYUP60aL.js";
import { m as makeFont } from "./font-0BY7UpRj.js";
import { g as getPercentageFormatter, a as getPipFormatter, b as getNumericFormatter } from "./formatter-Drv30PyG.js";
import { C as CompositeRenderer } from "./composite-BOGQNAfc.js";
import { s as svgRenderer } from "./svg-qPFV6R3m.js";
import { b as BaseTextPaneView, T as TextMode } from "./textPaneView-DmGg5Esj.js";
var StatsPosition = /* @__PURE__ */ ((StatsPosition2) => {
  StatsPosition2[StatsPosition2["Left"] = 0] = "Left";
  StatsPosition2[StatsPosition2["Center"] = 1] = "Center";
  StatsPosition2[StatsPosition2["Right"] = 2] = "Right";
  StatsPosition2[StatsPosition2["Auto"] = 3] = "Auto";
  return StatsPosition2;
})(StatsPosition || {});
const angleIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" width="18" height="18"><path fill="currentColor" fill-rule="evenodd" d="M8.55 2.78 2.7 15H15v-1h-4.01a6.2 6.2 0 0 0-1.36-3.95 7.94 7.94 0 0 0-2.57-1.83l2.4-5-.91-.44ZM6.63 9.12 4.29 14H10a5.18 5.18 0 0 0-1.12-3.3 6.93 6.93 0 0 0-2.24-1.58Z"/></svg>\n';
const priceIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" width="18" height="18"><path fill="currentColor" d="M3 2h11v1H3V2Zm5.5 1.8.35.35 2 2 .36.35-.71.7-.35-.35L9 5.71v6.58l1.15-1.14.35-.36.7.71-.35.35-2 2-.35.36-.35-.36-2-2-.36-.35.71-.7.35.35L8 12.29V5.71L6.85 6.85l-.35.36-.7-.71.35-.35 2-2 .35-.36ZM3.5 16H3v-1h11v1H3.5Z"/></svg>\n';
const timeIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" width="18" height="18"><path fill="currentColor" fill-rule="evenodd" d="M2 3v2H1v9h1v2h1v-2h1V5H3V3H2Zm6.2 4.5-.35.35L6.71 9h4.58l-1.14-1.15-.36-.35.71-.7.35.35 2 2 .36.35-.36.35-2 2-.35.36-.7-.71.35-.35L11.29 10H6.71l1.14 1.15.36.35-.71.7-.35-.35-2-2-.36-.35.36-.35 2-2 .35-.36.7.71ZM3 6H2v7h1V6Zm12-2.5V3h1v2h1v9h-1v2h-1v-2h-1V5h1V3.5ZM15 6h1v7h-1V6Z"/></svg>\n';
const Offset = 18;
const iconStrokeLight = "#F9F9F9";
const iconsStrokeDark = "#303030";
let _tempCtx = null;
let _iconRenderer = null;
function getIconRenderer() {
  if (!_iconRenderer) {
    _iconRenderer = {
      angle: svgRenderer(angleIcon),
      priceRange: svgRenderer(priceIcon),
      barsRange: svgRenderer(timeIcon)
    };
  }
  return _iconRenderer;
}
class StatsRenderer extends BitmapCoordinatesPaneRenderer {
  constructor() {
    super(...arguments);
    __publicField(this, "_hitTest", new HitTestResult(HitTarget.MovePoint));
    __publicField(this, "_preRenderedData", null);
    __publicField(this, "_textWidthCache", new rt());
  }
  setData(data) {
    super.setData(data);
    this._preRenderedData = null;
  }
  updatePoint(p) {
    if (this._data) {
      this._data.point = p;
    }
  }
  drawImpl(scope) {
    const ctx = scope.context;
    if (!this._data || this._data.text === null) return;
    const preRendered = this._preRender();
    if (!preRendered) return;
    const { horizontalPixelRatio: hRatio, verticalPixelRatio: vRatio } = scope;
    const {
      point,
      horzAlign,
      doNotAlignText,
      backgroundRoundRect,
      backgroundColor,
      color,
      lineSpacing,
      icons,
      isDark
    } = this._data;
    const { font, lineHeight, lines, padding, rectSize, textPointOffset } = preRendered;
    const x = Math.round(point.x * hRatio);
    const y = Math.round(point.y * vRatio);
    const width = Math.round(rectSize.width * hRatio);
    const height = Math.round(rectSize.height * vRatio);
    if (horzAlign === HorizontalAlign.Right || horzAlign === HorizontalAlign.Center) {
      if (!doNotAlignText) {
        ctx.textAlign = horzAlign === HorizontalAlign.Right ? "end" : "center";
      }
    }
    if (backgroundRoundRect) {
      drawRoundRect(ctx, x, y, width, height, backgroundRoundRect * hRatio);
      ctx.fillStyle = backgroundColor;
      ctx.fill();
      ctx.globalAlpha = 1;
    } else {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(x, y, width, height);
      ctx.globalAlpha = 1;
    }
    if (icons) {
      const iconVerticalOffset = Math.max(0, (lineHeight - Offset) / 2);
      const iconX = Math.round((point.x + padding.left) * hRatio);
      let iconY = point.y + padding.top + iconVerticalOffset;
      for (const icon of icons) {
        const drawY = Math.round(iconY * vRatio);
        this._drawIcon(ctx, iconX, drawY, getIconRenderer()[icon], Boolean(isDark), scope);
        iconY += lineHeight + lineSpacing;
      }
    }
    const textX = point.x + textPointOffset.x;
    let textY = point.y + textPointOffset.y;
    ctx.fillStyle = color;
    ctx.textBaseline = "middle";
    ctx.font = font;
    const baselineOffset = Math.round(lineHeight / 2);
    drawScaled(ctx, hRatio, vRatio, () => {
      for (const line of lines) {
        ctx.fillText(line, textX, textY + baselineOffset);
        textY += lineHeight + lineSpacing;
      }
    });
  }
  hitTest(p) {
    const data = this._data;
    const pr = this._preRender();
    if (!data || !pr) return null;
    const bottomRight = new Point(
      data.point.x + pr.rectSize.width,
      data.point.y + pr.rectSize.height
    );
    return pointInBox(p, box(data.point, bottomRight)) ? this._hitTest : null;
  }
  rectSize() {
    const pr = this._preRender();
    return pr ? size({ width: pr.rectSize.width, height: pr.rectSize.height }) : null;
  }
  //
  // updatePoint(p) {
  //   if (this._data) {
  //     this._data.point = p;
  //   }
  // }
  _preRender() {
    if (!this._data) return null;
    if (this._preRenderedData) return this._preRenderedData;
    const {
      fontSize = 12,
      text,
      wordWrapWidth,
      paddingBottom,
      paddingTop,
      paddingLeft,
      paddingRight,
      icons,
      bold,
      italic,
      lineSpacing
    } = this._data;
    const font = makeFont(
      fontSize,
      this._data.font,
      italic ? "italic" : void 0,
      bold ? "bold" : void 0
    );
    const tempCtx = (() => {
      if (_tempCtx !== null) return _tempCtx;
      const canvas = createDisconnectedCanvas(document, size({ width: 0, height: 0 }));
      _tempCtx = getPrescaledContext2D(canvas);
      return _tempCtx;
    })();
    tempCtx.textBaseline = "middle";
    tempCtx.font = font;
    const lines = text === null ? [] : wordWrap(text, font, this._textWidthCache, true, wordWrapWidth).map((line) => line.text);
    let textWidth = 0;
    if (wordWrapWidth) {
      textWidth = wordWrapWidth;
    } else {
      for (const line of lines) {
        textWidth = Math.max(textWidth, tempCtx.measureText(line).width);
      }
    }
    const padding = {
      top: paddingTop,
      right: paddingRight,
      bottom: paddingBottom,
      left: paddingLeft
    };
    const lineHeight = Math.max(fontSize, (icons == null ? void 0 : icons.length) ? Offset : 0);
    const totalHeight = lineHeight * lines.length + lineSpacing * (lines.length - 1);
    const rectSize = {
      width: textWidth + padding.left + padding.right,
      height: totalHeight + padding.top + padding.bottom
    };
    const offset = { x: padding.left, y: padding.top };
    if (icons) {
      const textPadding = this._data.textPadding !== void 0 ? this._data.textPadding : fontSize / 2;
      offset.x += Offset + textPadding;
      rectSize.width += Offset + textPadding;
    }
    if (rectSize.width % 2 !== 0) {
      rectSize.width += 1;
    }
    this._preRenderedData = {
      rectSize,
      padding,
      textPointOffset: offset,
      lines,
      lineHeight,
      font
    };
    return this._preRenderedData;
  }
  _drawIcon(ctx, x, y, iconRenderer, isDarkTheme, scope) {
    ctx.fillStyle = isDarkTheme ? iconStrokeLight : iconsStrokeDark;
    iconRenderer.render(ctx, {
      targetViewBox: {
        x,
        y,
        width: Math.round(Offset * scope.horizontalPixelRatio),
        height: Math.round(Offset * scope.verticalPixelRatio)
      },
      doNotApplyColors: true
    });
  }
}
class TrendToolWithStatsPaneView extends BaseTextPaneView {
  constructor() {
    super(...arguments);
    __publicField(this, "_mode", TextMode.Preview);
    __publicField(this, "_renderer", new CompositeRenderer(this._hitTestCollector));
    __publicField(this, "_labelData", null);
    __publicField(this, "_label", null);
    __publicField(this, "_middlePoint", null);
    __publicField(this, "_statsRenderer", new StatsRenderer());
  }
  renderer() {
    return this._renderer;
  }
  _updateAndReturnStatsRenderer(e) {
    this._statsRenderer.setData(this._statLabelData());
    const size2 = this._statsRenderer.rectSize();
    if (size2 !== null) {
      const targetRect = this._targetRect(e, size2);
      this._statsRenderer.updatePoint(new Point(targetRect.left, targetRect.top));
    }
    return this._statsRenderer;
  }
  _targetRect(e, size2) {
    const props = this._source.properties().statsPosition;
    const statPoints = this._getPointsForStats();
    const position = props === StatsPosition.Auto ? StatsPosition.Center : props;
    let x = statPoints[position].x + 12;
    let y = statPoints[position].y;
    const points = this.points();
    const flip = points[1].y < points[0].y && points[1].x < points[0].x || points[1].y > points[0].y && points[1].x > points[0].x;
    if (flip) {
      y -= 12 + size2.height;
    } else {
      y += 12;
    }
    const { mediaSize } = e;
    if (props === StatsPosition.Auto && !arePointsEqual(statPoints[StatsPosition.Left], statPoints[StatsPosition.Right])) {
      if (x < 0) x = 0;
      else if (x + size2.width > mediaSize.width) x = mediaSize.width - size2.width;
      if (y < 0) y = 0;
      else if (y + size2.height > mediaSize.height) y = mediaSize.height - size2.height;
      const b = box(new Point(x, y), new Point(x + size2.width, y + size2.height));
      const segment = lineSegment(statPoints[StatsPosition.Left], statPoints[StatsPosition.Right]);
      if (intersectLineSegmentAndBox(segment, b)) {
        y = flip ? statPoints[position].y + 12 : statPoints[position].y - 12 - size2.height;
        x = Math.min(statPoints[StatsPosition.Center].x, mediaSize.width) - size2.width;
      }
    }
    return {
      left: Math.floor(x),
      top: Math.floor(y),
      width: size2.width,
      height: size2.height
    };
  }
  _priceRange() {
    var _a;
    const [p1, p2] = this._source.controlPoints;
    const props = this._source.properties();
    const showPrice = props.showPriceRange;
    const showPercent = props.showPercentPriceRange;
    const showPips = props.showPipsPriceRange;
    let result = null;
    if (this._source.priceScale() && (showPrice || showPercent || showPips)) {
      const parts = [];
      const diff = p2.price - p1.price;
      if (showPrice || showPercent) {
        const ratio = diff / Math.abs(p1.price);
        const subParts = [];
        if (showPrice) {
          const formatter = this._source.series.priceFormatter();
          const priceStr = "formatChange" in formatter && isFunction(formatter.formatChange) ? (_a = formatter.formatChange) == null ? void 0 : _a.call(formatter, p2.price, p1.price) : formatter.format(diff);
          subParts.push(priceStr);
        }
        if (showPercent) {
          const percentStr = getPercentageFormatter().format(100 * ratio);
          subParts.push(showPrice ? `(${percentStr})` : percentStr);
        }
        parts.push(subParts.join(" "));
      }
      const symbolInfo = this._source.symbolInfo();
      const pipFormatter = symbolInfo && getPipFormatter(symbolInfo);
      if (showPips && pipFormatter) {
        parts.push(pipFormatter.format(diff));
      }
      result = parts.join(", ");
    }
    return result;
  }
  _statLabelData() {
    const [p1, p2] = this._source.controlPoints;
    const props = this._source.properties();
    const icons = [];
    let barsText, angleText, vector, distance;
    const priceRangeText = this._priceRange();
    if (priceRangeText !== void 0) {
      icons.push("priceRange");
    }
    const showBars = props.showBarsRange;
    const showDateTime = props.showDateTimeRange;
    const showDistance = props.showDistance;
    const showAngle = props.showAngle;
    if (showAngle || showDistance) {
      const point1 = ensure(this._source.pointToScreenPoint(p1));
      vector = ensure(this._source.pointToScreenPoint(p2)).subtract(point1);
      distance = Math.round(vector.length() * 1e5) / 1e5;
    }
    if (showBars || showDateTime || showDistance) {
      barsText = "";
      if (showBars) {
        const bars = ensure(this._source.getIndex(p2)) - ensure(this._source.getIndex(p1));
        barsText += ensure(props.formatBarCount)({ count: forceLTRStr(String(bars)) });
      }
      if (showDateTime) {
        const time1 = p1.time;
        const time2 = p2.time;
        if (time1 && time2) {
          const timeStr = startWithLTR(this._source.timeSpanFormatter()(time1, time2));
          if (timeStr) {
            barsText += showBars ? " (" + timeStr + ")" : timeStr;
          }
        }
      }
      if (showDistance) {
        if (barsText) barsText += ", ";
        barsText += ensure(props.formatDistance)({
          distance: forceLTRStr(getNumericFormatter().format(Math.round(Number(distance))))
        });
      }
      if (barsText) {
        icons.push("barsRange");
      }
    }
    if (showAngle) {
      let angle;
      if (distance !== void 0 && distance > 0 && vector !== void 0) {
        vector = vector.normalized();
        angle = Math.acos(vector.x);
        if (vector.y > 0) angle = -angle;
      }
      if (typeof angle === "number" && !isNaN(angle)) {
        const deg = angle * 180 / Math.PI;
        angleText = Math.round(deg * 100) / 100 + "º";
        icons.push("angle");
      }
    }
    this._label = [forceLTRStr(priceRangeText ?? ""), barsText, angleText].filter((x) => !!x).join("\n") || null;
    const isDark = this._model.isDarkTheme();
    const backgroundColor = isDark ? "#464646e6" : "#f2f2f2e6";
    const fontColor = isDark ? "#FFFFFF" : "#1a1a1a";
    const points = this.points();
    const labelData = {
      point: points[1],
      text: this._label,
      color: fontColor,
      isDark,
      font: ChartFontFamily,
      fontSize: 12,
      lineSpacing: 8,
      backgroundColor,
      backgroundRoundRect: 4,
      paddingLeft: 12,
      paddingRight: 12,
      paddingTop: 12,
      paddingBottom: 12,
      textPadding: 12,
      doNotAlignText: true,
      icons,
      bold: false,
      italic: false,
      lines: [],
      wordWrapWidth: 0,
      vertAlign: VerticalAlign.Top,
      horzAlign: HorizontalAlign.Left
    };
    if (points[1].y < points[0].y) {
      labelData.vertAlign = VerticalAlign.Bottom;
    }
    if (points[1].x < points[0].x) {
      labelData.horzAlign = HorizontalAlign.Right;
    }
    this._labelData = labelData;
    return labelData;
  }
}
export {
  StatsPosition as S,
  TrendToolWithStatsPaneView as T
};
