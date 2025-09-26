var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { y as HitTestResult, z as HitTarget, e as ensure, u as Point, b_ as midPoint, bN as LineEnd, w as box, bS as arePointsEqual, v as pointInBox, bX as intersectLineSegmentAndBox, bW as lineSegment, b$ as SelectionRenderer, A as AnchorPoint, r as ChartFontFamily, bJ as MediaCoordinatesPaneRenderer } from "./index-NZHt9VGv.js";
import { g as getI18nService } from "./toolPaneView-3wj_on-u.js";
import { T as TrendToolWithStatsPaneView, S as StatsPosition } from "./TrendToolWithStatsPaneView-2bdv8Mcb.js";
import { B as BaseTextPrimitive, a as BaseTextTool } from "./textPaneView-DMnMnXxK.js";
import { Y as TrendAngleToolType } from "./index-TSHQCVD9.js";
import { P as PriceLabelPriceAxisView } from "./priceLabelPriceAxisView-d9Maj5lR.js";
import { T as TimeLabelTimeAxisView } from "./timeLabelTimeAxisView-BvW_UnA0.js";
import { P as PriceRangeAxisPaneView, T as TimeRangeAxisPaneView } from "./axisPaneView-Pbgdotf1.js";
import { V as VerticalAlign, H as HorizontalAlign } from "./text-CtvZov1L.js";
import { f as forceLTRStr } from "./text-8RrTwjoh.js";
import { L as LineRenderer } from "./line-DFhYRKvt.js";
import { T as TextRenderer } from "./renderer-CPHquQ6g.js";
import "./baseTool-CHlzZht2.js";
import "./ctx-Bv0u81rl.js";
import "./font-0BY7UpRj.js";
import "./formatter-_n1ErJyi.js";
import "./numericFormatter-Dh0kn-kp.js";
import "./composite-tvPrNHN0.js";
import "./svg-C4bIXpLS.js";
class AngleRenderer extends MediaCoordinatesPaneRenderer {
  drawImpl(scope) {
    if (!this._data) return;
    const ctx = scope.context;
    ctx.translate(this._data.point.x, this._data.point.y);
    ctx.strokeStyle = this._data.color;
    ctx.setLineDash([1, 2]);
    const radius = this._data.size;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(radius, 0);
    ctx.arc(0, 0, radius, 0, -this._data.angle, this._data.angle > 0);
    ctx.stroke();
  }
}
class TrendAnglePaneView extends TrendToolWithStatsPaneView {
  constructor() {
    super(...arguments);
    __publicField(this, "_trendRenderer", new LineRenderer(void 0, void 0, new HitTestResult(HitTarget.MovePoint)));
    __publicField(this, "_angleLabelRenderer", new TextRenderer(new HitTestResult(HitTarget.MovePoint)));
    __publicField(this, "_angleRenderer", new AngleRenderer());
    __publicField(this, "_secondPoint", null);
  }
  _getPointsForStats() {
    return [this.points()[0], ensure(this._middlePoint), this.points()[1]];
  }
  _updateImpl() {
    this._renderer.clear();
    const source = this._source;
    const angle = source.angle();
    const points = this.points();
    if (points.length > 0 && angle !== null) {
      const dx = Math.cos(angle);
      const dy = -Math.sin(angle);
      const direction = new Point(dx, dy);
      this._secondPoint = points[0].addScaled(direction, ensure(source.distance()));
      this._middlePoint = midPoint(points[0], this._secondPoint);
    }
    if (points.length < 2 || this._secondPoint === null) return;
    const p1 = points[0];
    const p2 = points[1];
    const props = this._source.properties();
    if (!props.showBarsRange && !props.showPriceRange && !props.showPercentPriceRange && !props.showPipsPriceRange) {
      this._label = null;
      if (this._labelData) this._labelData.text = "";
    }
    const color = props.linecolor;
    const trendData = {
      points: [p1, this._secondPoint],
      lineColor: color,
      lineWidth: props.linewidth,
      lineStyle: props.linestyle,
      extendLeft: props.extendLeft,
      extendRight: props.extendRight,
      leftEnd: LineEnd.Normal,
      rightEnd: LineEnd.Normal
    };
    this._trendRenderer.setData(trendData);
    this._renderer.append(this._trendRenderer);
    const scope = this._source.getScope();
    const viewportBox = box(
      new Point(0, 0),
      new Point(scope.mediaSize.width, scope.mediaSize.height)
    );
    let hideStats = false;
    if (props.statsPosition === StatsPosition.Auto) {
      hideStats = arePointsEqual(p1, p2) ? !pointInBox(p1, viewportBox) : intersectLineSegmentAndBox(lineSegment(p1, p2), viewportBox) === null;
    }
    if ((this.isHoveredSource() || this.isSelectedSource() || props.alwaysShowStats) && !hideStats && points.length === 2) {
      this._renderer.append(this._updateAndReturnStatsRenderer(scope));
    }
    const showMiddle = (this.isHoveredSource() || this.isSelectedSource()) && props.showMiddlePoint;
    if (this._middlePoint) {
      this._renderer.append(
        new SelectionRenderer({
          points: [new AnchorPoint(this._middlePoint, { pointIndex: 0 })],
          bgColors: this._lineAnchorColors([this._middlePoint]),
          color,
          visible: showMiddle && this.areAnchorsVisible(),
          hitTarget: HitTarget.Regular
        })
      );
    }
    const arcData = {
      point: p1,
      angle: source.angle() ?? 0,
      color,
      size: 50
    };
    this._angleRenderer.setData(arcData);
    this._renderer.append(this._angleRenderer);
    const angleDegrees = arcData.angle * 180 / Math.PI;
    const angleText = Math.round(angleDegrees * 100) / 100 + "º";
    const labelData = {
      points: [new Point(p1.x + 50, p1.y)],
      text: forceLTRStr(angleText),
      color,
      horzAlign: HorizontalAlign.Left,
      fontFamily: ChartFontFamily,
      offsetX: 5,
      offsetY: 0,
      bold: props.bold,
      italic: props.italic,
      fontSize: props.fontSize,
      vertAlign: VerticalAlign.Middle
    };
    this._angleLabelRenderer.setData(labelData);
    this._renderer.append(this._angleLabelRenderer);
    this._renderer.append(
      this.createLineAnchor(
        {
          points: [
            new AnchorPoint(p1, { pointIndex: 0 }),
            new AnchorPoint(this._secondPoint, { pointIndex: 1 })
          ]
        },
        0
      )
    );
  }
}
class TrendAnglePrimitive extends BaseTextPrimitive {
  constructor() {
    super(...arguments);
    __publicField(this, "_line", new TrendAnglePaneView(
      this,
      this.model,
      this.editingHelper
    ));
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
    __publicField(this, "_angle", null);
    __publicField(this, "_distance", 0);
  }
  pointsCount() {
    return 2;
  }
  angle() {
    return this._angle;
  }
  distance() {
    return this._distance;
  }
  addPoint(point, step) {
    const resp = super.addPoint(point, step);
    if (step > 0) {
      this._calculateAngle();
    }
    return resp;
  }
  setPoint(index, point, details) {
    super.setPoint(index, point, details);
    if (index == 1) {
      this._calculateAngle();
    }
  }
  _calculateAngle() {
    const p0 = ensure(this.pointToScreenPoint(this.controlPoints[0]));
    let vector = ensure(this.pointToScreenPoint(this.controlPoints[1])).subtract(p0);
    const length = vector.length();
    if (length > 0) {
      vector = vector.normalized();
      this._angle = Math.acos(vector.x);
      if (vector.y > 0) {
        this._angle = -this._angle;
      }
      this._distance = length;
    } else {
      this._angle = 0;
    }
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
class TrendAngleTool extends BaseTextTool {
  constructor() {
    super(...arguments);
    __publicField(this, "type", TrendAngleToolType);
  }
  createPrimitive(drawingSession) {
    const i18nService = getI18nService(drawingSession);
    return new TrendAnglePrimitive(
      {
        id: this.id,
        points: [],
        linecolor: "#2962FF",
        linewidth: 2,
        linestyle: 0,
        extendLeft: false,
        extendRight: false,
        textColor: "#2962FF",
        fontSize: 14,
        text: "",
        placeholder: "",
        wordWrap: true,
        bold: false,
        italic: false,
        alwaysShowStats: false,
        showMiddlePoint: false,
        showPriceLabels: false,
        showPriceRange: false,
        showPercentPriceRange: false,
        showPipsPriceRange: false,
        showBarsRange: false,
        showAngle: false,
        statsPosition: StatsPosition.Right,
        formatBarCount: (args) => {
          return i18nService.t("tool.line.common.bars", args);
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
  TrendAngleTool
};
