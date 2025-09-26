var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { aO as MeasureToolType } from "./index-NZHt9VGv.js";
import { D as DateAndPriceRangePrimitive, a as DateAndPriceRangeTool } from "./tool-COX2W_FA.js";
import "./toolPaneView-3wj_on-u.js";
import "./baseTool-CHlzZht2.js";
import "./index-TSHQCVD9.js";
import "./priceLabelPriceAxisView-d9Maj5lR.js";
import "./timeLabelTimeAxisView-BvW_UnA0.js";
import "./axisPaneView-Pbgdotf1.js";
import "./text-CtvZov1L.js";
import "./text-8RrTwjoh.js";
import "./ctx-Bv0u81rl.js";
import "./composite-tvPrNHN0.js";
import "./line-DFhYRKvt.js";
import "./rectangle-CfXWJsDB.js";
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
