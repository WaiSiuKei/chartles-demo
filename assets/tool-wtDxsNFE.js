var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { aO as MeasureToolType } from "./index-DSkroicZ.js";
import { D as DateAndPriceRangePrimitive, a as DateAndPriceRangeTool } from "./tool-DECOSdUl.js";
import "./toolPaneView-BAEHHn7m.js";
import "./baseTool-BVX9dcKc.js";
import "./index-DNbtFiKr.js";
import "./priceLabelPriceAxisView-d9Maj5lR.js";
import "./timeLabelTimeAxisView-BvW_UnA0.js";
import "./axisPaneView-Pbgdotf1.js";
import "./text-DNYLW3w-.js";
import "./text-FiPV6-V4.js";
import "./ctx-DYUP60aL.js";
import "./composite-BOGQNAfc.js";
import "./line-CuaAD_DW.js";
import "./rectangle-DSOKVUU-.js";
class MeasurePrimitive extends DateAndPriceRangePrimitive {
  constructor() {
    super(...arguments);
    __publicField(this, "disableUserSelection", true);
  }
  properties() {
    const originProps = super.properties();
    if (this.controlPoints.length < 2) return originProps;
    const [p0, p1] = this.controlPoints;
    const price0 = p0.price;
    const price1 = p1.price;
    if (price1 > price0) {
      return Object.assign({}, originProps, {
        background: originProps.upBackground,
        labelBackground: originProps.upColor,
        lineColor: originProps.upColor
      });
    } else {
      return Object.assign({}, originProps, {
        background: originProps.downBackground,
        labelBackground: originProps.downColor,
        lineColor: originProps.downColor
      });
    }
  }
}
class MeasureTool extends DateAndPriceRangeTool {
  constructor() {
    super(...arguments);
    __publicField(this, "type", MeasureToolType);
  }
  getProps(drawingSession) {
    return {
      ...super.getProps(drawingSession),
      textColor: "#fff",
      lineWidth: 1,
      upColor: "#2A62FF",
      upBackground: "#2A62FF26",
      downColor: "#F7525F",
      downBackground: "#F7525F26",
      drawBorder: false,
      boxShadow: "",
      showAnchors: false
    };
  }
  createPrimitive(drawingSession) {
    return new MeasurePrimitive(this.getProps(drawingSession), ...this.resetArgs);
  }
}
export {
  MeasureTool
};
