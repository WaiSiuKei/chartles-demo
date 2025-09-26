var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { c5 as getLightenRGBA } from "./index-NZHt9VGv.js";
import { D as DrawingTool } from "./toolPaneView-3wj_on-u.js";
import { a5 as PatternXABCDToolType } from "./index-TSHQCVD9.js";
import { P as PatternXABCDPrimitive } from "./primitive-CtKho7pk.js";
import "./baseTool-CHlzZht2.js";
import "./priceLabelPriceAxisView-d9Maj5lR.js";
import "./timeLabelTimeAxisView-BvW_UnA0.js";
import "./axisPaneView-Pbgdotf1.js";
import "./text-CtvZov1L.js";
import "./text-8RrTwjoh.js";
import "./ctx-Bv0u81rl.js";
import "./formatter-_n1ErJyi.js";
import "./numericFormatter-Dh0kn-kp.js";
import "./composite-tvPrNHN0.js";
import "./line-DFhYRKvt.js";
import "./polygon-CB5TCmTw.js";
import "./triangle-CyrUWcBj.js";
import "./line-DZhB7Jxo.js";
class PatternXABCDTool extends DrawingTool {
  constructor() {
    super(...arguments);
    __publicField(this, "type", PatternXABCDToolType);
  }
  createPrimitive() {
    return new PatternXABCDPrimitive(
      {
        id: this.id,
        points: [],
        color: "#2962FFFF",
        lineWidth: 2,
        background: getLightenRGBA("#2962FFFF", 0.15),
        textColor: "#ffffff",
        textFontSize: 12
      },
      ...this.resetArgs
    );
  }
}
export {
  PatternXABCDTool
};
