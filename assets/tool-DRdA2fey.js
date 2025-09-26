var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { D as DrawingTool } from "./toolPaneView-BAEHHn7m.js";
import { P as PitchforkPrimitive, a as PitchforkStyle } from "./primitive-Di2XJumq.js";
import { a8 as PitchforkToolType } from "./index-DNbtFiKr.js";
import "./index-DSkroicZ.js";
import "./baseTool-BVX9dcKc.js";
import "./priceLabelPriceAxisView-d9Maj5lR.js";
import "./timeLabelTimeAxisView-BvW_UnA0.js";
import "./axisPaneView-Pbgdotf1.js";
import "./channel-BYLWF8B5.js";
import "./line-CuaAD_DW.js";
import "./composite-BOGQNAfc.js";
class PitchforkTool extends DrawingTool {
  constructor() {
    super(...arguments);
    __publicField(this, "type", PitchforkToolType);
  }
  createPrimitive() {
    return new PitchforkPrimitive(
      {
        id: this.id,
        points: [],
        fillBackground: true,
        transparency: 80,
        style: PitchforkStyle.Original,
        median: {
          visible: true,
          color: "#F23645",
          linewidth: 2,
          linestyle: 0
        },
        extendLines: false,
        levels: [
          {
            coeff: 0.25,
            color: "#ffb74d",
            visible: false,
            linestyle: 0,
            linewidth: 2
          },
          {
            coeff: 0.382,
            color: "#81c784",
            visible: false,
            linestyle: 0,
            linewidth: 2
          },
          {
            coeff: 0.5,
            color: "#089981",
            visible: true,
            linestyle: 0,
            linewidth: 2
          },
          {
            coeff: 0.618,
            color: "#089981",
            visible: false,
            linestyle: 0,
            linewidth: 2
          },
          {
            coeff: 0.75,
            color: "#00bcd4",
            visible: false,
            linestyle: 0,
            linewidth: 2
          },
          {
            coeff: 1,
            color: "#2962FF",
            visible: true,
            linestyle: 0,
            linewidth: 2
          },
          {
            coeff: 1.5,
            color: "#9c27b0",
            visible: false,
            linestyle: 0,
            linewidth: 2
          },
          {
            coeff: 1.75,
            color: "#e91e63",
            visible: false,
            linestyle: 0,
            linewidth: 2
          },
          {
            coeff: 2,
            color: "#F77C80",
            visible: false,
            linestyle: 0,
            linewidth: 2
          }
        ]
      },
      ...this.resetArgs
    );
  }
}
export {
  PitchforkTool
};
