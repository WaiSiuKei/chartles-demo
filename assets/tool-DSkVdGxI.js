var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { D as DrawingTool } from "./toolPaneView-3wj_on-u.js";
import { az as WaveABCDEToolType } from "./index-TSHQCVD9.js";
import { W as Wave5Primitive } from "./primitive-B_It6cpK.js";
import "./index-NZHt9VGv.js";
import "./baseTool-CHlzZht2.js";
import "./priceLabelPriceAxisView-d9Maj5lR.js";
import "./timeLabelTimeAxisView-BvW_UnA0.js";
import "./axisPaneView-Pbgdotf1.js";
import "./ctx-Bv0u81rl.js";
import "./font-0BY7UpRj.js";
import "./composite-tvPrNHN0.js";
import "./polygon-CB5TCmTw.js";
import "./line-DFhYRKvt.js";
class WaveABCDEPrimitive extends Wave5Primitive {
  labelsGroup() {
    return [
      ["0", "A", "B", "C", "D", "E"],
      ["0", "a", "b", "c", "d", "e"],
      ["0", "A", "B", "C", "D", "E"],
      ["0", "a", "b", "c", "d", "e"],
      ["0", "A", "B", "C", "D", "E"]
    ];
  }
}
class WaveABCDETool extends DrawingTool {
  constructor() {
    super(...arguments);
    __publicField(this, "type", WaveABCDEToolType);
  }
  createPrimitive() {
    return new WaveABCDEPrimitive(
      {
        id: this.id,
        points: [],
        color: "#FF9800FF",
        lineWidth: 2,
        showWave: true,
        degree: 7
      },
      ...this.resetArgs
    );
  }
}
export {
  WaveABCDETool
};
