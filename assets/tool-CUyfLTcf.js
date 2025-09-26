var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { bN as LineEnd } from "./index-NZHt9VGv.js";
import { TrendLineTool } from "./tool-D37yKHg2.js";
import { e as ArrowToolType } from "./index-TSHQCVD9.js";
import "./text-CtvZov1L.js";
import "./text-8RrTwjoh.js";
import "./ctx-Bv0u81rl.js";
import "./toolPaneView-3wj_on-u.js";
import "./baseTool-CHlzZht2.js";
import "./TrendToolWithStatsPaneView-2bdv8Mcb.js";
import "./font-0BY7UpRj.js";
import "./formatter-_n1ErJyi.js";
import "./numericFormatter-Dh0kn-kp.js";
import "./composite-tvPrNHN0.js";
import "./svg-C4bIXpLS.js";
import "./textPaneView-DMnMnXxK.js";
import "./priceLabelPriceAxisView-d9Maj5lR.js";
import "./timeLabelTimeAxisView-BvW_UnA0.js";
import "./axisPaneView-Pbgdotf1.js";
import "./PlusTextRendererDecorator-D4ze-RfF.js";
import "./line-DFhYRKvt.js";
import "./renderer-CPHquQ6g.js";
class ArrowTool extends TrendLineTool {
  constructor() {
    super(...arguments);
    __publicField(this, "type", ArrowToolType);
    __publicField(this, "rightEnd", LineEnd.Arrow);
  }
}
export {
  ArrowTool
};
