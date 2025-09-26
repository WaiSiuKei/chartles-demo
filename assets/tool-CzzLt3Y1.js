var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { aZ as AnchoredTextToolType } from "./index-NZHt9VGv.js";
import { TextTool } from "./tool-82zp6Sw4.js";
import "./toolPaneView-3wj_on-u.js";
import "./baseTool-CHlzZht2.js";
import "./textPaneView-DMnMnXxK.js";
import "./priceLabelPriceAxisView-d9Maj5lR.js";
import "./timeLabelTimeAxisView-BvW_UnA0.js";
import "./composite-tvPrNHN0.js";
import "./renderer-CPHquQ6g.js";
import "./text-CtvZov1L.js";
import "./text-8RrTwjoh.js";
import "./ctx-Bv0u81rl.js";
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
