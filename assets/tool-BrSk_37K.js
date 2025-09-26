var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { D as DrawingTool } from "./toolPaneView-BAEHHn7m.js";
import { ax as Wave12345ToolType } from "./index-DNbtFiKr.js";
import { W as Wave5Primitive } from "./primitive-BYkTzPRy.js";
import "./index-DSkroicZ.js";
import "./baseTool-BVX9dcKc.js";
import "./priceLabelPriceAxisView-d9Maj5lR.js";
import "./timeLabelTimeAxisView-BvW_UnA0.js";
import "./axisPaneView-Pbgdotf1.js";
import "./ctx-DYUP60aL.js";
import "./font-0BY7UpRj.js";
import "./composite-BOGQNAfc.js";
import "./polygon-C6s4PX2h.js";
import "./line-CuaAD_DW.js";
class Wave12345Primitive extends Wave5Primitive {
  labelsGroup() {
    return [
      ["0", "1", "2", "3", "4", "5"],
      ["0", "i", "ii", "iii", "iv", "v"],
      ["0", "1", "2", "3", "4", "5"],
      ["0", "I", "II", "III", "IV", "V"],
      ["0", "1", "2", "3", "4", "5"]
    ];
  }
}
class Wave12345Tool extends DrawingTool {
  constructor() {
    super(...arguments);
    __publicField(this, "type", Wave12345ToolType);
  }
  createPrimitive() {
    return new Wave12345Primitive(
      {
        id: this.id,
        points: [],
        color: "#3D85C6FF",
        lineWidth: 2,
        showWave: true,
        degree: 7
      },
      ...this.resetArgs
    );
  }
}
export {
  Wave12345Tool
};
