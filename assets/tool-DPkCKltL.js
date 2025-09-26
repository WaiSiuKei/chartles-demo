var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { aN as IconToolType, e as ensure } from "./index-DSkroicZ.js";
import { S as SvgIconPaneView, a as SvgIconPrimitive, b as SvgIconTool } from "./paneView-Dr9ckv3U.js";
import "./toolPaneView-BAEHHn7m.js";
import "./baseTool-BVX9dcKc.js";
import "./transform-BQU5urRN.js";
import "./priceLabelPriceAxisView-d9Maj5lR.js";
import "./timeLabelTimeAxisView-BvW_UnA0.js";
import "./handle-CjXYvPYx.js";
import "./composite-BOGQNAfc.js";
import "./svg-qPFV6R3m.js";
class IconPaneView extends SvgIconPaneView {
  _iconColor() {
    return this._source.properties().color;
  }
}
class IconPrimitive extends SvgIconPrimitive {
  constructor() {
    super(...arguments);
    __publicField(this, "_lines", new IconPaneView(this, this.model));
    __publicField(this, "_paneView", [this._lines]);
  }
  pointsCount() {
    return 1;
  }
}
class IconTool extends SvgIconTool {
  constructor() {
    super(...arguments);
    __publicField(this, "type", IconToolType);
  }
  createPrimitive() {
    var _a;
    return new IconPrimitive(
      {
        id: this.id,
        points: [],
        color: "#2962FFFF",
        size: 40,
        icon: ensure((_a = this.presetProps) == null ? void 0 : _a.icon),
        angle: 0.5 * Math.PI
      },
      ...this.resetArgs
    );
  }
}
export {
  IconTool
};
