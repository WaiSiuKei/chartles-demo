var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { e as ensure, O as NOTREACHED } from "./index-DSkroicZ.js";
class ViewBoxTransform {
  constructor(originalViewBox) {
    __publicField(this, "_originalViewBox");
    this._originalViewBox = originalViewBox;
  }
  /**
   * 将 canvas 上下文根据目标 viewBox 进行变换和剪裁，使得 SVG 设计坐标正确映射到实际 canvas。
   * @param ctx CanvasRenderingContext2D 对象。
   * @param renderContext 包含目标的 targetViewBox 信息。
   */
  apply(ctx, renderContext) {
    const targetViewBox = renderContext.targetViewBox;
    ctx.translate(targetViewBox.x, targetViewBox.y);
    ctx.scale(
      targetViewBox.width / this._originalViewBox.width,
      targetViewBox.height / this._originalViewBox.height
    );
    ctx.beginPath();
    ctx.rect(0, 0, this._originalViewBox.width, this._originalViewBox.height);
    ctx.clip();
    ctx.translate(-this._originalViewBox.x, -this._originalViewBox.y);
  }
}
class SvgTransformApplier {
  constructor(transformOperations) {
    __publicField(this, "_transformOperations");
    this._transformOperations = transformOperations;
  }
  /**
   * 在传入的 CanvasRenderingContext2D 上应用 transform。
   * - 如果有 transform 操作，则 save() 并执行
   * - 否则直接 restore()
   */
  apply(ctx) {
    if (this._transformOperations !== null) {
      ctx.save();
      applyTransform(ctx, this._transformOperations);
    } else {
      ctx.restore();
    }
  }
}
function getFloatAttribute(element, attributeName) {
  const value = element.getAttribute(attributeName);
  return parseFloat(value ?? "");
}
function parseLinearGradient(gradientElement) {
  const gradientUnits = gradientElement.getAttribute("gradientUnits");
  if (gradientUnits === "objectBoundingBox") {
    console.warn(`Unsupported linearGradient gradientUnits: ${gradientUnits}`);
    return void 0;
  }
  const colorStops = [];
  const stopElements = gradientElement.getElementsByTagName("stop");
  for (let i = 0; i < stopElements.length; ++i) {
    const stop = stopElements[i];
    const offset = getFloatAttribute(stop, "offset");
    const stopColor = stop.getAttribute("stop-color");
    if (stopColor !== null) {
      colorStops.push([Number.isFinite(offset) ? offset : 0, stopColor]);
    }
  }
  const x1 = getFloatAttribute(gradientElement, "x1");
  const y1 = getFloatAttribute(gradientElement, "y1");
  const x2 = getFloatAttribute(gradientElement, "x2");
  const y2 = getFloatAttribute(gradientElement, "y2");
  return (ctx) => {
    const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
    for (const stop of colorStops) {
      gradient.addColorStop(stop[0], stop[1]);
    }
    return gradient;
  };
}
function parseDefs(defsElement) {
  const gradientMap = {};
  const defsChildren = defsElement.children;
  for (let i = 0; i < defsChildren.length; ++i) {
    const child = defsChildren[i];
    const id = child.getAttribute("id");
    if (!id) continue;
    if (child.tagName === "linearGradient") {
      gradientMap[id] = ensure(parseLinearGradient(child));
    } else {
      console.warn(`Unsupported defs tag: ${child.tagName}`);
    }
  }
  const cachedResults = /* @__PURE__ */ new WeakMap();
  return {
    getStyle: (id, ctx) => {
      const gradientFunc = gradientMap[id];
      if (!gradientFunc) return;
      let ctxCache = cachedResults.get(ctx);
      if (ctxCache === void 0) {
        ctxCache = /* @__PURE__ */ new Map();
        cachedResults.set(ctx, ctxCache);
      }
      if (ctxCache.has(id)) return ctxCache.get(id);
      const style = gradientFunc(ctx);
      ctxCache.set(id, style);
      return style;
    }
  };
}
function parseNumericArgs(input, requiredCount) {
  const parts = input.split(/[,\s]+/g).map((part) => parseFloat(part.trim()));
  let index = 0;
  for (const num of parts) {
    if (!Number.isFinite(num) && index < requiredCount) {
      return null;
    }
    index += 1;
  }
  return parts;
}
function parseSvgNode(node, renderObjects, defsStyleProvider, inheritedStyle = /* @__PURE__ */ Object.create(null)) {
  const children = node.children;
  let viewBoxTransform;
  let currentStyle = inheritedStyle;
  if (node.tagName === "g" || node.tagName === "svg") {
    currentStyle = {
      ...inheritedStyle,
      ...parseStyleAttributes(node, defsStyleProvider, false)
    };
    const viewBox = parseTransform(node);
    if (viewBox) {
      viewBoxTransform = viewBox;
      renderObjects.push(new SvgTransformApplier(viewBoxTransform));
    }
  }
  for (let i = 0; i < children.length; ++i) {
    const child = children[i];
    if (child.tagName !== "defs") {
      parseSvgNode(child, renderObjects, defsStyleProvider, currentStyle);
    }
  }
  switch (node.tagName) {
    case "g":
    case "svg":
    case "defs":
      break;
    case "path":
      renderObjects.push(new SvgPath(node, defsStyleProvider, inheritedStyle));
      break;
    case "circle":
      renderObjects.push(new SvgCircle(node, defsStyleProvider, inheritedStyle));
      break;
    case "ellipse":
      renderObjects.push(new SvgEllipse(node, defsStyleProvider, inheritedStyle));
      break;
    default:
      console.warn(`Unsupported tag name: ${node.tagName}`);
      break;
  }
}
const transformRegex = /([a-zA-Z]+)\((.*)\)/g;
function parseTransform(element) {
  var _a;
  const transformString = (_a = element.getAttribute("transform")) == null ? void 0 : _a.toLowerCase();
  if (transformString === void 0) return null;
  const transforms = [];
  let match;
  transformRegex.lastIndex = 0;
  do {
    match = transformRegex.exec(transformString);
    if (match !== null) {
      const type = match[1];
      const paramsRaw = match[2];
      switch (type) {
        case "matrix": {
          const matrixArgs = parseNumericArgs(paramsRaw, 6);
          if (matrixArgs !== null) {
            transforms.push({
              type: "matrix",
              a: matrixArgs[0],
              b: matrixArgs[1],
              c: matrixArgs[2],
              d: matrixArgs[3],
              e: matrixArgs[4],
              f: matrixArgs[5]
            });
          }
          break;
        }
        case "rotate": {
          const rotateArgs = parseNumericArgs(paramsRaw, 1);
          if (rotateArgs !== null) {
            transforms.push({
              type: "rotate",
              a: rotateArgs[0],
              // 角度
              x: rotateArgs[1],
              // 可选：旋转中心 x（默认 undefined）
              y: rotateArgs[2]
              // 可选：旋转中心 y
            });
          }
          break;
        }
        case "translate": {
          const translateArgs = parseNumericArgs(paramsRaw, 1);
          if (translateArgs !== null) {
            transforms.push({
              type: "translate",
              x: translateArgs[0],
              y: translateArgs[1]
            });
          }
          break;
        }
        case "scale": {
          const scaleArgs = parseNumericArgs(paramsRaw, 1);
          if (scaleArgs !== null) {
            transforms.push({
              type: "scale",
              x: scaleArgs[0],
              y: scaleArgs[1]
            });
          }
          break;
        }
        default:
          console.warn(`Unsupported transform operation: ${type}`);
      }
    }
  } while (match !== null);
  return transforms.length === 0 ? null : transforms;
}
function parseStyleAttributes(elem, defsProvider, includeTransform) {
  const style = /* @__PURE__ */ Object.create(null);
  const fill = elem.getAttribute("fill");
  if (fill !== null) {
    const fillRefId = extractUrlId(fill);
    style.getFillStyle = fillRefId !== null ? (ctx) => ensure(defsProvider.getStyle(fillRefId, ctx)) : () => fill;
  }
  const stroke = elem.getAttribute("stroke");
  if (stroke !== null) {
    const strokeRefId = extractUrlId(stroke);
    style.getStrokeStyle = strokeRefId !== null ? (ctx) => ensure(defsProvider.getStyle(strokeRefId, ctx)) : () => stroke;
  }
  const strokeWidth = getFloatAttribute(elem, "stroke-width");
  if (Number.isFinite(strokeWidth)) {
    style.strokeWidth = strokeWidth;
  }
  const opacity = getFloatAttribute(elem, "opacity");
  if (Number.isFinite(opacity)) {
    style.fillOpacity = opacity;
    style.strokeOpacity = opacity;
  }
  const strokeOpacity = getFloatAttribute(elem, "stroke-opacity");
  if (Number.isFinite(strokeOpacity)) {
    style.strokeOpacity = strokeOpacity;
  }
  const fillOpacity = getFloatAttribute(elem, "fill-opacity");
  if (Number.isFinite(fillOpacity)) {
    style.fillOpacity = fillOpacity;
  }
  if (includeTransform) {
    const transform = parseTransform(elem);
    if (transform !== null) {
      style.transform = transform;
    }
  }
  return style;
}
function extractUrlId(value) {
  const match = /^url\(#(.*)\)$/.exec(value);
  return (match == null ? void 0 : match[1]) ?? null;
}
class SvgRenderable {
  constructor(element, defsProvider, inheritedStyle) {
    __publicField(this, "_styleData");
    this._styleData = {
      ...inheritedStyle,
      ...parseStyleAttributes(element, defsProvider, true)
      // include transform
    };
  }
  /**
   * 绘制到 Canvas 的上下文中。
   * @param ctx - CanvasRenderingContext2D
   * @param renderConfig - 渲染配置，例如 doNotApplyColors
   */
  apply(ctx, renderConfig) {
    if (!this._isValid()) return;
    const { getFillStyle, getStrokeStyle, strokeWidth, transform, strokeOpacity, fillOpacity } = this._styleData;
    const needsRestore = transform !== void 0 || strokeOpacity !== void 0 || fillOpacity !== void 0;
    if (needsRestore) {
      ctx.save();
      if (transform !== void 0) {
        applyTransform(ctx, transform);
      }
    }
    this._render(ctx);
    const fillStyle = getFillStyle == null ? void 0 : getFillStyle(ctx);
    if (fillStyle !== "none") {
      if (!renderConfig.doNotApplyColors) {
        if (fillOpacity !== void 0) ctx.globalAlpha = fillOpacity;
        ctx.fillStyle = fillStyle ?? "black";
      }
      this._fill(ctx);
    }
    const strokeStyle = getStrokeStyle == null ? void 0 : getStrokeStyle(ctx);
    if (strokeStyle !== void 0 && strokeStyle !== "none") {
      if (strokeWidth !== void 0) {
        ctx.lineWidth = strokeWidth;
      }
      if (!renderConfig.doNotApplyColors) {
        if (fillOpacity !== void 0) ctx.globalAlpha = fillOpacity;
        ctx.strokeStyle = strokeStyle;
      }
      this._stroke(ctx);
    }
    if (needsRestore) {
      ctx.restore();
    }
  }
  /**
   * Canvas 填充调用。子类也可 override。
   */
  _fill(ctx) {
    ctx.fill();
  }
  /**
   * Canvas 描边调用。子类也可 override。
   */
  _stroke(ctx) {
    ctx.stroke();
  }
  /**
   * 可扩展的有效性检查，默认始终有效
   */
  _isValid() {
    return true;
  }
}
class SvgPath extends SvgRenderable {
  constructor(element, defsProvider, inheritedStyle) {
    super(element, defsProvider, inheritedStyle);
    __publicField(this, "_path");
    __publicField(this, "_fillRule");
    const dAttr = element.getAttribute("d");
    this._path = dAttr !== null ? new Path2D(dAttr) : null;
    const rule = element.getAttribute("fill-rule");
    this._fillRule = rule !== null ? rule : void 0;
  }
  _render() {
  }
  // 使用 Path2D 执行填充，支持 fill-rule 自动
  _fill(ctx) {
    ctx.fill(ensure(this._path), this._fillRule);
  }
  // 使用 Path2D 执行描边
  _stroke(ctx) {
    ctx.stroke(ensure(this._path));
  }
  _isValid() {
    return this._path !== null;
  }
}
class SvgCircle extends SvgRenderable {
  constructor(element, defs, parentStyle) {
    super(element, defs, parentStyle);
    __publicField(this, "_cx");
    __publicField(this, "_cy");
    __publicField(this, "_r");
    this._cx = getFloatAttribute(element, "cx");
    this._cy = getFloatAttribute(element, "cy");
    this._r = getFloatAttribute(element, "r");
  }
  /**
   * 在 canvas 上绘制圆路径（不填充/描边，仅 path）
   */
  _render(ctx) {
    ctx.beginPath();
    ctx.arc(this._cx, this._cy, this._r, 0, 2 * Math.PI);
  }
  /**
   * 参数合法性检查：cx/cy/r 是有限数值
   */
  _isValid() {
    return Number.isFinite(this._cx) && Number.isFinite(this._cy) && Number.isFinite(this._r);
  }
}
class SvgEllipse extends SvgRenderable {
  constructor(element, defs, parentStyle) {
    super(element, defs, parentStyle);
    __publicField(this, "_cx");
    __publicField(this, "_cy");
    __publicField(this, "_rx");
    __publicField(this, "_ry");
    this._cx = getFloatAttribute(element, "cx");
    this._cy = getFloatAttribute(element, "cy");
    this._rx = getFloatAttribute(element, "rx");
    this._ry = getFloatAttribute(element, "ry");
  }
  /**
   * 使用 Canvas API 绘制椭圆路径（注意不是圆）
   */
  _render(ctx) {
    ctx.beginPath();
    ctx.ellipse(this._cx, this._cy, this._rx, this._ry, 0, 0, 2 * Math.PI);
  }
  /**
   * 参数校验：判断 cx、cy、rx、ry 是否是合法浮点数
   */
  _isValid() {
    return Number.isFinite(this._cx) && Number.isFinite(this._cy) && Number.isFinite(this._rx) && Number.isFinite(this._ry);
  }
}
function applyTransform(ctx, transforms) {
  for (const transform of transforms) {
    switch (transform.type) {
      case "matrix":
        ctx.transform(transform.a, transform.b, transform.c, transform.d, transform.e, transform.f);
        break;
      case "rotate":
        if (transform.x !== void 0 && transform.y !== void 0) {
          ctx.translate(transform.x, transform.y);
        }
        ctx.rotate(transform.a * Math.PI / 180);
        if (transform.x !== void 0 && transform.y !== void 0) {
          ctx.translate(-transform.x, -transform.y);
        }
        break;
      case "scale":
        ctx.scale(transform.x, transform.y !== void 0 ? transform.y : transform.x);
        break;
      case "translate":
        ctx.translate(transform.x, transform.y !== void 0 ? transform.y : 0);
        break;
      default:
        NOTREACHED();
    }
  }
}
let domParser = void 0;
function svgRenderer(svgString) {
  const xmlDocument = (domParser || (domParser = new DOMParser())).parseFromString(
    svgString,
    "application/xml"
  );
  const renderObjects = [];
  const svgElement = xmlDocument.getElementsByTagName("svg")[0];
  const viewBoxValues = ensure(svgElement.getAttribute("viewBox")).split(" ").map(parseFloat);
  const viewBox = {
    x: viewBoxValues[0],
    y: viewBoxValues[1],
    width: viewBoxValues[2],
    height: viewBoxValues[3]
  };
  renderObjects.push(new ViewBoxTransform(viewBox));
  let styleFetcher = {
    getStyle: () => {
      return "";
    }
  };
  const defsElements = svgElement.getElementsByTagName("defs");
  if (defsElements.length > 0) {
    styleFetcher = parseDefs(defsElements[0]);
  }
  parseSvgNode(svgElement, renderObjects, styleFetcher);
  return {
    viewBox: () => viewBox,
    render: (ctx, context) => {
      ctx.save();
      for (const renderObj of renderObjects) {
        renderObj.apply(ctx, context);
      }
      ctx.restore();
    }
  };
}
export {
  svgRenderer as s
};
