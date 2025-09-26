var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { c5 as getLightenRGBA } from "./index-DSkroicZ.js";
import { D as DrawingTool } from "./toolPaneView-BAEHHn7m.js";
import { a1 as PatternCypherToolType } from "./index-DNbtFiKr.js";
import { P as PatternXABCDPrimitive } from "./primitive-D2StyMme.js";
import "./baseTool-BVX9dcKc.js";
import "./priceLabelPriceAxisView-d9Maj5lR.js";
import "./timeLabelTimeAxisView-BvW_UnA0.js";
import "./axisPaneView-Pbgdotf1.js";
import "./text-DNYLW3w-.js";
import "./text-FiPV6-V4.js";
import "./ctx-DYUP60aL.js";
import "./formatter-Drv30PyG.js";
import "./numericFormatter-6U8WkLAS.js";
import "./composite-BOGQNAfc.js";
import "./line-CuaAD_DW.js";
import "./polygon-C6s4PX2h.js";
import "./triangle-CGp_dGCX.js";
import "./line-tUhOmrMF.js";
class PatternCypherPrimitive extends PatternXABCDPrimitive {
  _updateBaseData(data) {
    const { points } = data;
    if (points.length >= 3) {
      const [pointA, pointB, pointC] = this.controlPoints;
      data.abRetracement = Math.abs((pointC.price - pointB.price) / (pointB.price - pointA.price));
      if (points.length >= 4) {
        const [pointA2, pointB2, , pointD] = this.controlPoints;
        data.bcRetracement = Math.abs(
          (pointD.price - pointA2.price) / (pointB2.price - pointA2.price)
        );
      }
      if (points.length >= 5) {
        const [pointA2, , pointC2, pointD, pointE] = this.controlPoints;
        data.cdRetracement = Math.abs(
          (pointE.price - pointD.price) / (pointD.price - pointC2.price)
        );
        data.xdRetracement = Math.abs(
          (pointE.price - pointD.price) / (pointA2.price - pointD.price)
        );
      }
    }
  }
}
class PatternCypherTool extends DrawingTool {
  constructor() {
    super(...arguments);
    __publicField(this, "type", PatternCypherToolType);
  }
  createPrimitive() {
    return new PatternCypherPrimitive(
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
  PatternCypherTool
};
