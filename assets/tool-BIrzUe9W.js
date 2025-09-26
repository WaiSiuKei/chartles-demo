var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { aM as EmojiToolType, e as ensure } from "./index-DSkroicZ.js";
import { S as SvgIconPaneView, a as SvgIconPrimitive, b as SvgIconTool } from "./paneView-Dr9ckv3U.js";
import "./toolPaneView-BAEHHn7m.js";
import "./baseTool-BVX9dcKc.js";
import "./transform-BQU5urRN.js";
import "./priceLabelPriceAxisView-d9Maj5lR.js";
import "./timeLabelTimeAxisView-BvW_UnA0.js";
import "./handle-CjXYvPYx.js";
import "./composite-BOGQNAfc.js";
import "./svg-qPFV6R3m.js";
class EmojiPaneView extends SvgIconPaneView {
  _iconColor() {
    return null;
  }
}
class EmojiPrimitive extends SvgIconPrimitive {
  constructor() {
    super(...arguments);
    __publicField(this, "_lines", new EmojiPaneView(this, this.model));
    __publicField(this, "_paneView", [this._lines]);
  }
  pointsCount() {
    return 1;
  }
}
class EmojiTool extends SvgIconTool {
  constructor() {
    super(...arguments);
    __publicField(this, "type", EmojiToolType);
  }
  createPrimitive() {
    var _a;
    return new EmojiPrimitive(
      {
        id: this.id,
        points: [],
        size: 40,
        icon: ensure((_a = this.presetProps) == null ? void 0 : _a.icon),
        angle: 0.5 * Math.PI
      },
      ...this.resetArgs
    );
  }
}
export {
  EmojiTool
};
