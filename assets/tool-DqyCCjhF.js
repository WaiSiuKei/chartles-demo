var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { T as ToolPaneView, a as ToolPrimitive, D as DrawingTool, g as getI18nService } from "./toolPaneView-3wj_on-u.js";
import { ac as Direction, ad as AlertStatus, ae as ForecastToolType } from "./index-TSHQCVD9.js";
import { bK as DeferredPromise, bM as generateColor, bJ as MediaCoordinatesPaneRenderer, b1 as rt, cp as sign, y as HitTestResult, z as HitTarget, b2 as drawRoundRect, r as ChartFontFamily, e as ensure, A as AnchorPoint } from "./index-NZHt9VGv.js";
import { i as isRtl, c as calcTextHorizontalShift, f as forceLTRStr, s as startWithLTR } from "./text-8RrTwjoh.js";
import { n as numberToStringWithLeadingZero, g as getPercentageFormatter } from "./formatter-_n1ErJyi.js";
import { P as PriceLabelPriceAxisView } from "./priceLabelPriceAxisView-d9Maj5lR.js";
import { T as TimeLabelTimeAxisView } from "./timeLabelTimeAxisView-BvW_UnA0.js";
import { P as PriceRangeAxisPaneView, T as TimeRangeAxisPaneView } from "./axisPaneView-Pbgdotf1.js";
import { m as makeFont } from "./font-0BY7UpRj.js";
import { C as CompositeRenderer } from "./composite-tvPrNHN0.js";
import "./baseTool-CHlzZht2.js";
import "./numericFormatter-Dh0kn-kp.js";
const hourMinuteSecondFormat = "%h:%m:%s";
const hourMinuteFormat = "%h:%m";
const TOKEN_REGEX = /%h|%m|%s+|%ss+|%ss|%ampm|%s/g;
class TimeFormatter {
  constructor(formatTemplate = hourMinuteSecondFormat) {
    __publicField(this, "_isTwelveHoursFormat", false);
    __publicField(this, "_tokensAndDelimiters", []);
    const regex = TOKEN_REGEX;
    let match;
    let lastIndex = 0;
    while ((match = regex.exec(formatTemplate)) !== null) {
      const token = match[0];
      const plainText = formatTemplate.substring(lastIndex, match.index);
      if (plainText !== "") {
        this._tokensAndDelimiters.push(plainText);
      }
      this._tokensAndDelimiters.push(token);
      if (token === "%ampm") {
        this._isTwelveHoursFormat = true;
      }
      lastIndex = match.index + token.length;
    }
    const trailing = formatTemplate.substring(lastIndex);
    if (trailing) {
      this._tokensAndDelimiters.push(trailing);
    }
  }
  format(date) {
    return this._formatTime(date, false);
  }
  formatLocal(date) {
    return this._formatTime(date, true);
  }
  _formatTime(date, useLocal) {
    let hours = useLocal ? date.getHours() : date.getUTCHours();
    const minutes = useLocal ? date.getMinutes() : date.getUTCMinutes();
    const seconds = useLocal ? date.getSeconds() : date.getUTCSeconds();
    const millis = useLocal ? date.getMilliseconds() : date.getUTCMilliseconds();
    let ampm = "";
    if (this._isTwelveHoursFormat) {
      ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;
    }
    let result = "";
    let skipNextIfEmpty = false;
    for (let i = this._tokensAndDelimiters.length - 1; i >= 0; i--) {
      const token = this._tokensAndDelimiters[i];
      let output = "";
      switch (token) {
        case "%h":
          output = numberToStringWithLeadingZero(hours, 2);
          break;
        case "%m":
          output = numberToStringWithLeadingZero(minutes, 2);
          break;
        case "%s":
          output = numberToStringWithLeadingZero(seconds, 2);
          break;
        case "%s+":
          if (seconds !== 0) {
            output = numberToStringWithLeadingZero(seconds, 2);
          } else {
            skipNextIfEmpty = true;
            continue;
          }
          break;
        case "%ss":
          output = numberToStringWithLeadingZero(millis, 3);
          break;
        case "%ss+":
          if (millis !== 0) {
            output = numberToStringWithLeadingZero(millis, 3);
          } else {
            skipNextIfEmpty = true;
            continue;
          }
          break;
        case "%ampm":
          output = ampm;
          break;
        default:
          if (skipNextIfEmpty) {
            skipNextIfEmpty = false;
            continue;
          }
          output = token;
      }
      result = output + result;
    }
    return result;
  }
}
let deferredPromises = void 0;
function loadImage(url) {
  if (!deferredPromises) deferredPromises = /* @__PURE__ */ new Map();
  const p = deferredPromises.get(url);
  if (p) return p;
  const dp = new DeferredPromise();
  deferredPromises.set(url, dp);
  const img = new Image();
  img.onload = () => {
    URL.revokeObjectURL(url);
    dp.complete(img);
  };
  img.src = url;
  return dp;
}
const clockIconUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAJCAQAAABKmM6bAAAAZ0lEQVR4Xl2OsQmAMBRErwgSsHAJV3GHgEVKl3ADixSClViKYPkHfEI+Wsg1j8dxnCQCiQ1jJRFcFIybHsNYCCJXvCSsJonzp/YXbiKzs7d8pavyEBP2yQEji5YV+1KIkmjI/ouRID31wXKLSuZPUAAAAABJRU5ErkJggg==";
const failureIconUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAJCAQAAABKmM6bAAAARElEQVR4AWMgHvy/9//5f34gzQZiQYSeAyEPkOYE0iAhMJOTAc4ixXjR/13/r/7////h/zn/pSFCT/43/lcHS6X9fwgANMArS3ikrioAAAAASUVORK5CYII=";
const successIconUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAsAAAAKCAQAAADI+WwIAAAAb0lEQVQIHWXAMQpBAQAG4L9eKQdQSr3JpFzC5CoOoJzBSUzK+iallNWkrG99pUymDxHw5Z+RdX4ZOpnmm57aXiuWunnScXAxTGLhqMyNth1muVNq1AYKK2wVeTBGo8JZP2/mgEk+KWxQ5ZfSUS8vV97kThm/FD/aAAAAAElFTkSuQmCC";
const S = makeFont(14, ChartFontFamily, "normal");
const A = makeFont(14, ChartFontFamily, "bold");
const C = makeFont(11, ChartFontFamily, "normal");
const M = makeFont(12, ChartFontFamily, "normal");
const k = makeFont(10, ChartFontFamily, "normal");
class ForecastRenderer extends MediaCoordinatesPaneRenderer {
  constructor() {
    super(...arguments);
    __publicField(this, "_sourceWidth");
    __publicField(this, "_sourceHeight");
    __publicField(this, "_sourceRectLeftOffset");
    __publicField(this, "_targetWidth");
    __publicField(this, "_targetHeight");
    __publicField(this, "_targetRectLeftOffset");
    __publicField(this, "_target1TextWidthCache", new rt());
    __publicField(this, "_target1BoldTextWidthCache", new rt());
    __publicField(this, "_target2TextWidthCache", new rt());
    __publicField(this, "_source1TextWidthCache", new rt());
    __publicField(this, "_source2TextWidthCache", new rt());
  }
  hitTest(hitPoint) {
    if (this._data === null || this._data.points.length < 2) {
      return null;
    }
    const start = this._data.points[0];
    const end = this._data.points[1];
    const direction = end.subtract(start);
    const relative = hitPoint.subtract(start);
    const deltaX = Math.abs(direction.x);
    const deltaY = Math.abs(direction.y);
    const curveY = sign(direction.y) * (deltaY - deltaY * Math.sqrt(1 - relative.x * relative.x / (deltaX * deltaX)));
    if (Math.abs(curveY - relative.y) < 3) {
      return new HitTestResult(HitTarget.MovePoint);
    }
    const targetLabelHit = this._targetLabelHitTest(hitPoint);
    if (targetLabelHit) {
      return targetLabelHit;
    }
    const sourceLabelHit = this._sourceLabelHitTest(hitPoint);
    return sourceLabelHit;
  }
  /**
  
     判断坐标是否命中目标标签（TargetLabel）
     */
  _targetLabelHitTest(point) {
    if (this._data === null || this._targetWidth === void 0 || this._targetHeight === void 0 || this._targetRectLeftOffset === void 0) {
      return null;
    }
    let labelTotalHeight = this._targetHeight + 5;
    if (this._data.status) {
      labelTotalHeight += 24;
    }
    const directionSign = this._data.direction === Direction.Up ? -1 : 1;
    const anchor = this._data.points[1];
    const left = anchor.x - this._targetRectLeftOffset;
    const yStart = anchor.y + 3 * directionSign;
    const yEnd = anchor.y + directionSign * (labelTotalHeight + 3);
    const top = Math.min(yStart, yEnd);
    const bottom = Math.max(yStart, yEnd);
    if (point.x >= left && point.x <= left + this._targetWidth && point.y >= top && point.y <= bottom) {
      return new HitTestResult(HitTarget.MovePoint);
    }
    return null;
  }
  /**
  
     判断坐标是否命中起始标签（SourceLabel）
     */
  _sourceLabelHitTest(point) {
    if (this._data === null || this._sourceWidth === void 0 || this._sourceHeight === void 0 || this._sourceRectLeftOffset === void 0) {
      return null;
    }
    const directionSign = this._data.direction === Direction.Up ? 1 : -1;
    const anchor = this._data.points[0];
    const left = anchor.x - this._sourceRectLeftOffset;
    const yStart = anchor.y + 3 * directionSign;
    const yEnd = anchor.y + directionSign * (3 + this._sourceHeight + 5);
    const top = Math.min(yStart, yEnd);
    const bottom = Math.max(yStart, yEnd);
    if (point.x >= left && point.x <= left + this._sourceWidth && point.y >= top && point.y <= bottom) {
      return new HitTestResult(HitTarget.MovePoint);
    }
    return null;
  }
  drawImpl(scope) {
    if (!this._data || this._data.points.length < 2) return;
    const ctx = scope.context;
    const mediaSize = scope.mediaSize;
    const startPoint = this._data.points[0];
    const endPoint = this._data.points[1];
    const offset = endPoint.subtract(startPoint);
    const deltaX = Math.abs(offset.x);
    const deltaY = Math.abs(offset.y);
    ctx.lineCap = "butt";
    ctx.strokeStyle = this._data.color;
    ctx.lineWidth = this._data.linewidth;
    let startAngle, endAngle, direction;
    if (offset.y < 0) {
      startAngle = Math.PI / 2;
      endAngle = offset.x > 0 ? 0 : Math.PI;
      direction = 1;
    } else {
      startAngle = -Math.PI / 2;
      endAngle = offset.x > 0 ? 0 : -Math.PI;
      direction = -1;
    }
    ctx.beginPath();
    ctx.ellipse(
      // 使用 ellipse 绘制半椭圆
      startPoint.x,
      // x 轴圆心（以起点为主）
      endPoint.y,
      // y 轴圆心（落在终点 Y 上）
      deltaX,
      // 水平半轴
      deltaY,
      // 垂直半轴
      0,
      // 旋转角度
      startAngle,
      endAngle,
      startAngle > endAngle
      // 是否逆时针
    );
    ctx.stroke();
    this._drawTargetLabel(ctx, mediaSize);
    this._drawStartLabel(ctx, mediaSize);
    const arrowLength = Math.max(8, 4 * this._data.linewidth);
    let angle;
    if (Math.abs(offset.x) < 1 || Math.abs(offset.y) < 1) {
      angle = Math.atan(offset.x / offset.y);
    } else {
      let low = 0;
      let high = Math.PI / 2;
      let mid = (low + high) / 2;
      let dx = 0, dy = 0;
      if (offset.length() > arrowLength) {
        let iteration = 0;
        while (iteration < 10) {
          dx = deltaX * Math.sin(mid);
          dy = deltaY * (1 - Math.cos(mid));
          const dist = Math.sqrt((dx - deltaX) ** 2 + (dy - deltaY) ** 2);
          if (Math.abs(dist - arrowLength) < 1) break;
          if (dist > arrowLength) {
            low = mid;
          } else {
            high = mid;
          }
          mid = (low + high) / 2;
          iteration++;
        }
      }
      angle = Math.atan((deltaX - dx) / (deltaY - dy));
      if (offset.x * offset.y < 0) angle = -angle;
    }
    ctx.fillStyle = this._data.color;
    ctx.save();
    ctx.beginPath();
    ctx.translate(endPoint.x, endPoint.y);
    ctx.rotate(-angle);
    ctx.moveTo(0, 0);
    ctx.lineTo(-arrowLength / 2, direction * arrowLength);
    ctx.lineTo(arrowLength / 2, direction * arrowLength);
    ctx.lineTo(0, 0);
    ctx.restore();
    ctx.fill();
  }
  _drawTargetLabel(ctx, mediaSize) {
    if (this._data === null) return;
    ctx.save();
    const {
      targetLine1,
      targetLine2,
      targetLine3,
      targetLine4,
      clockWhite,
      direction,
      targetBackColor,
      targetStrokeColor,
      centersColor,
      targetTextColor,
      successBackground,
      successTextColor,
      failureBackground,
      failureTextColor,
      successIcon,
      failureIcon,
      status,
      points
    } = this._data;
    const endPoint = points[1];
    ctx.font = S;
    const line1Width = this._target1TextWidthCache.measureText(ctx, targetLine1);
    const line2Width = this._target1TextWidthCache.measureText(ctx, targetLine2);
    const spaceWidth1 = this._target1TextWidthCache.measureText(ctx, " ");
    ctx.font = C;
    const line3Width = this._target2TextWidthCache.measureText(ctx, targetLine3);
    const line4Width = this._target2TextWidthCache.measureText(ctx, targetLine4);
    const spaceWidth2 = this._target2TextWidthCache.measureText(ctx, " ");
    const clockWidth = (clockWhite == null ? void 0 : clockWhite.width) ?? 0;
    this._targetWidth = Math.max(
      line1Width + line2Width + spaceWidth1,
      line3Width + line4Width + clockWidth + 2 * spaceWidth2
    ) + 8 + 4;
    this._targetHeight = 38;
    const labelLeftOffset = endPoint.x + this._targetWidth - mediaSize.width + 5;
    this._targetRectLeftOffset = Math.max(20, Math.min(this._targetWidth - 15, labelLeftOffset));
    const balloonDirection = direction === Direction.Up ? Direction.Down : Direction.Up;
    const balloonTopLeft = this._drawBalloon(
      ctx,
      endPoint,
      this._targetWidth,
      this._targetHeight,
      balloonDirection,
      this._targetRectLeftOffset
    );
    ctx.fillStyle = targetBackColor;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = targetStrokeColor;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(endPoint.x, endPoint.y, 3, 0, 2 * Math.PI, false);
    ctx.fillStyle = centersColor;
    ctx.fill();
    ctx.textBaseline = "top";
    ctx.fillStyle = targetTextColor;
    ctx.font = S;
    ctx.textAlign = isRtl() ? "right" : "left";
    const labelStartX = balloonTopLeft.x + 4 + 2;
    const labelStartY = balloonTopLeft.y + 3 + 2;
    const textWidthLimit = this._targetWidth - 8 - 4;
    const shift1 = calcTextHorizontalShift(ctx, textWidthLimit - line2Width - spaceWidth1);
    ctx.fillText(targetLine1, labelStartX + shift1, labelStartY);
    const shift2 = calcTextHorizontalShift(ctx, textWidthLimit - line1Width);
    ctx.fillText(targetLine2, labelStartX + line1Width + spaceWidth1 + shift2, labelStartY);
    const secondRowY = labelStartY + 14 + 3;
    ctx.font = C;
    const shift3 = calcTextHorizontalShift(
      ctx,
      textWidthLimit - line4Width - clockWidth - spaceWidth2
    );
    ctx.fillText(targetLine3, labelStartX + shift3, secondRowY);
    const shift4 = calcTextHorizontalShift(
      ctx,
      textWidthLimit - line3Width - spaceWidth2 - clockWidth - line4Width
    );
    if (clockWhite) {
      ctx.drawImage(clockWhite, labelStartX + line3Width + spaceWidth2 + shift4, secondRowY + 1);
    }
    const shift5 = calcTextHorizontalShift(ctx, textWidthLimit - line3Width - clockWidth);
    ctx.fillText(
      targetLine4,
      labelStartX + line3Width + clockWidth + 2 * spaceWidth2 + shift5,
      secondRowY
    );
    if (!status) {
      ctx.restore();
      return;
    }
    let statusText;
    let statusBg;
    let statusColor;
    let statusIcon;
    ctx.font = A;
    const statusHeight = 18;
    if (status === AlertStatus.Success) {
      statusText = this._data.successText;
      statusBg = successBackground;
      statusColor = successTextColor;
      statusIcon = successIcon;
    } else {
      statusText = this._data.failureText;
      statusBg = failureBackground;
      statusColor = failureTextColor;
      statusIcon = failureIcon;
    }
    const statusTextWidth = this._target1BoldTextWidthCache.measureText(ctx, statusText);
    const statusTextX = Math.round((this._targetWidth - statusTextWidth) / 2);
    const statusShift = calcTextHorizontalShift(ctx, statusTextWidth);
    ctx.fillStyle = statusBg;
    if (direction === Direction.Up) {
      drawRoundRect(
        ctx,
        balloonTopLeft.x - 1,
        balloonTopLeft.y - statusHeight - 2,
        this._targetWidth + 2,
        statusHeight,
        5
      );
      ctx.fill();
      ctx.fillStyle = statusColor;
      ctx.fillText(
        statusText,
        balloonTopLeft.x + statusTextX + statusShift,
        balloonTopLeft.y - statusHeight + 1
      );
      if (statusIcon) {
        ctx.drawImage(
          statusIcon,
          balloonTopLeft.x + statusTextX - statusIcon.width - 4,
          balloonTopLeft.y - statusHeight - 2 + Math.abs(statusHeight - statusIcon.height) / 2
        );
      }
    } else {
      drawRoundRect(
        ctx,
        balloonTopLeft.x - 1,
        balloonTopLeft.y + this._targetHeight + 2,
        this._targetWidth + 2,
        statusHeight,
        5
      );
      ctx.fill();
      ctx.fillStyle = statusColor;
      ctx.fillText(
        statusText,
        balloonTopLeft.x + statusTextX + statusShift,
        balloonTopLeft.y + this._targetHeight + 5
      );
      if (statusIcon) {
        ctx.drawImage(
          statusIcon,
          balloonTopLeft.x + statusTextX - statusIcon.width - 4,
          balloonTopLeft.y + this._targetHeight + 10 - Math.abs(statusHeight - statusIcon.height) / 2
        );
      }
    }
    ctx.restore();
  }
  _drawStartLabel(ctx, mediaSize) {
    if (!this._data) return;
    ctx.save();
    ctx.font = M;
    const line1Width = this._source1TextWidthCache.measureText(ctx, this._data.sourceLine1);
    ctx.font = k;
    const line2Width = this._source2TextWidthCache.measureText(ctx, this._data.sourceLine2);
    this._sourceWidth = Math.max(line1Width, line2Width) + 6 + 4;
    this._sourceHeight = 32;
    const anchor = this._data.points[0];
    const labelOffsetRight = anchor.x + this._sourceWidth - mediaSize.width + 5;
    this._sourceRectLeftOffset = Math.max(20, Math.min(this._sourceWidth - 15, labelOffsetRight));
    const balloonTopLeft = this._drawBalloon(
      ctx,
      anchor,
      this._sourceWidth,
      this._sourceHeight,
      this._data.direction,
      this._sourceRectLeftOffset
    );
    ctx.fillStyle = this._data.sourceBackColor;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = this._data.sourceStrokeColor;
    ctx.stroke();
    ctx.textAlign = isRtl() ? "right" : "left";
    ctx.textBaseline = "top";
    ctx.fillStyle = this._data.sourceTextColor;
    const horizontalShift = calcTextHorizontalShift(ctx, this._sourceWidth - 6 - 4);
    const textX = balloonTopLeft.x + 4 + 2 + horizontalShift;
    const textY = balloonTopLeft.y + 2 + 2;
    ctx.font = M;
    ctx.fillText(this._data.sourceLine1, textX, textY);
    ctx.font = k;
    ctx.fillText(this._data.sourceLine2, textX, textY + 14);
    ctx.beginPath();
    ctx.arc(anchor.x, anchor.y, 3, 0, 2 * Math.PI, false);
    ctx.fillStyle = this._data.centersColor;
    ctx.fill();
    ctx.restore();
  }
  _drawBalloon(ctx, anchorPoint, balloonWidth, balloonHeight, direction, offsetX = 20) {
    ctx.beginPath();
    const arrowWidth = 10;
    const arrowHeight = 5;
    const borderRadius = 3;
    let topLeft;
    if (direction === Direction.Down) {
      topLeft = {
        x: anchorPoint.x - offsetX,
        y: anchorPoint.y - arrowHeight - 6 - balloonHeight
      };
      const x = topLeft.x;
      const y = topLeft.y;
      const right = x + balloonWidth;
      ctx.moveTo(x + borderRadius, y);
      ctx.lineTo(right - borderRadius, y);
      ctx.arcTo(right, y, right, y + borderRadius, borderRadius);
      ctx.lineTo(right, y + balloonHeight - borderRadius);
      ctx.arcTo(right, y + balloonHeight, right - borderRadius, y + balloonHeight, borderRadius);
      ctx.lineTo(x + offsetX + arrowWidth / 2, y + balloonHeight);
      ctx.lineTo(x + offsetX, y + balloonHeight + arrowHeight);
      ctx.lineTo(x + offsetX - arrowWidth / 2, y + balloonHeight);
      ctx.lineTo(x + borderRadius, y + balloonHeight);
      ctx.arcTo(x, y + balloonHeight, x, y + balloonHeight - borderRadius, borderRadius);
      ctx.lineTo(x, y + borderRadius);
      ctx.arcTo(x, y, x + borderRadius, y, borderRadius);
      return topLeft;
    } else {
      topLeft = {
        x: anchorPoint.x - offsetX,
        y: anchorPoint.y + arrowHeight + 6 + balloonHeight
      };
      const x = topLeft.x;
      const y = topLeft.y;
      const right = x + balloonWidth;
      ctx.moveTo(x + borderRadius, y);
      ctx.lineTo(right - borderRadius, y);
      ctx.arcTo(right, y, right, y - borderRadius, borderRadius);
      ctx.lineTo(right, y - balloonHeight + borderRadius);
      ctx.arcTo(right, y - balloonHeight, right - borderRadius, y - balloonHeight, borderRadius);
      ctx.lineTo(x + offsetX + arrowWidth / 2, y - balloonHeight);
      ctx.lineTo(x + offsetX, y - balloonHeight - arrowHeight);
      ctx.lineTo(x + offsetX - arrowWidth / 2, y - balloonHeight);
      ctx.lineTo(x + borderRadius, y - balloonHeight);
      ctx.arcTo(x, y - balloonHeight, x, y - balloonHeight + borderRadius, borderRadius);
      ctx.lineTo(x, y - borderRadius);
      ctx.arcTo(x, y, x + borderRadius, y, borderRadius);
      return {
        x,
        y: y - balloonHeight
      };
    }
  }
}
class ForecastPaneView extends ToolPaneView {
  constructor(_source, _model) {
    super(_source, _model);
    __publicField(this, "_predictionRenderer", new ForecastRenderer());
    __publicField(this, "_renderer", new CompositeRenderer(this._hitTestCollector));
    loadImage(clockIconUrl).p.then(() => {
      this._source.requestUpdate();
    });
    loadImage(successIconUrl).p.then(() => {
      this._source.requestUpdate();
    });
    loadImage(failureIconUrl).p.then(() => {
      this._source.requestUpdate();
    });
  }
  renderer() {
    return this._renderer;
  }
  _updateImpl() {
    this._renderer.clear();
    const points = this.points();
    if ((points == null ? void 0 : points.length) < 2) return;
    const props = this._source.properties();
    const transparency = props.transparency;
    this._predictionRenderer.setData({
      points,
      color: props.linecolor,
      linewidth: props.linewidth,
      // 🎯 目标标签四行文案
      targetLine1: this._data.diffText,
      targetLine2: this._data.durationString,
      targetLine3: this._data.priceText,
      targetLine4: this._data.targetTimeText,
      // ✅ 状态 / 图标
      status: this._data.status,
      // 🎨 外观风格（带透明度）
      targetBackColor: generateColor(props.targetBackColor, transparency),
      targetStrokeColor: generateColor(props.targetStrokeColor, transparency),
      targetTextColor: props.targetTextColor,
      sourceBackColor: generateColor(props.sourceBackColor, transparency),
      sourceStrokeColor: generateColor(props.sourceStrokeColor, transparency),
      sourceTextColor: props.sourceTextColor,
      successBackground: generateColor(props.successBackground, transparency),
      successTextColor: props.successTextColor,
      failureBackground: generateColor(props.failureBackground, transparency),
      failureTextColor: props.failureTextColor,
      // intermediateBackColor: props.intermediateBackColor,
      // intermediateTextColor: props.intermediateTextColor,
      // 🟡 起点标签
      sourceLine1: this._data.sourcePriceText,
      sourceLine2: this._data.sourceTimeText,
      // 📍方位与资源
      direction: this._data.direction,
      clockWhite: loadImage(clockIconUrl).value ?? void 0,
      successIcon: loadImage(successIconUrl).value ?? void 0,
      failureIcon: loadImage(failureIconUrl).value ?? void 0,
      // ⚫️ anchor 圆点颜色
      // centersColor: this._model.backgroundCounterColor(),
      centersColor: "#000000",
      successText: props.successText,
      failureText: props.failureText
    });
    this._renderer.append(this._predictionRenderer);
    this.addAnchors(this._renderer);
  }
}
class ForecastPrimitive extends ToolPrimitive {
  constructor() {
    super(...arguments);
    __publicField(this, "_lines", new ForecastPaneView(this, this.model));
    __publicField(this, "_paneView", [this._lines]);
    __publicField(this, "_priceAxisPaneViews", [new PriceRangeAxisPaneView(/* @__PURE__ */ Object.create(null))]);
    __publicField(this, "_timeAxisPaneViews", [new TimeRangeAxisPaneView(/* @__PURE__ */ Object.create(null))]);
    __publicField(this, "_timeAxisViews", [
      new TimeLabelTimeAxisView(/* @__PURE__ */ Object.create(null)),
      new TimeLabelTimeAxisView(/* @__PURE__ */ Object.create(null))
    ]);
    __publicField(this, "_priceAxisViews", [
      new PriceLabelPriceAxisView(/* @__PURE__ */ Object.create(null)),
      new PriceLabelPriceAxisView(/* @__PURE__ */ Object.create(null))
    ]);
  }
  pointsCount() {
    return 2;
  }
  addPoint(point, step) {
    const resp = super.addPoint(point, step);
    this.recalculateStateByData();
    return resp;
  }
  setPoint(index, point, details) {
    super.setPoint(index, point, details);
    this.recalculateStateByData();
  }
  endMoving() {
    super.endMoving();
    this.recalculateStateByData();
  }
  status() {
    return this._props.status;
  }
  setStatus(t) {
    this._props.status = t;
  }
  direction() {
    if (this.controlPoints.length < 2) return Direction.Up;
    const t = this.controlPoints[0];
    return this.controlPoints[1].price > t.price ? Direction.Up : Direction.Down;
  }
  recalculateStateByData() {
    this.setStatus(AlertStatus.Waiting);
    if (this.controlPoints.length < 2) return;
    const targetPoint = this.controlPoints[1];
    const timeRange = this.chart.timeScale().getVisibleRange();
    if (!timeRange) return;
    if (targetPoint.time > timeRange.to) return;
    const targetIndex = this.chart.timeScale().timeToIndex(targetPoint.time);
    if (targetIndex === null) return;
    const barAtTarget = this.series.dataByIndex(targetIndex);
    if (barAtTarget === null) return;
    const dir = this.direction();
    const high = ensure(barAtTarget.customValues.high);
    const low = ensure(barAtTarget.customValues.low);
    const targetPrice = targetPoint.price;
    const isSuccess = dir === Direction.Up && high >= targetPrice || dir === Direction.Down && low <= targetPrice;
    this.setStatus(isSuccess ? AlertStatus.Success : AlertStatus.Failure);
  }
  updateAllViews() {
    var _a;
    if (((_a = this.controlPoints) == null ? void 0 : _a.length) < 1) return;
    const points = [];
    for (let i = 0; i < this.controlPoints.length; i++) {
      const p = this.controlPoints[i];
      const drawPoint = this.pointToScreenPoint(p);
      if (!drawPoint) return;
      points.push(new AnchorPoint(drawPoint, { pointIndex: i }));
    }
    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);
    this.controlPoints.forEach((p, i) => {
      this._timeAxisViews[i].update(this._calculateTimeAxisViewData(p.time, points[i].x));
      this._priceAxisViews[i].update(this._calculatePriceAxisViewData(p.price, points[i].y));
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
    const formatter = this.series.priceFormatter();
    const [p0, p1] = this.controlPoints;
    const priceDelta = p1.price - p0.price;
    const percentageChange = priceDelta / Math.abs(p0.price) * 100;
    const priceText = forceLTRStr(formatter.format(p1.price));
    const diffText = forceLTRStr(
      `${formatter.format(priceDelta)} (${getPercentageFormatter().format(percentageChange)})`
    );
    const t0 = new Date(p0.time * 1e3);
    const t1 = new Date(p1.time * 1e3);
    const interval = this._ctx.chartService.interval();
    const isDWM = interval.isDWM();
    const isShortInterval = interval.isSeconds() || interval.isTicks();
    let targetTimeText = "";
    let durationString = "";
    const df = this._ctx.dateFormatter;
    if (t0 && t1) {
      const tf2 = new TimeFormatter(isShortInterval ? hourMinuteSecondFormat : hourMinuteFormat);
      const timePart = isDWM ? "" : `  ${tf2.format(t1)}`;
      targetTimeText = `${df(t1)}${timePart}`;
      durationString = this._props.formatTargetLine2(
        startWithLTR(this._ctx.timeSpanFormatter(t0.getTime(), t1.getTime()))
      );
    }
    const sourcePriceText = formatter.format(p0.price);
    let sourceTimeText = "";
    const tf = new TimeFormatter(isShortInterval ? hourMinuteSecondFormat : hourMinuteFormat);
    sourceTimeText = `${df(t0)}${isDWM ? "" : "  " + tf.format(t0)}`;
    this._paneView[0].update({
      points,
      priceText,
      diffText,
      targetTimeText,
      durationString,
      sourcePriceText,
      sourceTimeText,
      direction: this.direction(),
      status: this.status()
    });
  }
}
class ForecastTool extends DrawingTool {
  constructor() {
    super(...arguments);
    __publicField(this, "type", ForecastToolType);
  }
  createPrimitive(drawingSession) {
    const i18nService = getI18nService(drawingSession);
    return new ForecastPrimitive(
      {
        id: this.id,
        points: [],
        linecolor: "#2962FF",
        linewidth: 2,
        sourceBackColor: "#2962FF",
        sourceTextColor: "#ffffff",
        sourceStrokeColor: "#2962FF",
        targetStrokeColor: "#2962FF",
        targetBackColor: "#2962FF",
        targetTextColor: "#ffffff",
        successBackground: "#4caf50",
        successTextColor: "#ffffff",
        failureBackground: "#F23645",
        failureTextColor: "#ffffff",
        status: AlertStatus.Waiting,
        // intermediateBackColor: '#ead289',
        // intermediateTextColor: '#6d4d22',
        transparency: 10,
        centersColor: "#202020",
        successText: i18nService.t("tool.forecast.success"),
        failureText: i18nService.t("tool.forecast.failure"),
        formatTargetLine2: (timeSpan) => {
          return i18nService.t("tool.forecast.in", { timeSpan });
        }
      },
      ...this.resetArgs
    );
  }
}
export {
  ForecastTool
};
