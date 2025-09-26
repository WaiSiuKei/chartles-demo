var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { ar as PartFingerprints, U as append_styles, W as useService, V as useTranslation, f as KeyCode, h as KeyMod, as as useDisposable, K as KeybindingWeight, at as Wrapper, a2 as pop, a3 as push, Y as from_html, aa as first_child, Z as bind_this, au as action, ac as sibling, av as Tooltip, aw as TooltipContent, a0 as template_effect, ax as clsx, ay as clsx$1, az as set_class, a1 as append, o as IKeybindingsRegistry, ag as get, ah as user_derived, aA as delegate, aB as PartFingerprint, d as Disposable, e as ensure, aC as isNil, an as IChartService, ao as IChartGuiService } from "./index-DSkroicZ.js";
function partFingerprint(node, fp) {
  PartFingerprints.write(node, fp);
}
var root_1 = from_html(`<button aria-label="ScrollToRealTime"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" width="18" height="18" class="svelte-1yhdz8y"><path fill="currentColor" d="M7.45 3.5 12.48 9l-5.03 5.49 1.1 1.01L14.52 9 8.55 2.49 7.45 3.5Z"></path><path fill="currentColor" d="m3.93 5.99 2.58 3-2.58 3.02 1.14.98 3.42-4-3.42-3.98L3.93 6Z"></path></svg></button> <!>`, 1);
const $$css = {
  hash: "svelte-1yhdz8y",
  code: ".btn.svelte-1yhdz8y {outline:none;border:none;background:none;padding-block:initial;padding-inline:initial;font-family:inherit;color:inherit;position:absolute;right:82px;bottom:55px;width:24px;height:24px;display:flex;align-items:center;justify-content:center;border-radius:4px;z-index:3;pointer-events:auto;transition:color 0.3s, visibility 0.4s, opacity 0.4s;box-shadow:var(--cl-dialog-shadow) 0px 2px 4px 0px;background-color:var(--cl-button-background);color:var(--cl-button-foreground);visibility:hidden;opacity:0;}.btn.svelte-1yhdz8y > svg:where(.svelte-1yhdz8y) {color:inherit;}\n@media (hover: hover) and (pointer: fine) {.btn.svelte-1yhdz8y:hover {color:var(--cl-primary);}\n}.visible.svelte-1yhdz8y {visibility:visible;opacity:1;}"
};
function Component($$anchor, $$props) {
  push($$props, true);
  append_styles($$anchor, $$css);
  const keybindingsRegistry = useService(IKeybindingsRegistry);
  const { t } = useTranslation();
  const kb = KeyCode.RightArrow | KeyMod.Alt | KeyMod.Shift;
  const scroll = () => {
    $$props.scrollToRealTime();
  };
  useDisposable(keybindingsRegistry.registerCommandAndKeybindingRule({
    id: "hides",
    primary: kb,
    weight: KeybindingWeight.ChartContrib,
    handler() {
      scroll();
    }
  }));
  let el;
  $$props.__registerComponent({
    getElement() {
      return el;
    }
  });
  Wrapper($$anchor, {
    children: ($$anchor2, $$slotProps) => {
      var fragment_1 = root_1();
      var button = first_child(fragment_1);
      button.__click = scroll;
      bind_this(button, ($$value) => el = $$value, () => el);
      action(button, ($$node, $$action_arg) => partFingerprint == null ? void 0 : partFingerprint($$node, $$action_arg), () => PartFingerprint.TimeScaleControl);
      var node = sibling(button, 2);
      Tooltip(node, {
        yPos: "side",
        xPos: "side_start",
        children: ($$anchor3, $$slotProps2) => {
          {
            let $0 = user_derived(() => t("nav.scrollToRealtime"));
            TooltipContent($$anchor3, {
              get content() {
                return get($0);
              },
              get keybinding() {
                return kb;
              }
            });
          }
        },
        $$slots: { default: true }
      });
      template_effect(($0) => set_class(button, 1, $0, "svelte-1yhdz8y"), [() => clsx(clsx$1("btn", $$props.visible && "visible"))]);
      append($$anchor2, fragment_1);
    },
    $$slots: { default: true }
  });
  pop();
}
delegate(["click"]);
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = decorator(result) || result;
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
let ScrollToRealTimeContrib = class extends Disposable {
  constructor(chartService, chartGuiService) {
    super();
    __publicField(this, "componentApi");
    this.chartService = chartService;
    const scrollToRealTime = () => {
      chartService.getTimeScale().scrollToRealTime(1e3);
      setTimeout(() => {
        this._checkBtnVisibility();
      }, 1e3);
    };
    this.componentApi = this._register(
      chartGuiService.showComponent({
        Component,
        props: { visible: false, scrollToRealTime }
      })
    );
    this._register(
      chartService.onMouseMove((e) => {
        let visible = false;
        const range = this.chartService.getTimeScale().getVisibleLogicalRange();
        if (range) {
          const to = range.to;
          const last = this.chartService.mainSeriesApi.getSeries().barsProvider().lastIndex();
          if (!isNil(last) && to < last) {
            visible = true;
          }
        }
        const near = this.isPointerNearBox(e);
        if (visible && near) {
          this.componentApi.update({
            visible: true
          });
        } else {
          this.componentApi.update({
            visible: false
          });
        }
      })
    );
  }
  _checkBtnVisibility() {
    let visible = false;
    const range = this.chartService.getTimeScale().getVisibleLogicalRange();
    if (range) {
      const to = range.to;
      const last = this.chartService.mainSeriesApi.getSeries().barsProvider().lastIndex();
      if (!isNil(last) && to < last) {
        visible = true;
      }
    }
    this.componentApi.update({
      visible
    });
  }
  isPointerNearBox(e) {
    const model = this.chartService.getModel();
    if (model.currentCreating || model.currentEditing) {
      return false;
    }
    const event = ensure(e.asMouseInputEvent()).originEvent;
    const instance = this.componentApi.getInstance();
    if (!instance) return false;
    const el = instance.getElement();
    if (!el) return false;
    const box = el.getBoundingClientRect();
    const bottomMargin = 0;
    return event.clientX >= box.left - 100 && event.clientX <= box.right + 100 && event.clientY >= box.top - bottomMargin && event.clientY <= box.bottom + 100;
  }
};
ScrollToRealTimeContrib = __decorateClass([
  __decorateParam(0, IChartService),
  __decorateParam(1, IChartGuiService)
], ScrollToRealTimeContrib);
export {
  ScrollToRealTimeContrib
};
