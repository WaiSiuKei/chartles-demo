var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { TrendLineTool } from "./tool-D37yKHg2.js";
import { W as InfoLineToolType } from "./index-TSHQCVD9.js";
import "./index-NZHt9VGv.js";
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
class InfoLineTool extends TrendLineTool {
  constructor() {
    super(...arguments);
    __publicField(this, "type", InfoLineToolType);
    __publicField(this, "showPriceRange", true);
    __publicField(this, "showPercentPriceRange", true);
    __publicField(this, "showPipsPriceRange", true);
    __publicField(this, "showBarsRange", true);
    __publicField(this, "showDistance", true);
    __publicField(this, "showAngle", true);
    __publicField(this, "alwaysShowStats", true);
  }
}
export {
  InfoLineTool
};
