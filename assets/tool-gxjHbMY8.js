var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { L as LineStyleType, A as AnchorPoint, e as ensure, G as PaneCursor, b as IChartManagementService } from "./index-DSkroicZ.js";
import { T as ToolPaneView, a as ToolPrimitive, D as DrawingTool } from "./toolPaneView-BAEHHn7m.js";
import { Z as ZoomInToolType } from "./index-DNbtFiKr.js";
import { C as CompositeRenderer } from "./composite-BOGQNAfc.js";
import { R as RectangleRenderer } from "./rectangle-DSOKVUU-.js";
import "./baseTool-BVX9dcKc.js";
class ZoomInPaneView extends ToolPaneView {
  constructor() {
    super(...arguments);
    __publicField(this, "_backgroundRenderer", new RectangleRenderer());
    __publicField(this, "_renderer", new CompositeRenderer(this._hitTestCollector));
  }
  renderer() {
    return this._renderer;
  }
  _updateImpl() {
    this._renderer.clear();
    if (this.points().length < 2) return;
    this._backgroundRenderer.setData({
      points: this.points(),
      color: "#2962FFFF",
      lineWidth: 1,
      lineStyle: LineStyleType.solid,
      backColor: "#2962FF26"
    });
    this._renderer.append(this._backgroundRenderer);
  }
}
class ZoomInPrimitive extends ToolPrimitive {
  constructor() {
    super(...arguments);
    __publicField(this, "_lines", new ZoomInPaneView(this, this.model));
    __publicField(this, "_paneView", [this._lines]);
    __publicField(this, "disableUserSelection", true);
  }
  pointsCount() {
    return 2;
  }
  updateAllViews() {
    if (!this.controlPoints.length) return;
    const [p0, p1] = this.controlPoints;
    if (!p1) return;
    const drawPoint0 = this.pointToScreenPoint(p0);
    if (!drawPoint0) return;
    const drawPoint1 = this.pointToScreenPoint(p1);
    if (!drawPoint1) return;
    const anchorPoints = [
      new AnchorPoint(drawPoint0, { pointIndex: 0 }),
      new AnchorPoint(drawPoint1, { pointIndex: 1 })
    ];
    this._lines.update({
      points: anchorPoints
    });
  }
}
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = decorator(result) || result;
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
let ZoomInTool = class extends DrawingTool {
  constructor(chartManagementService) {
    super();
    __publicField(this, "type", ZoomInToolType);
    this.chartManagementService = chartManagementService;
  }
  createPrimitive() {
    return new ZoomInPrimitive(
      {
        id: this.id,
        points: []
      },
      ...this.resetArgs
    );
  }
  finishDrawing() {
    var _a;
    super.finishDrawing();
    const [p0, p1] = ensure(this._drawingSession).primitive.controlPoints;
    (_a = this._drawingSession) == null ? void 0 : _a.detach();
    this.chartService.zoomToViewport(p0.time, p1.time, p0.price, p1.price);
  }
  activated() {
    super.activated();
    this.chartManagementService.setPaneCursor(PaneCursor.zoomIn, true);
  }
  deactivated() {
    var _a;
    (_a = this._drawingSession) == null ? void 0 : _a.detach();
    super.deactivated();
    this.chartManagementService.setPaneCursor(PaneCursor.unset);
  }
  useMagnetedPosition() {
    return false;
  }
  isDrawingTool() {
    return false;
  }
};
ZoomInTool = __decorateClass([
  __decorateParam(0, IChartManagementService)
], ZoomInTool);
export {
  ZoomInTool
};
