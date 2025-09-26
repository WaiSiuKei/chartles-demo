var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { B as BitmapCoordinatesPaneRenderer, b1 as rt, e as ensure, u as Point, b2 as drawRoundRect, b3 as setLineStyle, L as LineStyleType, b4 as pointInPolygon, y as HitTestResult, z as HitTarget, M as AreaName, G as PaneCursor, s as should, b5 as isEqual, w as box, v as pointInBox, b6 as NOTIMPLEMENTED, a as isFiniteNumber, b7 as isString, b8 as upperbound } from "./index-DSkroicZ.js";
import { m as measureText, i as isRtl } from "./text-FiPV6-V4.js";
import { d as drawScaled } from "./ctx-DYUP60aL.js";
var HorizontalAlign = /* @__PURE__ */ ((HorizontalAlign2) => {
  HorizontalAlign2["Left"] = "left";
  HorizontalAlign2["Center"] = "center";
  HorizontalAlign2["Right"] = "right";
  return HorizontalAlign2;
})(HorizontalAlign || {});
var VerticalAlign = /* @__PURE__ */ ((VerticalAlign2) => {
  VerticalAlign2["Top"] = "top";
  VerticalAlign2["Middle"] = "middle";
  VerticalAlign2["Bottom"] = "bottom";
  return VerticalAlign2;
})(VerticalAlign || {});
function alignByAngle(angleDeg) {
  let horzAlign;
  let vertAlign;
  if (angleDeg >= -135 && angleDeg <= -45) {
    horzAlign = "center";
    vertAlign = "bottom";
  } else if (angleDeg > -45 && angleDeg < 45) {
    horzAlign = "left";
    vertAlign = "middle";
  } else if (angleDeg >= 45 && angleDeg <= 135) {
    horzAlign = "center";
    vertAlign = "top";
  } else {
    horzAlign = "right";
    vertAlign = "middle";
  }
  return {
    horzAlign,
    vertAlign
  };
}
class BaseTextRenderer extends BitmapCoordinatesPaneRenderer {
  constructor(_hitTestResult) {
    super();
    __publicField(this, "_internalData", null);
    __publicField(this, "_boxSize", null);
    __publicField(this, "_linesInfo", null);
    __publicField(this, "_fontInfo", null);
    __publicField(this, "_centerTextRotationPoint", null);
    __publicField(this, "_polygonPoints", null);
    __publicField(this, "_rotationPoint", null);
    __publicField(this, "_box", null);
    __publicField(this, "_textWidthCache", new rt());
    this._hitTestResult = _hitTestResult;
  }
  setHitTestResult(h) {
    this._hitTestResult = h;
  }
  drawImpl(scope) {
    var _a;
    if (!this._data || !this._data.points || this._data.points.length === 0) return;
    const {
      mediaSize,
      horizontalPixelRatio: hRatio,
      verticalPixelRatio: vRatio,
      context: ctx
    } = scope;
    if (this.isOutOfScreen(mediaSize.width, mediaSize.height)) return;
    const layoutData = this._getInternalData();
    const rotation = ensure(this.rotation());
    const rotationPoint = new Point(rotation.x * hRatio, rotation.y * vRatio);
    ctx.save();
    if (rotation.angle !== 0) {
      ctx.translate(rotationPoint.x, rotationPoint.y);
      ctx.rotate(rotation.angle);
      ctx.translate(-rotationPoint.x, -rotationPoint.y);
    }
    const fontSize = this._getFontInfo().fontSize;
    ctx.textBaseline = layoutData.textBaseLine;
    ctx.textAlign = layoutData.textAlign;
    ctx.font = this.fontStyle();
    const { scaledLeft, scaledRight, scaledTop, scaledBottom } = scaleBoxToPixelRatio(
      layoutData,
      scope
    );
    const {
      backgroundColor,
      borderColor,
      highlightBorder,
      wordWrapWidth,
      borderWidth,
      backgroundRoundRect,
      boxShadow,
      highlightBorderColor,
      color,
      skipTextDrawing
    } = this._data;
    if (backgroundColor || borderColor || highlightBorder && wordWrapWidth) {
      const effectiveBorderWidth = borderWidth || Math.max(fontSize / 12, 1);
      const strokeWidth = Math.round(effectiveBorderWidth * hRatio);
      const halfLine = strokeWidth / 2;
      let shadowed = false;
      if (boxShadow) {
        ctx.save();
        const { shadowColor, shadowBlur, shadowOffsetX = 0, shadowOffsetY = 0 } = boxShadow;
        ctx.shadowColor = shadowColor;
        ctx.shadowBlur = shadowBlur;
        ctx.shadowOffsetX = shadowOffsetX;
        ctx.shadowOffsetY = shadowOffsetY;
        shadowed = true;
      }
      const boxX = scaledLeft;
      const boxY = scaledTop;
      const boxW = scaledRight - scaledLeft;
      const boxH = scaledBottom - scaledTop;
      if (backgroundRoundRect) {
        if (backgroundColor) {
          drawRoundRect(ctx, boxX, boxY, boxW, boxH, backgroundRoundRect * hRatio);
          ctx.fillStyle = backgroundColor;
          ctx.fill();
          if (shadowed) {
            ctx.restore();
            shadowed = false;
          }
        }
        if (borderColor) {
          drawRoundRect(
            ctx,
            boxX - halfLine,
            boxY - halfLine,
            boxW + strokeWidth,
            boxH + strokeWidth,
            backgroundRoundRect * hRatio + strokeWidth
          );
          ctx.strokeStyle = borderColor;
          ctx.lineWidth = strokeWidth;
          ctx.stroke();
          if (shadowed) {
            ctx.restore();
          }
        }
      } else {
        if (backgroundColor) {
          ctx.fillStyle = backgroundColor;
          ctx.fillRect(boxX, boxY, boxW, boxH);
          if (shadowed) {
            ctx.restore();
            shadowed = false;
          }
        }
        if (borderColor || highlightBorder) {
          let lineWidth;
          if (borderColor) {
            ctx.strokeStyle = borderColor;
            lineWidth = strokeWidth;
          } else {
            ctx.strokeStyle = highlightBorderColor || color;
            setLineStyle(ctx, LineStyleType.dashed);
            lineWidth = Math.max(1, Math.floor(hRatio));
          }
          ctx.lineWidth = lineWidth;
          ctx.beginPath();
          ctx.moveTo(scaledLeft - lineWidth / 2, scaledTop - lineWidth / 2);
          ctx.lineTo(scaledLeft - lineWidth / 2, scaledBottom + lineWidth / 2);
          ctx.lineTo(scaledRight + lineWidth / 2, scaledBottom + lineWidth / 2);
          ctx.lineTo(scaledRight + lineWidth / 2, scaledTop - lineWidth / 2);
          ctx.lineTo(scaledLeft - lineWidth / 2, scaledTop - lineWidth / 2);
          ctx.stroke();
          if (shadowed) {
            ctx.restore();
          }
        }
      }
    }
    if (!skipTextDrawing) {
      ctx.fillStyle = this._data.color;
      const baseX = (scaledLeft + Math.round(layoutData.textHorizStart * hRatio)) / hRatio;
      const lineYOffset = 0.05 * fontSize;
      let currentY = (scaledTop + Math.round((layoutData.textVertStart + lineYOffset) * vRatio)) / vRatio;
      const lineSpacing = getLineSpacing(this._data);
      const lineInfo = this.getLinesInfo();
      for (const line of lineInfo.lines) {
        drawScaled(ctx, hRatio, vRatio, () => {
          ctx.fillText(line.text, baseX, currentY);
        });
        currentY += fontSize + lineSpacing;
      }
    }
    (_a = this._data.decorator) == null ? void 0 : _a.draw(ctx, scope, this._data, layoutData);
    ctx.restore();
  }
  hitTest(point) {
    if (!this._data || this._data.points === void 0 || this._data.points.length === 0) {
      return null;
    }
    const isInsidePolygon = pointInPolygon(point, this.getPolygonPoints());
    return isInsidePolygon ? this._hitTestResult ?? new HitTestResult(HitTarget.MovePoint, {
      cursorType: PaneCursor.text,
      areaName: AreaName.Text
    }) : null;
  }
  setData(newData) {
    if (newData) {
      should(
        !newData.decorator || newData.wordWrapWidth === void 0,
        "Decorator is not supported with wordWrapWidth"
      );
      if (!isEqual(this._data, newData)) {
        this._internalData = null;
        this._boxSize = null;
        this._polygonPoints = null;
        this._centerTextRotationPoint = null;
        this._rotationPoint = null;
        this._linesInfo = null;
        this._fontInfo = null;
        this._box = null;
      }
    }
    return super.setData(newData);
  }
  setPoint(point, offsetX, offsetY) {
    const currentData = ensure(this._data);
    this.setData({
      ...currentData,
      points: [point],
      offsetX: offsetX ?? currentData.offsetX,
      offsetY: offsetY ?? currentData.offsetY
    });
  }
  point() {
    var _a, _b;
    return ((_b = (_a = this._data) == null ? void 0 : _a.points) == null ? void 0 : _b[0]) ?? null;
  }
  rect() {
    if (!this._data) return { x: 0, y: 0, width: 0, height: 0 };
    const { boxLeft: e, boxTop: t, boxWidth: i, boxHeight: s } = this._getBox();
    return { x: e, y: t, width: i, height: s };
  }
  measure() {
    if (!this._data)
      return {
        width: 0,
        height: 0
      };
    const e = this._getBoxSize();
    return { width: e.boxWidth, height: e.boxHeight };
  }
  fontStyle() {
    if (!this._data) return "";
    return this._getFontInfo().fontStyle;
  }
  lineHeight() {
    if (!this._data) return 0;
    return getFontSize(this._data);
  }
  lineSpacing() {
    if (!this._data) return 0;
    return getLineSpacing(this._data);
  }
  rotation() {
    if (this._rotationPoint === null && this._data !== null) {
      const angle = this._data.angle ?? 0;
      const rotationCenter = this._getRotationPoint();
      this._rotationPoint = {
        x: rotationCenter.x,
        y: rotationCenter.y,
        angle
      };
    }
    return this._rotationPoint;
  }
  isOutOfScreen(screenWidth, screenHeight) {
    if (!this._data || !this._data.points || this._data.points.length === 0) {
      return true;
    }
    const internalData = this._getInternalData();
    const boxRight = internalData.boxLeft + internalData.boxWidth;
    if (boxRight < 0 || internalData.boxLeft > screenWidth) {
      const screenBox = box(new Point(0, 0), new Point(screenWidth, screenHeight));
      const allOutside = this.getPolygonPoints().every((point) => !pointInBox(point, screenBox));
      return allOutside;
    }
    return false;
  }
  getPolygonPoints() {
    if (this._polygonPoints !== null) {
      return this._polygonPoints;
    }
    if (this._data === null) {
      return [];
    }
    const rotationAngle = this._data.angle || 0;
    const { boxLeft, boxTop, boxWidth, boxHeight } = this._getInternalData();
    const rotationCenter = this._getRotationPoint();
    const topLeft = new Point(boxLeft, boxTop);
    const topRight = new Point(boxLeft + boxWidth, boxTop);
    const bottomRight = new Point(boxLeft + boxWidth, boxTop + boxHeight);
    const bottomLeft = new Point(boxLeft, boxTop + boxHeight);
    const rotatedPoints = [
      rotatePoint(topLeft, rotationCenter, rotationAngle),
      rotatePoint(topRight, rotationCenter, rotationAngle),
      rotatePoint(bottomRight, rotationCenter, rotationAngle),
      rotatePoint(bottomLeft, rotationCenter, rotationAngle)
    ];
    this._polygonPoints = rotatedPoints;
    return rotatedPoints;
  }
  _getFontInfo() {
    if (this._fontInfo === null) {
      const data = ensure(this._data);
      const fontSize = getFontSize(data);
      const fontStyle = (data.bold ? "bold " : "") + (data.italic ? "italic " : "") + fontSize + "px " + data.fontFamily;
      this._fontInfo = {
        fontStyle,
        fontSize
      };
    }
    return this._fontInfo;
  }
  getLinesInfo() {
    if (this._linesInfo === null) {
      const data = ensure(this._data);
      const allLines = wordWrap(
        data.text,
        this.fontStyle(),
        this._textWidthCache,
        false,
        data.wordWrapWidth
      );
      let visibleLines = allLines.filter((line) => !line.hidden);
      if (data.maxHeight !== void 0) {
        const maxLines = (() => {
          const maxHeight = ensure(data.maxHeight);
          const lineHeight = getFontSize(data);
          const lineSpacing = getLineSpacing(data);
          return Math.floor((maxHeight + lineSpacing) / (lineHeight + lineSpacing));
        })();
        if (visibleLines.length > maxLines) {
          visibleLines = visibleLines.slice(0, maxLines);
        }
      }
      this._linesInfo = {
        linesMaxWidth: this._getLinesMaxWidth(visibleLines),
        linesIncludingHidden: allLines,
        lines: visibleLines
      };
    }
    return this._linesInfo;
  }
  _getBoxSize() {
    if (this._boxSize === null) {
      const lineInfo = this.getLinesInfo();
      const data = ensure(this._data);
      const textWidth = getBoxWidth(data, lineInfo.linesMaxWidth);
      const textHeight = getBoxHeight(data, lineInfo.lines.length);
      this._boxSize = {
        textBoxWidth: textWidth,
        textBoxHeight: textHeight,
        boxWidth: data.boxWidth ?? textWidth,
        boxHeight: data.boxHeight ?? textHeight
      };
    }
    return this._boxSize;
  }
  _getBox() {
    if (this._box) {
      return this._box;
    }
    const data = ensure(this._data);
    const [anchor] = ensure(data.points);
    const { boxWidth, boxHeight, textBoxWidth, textBoxHeight } = this._getBoxSize();
    let { x: anchorX, y: anchorY } = anchor;
    switch (data.vertAlign) {
      case VerticalAlign.Bottom:
        anchorY -= boxHeight + data.offsetY;
        break;
      case VerticalAlign.Middle:
        anchorY -= boxHeight / 2;
        break;
      case VerticalAlign.Top:
        anchorY += data.offsetY;
        break;
    }
    switch (data.horzAlign) {
      case HorizontalAlign.Left:
        anchorX += data.offsetX;
        break;
      case HorizontalAlign.Center:
        anchorX -= boxWidth / 2;
        break;
      case HorizontalAlign.Right:
        anchorX -= boxWidth + data.offsetX;
        break;
    }
    this._box = {
      boxLeft: anchorX,
      boxTop: anchorY,
      boxWidth,
      boxHeight,
      textBoxWidth,
      textBoxHeight
    };
    return this._box;
  }
  _getLinesMaxWidth(lines) {
    const fontStyle = this.fontStyle();
    if (this._data && this._data.wordWrapWidth && !this._data.forceCalculateMaxLineWidth) {
      return this._data.wordWrapWidth * getFontScale(this._data);
    }
    let maxWidth = 0;
    for (const line of lines) {
      const lineWidth = measureText(line.text, fontStyle, this._textWidthCache).width;
      maxWidth = Math.max(maxWidth, lineWidth);
    }
    return maxWidth;
  }
  _getInternalData() {
    var _a;
    if (this._internalData !== null) {
      return this._internalData;
    }
    const data = ensure(this._data);
    const boxSize = this._getBoxSize();
    const boxWidth = boxSize.boxWidth;
    const boxHeight = boxSize.boxHeight;
    const point = ensure(data.points)[0];
    let boxTop = point.y;
    switch (data.vertAlign) {
      case "bottom":
        boxTop -= boxHeight + data.offsetY;
        break;
      case "middle":
        boxTop -= boxHeight / 2;
        break;
      case "top":
        boxTop += data.offsetY;
        break;
    }
    let boxLeft = point.x;
    const leftPadding = getLeftPadding(data);
    const rightPadding = getRightPadding(data);
    const verticalPadding = getVerticalPadding(data);
    const decorator = (_a = data.decorator) == null ? void 0 : _a.geometry(data);
    const decoratorWidth = (decorator == null ? void 0 : decorator.width) ?? 0;
    const decoratorMargin = data.text.length === 0 ? 0 : (decorator == null ? void 0 : decorator.decoratorAndTextMargin) ?? 0;
    const ignoreRtl = decorator == null ? void 0 : decorator.ignoreRtl;
    const totalDecoratorSize = decoratorWidth + decoratorMargin;
    const textVerticalStart = boxTop + verticalPadding + getFontSize(data) / 2;
    switch (data.horzAlign) {
      case "left":
        boxLeft += data.offsetX;
        break;
      case "center":
        boxLeft -= boxWidth / 2;
        break;
      case "right":
        boxLeft -= boxWidth + data.offsetX;
        break;
    }
    const rtl = isRtl();
    const applyRtlFlip = rtl && !ignoreRtl;
    if (rtl || applyRtlFlip) {
      NOTIMPLEMENTED();
    }
    const decoratorLeft = applyRtlFlip ? boxLeft + boxWidth - rightPadding - decoratorWidth : boxLeft + leftPadding;
    let textAlign = "start";
    let textStartX = 0;
    const horzTextAlign = ensure(data.horzAlign);
    switch (horzTextAlign) {
      case "left":
        textAlign = "start";
        textStartX = applyRtlFlip ? data.forceTextAlign ? decoratorLeft : boxLeft + boxWidth - rightPadding : decoratorLeft + totalDecoratorSize;
        if (rtl && data.forceTextAlign) {
          textAlign = "left";
        } else if (applyRtlFlip) {
          textStartX = decoratorLeft - decoratorMargin;
          textAlign = "right";
        }
        break;
      case "center": {
        textAlign = "center";
        const availableSpace = boxWidth - leftPadding - rightPadding - totalDecoratorSize;
        textStartX = applyRtlFlip ? decoratorLeft - decoratorMargin - availableSpace / 2 : decoratorLeft + totalDecoratorSize + availableSpace / 2;
        break;
      }
      case "right":
        textAlign = "end";
        textStartX = applyRtlFlip ? decoratorLeft - decoratorMargin : boxLeft + boxWidth - rightPadding;
        if (rtl && data.forceTextAlign) {
          textAlign = "right";
        }
        break;
    }
    const internalData = {
      boxLeft,
      boxTop,
      boxWidth,
      boxHeight,
      textLeft: boxLeft + leftPadding + (applyRtlFlip ? 0 : totalDecoratorSize),
      textRight: boxLeft + boxWidth - rightPadding - (applyRtlFlip ? totalDecoratorSize : 0),
      textTop: boxTop + verticalPadding,
      textBottom: boxTop + boxHeight - verticalPadding,
      textHorizStart: textStartX - boxLeft,
      textVertStart: textVerticalStart - boxTop,
      textAlign,
      textBaseLine: "middle",
      decoratorLeft,
      decoratorWidth
    };
    return this._internalData = internalData;
  }
  centerTextRotation() {
    if (this._centerTextRotationPoint === null && this._data) {
      const angle = this._data.angle ?? 0;
      const rotationOrigin = this._getRotationPoint();
      const { textLeft, textTop, textRight, textBottom } = this._getInternalData();
      const textCenter = rotatePoint(
        new Point((textLeft + textRight) / 2, (textTop + textBottom) / 2),
        rotationOrigin,
        angle
      );
      this._centerTextRotationPoint = {
        x: textCenter.x,
        y: textCenter.y,
        angle
      };
    }
    return this._centerTextRotationPoint ?? void 0;
  }
  _getRotationPoint() {
    const { boxLeft, boxTop, boxWidth, boxHeight } = this._getInternalData();
    const { horzAlign, vertAlign } = ensure(this._data);
    let x;
    let y;
    switch (horzAlign) {
      case "center":
        x = boxLeft + boxWidth / 2;
        break;
      case "left":
        x = boxLeft;
        break;
      case "right":
        x = boxLeft + boxWidth;
        break;
    }
    switch (vertAlign) {
      case "middle":
        y = boxTop + boxHeight / 2;
        break;
      case "top":
        y = boxTop;
        break;
      case "bottom":
        y = boxTop + boxHeight;
        break;
    }
    return new Point(x, y);
  }
}
function getFontSize(data) {
  return Math.ceil(getBaseFontSize(data) * getFontScale(data));
}
function getBaseFontSize(data) {
  return data.fontSize;
}
function getFontScale(data) {
  const scale = Math.min(1, Math.max(0.2, data.scale || 1));
  if (scale === 1) {
    return scale;
  }
  const fontSize = getBaseFontSize(data);
  return Math.ceil(scale * fontSize) / fontSize;
}
function getLineSpacing(data) {
  let spacing = data.lineSpacing;
  if (spacing === void 0 && data.lineHeight !== void 0) {
    spacing = (data.lineHeight - 1) * getBaseFontSize(data);
  }
  return (spacing ?? 0) * getFontScale(data);
}
function getVerticalPadding(data) {
  if (data.boxPaddingVert !== void 0) {
    return data.boxPaddingVert * getFontScale(data);
  } else if (data.boxPadding !== void 0) {
    return data.boxPadding * getFontScale(data);
  } else {
    return getFontSize(data) / 3;
  }
}
function getHorizontalPadding(data) {
  if (data.boxPaddingHorz !== void 0) {
    return data.boxPaddingHorz * getFontScale(data);
  } else if (data.boxPadding !== void 0) {
    return data.boxPadding * getFontScale(data);
  } else {
    return getFontSize(data) / 3;
  }
}
function getLeftPadding(data) {
  if (data.boxPaddingLeft !== void 0) {
    return data.boxPaddingLeft * getFontScale(data);
  } else {
    return getHorizontalPadding(data);
  }
}
function getRightPadding(data) {
  if (data.boxPaddingRight !== void 0) {
    return data.boxPaddingRight * getFontScale(data);
  } else {
    return getHorizontalPadding(data);
  }
}
function getBoxWidth(line, textWidth) {
  var _a;
  const geometry = (_a = line.decorator) == null ? void 0 : _a.geometry(line);
  const totalWidth = Math.round(
    textWidth + getLeftPadding(line) + getRightPadding(line) + ((geometry == null ? void 0 : geometry.width) ?? 0) + (line.text.length === 0 ? 0 : (geometry == null ? void 0 : geometry.decoratorAndTextMargin) ?? 0)
  );
  return totalWidth % 2 === 0 ? totalWidth : totalWidth + 1;
}
function getBoxHeight(data, lineCount) {
  return getFontSize(data) * lineCount + getLineSpacing(data) * (lineCount - 1) + 2 * getVerticalPadding(data);
}
function splitTextIntoWords(input) {
  const result = [];
  while (input.length > 0) {
    const match = input.match(/\s+/);
    if (!match || match.index === void 0 || match.index === -1) {
      result.push({ word: input, spaces: "" });
      break;
    }
    const wordPart = input.slice(0, match.index);
    const spacePart = match[0];
    result.push({ word: wordPart, spaces: spacePart });
    input = input.slice(match.index + spacePart.length);
  }
  return result;
}
function breakLongWordToFit(word, font, textWidthCache, maxWidth) {
  const result = [];
  const indices = [];
  for (let i = 0; i < word.length; ++i) {
    indices.push(i);
  }
  while (word.length > 0) {
    const breakIndex = Math.max(
      1,
      upperbound(
        indices,
        maxWidth,
        (targetWidth, index) => measureText(word.slice(0, index + 1), font, textWidthCache).width > targetWidth,
        0,
        word.length
      )
    );
    result.push(word.slice(0, breakIndex));
    word = word.slice(breakIndex);
  }
  return result;
}
function wordWrap(text, font, textWidthCache, includeHidden = true, wrapWidth) {
  const maxWidth = isString(wrapWidth) ? parseInt(wrapWidth) : wrapWidth;
  const rawLines = (text + "").split(/\r\n|\r|\n|$/).map((line) => ({
    text: line,
    hidden: false,
    wrappedLinePart: false,
    wrappedLineEnd: false
  }));
  if (!isFiniteNumber(maxWidth) || !isFinite(maxWidth) || maxWidth <= 0) {
    return rawLines;
  }
  if (measureText("x", font, textWidthCache).width > maxWidth) {
    return rawLines;
  }
  const result = [];
  for (let i = 0; i < rawLines.length; i++) {
    const inputLine = rawLines[i];
    if (measureText(inputLine.text, font, textWidthCache).width <= maxWidth) {
      result.push(inputLine);
      continue;
    }
    const words = splitTextIntoWords(inputLine.text);
    const isWrappedLine = true;
    let lineText = "";
    let wordIndex = 0;
    while (wordIndex < words.length) {
      const wordPart = words[wordIndex];
      let candidateLine = lineText + wordPart.word;
      let candidateWidth = measureText(candidateLine, font, textWidthCache).width;
      if (candidateWidth > maxWidth) {
        if (lineText !== "") {
          result.push({
            text: lineText,
            hidden: false,
            wrappedLinePart: isWrappedLine,
            wrappedLineEnd: false
          });
          lineText = "";
        } else if (candidateLine.length === 1) {
          result.push({
            text: candidateLine,
            hidden: false,
            wrappedLinePart: isWrappedLine,
            wrappedLineEnd: true
          });
          wordPart.word = "";
        } else {
          const slicedWords = breakLongWordToFit(candidateLine, font, textWidthCache, maxWidth);
          for (let j = 0; j < slicedWords.length - 1; j++) {
            result.push({
              text: slicedWords[j],
              hidden: false,
              wrappedLinePart: isWrappedLine,
              wrappedLineEnd: false
            });
          }
          wordPart.word = slicedWords[slicedWords.length - 1];
        }
        continue;
      }
      candidateLine = lineText + wordPart.word + wordPart.spaces;
      candidateWidth = measureText(candidateLine, font, textWidthCache).width;
      if (candidateWidth < maxWidth) {
        lineText = candidateLine;
        wordIndex++;
        continue;
      }
      const slicedLine = breakLongWordToFit(candidateLine, font, textWidthCache, maxWidth);
      for (let j = 0; j < slicedLine.length; j++) {
        const part = slicedLine[j];
        const lineObj = {
          text: part,
          hidden: j > 0,
          wrappedLinePart: isWrappedLine,
          wrappedLineEnd: wordIndex === words.length - 1 && j === slicedLine.length - 1
        };
        if (!lineObj.hidden || includeHidden) {
          result.push(lineObj);
        }
      }
      lineText = "";
      wordIndex++;
    }
    if (lineText !== "") {
      result.push({
        text: lineText,
        wrappedLinePart: isWrappedLine,
        hidden: false,
        wrappedLineEnd: true
      });
    }
  }
  return result;
}
function rotatePoint(point, center, angle) {
  if (angle === 0) {
    return point.clone();
  }
  const dx = point.x - center.x;
  const dy = point.y - center.y;
  const rotatedX = dx * Math.cos(angle) - dy * Math.sin(angle) + center.x;
  const rotatedY = dx * Math.sin(angle) + dy * Math.cos(angle) + center.y;
  return new Point(rotatedX, rotatedY);
}
function scaleBoxToPixelRatio(box2, pixelRatio) {
  const { horizontalPixelRatio, verticalPixelRatio } = pixelRatio;
  const scaledLeft = Math.round(box2.boxLeft * horizontalPixelRatio);
  const scaledTop = Math.round(box2.boxTop * verticalPixelRatio);
  const scaledWidth = Math.round(box2.boxWidth * horizontalPixelRatio);
  const scaledHeight = Math.round(box2.boxHeight * verticalPixelRatio);
  return {
    scaledLeft,
    scaledRight: scaledLeft + scaledWidth,
    scaledTop,
    scaledBottom: scaledTop + scaledHeight
  };
}
function getTextBoundaries(shape, screenWidth, screenHeight) {
  if (shape.isOutOfScreen(screenWidth, screenHeight)) {
    return null;
  }
  const points = shape.getPolygonPoints();
  return points.length === 0 ? null : points;
}
function calculateLabelPosition(labelSize, point1, point2, offset, canvasHeight) {
  const centerX = 0.5 * (point1.x + point2.x);
  let y = point2.y;
  if (point1.y > point2.y) {
    y -= labelSize.height / 2 + offset.y;
    y = Math.max(labelSize.height / 2, y);
  } else {
    y += labelSize.height / 2 + offset.y;
    y = Math.min(canvasHeight - labelSize.height / 2, y);
  }
  return new Point(centerX, y);
}
function getTextAlignInBox(params) {
  const {
    horzAlign,
    extendLeft = false,
    extendRight = false,
    width,
    leftPoint,
    rightPoint
  } = params;
  const fullyVisible = (leftPoint.x <= width || extendLeft) && (rightPoint.x >= 0 || extendRight);
  let x;
  let y;
  let actualAlign = horzAlign;
  switch (horzAlign) {
    case HorizontalAlign.Left:
      y = leftPoint.y;
      if (extendLeft) {
        x = fullyVisible ? 0 : rightPoint.x;
      } else {
        x = leftPoint.x;
        actualAlign = HorizontalAlign.Right;
      }
      break;
    case HorizontalAlign.Right:
      y = rightPoint.y;
      if (extendRight) {
        x = fullyVisible ? width : leftPoint.x;
      } else {
        x = rightPoint.x;
        actualAlign = HorizontalAlign.Left;
      }
      break;
    default:
      x = ((extendLeft && fullyVisible ? 0 : leftPoint.x) + (extendRight && fullyVisible ? width : rightPoint.x)) / 2;
      y = (leftPoint.y + rightPoint.y) / 2;
      break;
  }
  return [new Point(x, y), actualAlign];
}
function needTextExclusionPath(e) {
  const lines = e.getLinesInfo().lines;
  if (lines.length % 2 == 0) return false;
  if ("" === lines[Math.floor(lines.length / 2)].text.trim()) return false;
  return true;
}
export {
  BaseTextRenderer as B,
  HorizontalAlign as H,
  VerticalAlign as V,
  getFontSize as a,
  getTextAlignInBox as b,
  calculateLabelPosition as c,
  getLineSpacing as d,
  alignByAngle as e,
  getTextBoundaries as g,
  needTextExclusionPath as n,
  wordWrap as w
};
