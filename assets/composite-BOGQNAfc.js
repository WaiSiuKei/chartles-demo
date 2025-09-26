var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { b0 as CallbackHitTestObject } from "./index-DSkroicZ.js";
class CompositeRenderer {
  constructor(_hitTestCollector) {
    __publicField(this, "_renderers", []);
    __publicField(this, "_globalAlpha", 1);
    this._hitTestCollector = _hitTestCollector;
  }
  insert(r, index) {
    this._renderers.splice(index, 0, r);
  }
  append(...e) {
    this._renderers.push(...e);
  }
  clear() {
    this._renderers.length = 0;
  }
  setGlobalAlpha(e) {
    this._globalAlpha = e;
  }
  hitTest(point, scope) {
    var _a;
    for (const r of this._renderers) {
      const resp = (_a = r.hitTest) == null ? void 0 : _a.call(r, point, scope);
      if (resp) {
        return resp;
      }
    }
    return null;
  }
  draw(target) {
    target.useBitmapCoordinateSpace((scope) => {
      const ctx = scope.context;
      ctx.save();
      ctx.globalAlpha = this._globalAlpha;
      this._renderers.map((r) => {
        var _a;
        r.draw(target);
        if (r.hitTest) {
          (_a = this._hitTestCollector) == null ? void 0 : _a.call(
            this,
            new CallbackHitTestObject((point, scope2) => {
              var _a2;
              return ((_a2 = r.hitTest) == null ? void 0 : _a2.call(r, point, scope2)) ?? null;
            })
          );
        }
      });
      ctx.restore();
    });
  }
}
export {
  CompositeRenderer as C
};
