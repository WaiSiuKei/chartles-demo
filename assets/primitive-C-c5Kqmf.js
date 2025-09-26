var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { P as PriceLabelPriceAxisView } from "./priceLabelPriceAxisView-d9Maj5lR.js";
import { T as TimeLabelTimeAxisView } from "./timeLabelTimeAxisView-BvW_UnA0.js";
import { A as AnchorPoint, bN as LineEnd, y as HitTestResult, z as HitTarget, u as Point } from "./index-NZHt9VGv.js";
import { P as PriceRangeAxisPaneView, T as TimeRangeAxisPaneView } from "./axisPaneView-Pbgdotf1.js";
import { T as ToolPaneView, a as ToolPrimitive } from "./toolPaneView-3wj_on-u.js";
import { C as ChannelRenderer } from "./channel-Bwda4fFe.js";
import { L as LineRenderer } from "./line-DFhYRKvt.js";
import { C as CompositeRenderer } from "./composite-tvPrNHN0.js";
var PitchforkStyle = /* @__PURE__ */ ((PitchforkStyle2) => {
  PitchforkStyle2[PitchforkStyle2["Original"] = 0] = "Original";
  PitchforkStyle2[PitchforkStyle2["SchiffModified"] = 1] = "SchiffModified";
  PitchforkStyle2[PitchforkStyle2["Inside"] = 2] = "Inside";
  PitchforkStyle2[PitchforkStyle2["Schiff"] = 3] = "Schiff";
  return PitchforkStyle2;
})(PitchforkStyle || {});
class PitchforkPaneView extends ToolPaneView {
  constructor() {
    super(...arguments);
    __publicField(this, "_medianRenderer", new LineRenderer());
    __publicField(this, "_sideRenderer", new LineRenderer());
    __publicField(this, "_renderer", new CompositeRenderer(this._hitTestCollector));
  }
  renderer() {
    return this._renderer;
  }
  _updateImpl() {
    this._renderer.clear();
    const points = this.points();
    if ((points == null ? void 0 : points.length) < 2) return;
    const [firstPoint, secondPoint, thirdPoint] = points;
    const anchorSourcePoint = points.length === 3 ? secondPoint.add(thirdPoint).scaled(0.5) : points.length === 2 ? secondPoint : firstPoint;
    const medianPoint = new AnchorPoint(anchorSourcePoint, { pointIndex: 3 });
    this._updateRenderer(medianPoint);
  }
  _updateRenderer(medianPoint) {
    if (!medianPoint) return;
    const points = this.points();
    const sourceProps = this._source.properties();
    const medianProps = sourceProps.median;
    const medianLineData = {
      points: [points[0], medianPoint.point],
      lineColor: medianProps.color,
      lineWidth: medianProps.linewidth,
      lineStyle: medianProps.linestyle,
      extendLeft: sourceProps.extendLines,
      extendRight: true,
      leftEnd: LineEnd.Normal,
      rightEnd: LineEnd.Normal
    };
    this._medianRenderer.setData(medianLineData);
    this._renderer.append(this._medianRenderer);
    if (points.length < 3) {
      this.addAnchors(this._renderer);
      return;
    }
    const leftLineData = {
      points: [points[1], points[2]],
      lineColor: medianProps.color,
      lineWidth: medianProps.linewidth,
      lineStyle: medianProps.linestyle,
      extendLeft: false,
      extendRight: false,
      leftEnd: LineEnd.Normal,
      rightEnd: LineEnd.Normal
    };
    this._sideRenderer.setData(leftLineData);
    this._renderer.append(this._sideRenderer);
    const halfSideVector = points[2].subtract(points[1]).scaled(0.5);
    const baseVector = medianPoint.point.subtract(points[0]);
    let previousCoeff = 0;
    const fillBackground = sourceProps.fillBackground;
    const transparency = sourceProps.transparency;
    sourceProps.levels.forEach((levelProps) => {
      if (!levelProps.visible) return;
      const coeff = levelProps.coeff;
      const levelColor = levelProps.color;
      const lineWidth = levelProps.linewidth;
      const lineStyle = levelProps.linestyle;
      const oneSide = medianPoint.point.addScaled(halfSideVector, coeff);
      const oneSideEnd = oneSide.add(baseVector);
      const otherSide = medianPoint.point.addScaled(halfSideVector, -coeff);
      const otherSideEnd = otherSide.add(baseVector);
      if (fillBackground) {
        const prevTop = medianPoint.point.addScaled(halfSideVector, previousCoeff);
        const fillDataTop = {
          p1: oneSide,
          p2: oneSideEnd,
          p3: prevTop,
          p4: prevTop.add(baseVector),
          color: levelColor,
          transparency,
          hittestOnBackground: true,
          extendLeft: sourceProps.extendLines
        };
        const topFillRenderer = new ChannelRenderer();
        topFillRenderer.setData(fillDataTop);
        this._renderer.append(topFillRenderer);
        const prevBottom = medianPoint.point.addScaled(halfSideVector, -previousCoeff);
        const fillDataBottom = {
          p1: otherSide,
          p2: otherSideEnd,
          p3: prevBottom,
          p4: prevBottom.add(baseVector),
          color: levelColor,
          transparency,
          hittestOnBackground: true,
          extendLeft: sourceProps.extendLines
        };
        const bottomFillRenderer = new ChannelRenderer();
        bottomFillRenderer.setData(fillDataBottom);
        this._renderer.append(bottomFillRenderer);
      }
      previousCoeff = coeff;
      const trendLineUpper = new LineRenderer();
      const upperLineData = {
        points: [oneSide, oneSideEnd],
        lineColor: levelColor,
        lineWidth,
        lineStyle,
        extendLeft: sourceProps.extendLines,
        extendRight: true,
        leftEnd: LineEnd.Normal,
        rightEnd: LineEnd.Normal
      };
      trendLineUpper.setData(upperLineData);
      trendLineUpper.setHitTest(new HitTestResult(HitTarget.MovePoint));
      this._renderer.append(trendLineUpper);
      const trendLineLower = new LineRenderer();
      const lowerLineData = {
        points: [otherSide, otherSideEnd],
        lineColor: levelColor,
        lineWidth,
        lineStyle,
        extendLeft: sourceProps.extendLines,
        extendRight: true,
        leftEnd: LineEnd.Normal,
        rightEnd: LineEnd.Normal
      };
      trendLineLower.setData(lowerLineData);
      trendLineLower.setHitTest(new HitTestResult(HitTarget.MovePoint));
      this._renderer.append(trendLineLower);
    });
    this.addAnchors(this._renderer);
  }
}
class InsidePitchforkPaneView extends PitchforkPaneView {
  constructor() {
    super(...arguments);
    __publicField(this, "_backSideRenderer", new LineRenderer());
    __publicField(this, "_centerRenderer", new LineRenderer());
  }
  _updateRenderer(medianPoint) {
    const points = this.points();
    if ((points == null ? void 0 : points.length) < 2) return;
    const modifiedBase = points[0].add(points[1]).scaled(0.5);
    if (!medianPoint || !modifiedBase) {
      this.addAnchors(this._renderer);
      return;
    }
    const sourceProps = this._source.properties();
    const medianProps = sourceProps.median;
    if (points.length === 3) {
      const medianLineData = {
        points: [modifiedBase, points[2]],
        lineColor: medianProps.color,
        lineWidth: medianProps.linewidth,
        lineStyle: medianProps.linestyle,
        extendLeft: false,
        extendRight: false,
        leftEnd: LineEnd.Normal,
        rightEnd: LineEnd.Normal
      };
      this._medianRenderer.setData(medianLineData);
      this._renderer.append(this._medianRenderer);
    }
    {
      const backLineData = {
        points: [points[0], points[1]],
        lineColor: medianProps.color,
        lineWidth: medianProps.linewidth,
        lineStyle: medianProps.linestyle,
        extendLeft: false,
        extendRight: false,
        leftEnd: LineEnd.Normal,
        rightEnd: LineEnd.Normal
      };
      this._backSideRenderer.setData(backLineData);
      this._renderer.append(this._backSideRenderer);
      if (points.length < 3) {
        this.addAnchors(this._renderer);
        return;
      }
    }
    {
      const sideLineData = {
        points: [points[1], points[2]],
        lineColor: medianProps.color,
        lineWidth: medianProps.linewidth,
        lineStyle: medianProps.linestyle,
        extendLeft: false,
        extendRight: false,
        leftEnd: LineEnd.Normal,
        rightEnd: LineEnd.Normal
      };
      this._sideRenderer.setData(sideLineData);
      this._renderer.append(this._sideRenderer);
    }
    {
      const directionVector = points[2].subtract(points[1]).scaled(0.5);
      const verticalVector = points[2].subtract(modifiedBase);
      let previousCoeff = 0;
      const fillBackground = sourceProps.fillBackground;
      const transparency = sourceProps.transparency;
      const centerLineData = {
        points: [medianPoint.point, medianPoint.point.add(verticalVector)],
        lineColor: medianProps.color,
        lineWidth: medianProps.linewidth,
        lineStyle: medianProps.linestyle,
        extendLeft: sourceProps.extendLines,
        extendRight: true,
        leftEnd: LineEnd.Normal,
        rightEnd: LineEnd.Normal
      };
      this._centerRenderer.setData(centerLineData);
      this._renderer.append(this._centerRenderer);
      sourceProps.levels.forEach((levelProps) => {
        if (levelProps.visible) {
          const coeff = levelProps.coeff;
          const color = levelProps.color;
          const lineWidth = levelProps.linewidth;
          const lineStyle = levelProps.linestyle;
          const topLeft = medianPoint.point.addScaled(directionVector, coeff);
          const topRight = topLeft.add(verticalVector);
          const bottomLeft = medianPoint.point.addScaled(directionVector, -coeff);
          const bottomRight = bottomLeft.add(verticalVector);
          if (fillBackground) {
            {
              const prevTop = medianPoint.point.addScaled(directionVector, previousCoeff);
              const topRegion = {
                p1: topLeft,
                p2: topRight,
                p3: prevTop,
                p4: prevTop.add(verticalVector),
                color,
                transparency,
                hittestOnBackground: true,
                extendLeft: sourceProps.extendLines
              };
              const topFill = new ChannelRenderer();
              topFill.setData(topRegion);
              this._renderer.append(topFill);
            }
            {
              const prevBottom = medianPoint.point.addScaled(directionVector, -previousCoeff);
              const bottomRegion = {
                p1: bottomLeft,
                p2: bottomRight,
                p3: prevBottom,
                p4: prevBottom.add(verticalVector),
                color,
                transparency,
                hittestOnBackground: true,
                extendLeft: sourceProps.extendLines
              };
              const bottomFill = new ChannelRenderer();
              bottomFill.setData(bottomRegion);
              this._renderer.append(bottomFill);
            }
          }
          previousCoeff = coeff;
          const upperTrendLine = new LineRenderer();
          upperTrendLine.setData({
            points: [topLeft, topRight],
            lineColor: color,
            lineWidth,
            lineStyle,
            extendLeft: sourceProps.extendLines,
            extendRight: true,
            leftEnd: LineEnd.Normal,
            rightEnd: LineEnd.Normal
          });
          upperTrendLine.setHitTest(new HitTestResult(HitTarget.MovePoint));
          this._renderer.append(upperTrendLine);
          const lowerTrendLine = new LineRenderer();
          lowerTrendLine.setData({
            points: [bottomLeft, bottomRight],
            lineColor: color,
            lineWidth,
            lineStyle,
            extendLeft: sourceProps.extendLines,
            extendRight: true,
            leftEnd: LineEnd.Normal,
            rightEnd: LineEnd.Normal
          });
          lowerTrendLine.setHitTest(new HitTestResult(HitTarget.MovePoint));
          this._renderer.append(lowerTrendLine);
        }
      });
    }
    this.addAnchors(this._renderer);
  }
}
class ModifiedSchiffPitchforkPaneView extends PitchforkPaneView {
  constructor() {
    super(...arguments);
    __publicField(this, "_backSideRenderer", new LineRenderer());
  }
  _calcModifiedBase() {
    if (this.points().length > 1) {
      return this.points()[0].add(this.points()[1]).scaled(0.5);
    }
  }
  _updateRenderer(medianPoint) {
    const points = this.points();
    if ((points == null ? void 0 : points.length) < 2) {
      return;
    }
    const modifiedBase = this._calcModifiedBase();
    const properties = this._source.properties();
    const medianProps = properties.median;
    {
      const baseLine = {
        points: [points[0], points[1]],
        lineColor: medianProps.color,
        lineWidth: medianProps.linewidth,
        lineStyle: medianProps.linestyle,
        extendLeft: false,
        extendRight: false,
        leftEnd: LineEnd.Normal,
        rightEnd: LineEnd.Normal
      };
      this._backSideRenderer.setData(baseLine);
      this._renderer.append(this._backSideRenderer);
      if (!medianPoint || !modifiedBase) {
        this.addAnchors(this._renderer);
        return;
      }
    }
    {
      const medianLine = {
        points: [modifiedBase, medianPoint.point],
        lineColor: medianProps.color,
        lineWidth: medianProps.linewidth,
        lineStyle: medianProps.linestyle,
        extendLeft: properties.extendLines,
        extendRight: true,
        leftEnd: LineEnd.Normal,
        rightEnd: LineEnd.Normal
      };
      this._medianRenderer.setData(medianLine);
      this._renderer.append(this._medianRenderer);
      if (points.length < 3) {
        this.addAnchors(this._renderer);
        return;
      }
    }
    {
      const sideLine = {
        points: [points[1], points[2]],
        lineColor: medianProps.color,
        lineWidth: medianProps.linewidth,
        lineStyle: medianProps.linestyle,
        extendLeft: false,
        extendRight: false,
        leftEnd: LineEnd.Normal,
        rightEnd: LineEnd.Normal
      };
      this._sideRenderer.setData(sideLine);
      this._renderer.append(this._sideRenderer);
    }
    {
      const dirVector = points[2].subtract(points[1]).scaled(0.5);
      const baseVector = medianPoint.point.subtract(modifiedBase);
      const fillBackground = properties.fillBackground;
      const transparency = properties.transparency;
      let prevCoeff = 0;
      properties.levels.forEach((levelProps) => {
        if (!levelProps.visible) return;
        const coeff = levelProps.coeff;
        const color = levelProps.color;
        const lineWidth = levelProps.linewidth;
        const lineStyle = levelProps.linestyle;
        const topLeft = medianPoint.point.addScaled(dirVector, coeff);
        const topRight = topLeft.add(baseVector);
        const bottomLeft = medianPoint.point.addScaled(dirVector, -coeff);
        const bottomRight = bottomLeft.add(baseVector);
        if (fillBackground) {
          const prevTop = medianPoint.point.addScaled(dirVector, prevCoeff);
          const topFillData = {
            p1: topLeft,
            p2: topRight,
            p3: prevTop,
            p4: prevTop.add(baseVector),
            color,
            transparency,
            hittestOnBackground: true,
            extendLeft: properties.extendLines
          };
          const topFill = new ChannelRenderer();
          topFill.setData(topFillData);
          this._renderer.append(topFill);
          const prevBottom = medianPoint.point.addScaled(dirVector, -prevCoeff);
          const bottomFillData = {
            p1: bottomLeft,
            p2: bottomRight,
            p3: prevBottom,
            p4: prevBottom.add(baseVector),
            color,
            transparency,
            hittestOnBackground: true,
            extendLeft: properties.extendLines
          };
          const bottomFill = new ChannelRenderer();
          bottomFill.setData(bottomFillData);
          this._renderer.append(bottomFill);
        }
        prevCoeff = coeff;
        const upperLine = {
          points: [topLeft, topRight],
          lineColor: color,
          lineWidth,
          lineStyle,
          extendLeft: properties.extendLines,
          extendRight: true,
          leftEnd: LineEnd.Normal,
          rightEnd: LineEnd.Normal
        };
        const upperRenderer = new LineRenderer();
        upperRenderer.setData(upperLine);
        upperRenderer.setHitTest(new HitTestResult(HitTarget.MovePoint));
        this._renderer.append(upperRenderer);
        const lowerLine = {
          points: [bottomLeft, bottomRight],
          lineColor: color,
          lineWidth,
          lineStyle,
          extendLeft: properties.extendLines,
          extendRight: true,
          leftEnd: LineEnd.Normal,
          rightEnd: LineEnd.Normal
        };
        const lowerRenderer = new LineRenderer();
        lowerRenderer.setData(lowerLine);
        lowerRenderer.setHitTest(new HitTestResult(HitTarget.MovePoint));
        this._renderer.append(lowerRenderer);
      });
    }
    this.addAnchors(this._renderer);
  }
}
class SchiffPitchforkPaneView extends ModifiedSchiffPitchforkPaneView {
  _calcModifiedBase() {
    var _a;
    if (((_a = this.points()) == null ? void 0 : _a.length) > 2) {
      const e = this.points()[0].x;
      const t = 0.5 * (this.points()[0].y + this.points()[1].y);
      return new Point(e, t);
    }
  }
}
const map = {
  [PitchforkStyle.Original]: PitchforkPaneView,
  [PitchforkStyle.Inside]: InsidePitchforkPaneView,
  [PitchforkStyle.SchiffModified]: ModifiedSchiffPitchforkPaneView,
  [PitchforkStyle.Schiff]: SchiffPitchforkPaneView
};
class PitchforkPrimitive extends ToolPrimitive {
  constructor() {
    super(...arguments);
    __publicField(this, "_paneView", []);
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
  ensurePaneView() {
    var _a;
    if (!((_a = this._paneView) == null ? void 0 : _a.length)) {
      const Ctor = map[this._props.style];
      this._paneView = [new Ctor(this, this.model)];
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
    this.ensurePaneView();
    this._paneView[0].update({ points });
  }
}
export {
  PitchforkPrimitive as P,
  PitchforkStyle as a
};
