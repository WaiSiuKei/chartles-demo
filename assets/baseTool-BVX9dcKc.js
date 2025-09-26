var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { a_ as generateUuid, a$ as ToolInvocationPhase, s as should } from "./index-DSkroicZ.js";
class BaseTool {
  constructor() {
    __publicField(this, "isActivated", false);
    __publicField(this, "fallbackable", false);
    __publicField(this, "id", generateUuid());
    __publicField(this, "_phase", ToolInvocationPhase.idle);
  }
  get phase() {
    return this._phase;
  }
  activate() {
    should(this.phase === ToolInvocationPhase.idle);
    this.isActivated = true;
    this._phase = ToolInvocationPhase.activated;
    this.activated();
  }
  deactivate() {
    this.isActivated = false;
    this._phase = ToolInvocationPhase.idle;
    this.deactivated();
  }
  activated() {
  }
  deactivated() {
  }
}
export {
  BaseTool as B
};
