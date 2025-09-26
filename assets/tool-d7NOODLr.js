var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { L as LineStyleType } from "./index-DSkroicZ.js";
import { D as DrawingTool } from "./toolPaneView-BAEHHn7m.js";
import { y as FibWedgeToolType } from "./index-DNbtFiKr.js";
import { F as FibWedgePrimitive } from "./primitive-oe8FNeQO.js";
import "./baseTool-BVX9dcKc.js";
import "./priceLabelPriceAxisView-d9Maj5lR.js";
import "./timeLabelTimeAxisView-BvW_UnA0.js";
import "./axisPaneView-Pbgdotf1.js";
import "./text-DNYLW3w-.js";
import "./text-FiPV6-V4.js";
import "./ctx-DYUP60aL.js";
import "./composite-BOGQNAfc.js";
import "./line-CuaAD_DW.js";
import "./paneView-C9pa4pz3.js";
import "./formatter-Drv30PyG.js";
import "./numericFormatter-6U8WkLAS.js";
class FibWedgeTool extends DrawingTool {
  constructor() {
    super(...arguments);
    __publicField(this, "type", FibWedgeToolType);
  }
  createPrimitive() {
    return new FibWedgePrimitive(
      {
        id: this.id,
        points: [],
        levels: [
          {
            coeff: 0.236,
            color: "#F23645"
          },
          {
            coeff: 0.382,
            color: "#FF9800"
          },
          {
            coeff: 0.5,
            color: "#4CAF50"
          },
          {
            coeff: 0.618,
            color: "#089981"
          },
          {
            coeff: 0.786,
            color: "#00BCD4"
          },
          {
            coeff: 1,
            color: "#808080"
          }
        ],
        levelsStyle: { linewidth: 2, linestyle: LineStyleType.solid },
        showCoeffs: true,
        fillBackground: true,
        transparency: 80,
        trendline: {
          visible: true,
          color: "#808080",
          linewidth: 2,
          linestyle: LineStyleType.solid
        }
      },
      ...this.resetArgs
    );
  }
}
export {
  FibWedgeTool
};
