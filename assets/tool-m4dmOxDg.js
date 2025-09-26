var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { y as HitTestResult, z as HitTarget, e as ensure, u as Point, b_ as midPoint, r as ChartFontFamily, w as box, bS as arePointsEqual, v as pointInBox, bX as intersectLineSegmentAndBox, bW as lineSegment, b$ as SelectionRenderer, A as AnchorPoint, bN as LineEnd } from "./index-DSkroicZ.js";
import { g as getTextBoundaries, n as needTextExclusionPath, V as VerticalAlign, H as HorizontalAlign } from "./text-DNYLW3w-.js";
import { g as getI18nService } from "./toolPaneView-BAEHHn7m.js";
import { T as TrendToolWithStatsPaneView, S as StatsPosition } from "./TrendToolWithStatsPaneView-B0NglOSE.js";
import { B as BaseTextPrimitive, a as BaseTextTool } from "./textPaneView-DmGg5Esj.js";
import { T as TrendLineToolType } from "./index-DNbtFiKr.js";
import { P as PriceLabelPriceAxisView } from "./priceLabelPriceAxisView-d9Maj5lR.js";
import { T as TimeLabelTimeAxisView } from "./timeLabelTimeAxisView-BvW_UnA0.js";
import { P as PriceRangeAxisPaneView, T as TimeRangeAxisPaneView } from "./axisPaneView-Pbgdotf1.js";
import { P as PlusTextRendererDecorator } from "./PlusTextRendererDecorator-C8ewAP0n.js";
import { L as LineRenderer } from "./line-CuaAD_DW.js";
import { T as TextRenderer } from "./renderer-Bgvp02WJ.js";
import "./text-FiPV6-V4.js";
import "./ctx-DYUP60aL.js";
import "./baseTool-BVX9dcKc.js";
import "./font-0BY7UpRj.js";
import "./formatter-Drv30PyG.js";
import "./numericFormatter-6U8WkLAS.js";
import "./composite-BOGQNAfc.js";
import "./svg-qPFV6R3m.js";
class TrendLinePaneView extends TrendToolWithStatsPaneView {
  constructor() {
    super(...arguments);
    __publicField(this, "_trendRenderer", new LineRenderer(void 0, void 0, new HitTestResult(HitTarget.MovePoint)));
    __publicField(this, "_labelRenderer", new TextRenderer(new HitTestResult(HitTarget.MovePoint)));
  }
  _getPointsForStats() {
    return [this.points()[0], ensure(this._middlePoint), this.points()[1]];
  }
  _updateImpl() {
    this._renderer.clear();
    const points = this.points();
    if ((points == null ? void 0 : points.length) < 2) return;
    const props = this._source.properties();
    if (!props.showPriceRange && !props.showPercentPriceRange && !props.showPipsPriceRange && !props.showBarsRange && !props.showDateTimeRange && !props.showDistance && !props.showAngle) {
      this._label = null;
      if (this._labelData) this._labelData.text = "";
    }
    const x = points[0];
    const y = points[1];
    this._middlePoint = new Point(midPoint(x, y));
    const scope = this._source.getScope();
    const {
      mediaSize: { width, height }
    } = scope;
    let textBounds = void 0;
    const text = props.text;
    const isEditing = this._isTextEditMode();
    const isPlaceholder = this._placeHolderMode(true);
    if (props.showLabel && (text || isPlaceholder || isEditing)) {
      const left = x.x < y.x ? x : y;
      const right = left === x ? y : x;
      const vertAlign = props.vertLabelsAlign;
      const horzAlign = props.horzLabelsAlign;
      let labelPoint;
      if (horzAlign === "left") {
        labelPoint = left.clone();
      } else if (horzAlign === "right") {
        labelPoint = right.clone();
      } else {
        labelPoint = new Point((x.x + y.x) / 2, (x.y + y.y) / 2);
      }
      const angle = Math.atan((right.y - left.y) / (right.x - left.x));
      this._labelRenderer.setData({
        points: [labelPoint],
        text: this._textDisplay(),
        color: this._textDisplayColor(),
        vertAlign,
        horzAlign,
        fontFamily: ChartFontFamily,
        offsetX: 0,
        offsetY: 0,
        bold: props.bold,
        italic: props.italic,
        fontSize: props.fontSize,
        forceTextAlign: true,
        angle,
        decorator: isPlaceholder ? PlusTextRendererDecorator.instance() : void 0
        // ...this._inplaceTextHighlight(),
      });
      this._labelRenderer.setCursorType(this._textCursorType());
      this._renderer.append(this._labelRenderer);
      if (this._needLabelExclusionPath(this._labelRenderer)) {
        textBounds = getTextBoundaries(this._labelRenderer, width, height) ?? void 0;
      }
      if (this._labelRenderer.isOutOfScreen(width, height)) {
        this.closeTextEditor();
      } else {
        this._updateEditor(this._labelRenderer.getTextInfo());
      }
    }
    const lineColor = props.linecolor;
    const trendLineData = {
      points,
      lineColor,
      lineWidth: props.linewidth,
      lineStyle: props.linestyle,
      extendLeft: props.extendLeft,
      extendRight: props.extendRight,
      leftEnd: props.leftEnd,
      rightEnd: props.rightEnd,
      excludeBoundaries: textBounds ? [textBounds] : void 0
    };
    this._trendRenderer.setData(trendLineData);
    this._renderer.insert(this._trendRenderer, 0);
    const chartBox = box(new Point(0, 0), new Point(width, height));
    let statsOutOfBounds = false;
    if (props.statsPosition === StatsPosition.Auto) {
      if (arePointsEqual(x, y)) {
        statsOutOfBounds = !pointInBox(x, chartBox);
      } else {
        const intersection = intersectLineSegmentAndBox(lineSegment(x, y), chartBox);
        statsOutOfBounds = intersection === null;
      }
    }
    if ((this.isHoveredSource() || this.isSelectedSource()) && this._isTextEditMode() || props.alwaysShowStats) {
      if (!statsOutOfBounds && points.length === 2) {
        this._renderer.append(this._updateAndReturnStatsRenderer(scope));
      }
    }
    if (this._middlePoint && !isEditing) {
      const showMiddle = (this.isHoveredSource() || this.isSelectedSource()) && props.showMiddlePoint;
      this._renderer.append(
        new SelectionRenderer({
          points: [new AnchorPoint(this._middlePoint)],
          bgColors: this._lineAnchorColors([this._middlePoint]),
          color: lineColor,
          visible: showMiddle && this.areAnchorsVisible(),
          hitTarget: HitTarget.Regular
          // barSpacing: 0,
        })
      );
    }
    this.addAnchors(this._renderer);
  }
  _needLabelExclusionPath(e, t) {
    const i = this._source.properties();
    return "middle" === (t ?? i.vertLabelsAlign) && needTextExclusionPath(e);
  }
}
class TrendLinePrimitive extends BaseTextPrimitive {
  constructor() {
    super(...arguments);
    __publicField(this, "_line", new TrendLinePaneView(this, this.model, this.editingHelper));
    __publicField(this, "_priceAxisPaneViews", [new PriceRangeAxisPaneView(/* @__PURE__ */ Object.create(null))]);
    __publicField(this, "_timeAxisPaneViews", [new TimeRangeAxisPaneView(/* @__PURE__ */ Object.create(null))]);
    __publicField(this, "_timeAxisViews", [
      new TimeLabelTimeAxisView(/* @__PURE__ */ Object.create(null)),
      new TimeLabelTimeAxisView(/* @__PURE__ */ Object.create(null))
    ]);
    __publicField(this, "_priceAxisViews", [
      new PriceLabelPriceAxisView(/* @__PURE__ */ Object.create(null)),
      new PriceLabelPriceAxisView(/* @__PURE__ */ Object.create(null))
    ]);
    __publicField(this, "_paneView", [this._line]);
  }
  pointsCount() {
    return 2;
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
    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);
    this.controlPoints.forEach((p, i) => {
      this._timeAxisViews[i].update(this._calculateTimeAxisViewData(p.time, points[i].x));
      this._priceAxisViews[i].update(this._calculatePriceAxisViewData(p.price, points[i].y));
    });
    if (xs.length > 1) {
      this._timeAxisPaneViews[0].update(
        this._calculateTimeAxisPaneViewsData(Math.min.apply(null, xs), Math.max.apply(null, xs))
      );
    }
    if (ys.length > 1) {
      this._priceAxisPaneViews[0].update(
        this._calculatePriceAxisPaneViewData(Math.min.apply(null, ys), Math.max.apply(null, ys))
      );
    }
    this._paneView[0].update({ points });
  }
  isCreationFinished() {
    return this._line.isCreationFinished();
  }
  startTextEditing() {
    return this._line.startTextEditing();
  }
}
class TrendLineTool extends BaseTextTool {
  constructor() {
    super(...arguments);
    __publicField(this, "type", TrendLineToolType);
    __publicField(this, "extendLeft", false);
    __publicField(this, "extendRight", false);
    __publicField(this, "showPriceLabels", false);
    __publicField(this, "showPriceRange", false);
    __publicField(this, "showPercentPriceRange", false);
    __publicField(this, "showPipsPriceRange", false);
    __publicField(this, "showDateTimeRange", false);
    __publicField(this, "showBarsRange", false);
    __publicField(this, "showDistance", false);
    __publicField(this, "showAngle", false);
    __publicField(this, "alwaysShowStats", false);
    __publicField(this, "rightEnd", LineEnd.Normal);
  }
  createPrimitive(drawingSession) {
    const i18nService = getI18nService(drawingSession);
    return new TrendLinePrimitive(
      {
        id: this.id,
        points: [],
        linecolor: "#2962FF",
        linewidth: 2,
        linestyle: 0,
        extendLeft: this.extendLeft,
        extendRight: this.extendRight,
        leftEnd: 0,
        rightEnd: this.rightEnd,
        showLabel: false,
        horzLabelsAlign: HorizontalAlign.Center,
        vertLabelsAlign: VerticalAlign.Bottom,
        textColor: "#2962FF",
        fontSize: 14,
        text: "",
        placeholder: "",
        wordWrap: true,
        bold: false,
        italic: false,
        alwaysShowStats: this.alwaysShowStats,
        showMiddlePoint: false,
        showPriceLabels: this.showPriceLabels,
        showPriceRange: this.showPriceRange,
        showPercentPriceRange: this.showPercentPriceRange,
        showPipsPriceRange: this.showPipsPriceRange,
        showBarsRange: this.showBarsRange,
        showDateTimeRange: this.showDateTimeRange,
        showDistance: this.showDistance,
        showAngle: this.showAngle,
        statsPosition: StatsPosition.Right,
        formatBarCount: (args) => {
          return i18nService.t("tool.line.common.bars", args);
        },
        formatDistance: (args) => {
          return i18nService.t("tool.line.common.distance", args);
        }
      },
      ...this.getTextResetArgs(drawingSession)
    );
  }
  finishDrawing() {
    ensure(this._drawingSession).finishDrawing();
  }
}
export {
  TrendLineTool
};
