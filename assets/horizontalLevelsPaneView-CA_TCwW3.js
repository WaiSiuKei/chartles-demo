var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { e as ensure, u as Point, bN as LineEnd } from "./index-DSkroicZ.js";
import { H as HorizontalAlign, V as VerticalAlign, a as getFontSize, d as getLineSpacing, g as getTextBoundaries } from "./text-DNYLW3w-.js";
import { C as CompositeRenderer } from "./composite-BOGQNAfc.js";
import { F as FibWIthLabelsPaneView } from "./paneView-C9pa4pz3.js";
function fibLevelCoordinate(base, delta, level, priceScale, isCoordinateBased) {
  if (isCoordinateBased) {
    return Math.round(ensure(base.coordinate) + ensure(delta.coordinate) * level);
  } else {
    const price = ensure(base.price) + ensure(delta.price) * level;
    return ensure(priceScale.priceToCoordinate(price));
  }
}
function fibLevelPrice(base, delta, level, priceScale, isCoordinateBased) {
  if (!isCoordinateBased) {
    return ensure(base.price) + ensure(delta.price) * level;
  } else {
    const coordinate = ensure(base.coordinate) + ensure(delta.coordinate) * level;
    return ensure(priceScale.coordinateToPrice(coordinate));
  }
}
const DefaultTextAlign = [HorizontalAlign.Center, VerticalAlign.Middle];
function extractPointAndRect(renderer) {
  return {
    renderer,
    point: ensure(renderer.point()),
    rect: renderer.rect(),
    horzAlign: ensure(renderer.data().horzAlign)
  };
}
function placeTextLeftOfLabel(label, text) {
  const newX = label.rect.x - text.rect.width - DEFAULT_PADDING;
  text.renderer.setPoint(new Point(newX + text.rect.width / 2, text.point.y));
}
function placeTextRightOfLabel(label, text) {
  const newX = label.rect.x + label.rect.width + DEFAULT_PADDING;
  text.renderer.setPoint(new Point(newX + text.rect.width / 2, text.point.y));
}
function isTooWide(targetRect, maxWidth) {
  return maxWidth !== null && targetRect.rect.width > maxWidth;
}
function alignCenter(label, text) {
  const centerX = label.rect.x + (label.rect.width + text.rect.width) / 2;
  const labelX = centerX - label.rect.width / 2;
  const textX = centerX + label.rect.width / 2;
  if (label) label.renderer.setPoint(new Point(labelX + label.rect.width / 2, label.point.y));
  if (text) text.renderer.setPoint(new Point(textX + text.rect.width / 2, text.point.y));
}
function getAlignWeight(align) {
  return { left: 0, center: 1, right: 2 }[align];
}
const DEFAULT_PADDING = 4;
function calculateTextMaxAvailableWidth(config) {
  const {
    leftAnchorX,
    rightAnchorX,
    extendLeft,
    extendRight,
    screenWidth,
    labelRenderer,
    horzLabelsAlign,
    labelAndTextHaveSameVertAlign
  } = config;
  const labelWidth = labelAndTextHaveSameVertAlign ? calcClampedLabelWidth(labelRenderer == null ? void 0 : labelRenderer.rect(), screenWidth) : 0;
  let availableWidth = 0;
  if (extendLeft || extendRight) {
    if (extendLeft && extendRight) {
      availableWidth = screenWidth - labelWidth;
    } else if (extendLeft) {
      availableWidth = rightAnchorX - (horzLabelsAlign === "left" ? labelWidth : 0);
    } else if (extendRight) {
      availableWidth = screenWidth - leftAnchorX - (horzLabelsAlign === "right" ? labelWidth : 0);
    }
  } else {
    availableWidth = rightAnchorX - leftAnchorX - (horzLabelsAlign === "center" ? labelWidth : 0);
  }
  return availableWidth - 8;
}
function calcClampedLabelWidth(labelRect, screenWidth) {
  if (!labelRect) return 0;
  const leftEdge = clamp(labelRect.x, 0, screenWidth);
  const rightEdge = clamp(labelRect.x + labelRect.width, 0, screenWidth);
  return rightEdge - leftEdge;
}
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
function adjustLabelAndTextPosition(options) {
  const {
    labelAndTextHaveSameAlign,
    labelAndTextHaveSameVertAlign,
    labelRenderer,
    textRenderer,
    horzTextAlign,
    horzLabelsAlign,
    textMaxWidth,
    extendLeft = false,
    extendRight = false
  } = options;
  if (labelAndTextHaveSameAlign) {
    const label = extractPointAndRect(labelRenderer);
    const text = extractPointAndRect(textRenderer);
    switch (horzTextAlign) {
      case "left":
        if (extendLeft) {
          placeTextRightOfLabel(label, text);
        } else {
          placeTextLeftOfLabel(label, text);
        }
        break;
      case "center":
        if (isTooWide(text, textMaxWidth)) return { hideText: true };
        alignCenter(label, text);
        break;
      case "right":
        if (extendRight) {
          placeTextLeftOfLabel(label, text);
        } else {
          placeTextRightOfLabel(label, text);
        }
        break;
    }
    return { hideText: false };
  }
  if (textMaxWidth !== null) {
    if (isTooWide(extractPointAndRect(textRenderer), textMaxWidth)) {
      return { hideText: true };
    }
  }
  if (labelAndTextHaveSameVertAlign) {
    const labelRect = labelRenderer.rect();
    const textRect = textRenderer.rect();
    const currentTextPoint = ensure(textRenderer.point());
    if (getAlignWeight(horzTextAlign) < getAlignWeight(horzLabelsAlign)) {
      const overlap = textRect.x + textRect.width + DEFAULT_PADDING - labelRect.x;
      if (overlap > 0) {
        textRenderer.setPoint(new Point(currentTextPoint.x - overlap, currentTextPoint.y));
      }
    } else {
      const overlap = labelRect.x + labelRect.width + DEFAULT_PADDING - textRect.x;
      if (overlap > 0) {
        textRenderer.setPoint(new Point(currentTextPoint.x + overlap, currentTextPoint.y));
      }
    }
  }
  return { hideText: false };
}
function adjustVerticalAlignToMiddle(renderer) {
  if (!renderer) return;
  const data = ensure(renderer.data());
  const currentAlign = data.vertAlign;
  if (currentAlign !== VerticalAlign.Middle) {
    const point = ensure(data.points)[0];
    const direction = currentAlign === VerticalAlign.Top ? 1 : -1;
    const dy = direction * (getFontSize(data) + getLineSpacing(data));
    renderer.setData({
      ...data,
      vertAlign: VerticalAlign.Middle,
      points: [new Point({ x: point.x, y: point.y + dy })]
    });
  }
}
function getVerticalMiddleTextBounds(text, verticalAlign, width, height) {
  if (text !== null && verticalAlign === VerticalAlign.Middle) {
    const bounds = getTextBoundaries(text, width, height);
    if (bounds) return [bounds];
  }
  return [];
}
class FibHorizontalLevelsPaneView extends FibWIthLabelsPaneView {
  constructor() {
    super(...arguments);
    __publicField(this, "_renderer", new CompositeRenderer(this._hitTestCollector));
  }
  // _levelLineRenderers = new Map();
  renderer() {
    return this._renderer;
  }
  _addLevels(config) {
    const {
      mediaSize,
      levels,
      left,
      right,
      showText,
      labelAlign: labelAlignment,
      textAlign: textAlignment,
      extendLeft,
      extendRight,
      isOnScreen,
      trendLineRenderer
    } = config;
    let drawLeft = left;
    let drawRight = right;
    if (drawLeft === drawRight) {
      if (extendLeft) drawLeft--;
      if (extendRight) drawRight++;
    }
    const { width: canvasWidth, height: canvasHeight } = mediaSize;
    const levelRenderers = [];
    const labelRenderers = [];
    this._model.isSelected(this._source);
    const [labelHorzAlign, labelVertAlign] = labelAlignment;
    for (const level of levels) {
      const y = level.y;
      const startPt = new Point(drawLeft, y);
      const endPt = new Point(drawRight, y);
      const hasText = !!level.text;
      const currentIndex = level.index;
      const isEditing = false;
      const isPlusText = !hasText && true;
      const [textHorzAlign, textVertAlign] = isPlusText ? DefaultTextAlign : textAlignment;
      const sameHorz = labelHorzAlign === textHorzAlign;
      const baseRenderProps = {
        levelIndex: currentIndex,
        coeff: level.coeff,
        leftPoint: startPt,
        rightPoint: endPt,
        color: level.color,
        extendLeft,
        extendRight
      };
      const isHovered = false;
      let textRenderer = null;
      const shouldRenderText = showText && (hasText || isHovered || isEditing);
      const forceShowPlusText = shouldRenderText && !hasText && true;
      if (shouldRenderText && (!forceShowPlusText || true)) {
        textRenderer = ensure(this.getTextRenderer(currentIndex));
        this._updateRendererLabel(
          {
            ...baseRenderProps,
            // ...(isEditing ? this._inplaceTextHighlight() : {}),
            horzAlign: textHorzAlign,
            vertAlign: textVertAlign,
            // color: isEditing ? this._textColor() : level.color,
            color: level.color
            // decorator: textDecorator,
          },
          textRenderer,
          // isEditing ? this._inplaceTextData() : level.text || 'Text',
          level.text || "Text"
        );
      }
      const labelRenderer = this._updateLabelForLevel({
        ...baseRenderProps,
        price: level.price,
        horzAlign: labelHorzAlign,
        vertAlign: labelVertAlign
        // boxPaddingRight: isLabelDecorated ? 0 : undefined,
      });
      let hideText = false;
      if (textRenderer && labelRenderer) {
        const sameVertAlign = labelVertAlign === textVertAlign;
        hideText = adjustLabelAndTextPosition({
          labelRenderer,
          textRenderer,
          labelAndTextHaveSameAlign: sameHorz,
          labelAndTextHaveSameVertAlign: sameVertAlign,
          horzTextAlign: textHorzAlign,
          horzLabelsAlign: labelHorzAlign,
          textMaxWidth: forceShowPlusText ? calculateTextMaxAvailableWidth({
            leftAnchorX: drawLeft,
            rightAnchorX: drawRight,
            extendLeft,
            extendRight,
            screenWidth: canvasWidth,
            horzLabelsAlign: labelHorzAlign,
            labelRenderer,
            labelAndTextHaveSameVertAlign: sameVertAlign
          }) : null,
          extendLeft,
          extendRight
        }).hideText;
      }
      if (isOnScreen) {
        adjustVerticalAlignToMiddle(textRenderer);
        adjustVerticalAlignToMiddle(labelRenderer);
        const skipDraw = !extendLeft && !extendRight && (textRenderer && textHorzAlign === "center" && textVertAlign === "middle" && drawRight - 4 < textRenderer.rect().x + textRenderer.rect().width || labelRenderer && labelHorzAlign === "center" && labelVertAlign === "middle" && drawLeft + 4 > labelRenderer.rect().x);
        if (!skipDraw) {
          const lineExclusionRegions = [
            ...getVerticalMiddleTextBounds(
              labelRenderer,
              labelVertAlign,
              canvasWidth,
              canvasHeight
            ),
            ...getVerticalMiddleTextBounds(
              hideText ? null : textRenderer,
              textVertAlign,
              canvasWidth,
              canvasHeight
            )
          ];
          const lineRenderer = this.getLevelLineRenderer(currentIndex);
          lineRenderer.setData({
            points: [startPt, endPt],
            lineColor: level.color,
            lineWidth: level.linewidth,
            lineStyle: level.linestyle,
            extendLeft,
            extendRight,
            leftEnd: LineEnd.Normal,
            rightEnd: LineEnd.Normal,
            excludeBoundaries: lineExclusionRegions,
            hitTestTolerance: 4
          });
          levelRenderers.push(lineRenderer);
        }
      }
      if (labelRenderer && !labelRenderer.isOutOfScreen(canvasWidth, canvasHeight)) {
        labelRenderers.push(labelRenderer);
      }
      if (!hideText && textRenderer && !textRenderer.isOutOfScreen(canvasWidth, canvasHeight)) {
        labelRenderers.push(textRenderer);
      }
    }
    for (const renderer of levelRenderers) {
      this._renderer.append(renderer);
    }
    if (trendLineRenderer) {
      this._renderer.append(trendLineRenderer);
    }
    for (const renderer of labelRenderers) {
      this._renderer.append(renderer);
    }
  }
}
export {
  FibHorizontalLevelsPaneView as F,
  fibLevelPrice as a,
  fibLevelCoordinate as f
};
