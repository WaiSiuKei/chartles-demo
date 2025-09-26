var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { y as HitTestResult, z as HitTarget, e as ensure, r as ChartFontFamily, am as memoize } from "./index-NZHt9VGv.js";
import { g as getPercentageFormatter, b as getNumericFormatter } from "./formatter-_n1ErJyi.js";
import { L as LineRenderer } from "./line-DFhYRKvt.js";
import { B as BaseTextRenderer, b as getTextAlignInBox } from "./text-CtvZov1L.js";
import { T as ToolPaneView } from "./toolPaneView-3wj_on-u.js";
var __defProp2 = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = __getOwnPropDesc(target, key);
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = decorator(target, key, result) || result;
  if (result) __defProp2(target, key, result);
  return result;
};
class FibWIthLabelsPaneView extends ToolPaneView {
  constructor() {
    super(...arguments);
    __publicField(this, "_labelsRenderers", /* @__PURE__ */ new Map());
    __publicField(this, "_textRenderers", /* @__PURE__ */ new Map());
    __publicField(this, "_levelLineRenderers", /* @__PURE__ */ new Map());
  }
  get _percentageFormatter() {
    return getPercentageFormatter();
  }
  get _numericFormatter() {
    return getNumericFormatter();
  }
  getTextRenderer(idx) {
    let textRenderer = this._textRenderers.get(idx);
    if (!textRenderer) {
      textRenderer = new BaseTextRenderer();
      this._labelsRenderers.set(idx, textRenderer);
    }
    return textRenderer;
  }
  getLabelRenderer(idx) {
    let labelRenderer = this._labelsRenderers.get(idx);
    if (!labelRenderer) {
      labelRenderer = new BaseTextRenderer(new HitTestResult(HitTarget.MovePoint));
      this._labelsRenderers.set(idx, labelRenderer);
    }
    return labelRenderer;
  }
  getLevelLineRenderer(idx) {
    return ensure(
      this._levelLineRenderers.has(idx) ? this._levelLineRenderers.get(idx) : this._levelLineRenderers.set(idx, new LineRenderer()).get(idx)
    );
  }
  _updateLabelForLevel(params) {
    const labelRenderer = this.getLabelRenderer(params.levelIndex);
    const properties = this._source.properties();
    const showCoefficients = Boolean(properties.showCoeffs);
    const showPrices = Boolean(properties.showPrices);
    if (!showCoefficients && !showPrices) return null;
    const coefficient = params.coeff;
    let labelText = "";
    if (showCoefficients) {
      const showAsPercent = properties.coeffsAsPercents ?? false;
      labelText += showAsPercent ? this._percentageFormatter.format(100 * coefficient, {
        signPositive: false,
        tailSize: 2
      }) : this._numericFormatter.format(coefficient);
    }
    if (showPrices) {
      labelText += " (" + params.price + ")";
    }
    this._updateRendererLabel(params, labelRenderer, labelText);
    return labelRenderer;
  }
  _updateRendererLabel(params, labelRenderer, labelText) {
    if (!labelText && params.decorator === void 0) return null;
    const { leftPoint, rightPoint, horzAlign, extendLeft, extendRight, ...renderOptions } = params;
    const [alignedPoint, resolvedAlign] = getTextAlignInBox({
      horzAlign,
      extendLeft,
      extendRight,
      width: this._source.getScope().mediaSize.width,
      leftPoint,
      rightPoint
    });
    labelRenderer.setData({
      points: [alignedPoint],
      text: labelText ?? "",
      horzAlign: resolvedAlign,
      offsetX: 4,
      offsetY: 0,
      fontFamily: ChartFontFamily,
      fontSize: 12,
      ...renderOptions
      // 其余如 vertAlign、color 等自定义项
    });
    return labelRenderer;
  }
}
__decorateClass([
  memoize
], FibWIthLabelsPaneView.prototype, "_numericFormatter");
export {
  FibWIthLabelsPaneView as F
};
