import { e as ensure } from "./index-DSkroicZ.js";
function getCanvasDevicePixelRatio(c) {
  var _a, _b;
  return Math.max(1, ((_b = (_a = c.ownerDocument) == null ? void 0 : _a.defaultView) == null ? void 0 : _b.devicePixelRatio) || 1);
}
function drawScaled(ctx, scaleX, scaleY, drawFn) {
  ctx.save();
  ctx.scale(scaleX, scaleY);
  drawFn();
  ctx.restore();
}
function disableSelection(e) {
  e.style.userSelect = "none";
  e.style.webkitUserSelect = "none";
  e.style.msUserSelect = "none";
  e.style.MozUserSelect = "none";
  e.style.webkitTapHighlightColor = "transparent";
}
function createCanvas(doc) {
  const t = doc.createElement("canvas");
  disableSelection(t);
  return t;
}
function createDisconnectedCanvas(doc, size, pixelRatio) {
  const targetCanvas = createCanvas(doc);
  if (pixelRatio === void 0) {
    pixelRatio = getCanvasDevicePixelRatio(targetCanvas);
  }
  targetCanvas.width = size.width * pixelRatio;
  targetCanvas.height = size.height * pixelRatio;
  return targetCanvas;
}
function getPrescaledContext2D(c) {
  const ctx = ensure(c.getContext("2d"));
  const dpr = getCanvasDevicePixelRatio(c);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}
export {
  createDisconnectedCanvas as c,
  drawScaled as d,
  getPrescaledContext2D as g
};
