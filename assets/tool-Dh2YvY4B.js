var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { D as DrawingTool } from "./toolPaneView-BAEHHn7m.js";
import { aB as WaveWXYXZToolType } from "./index-DNbtFiKr.js";
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
class WaveWXYXZPrimitive extends Wave5Primitive {
  labelsGroup() {
    return [
      ["0", "W", "X", "Y", "X", "Z"],
      ["0", "w", "x", "y", "x", "z"],
      ["0", "W", "X", "Y", "X", "Z"],
      ["0", "w", "x", "y", "x", "z"],
      ["0", "W", "X", "Y", "X", "Z"]
    ];
  }
}
class WaveWXYXZTool extends DrawingTool {
  constructor() {
    super(...arguments);
    __publicField(this, "type", WaveWXYXZToolType);
  }
  createPrimitive() {
    return new WaveWXYXZPrimitive(
      {
        id: this.id,
        points: [],
        color: "#6AA84FFF",
        lineWidth: 2,
        showWave: true,
        degree: 7
      },
      ...this.resetArgs
    );
  }
}
export {
  WaveWXYXZTool
};
