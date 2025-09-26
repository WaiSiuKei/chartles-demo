var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { u as Point, y as HitTestResult, z as HitTarget, A as AnchorPoint, bL as AnchorStyle, J as AnchorResizeVert, e as ensure, L as LineStyleType } from "./index-DSkroicZ.js";
import { T as ToolPaneView, a as ToolPrimitive, D as DrawingTool } from "./toolPaneView-BAEHHn7m.js";
import { l as coeffs, n as ParallelChannelToolType } from "./index-DNbtFiKr.js";
import { P as PriceLabelPriceAxisView } from "./priceLabelPriceAxisView-d9Maj5lR.js";
import { T as TimeLabelTimeAxisView } from "./timeLabelTimeAxisView-BvW_UnA0.js";
import { P as PriceRangeAxisPaneView, T as TimeRangeAxisPaneView } from "./axisPaneView-Pbgdotf1.js";
import { C as CompositeRenderer } from "./composite-BOGQNAfc.js";
import { P as ParallelChannelRenderer } from "./parallelChannel-Cc0CK6jv.js";
import "./baseTool-BVX9dcKc.js";
import "./line-tUhOmrMF.js";
class ParallelChannelPaneView extends ToolPaneView {
  constructor() {
    super(...arguments);
    __publicField(this, "_channelRenderers", Array.from({ length: coeffs.length - 1 }).map(
      () => new ParallelChannelRenderer()
    ));
    __publicField(this, "_renderer", new CompositeRenderer(this._hitTestCollector));
  }
  // _labelTextRenderer = new _.TextRenderer
  renderer() {
    return this._renderer;
  }
  _updateImpl() {
    this._renderer.clear();
    const points = this.points();
    if ((points == null ? void 0 : points.length) <= 1) return;
    const props = this._source.properties();
    const point1 = points[0];
    const point2 = points[1];
    let channelHeight = 0, thirdPoint1 = null, thirdPoint2 = null;
    if (points.length === 3) {
      channelHeight = points[2].y - points[0].y;
      thirdPoint1 = point1.add(new Point(0, channelHeight));
      thirdPoint2 = point2.add(new Point(0, channelHeight));
    }
    const levels = props.levels.filter((l) => l.visible);
    if (levels.length === 1) {
      levels.push(levels[0]);
    }
    if (this._channelRenderers.length !== levels.length - 1) {
      this._channelRenderers = Array.from({ length: levels.length - 1 }).map(() => {
        const renderer = new ParallelChannelRenderer();
        renderer.setHitTest(new HitTestResult(HitTarget.MovePoint));
        return renderer;
      });
    }
    const channelSegments = [];
    const backgroundColor = props.backgroundColor;
    for (let i = 0; i < levels.length - 1; i++) {
      const level1 = levels[i];
      const level2 = levels[i + 1];
      let topLeft = point1;
      let topRight = point2;
      let bottomLeft = point1;
      let bottomRight = point2;
      if (points.length === 3) {
        const offset1 = channelHeight * level1.coeff;
        const offset2 = channelHeight * level2.coeff;
        topLeft = point1.add(new Point(0, offset1));
        topRight = point2.add(new Point(0, offset1));
        bottomLeft = point1.add(new Point(0, offset2));
        bottomRight = point2.add(new Point(0, offset2));
      }
      const channel = {
        line1: {
          color: level1.lineColor,
          lineStyle: level1.lineStyle,
          lineWidth: level1.lineWidth,
          points: [topLeft, topRight]
        },
        line2: bottomLeft && bottomRight ? {
          color: level2.lineColor,
          lineStyle: level2.lineStyle,
          lineWidth: level2.lineWidth,
          points: [bottomLeft, bottomRight]
        } : void 0,
        skipTopLine: i !== levels.length - 2,
        extendLeft: props.extendLeft,
        extendRight: props.extendRight,
        fillBackground: props.fillBackground,
        backColor: backgroundColor,
        hittestOnBackground: true
      };
      channelSegments.push(channel);
    }
    channelSegments.forEach((data, idx) => {
      this._channelRenderers[idx].setData(data);
      this._renderer.append(this._channelRenderers[idx]);
    });
    const anchorPoints = [];
    if (point1) {
      anchorPoints.push(point1);
    }
    if (point2) {
      anchorPoints.push(point2);
    }
    if (thirdPoint1 && thirdPoint2) {
      anchorPoints.push(new AnchorPoint(thirdPoint1, { pointIndex: 2 }));
      anchorPoints.push(new AnchorPoint(thirdPoint2, { pointIndex: 3 }));
      const centerPoint = thirdPoint1.add(thirdPoint2).scaled(0.5);
      anchorPoints.push(
        new AnchorPoint(centerPoint, {
          pointIndex: 4,
          resizeDirections: AnchorResizeVert,
          style: AnchorStyle.square
        })
      );
      const middle = anchorPoints[0].point.add(anchorPoints[1].point).scaled(0.5);
      anchorPoints.push(
        new AnchorPoint(middle, {
          pointIndex: 5,
          resizeDirections: AnchorResizeVert,
          style: AnchorStyle.square
        })
      );
    }
    const isThirdPointExpectedButMissing = points.length === 3 && !thirdPoint1;
    if (this._model.currentCreating === this._source || isThirdPointExpectedButMissing) {
      anchorPoints.pop();
      anchorPoints.pop();
    }
    this._renderer.append(this.createLineAnchor({ points: anchorPoints }, 0));
  }
}
class ParallelChannelPrimitive extends ToolPrimitive {
  constructor() {
    super(...arguments);
    __publicField(this, "_lines", new ParallelChannelPaneView(this, this.model));
    __publicField(this, "_paneView", [this._lines]);
    __publicField(this, "_priceAxisPaneViews", [new PriceRangeAxisPaneView(/* @__PURE__ */ Object.create(null))]);
    __publicField(this, "_timeAxisPaneViews", [new TimeRangeAxisPaneView(/* @__PURE__ */ Object.create(null))]);
    __publicField(this, "_timeAxisViews", [
      new TimeLabelTimeAxisView(/* @__PURE__ */ Object.create(null)),
      new TimeLabelTimeAxisView(/* @__PURE__ */ Object.create(null)),
      new TimeLabelTimeAxisView(/* @__PURE__ */ Object.create(null)),
      new TimeLabelTimeAxisView(/* @__PURE__ */ Object.create(null))
    ]);
    __publicField(this, "_priceAxisViews", [
      new PriceLabelPriceAxisView(/* @__PURE__ */ Object.create(null)),
      new PriceLabelPriceAxisView(/* @__PURE__ */ Object.create(null)),
      new PriceLabelPriceAxisView(/* @__PURE__ */ Object.create(null)),
      new PriceLabelPriceAxisView(/* @__PURE__ */ Object.create(null))
    ]);
  }
  pointsCount() {
    return 3;
  }
  setPoint(index, point, details) {
    switch (index) {
      case 0: {
        super.setPoint(index, point, details);
        this._props.points[2] = {
          time: details.startPoints[2].time + details.deltaTime,
          price: details.startPoints[2].price + details.deltaPrice
        };
        break;
      }
      case 1: {
        super.setPoint(index, point, details);
        break;
      }
      case 2: {
        super.setPoint(index, point, details);
        this._props.points[0] = {
          time: details.startPoints[0].time + details.deltaTime,
          price: details.startPoints[0].price + details.deltaPrice
        };
        break;
      }
      case 3: {
        this._props.points[1] = {
          time: details.startPoints[1].time + details.deltaTime,
          price: details.startPoints[1].price + details.deltaPrice
        };
        break;
      }
      case 4: {
        this._props.points[2].price = details.startPoints[2].price + details.deltaPrice;
        break;
      }
      case 5: {
        this._props.points[0].price = details.startPoints[0].price + details.deltaPrice;
        this._props.points[1].price = details.startPoints[1].price + details.deltaPrice;
        break;
      }
    }
  }
  addPoint(point, step) {
    if (step === 2) {
      point = this._convertLastPointTo3rdPoint(point);
    }
    return super.addPoint(point, step);
  }
  _convertLastPointTo3rdPoint(lastPoint) {
    const screenLastPoint = ensure(this.pointToScreenPoint(lastPoint));
    const screenPoint2 = ensure(this.pointToScreenPoint(this.controlPoints[1]));
    const screenPoint1 = ensure(this.pointToScreenPoint(this.controlPoints[0]));
    const direction = screenPoint2.subtract(screenPoint1);
    const projectionRatio = (screenLastPoint.x - screenPoint1.x) / direction.x;
    const projectedPoint = screenPoint1.addScaled(direction, projectionRatio);
    const verticalOffset = screenLastPoint.y - projectedPoint.y;
    const offsetScreenPoint = screenPoint1.add(new Point(0, verticalOffset));
    return ensure(this.screenPointToPoint(offsetScreenPoint));
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
class ParallelChannelTool extends DrawingTool {
  constructor() {
    super(...arguments);
    __publicField(this, "type", ParallelChannelToolType);
  }
  createPrimitive() {
    return new ParallelChannelPrimitive(
      {
        id: this.id,
        points: [],
        lineColor: "#2A62FF",
        lineStyle: LineStyleType.solid,
        lineWidth: 2,
        fillBackground: true,
        backgroundColor: "#2962FF33",
        extendLeft: false,
        extendRight: false,
        levels: coeffs.map((c, i) => ({
          lineColor: "#2A62FF",
          visible: [1, 3, 5].includes(i),
          coeff: c,
          lineStyle: 3 === i ? LineStyleType.dashed : LineStyleType.solid,
          lineWidth: [1, 5].includes(i) ? 2 : 1
        }))
      },
      ...this.resetArgs
    );
  }
}
export {
  ParallelChannelTool
};
