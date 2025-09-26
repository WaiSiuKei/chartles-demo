var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { e as ensure, aD as merge, z as HitTarget, s as should, aE as isAnchorDetails, u as Point, aF as isUndefinedOrNull, am as memoize, aG as InputEventType, i as isValidPosition, m as IToolService, aH as getXCoordinate, a as isFiniteNumber, O as NOTREACHED, aI as omit, aJ as FocusEventSource, ap as IIntlService, aK as IThemeService, aL as LineAnchorRenderer } from "./index-DSkroicZ.js";
import { B as BaseTool } from "./baseTool-BVX9dcKc.js";
class SeriesPrimitive {
  constructor(chart = void 0, series = void 0) {
    __publicField(this, "_chart");
    __publicField(this, "_series");
    __publicField(this, "_prevSeries");
    __publicField(this, "_isAttached", false);
    __publicField(this, "_requestUpdate");
    // This method is a class property to maintain the
    // lexical 'this' scope (due to the use of the arrow function)
    // and to ensure its reference stays the same, so we can unsubscribe later.
    __publicField(this, "_fireDataUpdated", (scope) => {
      if (this.dataUpdated) {
        this.dataUpdated(scope);
      }
    });
    if (chart) this._chart = chart;
    if (series) this._series = series;
  }
  requestUpdate() {
    if (!this.isAttached) return;
    if (this._requestUpdate) this._requestUpdate();
  }
  attached({ chart, series, requestUpdate }) {
    this._isAttached = true;
    this._chart = chart;
    this._series = series;
    this._series.subscribeDataChanged(this._fireDataUpdated);
    this._requestUpdate = requestUpdate;
    this.requestUpdate();
  }
  attach(series) {
    series.attachPrimitive(this);
  }
  reAttach() {
    ensure(this._prevSeries).attachPrimitive(this);
    this._prevSeries = void 0;
  }
  detach() {
    var _a;
    (_a = this._series) == null ? void 0 : _a.detachPrimitive(this);
  }
  detached() {
    var _a;
    this._isAttached = false;
    (_a = this._series) == null ? void 0 : _a.unsubscribeDataChanged(this._fireDataUpdated);
    this._prevSeries = this.series;
    this._chart = void 0;
    this._series = void 0;
    this._requestUpdate = void 0;
  }
  get isAttached() {
    return this._isAttached;
  }
  get chart() {
    return ensure(this._chart);
  }
  get series() {
    return ensure(this._series);
  }
}
var DrawingAbortBehavior = /* @__PURE__ */ ((DrawingAbortBehavior2) => {
  DrawingAbortBehavior2[DrawingAbortBehavior2["None"] = 0] = "None";
  DrawingAbortBehavior2[DrawingAbortBehavior2["Remove"] = 1] = "Remove";
  return DrawingAbortBehavior2;
})(DrawingAbortBehavior || {});
const AddPointAcceptMask = 1 << 0;
const AddPointFinishMask = 1 << 1;
const AddPointRejectMask = 1 << 3;
var AddPointResponse = ((AddPointResponse2) => {
  AddPointResponse2[AddPointResponse2["Accept"] = AddPointAcceptMask] = "Accept";
  AddPointResponse2[AddPointResponse2["AcceptAndFinish"] = AddPointAcceptMask | AddPointFinishMask] = "AcceptAndFinish";
  AddPointResponse2[AddPointResponse2["Reject"] = AddPointRejectMask] = "Reject";
  return AddPointResponse2;
})(AddPointResponse || {});
function isPointAccepted(resp) {
  return (resp & AddPointAcceptMask) !== 0;
}
const axisLabelBackground = "#2A62FF";
const axisLabelForeground = "#FFFFFF";
const axisRangeColor = "#2962FF33";
var __defProp$1 = Object.defineProperty;
var __getOwnPropDesc$1 = Object.getOwnPropertyDescriptor;
var __decorateClass$1 = (decorators, target, key, kind) => {
  var result = __getOwnPropDesc$1(target, key);
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = decorator(target, key, result) || result;
  if (result) __defProp$1(target, key, result);
  return result;
};
class ToolPrimitive extends SeriesPrimitive {
  constructor(_props, type, _ctx, chart, series, model) {
    super(chart, series);
    __publicField(this, "disableDelete", false);
    __publicField(this, "disableUserSelection", false);
    __publicField(this, "disableToolbar", false);
    __publicField(this, "_paneView", []);
    __publicField(this, "_priceAxisPaneViews", []);
    __publicField(this, "_timeAxisPaneViews", []);
    __publicField(this, "_timeAxisViews", []);
    __publicField(this, "_priceAxisViews", []);
    __publicField(this, "disableExtendTime", false);
    __publicField(this, "_currentDragTarget", 0);
    this._props = _props;
    this.type = type;
    this._ctx = _ctx;
    this.model = model;
  }
  get id() {
    return this._props.id;
  }
  get controlPoints() {
    return this._props.points;
  }
  get isDrawing() {
    return this.model.currentCreating === this;
  }
  isActive() {
    return this.model.currentActive === this;
  }
  isCreationFinished() {
    return this.model.currentCreating !== this;
  }
  properties() {
    return this._props;
  }
  priceScale() {
    return this.series;
  }
  timeScale() {
    return this.chart.timeScale();
  }
  getScope() {
    return {
      mediaSize: {
        width: this.chart.timeScale().width(),
        height: this.series.getPane().getHeight()
      }
    };
  }
  symbolInfo() {
    return this._ctx.chartService.symbolInfo();
  }
  timeSpanFormatter() {
    return this._ctx.timeSpanFormatter;
  }
  get hitTestCollector() {
    return (shapes) => {
      this._ctx.hitTestCollector(this.id, shapes);
    };
  }
  updateProps(data) {
    merge(this._props, data);
    this.updateAllViews();
    this.requestUpdate();
  }
  updateActive() {
    this.updateAllViews();
    this.requestUpdate();
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  updateHover(detail) {
    this.updateAllViews();
    this.requestUpdate();
  }
  paneIndex() {
    return this.series.getPane().paneIndex();
  }
  isTool() {
    return true;
  }
  onDragStart(hittest) {
    this._currentDragTarget = hittest.target;
    if (this._currentDragTarget === HitTarget.MovePoint) {
      this.startMoving();
    }
    if (this._currentDragTarget === HitTarget.ChangePoint) {
      should(isAnchorDetails(hittest.details));
      this.startChanging(hittest.details.componentIndex);
    }
  }
  onDragEnd() {
    if (this._currentDragTarget === HitTarget.MovePoint) {
      this.endMoving();
    }
    if (this._currentDragTarget === HitTarget.ChangePoint) {
      this.endChanging();
    }
    this._currentDragTarget = 0;
  }
  updateMove(point, step) {
    this.addPoint({ ...point, isTempForPreview: true }, step);
    this.updateAllViews();
    this.requestUpdate();
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  updateStroke(point) {
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  startChanging(index) {
  }
  endChanging() {
  }
  startMoving() {
  }
  move() {
  }
  endMoving() {
  }
  updateDrag(componentId, startPoints, startTime, endTime, startPrice, endPrice, screenPoint, details, modifiers) {
    this._currentDragTarget = componentId;
    const deltaTime = endTime - startTime;
    const deltaPrice = endPrice - startPrice;
    switch (componentId) {
      case HitTarget.MovePoint:
        this._props.points.forEach((point, i) => {
          if (!startPoints[i]) return;
          point.time = startPoints[i].time + deltaTime;
          point.price = startPoints[i].price + deltaPrice;
        });
        this.move();
        break;
      case HitTarget.ChangePoint: {
        should(isAnchorDetails(details));
        const idx = details.componentIndex;
        this.setPoint(
          idx,
          { time: endTime, price: endPrice },
          {
            shiftkey: modifiers.shiftkey,
            startTime,
            endTime,
            get deltaTime() {
              return endTime - startTime;
            },
            startPrice,
            endPrice,
            get deltaPrice() {
              return endPrice - startPrice;
            },
            startPoint: startPoints[idx],
            screenPoint,
            startPoints,
            hitTestDetails: details
          }
        );
        break;
      }
    }
    this.updateAllViews();
    this.requestUpdate();
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setPoint(index, point, details) {
    this.controlPoints[index] = point;
  }
  addPoint(point, step) {
    this.controlPoints[step] = point;
    return AddPointResponse.Accept;
  }
  finish() {
    if (!this.isAttached) return;
    this.updateAllViews();
    this.requestUpdate();
  }
  abort() {
    if (this.model.currentCreating === this) {
      this.model.markCreatingFinishedOrAborted(this);
    }
    return DrawingAbortBehavior.Remove;
  }
  pointToScreenPoint(p) {
    const coordX = p.time ? this.chart.timeScale().timeToCoordinateEx(p.time) : NaN;
    if (coordX === null) return null;
    const coordY = this.series.priceToCoordinate(p.price);
    if (coordY === null) return null;
    return new Point(coordX, coordY);
  }
  screenPointToPoint(p) {
    return {
      time: ensure(this.chart.timeScale().coordinateToTimeEx(p.x)),
      price: ensure(this.series.coordinateToPrice(p.y))
    };
  }
  getIndex(point) {
    return this.chart.timeScale().timeToIndexEx(point.time);
  }
  paneViews() {
    return this._paneView;
  }
  timeAxisPaneViews() {
    return this._timeAxisPaneViews;
  }
  priceAxisPaneViews() {
    return this._priceAxisPaneViews;
  }
  timeAxisViews() {
    return this._timeAxisViews;
  }
  priceAxisViews() {
    return this._priceAxisViews;
  }
  asTextToolPrimitive() {
    return void 0;
  }
  _calculateTimeAxisViewData(time, x, override) {
    return {
      foreground: axisLabelForeground,
      background: axisLabelBackground,
      coordinate: x,
      text: this._ctx.dateTimeFormatter(time),
      visible: !isUndefinedOrNull(time) && this.isActive(),
      ...override
    };
  }
  _calculatePriceAxisViewData(price, y, override) {
    return {
      foreground: axisLabelForeground,
      background: axisLabelBackground,
      coordinate: y,
      text: this._ctx.priceLabelFormatter(price),
      visible: this.isActive(),
      ...override
    };
  }
  _calculatePriceAxisPaneViewData(p0, p1) {
    const priceScaleWidth = this.series.priceScale().width();
    return {
      p0,
      p1,
      visible: this.isActive(),
      background: axisRangeColor,
      maxDimension: priceScaleWidth
    };
  }
  _calculateTimeAxisPaneViewsData(p0, p1) {
    const timeScaleHeight = this.chart.timeScale().height();
    return {
      p0,
      p1,
      visible: this.isActive(),
      background: axisRangeColor,
      maxDimension: timeScaleHeight
    };
  }
}
__decorateClass$1([
  memoize
], ToolPrimitive.prototype, "paneIndex");
var __defProp2 = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = __getOwnPropDesc(target, key);
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = decorator(target, key, result) || result;
  if (result) __defProp2(target, key, result);
  return result;
};
class DrawingSession {
  constructor(chartService, paneIndex, inPreview = false) {
    __publicField(this, "primitive");
    __publicField(this, "_clickCount", 0);
    this.chartService = chartService;
    this.paneIndex = paneIndex;
    this.inPreview = inPreview;
  }
  get clickCount() {
    return this._clickCount;
  }
  get currentStep() {
    return this._clickCount;
  }
  getTargetSeries() {
    return this.paneIndex === 0 ? this.chartService.mainSeriesApi.getSeries() : ensure(this.chartService.getPaneSeries(this.paneIndex));
  }
  startPreview(primitive) {
    this.inPreview = true;
    this.primitive = primitive;
    this.primitive.attach(this.getTargetSeries());
    this.chartService.getModel().markCreatingStarted(primitive);
    this.chartService.getController().attachToolPrimitive(primitive, false);
  }
  endPreview() {
    should(this.inPreview);
    this.inPreview = false;
    this.chartService.getModel().focus(this.primitive, FocusEventSource.select);
  }
  startDrawing(primitive) {
    this.primitive = primitive;
    this.primitive.attach(this.getTargetSeries());
    this.chartService.getModel().markCreatingStarted(primitive);
    this.chartService.getController().attachToolPrimitive(primitive, true);
  }
  onPoint() {
    this.chartService.getModel().markCreatingPoint(this._clickCount);
    this._clickCount++;
  }
  finishDrawing() {
    this.chartService.getModel().markCreatingFinishedOrAborted(this.primitive);
    this.primitive.finish();
  }
  abortDrawing() {
    this.chartService.getModel().markCreatingFinishedOrAborted(this.primitive);
    this.primitive.abort();
    this.chartService.getController().detachToolPrimitive(this.primitive);
  }
  detach() {
    this.chartService.getController().detachToolPrimitive(this.primitive);
  }
  dispose() {
    var _a;
    const primitive = this.primitive;
    if (!primitive) return;
    if (!this.inPreview && ((_a = primitive.isCreationFinished) == null ? void 0 : _a.call(primitive)) === false) return;
    if (this.chartService.getModel().currentCreating === primitive) {
      this.chartService.getController().detachToolPrimitive(primitive);
      this.chartService.getModel().markCreatingFinishedOrAborted(this.primitive);
    }
  }
}
__decorateClass([
  memoize
], DrawingSession.prototype, "getTargetSeries");
class DrawingTool extends BaseTool {
  constructor() {
    super(...arguments);
    __publicField(this, "canGoBackward", true);
    // 是否禁止bar数据范围外的Time
    __publicField(this, "disableExtendTime", false);
    __publicField(this, "previewBeforePlace", false);
    __publicField(this, "_drawingSession");
    __publicField(this, "_presetProps");
    __publicField(this, "_forcedPaneIndex");
  }
  get chartService() {
    var _a;
    return ensure((_a = this._drawingSession) == null ? void 0 : _a.chartService);
  }
  get presetProps() {
    return this._presetProps;
  }
  get primitive() {
    var _a;
    return ensure((_a = this._drawingSession) == null ? void 0 : _a.primitive);
  }
  _startCreationOnChart(chartService, paneIndex, previewMode, reuse = true) {
    var _a;
    if (chartService === ((_a = this._drawingSession) == null ? void 0 : _a.chartService)) {
      if (reuse) return this._drawingSession;
      this._drawingSession.finishDrawing();
    }
    this._drawingSession = new DrawingSession(chartService, paneIndex, previewMode);
    return this._drawingSession;
  }
  processEvent(event) {
    var _a;
    switch (event.type) {
      case InputEventType.CLICK: {
        const chartEvent = ensure(event.asChartInputEvent());
        if (!chartEvent.point) {
          return;
        }
        const pos = chartEvent.source.chartApi.getCrosshairPosition();
        if (!isValidPosition(pos)) {
          return;
        }
        if (this.onlyDrawingOnMainSeries() && pos.paneIndex !== 0) {
          event.source.invokeWithinContext((accessor) => {
            accessor.get(IToolService).keepDrawingOrSwitchBack();
          });
          return;
        }
        if (this._drawingSession && (this._drawingSession.chartService !== chartEvent.source || this._drawingSession.paneIndex !== pos.paneIndex)) {
          this._drawingSession.abortDrawing();
          getToolService(this._drawingSession).keepDrawingOrSwitchBack();
          return;
        }
        const paneIndex = ensure(chartEvent.paneIndex);
        if (!this._drawingSession) {
          this._startCreationOnChart(chartEvent.source, paneIndex, false);
        }
        const time = getXCoordinate(this.chartService, pos.x, {
          useExtended: !this.disableExtendTime
        });
        const price = ensure((_a = this._drawingSession) == null ? void 0 : _a.getTargetSeries().coordinateToPrice(pos.y));
        should(isFiniteNumber(time));
        event.accept();
        this._addPoint({ time, price });
        break;
      }
      case InputEventType.MOUSE_MOVE: {
        const chartInputEvent = event.asChartInputEvent();
        if (chartInputEvent) {
          this._onMouseMove(chartInputEvent);
        }
        break;
      }
    }
  }
  _stepCount() {
    var _a;
    return ((_a = this._drawingSession) == null ? void 0 : _a.primitive.pointsCount()) ?? 1;
  }
  _addPoint(point) {
    let resp;
    should(this._drawingSession);
    if (this._drawingSession.clickCount === 0) {
      if (this.previewBeforePlace) {
        should(this._drawingSession.primitive);
        this._drawingSession.endPreview();
      } else {
        this._drawingSession.startDrawing(this.doCreatePrimitive(this._drawingSession));
      }
      resp = this.primitive.addPoint(point, this._drawingSession.currentStep);
    } else {
      resp = this.primitive.addPoint(point, this._drawingSession.currentStep);
      if (resp === AddPointResponse.Reject) return;
    }
    this._drawingSession.onPoint();
    const finished = this._drawingSession.clickCount === this._stepCount() || resp === AddPointResponse.AcceptAndFinish;
    if (finished) {
      this.finishDrawing();
      this.chartService.invokeWithinContext((accessor) => {
        accessor.get(IToolService).keepDrawingOrSwitchBack();
      });
    }
  }
  _onMouseMove(event) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    if (this.previewBeforePlace) {
      const pos2 = event.source.chartApi.getCrosshairPosition();
      if (!isValidPosition(pos2) || isFiniteNumber(this._forcedPaneIndex) && pos2.paneIndex && pos2.paneIndex !== this._forcedPaneIndex || this._drawingSession && isFiniteNumber(this._forcedPaneIndex) && pos2.paneIndex !== ((_a = this._drawingSession) == null ? void 0 : _a.paneIndex)) {
        if ((_b = this._drawingSession) == null ? void 0 : _b.primitive) {
          (_d = (_c = this._drawingSession.primitive).updateMove) == null ? void 0 : _d.call(
            _c,
            {
              time: NaN,
              price: NaN
            },
            ensure(this._drawingSession).currentStep
          );
        }
        return;
      }
      if (this._drawingSession && (this._drawingSession.chartService !== event.source || !this._forcedPaneIndex && pos2.paneIndex !== this._drawingSession.paneIndex)) {
        this._drawingSession.abortDrawing();
        this._drawingSession = void 0;
      }
      if (!this._drawingSession) {
        this._drawingSession = this._startCreationOnChart(
          event.source,
          ensure(pos2.paneIndex),
          true
        );
      }
      if (!this._drawingSession.primitive) {
        const primitive2 = this.doCreatePrimitive(this._drawingSession);
        this._drawingSession.startPreview(primitive2);
      }
    }
    const primitive = (_e = this._drawingSession) == null ? void 0 : _e.primitive;
    if (!primitive) return;
    if (!(primitive == null ? void 0 : primitive.updateMove)) return;
    if (!event.point) return;
    if (event.source !== ((_f = this._drawingSession) == null ? void 0 : _f.chartService)) return;
    const pos = event.source.chartApi.getCrosshairPosition();
    if (!isValidPosition(pos)) return;
    if (pos.paneIndex !== ((_g = this._drawingSession) == null ? void 0 : _g.paneIndex)) return;
    const time = getXCoordinate(this.chartService, pos.x, {
      useExtended: !this.disableExtendTime
    });
    const price = ensure((_h = this._drawingSession) == null ? void 0 : _h.getTargetSeries().coordinateToPrice(pos.y));
    primitive.updateMove(
      { time, price },
      ensure(this._drawingSession).currentStep
    );
  }
  get resetArgs() {
    const session = ensure(this._drawingSession);
    const colorTheme = getThemeService(session).getColorTheme();
    const i18nService = getI18nService(session);
    return [
      this.type,
      {
        chartService: this.chartService,
        colorTheme,
        priceLabelFormatter: getPriceLabelFormatter(session),
        dateTimeFormatter: getDateTimeFormatter(session),
        dateFormatter: getDateFormatter(session),
        hitTestCollector: getHitTestCollector(session),
        percentageFormatter(val) {
          return (val * 100).toFixed(2) + "%";
        },
        amountFormatter(val) {
          return val.toFixed(0);
        },
        timeSpanFormatter: (start, end) => {
          let remaining = end.valueOf() - start.valueOf();
          const sign = Math.sign(remaining);
          remaining = Math.abs(remaining);
          const days = Math.floor(remaining / 86400);
          remaining = remaining % 86400;
          const hours = Math.floor(remaining / 3600);
          remaining = remaining % 3600;
          const minutes = Math.floor(remaining / 60);
          remaining = remaining % 60;
          const seconds = remaining;
          const parts = [];
          if (days > 0) {
            parts.push(days + i18nService.t("resolution.timeSpan.day"));
          }
          if (hours > 0) {
            parts.push(hours + i18nService.t("resolution.timeSpan.hour"));
          }
          if (minutes > 0) {
            parts.push(minutes + i18nService.t("resolution.timeSpan.minute"));
          }
          if (seconds > 0 || parts.length === 0) {
            parts.push(seconds + i18nService.t("resolution.timeSpan.second"));
          }
          const span = parts.join(" ");
          return sign === 1 ? span : `-${span}`;
        }
      },
      getChart(session),
      session.getTargetSeries(),
      getChartModel(session)
    ];
  }
  receivePresetProps({
    chartService,
    paneIndex,
    props
  }) {
    var _a;
    this._forcedPaneIndex = paneIndex;
    if (chartService) this._startCreationOnChart(chartService, paneIndex, false);
    this._presetProps = props;
    if (!chartService && ((_a = props.points) == null ? void 0 : _a.length)) {
      NOTREACHED();
    }
    if (props.points) {
      for (const point of props.points) {
        this._addPoint(point);
      }
    }
  }
  doCreatePrimitive(drawingSession) {
    const pm = this.createPrimitive(drawingSession);
    if (this._presetProps) {
      pm.updateProps(omit(this._presetProps, ["points"]));
    }
    return pm;
  }
  finishDrawing() {
    ensure(this._drawingSession).finishDrawing();
  }
  abortDrawing() {
    ensure(this._drawingSession).abortDrawing();
  }
  deactivated() {
    var _a;
    (_a = this._drawingSession) == null ? void 0 : _a.dispose();
  }
  useMagnetedPosition() {
    return true;
  }
  isDrawingTool() {
    return true;
  }
  canKeepDrawing() {
    return true;
  }
  onlyDrawingOnMainSeries() {
    return false;
  }
}
function getThemeService(session) {
  return session.chartService.invokeWithinContext(
    (accessor) => accessor.get(IThemeService)
  );
}
function getI18nService(session) {
  return session.chartService.invokeWithinContext(
    (accessor) => accessor.get(IIntlService)
  );
}
function getToolService(session) {
  return session.chartService.invokeWithinContext(
    (accessor) => accessor.get(IToolService)
  );
}
function getChart(session) {
  return session.chartService.chartApi;
}
function getHitTestCollector(session) {
  return (id, primitives) => {
    session.chartService.getController().collectToolHitTestObjects(id, primitives);
  };
}
function getDateTimeFormatter(session) {
  return (time) => {
    return session.chartService.formatDateTime(time);
  };
}
function getDateFormatter(session) {
  return (time) => {
    return session.chartService.formatDate(time);
  };
}
function getPriceLabelFormatter(session) {
  return (price) => {
    return session.getTargetSeries().priceFormatter().format(price);
  };
}
function getChartModel(session) {
  return session.chartService.getModel();
}
const AnchorStyleConsts = {
  // 锚点半径
  RegularAnchorRadius: 6,
  // 描边线宽
  RegularStrokeWidth: 1,
  // 被选中的描边线宽
  RegularSelectedStrokeWidth: 3
};
const AnchorColor = "#2A62FF";
function anchorColor() {
  return AnchorColor;
}
class ToolPaneView {
  constructor(_source, _model) {
    __publicField(this, "_lineAnchorRenderers", []);
    __publicField(this, "_data", /* @__PURE__ */ Object.create(null));
    this._source = _source;
    this._model = _model;
  }
  get _hitTestCollector() {
    return this._source.hitTestCollector;
  }
  zOrder() {
    return this._model.currentCreating == this._source || this._model.currentActive === this._source || this._model.currentHovered === this._source ? "top" : "under";
  }
  points() {
    return this._data.points;
  }
  update(data) {
    this._data = data;
    this._updateImpl();
  }
  addAnchors(e) {
    let points = this.points();
    if (this._model.currentCreating === this._source) {
      points = points.slice(0, ensure(this._model.pointCreating) + 1);
    }
    e.append(this.createLineAnchor({ points }, 0));
  }
  _anchorRadius() {
    return AnchorStyleConsts.RegularAnchorRadius;
  }
  isHoveredSource() {
    return this._model.currentHovered === this._source;
  }
  isSelectedSource() {
    return this._model.isSelected(this._source);
  }
  areAnchorsVisible() {
    return this.isHoveredSource() || this.isSelectedSource();
  }
  _lineAnchorColors(points) {
    const height = this._source.series.getPane().getHeight();
    return points.map((e) => this._model.backgroundColorAtYPercentFromTop(e.y / height));
  }
  createLineAnchor(e, index = 0) {
    const { points } = e;
    const renderer = this._getLineAnchorRenderer(index);
    renderer.setData({
      points,
      color: anchorColor(),
      backgroundColors: this._lineAnchorColors(points),
      currentPoint: this._model.currentPoint,
      radius: AnchorStyleConsts.RegularAnchorRadius,
      strokeWidth: AnchorStyleConsts.RegularStrokeWidth,
      selected: this.isSelectedSource(),
      selectedStrokeWidth: AnchorStyleConsts.RegularSelectedStrokeWidth,
      visible: this.areAnchorsVisible(),
      linePointBeingEdited: this._model.currentEditing === this._source ? this._model.pointEditing : null
    });
    return renderer;
  }
  _getLineAnchorRenderer(e) {
    for (; this._lineAnchorRenderers.length <= e; )
      this._lineAnchorRenderers.push(new LineAnchorRenderer());
    return this._lineAnchorRenderers[e];
  }
}
export {
  AddPointResponse as A,
  DrawingTool as D,
  ToolPaneView as T,
  ToolPrimitive as a,
  DrawingSession as b,
  DrawingAbortBehavior as c,
  getI18nService as g,
  isPointAccepted as i
};
