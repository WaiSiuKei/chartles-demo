var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { a_ as generateUuid } from "./index-NZHt9VGv.js";
import { B as BrushTool, a as BrushPrimitive } from "./tool-BlMjgsPR.js";
import { H as HighlighterToolType } from "./index-TSHQCVD9.js";
import "./toolPaneView-3wj_on-u.js";
import "./baseTool-CHlzZht2.js";
import "./axisPaneView-Pbgdotf1.js";
import "./composite-tvPrNHN0.js";
import "./polygon-CB5TCmTw.js";
import "./line-DFhYRKvt.js";
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
