var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { B as BitmapCoordinatesPaneRenderer, r as ChartFontFamily, e as ensure, u as Point, v as pointInBox, w as box, x as drawRoundRectWithBorder, H as HorizontalLineRenderer, y as HitTestResult, z as HitTarget, G as PaneCursor, J as AnchorResizeVert, M as AreaName, L as LineStyleType, S as Side, N as clamp, A as AnchorPoint, O as NOTREACHED, Q as OrderType, U as append_styles, V as useTranslation, W as useService, X as proxy, Y as from_html, Z as bind_this, $ as Menu, a0 as template_effect, a1 as append, a2 as pop, a3 as push, a4 as toPX, a5 as tick, a6 as child, a7 as set_style, a8 as ITradeService, a9 as List, aa as first_child, ab as if_block, ac as sibling, ad as ParentType, ae as Item, af as set_text, ag as get, ah as user_derived, ai as ifLeftClick, d as Disposable, aj as OrderStatus, ak as isBracketOrder, al as isTakeProfitOrder, s as should, am as memoize, an as IChartService, ao as IChartGuiService, ap as IIntlService, aq as IConfigurationService } from "./index-NZHt9VGv.js";
import { T as ToolPaneView, a as ToolPrimitive, D as DrawingTool, b as DrawingSession } from "./toolPaneView-3wj_on-u.js";
import { P as PriceLabelPriceAxisView } from "./priceLabelPriceAxisView-d9Maj5lR.js";
import { r as roundByMinmov } from "./adjustValue-CiEFCu0u.js";
import { C as CompositeRenderer } from "./composite-tvPrNHN0.js";
import { B as BaseTextRenderer } from "./text-CtvZov1L.js";
import "./baseTool-CHlzZht2.js";
import "./text-8RrTwjoh.js";
import "./ctx-Bv0u81rl.js";
var TradeLineBtns = /* @__PURE__ */ ((TradeLineBtns2) => {
  TradeLineBtns2[TradeLineBtns2["tp"] = 1] = "tp";
  TradeLineBtns2[TradeLineBtns2["sl"] = 2] = "sl";
  TradeLineBtns2[TradeLineBtns2["order"] = 3] = "order";
  return TradeLineBtns2;
})(TradeLineBtns || {});
const TradeLineConfigs = {
  fontSize: 13,
  height: 18,
  textPadding: 3,
  borderRadius: 4,
  widgetMarginRight: 66,
  pnlMarginRight: 20
};
const TradeLineToolType = "tool.trade.line";
class OrderButtonRenderer extends BitmapCoordinatesPaneRenderer {
  constructor() {
    super(...arguments);
    __publicField(this, "_pnlTextRenderer", new BaseTextRenderer());
    __publicField(this, "_text1Renderer", new BaseTextRenderer());
    __publicField(this, "_text2Renderer", new BaseTextRenderer());
    __publicField(this, "_text3Renderer", new BaseTextRenderer());
    __publicField(this, "_sizeData", null);
    __publicField(this, "_positionData", null);
    __publicField(this, "_pnlPositionData", null);
  }
  setData(data) {
    super.setData(data);
    this._sizeData = null;
    this._positionData = null;
    this._pnlPositionData = null;
    if (!this._data || !this._data.points.length) return;
    if (this._data.pnl) {
      this._pnlTextRenderer.setData({
        points: this._data.points,
        text: this._data.pnl.pnlText,
        fontSize: TradeLineConfigs.fontSize,
        color: ensure(this._data.pnl.pnlColor),
        fontFamily: ChartFontFamily,
        horzAlign: "center",
        vertAlign: "middle",
        offsetX: 0,
        offsetY: 0
      });
    }
    this._text1Renderer.setData({
      points: this._data.points,
      text: this._data.text1,
      fontSize: TradeLineConfigs.fontSize,
      color: this._data.color,
      fontFamily: ChartFontFamily,
      horzAlign: "center",
      vertAlign: "middle",
      offsetX: 0,
      offsetY: 0
    });
    this._text2Renderer.setData({
      points: this._data.points,
      text: this._data.text2,
      fontSize: TradeLineConfigs.fontSize,
      color: this._data.color,
      fontFamily: ChartFontFamily,
      horzAlign: "center",
      vertAlign: "middle",
      offsetX: 0,
      offsetY: 0
    });
    if (this._data.text3) {
      this._text3Renderer.setData({
        points: this._data.points,
        text: this._data.text3,
        fontSize: TradeLineConfigs.fontSize,
        color: this._data.color,
        fontFamily: ChartFontFamily,
        horzAlign: "center",
        vertAlign: "middle",
        offsetX: 0,
        offsetY: 0
      });
    }
    const pnlTextWidth = this._data.pnl ? this._pnlTextRenderer.measure().width : 0;
    const text1Width = this._text1Renderer.measure().width + 2 * TradeLineConfigs.textPadding;
    const text2Width = this._text2Renderer.measure().width + 2 * TradeLineConfigs.textPadding;
    const text3Width = this._data.text3 ? this._text3Renderer.measure().width + 2 * TradeLineConfigs.textPadding : 0;
    const pnlBtnWidth = pnlTextWidth ? pnlTextWidth + 2 * TradeLineConfigs.textPadding : 0;
    const mainBtnWidth = [text1Width, text2Width, text3Width].reduce((acc, i) => acc + i);
    this._sizeData = {
      text1Width,
      text2Width,
      text3Width,
      pnlBtnWidth,
      mainBtnWidth
    };
    const right = this._data.rightEdge - TradeLineConfigs.widgetMarginRight;
    const left = right - this._sizeData.mainBtnWidth;
    const centerY = this._data.points[0].y;
    const top = centerY - TradeLineConfigs.height / 2;
    const bottom = top + TradeLineConfigs.height;
    this._positionData = {
      top,
      right,
      bottom,
      left
    };
    if (this._data.pnl) {
      const pnlRight = left - TradeLineConfigs.pnlMarginRight;
      this._pnlPositionData = {
        top,
        right: pnlRight,
        bottom,
        left: pnlRight - pnlBtnWidth
      };
    }
  }
  hitTest(point) {
    if (!this._data) return null;
    if (!this._positionData) return null;
    if (!this._sizeData) return null;
    const mainTopLeft = new Point(this._positionData.left, this._positionData.top);
    const mainRightBottom = new Point(this._positionData.right, this._positionData.bottom);
    if (pointInBox(point, box(mainTopLeft, mainRightBottom))) {
      return this._hitTest;
    }
    if (this._pnlPositionData) {
      const pnlTopLeft = new Point(this._pnlPositionData.left, this._pnlPositionData.top);
      const pnlRightBottom = new Point(this._pnlPositionData.right, this._pnlPositionData.bottom);
      if (pointInBox(point, box(pnlTopLeft, pnlRightBottom))) {
        return this._hitTest;
      }
    }
    return null;
  }
  drawImpl(scope) {
    this.drawMain(scope);
    this.drawPnl(scope);
  }
  drawMain(scope) {
    if (!this._data) return;
    if (!this._sizeData) return;
    if (!this._positionData) return;
    const { context: ctx, horizontalPixelRatio, verticalPixelRatio } = scope;
    const { top, right, left } = this._positionData;
    const borderRadius = TradeLineConfigs.borderRadius * horizontalPixelRatio;
    const centerY = this._data.points[0].y;
    drawRoundRectWithBorder(
      ctx,
      left * horizontalPixelRatio,
      top * verticalPixelRatio,
      this._sizeData.mainBtnWidth * horizontalPixelRatio,
      TradeLineConfigs.height * verticalPixelRatio,
      this._data.backgroundColor
    );
    this._text1Renderer.setPoint(new Point(left + this._sizeData.text1Width / 2, centerY));
    this._text1Renderer.drawImpl(scope);
    this._text2Renderer.setPoint(
      new Point(left + +this._sizeData.text1Width + this._sizeData.text2Width / 2, centerY)
    );
    this._text2Renderer.drawImpl(scope);
    if (this._data.text3) {
      this._text3Renderer.setPoint(new Point(right - this._sizeData.text3Width / 2, centerY));
      this._text3Renderer.drawImpl(scope);
    }
    drawRoundRectWithBorder(
      ctx,
      left * horizontalPixelRatio,
      top * verticalPixelRatio,
      this._sizeData.mainBtnWidth * horizontalPixelRatio,
      TradeLineConfigs.height * verticalPixelRatio,
      "transparent",
      1 * horizontalPixelRatio,
      [borderRadius, borderRadius, borderRadius, borderRadius],
      this._data.color
    );
  }
  drawPnl(scope) {
    if (!this._data) return;
    if (!this._sizeData) return;
    if (!this._pnlPositionData) return;
    if (!this._data.pnl) return;
    const { context: ctx, horizontalPixelRatio, verticalPixelRatio } = scope;
    const { top, left } = this._pnlPositionData;
    const borderRadius = TradeLineConfigs.borderRadius * horizontalPixelRatio;
    const centerY = this._data.points[0].y;
    drawRoundRectWithBorder(
      ctx,
      left * horizontalPixelRatio,
      top * verticalPixelRatio,
      this._sizeData.pnlBtnWidth * horizontalPixelRatio,
      TradeLineConfigs.height * verticalPixelRatio,
      this._data.backgroundColor
    );
    this._pnlTextRenderer.setPoint(new Point(left + this._sizeData.pnlBtnWidth / 2, centerY));
    this._pnlTextRenderer.drawImpl(scope);
    drawRoundRectWithBorder(
      ctx,
      left * horizontalPixelRatio,
      top * verticalPixelRatio,
      this._sizeData.pnlBtnWidth * horizontalPixelRatio,
      TradeLineConfigs.height * verticalPixelRatio,
      "transparent",
      1 * horizontalPixelRatio,
      [borderRadius, borderRadius, borderRadius, borderRadius],
      this._data.pnl.pnlColor
    );
  }
}
class TradeLinePaneView extends ToolPaneView {
  constructor() {
    super(...arguments);
    __publicField(this, "_renderer", new CompositeRenderer(this._hitTestCollector));
    __publicField(this, "_mainRenderer", new OrderButtonRenderer());
    __publicField(this, "_tpRenderer", new OrderButtonRenderer());
    __publicField(this, "_slRenderer", new OrderButtonRenderer());
    __publicField(this, "_lineRenderer", new HorizontalLineRenderer());
  }
  renderer() {
    return this._renderer;
  }
  _updateImpl() {
    this._renderer.clear();
    const points = this.points();
    if (!points || !points.length) return;
    const [p1, tpPoint, slPoint] = points;
    const props = this._source.properties();
    this._mainRenderer.setData({
      points: [p1],
      color: props.color,
      backgroundColor: this._model.backgroundColorAtYPercentFromTop(
        this.points()[0].y / this._source.series.getPane().getHeight()
      ),
      text1: props.typeText,
      text2: props.amountText,
      text3: props.leverageText,
      pnl: props.pnl ? props.pnl : void 0,
      rightEdge: this._source.timeScale().width(),
      onDrop: props.onDrop,
      onContextMenu: props.onContextMenu
    });
    const hitTest = new HitTestResult(
      props.type === "order" ? HitTarget.ChangePoint : HitTarget.Regular,
      {
        areaName: props.type === "order" ? AreaName.AnchorPoint : void 0,
        componentIndex: props.type === "order" ? TradeLineBtns.order : void 0,
        resizeDirections: AnchorResizeVert,
        cursorType: PaneCursor.pointer,
        onDrop: props.onDrop,
        onContextMenu: props.onContextMenu
      }
    );
    this._mainRenderer.setHitTest(hitTest);
    this._lineRenderer.setData({
      y: p1.y,
      lineWidth: 1,
      lineStyle: LineStyleType.solid,
      lineColor: props.color
    });
    this._lineRenderer.setHitTest(hitTest);
    this._renderer.append(this._lineRenderer);
    this._renderer.append(this._mainRenderer);
    if (props.tp) {
      this._tpRenderer.setData({
        points: [ensure(tpPoint)],
        color: props.tp.tpColor,
        backgroundColor: this._model.backgroundColorAtYPercentFromTop(
          props.tp.tpPrice / this._source.series.getPane().getHeight()
        ),
        text1: "TP",
        text2: props.tp.tpText,
        rightEdge: this._source.timeScale().width(),
        onDrop: props.onDrop,
        onContextMenu: props.onContextMenu
      });
      this._tpRenderer.setHitTest(
        new HitTestResult(HitTarget.ChangePoint, {
          areaName: AreaName.AnchorPoint,
          componentIndex: TradeLineBtns.tp,
          resizeDirections: AnchorResizeVert,
          cursorType: PaneCursor.pointer,
          onDrop: props.onDrop,
          onContextMenu: props.onContextMenu
        })
      );
      this._renderer.append(this._tpRenderer);
    }
    if (props.sl) {
      this._slRenderer.setData({
        points: [ensure(slPoint)],
        color: props.sl.slColor,
        backgroundColor: this._model.backgroundColorAtYPercentFromTop(
          props.sl.slPrice / this._source.series.getPane().getHeight()
        ),
        text1: "SL",
        text2: props.sl.slText,
        rightEdge: this._source.timeScale().width(),
        onDrop: props.onDrop,
        onContextMenu: props.onContextMenu
      });
      this._slRenderer.setHitTest(
        new HitTestResult(HitTarget.ChangePoint, {
          areaName: AreaName.AnchorPoint,
          componentIndex: TradeLineBtns.sl,
          resizeDirections: AnchorResizeVert,
          cursorType: PaneCursor.pointer,
          onDrop: props.onDrop,
          onContextMenu: props.onContextMenu
        })
      );
      this._renderer.append(this._slRenderer);
    }
  }
  zOrder() {
    return this._model.currentActive === this._source || this._model.currentHovered === this._source ? "top" : "normal";
  }
}
class TradeLinePrimitive extends ToolPrimitive {
  constructor() {
    super(...arguments);
    __publicField(this, "_line", new TradeLinePaneView(this, this.model));
    __publicField(this, "_paneView", [this._line]);
    __publicField(this, "_priceAxisViews", [
      new PriceLabelPriceAxisView(/* @__PURE__ */ Object.create(null)),
      new PriceLabelPriceAxisView(/* @__PURE__ */ Object.create(null)),
      new PriceLabelPriceAxisView(/* @__PURE__ */ Object.create(null))
    ]);
    __publicField(this, "disableToolbar", true);
    __publicField(this, "disableDelete", true);
    __publicField(this, "_lastHoveredBtn", null);
  }
  pointsCount() {
    return 1;
  }
  updateHover(detail) {
    if (detail && detail.componentIndex) {
      this._lastHoveredBtn = detail.componentIndex;
    } else {
      this._lastHoveredBtn = null;
    }
    super.updateHover(detail);
  }
  hoveredBtn() {
    return this._lastHoveredBtn;
  }
  setPoint(index, point, details) {
    const { hitTestDetails } = details;
    const symbolInfo = this._ctx.chartService.symbolInfo();
    const lastPrice = this._ctx.chartService.mainSeriesApi.getLastPrice();
    const { series } = this;
    const priceBand = {
      get lower() {
        return Math.max(
          ensure(series.coordinateToPrice(series.getPane().getHeight())),
          lastPrice - lastPrice * (symbolInfo.ask_spread_ratio ?? Infinity)
        );
      },
      get upper() {
        return Math.min(
          lastPrice + lastPrice * (symbolInfo.bid_spread_ratio ?? Infinity),
          ensure(series.coordinateToPrice(0))
        );
      }
    };
    if (hitTestDetails.componentIndex === TradeLineBtns.tp) {
      if (this._props.tp) {
        const price = this._props.points[0].price;
        if (this._props.side === Side.Buy) {
          this._props.tp.tpPrice = roundByMinmov(
            clamp(point.price, price + symbolInfo.minmov, priceBand.upper),
            symbolInfo.minmov
          );
        } else {
          this._props.tp.tpPrice = roundByMinmov(
            clamp(point.price, price - symbolInfo.minmov, priceBand.lower),
            symbolInfo.minmov
          );
        }
        this.updateAllViews();
        this.requestUpdate();
      }
    }
    if (hitTestDetails.componentIndex === TradeLineBtns.sl) {
      if (this._props.sl) {
        if (this._props.side === Side.Buy) {
          this._props.sl.slPrice = roundByMinmov(
            clamp(
              point.price,
              this._props.points[0].price - symbolInfo.minmov * 3,
              priceBand.lower
            ),
            symbolInfo.minmov
          );
        } else {
          this._props.sl.slPrice = roundByMinmov(
            clamp(
              point.price,
              this._props.points[0].price + symbolInfo.minmov * 3,
              priceBand.upper
            ),
            symbolInfo.minmov
          );
        }
        this.updateAllViews();
        this.requestUpdate();
      }
    }
    if (hitTestDetails.componentIndex === TradeLineBtns.order) {
      this._props.points[0].price = roundByMinmov(
        clamp(point.price, priceBand.lower, priceBand.upper),
        symbolInfo.minmov
      );
    }
  }
  updateAllViews() {
    if (!this.controlPoints.length) return;
    const [p0] = this.controlPoints;
    const screenPoint = this.pointToScreenPoint(p0);
    if (!screenPoint) return;
    const points = [new AnchorPoint(screenPoint)];
    this._priceAxisViews[0].update({
      foreground: this._props.color,
      background: this.model.backgroundColorAtYPercentFromTop(
        screenPoint.y / this.series.getPane().getHeight()
      ),
      coordinate: screenPoint.y,
      text: this._ctx.priceLabelFormatter(p0.price),
      visible: true,
      border: this._props.color
    });
    const { tp, sl } = this._props;
    if (tp) {
      const y = ensure(this.series.priceToCoordinate(tp.tpPrice));
      this._priceAxisViews[1].update({
        foreground: tp.tpColor,
        background: this.model.backgroundColorAtYPercentFromTop(
          y / this.series.getPane().getHeight()
        ),
        coordinate: y,
        text: this._ctx.priceLabelFormatter(tp.tpPrice),
        visible: true,
        border: tp.tpColor
      });
      points.push(new AnchorPoint({ x: 0, y }));
    } else {
      this._priceAxisViews[1].update(/* @__PURE__ */ Object.create(null));
    }
    if (sl) {
      const y = ensure(this.series.priceToCoordinate(sl.slPrice));
      this._priceAxisViews[2].update({
        foreground: sl.slColor,
        background: this.model.backgroundColorAtYPercentFromTop(
          y / this.series.getPane().getHeight()
        ),
        coordinate: y,
        text: this._ctx.priceLabelFormatter(sl.slPrice),
        visible: true,
        border: sl.slColor
      });
      points.push(new AnchorPoint({ x: 0, y }));
    } else {
      this._priceAxisViews[2].update(/* @__PURE__ */ Object.create(null));
    }
    this._line.update({ points });
  }
}
class TradeLineTool extends DrawingTool {
  constructor() {
    super(...arguments);
    __publicField(this, "type", TradeLineToolType);
  }
  createPrimitive() {
    return NOTREACHED();
  }
  createPrimitiveWithPreset(chartService, paneIndex, props) {
    this._drawingSession = new DrawingSession(chartService, paneIndex, false);
    const pm = new TradeLinePrimitive(
      {
        id: this.id,
        ...props
      },
      ...this.resetArgs
    );
    pm.attach(this._drawingSession.getTargetSeries());
    return pm;
  }
}
function getKindKey(type, side, bracketOrder = false) {
  return type << 2 | (side === Side.Buy ? 1 : 0) << 1 | (bracketOrder ? 1 : 0);
}
var Colors = /* @__PURE__ */ ((Colors2) => {
  Colors2[Colors2["buy"] = 0] = "buy";
  Colors2[Colors2["sell"] = 1] = "sell";
  Colors2[Colors2["tp"] = 2] = "tp";
  Colors2[Colors2["sl"] = 3] = "sl";
  return Colors2;
})(Colors || {});
function getOrderKind(order) {
  const key = getKindKey(order.type, order.side, !!order.parentId);
  const orderKinds = {
    [getKindKey(OrderType.Limit, Side.Buy)]: {
      typeKey: "tool.tradeLine.buy",
      colorKey: 0
      /* buy */
    },
    [getKindKey(OrderType.Market, Side.Buy)]: {
      typeKey: "tool.tradeLine.buy",
      colorKey: 0
      /* buy */
    },
    [getKindKey(OrderType.Limit, Side.Sell)]: {
      typeKey: "tool.tradeLine.sell",
      colorKey: 1
      /* sell */
    },
    [getKindKey(OrderType.Market, Side.Sell)]: {
      typeKey: "tool.tradeLine.sell",
      colorKey: 1
      /* sell */
    },
    [getKindKey(OrderType.Stop, Side.Sell)]: {
      typeKey: "tool.tradeLine.sell",
      colorKey: 1
      /* sell */
    },
    [getKindKey(OrderType.Limit, Side.Sell, true)]: {
      typeKey: "tool.tradeLine.tp",
      colorKey: 2
      /* tp */
    },
    [getKindKey(OrderType.Limit, Side.Buy, true)]: {
      typeKey: "tool.tradeLine.tp",
      colorKey: 2
      /* tp */
    },
    [getKindKey(OrderType.Stop, Side.Sell, true)]: {
      typeKey: "tool.tradeLine.sl",
      colorKey: 3
      /* sl */
    },
    [getKindKey(OrderType.Stop, Side.Buy, true)]: {
      typeKey: "tool.tradeLine.sl",
      colorKey: 3
      /* sl */
    }
  };
  return orderKinds[key];
}
function getPositionKind(position) {
  return position.side === Side.Buy ? {
    typeKey: "tool.tradeLine.buy",
    colorKey: 0
    /* buy */
  } : {
    typeKey: "tool.tradeLine.sell",
    colorKey: 1
    /* sell */
  };
}
var root_4 = from_html(`<div class="itemLabel svelte-1dhrsg6"> </div>`);
var root_5 = from_html(`<div class="itemLabel svelte-1dhrsg6"> </div>`);
var root_3 = from_html(`<!> <!>`, 1);
var root_7 = from_html(`<div class="itemLabel svelte-1dhrsg6"> </div>`);
var root_8 = from_html(`<div class="itemLabel svelte-1dhrsg6"> </div>`);
var root_6 = from_html(`<!> <!>`, 1);
var root_2 = from_html(`<!> <!>`, 1);
var root_1 = from_html(`<div class="menu svelte-1dhrsg6"><!></div>`);
var root = from_html(`<div class="anchor svelte-1dhrsg6"><!></div>`);
const $$css = {
  hash: "svelte-1dhrsg6",
  code: ".anchor.svelte-1dhrsg6 {position:absolute;pointer-events:none;}.menu.svelte-1dhrsg6 {pointer-events:auto;padding:6px 0;cursor:default;height:100%;overflow-x:hidden;overflow-y:auto;overscroll-behavior:contain;background:var(--cl-listItem-background);}.menu.svelte-1dhrsg6::-webkit-scrollbar {-webkit-appearance:none;width:3px;height:3px;}.menu.svelte-1dhrsg6::-webkit-scrollbar-corner {display:none;}.menu.svelte-1dhrsg6::-webkit-scrollbar-thumb {background-clip:content-box;background-color:var(--cl-scrollbarThumb-background);border-radius:3px;}.menu.svelte-1dhrsg6::-webkit-scrollbar-track {background-color:initial;border-radius:3px;}.menu.svelte-1dhrsg6 .mdc-deprecated-list {margin:0;padding:0;list-style:none;}.menu.svelte-1dhrsg6 .item {height:32px;padding:0 20px 0 6px;display:flex;flex-flow:row nowrap;align-items:center;}\n@media (hover: hover) and (pointer: fine) {.menu.svelte-1dhrsg6 .item:hover {background-color:var(--cl-listItem-hoverBackground);}\n}.itemLabel.svelte-1dhrsg6 {font-size:14px;color:var(--cl-listItem-foreground);white-space:nowrap;flex:0 1 100%;padding-left:6px;cursor:default;user-select:none;}"
};
function Component($$anchor, $$props) {
  push($$props, true);
  append_styles($$anchor, $$css);
  const { t } = useTranslation();
  const tradeService = useService(ITradeService);
  let menuSurface;
  let anchorDimension = proxy({ top: "", left: "", width: "", height: "" });
  let info = proxy({ type: "", id: "" });
  const modifyOrder = () => {
    const order = tradeService.getOrderById(info.id);
    if (!order) return;
    tradeService.showOrderDialog(order);
  };
  const cancelOrder = () => {
    tradeService.showCancelOrderDialog(info.id);
  };
  const modifyPosition = () => {
    tradeService.showModifyPositionDialog(info.id);
  };
  const closePosition = () => {
    tradeService.showClosePositionDialog(info.id);
  };
  async function show(e) {
    const { anchor } = e;
    Object.assign(anchorDimension, {
      left: toPX(anchor.x),
      top: toPX(anchor.y),
      width: toPX(anchor.width),
      height: toPX(anchor.height)
    });
    Object.assign(info, { type: e.type, id: e.id });
    await tick();
    menuSurface.setOpen(true);
  }
  $$props.__registerComponent({ show });
  var div = root();
  var node = child(div);
  bind_this(
    Menu(node, {
      anchorCorner: "BOTTOM_RIGHT",
      quickOpen: true,
      children: ($$anchor2, $$slotProps) => {
        var div_1 = root_1();
        var node_1 = child(div_1);
        List(node_1, {
          children: ($$anchor3, $$slotProps2) => {
            var fragment = root_2();
            var node_2 = first_child(fragment);
            {
              var consequent = ($$anchor4) => {
                var fragment_1 = root_3();
                var node_3 = first_child(fragment_1);
                {
                  let $0 = user_derived(() => ifLeftClick(modifyOrder));
                  Item(node_3, {
                    tag: "div",
                    class: "item",
                    get onpointerup() {
                      return get($0);
                    },
                    children: ($$anchor5, $$slotProps3) => {
                      var div_2 = root_4();
                      var text = child(div_2);
                      template_effect(($02) => set_text(text, $02), [() => t("tradeLineMenu.modifyOrder")]);
                      append($$anchor5, div_2);
                    },
                    $$slots: { default: true }
                  });
                }
                var node_4 = sibling(node_3, 2);
                {
                  let $0 = user_derived(() => ifLeftClick(cancelOrder));
                  Item(node_4, {
                    tag: "div",
                    class: "item",
                    get onpointerup() {
                      return get($0);
                    },
                    children: ($$anchor5, $$slotProps3) => {
                      var div_3 = root_5();
                      var text_1 = child(div_3);
                      template_effect(($02) => set_text(text_1, $02), [() => t("tradeLineMenu.cancelOrder")]);
                      append($$anchor5, div_3);
                    },
                    $$slots: { default: true }
                  });
                }
                append($$anchor4, fragment_1);
              };
              if_block(node_2, ($$render) => {
                if (info.type === ParentType.Order) $$render(consequent);
              });
            }
            var node_5 = sibling(node_2, 2);
            {
              var consequent_1 = ($$anchor4) => {
                var fragment_2 = root_6();
                var node_6 = first_child(fragment_2);
                {
                  let $0 = user_derived(() => ifLeftClick(modifyPosition));
                  Item(node_6, {
                    tag: "div",
                    class: "item",
                    get onpointerup() {
                      return get($0);
                    },
                    children: ($$anchor5, $$slotProps3) => {
                      var div_4 = root_7();
                      var text_2 = child(div_4);
                      template_effect(($02) => set_text(text_2, $02), [() => t("tradeLineMenu.modifyPosition")]);
                      append($$anchor5, div_4);
                    },
                    $$slots: { default: true }
                  });
                }
                var node_7 = sibling(node_6, 2);
                {
                  let $0 = user_derived(() => ifLeftClick(closePosition));
                  Item(node_7, {
                    tag: "div",
                    class: "item",
                    get onpointerup() {
                      return get($0);
                    },
                    children: ($$anchor5, $$slotProps3) => {
                      var div_5 = root_8();
                      var text_3 = child(div_5);
                      template_effect(($02) => set_text(text_3, $02), [() => t("tradeLineMenu.closePosition")]);
                      append($$anchor5, div_5);
                    },
                    $$slots: { default: true }
                  });
                }
                append($$anchor4, fragment_2);
              };
              if_block(node_5, ($$render) => {
                if (info.type === ParentType.Position) $$render(consequent_1);
              });
            }
            append($$anchor3, fragment);
          },
          $$slots: { default: true }
        });
        append($$anchor2, div_1);
      },
      $$slots: { default: true }
    }),
    ($$value) => menuSurface = $$value,
    () => menuSurface
  );
  template_effect(($0) => set_style(div, $0), [
    () => Object.entries(anchorDimension).map(([name, value]) => `${name}: ${value};`).join(" ")
  ]);
  append($$anchor, div);
  return pop({ show });
}
var __defProp2 = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp2(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
class TradeLineInfoMap {
  constructor() {
    __publicField(this, "_primitiveToSource", /* @__PURE__ */ new Map());
    __publicField(this, "_orderToPrimitive", /* @__PURE__ */ new Map());
    __publicField(this, "_positionToPrimitive", /* @__PURE__ */ new Map());
    __publicField(this, "_orphanOrders", []);
  }
  getSource(id) {
    return this._primitiveToSource.get(id);
  }
  getPrimitiveId(source) {
    return source.type === ParentType.Order ? this._orderToPrimitive.get(source.id) : this._positionToPrimitive.get(source.id);
  }
  removeSource(source) {
    const primitiveId = this.getPrimitiveId(source);
    if (primitiveId) {
      this._primitiveToSource.delete(primitiveId);
    }
    if (source.type === ParentType.Order) {
      this._orderToPrimitive.delete(source.id);
      const idx = this._orphanOrders.findIndex((o) => o.id === source.id);
      if (idx > -1) {
        this._orphanOrders.splice(idx, 1);
      }
    } else {
      this._positionToPrimitive.delete(source.id);
    }
  }
  addPrimitiveId(primitiveId, source) {
    this._primitiveToSource.set(primitiveId, source);
    if (source.type === ParentType.Order) {
      this._orderToPrimitive.set(source.id, primitiveId);
    } else {
      this._positionToPrimitive.set(source.id, primitiveId);
    }
  }
  primitiveIds() {
    return this._primitiveToSource.keys();
  }
  addOrphanOrder(o) {
    this._orphanOrders.push(o);
  }
  getOrphanChildOrders(src) {
    return this._orphanOrders.filter((o) => o.parentId === src.id && o.parentType === src.type);
  }
  removeOrphanOrder(order) {
    const idx = this._orphanOrders.findIndex((o) => o.id === order.id);
    if (idx > -1) {
      this._orphanOrders.splice(idx, 1);
    }
  }
  clear() {
    this._primitiveToSource.clear();
    this._orderToPrimitive.clear();
    this._positionToPrimitive.clear();
  }
}
let TradeLineContrib = class extends Disposable {
  constructor(chartService, chartGuiService, tradeService, i18nService, configurationService) {
    super();
    __publicField(this, "_map", new TradeLineInfoMap());
    __publicField(this, "_menu", null);
    __publicField(this, "_onDrop", (e) => {
      if (!e.details.componentIndex) return;
      const pm = e.target;
      switch (e.details.componentIndex) {
        case TradeLineBtns.tp: {
          const src = this._map.getSource(e.target.id);
          if (!src) return;
          if (src.type === ParentType.Position) {
            const pos = this.tradeService.getPositionById(src.id);
            if (!pos) return;
            const modify = {
              symbol: pos.symbol,
              qty: pos.qty,
              type: OrderType.Limit,
              side: pos.side === Side.Buy ? Side.Sell : Side.Buy,
              price: ensure(pm.properties().tp).tpPrice,
              modifyId: pos.id,
              parentId: pos.id,
              parentType: ParentType.Position
            };
            this.tradeService.showOrderDialog(modify);
          } else {
            const order = this.tradeService.getOrderById(src.id);
            if (!order) return;
            const modify = {
              symbol: order.symbol,
              qty: order.qty,
              type: OrderType.Limit,
              side: order.side === Side.Buy ? Side.Sell : Side.Buy,
              price: ensure(pm.properties().tp).tpPrice,
              modifyId: order.id,
              parentId: order.id,
              parentType: ParentType.Order
            };
            this.tradeService.showOrderDialog(modify);
          }
          break;
        }
        case TradeLineBtns.sl: {
          const src = this._map.getSource(e.target.id);
          if (!src) return;
          if (src.type === ParentType.Position) {
            const pos = this.tradeService.getPositionById(src.id);
            if (!pos) return;
            const modify = {
              symbol: pos.symbol,
              qty: pos.qty,
              type: OrderType.Stop,
              side: pos.side === Side.Buy ? Side.Sell : Side.Buy,
              price: ensure(pm.properties().sl).slPrice,
              modifyId: pos.id,
              parentId: pos.id,
              parentType: ParentType.Position
            };
            this.tradeService.showOrderDialog(modify);
          } else {
            const order = this.tradeService.getOrderById(src.id);
            if (!order) return;
            const modify = {
              symbol: order.symbol,
              qty: order.qty,
              type: OrderType.Stop,
              side: order.side === Side.Buy ? Side.Sell : Side.Buy,
              price: ensure(pm.properties().tp).tpPrice,
              modifyId: order.id,
              parentId: order.id,
              parentType: ParentType.Order
            };
            this.tradeService.showOrderDialog(modify);
          }
          break;
        }
        case TradeLineBtns.order: {
          const src = this._map.getSource(e.target.id);
          if (!src) return;
          if (src.type !== ParentType.Order) return;
          const order = this.tradeService.getOrderById(src.id);
          if (!order) return;
          const modify = {
            ...order,
            price: pm.controlPoints[0].price,
            modifyId: order.id
          };
          this.tradeService.showOrderDialog(modify);
        }
      }
    });
    __publicField(this, "_onContextMenu", (e) => {
      const src = this._map.getSource(e.target.id);
      if (!src) return;
      this._showMenu({ anchor: { x: e.x, y: e.y, width: 1, height: 1 }, type: src.type, id: src.id });
    });
    this.chartService = chartService;
    this.chartGuiService = chartGuiService;
    this.tradeService = tradeService;
    this.i18nService = i18nService;
    this.configurationService = configurationService;
    this._register(
      chartService.onDataLoaded(() => {
        tradeService.orders().then((orders) => {
          orders.forEach((o) => this._handleOrderUpdate(o));
        });
        tradeService.positions().then((positions) => {
          positions.forEach((pos) => this._handlePositionUpdate(pos));
        });
      })
    );
    this._register(
      chartService.onSymbolChanged(() => {
        this._map.primitiveIds().forEach((primitiveId) => {
          this.chartService.getController().detachToolPrimitiveById(primitiveId);
        });
        this._map.clear();
      })
    );
    this._register(tradeService.onOrderUpdated((order) => this._handleOrderUpdate(order)));
    this._register(
      tradeService.onPositionUpdated((e) => {
        this._handlePositionUpdate(e.position);
      })
    );
    this._register(
      chartService.onPositionsAndOrdersVisibility((visible) => {
        this._map.primitiveIds().forEach((shapeId) => {
          var _a;
          (_a = this.chartService.getController().getToolPrimitiveById(shapeId)) == null ? void 0 : _a.updateProps({ visible });
        });
      })
    );
  }
  async _handleOrderUpdate(order) {
    const src = {
      type: ParentType.Order,
      id: order.id
    };
    if (order.status === OrderStatus.Canceled || order.status === OrderStatus.Filled) {
      this._removeOrder(order, src);
      return;
    }
    if (isBracketOrder(order)) {
      this._updateChildOrderOrCreateOrphanOrder(order, src);
    } else {
      this._updateOrCreateOrder(order, src);
    }
  }
  _removeOrder(order, src) {
    const primitiveId = this._map.getPrimitiveId(src);
    if (primitiveId) {
      this.chartService.getController().detachToolPrimitiveById(primitiveId);
      this._map.removeSource(src);
    }
    if (isBracketOrder(order)) {
      const isTp = isTakeProfitOrder(order);
      if (isTp) {
        const primitiveId2 = this._map.getPrimitiveId({
          type: ParentType.Order,
          id: order.parentId
        });
        if (primitiveId2) {
          const primitive = this.chartService.getController().getToolPrimitiveById(primitiveId2);
          primitive == null ? void 0 : primitive.updateProps(isTp ? { tp: void 0 } : { sl: void 0 });
        }
      }
    }
  }
  async _updateOrCreateOrder(order, src) {
    const price = order.price ?? this.chartService.mainSeriesApi.getLastPrice();
    const primitiveId = this._map.getPrimitiveId(src);
    if (primitiveId) {
      const primitive = ensure(
        this.chartService.getController().getToolPrimitiveById(primitiveId)
      );
      const props = {
        points: [{ time: 0, price }],
        amountText: this.i18nService.formatNumber(order.qty),
        pnl: order.pnlText ? {
          pnlText: order.pnlText,
          pnlColor: ensure(order.pnl) >= 0 ? this._buyColor() : this._sellColor()
        } : void 0,
        tp: order.takeProfitPrice ? {
          tpPrice: order.takeProfitPrice,
          tpText: ensure(order.takeProfitPnl),
          tpColor: this._tpColor()
        } : void 0,
        sl: order.stopLossPrice ? {
          slPrice: order.stopLossPrice,
          slText: ensure(order.stopLossPnl),
          slColor: this._slColor()
        } : void 0
      };
      this._adoptOrphanOrder(props, src);
      primitive.updateProps(props);
      return;
    } else {
      this._createOrder(order, src);
    }
  }
  _createOrder(order, src) {
    const price = order.price ?? this.chartService.mainSeriesApi.getLastPrice();
    const { typeKey, colorKey } = getOrderKind(order);
    const props = {
      points: [{ time: 0, price }],
      color: this._getColor(colorKey),
      typeText: this.i18nService.t(ensure(typeKey)),
      amountText: this.i18nService.formatNumber(order.qty),
      leverageText: order.leverage ? `${order.leverage}X` : "",
      onDrop: this._onDrop,
      onContextMenu: this._onContextMenu,
      side: order.side,
      type: "order",
      visible: true,
      pnl: order.pnlText ? {
        pnlText: order.pnlText,
        pnlColor: ensure(order.pnl) >= 0 ? this._buyColor() : this._sellColor()
      } : void 0,
      tp: order.takeProfitPrice ? {
        tpPrice: order.takeProfitPrice,
        tpText: ensure(order.takeProfitPnl),
        tpColor: this._tpColor()
      } : void 0,
      sl: order.stopLossPrice ? {
        slPrice: order.stopLossPrice,
        slText: ensure(order.stopLossPnl),
        slColor: this._slColor()
      } : void 0
    };
    this._adoptOrphanOrder(props, src);
    const id = this._createPrimitive(props);
    should(id);
    this._map.addPrimitiveId(id, src);
  }
  async _updateChildOrderOrCreateOrphanOrder(order, src) {
    const primitiveId = this._map.getPrimitiveId({ type: order.parentType, id: order.parentId });
    if (primitiveId) {
      const isTp = isTakeProfitOrder(order);
      const primitive = this.chartService.getController().getToolPrimitiveById(primitiveId);
      ensure(primitive).updateProps(
        isTp ? {
          tp: {
            tpColor: this._tpColor(),
            tpPrice: ensure(order.price),
            tpText: "1000"
          }
        } : {
          sl: {
            slColor: this._slColor(),
            slPrice: ensure(order.price),
            slText: "1000"
          }
        }
      );
    } else {
      this._createOrphanOrder(order, src);
    }
  }
  _createOrphanOrder(order, src) {
    should(isBracketOrder(order));
    this._createOrder(order, src);
    this._map.addOrphanOrder(order);
  }
  _adoptOrphanOrder(props, src) {
    const o = this._map.getOrphanChildOrders(src);
    if (o.length) {
      const tp = o.find((o2) => o2.side === Side.Buy);
      if (tp) {
        props.tp = {
          tpPrice: ensure(tp.price),
          tpColor: this._tpColor(),
          tpText: "xxxxxx"
        };
        this._removeOrphanOrder(tp);
      }
      const sl = o.find((o2) => o2.side === Side.Sell);
      if (sl) {
        props.sl = {
          slPrice: ensure(sl.price),
          slColor: this._slColor(),
          slText: "xxxxx"
        };
        this._removeOrphanOrder(sl);
      }
    }
  }
  _removeOrphanOrder(order) {
    this._map.removeOrphanOrder(order);
    const src = {
      type: ParentType.Order,
      id: order.id
    };
    const primitiveId = this._map.getPrimitiveId(src);
    if (primitiveId) {
      this.chartService.getController().detachToolPrimitiveById(primitiveId);
      this._map.removeSource(src);
    }
  }
  async _handlePositionUpdate(position) {
    const src = {
      type: ParentType.Position,
      id: position.id
    };
    if (position.qty === 0) {
      this._removePosition(src);
      return;
    }
    this._updateOrCreatePosition(position, src);
  }
  async _removePosition(src) {
    const primitiveId = this._map.getPrimitiveId(src);
    if (primitiveId) {
      this.chartService.getController().detachToolPrimitiveById(primitiveId);
      this._map.removeSource(src);
    }
  }
  async _updateOrCreatePosition(position, src) {
    const shapeId = this._map.getPrimitiveId(src);
    if (shapeId) {
      const primitive = this.chartService.getController().getToolPrimitiveById(shapeId);
      if (primitive) {
        const props = {
          pnl: {
            pnlText: position.pnlText,
            pnlColor: position.pnl > 0 ? this._buyColor() : this._sellColor()
          },
          tp: position.takeProfitPrice ? {
            tpPrice: position.takeProfitPrice,
            tpText: ensure(position.takeProfitPnl),
            tpColor: this._tpColor()
          } : void 0,
          sl: position.stopLossPrice ? {
            slPrice: position.stopLossPrice,
            slText: ensure(position.stopLossPnl),
            slColor: this._slColor()
          } : void 0
        };
        this._adoptOrphanOrder(props, src);
        primitive.updateProps(props);
        return;
      }
    } else {
      this._createPosition(position, src);
    }
  }
  async _createPosition(position, src) {
    const { colorKey, typeKey } = getPositionKind(position);
    const color = this._getColor(colorKey);
    const props = {
      points: [{ time: 0, price: position.avgPrice }],
      color,
      visible: true,
      typeText: this.i18nService.t(typeKey),
      amountText: this.i18nService.formatNumber(position.qty),
      leverageText: position.leverage ? `${position.leverage}X` : "",
      pnl: position.pnlText ? {
        pnlText: position.pnlText,
        pnlColor: color
      } : void 0,
      side: position.side,
      type: "position",
      onDrop: this._onDrop,
      onContextMenu: this._onContextMenu
    };
    this._adoptOrphanOrder(props, src);
    const id = this._createPrimitive(props);
    should(id);
    this._map.addPrimitiveId(id, src);
  }
  async _showMenu(props) {
    if (!this._menu) {
      this._register(
        this._menu = this.chartGuiService.showComponent({
          Component,
          props: /* @__PURE__ */ Object.create(null)
        })
      );
      await this._menu.mounted;
    }
    this._menu.getInstance().show(props);
  }
  _createPrimitive(props) {
    const pm = new TradeLineTool().createPrimitiveWithPreset(this.chartService, 0, props);
    this.chartService.getController().attachToolPrimitive(pm, false);
    return pm.id;
  }
  _getColor(key) {
    switch (key) {
      case Colors.sl:
        return this._slColor();
      case Colors.buy:
        return this._buyColor();
      case Colors.tp:
        return this._tpColor();
      case Colors.sell:
        return this._sellColor();
      default:
        NOTREACHED();
    }
  }
  _buyColor() {
    return this.configurationService.getValue("chartProperties")["tool.tradeLine.buyColor"];
  }
  _sellColor() {
    return this.configurationService.getValue("chartProperties")["tool.tradeLine.sellColor"];
  }
  _tpColor() {
    return this.configurationService.getValue("chartProperties")["tool.tradeLine.tpColor"];
  }
  _slColor() {
    return this.configurationService.getValue("chartProperties")["tool.tradeLine.slColor"];
  }
};
__decorateClass([
  memoize
], TradeLineContrib.prototype, "_buyColor", 1);
__decorateClass([
  memoize
], TradeLineContrib.prototype, "_sellColor", 1);
__decorateClass([
  memoize
], TradeLineContrib.prototype, "_tpColor", 1);
__decorateClass([
  memoize
], TradeLineContrib.prototype, "_slColor", 1);
TradeLineContrib = __decorateClass([
  __decorateParam(0, IChartService),
  __decorateParam(1, IChartGuiService),
  __decorateParam(2, ITradeService),
  __decorateParam(3, IIntlService),
  __decorateParam(4, IConfigurationService)
], TradeLineContrib);
export {
  TradeLineContrib
};
