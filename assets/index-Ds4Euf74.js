const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./tool-OBbB3e3x.js","./index-DSkroicZ.js","./toolPaneView-BAEHHn7m.js","./baseTool-BVX9dcKc.js","./priceLabelPriceAxisView-d9Maj5lR.js","./timeLabelTimeAxisView-BvW_UnA0.js","./composite-BOGQNAfc.js"])))=>i.map(i=>d[i]);
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { t as toString, c as cloneDeep, I as ImageToolType, F as FileNameKey, D as DrawingFragmentBrand, H as HorizontalLineRenderer, L as LineStyleType, A as AnchorPoint, P as PreOrderToolType, i as isValidPosition, a as isFiniteNumber, e as ensure, b as IChartManagementService, d as Disposable, T as TriggerSource, K as KeybindingWeight, f as KeyCode, E as ExitDrawingCommand, s as should, g as get, R as RemoveDrawingCommand, C as CopyDrawingCommand, h as KeyMod, j as CloneDrawingCommand, _ as __vitePreload, k as PasteImageToolType, l as IInstantiationService, m as IToolService, n as IClipboardService, o as IKeybindingsRegistry, p as ICommandService, q as IToolRegistry } from "./index-DSkroicZ.js";
import { T as ToolPaneView, a as ToolPrimitive, D as DrawingTool } from "./toolPaneView-BAEHHn7m.js";
import { C as CursorCrossToolType, a as CursorTools, L as LineTools, b as ChannelTools, F as FibAndGannTools, P as PatternTools, M as MeasureTools, S as ShapesTools, A as AnnotationTools, i as iconEmoji, c as iconIcon, d as contentImage, m as measure, z as zoomIn } from "./index-DNbtFiKr.js";
import { r as roundByMinmov } from "./adjustValue-D94hgajw.js";
import "./baseTool-BVX9dcKc.js";
function basePropertyOf(object) {
  return function(key) {
    return object == null ? void 0 : object[key];
  };
}
var htmlEscapes = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
};
var escapeHtmlChar = basePropertyOf(htmlEscapes);
var reUnescapedHtml = /[&<>"']/g, reHasUnescapedHtml = RegExp(reUnescapedHtml.source);
function escape(string) {
  string = toString(string);
  return string && reHasUnescapedHtml.test(string) ? string.replace(reUnescapedHtml, escapeHtmlChar) : string;
}
function toFragmentString(pm) {
  const props = cloneDeep(pm.properties());
  if (pm.type === ImageToolType) {
    Reflect.set(props, FileNameKey, pm.properties().image.name);
  }
  const json = JSON.stringify({
    type: pm.type,
    props
  });
  const escaped = escape(json);
  return `<span ${DrawingFragmentBrand}="${escaped}"> </span>`;
}
class PreOrderPaneview extends ToolPaneView {
  constructor() {
    super(...arguments);
    __publicField(this, "_renderer", new HorizontalLineRenderer());
  }
  renderer() {
    return this._renderer;
  }
  _updateImpl() {
    const points = this.points();
    if (!points || !points.length) {
      this._renderer.setData(null);
      return;
    }
    this._renderer.setData({
      lineWidth: 1,
      lineStyle: LineStyleType.solid,
      lineColor: "#999999",
      y: points[0].y
    });
  }
}
class PreOrderPrimitive extends ToolPrimitive {
  constructor() {
    super(...arguments);
    __publicField(this, "_line", new PreOrderPaneview(this, this.model));
    __publicField(this, "_paneView", [this._line]);
  }
  pointsCount() {
    return 1;
  }
  updateMove(point, step) {
    super.updateMove(point, step);
    this._props.onChange({ price: point.price });
  }
  updateAllViews() {
    if (!this.controlPoints.length) return;
    const [p0] = this.controlPoints;
    const screenPoint = this.pointToScreenPoint(p0);
    if (!screenPoint) return;
    this._line.update({ points: [new AnchorPoint(screenPoint)] });
  }
}
var __getOwnPropDesc$1 = Object.getOwnPropertyDescriptor;
var __decorateClass$1 = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc$1(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = decorator(result) || result;
  return result;
};
var __decorateParam$1 = (index, decorator) => (target, key) => decorator(target, key, index);
let TradePreOrderTool = class extends DrawingTool {
  constructor(chartManagementService) {
    super();
    __publicField(this, "type", PreOrderToolType);
    __publicField(this, "previewBeforePlace", true);
    __publicField(this, "_drawingSessions", /* @__PURE__ */ new Map());
    this.chartManagementService = chartManagementService;
  }
  createPrimitive() {
    return new PreOrderPrimitive(
      {
        id: this.id,
        points: [],
        onDone() {
        },
        onChange() {
        }
      },
      ...this.resetArgs
    );
  }
  receiveProps(props) {
    this._ensureDrawings();
    this._drawingSessions.values().forEach((session) => {
      session.primitive.updateProps(props);
    });
  }
  _onMouseMove(event) {
    var _a;
    const pos = event.source.chartApi.getCrosshairPosition();
    if (!isValidPosition(pos) || isFiniteNumber(this._forcedPaneIndex) && pos.paneIndex && pos.paneIndex !== this._forcedPaneIndex || this._drawingSession && isFiniteNumber(this._forcedPaneIndex) && pos.paneIndex !== this._drawingSession.paneIndex) {
      this._drawingSessions.values().forEach((session) => {
        var _a2, _b;
        (_b = (_a2 = session.primitive) == null ? void 0 : _a2.updateMove) == null ? void 0 : _b.call(
          _a2,
          {
            time: NaN,
            price: NaN
          },
          ensure(this._drawingSession).currentStep
        );
      });
    }
    this._ensureDrawings();
    const sessionOfChart = ensure(this._drawingSessions.get(event.source));
    if (sessionOfChart !== this._drawingSession) {
      if (this._drawingSession) {
        this._leaveChart(this._drawingSession.chartService);
      }
      this._enterChart(sessionOfChart.chartService);
      this._drawingSession = sessionOfChart;
    }
    const price = ensure((_a = this._drawingSession) == null ? void 0 : _a.getTargetSeries().coordinateToPrice(pos.y));
    this._drawingSessions.values().forEach((session) => {
      var _a2, _b;
      (_b = (_a2 = session.primitive).updateMove) == null ? void 0 : _b.call(
        _a2,
        { time: 0, price },
        ensure(this._drawingSession).currentStep
      );
    });
  }
  _ensureDrawings() {
    if (!this._drawingSessions.size) {
      this.chartManagementService.getCharts().forEach((chartService) => {
        const session = this._startCreationOnChart(
          chartService,
          ensure(this._forcedPaneIndex),
          true
        );
        this._drawingSessions.set(chartService, session);
        const primitive = this.doCreatePrimitive(session);
        session.startPreview(primitive);
      });
    }
  }
  _enterChart(chartService) {
    chartService.chartApi.applyOptions({
      handleScale: false,
      handleScroll: false,
      crosshair: {
        horzLine: {
          visible: false,
          labelVisible: false
        },
        vertLine: {
          visible: false,
          labelVisible: false
        }
      }
    });
  }
  _leaveChart(chartService) {
    chartService.chartApi.applyOptions({
      handleScale: true,
      handleScroll: true,
      crosshair: {
        horzLine: {
          visible: true,
          labelVisible: true
        },
        vertLine: {
          visible: true,
          labelVisible: true
        }
      }
    });
  }
  finishDrawing() {
    var _a, _b, _c, _d, _e;
    const pm = ensure((_a = this._drawingSession) == null ? void 0 : _a.primitive);
    const preOrder = {
      price: roundByMinmov(pm.controlPoints[0].price, this.chartService.symbolInfo().minmov)
    };
    (_c = (_b = this._presetProps) == null ? void 0 : _b.onChange) == null ? void 0 : _c.call(_b, preOrder);
    (_e = (_d = this._presetProps) == null ? void 0 : _d.onDone) == null ? void 0 : _e.call(_d, preOrder);
    this._drawingSessions.values().forEach((session) => {
      session.chartService.getController().detachToolPrimitive(session.primitive);
    });
    super.finishDrawing();
  }
};
TradePreOrderTool = __decorateClass$1([
  __decorateParam$1(0, IChartManagementService)
], TradePreOrderTool);
const tradePreOrder = {
  type: PreOrderToolType,
  icon: "",
  Ctor: () => Promise.resolve(TradePreOrderTool)
};
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = decorator(result) || result;
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
let DrawingContrib = class extends Disposable {
  constructor(toolService, instantiationService) {
    super();
    this._register(instantiationService.createInstance(DrawingRegistryContrib));
    this._register(instantiationService.createInstance(DrawingKeybindingContrib));
    if (!toolService.activeTool) {
      toolService.switchTool(CursorCrossToolType, TriggerSource.program);
    }
  }
};
DrawingContrib = __decorateClass([
  __decorateParam(0, IToolService),
  __decorateParam(1, IInstantiationService)
], DrawingContrib);
let DrawingKeybindingContrib = class extends Disposable {
  constructor(toolService, chartManagementService, clipboardService, keybindingsRegistry, commandService) {
    super();
    this._register(
      keybindingsRegistry.registerCommandAndKeybindingRule({
        id: ExitDrawingCommand,
        primary: KeyCode.Esc,
        weight: KeybindingWeight.ChartContrib,
        when: () => {
          return !!get(toolService.store).activeType;
        },
        handler: () => {
          var _a, _b;
          const activeChart = chartManagementService.activeChart();
          const currentActive = activeChart.getModel().currentActive;
          if (currentActive) {
            if ((_a = currentActive.isTool) == null ? void 0 : _a.call(currentActive)) {
              should(currentActive instanceof ToolPrimitive);
              let removed = false;
              const pm = currentActive;
              if (activeChart.getModel().currentCreating === currentActive) {
                const shouldRemove = pm.abort();
                if (shouldRemove) {
                  activeChart.getController().detachToolPrimitive(currentActive);
                  removed = true;
                }
              }
              if (!removed) {
                activeChart.getModel().blur(pm);
                activeChart.getModel().unhover(pm);
              }
              if (currentActive.type === ((_b = toolService.activeTool) == null ? void 0 : _b.type) && get(toolService.store).keepDrawingMode) {
                toolService.keepDrawingOrSwitchBack();
              } else {
                toolService.switchBack();
              }
            }
          } else {
            toolService.switchBack();
          }
        }
      })
    );
    this._register(
      keybindingsRegistry.registerCommandAndKeybindingRule({
        id: RemoveDrawingCommand,
        primary: KeyCode.Delete,
        secondary: [KeyCode.Backspace],
        weight: KeybindingWeight.ChartContrib,
        when: () => {
          var _a;
          const activeChart = chartManagementService.activeChart();
          const currentActive = activeChart.getModel().currentActive;
          return !!currentActive && !!((_a = currentActive.isTool) == null ? void 0 : _a.call(currentActive));
        },
        handler: () => {
          const activeChart = chartManagementService.activeChart();
          const pm = ensure(activeChart.getModel().currentActive);
          should(pm instanceof ToolPrimitive);
          if (pm.disableDelete) return;
          if (activeChart.getModel().currentCreating === pm) {
            return commandService.executeCommand(ExitDrawingCommand);
          }
          activeChart.getController().detachToolPrimitive(pm);
        }
      })
    );
    this._register(
      keybindingsRegistry.registerCommandAndKeybindingRule({
        id: CopyDrawingCommand,
        primary: KeyCode.KeyC | KeyMod.CtrlCmd,
        weight: KeybindingWeight.ChartContrib,
        when: () => {
          const activeChart = chartManagementService.activeChart();
          const currentActive = activeChart.getModel().currentActive;
          return !!currentActive && currentActive instanceof ToolPrimitive;
        },
        handler: async () => {
          const activeChart = chartManagementService.activeChart();
          const currentActive = ensure(activeChart.getModel().currentActive);
          should(currentActive instanceof ToolPrimitive);
          const data = {
            html: toFragmentString(currentActive)
          };
          if (currentActive.type === ImageToolType) {
            const file = currentActive.properties().image;
            data.files = [file];
          }
          clipboardService.writeClipboard(data);
        }
      })
    );
    this._register(
      keybindingsRegistry.registerCommandAndKeybindingRule({
        id: CloneDrawingCommand,
        primary: KeyCode.KeyD | KeyMod.CtrlCmd,
        weight: KeybindingWeight.ChartContrib,
        when: () => {
          const activeChart = chartManagementService.activeChart();
          const currentActive = activeChart.getModel().currentActive;
          return !!currentActive && currentActive instanceof ToolPrimitive;
        },
        handler: () => {
          const activeChart = chartManagementService.activeChart();
          const currentActive = ensure(activeChart.getModel().currentActive);
          should(currentActive instanceof ToolPrimitive);
          const data = {
            html: toFragmentString(currentActive)
          };
          if (currentActive.type === ImageToolType) {
            const file = currentActive.properties().image;
            data.files = [file];
          }
          activeChart.getController().handlePaste(data);
        }
      })
    );
  }
};
DrawingKeybindingContrib = __decorateClass([
  __decorateParam(0, IToolService),
  __decorateParam(1, IChartManagementService),
  __decorateParam(2, IClipboardService),
  __decorateParam(3, IKeybindingsRegistry),
  __decorateParam(4, ICommandService)
], DrawingKeybindingContrib);
let DrawingRegistryContrib = class extends Disposable {
  constructor(toolRegistry) {
    super();
    this.toolRegistry = toolRegistry;
    const allTools = [
      CursorTools,
      LineTools,
      ChannelTools,
      FibAndGannTools,
      PatternTools,
      MeasureTools,
      ShapesTools,
      AnnotationTools
    ];
    allTools.forEach(({ groups }) => {
      groups.forEach(({ items }) => {
        items.forEach((item) => {
          this.registerTool(item);
        });
      });
    });
    this.registerTool(iconEmoji);
    this.registerTool(iconIcon);
    this.registerTool({
      ...contentImage,
      type: PasteImageToolType,
      Ctor: () => __vitePreload(() => import("./tool-OBbB3e3x.js"), true ? __vite__mapDeps([0,1,2,3,4,5,6]) : void 0, import.meta.url).then((module) => module.PasteImageTool)
    });
    this.registerTool(measure);
    this.registerTool(zoomIn);
    this.registerTool(tradePreOrder);
  }
  registerTool(item) {
    return this.toolRegistry.registerTool({
      id: item.type,
      keybinding: item.keybinding,
      createTool: async (accessor) => {
        const instantiationService = accessor.get(IInstantiationService);
        const Ctor = await ensure(item.Ctor)();
        return instantiationService.createInstance(Ctor);
      }
    });
  }
};
DrawingRegistryContrib = __decorateClass([
  __decorateParam(0, IToolRegistry)
], DrawingRegistryContrib);
export {
  DrawingContrib,
  DrawingKeybindingContrib,
  DrawingRegistryContrib
};
