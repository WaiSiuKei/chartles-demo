var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { a3 as push, U as append_styles, V as useTranslation, bF as Dialog, Y as from_html, aa as first_child, bG as DialogTitle, ac as sibling, bH as Content, bI as DialogFooter, a1 as append, ag as get, bf as state, a2 as pop, be as set, ah as user_derived, ab as if_block, aA as delegate, a6 as child, a0 as template_effect, bl as set_attribute, af as set_text, A as AnchorPoint, u as Point, G as PaneCursor, bJ as MediaCoordinatesPaneRenderer, w as box, v as pointInBox, y as HitTestResult, z as HitTarget, bK as DeferredPromise, e as ensure, I as ImageToolType, bb as IGuiService, m as IToolService, b as IChartManagementService } from "./index-DSkroicZ.js";
import { T as ToolPaneView, a as ToolPrimitive, D as DrawingTool } from "./toolPaneView-BAEHHn7m.js";
import { P as PriceLabelPriceAxisView } from "./priceLabelPriceAxisView-d9Maj5lR.js";
import { T as TimeLabelTimeAxisView } from "./timeLabelTimeAxisView-BvW_UnA0.js";
import { C as CompositeRenderer } from "./composite-BOGQNAfc.js";
import "./baseTool-BVX9dcKc.js";
const inputs = /* @__PURE__ */ new Set();
function pickImage() {
  for (const input of inputs) {
    input.remove();
  }
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".jpg,.jpeg,.png,.webp";
    Object.assign(input.style, { display: "none" });
    document.body.append(input);
    inputs.add(input);
    input.addEventListener("change", function(event) {
      const { files } = event.target;
      if (files.length > 0) {
        const selectedFile = files[0];
        if (selectedFile.size) {
          resolve(selectedFile);
        } else {
          resolve(null);
        }
      } else {
        resolve(null);
      }
      input.remove();
      inputs.delete(input);
    });
    setTimeout(() => {
      input.click();
    });
  });
}
function fileToImage(file) {
  return new Promise((resolve) => {
    const img = new Image();
    const objectURL = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectURL);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectURL);
      resolve(null);
    };
    img.src = objectURL;
  });
}
function fileToDataURL(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.onerror = () => {
      resolve("");
    };
    reader.readAsDataURL(file);
  });
}
const handleClick = async (_, img, preview) => {
  const file = await pickImage();
  if (!file) return;
  set(img, file, true);
  set(preview, await fileToDataURL(file), true);
};
var root_3 = from_html(`<img class="img svelte-1k3ap48" alt=""/>`);
var root_4 = from_html(`<div class="texts svelte-1k3ap48"><div class="headline svelte-1k3ap48"> </div> <div> </div> <div> </div></div>`);
var root_2 = from_html(`<div class="drop-zone svelte-1k3ap48"><!></div>`);
var root_1 = from_html(`<!> <!> <!>`, 1);
const $$css = {
  hash: "svelte-1k3ap48",
  code: ".drop-zone.svelte-1k3ap48 {width:340px;height:190px;margin-top:8px;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#f9f9f9;border:1px dashed #dbdbdb;border-radius:4px;cursor:pointer;}.drop-zone.svelte-1k3ap48:hover .headline:where(.svelte-1k3ap48) {color:#2962ff;}.texts.svelte-1k3ap48 {align-items:center;color:#9c9c9c;display:flex;flex-direction:column;justify-content:center;line-height:21px;font-size:14px;font-style:normal;font-weight:400;}.headline.svelte-1k3ap48 {color:#0f0f0f;margin-bottom:8px;padding:8px;text-align:center;line-height:24px;font-size:16px;font-style:normal;font-weight:400;}.img.svelte-1k3ap48 {width:100%;height:100%;object-fit:contain;}"
};
function Dialog_1($$anchor, $$props) {
  push($$props, true);
  append_styles($$anchor, $$css);
  const { t } = useTranslation();
  let open = state(true);
  let img = state(void 0);
  let preview = state("");
  const handleClose = () => {
    set(open, false);
    $$props.onClose();
  };
  const handleConfirm = () => {
    set(open, false);
    $$props.onClose(get(img));
  };
  Dialog($$anchor, {
    get open() {
      return get(open);
    },
    onSMUIDialogClosed: handleClose,
    children: ($$anchor2, $$slotProps) => {
      var fragment_1 = root_1();
      var node = first_child(fragment_1);
      {
        let $0 = user_derived(() => t("tool.image.dialog.title"));
        DialogTitle(node, {
          get title() {
            return get($0);
          },
          noBorder: true
        });
      }
      var node_1 = sibling(node, 2);
      Content(node_1, {
        children: ($$anchor3, $$slotProps2) => {
          var div = root_2();
          div.__click = [handleClick, img, preview];
          var node_2 = child(div);
          {
            var consequent = ($$anchor4) => {
              var img_1 = root_3();
              template_effect(() => set_attribute(img_1, "src", get(preview)));
              append($$anchor4, img_1);
            };
            var alternate = ($$anchor4) => {
              var div_1 = root_4();
              var div_2 = child(div_1);
              var text = child(div_2);
              var div_3 = sibling(div_2, 2);
              var text_1 = child(div_3);
              var div_4 = sibling(div_3, 2);
              var text_2 = child(div_4);
              template_effect(
                ($0, $1, $2) => {
                  set_text(text, $0);
                  set_text(text_1, $1);
                  set_text(text_2, $2);
                },
                [
                  () => t("tool.image.dialog.choose"),
                  () => t("tool.image.dialog.imageTypes"),
                  () => t("tool.image.dialog.sizeLimit")
                ]
              );
              append($$anchor4, div_1);
            };
            if_block(node_2, ($$render) => {
              if (get(preview)) $$render(consequent);
              else $$render(alternate, false);
            });
          }
          append($$anchor3, div);
        },
        $$slots: { default: true }
      });
      var node_3 = sibling(node_1, 2);
      {
        let $0 = user_derived(() => t("common.ok"));
        let $1 = user_derived(() => t("common.cancel"));
        DialogFooter(node_3, {
          get mainButtonText() {
            return get($0);
          },
          get cancelButtonText() {
            return get($1);
          },
          onConfirm: handleConfirm,
          onCancel: handleClose
        });
      }
      append($$anchor2, fragment_1);
    },
    $$slots: { default: true }
  });
  pop();
}
delegate(["click"]);
class ImageRenderer extends MediaCoordinatesPaneRenderer {
  hitTest(testPoint) {
    if (!this._data) return null;
    const {
      point,
      // 左上角坐标
      cssWidth,
      // 宽度
      cssHeight
      // 高度
    } = this._data;
    const topLeft = new Point(point.x, point.y);
    const bottomRight = new Point(point.x + cssWidth, point.y + cssHeight);
    const bbox = box(topLeft, bottomRight);
    if (pointInBox(testPoint, bbox)) {
      return new HitTestResult(HitTarget.MovePoint);
    }
    return null;
  }
  drawImpl(scope) {
    if (!this._data) return;
    const { angle, img, point, cssWidth, cssHeight } = this._data;
    const ctx = scope.context;
    if (Math.abs(angle) < 1e-4) {
      ctx.drawImage(img, point.x, point.y, cssWidth, cssHeight);
    } else {
      ctx.translate(point.x, point.y);
      ctx.rotate(angle);
      ctx.drawImage(img, 0, 0, cssWidth, cssHeight);
    }
  }
}
class ImagePaneView extends ToolPaneView {
  constructor() {
    super(...arguments);
    __publicField(this, "_renderer", new CompositeRenderer(this._hitTestCollector));
    __publicField(this, "_imageRenderer", new ImageRenderer());
  }
  renderer() {
    return this._renderer;
  }
  _updateImpl() {
    this._renderer.clear();
    const props = this._source.properties();
    if (!props.image) return;
    const box2 = this._calculateBox();
    if (!box2) return;
    this._imageRenderer.setData({
      point: box2[0],
      img: this._data.imageElement,
      cssWidth: props.cssWidth,
      cssHeight: props.cssHeight,
      angle: 0
    });
    this._renderer.append(this._imageRenderer);
    this._addAnchors();
  }
  _addAnchors() {
    const box2 = this._calculateBox();
    if (box2 === void 0) return;
    const [topLeft, bottomRight] = box2;
    const anchors = [
      // 左上角 (↖)
      new AnchorPoint(new Point(topLeft.x + 1, topLeft.y + 1), {
        pointIndex: 0,
        cursorType: PaneCursor.nwse
      }),
      // 右上角 (↗)
      new AnchorPoint(new Point(bottomRight.x - 1, topLeft.y + 1), {
        pointIndex: 0,
        cursorType: PaneCursor.nesw
      }),
      // 左下角 (↙)
      new AnchorPoint(new Point(topLeft.x + 1, bottomRight.y - 1), {
        pointIndex: 2,
        cursorType: PaneCursor.nesw
      }),
      // 右下角 (↘)
      new AnchorPoint(new Point(bottomRight.x - 1, bottomRight.y - 1), {
        pointIndex: 3,
        cursorType: PaneCursor.nwse
      })
    ];
    this._renderer.append(this.createLineAnchor({ points: anchors }, 0));
  }
  _calculateBox() {
    const props = this._source.properties();
    const width = props.cssWidth;
    const height = props.cssHeight;
    const [anchor] = this.points();
    if (!anchor) return;
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    const topLeft = new Point(anchor.x - halfWidth, anchor.y - halfHeight);
    const bottomRight = new Point(anchor.x + halfWidth, anchor.y + halfHeight);
    return [topLeft, bottomRight];
  }
}
class ImagePrimitive extends ToolPrimitive {
  constructor() {
    super(...arguments);
    __publicField(this, "_image", new ImagePaneView(this, this.model));
    __publicField(this, "_paneView", [this._image]);
    __publicField(this, "_timeAxisViews", [new TimeLabelTimeAxisView(/* @__PURE__ */ Object.create(null))]);
    __publicField(this, "_priceAxisViews", [new PriceLabelPriceAxisView(/* @__PURE__ */ Object.create(null))]);
    __publicField(this, "_promise");
  }
  pointsCount() {
    return 0;
  }
  updateAllViews() {
    if (!this.controlPoints.length) return;
    if (!this._promise) {
      this.loadImage();
      return;
    }
    const imageElement = this._promise.value;
    if (!imageElement) return;
    const [p0] = this.controlPoints;
    const screenPoint = this.pointToScreenPoint(p0);
    if (!screenPoint) return;
    const anchorPoint = new AnchorPoint(screenPoint);
    this._timeAxisViews[0].update(this._calculateTimeAxisViewData(p0.time, anchorPoint.x));
    this._priceAxisViews[0].update(this._calculatePriceAxisViewData(p0.price, anchorPoint.y));
    this._image.update({ points: [anchorPoint], imageElement });
  }
  loadImage() {
    const promise = new DeferredPromise();
    fileToImage(this._props.image).then((img) => {
      promise.complete(img);
    });
    this._promise = promise;
    return promise.p;
  }
  setPoint(index, point, details) {
    var _a;
    const image = ensure((_a = this._promise) == null ? void 0 : _a.value);
    const anchorPoint = ensure(this.pointToScreenPoint(this.controlPoints[0]));
    const aspectRatio = image.naturalWidth / image.naturalHeight;
    const halfWidth = Math.abs(anchorPoint.x - details.screenPoint.x);
    const width = Math.round(halfWidth * 2);
    this._props.cssWidth = width;
    this._props.cssHeight = width / aspectRatio;
  }
  fitSize() {
    var _a;
    if (this._props.cssWidth && this._props.cssHeight) return;
    const image = ensure((_a = this._promise) == null ? void 0 : _a.value);
    const scope = this.getScope();
    const { width, height } = scope.mediaSize;
    const maxWidth = width / 4;
    const maxHeight = height / 4;
    const intrinsicWidth = image.naturalWidth;
    const intrinsicHeight = image.naturalHeight;
    const widthRatio = Math.min(1, maxWidth / intrinsicWidth);
    const heightRatio = Math.min(1, maxHeight / intrinsicHeight);
    const scale = Math.min(widthRatio, heightRatio);
    const finalWidth = Math.round(scale * intrinsicWidth);
    const finalHeight = Math.round(scale * intrinsicHeight);
    this.updateProps({
      cssWidth: finalWidth,
      cssHeight: finalHeight
    });
  }
}
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = decorator(result) || result;
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
let ImageTool = class extends DrawingTool {
  constructor(guiService, toolService, chartManagementService) {
    super();
    __publicField(this, "type", ImageToolType);
    __publicField(this, "canGoBackward", false);
    __publicField(this, "image");
    this.guiService = guiService;
    this.toolService = toolService;
    this.chartManagementService = chartManagementService;
  }
  activated() {
    const com = this.guiService.showComponent({
      Component: Dialog_1,
      props: {
        onClose: async (image) => {
          this.canGoBackward = true;
          com.dispose();
          if (image) {
            this.onImage(image);
          }
          this.toolService.switchBack();
        }
      }
    });
  }
  async onImage(image) {
    this.image = image;
    const activeChart = this.chartManagementService.activeChart();
    this._startCreationOnChart(activeChart, 0, false);
    const series = activeChart.mainSeriesApi.getSeries();
    const width = activeChart.chartApi.timeScale().width();
    const height = series.getPane().getHeight();
    const centerX = width / 2;
    const centerY = height / 2;
    const time = ensure(
      activeChart.chartApi.timeScale().coordinateToTimeEx(centerX)
    );
    const price = ensure(activeChart.mainSeriesApi.getSeries().coordinateToPrice(centerY));
    const pm = this.createPrimitive();
    pm.attach(series);
    await pm.loadImage();
    pm.addPoint({ time, price }, 0);
    pm.fitSize();
    activeChart.getController().attachToolPrimitive(pm, true);
  }
  processEvent() {
  }
  createPrimitive() {
    var _a;
    return new ImagePrimitive(
      {
        id: this.id,
        points: [],
        image: ensure(this.image || ((_a = this.presetProps) == null ? void 0 : _a.image)),
        cssWidth: 0,
        cssHeight: 0
      },
      ...this.resetArgs
    );
  }
  canKeepDrawing() {
    return false;
  }
};
ImageTool = __decorateClass([
  __decorateParam(0, IGuiService),
  __decorateParam(1, IToolService),
  __decorateParam(2, IChartManagementService)
], ImageTool);
class PasteImageTool extends ImageTool {
  activated() {
  }
}
export {
  ImageTool,
  PasteImageTool
};
