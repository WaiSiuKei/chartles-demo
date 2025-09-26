var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { A as ArrowMarkTool, a as ArrowMarkDirection } from "./tool-9Ex48vRY.js";
import { h as ArrowMarkRightToolType } from "./index-DNbtFiKr.js";
import "./toolPaneView-BAEHHn7m.js";
import "./index-DSkroicZ.js";
import "./baseTool-BVX9dcKc.js";
import "./priceLabelPriceAxisView-d9Maj5lR.js";
import "./timeLabelTimeAxisView-BvW_UnA0.js";
import "./composite-BOGQNAfc.js";
class ArrowMarkRightTool extends ArrowMarkTool {
  constructor() {
    super(...arguments);
    __publicField(this, "type", ArrowMarkRightToolType);
    __publicField(this, "direction", ArrowMarkDirection.right);
  }
}
export {
  ArrowMarkRightTool
};
