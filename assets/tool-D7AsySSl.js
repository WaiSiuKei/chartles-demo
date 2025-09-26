var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { G as PaneCursor, A as AnchorPoint, u as Point, bL as AnchorStyle, cs as AnchorResizeHorz, J as AnchorResizeVert, L as LineStyleType } from "./index-NZHt9VGv.js";
import { T as ToolPaneView, a as ToolPrimitive, D as DrawingTool } from "./toolPaneView-3wj_on-u.js";
import { ao as RectangleToolType } from "./index-TSHQCVD9.js";
import { P as PriceLabelPriceAxisView } from "./priceLabelPriceAxisView-d9Maj5lR.js";
import { T as TimeLabelTimeAxisView } from "./timeLabelTimeAxisView-BvW_UnA0.js";
import { P as PriceRangeAxisPaneView, T as TimeRangeAxisPaneView } from "./axisPaneView-Pbgdotf1.js";
import { C as CompositeRenderer } from "./composite-tvPrNHN0.js";
import { R as RectangleRenderer } from "./rectangle-CfXWJsDB.js";
import "./baseTool-CHlzZht2.js";
class RectanglePaneView extends ToolPaneView {
  constructor() {
    super(...arguments);
    __publicField(this, "_renderer", new CompositeRenderer(this._hitTestCollector));
    __publicField(this, "_rectangleRenderer", new RectangleRenderer());
  }
  renderer() {
    return this._renderer;
  }
  _updateImpl() {
    this._renderer.clear();
    if (this.points().length < 2) {
      return;
    }
    const props = this._source.properties();
    const extendLeft = props.extendLeft;
    const extendRight = props.extendRight;
    const rectangleData = {
      points: this.points(),
      // 左上 & 右下角点
      color: props.color,
      lineWidth: props.lineWidth,
      lineStyle: props.lineStyle,
      backColor: props.backColor,
      extendLeft,
      extendRight
    };
    this._renderer.append(this._rectangleRenderer);
    this._rectangleRenderer.setData(rectangleData);
    this._addAnchors();
  }
  _addAnchors() {
    const [topLeft, bottomRight] = this.points();
    const dx = topLeft.x - bottomRight.x;
    const dy = topLeft.y - bottomRight.y;
    const direction = Math.sign(dx * dy);
    const diagonalCursor1 = direction < 0 ? PaneCursor.nesw : PaneCursor.nwse;
    const diagonalCursor2 = direction < 0 ? PaneCursor.nwse : PaneCursor.nesw;
    const anchorPoints = [
      // 左上
      new AnchorPoint(topLeft, { pointIndex: 0, cursorType: diagonalCursor1 }),
      // 右下
      new AnchorPoint(bottomRight, { pointIndex: 1, cursorType: diagonalCursor1 }),
      // 左下
      new AnchorPoint(new Point(topLeft.x, bottomRight.y), {
        pointIndex: 2,
        cursorType: diagonalCursor2
      }),
      // 右上
      new AnchorPoint(new Point(bottomRight.x, topLeft.y), {
        pointIndex: 3,
        cursorType: diagonalCursor2
      }),
      // 左右边中点
      new AnchorPoint(new Point(topLeft.x, (topLeft.y + bottomRight.y) / 2), {
        pointIndex: 4,
        resizeDirections: AnchorResizeHorz,
        style: AnchorStyle.square
      }),
      new AnchorPoint(new Point(bottomRight.x, (topLeft.y + bottomRight.y) / 2), {
        pointIndex: 5,
        resizeDirections: AnchorResizeHorz,
        style: AnchorStyle.square
      }),
      // 上下边中点
      new AnchorPoint(new Point((topLeft.x + bottomRight.x) / 2, topLeft.y), {
        pointIndex: 6,
        resizeDirections: AnchorResizeVert,
        style: AnchorStyle.square
      }),
      new AnchorPoint(new Point((topLeft.x + bottomRight.x) / 2, bottomRight.y), {
        pointIndex: 7,
        resizeDirections: AnchorResizeVert,
        style: AnchorStyle.square
      })
    ];
    const anchorRenderer = this.createLineAnchor({ points: anchorPoints }, 0);
    this._renderer.append(anchorRenderer);
  }
}
class RectanglePrimitive extends ToolPrimitive {
  constructor() {
    super(...arguments);
    __publicField(this, "_lines", new RectanglePaneView(this, this.model));
    __publicField(this, "_paneView", [this._lines]);
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
  }
  pointsCount() {
    return 2;
  }
  setPoint(pointIndex, point, details) {
    if (pointIndex < 2) {
      return super.setPoint(pointIndex, point, details);
    }
    switch (pointIndex) {
      case 2: {
        this.controlPoints[1].price = details.endPrice;
        this.controlPoints[0].time = details.endTime;
        break;
      }
      case 3: {
        this.controlPoints[0].price = details.endPrice;
        this.controlPoints[1].time = details.endTime;
        break;
      }
      case 4: {
        this.controlPoints[0].time = details.endTime;
        break;
      }
      case 5: {
        this.controlPoints[1].time = details.endTime;
        break;
      }
      case 6: {
        this.controlPoints[0].price = details.endPrice;
        break;
      }
      case 7: {
        this.controlPoints[1].price = details.endPrice;
        break;
      }
    }
  }
  updateAllViews() {
    const [topLeft, bottomRight] = this.controlPoints;
    if (!topLeft) return;
    const dpTopLeft = this.pointToScreenPoint(topLeft);
    if (!dpTopLeft) return;
    const points = [new AnchorPoint(dpTopLeft, { pointIndex: 0 })];
    if (bottomRight) {
      const dpBottomRight = this.pointToScreenPoint(bottomRight);
      if (!dpBottomRight) return;
      points.push(new AnchorPoint(dpBottomRight, { pointIndex: 1 }));
      this._priceAxisPaneViews[0].update(
        this._calculatePriceAxisPaneViewData(dpTopLeft.y, dpBottomRight.y)
      );
      this._timeAxisPaneViews[0].update(
        this._calculateTimeAxisPaneViewsData(dpTopLeft.x, dpBottomRight.x)
      );
      this._priceAxisViews[0].update(this._calculatePriceAxisViewData(topLeft.price, dpTopLeft.y));
      this._priceAxisViews[1].update(
        this._calculatePriceAxisViewData(bottomRight.price, dpBottomRight.y)
      );
      this._timeAxisViews[0].update(this._calculateTimeAxisViewData(topLeft.time, dpTopLeft.x));
      this._timeAxisViews[1].update(
        this._calculateTimeAxisViewData(bottomRight.time, dpBottomRight.x)
      );
    }
    this._lines.update({
      points
    });
  }
}
class RectangleTool extends DrawingTool {
  constructor() {
    super(...arguments);
    __publicField(this, "type", RectangleToolType);
  }
  createPrimitive() {
    return new RectanglePrimitive(
      {
        id: this.id,
        points: [],
        color: "#9C27B0FF",
        lineWidth: 2,
        lineStyle: LineStyleType.solid,
        backColor: "#9C27B033",
        extendLeft: false,
        extendRight: false
      },
      ...this.resetArgs
    );
  }
}
export {
  RectangleTool
};
