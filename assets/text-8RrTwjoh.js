import { b9 as isMacintosh, e as ensure } from "./index-NZHt9VGv.js";
const isRtl = () => window.document.dir === "rtl";
const LRM = "‎";
const LRE = "‪";
const RLE = "‫";
const PDF = "‬";
const bidiControlCharRegex = new RegExp(LRM + "|" + LRE + "|" + RLE + "|" + PDF, "g");
function stripLTRMarks(input) {
  if (input === "" || input == null || !isRtl()) return input;
  return input.replace(bidiControlCharRegex, "");
}
function forceLTRStr(text) {
  if (text !== "" && text !== null && isRtl()) {
    return LRE + text + PDF;
  }
  return text;
}
function startWithLTR(input) {
  if (input === "" || input == null || !isRtl()) return input;
  return `${LRM}${input}`;
}
let canvasContext = null;
function measureText(text, font, textMetricsProvider) {
  if (!canvasContext) {
    const canvas = document.createElement("canvas");
    canvas.width = 0;
    canvas.height = 0;
    if (isMacintosh) {
      canvas.style.display = "none";
      document.body.append(canvas);
    }
    canvasContext = ensure(canvas.getContext("2d"));
    canvasContext.textBaseline = "alphabetic";
    canvasContext.textAlign = "center";
  }
  canvasContext.font = font;
  return textMetricsProvider ? textMetricsProvider.getMetrics(canvasContext, text) : getMinTextMetrics(canvasContext.measureText(text));
}
function getMinTextMetrics(e) {
  return {
    width: e.width,
    actualBoundingBoxAscent: e.actualBoundingBoxAscent,
    actualBoundingBoxDescent: e.actualBoundingBoxDescent,
    fontBoundingBoxAscent: e.fontBoundingBoxAscent,
    fontBoundingBoxDescent: e.fontBoundingBoxDescent
  };
}
function calcTextHorizontalShift(ctx, textWidth) {
  const align = ctx.textAlign;
  if (align === "center") {
    return 0;
  }
  const rtl = isRtl();
  if (rtl) {
    return align === "start" || align === "right" ? textWidth : 0;
  } else {
    return align === "start" || align === "left" ? 0 : textWidth;
  }
}
export {
  stripLTRMarks as a,
  calcTextHorizontalShift as c,
  forceLTRStr as f,
  isRtl as i,
  measureText as m,
  startWithLTR as s
};
