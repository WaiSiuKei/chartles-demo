var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { aU as ShortPositionToolType, ap as IIntlService } from "./index-NZHt9VGv.js";
import { D as DrawingTool } from "./toolPaneView-3wj_on-u.js";
import { P as PositionBasePrimitive, r as roundValue, c as calculateLevel } from "./primitive-CojWhc_5.js";
import "./baseTool-CHlzZht2.js";
import "./formatter-_n1ErJyi.js";
import "./numericFormatter-Dh0kn-kp.js";
import "./text-8RrTwjoh.js";
import "./priceLabelPriceAxisView-d9Maj5lR.js";
import "./timeLabelTimeAxisView-BvW_UnA0.js";
import "./axisPaneView-Pbgdotf1.js";
import "./text-CtvZov1L.js";
import "./ctx-Bv0u81rl.js";
import "./composite-tvPrNHN0.js";
import "./line-DFhYRKvt.js";
import "./rectangle-CfXWJsDB.js";
class PositionShortPrimitive extends PositionBasePrimitive {
  stopPrice() {
    return this.entryPrice() + this.properties().stopLevel / this.ownerSourceBase();
  }
  profitPrice() {
    return this.entryPrice() - this.properties().profitLevel / this.ownerSourceBase();
  }
  calculatePL(price) {
    return this.entryPrice() - price;
  }
  prepareStopPrice(price) {
    price = this._roundPrice(price);
    const maxStop = this.entryPrice() + 1 / this.ownerSourceBase();
    return Math.max(price, maxStop);
  }
  prepareProfitPrice(price) {
    price = this._roundPrice(price);
    const minTarget = this.entryPrice() - 1 / this.ownerSourceBase();
    return Math.min(price, minTarget);
  }
  _checkStopPrice(barValue) {
    const stop = this.stopPrice();
    const profit = this.profitPrice();
    const { high, low } = barValue.customValues;
    return high >= stop ? stop : low <= profit ? profit : null;
  }
  _amountTarget(accountSize, targetPrice, entryPrice, quantity, pointValue) {
    const rate = this._closePointCurrencyRate();
    if (rate === null) {
      return NaN;
    }
    return roundValue(accountSize + (entryPrice - targetPrice) * quantity * pointValue / rate);
  }
  _amountStop(accountSize, stopPrice, entryPrice, quantity, pointValue) {
    const rate = this._closePointCurrencyRate();
    if (rate === null) {
      return NaN;
    }
    return roundValue(accountSize - (stopPrice - entryPrice) * quantity * pointValue / rate);
  }
}
class ShortPositionTool extends DrawingTool {
  constructor() {
    super(...arguments);
    __publicField(this, "type", ShortPositionToolType);
  }
  createPrimitive(session) {
    const level = calculateLevel(session);
    return new PositionShortPrimitive(
      {
        id: this.id,
        points: [],
        linecolor: "#808080",
        linewidth: 1,
        textcolor: "#ffffff",
        fontsize: 12,
        fillLabelBackground: true,
        labelBackgroundColor: "#585858",
        fillBackground: true,
        stopBackground: "#F23645",
        profitBackground: "#089981",
        stopBackgroundTransparency: 80,
        profitBackgroundTransparency: 80,
        drawBorder: false,
        borderColor: "#667b8b",
        compact: false,
        riskDisplayMode: "percents",
        accountSize: 1e3,
        lotSize: 1,
        risk: 25,
        alwaysShowStats: false,
        showPriceLabels: true,
        currency: "NONE",
        stopLevel: level,
        profitLevel: level,
        formatTextTarget: (params) => this.chartService.invokeWithinContext((accessor) => {
          return accessor.get(IIntlService).t("tool.position.target", params);
        }),
        formatTextStop: (params) => this.chartService.invokeWithinContext((accessor) => {
          return accessor.get(IIntlService).t("tool.position.stop", params);
        }),
        formatStatusAndPnl: (params) => this.chartService.invokeWithinContext((accessor) => {
          return accessor.get(IIntlService).t("tool.position.pnl", params);
        }),
        formatQty: (params) => this.chartService.invokeWithinContext((accessor) => {
          return accessor.get(IIntlService).t("tool.position.qty", params);
        }),
        formatRatio: (params) => this.chartService.invokeWithinContext((accessor) => {
          return accessor.get(IIntlService).t("tool.position.ratio", params);
        }),
        openText: this.chartService.invokeWithinContext((accessor) => {
          return accessor.get(IIntlService).t("tool.position.open");
        }),
        closeText: this.chartService.invokeWithinContext((accessor) => {
          return accessor.get(IIntlService).t("tool.position.close");
        })
      },
      ...this.resetArgs
    );
  }
}
export {
  ShortPositionTool
};
