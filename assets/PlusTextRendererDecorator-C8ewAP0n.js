var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { a as getFontSize } from "./text-DNYLW3w-.js";
const _PlusTextRendererDecorator = class _PlusTextRendererDecorator {
  geometry(data) {
    const fontSizeValue = getFontSize(data);
    return {
      decoratorAndTextMargin: fontSizeValue / 3,
      width: Math.round(0.8 * fontSizeValue),
      ignoreRtl: false
    };
  }
  draw(ctx, pixelRatio, style, layout) {
    const { horizontalPixelRatio: hRatio, verticalPixelRatio: vRatio } = pixelRatio;
    const lineWidth = Math.max(1, Math.round(hRatio * layout.decoratorWidth / 8));
    const pixelAlignOffset = lineWidth % 2 / 2;
    const centerY = Math.round((layout.textTop + layout.textBottom) / 2 * vRatio) + pixelAlignOffset;
    const centerX = Math.round((layout.decoratorLeft + layout.decoratorWidth / 2) * hRatio) + pixelAlignOffset;
    const size = Math.round(layout.decoratorWidth * hRatio);
    ctx.strokeStyle = style.color;
    ctx.lineWidth = lineWidth;
    let halfSize = size / 2;
    if (centerX % 2 / 2 !== halfSize % 2 / 2) {
      halfSize += 0.5;
    }
    ctx.beginPath();
    ctx.moveTo(centerX - halfSize, centerY);
    ctx.lineTo(centerX + halfSize, centerY);
    ctx.moveTo(centerX, centerY - halfSize);
    ctx.lineTo(centerX, centerY + halfSize);
    ctx.stroke();
  }
  static instance() {
    if (!this._instance) {
      this._instance = new _PlusTextRendererDecorator();
    }
    return this._instance;
  }
};
__publicField(_PlusTextRendererDecorator, "_instance", null);
let PlusTextRendererDecorator = _PlusTextRendererDecorator;
PlusTextRendererDecorator.instance();
export {
  PlusTextRendererDecorator as P
};
