var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { aZ as AnchoredTextToolType } from "./index-DSkroicZ.js";
import { TextTool } from "./tool-CnYa7PRz.js";
import "./toolPaneView-BAEHHn7m.js";
import "./baseTool-BVX9dcKc.js";
import "./textPaneView-DmGg5Esj.js";
import "./priceLabelPriceAxisView-d9Maj5lR.js";
import "./timeLabelTimeAxisView-BvW_UnA0.js";
import "./composite-BOGQNAfc.js";
import "./renderer-Bgvp02WJ.js";
import "./text-DNYLW3w-.js";
import "./text-FiPV6-V4.js";
import "./ctx-DYUP60aL.js";
class AnchoredTextTool extends TextTool {
  constructor() {
    super(...arguments);
    __publicField(this, "type", AnchoredTextToolType);
    __publicField(this, "fixed", true);
  }
}
export {
  AnchoredTextTool
};
