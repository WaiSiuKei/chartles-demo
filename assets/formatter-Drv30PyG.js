var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { c6 as isObjectLike, c7 as baseGetTag, c8 as isInteger, a as isFiniteNumber, e as ensure, c9 as isEven } from "./index-DSkroicZ.js";
import { f as formatterOptions, g as getNumberFormat, B as Big, a as formatNumber, p as parseNumber, N as NumericFormatter } from "./numericFormatter-6U8WkLAS.js";
import { f as forceLTRStr, a as stripLTRMarks } from "./text-FiPV6-V4.js";
var numberTag = "[object Number]";
function isNumber(value) {
  return typeof value == "number" || isObjectLike(value) && baseGetTag(value) == numberTag;
}
function numberToStringWithLeadingZero(value, length) {
  if (!isNumber(value)) return "n/a";
  if (!isInteger(length)) {
    throw new TypeError("Invalid length: must be integer");
  }
  if (length < 0 || length > 24) {
    throw new TypeError("Invalid length: must be between 0 and 24");
  }
  if (length === 0) return value.toString();
  const padded = "000000000000000000000000";
  return (padded + value.toString()).slice(-length);
}
function numDependencyFormatter(compute) {
  const cache = /* @__PURE__ */ new Map();
  return (precision) => {
    let result = cache.get(precision);
    if (result !== void 0) return result;
    result = compute(precision);
    cache.set(precision, result);
    return result;
  };
}
function normalizeMinTick(tickSize) {
  const fractional = new Big(tickSize).toFixed().split(".")[1] || "";
  const priceScale = Math.pow(10, fractional.length);
  const minMove = new Big(tickSize).mul(priceScale).toNumber();
  return {
    priceScale,
    minMove
  };
}
function parseVariableMinTickConfig(fallbackMinTick, themeStr) {
  var _a, _b;
  const fallback = [
    {
      minTick: isFiniteNumber(fallbackMinTick) ? normalizeMinTick(fallbackMinTick) : fallbackMinTick,
      price: Infinity,
      maxIndex: Infinity
    }
  ];
  try {
    const parsed = themeStr.split(" ").map((token, idx) => {
      if (isEven(idx)) {
        return parseMinTickToken(token);
      } else {
        const num = Number(token);
        if (Number.isNaN(num)) throw new Error(`Unexpected price limit: ${token}`);
        return num;
      }
    });
    if (isEven(parsed.length)) {
      throw new Error("Theme must not have even number of elements");
    }
    const result = [];
    for (let i = 0; i < parsed.length; i += 2) {
      const minTick = parsed[i];
      const boundaryPrice = parsed[i + 1] ?? Infinity;
      const prevPrice = ((_a = result[result.length - 1]) == null ? void 0 : _a.price) ?? 0;
      const prevIndex = ((_b = result[result.length - 1]) == null ? void 0 : _b.maxIndex) ?? 0;
      const tickVal = getNumericTickValue(minTick);
      const maxIndex = boundaryPrice === Infinity ? Infinity : new Big(boundaryPrice).minus(prevPrice).div(tickVal).plus(prevIndex).toNumber();
      result.push({ minTick, price: boundaryPrice, maxIndex });
    }
    return result;
  } catch {
    return fallback;
  }
}
function parseMinTickToken(token) {
  const num = Number(token);
  if (Number.isFinite(num)) {
    return normalizeMinTick(num);
  }
  const parts = token.split("/");
  if (parts.length < 2 || parts.length > 3) {
    throw new Error(`Unexpected mintick: ${token}`);
  }
  const [minMoveStr, scaleStr, minMove2Str] = parts;
  const priceScale = Number(scaleStr);
  const minMove = Number(minMoveStr);
  const minMove2 = minMove2Str !== void 0 ? Number(minMove2Str) : void 0;
  if (!Number.isFinite(priceScale) || !Number.isFinite(minMove)) {
    throw new Error(`Invalid fractional minTick: ${token}`);
  }
  if (minMove2Str !== void 0 && !Number.isFinite(minMove2)) {
    throw new Error(`Invalid minMove2 in minTick: ${token}`);
  }
  return {
    priceScale,
    minMove,
    ...minMove2 !== void 0 ? { minMove2 } : {}
  };
}
function getNumericTickValue(tick) {
  if (typeof tick === "number") return tick;
  return tick.minMove / tick.priceScale;
}
class DecimalFormatter {
  constructor(config) {
    __publicField(this, "_priceScale");
    __publicField(this, "_minMove");
    __publicField(this, "_minMove2");
    __publicField(this, "_ignoreMinMove");
    __publicField(this, "_fractionalLength");
    __publicField(this, "_variableMinTickData");
    __publicField(this, "_formatterErrors", {
      custom: "custom_format_error",
      fraction: "fraction_format_error",
      secondFraction: "secondary_fraction_error"
    });
    const { priceScale, minMove, minMove2, ignoreMinMove, variableMinTick, fractionalLength } = config;
    this._priceScale = priceScale;
    this._minMove = minMove;
    this._minMove2 = minMove2;
    this._ignoreMinMove = ignoreMinMove;
    this._fractionalLength = fractionalLength;
    if (variableMinTick !== void 0) {
      this._variableMinTickData = parseVariableMinTickConfig(
        {
          priceScale,
          minMove,
          minMove2
        },
        variableMinTick
      );
    }
  }
  /**
  
     格式化数字为字符串（带方向、修饰、精度控制）
     */
  formatImpl(value, options = {}) {
    const {
      signPositive,
      signNegative = true,
      tailSize,
      cutFractionalByPrecision = false,
      useRtlFormat = true,
      variableMinTickDataPrice,
      ignoreLocaleNumberFormat,
      removeAllEndingZeros
    } = options;
    let prefix = "";
    if (value < 0) {
      prefix = signNegative === false ? "" : "−";
    } else if (value !== 0 && signPositive === true) {
      prefix = "+";
    }
    const absValue = Math.abs(value);
    const formatted = this._formatUnsigned(
      absValue,
      tailSize,
      cutFractionalByPrecision,
      variableMinTickDataPrice,
      ignoreLocaleNumberFormat,
      removeAllEndingZeros
    );
    return useRtlFormat ? forceLTRStr(prefix + formatted) : prefix + formatted;
  }
  /**
  
     Parses a formatted string back into a number
     */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  parse(raw, options) {
    let str = stripLTRMarks(raw);
    str = str.replace("−", "-");
    if (str.startsWith("+")) {
      str = str.substring(1);
    }
    return this._parseUnsigned(str);
  }
  /**
  
     去除结尾的零
     */
  _removeEndingZeros(valueStr, maxCount) {
    let result = valueStr;
    for (let i = 0; i < maxCount && result.endsWith("0"); i++) {
      result = result.slice(0, -1);
    }
    return result;
  }
  /**
  
     实际格式化正数为字符串（核心行为封装，伪代码）
     */
  _formatUnsigned(value, tailSize, cutFractionalByPrecision, variableMinTickDataPrice, ignoreLocaleNumberFormat, removeAllEndingZeros) {
    let formatted = value.toFixed(2);
    if (removeAllEndingZeros) {
      formatted = this._removeEndingZeros(formatted, 5);
    }
    return formatted;
  }
  /**
  
     实际解析无符号字符串为数值（留空，假设已实现）
     */
  _parseUnsigned(input) {
    return parseFloat(input);
  }
  /**
  
     是否支持 Forex 附加精度（与其他格式器接口保持一致）
     */
  hasForexAdditionalPrecision() {
    return false;
  }
}
function getMatchingTickRule(ctx) {
  const { minTick, price, variableMinTickData, shouldCheckForEquality } = ctx;
  if (variableMinTickData === void 0) {
    return isFiniteNumber(minTick) ? normalizeMinTick(minTick) : minTick;
  }
  return findTickFromData(price, variableMinTickData, shouldCheckForEquality);
}
function findTickFromData(price, rules, equalCheck = false) {
  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i];
    if (price < rule.price) return rule.minTick;
    if (equalCheck && price === rule.price) return rule.minTick;
  }
  return rules[rules.length - 1].minTick;
}
function calculateFractionalLength(priceScale, minMove, useFractional, minMove2) {
  let fractionalLength = 0;
  if (priceScale > 0 && minMove > 0) {
    let scale = priceScale;
    if (useFractional && minMove2 !== void 0) {
      scale = priceScale / minMove2;
    }
    while (scale > 1) {
      scale /= 10;
      fractionalLength++;
    }
  }
  return fractionalLength;
}
function getTickFormatByPrice(useFractional, variableMinTickData, price) {
  const matchedTick = ensure(
    getMatchingTickRule({
      price,
      minTick: null,
      variableMinTickData,
      shouldCheckForEquality: true
    })
  );
  const { priceScale, minMove, minMove2 } = matchedTick;
  return {
    priceScale,
    minMove,
    fractionalLength: calculateFractionalLength(priceScale, minMove, useFractional, minMove2)
  };
}
class DecimalPriceFormatter extends DecimalFormatter {
  constructor(options) {
    super(options);
    __publicField(this, "_ignoreLocaleNumberFormat");
    const { minMove2, ignoreLocaleNumberFormat } = options;
    this._ignoreLocaleNumberFormat = ignoreLocaleNumberFormat;
  }
  /**
   * 是否激活了为 Forex 提供额外精度的模式
   */
  hasForexAdditionalPrecision() {
    return this._minMove2 === 10;
  }
  _parseUnsigned(input, options) {
    return this._parseAsDecimal(input, options);
  }
  _formatUnsigned(value, tailSize, cutFractional, priceForVariableTick, ignoreLocaleFormat, removeTrailingZeros) {
    const data = {
      price: Math.abs(value),
      priceScale: this._priceScale,
      minMove: this._minMove,
      fractionalLength: this._fractionalLength,
      tailSize,
      cutFractionalByPrecision: cutFractional,
      ignoreLocaleNumberFormat: ignoreLocaleFormat,
      removeAllEndingZeros: removeTrailingZeros
    };
    if (this._variableMinTickData !== void 0) {
      const variableTick = getTickFormatByPrice(
        false,
        this._variableMinTickData,
        priceForVariableTick ?? data.price
      );
      Object.assign(data, variableTick);
      if (this._ignoreMinMove) {
        data.minMove = 1;
      }
    }
    return this._formatAsDecimal(data);
  }
  /**
   * 格式为指数形式，如 1.234e+6
   */
  _formatAsExponential(price, locale) {
    const baseExp = Math.floor(0.75 * Math.log10(this._priceScale));
    const num = price * Math.pow(10, baseExp);
    const exponent = `e-${baseExp}`;
    const precision = Math.log10(this._priceScale) - baseExp;
    return `${num.toFixed(precision).replace(".", locale.decimalSign)}${exponent}`;
  }
  /**
   * 普通格式化逻辑（支持尾数截取、本地化、动态 tick、小数 / 整数分段）
   */
  _formatAsDecimal(data) {
    const {
      price,
      priceScale,
      minMove,
      fractionalLength = 0,
      tailSize = 0,
      cutFractionalByPrecision,
      ignoreLocaleNumberFormat,
      removeAllEndingZeros
    } = data;
    const locale = getNumberFormat(this._ignoreLocaleNumberFormat || ignoreLocaleNumberFormat);
    if (price >= 1e21) {
      return price.toString().replace(".", locale.decimalSign);
    }
    if (priceScale > 1e15) {
      return this._formatAsExponential(price, locale);
    }
    const precisionFactor = Math.pow(10, tailSize) * priceScale / (cutFractionalByPrecision ? 1 : minMove);
    const baseUnit = 1 / precisionFactor;
    let intPart;
    if (precisionFactor > 1) {
      intPart = Math.floor(price);
    } else {
      const approx = Math.floor(Math.round(price / baseUnit) * baseUnit);
      intPart = Math.round((price - approx) / baseUnit) === 0 ? approx : approx + baseUnit;
    }
    let fractionStr = "";
    if (precisionFactor > 1) {
      let fraction;
      if (cutFractionalByPrecision) {
        const computed = new Big(price).times(precisionFactor).round().minus(new Big(intPart).times(precisionFactor));
        fraction = computed.toNumber();
      } else {
        const raw = Math.round(price * precisionFactor) - intPart * precisionFactor;
        fraction = parseFloat(raw.toFixed(fractionalLength));
      }
      if (fraction >= precisionFactor) {
        fraction -= precisionFactor;
        intPart += 1;
      }
      if (cutFractionalByPrecision) {
        fraction = new Big(fraction).round(fractionalLength).toNumber();
      } else {
        fraction *= minMove;
      }
      const rawFraction = numberToStringWithLeadingZero(fraction, fractionalLength + tailSize);
      const trimmed = this._removeEndingZeros(
        rawFraction,
        removeAllEndingZeros ? rawFraction.length : tailSize
      );
      fractionStr = trimmed ? locale.decimalSign + trimmed : "";
    }
    return formatNumber(intPart, locale) + fractionStr;
  }
  /**
   * 字符串解析为数值（含本地化符号处理）
   */
  _parseAsDecimal(input, options = {}) {
    const { ignoreLocaleNumberFormat } = options;
    const locale = getNumberFormat(this._ignoreLocaleNumberFormat || ignoreLocaleNumberFormat);
    const parsed = parseNumber(input, locale);
    return Number.isFinite(parsed) ? { value: parsed, res: true, suggest: this.formatImpl(parsed) } : { error: this._formatterErrors.custom, res: false };
  }
}
const SINGLE_FRACTION_PATTERN = /^\d+([.,]\d+)?$/;
class FractionalPriceFormatter extends DecimalFormatter {
  constructor(params) {
    super(params);
    const { minMove2 } = params;
    if (minMove2 != null && minMove2 > 0 && minMove2 !== 2 && minMove2 !== 4 && minMove2 !== 8) {
      console.warn("invalid minmove2");
    }
  }
  /**
   * 恒为 false，Fractional 不支持 Forex 精度增强
   */
  hasForexAdditionalPrecision() {
    return false;
  }
  /**
   * 字符串解析器（双分数 vs 单分数自动判断）
   */
  _parseUnsigned(input) {
    return this._minMove2 ? this._parseAsDoubleFractional(input) : this._parseAsSingleFractional(input);
  }
  /**
   * 数值格式化为价格（含分数）
   */
  _formatUnsigned(value, tailSize, cutPrecision, priceOverride) {
    const data = {
      price: Math.abs(value),
      priceScale: this._priceScale,
      minMove: this._minMove,
      minMove2: this._minMove2,
      fractionalLength: ensure(this._fractionalLength),
      tailSize
    };
    if (this._variableMinTickData !== void 0) {
      Object.assign(
        data,
        getTickFormatByPrice(true, this._variableMinTickData, priceOverride ?? data.price)
      );
    }
    return this._formatAsFractional(data);
  }
  /**
   * 单分数（如 122'05）解析器
   */
  _parseAsSingleFractional(input) {
    if (SINGLE_FRACTION_PATTERN.test(input)) {
      const value = parseFloat(input);
      return { value, res: true, suggest: this.formatImpl(value) };
    }
    const regex = new RegExp(`^(-?)(\\d+)\\${formatterOptions.decimalSignFractional}(\\d+)$`);
    const match = regex.exec(input);
    if (match) {
      const isNegative = !!match[1];
      const integerPart = parseInt(match[2]);
      const fractionalPart = parseInt(match[3]);
      const scale = this._priceScale;
      const frac = this._patchFractPart(fractionalPart, 1, scale);
      if (frac >= scale || frac < 0) {
        return { error: this._formatterErrors.fraction, res: false };
      }
      let val = integerPart + frac / scale;
      if (isNegative) val = -val;
      return { value: val, res: true, suggest: this.formatImpl(val) };
    }
    return { error: this._formatterErrors.custom, res: false };
  }
  /**
   * 双分数（如 122'05'7）解析器
   */
  _parseAsDoubleFractional(input) {
    if (SINGLE_FRACTION_PATTERN.test(input)) {
      const value = parseFloat(input);
      return { value, res: true, suggest: this.formatImpl(value) };
    }
    const regex = new RegExp(
      `^(-?)(\\d+)\\${formatterOptions.decimalSignFractional}(\\d+)\\${formatterOptions.decimalSignFractional}(\\d+)$`
    );
    const match = regex.exec(input);
    if (match) {
      const isNegative = !!match[1];
      const integerPart = parseInt(match[2]);
      const part1 = parseInt(match[3]);
      const part2 = parseInt(match[4]);
      const denom2 = this._minMove2;
      const primaryBase = this._priceScale / denom2;
      const f1 = this._patchFractPart(part1, 1, primaryBase);
      const f2 = this._patchFractPart(part2, 2, denom2);
      if (f1 >= primaryBase || f1 < 0) return { error: this._formatterErrors.fraction, res: false };
      if (f2 >= denom2 || f2 < 0)
        return {
          error: this._formatterErrors.secondFraction,
          res: false
        };
      let val = integerPart + f1 / primaryBase + f2 / (primaryBase * denom2);
      if (isNegative) val = -val;
      return { value: val, res: true, suggest: this.formatImpl(val) };
    }
    return { error: this._formatterErrors.custom, res: false };
  }
  /**
   * 给定数字转换为格式字符串形式，输出如 "122'05'7"
   */
  _formatAsFractional(data) {
    const { price, tailSize, priceScale, minMove, minMove2, fractionalLength } = data;
    const base = priceScale / minMove;
    let whole = Math.floor(price);
    let firstFrac = tailSize ? Math.floor(price * base) - whole * base : Math.round(price * base) - whole * base;
    if (firstFrac === base) {
      whole += 1;
      firstFrac = 0;
    }
    let tail = "";
    if (tailSize) {
      let remainder = (price - whole - firstFrac / base) * base;
      remainder = Math.round(remainder * 10 ** tailSize);
      tail = numberToStringWithLeadingZero(remainder, tailSize);
      tail = this._removeEndingZeros(tail, tailSize);
    }
    if (fractionalLength == null) {
      throw new Error("_fractionalLength is not calculated");
    }
    let formattedFraction = "";
    if (minMove2) {
      const second = firstFrac % minMove2;
      firstFrac = (firstFrac - second) / minMove2;
      const primary = numberToStringWithLeadingZero(firstFrac, fractionalLength);
      const secondFmt = this._getFractPart(second, 2, minMove2);
      formattedFraction = primary + formatterOptions.decimalSignFractional + secondFmt;
    } else {
      const mapped = this._getFractPart(firstFrac, 1, priceScale);
      formattedFraction = numberToStringWithLeadingZero(mapped * minMove, fractionalLength);
    }
    return whole.toString() + formatterOptions.decimalSignFractional + formattedFraction + tail;
  }
  /**
   * 修复分数部分（从映射表里按分母转换为数值索引）
   */
  _patchFractPart(value, level, denominator) {
    const TABLE_2 = { 0: 0, 5: 1 };
    const TABLE_4 = { 0: 0, 2: 1, 5: 2, 7: 3 };
    const TABLE_8 = {
      0: 0,
      1: 1,
      2: 2,
      3: 3,
      5: 4,
      6: 5,
      7: 6,
      8: 7
    };
    if (denominator === 2) return Reflect.get(TABLE_2, value) ?? -1;
    if (denominator === 4) return Reflect.get(TABLE_4, value) ?? -1;
    if (denominator === 8 && level === 2) return Reflect.get(TABLE_8, value) ?? -1;
    return value;
  }
  /**
   * 提取和映射分母部分
   */
  _getFractPart(value, level, denominator) {
    const TABLE_2 = [0, 5];
    const TABLE_4 = [0, 2, 5, 7];
    const TABLE_8 = [0, 1, 2, 3, 5, 6, 7, 8];
    if (denominator === 2) return TABLE_2[value] ?? -1;
    if (denominator === 4) return TABLE_4[value] ?? -1;
    if (denominator === 8 && level === 2) return TABLE_8[value] ?? -1;
    return value;
  }
}
class PriceFormatter {
  constructor(options = {}) {
    __publicField(this, "type", "price");
    __publicField(this, "_priceScale");
    __publicField(this, "_minMove");
    __publicField(this, "_minMove2");
    __publicField(this, "_fractional");
    __publicField(this, "_variableMinTick");
    __publicField(this, "_ignoreMinMove");
    __publicField(this, "_fractionalLength");
    __publicField(this, "_ignoreLocaleNumberFormat");
    __publicField(this, "_implementation");
    const { minMove2, fractional, variableMinTick, ignoreMinMove, ignoreLocaleNumberFormat } = options;
    const minMove = !options.minMove || ignoreMinMove ? 1 : options.minMove;
    const priceScale = isFiniteNumber(options.priceScale) && isInteger(options.priceScale) ? options.priceScale : 100;
    if (priceScale < 0) {
      throw new TypeError("Invalid priceScale base");
    }
    const fractionalLength = calculateFractionalLength(priceScale, minMove, fractional, minMove2);
    const passedOptions = {
      ...options,
      minMove,
      priceScale,
      fractionalLength
    };
    this._priceScale = priceScale;
    this._minMove = minMove;
    this._minMove2 = minMove2;
    this._fractional = fractional;
    this._variableMinTick = variableMinTick;
    this._ignoreMinMove = ignoreMinMove;
    this._ignoreLocaleNumberFormat = ignoreLocaleNumberFormat;
    this._fractionalLength = fractionalLength;
    this._implementation = fractional ? new FractionalPriceFormatter(passedOptions) : new DecimalPriceFormatter(passedOptions);
  }
  /**
  
     判断是否使用分数制报价
     */
  isFractional() {
    return !!this._fractional;
  }
  /**
  
     导出当前配置状态
     */
  state() {
    return {
      minMove: this._minMove,
      minMove2: this._minMove2,
      priceScale: this._priceScale,
      variableMinTick: this._variableMinTick,
      ignoreMinMove: this._ignoreMinMove,
      fractional: this._fractional
    };
  }
  /**
  
     对两个价格变化值进行格式化（如用于 "Δ变化" 显示）
     */
  formatChange(from, to, options = {}) {
    return this._implementation.formatImpl(to - from, {
      ...options,
      variableMinTickDataPrice: Math.min(Math.abs(from), Math.abs(to))
    });
  }
  /**
  
     格式化价格值
     */
  format(value, options) {
    return this._implementation.formatImpl(value, options);
  }
  /**
  
     解析文本为数值
     */
  parse(text, options) {
    return this._implementation.parse(text, options);
  }
  /**
  
     返回是否启用了 Forex 额外精度模式（仅实现类知道）
     */
  hasForexAdditionalPrecision() {
    return this._implementation.hasForexAdditionalPrecision();
  }
  /**
  
     序列化为 Plain Object
     */
  static serialize(formatter) {
    return formatter.state();
  }
  /**
  
     从序列化对象恢复构造
     */
  static deserialize(state) {
    return new PriceFormatter(state);
  }
}
class PercentageFormatter extends PriceFormatter {
  constructor(options = {}) {
    if (options.decimalPlaces !== void 0) {
      options.priceScale = Math.pow(10, options.decimalPlaces);
    }
    super(options);
    __publicField(this, "type", "percentage");
  }
  /**
   * 获取当前格式化器状态
   */
  state() {
    return {
      ...super.state(),
      percent: true
    };
  }
  parse(input, options) {
    const stripped = input.replace("%", "");
    return super.parse(stripped, options);
  }
  /**
   * 将数字格式化为百分比字符串（可选强制 LTR 显示）
   * @param value - 如 0.618
   * @param options - { useRtlFormat: boolean }
   * @returns "61.80%" 或 LTR 包裹后的字符串
   */
  format(value, options = {}) {
    const { useRtlFormat = true } = options;
    const raw = super.format(value, { ...options, useRtlFormat: false }) + "%";
    return useRtlFormat ? forceLTRStr(raw) : raw;
  }
  /**
   * 序列化用于持久化/保存设置
   */
  static serialize(formatter) {
    return formatter.state();
  }
  /**
   * 从 state 反序列化格式化器
   */
  static deserialize(state) {
    return new PercentageFormatter(state);
  }
}
class PipPriceFormatter extends PriceFormatter {
  constructor(options) {
    var __super = (...args) => {
      super(...args);
      __publicField(this, "_isForex");
      __publicField(this, "_pipPriceScale");
      __publicField(this, "_pipMinMove");
      __publicField(this, "_pipMinMove2");
      return this;
    };
    const {
      priceScale,
      minMove = 1,
      minMove2,
      type,
      typespecs,
      ignoreLocaleNumberFormat
    } = options;
    const isCFD = (type2) => !!(typespecs == null ? void 0 : typespecs.includes("cfd")) && ["commodity", "futures", "index", "stock", "fund"].includes(type2);
    const isForex = type === "forex" || isCFD(type);
    if (isForex && minMove2) {
      __super({
        priceScale: minMove2,
        ignoreLocaleNumberFormat
      });
      this._isForex = true;
    } else {
      __super({
        priceScale: 1,
        ignoreLocaleNumberFormat
      });
      this._isForex = false;
    }
    this._pipPriceScale = priceScale;
    this._pipMinMove = minMove;
    this._pipMinMove2 = minMove2;
  }
  format(value, opts = {}) {
    const minMove = this._isForex ? this._pipMinMove2 : this._pipMinMove;
    const multiplier = this._pipPriceScale / (minMove ?? NaN);
    return super.format(value * multiplier, opts);
  }
}
const getNumericFormatter = numDependencyFormatter(
  (precision) => new NumericFormatter({ precision })
);
const getPercentageFormatter = numDependencyFormatter(
  (precision) => new PercentageFormatter({
    priceScale: Math.pow(10, precision ?? 2),
    minMove: 1
  })
);
const pipFormatterCache = /* @__PURE__ */ new WeakMap();
function getPipFormatter(priceFormat) {
  let cached = pipFormatterCache.get(priceFormat);
  if (!cached) {
    cached = new PipPriceFormatter({
      priceScale: priceFormat.pricescale,
      minMove: priceFormat.minmov,
      minMove2: priceFormat.minmove2,
      type: priceFormat.type,
      typespecs: priceFormat.typespecs
    });
    pipFormatterCache.set(priceFormat, cached);
  }
  return cached;
}
export {
  getPipFormatter as a,
  getNumericFormatter as b,
  getPercentageFormatter as g,
  numberToStringWithLeadingZero as n
};
