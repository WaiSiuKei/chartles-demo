import { B as BaseTextRenderer } from "./text-CtvZov1L.js";
class TextRenderer extends BaseTextRenderer {
  getTextInfo() {
    const t = this._getInternalData();
    const i = this.fontStyle();
    const n = this._getFontInfo();
    return {
      ...t,
      textTop: t.textTop - 0.5,
      lineSpacing: this.lineSpacing(),
      font: i,
      fontSize: n.fontSize,
      centerRotation: this.centerTextRotation()
    };
  }
  setCursorType(e) {
    var _a, _b, _c;
    if (((_b = (_a = this._hitTest) == null ? void 0 : _a.details) == null ? void 0 : _b.cursorType) !== e) {
      (_c = this._hitTest) == null ? void 0 : _c.mergeData({ cursorType: e });
    }
  }
}
export {
  TextRenderer as T
};
