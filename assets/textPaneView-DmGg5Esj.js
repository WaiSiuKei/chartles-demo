var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { a3 as push, U as append_styles, W as useService, bb as IGuiService, c2 as onMount, ar as PartFingerprints, aB as PartFingerprint, Y as from_html, c3 as rest_props, Z as bind_this, a0 as template_effect, ag as get, ah as user_derived, bl as set_attribute, a7 as set_style, bE as event, a1 as append, a2 as pop, a4 as toPX, c4 as StandardKeyboardEvent, f as KeyCode, aA as delegate, p as ICommandService, R as RemoveDrawingCommand, e as ensure, ao as IChartGuiService, M as AreaName, c5 as getLightenRGBA, G as PaneCursor } from "./index-DSkroicZ.js";
import { D as DrawingTool, a as ToolPrimitive, T as ToolPaneView } from "./toolPaneView-BAEHHn7m.js";
const letterSpacingMap = /* @__PURE__ */ new Map([
  ["10b_2", 0.15],
  ["10bi_2", 0.15],
  ["12_3", 0.8],
  ["12b_2", 0.5],
  ["12bi_2", 0.45],
  ["14b_2", 0.65],
  ["14bi_2", 0.65],
  ["16_2.5", 0.8],
  ["16b_2", 0.8],
  ["16bi_2", 0.75],
  ["16b_2.5", 0.8],
  ["16bi_2.5", 0.75],
  ["16bi_3", 0.65],
  ["20_2", 1],
  ["20b_2", 0.8],
  ["20bi_2", 0.75],
  ["20bi_3", 0.55],
  ["20_2.5", 0.25],
  ["20_3", 0.8],
  ["24_2.5", 0.95],
  ["24_3", 0.95],
  ["28_2", 1.4],
  ["28_2.5", 1.38],
  ["28_3", 1.38],
  ["32_2", 1.6],
  ["32_2.5", 1.6],
  ["32_3", 1.6]
]);
const onKeydown = (e, props, $$props, exit) => {
  const k = new StandardKeyboardEvent(e);
  if (k.keyCode === KeyCode.Esc || k.keyCode === KeyCode.Enter && !$$props.multiLine) {
    exit();
  }
};
var root = from_html(`<textarea class="textArea svelte-s85b3a" autocapitalize="off" autocomplete="off" spellcheck="false"></textarea>`);
const $$css = {
  hash: "svelte-s85b3a",
  code: ".textArea.svelte-s85b3a {appearance:textfield;background-color:initial;border:0;box-sizing:border-box;display:block;height:100%;margin:0;outline:0;overflow:hidden;padding:2px;position:absolute;width:100%;-webkit-text-fill-color:currentColor;font-family:inherit;font-size:inherit;line-height:inherit;pointer-events:all;z-index:2;resize:none;}.textArea.svelte-s85b3a::placeholder {color:currentColor;opacity:0.5;}.textArea.svelte-s85b3a::-webkit-calendar-picker-indicator,\n.textArea.svelte-s85b3a::-webkit-clear-button,\n.textArea.svelte-s85b3a::-webkit-inner-spin-button,\n.textArea.svelte-s85b3a::-webkit-outer-spin-button,\n.textArea.svelte-s85b3a::-webkit-search-cancel-button {-webkit-appearance:none;appearance:none;}.textArea.svelte-s85b3a:-webkit-autofill,\n.textArea.svelte-s85b3a:-webkit-autofill:active,\n.textArea.svelte-s85b3a:-webkit-autofill:focus {border-radius:6px;}\n\n@media (any-hover: hover) {.textArea.svelte-s85b3a:-webkit-autofill:hover {border-radius:6px;}\n}"
};
function TextEditor($$anchor, $$props) {
  push($$props, true);
  append_styles($$anchor, $$css);
  const padding = 2;
  let props = rest_props($$props, ["$$slots", "$$events", "$$legacy", "text", "textColor"]);
  const guiService = useService(IGuiService);
  const style = user_derived(() => {
    const {
      font,
      fontSize,
      textLeft,
      textTop,
      textBottom,
      textRight,
      textAlign,
      centerRotation,
      lineSpacing
    } = $$props.textInfo;
    const width = Math.ceil(textRight - textLeft) + 1;
    const height = Math.ceil(textBottom - textTop);
    let top, left, rotation = 0;
    if (!centerRotation || centerRotation.angle === 0) {
      top = Math.round(textTop) + 0.5;
      left = Math.round(textLeft) + 0.5;
    } else {
      left = centerRotation.x - width / 2;
      top = centerRotation.y - height / 2;
      rotation = centerRotation.angle;
    }
    const dpr = devicePixelRatio <= 2 || devicePixelRatio >= 3 ? devicePixelRatio : devicePixelRatio < 2.5 ? 2 : 2.5;
    const boldKey = font.includes("bold") ? "b" : "";
    const italicKey = font.includes("italic") ? "i" : "";
    const spacingKey = `${fontSize}${boldKey}${italicKey}_${dpr}`;
    const spacingValue = letterSpacingMap.get(spacingKey);
    return {
      width: toPX(width + 2 * padding),
      height: toPX(height + 2 * padding),
      top: toPX(top - padding + $$props.offsetTop),
      left: toPX(left - padding + $$props.offsetLeft),
      font,
      textColor: $$props.textColor,
      fontSize: toPX(fontSize),
      lineHeight: toPX(fontSize + lineSpacing),
      textAlign,
      letterSpacing: $$props.multiLine && spacingValue !== void 0 ? toPX(spacingValue) : "normal",
      rotate: rotation ? `${rotation}rad` : void 0
    };
  });
  const onInput = () => {
    $$props.onInput(el.value);
  };
  let exited = false;
  const exit = () => {
    if (exited) return;
    exited = true;
    $$props.onExit();
    if (prevFocus && prevFocus instanceof HTMLElement) {
      prevFocus.focus();
    }
  };
  const onBlur = () => {
    if (guiService.root.activeElement !== el) {
      exit();
    }
  };
  let el;
  let prevFocus = null;
  onMount(() => {
    prevFocus = guiService.root.activeElement;
    el.focus();
    el.value = $$props.text;
    PartFingerprints.write(el, PartFingerprint.Textarea);
  });
  var textarea = root();
  textarea.__input = onInput;
  textarea.__keydown = [onKeydown, props, $$props, exit];
  let styles;
  bind_this(textarea, ($$value) => el = $$value, () => el);
  template_effect(
    ($0) => {
      set_attribute(textarea, "placeholder", $$props.placeholder);
      styles = set_style(textarea, "", styles, $0);
    },
    [
      () => ({
        width: get(style).width,
        height: get(style).height,
        top: get(style).top,
        left: get(style).left,
        font: get(style).font,
        "font-size": get(style).fontSize,
        "line-height": get(style).lineHeight,
        "text-align": get(style).textAlign,
        "letter-spacing": get(style).letterSpacing,
        rotate: get(style).rotate,
        color: get(style).textColor
      })
    ]
  );
  event("blur", textarea, onBlur);
  append($$anchor, textarea);
  pop();
}
delegate(["input", "keydown"]);
class BaseTextTool extends DrawingTool {
  getTextResetArgs(drawingSession) {
    const rest = super.resetArgs;
    const session = drawingSession;
    return [
      ...rest,
      {
        showTextEditor: (props) => {
          var _a;
          const el = ensure((_a = session.chartService.getPane(session.paneIndex)) == null ? void 0 : _a.getHTMLElement());
          const paneRect = el.getBoundingClientRect();
          const chartRect = session.chartService.getContainerDomElement().getBoundingClientRect();
          return session.chartService.invokeWithinContext((accessor) => {
            return accessor.get(IChartGuiService).showComponent({
              Component: TextEditor,
              props: {
                ...props,
                offsetTop: paneRect.top - chartRect.top,
                offsetLeft: paneRect.left - chartRect.left
              }
            });
          });
        },
        accept: () => {
          session.chartService.getModel().markCreatingFinishedOrAborted(this.primitive);
          session.chartService.getModel().blur(this.primitive);
        },
        abort: () => {
          session.chartService.invokeWithinContext(
            (accessor) => accessor.get(ICommandService).executeCommand(RemoveDrawingCommand)
          );
        }
      }
    ];
  }
  finishDrawing() {
  }
}
class BaseTextPrimitive extends ToolPrimitive {
  constructor(props, type, ctx, chart, series, model, editingHelper) {
    super(props, type, ctx, chart, series, model);
    this.editingHelper = editingHelper;
  }
  asTextToolPrimitive() {
    return this;
  }
}
var TextMode = /* @__PURE__ */ ((TextMode2) => {
  TextMode2[TextMode2["Preview"] = 0] = "Preview";
  TextMode2[TextMode2["Edit"] = 1] = "Edit";
  return TextMode2;
})(TextMode || {});
class BaseTextPaneView extends ToolPaneView {
  constructor(source, model, _editingHelper) {
    super(source, model);
    __publicField(this, "_creatingFinished", false);
    __publicField(this, "_mode", 1);
    __publicField(this, "_textWasEdited", false);
    __publicField(this, "_textEditor", null);
    this._editingHelper = _editingHelper;
  }
  isCreationFinished() {
    return this._creatingFinished;
  }
  startTextEditing() {
    this._mode = 1;
    this._textWasEdited = false;
  }
  _isTextEditMode() {
    return this._mode === 1;
  }
  _placeHolderMode(allowAnchorPoint = false) {
    var _a;
    const notEditing = !this._isTextEditMode();
    const isHovered = this._model.currentHovered === this._source;
    const notOnAnchorPoint = !allowAnchorPoint || ((_a = this._model.lastHittestData()) == null ? void 0 : _a.areaName) !== AreaName.AnchorPoint;
    const isNotTouch = true;
    const isTextEmpty = !this._textValue();
    const isSelected = this._model.isSelected(this._source);
    return notEditing && isHovered && notOnAnchorPoint && isNotTouch && isTextEmpty && isSelected;
  }
  _textValue() {
    return this._source.properties().text;
  }
  _textDisplay() {
    const { text, placeholder } = this._source.properties();
    return text || (this._textWasEdited ? "​" : placeholder);
  }
  _textDisplayColor() {
    const textColor = this._textColor();
    return this._textValue() ? textColor : getLightenRGBA(textColor, 0.5);
  }
  _textColor() {
    return this._source.properties().textColor;
  }
  _textCursorType() {
    return this.isSelectedSource() ? PaneCursor.text : PaneCursor.unset;
  }
  _updateEditor(textInfo) {
    var _a;
    if (!this._textEditor && this._isTextEditMode()) {
      this._activateEditMode(textInfo);
    } else {
      (_a = this._textEditor) == null ? void 0 : _a.update({
        textInfo
      });
    }
  }
  _activateEditMode(textInfo) {
    if (this._textEditor) return;
    const { textColor, text, placeholder, wordWrap } = this._source.properties();
    this._textEditor = this._editingHelper.showTextEditor({
      text,
      placeholder,
      textColor,
      multiLine: wordWrap,
      textInfo,
      onExit: () => {
        this._deactiveEditMode();
        if (this._textValue()) {
          this._editingHelper.accept();
        } else {
          this._editingHelper.abort();
        }
      },
      onInput: (text2) => {
        this._source.updateProps({
          text: text2
        });
      }
    });
  }
  _deactiveEditMode() {
    if (!this._creatingFinished) this._creatingFinished = true;
    ensure(this._textEditor).dispose();
    this._mode = 0;
    this._textWasEdited = true;
    this._textEditor = null;
  }
  closeTextEditor() {
    this._deactiveEditMode();
  }
}
export {
  BaseTextPrimitive as B,
  TextMode as T,
  BaseTextTool as a,
  BaseTextPaneView as b
};
