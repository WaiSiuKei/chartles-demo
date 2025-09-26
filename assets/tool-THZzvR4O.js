var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { aQ as ArrowMarkUpToolType } from "./index-NZHt9VGv.js";
import { A as ArrowMarkTool, a as ArrowMarkDirection } from "./tool-qdzw9oxH.js";
import "./toolPaneView-3wj_on-u.js";
import "./baseTool-CHlzZht2.js";
import "./priceLabelPriceAxisView-d9Maj5lR.js";
import "./timeLabelTimeAxisView-BvW_UnA0.js";
import "./composite-tvPrNHN0.js";
class ArrowMarkUpTool extends ArrowMarkTool {
  constructor() {
    super(...arguments);
    __publicField(this, "type", ArrowMarkUpToolType);
    __publicField(this, "direction", ArrowMarkDirection.up);
  }
}
export {
  ArrowMarkUpTool
};
