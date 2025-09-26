var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { y as HitTestResult, z as HitTarget, u as Point, A as AnchorPoint, cs as AnchorResizeHorz, aS as VerticalLineToolType, e as ensure } from "./index-NZHt9VGv.js";
import { V as VerticalAlign, H as HorizontalAlign } from "./text-CtvZov1L.js";
import { g as getI18nService } from "./toolPaneView-3wj_on-u.js";
import { b as BaseTextPaneView, B as BaseTextPrimitive, a as BaseTextTool } from "./textPaneView-DMnMnXxK.js";
import { T as TimeLabelTimeAxisView } from "./timeLabelTimeAxisView-BvW_UnA0.js";
import "./PlusTextRendererDecorator-D4ze-RfF.js";
import { C as CompositeRenderer } from "./composite-tvPrNHN0.js";
import { V as VerticalLineRenderer } from "./verticalLine-Bizl3Oqm.js";
import { T as TextRenderer } from "./renderer-CPHquQ6g.js";
import "./text-8RrTwjoh.js";
import "./ctx-Bv0u81rl.js";
import "./baseTool-CHlzZht2.js";
class VerticalLinePaneView extends BaseTextPaneView {
  constructor() {
    super(...arguments);
    __publicField(this, "_lineRenderer", new VerticalLineRenderer());
    __publicField(this, "_renderer", new CompositeRenderer(this._hitTestCollector));
    __publicField(this, "_labelRenderer", new TextRenderer(new HitTestResult(HitTarget.MovePoint)));
  }
  renderer() {
    return this._renderer;
  }
  _updateImpl() {
    this._renderer.clear();
    const points = this.points();
    if ((points == null ? void 0 : points.length) === 0) return;
    const {
      mediaSize: { width: canvasWidth, height: canvasHeight }
    } = this._source.getScope();
    const properties = this._source.properties();
    this._placeHolderMode();
    let textBoundaries = void 0;
    let outOfScreen = true;
    const lineData = {
      x: points[0].x,
      lineColor: properties.linecolor,
      lineWidth: properties.linewidth,
      lineStyle: properties.linestyle,
      excludeBoundaries: textBoundaries
    };
    const buffer = lineData.lineWidth / 2 + 1;
    outOfScreen = outOfScreen && (lineData.x < -buffer || lineData.x > canvasWidth + buffer);
    this._lineRenderer.setData(lineData);
    this._lineRenderer.setHitTest(
      new HitTestResult(HitTarget.MovePoint, {
        // snappingIndex: this._source.controlPoints[0].time,
      })
    );
    this._renderer.insert(this._lineRenderer, 0);
    if (!outOfScreen) {
      if (points.length === 1 && !this._isTextEditMode()) {
        const anchorPoint = new Point(points[0].x, 0.9 * canvasHeight);
        const anchor = new AnchorPoint(anchorPoint, {
          pointIndex: 0,
          resizeDirections: AnchorResizeHorz
        });
        this._renderer.append(this.createLineAnchor({ points: [anchor] }, 0));
      }
    }
  }
  _needLabelExclusionPath(renderer) {
    const props = this._source.properties();
    const isHorizontal = props.textOrientation === "horizontal";
    const text = props.text;
    if (isHorizontal) {
      return text.trim() !== "";
    }
    if (props.horzLabelsAlign !== "center") {
      return false;
    }
    const lines = renderer.getLinesInfo().lines;
    if (lines.length % 2 === 0) {
      return false;
    }
    const centerLine = lines[Math.floor(lines.length / 2)];
    return centerLine.text.trim() !== "";
  }
}
class VerticalLinePrimitive extends BaseTextPrimitive {
  constructor() {
    super(...arguments);
    __publicField(this, "_line", new VerticalLinePaneView(
      this,
      this.model,
      this.editingHelper
    ));
    __publicField(this, "_paneView", [this._line]);
    __publicField(this, "_timeAxisViews", [new TimeLabelTimeAxisView(/* @__PURE__ */ Object.create(null))]);
  }
  pointsCount() {
    return 1;
  }
  updateAllViews() {
    if (!this.controlPoints.length) return;
    const points = [];
    for (let i = 0; i < this.controlPoints.length; i++) {
      const p = this.controlPoints[i];
      const drawPoint = this.pointToScreenPoint(p);
      if (!drawPoint) return;
      points.push(new AnchorPoint(drawPoint, { pointIndex: i }));
    }
    this.controlPoints.forEach((p, i) => {
      this._timeAxisViews[i].update(this._calculateTimeAxisViewData(p.time, points[i].x));
    });
    this._paneView[0].update({ points });
  }
  isCreationFinished() {
    return this._line.isCreationFinished();
  }
  startTextEditing() {
    return this._line.startTextEditing();
  }
}
class VerticalLineTool extends BaseTextTool {
  constructor() {
    super(...arguments);
    __publicField(this, "type", VerticalLineToolType);
  }
  createPrimitive(drawingSession) {
    const i18nService = getI18nService(drawingSession);
    return new VerticalLinePrimitive(
      {
        id: this.id,
        points: [],
        linecolor: "#2962FF",
        linewidth: 2,
        linestyle: 0,
        extendLine: true,
        showTime: true,
        showLabel: false,
        horzLabelsAlign: HorizontalAlign.Center,
        vertLabelsAlign: VerticalAlign.Middle,
        textColor: "#2962FF",
        textOrientation: "vertical",
        fontSize: 14,
        bold: false,
        italic: false,
        text: "",
        wordWrap: true,
        placeholder: i18nService.t("tool.text.common.addText")
      },
      ...this.getTextResetArgs(drawingSession)
    );
  }
  finishDrawing() {
    ensure(this._drawingSession).finishDrawing();
  }
}
export {
  VerticalLineTool
};
