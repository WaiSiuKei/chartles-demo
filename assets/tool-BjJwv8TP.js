var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { a_ as generateUuid } from "./index-DSkroicZ.js";
import { B as BrushTool, a as BrushPrimitive } from "./tool-PmoMkJYS.js";
import { H as HighlighterToolType } from "./index-DNbtFiKr.js";
import "./toolPaneView-BAEHHn7m.js";
import "./baseTool-BVX9dcKc.js";
import "./axisPaneView-Pbgdotf1.js";
import "./composite-BOGQNAfc.js";
import "./polygon-C6s4PX2h.js";
import "./line-CuaAD_DW.js";
class HighlighterTool extends BrushTool {
  constructor() {
    super(...arguments);
    __publicField(this, "type", HighlighterToolType);
  }
  createPrimitive() {
    return new BrushPrimitive(
      {
        id: generateUuid(),
        points: [],
        smooth: 5,
        lineColor: "#F2364533",
        lineWidth: 20
      },
      ...this.resetArgs
    );
  }
}
export {
  HighlighterTool
};
