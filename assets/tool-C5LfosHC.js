var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { u as Point, A as AnchorPoint, bL as AnchorStyle, J as AnchorResizeVert, G as PaneCursor, L as LineStyleType } from "./index-NZHt9VGv.js";
import { T as ToolPaneView, a as ToolPrimitive, D as DrawingTool } from "./toolPaneView-3wj_on-u.js";
import { j as DisjointChannelToolType } from "./index-TSHQCVD9.js";
import { P as PriceLabelPriceAxisView } from "./priceLabelPriceAxisView-d9Maj5lR.js";
import { T as TimeLabelTimeAxisView } from "./timeLabelTimeAxisView-BvW_UnA0.js";
import { P as PriceRangeAxisPaneView, T as TimeRangeAxisPaneView } from "./axisPaneView-Pbgdotf1.js";
import { C as CompositeRenderer } from "./composite-tvPrNHN0.js";
import { D as DisjointChannelRenderer } from "./disjointChannel-IMufcE0X.js";
import { L as LineRenderer } from "./line-DFhYRKvt.js";
import "./baseTool-CHlzZht2.js";
import "./parallelChannel-BQ9r7eMy.js";
import "./line-DZhB7Jxo.js";
class DisjointChannelPaneView extends ToolPaneView {
  constructor() {
    super(...arguments);
    // 渲染器组件初始化
    __publicField(this, "_trendLineRendererPoints12", new LineRenderer());
    // AB主线
    __publicField(this, "_trendLineRendererPoints43", new LineRenderer());
    // CD延申线（虚拟）
    __publicField(this, "_disjointChannelRenderer", new DisjointChannelRenderer());
    // 区域填充通道
    // 标签渲染器
    // _p1LabelRenderer = new BaseTextRenderer();
    // _p2LabelRenderer = new BaseTextRenderer();
    // _p3LabelRenderer = new BaseTextRenderer();
    // _p4LabelRenderer = new BaseTextRenderer();
    // _labelTextRenderer = new BaseTextRenderer();
    // 总渲染器
    __publicField(this, "_renderer", new CompositeRenderer(this._hitTestCollector));
  }
  renderer() {
    return this._renderer;
  }
  /**
   * 核心绘图逻辑
   */
  _updateImpl() {
    this._renderer.clear();
    const points = this.points();
    if ((points == null ? void 0 : points.length) < 2) return;
    const props = this._source.properties();
    const [screenPt1, screenPt2] = points;
    let screenPt3, screenPt4;
    if (points.length >= 3) {
      screenPt3 = new Point(screenPt2.x, points[2].y);
      const h = screenPt2.y - screenPt1.y;
      screenPt4 = new Point(screenPt1.x, screenPt3.y + h);
      if (props.fillBackground) {
        this._disjointChannelRenderer.setData({
          extendleft: !!props.extendLeft,
          extendright: !!props.extendRight,
          points: [screenPt1, screenPt2, screenPt3, screenPt4],
          fillBackground: true,
          backcolor: props.background
          // hittestOnBackground: isMobileDevice(),
        });
        this._renderer.append(this._disjointChannelRenderer);
      }
    }
    this._trendLineRendererPoints12.setData(this._createLineStyle(screenPt1, screenPt2, props));
    this._renderer.append(this._trendLineRendererPoints12);
    if (screenPt3 && screenPt4) {
      this._trendLineRendererPoints43.setData(this._createLineStyle(screenPt4, screenPt3, props));
      this._renderer.append(this._trendLineRendererPoints43);
    }
    const anchors = [screenPt1, screenPt2];
    if (screenPt3) {
      anchors.push(
        new AnchorPoint(screenPt3, {
          pointIndex: 2,
          cursorType: PaneCursor.ns,
          resizeDirections: AnchorResizeVert,
          style: AnchorStyle.square
        })
      );
    }
    if (screenPt4) {
      anchors.push(new AnchorPoint(screenPt4, { pointIndex: 3 }));
    }
    if (this._model.currentCreating === this._source) anchors.pop();
    this._renderer.append(this.createLineAnchor({ points: anchors }, 0));
  }
  /**
   * 公共构造趋势线渲染样式
   */
  _createLineStyle(p1, p2, props) {
    return {
      points: [p1, p2],
      lineColor: props.lineColor,
      lineWidth: props.lineWidth,
      lineStyle: props.lineStyle,
      extendLeft: props.extendLeft,
      extendRight: props.extendRight,
      leftEnd: props.leftEnd,
      rightEnd: props.rightEnd
    };
  }
  /**
   * 绘制某对点的价格标签
   */
  // _renderPriceLabels(
  //   label1: TextRenderer,
  //   label2: TextRenderer,
  //   pt1: Point,
  //   pt2: Point,
  //   price1: string,
  //   price2: string,
  //   props: any,
  // ) {
  //   if (!props.showPrices.value()) return;
  //
  //   const commonStyle = {
  //     color: props.textcolor.value(),
  //     font: CHART_FONT_FAMILY,
  //     offsetX: 6,
  //     offsetY: 0,
  //     boxPadding: 0,
  //     bold: props.bold.value(),
  //     italic: props.italic.value(),
  //     fontsize: props.fontsize.value(),
  //     forceTextAlign: true,
  //     vertAlign: VerticalAlign.Middle,
  //   };
  //
  //   label1.setData({
  //     points: [pt1],
  //     text: price1,
  //     horzAlign: pt1.x > pt2.x ? HorizontalAlign.Left : HorizontalAlign.Right,
  //     ...commonStyle,
  //   });
  //   label2.setData({
  //     points: [pt2],
  //     text: price2,
  //     horzAlign: pt1.x < pt2.x ? HorizontalAlign.Left : HorizontalAlign.Right,
  //     ...commonStyle,
  //   });
  //
  //   this._renderer.append(label1);
  //   this._renderer.append(label2);
  // }
  /**
   * 构造 labelText 的坐标与显示
   */
  // _getLabelTextRenderer(p1, p2, p4, p3) {
  //   const props = this._source.properties().childs();
  //   const fontSize = props.labelFontSize.value();
  //   const padding = fontSize / 3;
  //
  //   let pointFrom,
  //     pointTo,
  //     boxPadding = 0;
  //
  //   switch (props.labelVertAlign.value()) {
  //     case VerticalAlign.Top:
  //       [pointFrom, pointTo] = p1.y > p4.y ? [p1, p2] : [p4, p3];
  //       break;
  //     case VerticalAlign.Bottom:
  //       [pointFrom, pointTo] = p1.y < p4.y ? [p1, p2] : [p4, p3];
  //       break;
  //     case VerticalAlign.Middle:
  //     default:
  //       pointFrom = p1.add(p4).scaled(0.5);
  //       pointTo = p2.add(p3).scaled(0.5);
  //       boxPadding = padding;
  //   }
  //
  //   const left = pointFrom.x < pointTo.x ? pointFrom : pointTo;
  //   const right = left === pointFrom ? pointTo : pointFrom;
  //   let labelPos;
  //
  //   switch (props.labelHorzAlign.value()) {
  //     case HorizontalAlign.Left:
  //       labelPos = left;
  //       break;
  //     case HorizontalAlign.Right:
  //       labelPos = right;
  //       break;
  //     default:
  //       labelPos = left.add(right).scaled(0.5);
  //   }
  //
  //   const angle = Math.atan((left.y - right.y) / (left.x - right.x));
  //
  //   this._labelTextRenderer.setData({
  //     points: [labelPos],
  //     color: props.labelTextColor.value(),
  //     fontSize: props.labelFontSize.value(),
  //     text: props.labelText.value(),
  //     font: CHART_FONT_FAMILY,
  //     bold: props.labelBold.value(),
  //     italic: props.labelItalic.value(),
  //     vertAlign: props.labelVertAlign.value(),
  //     horzAlign: props.labelHorzAlign.value(),
  //     offsetX: 0,
  //     offsetY: 0,
  //     boxPaddingVert: padding,
  //     boxPaddingHorz: boxPadding,
  //     forceTextAlign: true,
  //     angle: angle,
  //   });
  //
  //   return this._labelTextRenderer;
  // }
}
class DisjointChannelPrimitive extends ToolPrimitive {
  constructor() {
    super(...arguments);
    __publicField(this, "_lines", new DisjointChannelPaneView(this, this.model));
    __publicField(this, "_paneView", [this._lines]);
    __publicField(this, "_priceAxisPaneViews", [new PriceRangeAxisPaneView(/* @__PURE__ */ Object.create(null))]);
    __publicField(this, "_timeAxisPaneViews", [new TimeRangeAxisPaneView(/* @__PURE__ */ Object.create(null))]);
    __publicField(this, "_timeAxisViews", [
      new TimeLabelTimeAxisView(/* @__PURE__ */ Object.create(null)),
      new TimeLabelTimeAxisView(/* @__PURE__ */ Object.create(null)),
      new TimeLabelTimeAxisView(/* @__PURE__ */ Object.create(null))
    ]);
    __publicField(this, "_priceAxisViews", [
      new PriceLabelPriceAxisView(/* @__PURE__ */ Object.create(null)),
      new PriceLabelPriceAxisView(/* @__PURE__ */ Object.create(null)),
      new PriceLabelPriceAxisView(/* @__PURE__ */ Object.create(null))
    ]);
  }
  pointsCount() {
    return 3;
  }
  setPoint(pointIndex, point, details) {
    const midPrice = 0.5 * (this.controlPoints[1].price + this.controlPoints[2].price);
    if (pointIndex < 3) {
      super.setPoint(pointIndex, point, details);
    }
    if (pointIndex !== 0 && pointIndex !== 2) {
      if (pointIndex === 1) {
        const delta = this.controlPoints[1].price - midPrice;
        this.controlPoints[2].price = this.controlPoints[1].price - 2 * delta;
      } else if (pointIndex === 3) {
        const delta = point.price - this.controlPoints[2].price;
        this.controlPoints[0].price = this.controlPoints[1].price - delta;
        this.controlPoints[0].time = point.time;
      }
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
    this._lines.update({ points });
  }
}
class DisjointChannelTool extends DrawingTool {
  constructor() {
    super(...arguments);
    __publicField(this, "type", DisjointChannelToolType);
  }
  createPrimitive() {
    return new DisjointChannelPrimitive(
      {
        id: this.id,
        points: [],
        lineColor: "#089981FF",
        lineWidth: 2,
        lineStyle: LineStyleType.solid,
        fillBackground: true,
        background: "#08998133"
      },
      ...this.resetArgs
    );
  }
}
export {
  DisjointChannelTool
};
