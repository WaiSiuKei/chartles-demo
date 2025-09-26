var __defProp = Object.defineProperty;
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);
var _listeners, _observer, _options, _ResizeObserverSingleton_instances, getObserver_fn;
import { ba as teardown, _ as __vitePreload, aA as delegate, a3 as push, U as append_styles, W as useService, bb as IGuiService, bc as DeferredPromise, V as useTranslation, Y as from_html, at as Wrapper, aa as first_child, ag as get, ah as user_derived, bd as AsyncSvgIcon, a6 as child, ac as sibling, av as Tooltip, aw as TooltipContent, a0 as template_effect, ax as clsx, ay as clsx$1, az as set_class, a1 as append, ai as ifLeftClick, ab as if_block, Z as bind_this, au as action, a2 as pop, be as set, bf as state, af as set_text, bg as Scheduler, bh as Portal, $ as Menu, bi as comment, bj as snippet, bk as useNormalPriority, bl as set_attribute, bm as each, bn as index, ae as Item, bo as html, p as ICommandService, m as IToolService, aq as IConfigurationService, X as proxy, bp as derived, bq as setup_stores, a9 as List, br as store_get, bs as init, g as get$1, bt as MagnetMode, h as KeyMod, bu as derived_safe_equal, aO as MeasureToolType, b as IChartManagementService, bv as IStoreService, as as useDisposable, T as TriggerSource, bw as getKeybindingLabel, bx as spread_props, o as IKeybindingsRegistry, by as HideDrawingsBit, bz as HideIndicatorsBit, bA as HidePositionsAndOrdersBit, bB as writable, f as KeyCode, K as KeybindingWeight, bC as useIdlePriority, bD as onDestroy, bE as event } from "./index-DSkroicZ.js";
import { i as iconEmoji, c as iconIcon, m as measure, a as CursorTools, L as LineTools, b as ChannelTools, F as FibAndGannTools, P as PatternTools, M as MeasureTools, S as ShapesTools, A as AnnotationTools, Z as ZoomInToolType, z as zoomIn } from "./index-DNbtFiKr.js";
import "./baseTool-BVX9dcKc.js";
const _ResizeObserverSingleton = class _ResizeObserverSingleton {
  /** @param {ResizeObserverOptions} options */
  constructor(options) {
    __privateAdd(this, _ResizeObserverSingleton_instances);
    /** */
    __privateAdd(this, _listeners, /* @__PURE__ */ new WeakMap());
    /** @type {ResizeObserver | undefined} */
    __privateAdd(this, _observer);
    /** @type {ResizeObserverOptions} */
    __privateAdd(this, _options);
    __privateSet(this, _options, options);
  }
  /**
   * @param {Element} element
   * @param {(entry: ResizeObserverEntry) => any} listener
   */
  observe(element, listener) {
    var listeners = __privateGet(this, _listeners).get(element) || /* @__PURE__ */ new Set();
    listeners.add(listener);
    __privateGet(this, _listeners).set(element, listeners);
    __privateMethod(this, _ResizeObserverSingleton_instances, getObserver_fn).call(this).observe(element, __privateGet(this, _options));
    return () => {
      var listeners2 = __privateGet(this, _listeners).get(element);
      listeners2.delete(listener);
      if (listeners2.size === 0) {
        __privateGet(this, _listeners).delete(element);
        __privateGet(this, _observer).unobserve(element);
      }
    };
  }
};
_listeners = new WeakMap();
_observer = new WeakMap();
_options = new WeakMap();
_ResizeObserverSingleton_instances = new WeakSet();
getObserver_fn = function() {
  return __privateGet(this, _observer) ?? __privateSet(this, _observer, new ResizeObserver(
    /** @param {any} entries */
    (entries) => {
      for (var entry of entries) {
        _ResizeObserverSingleton.entries.set(entry.target, entry);
        for (var listener of __privateGet(this, _listeners).get(entry.target) || []) {
          listener(entry);
        }
      }
    }
  ));
};
/** @static */
__publicField(_ResizeObserverSingleton, "entries", /* @__PURE__ */ new WeakMap());
let ResizeObserverSingleton = _ResizeObserverSingleton;
var resize_observer_content_box = /* @__PURE__ */ new ResizeObserverSingleton({
  box: "content-box"
});
function bind_resize_observer(element, type, set2) {
  var observer = resize_observer_content_box;
  var unsub = observer.observe(
    element,
    /** @param {any} entry */
    (entry) => set2(entry[type])
  );
  teardown(unsub);
}
const easingFunc = {
  easeOutCubic: (t) => --t * t * t + 1,
  easeInOutCubic: (t) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
};
function lerp(from, to, t) {
  return from * (1 - t) + to * t;
}
const defaultOptions = {
  from: 0,
  duration: 250,
  easing: easingFunc.easeOutCubic
};
class Animator {
  constructor(options) {
    __publicField(this, "_doing");
    __publicField(this, "_completed");
    __publicField(this, "_options");
    this._doing = true;
    this._completed = false;
    this._options = { ...defaultOptions, ...options };
    const startTime = performance.now();
    requestAnimationFrame((now) => {
      this._animation(startTime, this._options.from, now);
    });
  }
  stop() {
    this._doing = false;
  }
  completed() {
    return this._completed;
  }
  _animation(startTime, lastValue, timestamp) {
    if (!this._doing) {
      this._finishAnimation();
      return;
    }
    const now = !timestamp || timestamp < 1e12 ? performance.now() : timestamp;
    const elapsed = now - startTime;
    const isFinished = elapsed >= this._options.duration || lastValue === this._options.to;
    const progress = Math.min(elapsed / this._options.duration, 1);
    const interpolated = lerp(this._options.from, this._options.to, this._options.easing(progress));
    const currentValue = isFinished ? this._options.to : interpolated;
    const delta = currentValue - lastValue;
    this._options.onStep(delta, currentValue);
    if (isFinished) {
      this._finishAnimation();
    } else {
      requestAnimationFrame((nextTime) => {
        this._animation(startTime, currentValue, nextTime);
      });
    }
  }
  _finishAnimation() {
    if (this._options.onComplete) {
      this._options.onComplete();
    }
    this._completed = true;
  }
}
function doAnimate(options) {
  return new Animator(options);
}
const Chevron = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 10" width="20" height="10"><path fill="none" stroke="currentColor" stroke-width="1.5" d="M2 1l8 8 8-8"/></svg>\n';
const Icons$2 = [
  {
    title: "tool.emoji.group.smiles&people",
    icons: [
      "😀",
      "😃",
      "😄",
      "😁",
      "😆",
      "😅",
      "😂",
      "🤣",
      "☺️",
      "😊",
      "😇",
      "🙂",
      "🙃",
      "😉",
      "😌",
      "😍",
      "🥰",
      "😘",
      "😗",
      "😙",
      "😚",
      "😋",
      "😛",
      "😝",
      "😜",
      "🤪",
      "🤨",
      "🧐",
      "🤓",
      "😎",
      "🤩",
      "🥳",
      "😏",
      "😒",
      "😞",
      "😔",
      "😟",
      "😕",
      "🙁",
      "☹️",
      "😣",
      "😖",
      "😫",
      "😩",
      "🥺",
      "😢",
      "😭",
      "😤",
      "😠",
      "😡",
      "🤬",
      "🤯",
      "😳",
      "🥵",
      "🥶",
      "😱",
      "😨",
      "😰",
      "😥",
      "😓",
      "🤗",
      "🤔",
      "🤭",
      "🤫",
      "🤥",
      "😶",
      "😐",
      "😑",
      "😬",
      "🙄",
      "😯",
      "😦",
      "😧",
      "😮",
      "😲",
      "🥱",
      "😴",
      "🤤",
      "😪",
      "😵",
      "🤐",
      "🥴",
      "🤢",
      "🤮",
      "🤧",
      "😷",
      "🤒",
      "🤕",
      "🤑",
      "🤠",
      "😈",
      "👿",
      "👹",
      "👺",
      "🤡",
      "💩",
      "👻",
      "💀",
      "☠️",
      "👽",
      "👾",
      "🤖",
      "🎃",
      "😺",
      "😸",
      "😹",
      "😻",
      "😼",
      "😽",
      "🙀",
      "😿",
      "😾",
      "👋",
      "🤚",
      "🖐",
      "✋",
      "🖖",
      "👌",
      "🤏",
      "✌️",
      "🤞",
      "🤟",
      "🤘",
      "🤙",
      "👈",
      "👉",
      "👆",
      "🖕",
      "👇",
      "☝️",
      "👍",
      "👎",
      "✊",
      "👊",
      "🤛",
      "🤜",
      "👏",
      "🙌",
      "👐",
      "🤲",
      "🤝",
      "🙏",
      "✍️",
      "💅",
      "🤳",
      "💪",
      "🦾",
      "🦵",
      "🦿",
      "🦶",
      "👂",
      "🦻",
      "👃",
      "🧠",
      "🦷",
      "🦴",
      "👀",
      "👁",
      "👅",
      "👄",
      "💋",
      "🩸",
      "👶",
      "🧒",
      "👦",
      "👧",
      "🧑",
      "👱",
      "👨",
      "🧔",
      "👨‍🦰",
      "👨‍🦱",
      "👨‍🦳",
      "👨‍🦲",
      "👩",
      "👩‍🦰",
      "🧑‍🦰",
      "👩‍🦱",
      "🧑‍🦱",
      "👩‍🦳",
      "🧑‍🦳",
      "👩‍🦲",
      "🧑‍🦲",
      "👱‍♀️",
      "👱‍♂️",
      "🧓",
      "👴",
      "👵",
      "🙍",
      "🙍‍♂️",
      "🙍‍♀️",
      "🙎",
      "🙎‍♂️",
      "🙎‍♀️",
      "🙅",
      "🙅‍♂️",
      "🙅‍♀️",
      "🙆",
      "🙆‍♂️",
      "🙆‍♀️",
      "💁",
      "💁‍♂️",
      "💁‍♀️",
      "🙋",
      "🙋‍♂️",
      "🙋‍♀️",
      "🧏",
      "🧏‍♂️",
      "🧏‍♀️",
      "🙇",
      "🙇‍♂️",
      "🙇‍♀️",
      "🤦",
      "🤦‍♂️",
      "🤦‍♀️",
      "🤷",
      "🤷‍♂️",
      "🤷‍♀️",
      "🧑‍⚕️",
      "👨‍⚕️",
      "👩‍⚕️",
      "🧑‍🎓",
      "👨‍🎓",
      "👩‍🎓",
      "🧑‍🏫",
      "👨‍🏫",
      "👩‍🏫",
      "🧑‍⚖️",
      "👨‍⚖️",
      "👩‍⚖️",
      "🧑‍🌾",
      "👨‍🌾",
      "👩‍🌾",
      "🧑‍🍳",
      "👨‍🍳",
      "👩‍🍳",
      "🧑‍🔧",
      "👨‍🔧",
      "👩‍🔧",
      "🧑‍🏭",
      "👨‍🏭",
      "👩‍🏭",
      "🧑‍💼",
      "👨‍💼",
      "👩‍💼",
      "🧑‍🔬",
      "👨‍🔬",
      "👩‍🔬",
      "🧑‍💻",
      "👨‍💻",
      "👩‍💻",
      "🧑‍🎤",
      "👨‍🎤",
      "👩‍🎤",
      "🧑‍🎨",
      "👨‍🎨",
      "👩‍🎨",
      "🧑‍✈️",
      "👨‍✈️",
      "👩‍✈️",
      "🧑‍🚀",
      "👨‍🚀",
      "👩‍🚀",
      "🧑‍🚒",
      "👨‍🚒",
      "👩‍🚒",
      "👮",
      "👮‍♂️",
      "👮‍♀️",
      "🕵",
      "🕵️‍♂️",
      "🕵️‍♀️",
      "💂",
      "💂‍♂️",
      "💂‍♀️",
      "👷",
      "👷‍♂️",
      "👷‍♀️",
      "🤴",
      "👸",
      "👳",
      "👳‍♂️",
      "👳‍♀️",
      "👲",
      "🧕",
      "🤵",
      "👰",
      "🤰",
      "🤱",
      "👼",
      "🎅",
      "🤶",
      "🦸",
      "🦸‍♂️",
      "🦸‍♀️",
      "🦹",
      "🦹‍♂️",
      "🦹‍♀️",
      "🧙",
      "🧙‍♂️",
      "🧙‍♀️",
      "🧚",
      "🧚‍♂️",
      "🧚‍♀️",
      "🧛",
      "🧛‍♂️",
      "🧛‍♀️",
      "🧜",
      "🧜‍♂️",
      "🧜‍♀️",
      "🧝",
      "🧝‍♂️",
      "🧝‍♀️",
      "🧞",
      "🧞‍♂️",
      "🧞‍♀️",
      "🧟",
      "🧟‍♂️",
      "🧟‍♀️",
      "💆",
      "💆‍♂️",
      "💆‍♀️",
      "💇",
      "💇‍♂️",
      "💇‍♀️",
      "🚶",
      "🚶‍♂️",
      "🚶‍♀️",
      "🧍",
      "🧍‍♂️",
      "🧍‍♀️",
      "🧎",
      "🧎‍♂️",
      "🧎‍♀️",
      "🧑‍🦯",
      "👨‍🦯",
      "👩‍🦯",
      "🧑‍🦼",
      "👨‍🦼",
      "👩‍🦼",
      "🧑‍🦽",
      "👨‍🦽",
      "👩‍🦽",
      "🏃",
      "🏃‍♂️",
      "🏃‍♀️",
      "💃",
      "🕺",
      "🕴",
      "👯",
      "👯‍♂️",
      "👯‍♀️",
      "🧖",
      "🧖‍♂️",
      "🧖‍♀️",
      "🧑‍🤝‍🧑",
      "👭",
      "👫",
      "👬",
      "💏",
      "👨‍❤️‍💋‍👨",
      "👩‍❤️‍💋‍👩",
      "💑",
      "👨‍❤️‍👨",
      "👩‍❤️‍👩",
      "👪",
      "👨‍👩‍👦",
      "👨‍👩‍👧",
      "👨‍👩‍👧‍👦",
      "👨‍👩‍👦‍👦",
      "👨‍👩‍👧‍👧",
      "👨‍👨‍👦",
      "👨‍👨‍👧",
      "👨‍👨‍👧‍👦",
      "👨‍👨‍👦‍👦",
      "👨‍👨‍👧‍👧",
      "👩‍👩‍👦",
      "👩‍👩‍👧",
      "👩‍👩‍👧‍👦",
      "👩‍👩‍👦‍👦",
      "👩‍👩‍👧‍👧",
      "👨‍👦",
      "👨‍👦‍👦",
      "👨‍👧",
      "👨‍👧‍👦",
      "👨‍👧‍👧",
      "👩‍👦",
      "👩‍👦‍👦",
      "👩‍👧",
      "👩‍👧‍👦",
      "👩‍👧‍👧",
      "🗣",
      "👤",
      "👥",
      "👣"
    ]
  },
  {
    title: "tool.emoji.group.animals&nature",
    icons: [
      "🐶",
      "🐱",
      "🐭",
      "🐹",
      "🐰",
      "🦊",
      "🐻",
      "🐼",
      "🐨",
      "🐯",
      "🦁",
      "🐮",
      "🐷",
      "🐽",
      "🐸",
      "🐵",
      "🙈",
      "🙉",
      "🙊",
      "🐒",
      "🐔",
      "🐧",
      "🐦",
      "🐤",
      "🐣",
      "🐥",
      "🦆",
      "🦅",
      "🦉",
      "🦇",
      "🐺",
      "🐗",
      "🐴",
      "🦄",
      "🐝",
      "🐛",
      "🦋",
      "🐌",
      "🐞",
      "🐜",
      "🦟",
      "🦗",
      "🕷",
      "🕸",
      "🦂",
      "🐢",
      "🐍",
      "🦎",
      "🦖",
      "🦕",
      "🐙",
      "🦑",
      "🦐",
      "🦞",
      "🦀",
      "🐡",
      "🐠",
      "🐟",
      "🐬",
      "🐳",
      "🐋",
      "🦈",
      "🐊",
      "🐅",
      "🐆",
      "🦓",
      "🦍",
      "🦧",
      "🐘",
      "🦛",
      "🦏",
      "🐪",
      "🐫",
      "🦒",
      "🦘",
      "🐃",
      "🐂",
      "🐄",
      "🐎",
      "🐖",
      "🐏",
      "🐑",
      "🦙",
      "🐐",
      "🦌",
      "🐕",
      "🐩",
      "🦮",
      "🐕‍🦺",
      "🐈",
      "🐓",
      "🦃",
      "🦚",
      "🦜",
      "🦢",
      "🦩",
      "🕊",
      "🐇",
      "🦝",
      "🦨",
      "🦡",
      "🦦",
      "🦥",
      "🐁",
      "🐀",
      "🐿",
      "🦔",
      "🐾",
      "🐉",
      "🐲",
      "🌵",
      "🎄",
      "🌲",
      "🌳",
      "🌴",
      "🌱",
      "🌿",
      "☘️",
      "🍀",
      "🎍",
      "🎋",
      "🍃",
      "🍂",
      "🍁",
      "🍄",
      "🐚",
      "🌾",
      "💐",
      "🌷",
      "🌹",
      "🥀",
      "🌺",
      "🌸",
      "🌼",
      "🌻",
      "🌞",
      "🌝",
      "🌛",
      "🌜",
      "🌚",
      "🌕",
      "🌖",
      "🌗",
      "🌘",
      "🌑",
      "🌒",
      "🌓",
      "🌔",
      "🌙",
      "🌎",
      "🌍",
      "🌏",
      "🪐",
      "💫",
      "⭐️",
      "🌟",
      "✨",
      "⚡️",
      "☄️",
      "💥",
      "🔥",
      "🌪",
      "🌈",
      "☀️",
      "🌤",
      "⛅️",
      "🌥",
      "☁️",
      "🌦",
      "🌧",
      "⛈",
      "🌩",
      "🌨",
      "❄️",
      "☃️",
      "⛄️",
      "🌬",
      "💨",
      "💧",
      "💦",
      "☔️",
      "🌊",
      "🌫"
    ]
  },
  {
    title: "tool.emoji.group.food&drink",
    icons: [
      "🍏",
      "🍎",
      "🍐",
      "🍊",
      "🍋",
      "🍌",
      "🍉",
      "🍇",
      "🍓",
      "🍈",
      "🍒",
      "🍑",
      "🥭",
      "🍍",
      "🥥",
      "🥝",
      "🍅",
      "🍆",
      "🥑",
      "🥦",
      "🥬",
      "🥒",
      "🌶",
      "🌽",
      "🥕",
      "🧄",
      "🧅",
      "🥔",
      "🍠",
      "🥐",
      "🥯",
      "🍞",
      "🥖",
      "🥨",
      "🧀",
      "🥚",
      "🍳",
      "🧈",
      "🥞",
      "🧇",
      "🥓",
      "🥩",
      "🍗",
      "🍖",
      "🌭",
      "🍔",
      "🍟",
      "🍕",
      "🥪",
      "🥙",
      "🧆",
      "🌮",
      "🌯",
      "🥗",
      "🥘",
      "🥫",
      "🍝",
      "🍜",
      "🍲",
      "🍛",
      "🍣",
      "🍱",
      "🥟",
      "🦪",
      "🍤",
      "🍙",
      "🍚",
      "🍘",
      "🍥",
      "🥠",
      "🥮",
      "🍢",
      "🍡",
      "🍧",
      "🍨",
      "🍦",
      "🥧",
      "🧁",
      "🍰",
      "🎂",
      "🍮",
      "🍭",
      "🍬",
      "🍫",
      "🍿",
      "🍩",
      "🍪",
      "🌰",
      "🥜",
      "🍯",
      "🥛",
      "🍼",
      "☕️",
      "🍵",
      "🧃",
      "🥤",
      "🍶",
      "🍺",
      "🍻",
      "🥂",
      "🍷",
      "🥃",
      "🍸",
      "🍹",
      "🧉",
      "🍾",
      "🧊",
      "🥄",
      "🍴",
      "🍽",
      "🥣",
      "🥡",
      "🥢",
      "🧂"
    ]
  },
  {
    title: "tool.emoji.group.activity",
    icons: [
      "⚽️",
      "🏀",
      "🏈",
      "⚾️",
      "🥎",
      "🎾",
      "🏐",
      "🏉",
      "🥏",
      "🎱",
      "🪀",
      "🏓",
      "🏸",
      "🏒",
      "🏑",
      "🥍",
      "🏏",
      "🥅",
      "⛳️",
      "🪁",
      "🏹",
      "🎣",
      "🤿",
      "🥊",
      "🥋",
      "🎽",
      "🛹",
      "🛷",
      "⛸",
      "🥌",
      "🎿",
      "⛷",
      "🏂",
      "🪂",
      "🏋️",
      "🏋️‍♂️",
      "🏋️‍♀️",
      "🤼",
      "🤼‍♂️",
      "🤼‍♀️",
      "🤸‍♀️",
      "🤸",
      "🤸‍♂️",
      "⛹️",
      "⛹️‍♂️",
      "⛹️‍♀️",
      "🤺",
      "🤾",
      "🤾‍♂️",
      "🤾‍♀️",
      "🏌️",
      "🏌️‍♂️",
      "🏌️‍♀️",
      "🏇",
      "🧘",
      "🧘‍♂️",
      "🧘‍♀️",
      "🏄",
      "🏄‍♂️",
      "🏄‍♀️",
      "🏊",
      "🏊‍♂️",
      "🏊‍♀️",
      "🤽",
      "🤽‍♂️",
      "🤽‍♀️",
      "🚣",
      "🚣‍♂️",
      "🚣‍♀️",
      "🧗",
      "🧗‍♂️",
      "🧗‍♀️",
      "🚵",
      "🚵‍♂️",
      "🚵‍♀️",
      "🚴",
      "🚴‍♂️",
      "🚴‍♀️",
      "🏆",
      "🥇",
      "🥈",
      "🥉",
      "🏅",
      "🎖",
      "🏵",
      "🎗",
      "🎫",
      "🎟",
      "🎪",
      "🤹",
      "🤹‍♂️",
      "🤹‍♀️",
      "🎭",
      "🎨",
      "🎬",
      "🎤",
      "🎧",
      "🎼",
      "🎹",
      "🥁",
      "🎷",
      "🎺",
      "🎸",
      "🪕",
      "🎻",
      "🎲",
      "🎯",
      "🎳",
      "🎮",
      "🎰",
      "🧩"
    ]
  },
  {
    title: "tool.emoji.group.travel&places",
    icons: [
      "🚗",
      "🚕",
      "🚙",
      "🚌",
      "🚎",
      "🏎",
      "🚓",
      "🚑",
      "🚒",
      "🚐",
      "🚚",
      "🚛",
      "🚜",
      "🦯",
      "🦽",
      "🦼",
      "🛴",
      "🚲",
      "🛵",
      "🏍",
      "🛺",
      "🚨",
      "🚔",
      "🚍",
      "🚘",
      "🚖",
      "🚡",
      "🚠",
      "🚟",
      "🚃",
      "🚋",
      "🚞",
      "🚝",
      "🚄",
      "🚅",
      "🚈",
      "🚂",
      "🚆",
      "🚇",
      "🚊",
      "🚉",
      "✈️",
      "🛫",
      "🛬",
      "🛩",
      "💺",
      "🛰",
      "🚀",
      "🛸",
      "🚁",
      "🛶",
      "⛵️",
      "🚤",
      "🛥",
      "🛳",
      "⛴",
      "🚢",
      "⚓️",
      "⛽️",
      "🚧",
      "🚦",
      "🚥",
      "🚏",
      "🗺",
      "🗿",
      "🗽",
      "🗼",
      "🏰",
      "🏯",
      "🏟",
      "🎡",
      "🎢",
      "🎠",
      "⛲️",
      "⛱",
      "🏖",
      "🏝",
      "🏜",
      "🌋",
      "⛰",
      "🏔",
      "🗻",
      "🏕",
      "⛺️",
      "🏠",
      "🏡",
      "🏘",
      "🏚",
      "🏗",
      "🏭",
      "🏢",
      "🏬",
      "🏣",
      "🏤",
      "🏥",
      "🏦",
      "🏨",
      "🏪",
      "🏫",
      "🏩",
      "💒",
      "🏛",
      "⛪️",
      "🕌",
      "🕍",
      "🛕",
      "🕋",
      "⛩",
      "🛤",
      "🛣",
      "🗾",
      "🎑",
      "🏞",
      "🌅",
      "🌄",
      "🌠",
      "🎇",
      "🎆",
      "🌇",
      "🌆",
      "🏙",
      "🌃",
      "🌌",
      "🌉",
      "🌁"
    ]
  },
  {
    title: "tool.emoji.group.objects",
    icons: [
      "⌚️",
      "📱",
      "📲",
      "💻",
      "⌨️",
      "🖥",
      "🖨",
      "🖱",
      "🖲",
      "🕹",
      "🗜",
      "💽",
      "💾",
      "💿",
      "📀",
      "📼",
      "📷",
      "📸",
      "📹",
      "🎥",
      "📽",
      "🎞",
      "📞",
      "☎️",
      "📟",
      "📠",
      "📺",
      "📻",
      "🎙",
      "🎚",
      "🎛",
      "🧭",
      "⏱",
      "⏲",
      "⏰",
      "🕰",
      "⌛️",
      "⏳",
      "📡",
      "🔋",
      "🔌",
      "💡",
      "🔦",
      "🕯",
      "🪔",
      "🧯",
      "🛢",
      "💸",
      "💵",
      "💴",
      "💶",
      "💷",
      "💰",
      "💳",
      "💎",
      "⚖️",
      "🧰",
      "🔧",
      "🔨",
      "⚒",
      "🛠",
      "⛏",
      "🔩",
      "⚙️",
      "🧱",
      "⛓",
      "🧲",
      "🔫",
      "💣",
      "🧨",
      "🪓",
      "🔪",
      "🗡",
      "⚔️",
      "🛡",
      "🚬",
      "⚰️",
      "⚱️",
      "🏺",
      "🔮",
      "📿",
      "🧿",
      "💈",
      "⚗️",
      "🔭",
      "🔬",
      "🕳",
      "🩹",
      "🩺",
      "💊",
      "💉",
      "🧬",
      "🦠",
      "🧫",
      "🧪",
      "🌡",
      "🧹",
      "🧺",
      "🧻",
      "🚽",
      "🚰",
      "🚿",
      "🛁",
      "🛀",
      "🧼",
      "🪒",
      "🧽",
      "🧴",
      "🛎",
      "🔑",
      "🗝",
      "🚪",
      "🪑",
      "🛋",
      "🛏",
      "🛌",
      "🧸",
      "🖼",
      "🛍",
      "🛒",
      "🎁",
      "🎈",
      "🎏",
      "🎀",
      "🎊",
      "🎉",
      "🎎",
      "🏮",
      "🎐",
      "🧧",
      "✉️",
      "📩",
      "📨",
      "📧",
      "💌",
      "📥",
      "📤",
      "📦",
      "🏷",
      "📪",
      "📫",
      "📬",
      "📭",
      "📮",
      "📯",
      "📜",
      "📃",
      "📄",
      "📑",
      "🧾",
      "📊",
      "📈",
      "📉",
      "🗒",
      "🗓",
      "📆",
      "📅",
      "🗑",
      "📇",
      "🗃",
      "🗳",
      "🗄",
      "📋",
      "📁",
      "📂",
      "🗂",
      "🗞",
      "📰",
      "📓",
      "📔",
      "📒",
      "📕",
      "📗",
      "📘",
      "📙",
      "📚",
      "📖",
      "🔖",
      "🧷",
      "🔗",
      "📎",
      "🖇",
      "📐",
      "📏",
      "🧮",
      "📌",
      "📍",
      "✂️",
      "🖊",
      "🖋",
      "✒️",
      "🖌",
      "🖍",
      "📝",
      "✏️",
      "🔍",
      "🔎",
      "🔏",
      "🔐",
      "🔒",
      "🔓",
      "🧳",
      "🌂",
      "☂️",
      "🧵",
      "🧶",
      "👓",
      "🕶",
      "🥽",
      "🥼",
      "🦺",
      "👔",
      "👕",
      "👖",
      "🧣",
      "🧤",
      "🧥",
      "🧦",
      "👗",
      "👘",
      "🥻",
      "🩱",
      "🩲",
      "🩳",
      "👙",
      "👚",
      "👛",
      "👜",
      "👝",
      "🎒",
      "👞",
      "👟",
      "🥾",
      "🥿",
      "👠",
      "👡",
      "🩰",
      "👢",
      "👑",
      "👒",
      "🎩",
      "🎓",
      "🧢",
      "⛑",
      "💄",
      "💍",
      "💼"
    ]
  },
  {
    title: "tool.emoji.group.symbols",
    icons: [
      "❤️",
      "🧡",
      "💛",
      "💚",
      "💙",
      "💜",
      "🖤",
      "🤍",
      "🤎",
      "💔",
      "❣️",
      "💕",
      "💞",
      "💓",
      "💗",
      "💖",
      "💘",
      "💝",
      "💟",
      "☮️",
      "✝️",
      "☪️",
      "🕉",
      "☸️",
      "✡️",
      "🔯",
      "🕎",
      "☯️",
      "☦️",
      "🛐",
      "⛎",
      "♈️",
      "♉️",
      "♊️",
      "♋️",
      "♌️",
      "♍️",
      "♎️",
      "♏️",
      "♐️",
      "♑️",
      "♒️",
      "♓️",
      "🆔",
      "⚛️",
      "🉑",
      "☢️",
      "☣️",
      "📴",
      "📳",
      "🈶",
      "🈚️",
      "🈸",
      "🈺",
      "🈷️",
      "✴️",
      "🆚",
      "💮",
      "🉐",
      "㊙️",
      "㊗️",
      "🈴",
      "🈵",
      "🈹",
      "🈲",
      "🅰️",
      "🅱️",
      "🆎",
      "🆑",
      "🅾️",
      "🆘",
      "❌",
      "⭕️",
      "🛑",
      "⛔️",
      "📛",
      "🚫",
      "💯",
      "💢",
      "♨️",
      "🚷",
      "🚯",
      "🚳",
      "🚱",
      "🔞",
      "📵",
      "🚭",
      "❗️",
      "❕",
      "❓",
      "❔",
      "‼️",
      "⁉️",
      "🔅",
      "🔆",
      "〽️",
      "⚠️",
      "🚸",
      "🔱",
      "⚜️",
      "🔰",
      "♻️",
      "✅",
      "🈯️",
      "💹",
      "❇️",
      "✳️",
      "❎",
      "🌐",
      "💠",
      "Ⓜ️",
      "🌀",
      "💤",
      "🏧",
      "🚾",
      "♿️",
      "🅿️",
      "🈳",
      "🈂️",
      "🛂",
      "🛃",
      "🛄",
      "🛅",
      "🚹",
      "🚺",
      "🚼",
      "🚻",
      "🚮",
      "🎦",
      "📶",
      "🈁",
      "🔣",
      "ℹ️",
      "🔤",
      "🔡",
      "🔠",
      "🆖",
      "🆗",
      "🆙",
      "🆒",
      "🆕",
      "🆓",
      "0️⃣",
      "1️⃣",
      "2️⃣",
      "3️⃣",
      "4️⃣",
      "5️⃣",
      "6️⃣",
      "7️⃣",
      "8️⃣",
      "9️⃣",
      "🔟",
      "🔢",
      "#️⃣",
      "*️⃣",
      "⏏️",
      "▶️",
      "⏸",
      "⏯",
      "⏹",
      "⏺",
      "⏭",
      "⏮",
      "⏩",
      "⏪",
      "⏫",
      "⏬",
      "◀️",
      "🔼",
      "🔽",
      "➡️",
      "⬅️",
      "⬆️",
      "⬇️",
      "↗️",
      "↘️",
      "↙️",
      "↖️",
      "↕️",
      "↔️",
      "↪️",
      "↩️",
      "⤴️",
      "⤵️",
      "🔀",
      "🔁",
      "🔂",
      "🔄",
      "🔃",
      "🎵",
      "🎶",
      "➕",
      "➖",
      "➗",
      "✖️",
      "♾",
      "💲",
      "💱",
      "™️",
      "©️",
      "®️",
      "〰️",
      "➰",
      "➿",
      "🔚",
      "🔙",
      "🔛",
      "🔝",
      "🔜",
      "✔️",
      "☑️",
      "🔘",
      "🔴",
      "🟠",
      "🟡",
      "🟢",
      "🔵",
      "🟣",
      "⚫️",
      "⚪️",
      "🟤",
      "🔺",
      "🔻",
      "🔸",
      "🔹",
      "🔶",
      "🔷",
      "🔳",
      "🔲",
      "▪️",
      "▫️",
      "◾️",
      "◽️",
      "◼️",
      "◻️",
      "🟥",
      "🟧",
      "🟨",
      "🟩",
      "🟦",
      "🟪",
      "⬛️",
      "⬜️",
      "🟫",
      "🔈",
      "🔇",
      "🔉",
      "🔊",
      "🔔",
      "🔕",
      "📣",
      "📢",
      "👁‍🗨",
      "💬",
      "💭",
      "🗯",
      "♠️",
      "♣️",
      "♥️",
      "♦️",
      "🃏",
      "🎴",
      "🀄️",
      "🕐",
      "🕑",
      "🕒",
      "🕓",
      "🕔",
      "🕕",
      "🕖",
      "🕗",
      "🕘",
      "🕙",
      "🕚",
      "🕛",
      "🕜",
      "🕝",
      "🕞",
      "🕟",
      "🕠",
      "🕡",
      "🕢",
      "🕣",
      "🕤",
      "🕥",
      "🕦",
      "🕧"
    ]
  },
  {
    title: "tool.emoji.group.flags",
    icons: [
      "🏳️",
      "🏴",
      "🏁",
      "🚩",
      "🏳️‍🌈",
      "🏴‍☠️",
      "🇦🇫",
      "🇦🇽",
      "🇦🇱",
      "🇩🇿",
      "🇦🇸",
      "🇦🇩",
      "🇦🇴",
      "🇦🇮",
      "🇦🇶",
      "🇦🇬",
      "🇦🇷",
      "🇦🇲",
      "🇦🇼",
      "🇦🇺",
      "🇦🇹",
      "🇦🇿",
      "🇧🇸",
      "🇧🇭",
      "🇧🇩",
      "🇧🇧",
      "🇧🇾",
      "🇧🇪",
      "🇧🇿",
      "🇧🇯",
      "🇧🇲",
      "🇧🇹",
      "🇧🇴",
      "🇧🇦",
      "🇧🇼",
      "🇧🇷",
      "🇮🇴",
      "🇻🇬",
      "🇧🇳",
      "🇧🇬",
      "🇧🇫",
      "🇧🇮",
      "🇰🇭",
      "🇨🇲",
      "🇨🇦",
      "🇮🇨",
      "🇨🇻",
      "🇧🇶",
      "🇰🇾",
      "🇨🇫",
      "🇹🇩",
      "🇨🇱",
      "🇨🇳",
      "🇨🇽",
      "🇨🇨",
      "🇨🇴",
      "🇰🇲",
      "🇨🇬",
      "🇨🇩",
      "🇨🇰",
      "🇨🇷",
      "🇨🇮",
      "🇭🇷",
      "🇨🇺",
      "🇨🇼",
      "🇨🇾",
      "🇨🇿",
      "🇩🇰",
      "🇩🇯",
      "🇩🇲",
      "🇩🇴",
      "🇪🇨",
      "🇪🇬",
      "🇸🇻",
      "🇬🇶",
      "🇪🇷",
      "🇪🇪",
      "🇪🇹",
      "🇪🇺",
      "🇫🇰",
      "🇫🇴",
      "🇫🇯",
      "🇫🇮",
      "🇫🇷",
      "🇬🇫",
      "🇵🇫",
      "🇹🇫",
      "🇬🇦",
      "🇬🇲",
      "🇬🇪",
      "🇩🇪",
      "🇬🇭",
      "🇬🇮",
      "🇬🇷",
      "🇬🇱",
      "🇬🇩",
      "🇬🇵",
      "🇬🇺",
      "🇬🇹",
      "🇬🇬",
      "🇬🇳",
      "🇬🇼",
      "🇬🇾",
      "🇭🇹",
      "🇭🇳",
      "🇭🇰",
      "🇭🇺",
      "🇮🇸",
      "🇮🇳",
      "🇮🇩",
      "🇮🇷",
      "🇮🇶",
      "🇮🇪",
      "🇮🇲",
      "🇮🇱",
      "🇮🇹",
      "🇯🇲",
      "🇯🇵",
      "🎌",
      "🇯🇪",
      "🇯🇴",
      "🇰🇿",
      "🇰🇪",
      "🇰🇮",
      "🇽🇰",
      "🇰🇼",
      "🇰🇬",
      "🇱🇦",
      "🇱🇻",
      "🇱🇧",
      "🇱🇸",
      "🇱🇷",
      "🇱🇾",
      "🇱🇮",
      "🇱🇹",
      "🇱🇺",
      "🇲🇴",
      "🇲🇰",
      "🇲🇬",
      "🇲🇼",
      "🇲🇾",
      "🇲🇻",
      "🇲🇱",
      "🇲🇹",
      "🇲🇭",
      "🇲🇶",
      "🇲🇷",
      "🇲🇺",
      "🇾🇹",
      "🇲🇽",
      "🇫🇲",
      "🇲🇩",
      "🇲🇨",
      "🇲🇳",
      "🇲🇪",
      "🇲🇸",
      "🇲🇦",
      "🇲🇿",
      "🇲🇲",
      "🇳🇦",
      "🇳🇷",
      "🇳🇵",
      "🇳🇱",
      "🇳🇨",
      "🇳🇿",
      "🇳🇮",
      "🇳🇪",
      "🇳🇬",
      "🇳🇺",
      "🇳🇫",
      "🇰🇵",
      "🇲🇵",
      "🇳🇴",
      "🇴🇲",
      "🇵🇰",
      "🇵🇼",
      "🇵🇸",
      "🇵🇦",
      "🇵🇬",
      "🇵🇾",
      "🇵🇪",
      "🇵🇭",
      "🇵🇳",
      "🇵🇱",
      "🇵🇹",
      "🇵🇷",
      "🇶🇦",
      "🇷🇪",
      "🇷🇴",
      "🇷🇺",
      "🇷🇼",
      "🇼🇸",
      "🇸🇲",
      "🇸🇦",
      "🇸🇳",
      "🇷🇸",
      "🇸🇨",
      "🇸🇱",
      "🇸🇬",
      "🇸🇽",
      "🇸🇰",
      "🇸🇮",
      "🇬🇸",
      "🇸🇧",
      "🇸🇴",
      "🇿🇦",
      "🇰🇷",
      "🇸🇸",
      "🇪🇸",
      "🇱🇰",
      "🇧🇱",
      "🇸🇭",
      "🇰🇳",
      "🇱🇨",
      "🇵🇲",
      "🇻🇨",
      "🇸🇩",
      "🇸🇷",
      "🇸🇿",
      "🇸🇪",
      "🇨🇭",
      "🇸🇾",
      "🇹🇼",
      "🇹🇯",
      "🇹🇿",
      "🇹🇭",
      "🇹🇱",
      "🇹🇬",
      "🇹🇰",
      "🇹🇴",
      "🇹🇹",
      "🇹🇳",
      "🇹🇷",
      "🇹🇲",
      "🇹🇨",
      "🇹🇻",
      "🇻🇮",
      "🇺🇬",
      "🇺🇦",
      "🇦🇪",
      "🇬🇧",
      "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
      "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
      "🏴󠁧󠁢󠁷󠁬󠁳󠁿",
      "🇺🇳",
      "🇺🇸",
      "🇺🇾",
      "🇺🇿",
      "🇻🇺",
      "🇻🇦",
      "🇻🇪",
      "🇻🇳",
      "🇼🇫",
      "🇪🇭",
      "🇾🇪",
      "🇿🇲",
      "🇿🇼"
    ]
  }
];
const base = "https://cdnjs.cloudflare.com/ajax/libs/twemoji/13.0.1/";
function getTwemojiUrl(emoji, imageType) {
  return new Promise((resolve) => {
    __vitePreload(() => import("./twemoji.esm-BVemZVdm.js"), true ? [] : void 0, import.meta.url).then(
      (module) => module.default.parse(emoji, (codepoint) => {
        const folder = imageType === "svg" ? "svg" : "72x72";
        const extension = imageType === "svg" ? "svg" : "png";
        resolve(`${base}${folder}/${codepoint}.${extension}`);
        return false;
      })
    );
  });
}
function firstHover(node, params) {
  let { promise } = params;
  const handleMouseEnter = () => {
    promise.complete(void 0);
    node.removeEventListener("mouseenter", handleMouseEnter);
  };
  node.addEventListener("mouseenter", handleMouseEnter);
  return {
    update(newParams) {
      ({ promise } = newParams);
    },
    destroy() {
      node.removeEventListener("mouseenter", handleMouseEnter);
    }
  };
}
const onRightClick = (e, onMoreClicked) => {
  e.preventDefault();
  setTimeout(() => {
    onMoreClicked();
  });
};
var root_1$3 = from_html(`<button><span class="iconBg svelte-1cl9m1v"><!></span></button> <!>`, 1);
var root_5$5 = from_html(`<div> </div>`);
var root_4$3 = from_html(`<button aria-label="More" class="arrow svelte-1cl9m1v"><span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 16" width="10" height="16"><path d="M.6 1.4l1.4-1.4 8 8-8 8-1.4-1.4 6.389-6.532-6.389-6.668z"></path></svg></span></button> <!>`, 1);
var root$2 = from_html(`<div><!> <!> <!></div>`);
const $$css$9 = {
  hash: "svelte-1cl9m1v",
  code: ".control.svelte-1cl9m1v {position:relative;}\n@media (hover: hover) and (pointer: fine) {.control.svelte-1cl9m1v:hover .arrow:where(.svelte-1cl9m1v) {opacity:1;}.control.svelte-1cl9m1v:hover .arrow:where(.svelte-1cl9m1v) svg {transform:translateX(1px);}\n}.cl-tool-dropdown {border-radius:6px;box-shadow:var(--cl-dialog-shadow) 0px 2px 4px 0px;padding:6px 0;background-color:var(--cl-background);height:100%;overflow-x:hidden;overflow-y:auto;overscroll-behavior:contain;height:fit-content;}.cl-tool-dropdown::-webkit-scrollbar {-webkit-appearance:none;width:3px;height:3px;}.cl-tool-dropdown::-webkit-scrollbar-corner {display:none;}.cl-tool-dropdown::-webkit-scrollbar-thumb {background-clip:content-box;background-color:var(--cl-scrollbarThumb-background);border-radius:3px;}.cl-tool-dropdown::-webkit-scrollbar-track {background-color:initial;border-radius:3px;}.icon.svelte-1cl9m1v {outline:none;border:none;background:none;padding-block:initial;padding-inline:initial;font-family:inherit;color:inherit;display:flex;flex-direction:row;align-items:center;justify-content:center;position:relative;width:100%;height:36px;cursor:pointer;}.iconActive.svelte-1cl9m1v {color:var(--cl-selectedForeground);}.iconDisabled.svelte-1cl9m1v {color:var(--cl-listItem-disabledForeground);cursor:not-allowed;}.iconActive.iconNegativeColor.svelte-1cl9m1v {color:var(--cl-negative-foreground);}.iconDisabled.iconNegativeColor.svelte-1cl9m1v {color:var(--cl-negative-foreground);}.iconBg.svelte-1cl9m1v {display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:4px;}\n@media (hover: hover) and (pointer: fine) {.iconBg.svelte-1cl9m1v:hover {background-color:var(--cl-button-hoverBackground);}\n}.iconActive.iconNegativeColor.svelte-1cl9m1v .iconBg:where(.svelte-1cl9m1v) {background:var(--cl-negative-background);}\n@media (hover: hover) and (pointer: fine) {.iconActive.iconNegativeColor.svelte-1cl9m1v .iconBg:where(.svelte-1cl9m1v):hover {background-color:var(--cl-negative-hoverBackground);}\n}.arrow.svelte-1cl9m1v {outline:none;border:none;background:none;padding-block:initial;padding-inline:initial;font-family:inherit;color:inherit;display:flex;flex-direction:row;align-items:center;justify-content:center;position:absolute;top:1px;bottom:1px;right:0;width:9px;opacity:0;box-sizing:border-box;border-radius:4px 0 0 4px;transition:all 0.2s;border-top-left-radius:2px;border-bottom-left-radius:2px;z-index:1;color:var(--cl-foreground);}.arrow.svelte-1cl9m1v svg {display:block;height:7px;width:4px;fill:currentColor;transition:transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);}\n@media (hover: hover) and (pointer: fine) {.arrow.svelte-1cl9m1v:hover {background-color:var(--cl-button-hoverBackground);}\n}"
};
function IconButton($$anchor, $$props) {
  push($$props, true);
  append_styles($$anchor, $$css$9);
  const guiService = useService(IGuiService);
  const firstHoverPromise = new DeferredPromise();
  let div;
  let open = state(false);
  const { t } = useTranslation();
  const onButtonClicked = () => {
    var _a;
    if ($$props.disabled) return;
    (_a = $$props.onselect) == null ? void 0 : _a.call($$props);
    if ($$props.asMenuTrigger) {
      onMoreClicked();
    }
  };
  const onMoreClicked = () => {
    set(open, true);
  };
  const portalTarget = guiService.root;
  var div_1 = root$2();
  var node = child(div_1);
  Wrapper(node, {
    children: ($$anchor2, $$slotProps) => {
      var fragment = root_1$3();
      var button = first_child(fragment);
      var event_handler = user_derived(() => ifLeftClick(onButtonClicked));
      button.__pointerup = function(...$$args) {
        var _a;
        (_a = get(event_handler)) == null ? void 0 : _a.apply(this, $$args);
      };
      button.__contextmenu = [onRightClick, onMoreClicked];
      var span = child(button);
      var node_1 = child(span);
      AsyncSvgIcon(node_1, {
        get icon() {
          return $$props.icon;
        }
      });
      var node_2 = sibling(button, 2);
      Tooltip(node_2, {
        xPos: "side_end",
        yPos: "side",
        children: ($$anchor3, $$slotProps2) => {
          {
            let $0 = user_derived(() => t($$props.tip));
            let $1 = user_derived(() => t($$props.contentAfterKb));
            TooltipContent($$anchor3, {
              get content() {
                return get($0);
              },
              get keybinding() {
                return $$props.keybinding;
              },
              get contentAfter() {
                return get($1);
              }
            });
          }
        },
        $$slots: { default: true }
      });
      template_effect(($0) => set_class(button, 1, $0, "svelte-1cl9m1v"), [
        () => clsx(clsx$1("icon", $$props.active && "iconActive", $$props.disabled && "iconDisabled", $$props.negativeColor && "iconNegativeColor"))
      ]);
      append($$anchor2, fragment);
    },
    $$slots: { default: true }
  });
  var node_3 = sibling(node, 2);
  {
    var consequent = ($$anchor2) => {
      Wrapper($$anchor2, {
        children: ($$anchor3, $$slotProps) => {
          var fragment_3 = root_4$3();
          var button_1 = first_child(fragment_3);
          var event_handler_1 = user_derived(() => ifLeftClick(onMoreClicked));
          button_1.__pointerup = function(...$$args) {
            var _a;
            (_a = get(event_handler_1)) == null ? void 0 : _a.apply(this, $$args);
          };
          var node_4 = sibling(button_1, 2);
          Tooltip(node_4, {
            xPos: "side_end",
            yPos: "side",
            children: ($$anchor4, $$slotProps2) => {
              var div_2 = root_5$5();
              var text = child(div_2);
              template_effect(($0) => set_text(text, $0), [() => t($$props.moreTip)]);
              append($$anchor4, div_2);
            },
            $$slots: { default: true }
          });
          append($$anchor3, fragment_3);
        },
        $$slots: { default: true }
      });
    };
    if_block(node_3, ($$render) => {
      if ($$props.moreTip) $$render(consequent);
    });
  }
  var node_5 = sibling(node_3, 2);
  {
    var consequent_1 = ($$anchor2) => {
      Scheduler($$anchor2, {
        get waitFor() {
          return firstHoverPromise;
        },
        children: ($$anchor3, $$slotProps) => {
          Portal($$anchor3, {
            get target() {
              return portalTarget;
            },
            children: ($$anchor4, $$slotProps2) => {
              {
                let $0 = user_derived(() => clsx$1($$props.menuClass, "cl-tool-dropdown"));
                Menu($$anchor4, {
                  anchor: false,
                  anchorCorner: "TOP_RIGHT",
                  get anchorElement() {
                    return div;
                  },
                  quickOpen: true,
                  hoisted: true,
                  get class() {
                    return get($0);
                  },
                  get open() {
                    return get(open);
                  },
                  set open($$value) {
                    set(open, $$value, true);
                  },
                  children: ($$anchor5, $$slotProps3) => {
                    var fragment_7 = comment();
                    var node_6 = first_child(fragment_7);
                    snippet(node_6, () => $$props.children);
                    append($$anchor5, fragment_7);
                  },
                  $$slots: { default: true }
                });
              }
            },
            $$slots: { default: true }
          });
        },
        $$slots: { default: true }
      });
    };
    if_block(node_5, ($$render) => {
      if ($$props.children) $$render(consequent_1);
    });
  }
  bind_this(div_1, ($$value) => div = $$value, () => div);
  action(div_1, ($$node, $$action_arg) => firstHover == null ? void 0 : firstHover($$node, $$action_arg), () => ({ promise: firstHoverPromise }));
  template_effect(($0) => set_class(div_1, 1, $0, "svelte-1cl9m1v"), [() => clsx(clsx$1($$props.class, "control"))]);
  append($$anchor, div_1);
  pop();
}
delegate(["pointerup", "contextmenu"]);
var root_1$2 = from_html(`<img class="emoji svelte-1dmdzd4" loading="lazy" decoding="async" width="24" height="24" alt="" draggable="false"/>`);
var root$1 = from_html(`<span class="icon svelte-1dmdzd4"><!></span>`);
const $$css$8 = {
  hash: "svelte-1dmdzd4",
  code: ".icon.svelte-1dmdzd4 {width:38px;height:38px;display:flex;justify-content:center;align-items:center;}img.svelte-1dmdzd4 {border:none;-webkit-touch-callout:none;}"
};
function EmojiPreview($$anchor, $$props) {
  push($$props, true);
  append_styles($$anchor, $$css$8);
  let url = state("");
  useNormalPriority(() => {
    getTwemojiUrl($$props.emoji, "png").then((result) => set(url, result, true));
  });
  var span = root$1();
  var node = child(span);
  {
    var consequent = ($$anchor2) => {
      var img = root_1$2();
      template_effect(() => set_attribute(img, "src", get(url)));
      append($$anchor2, img);
    };
    if_block(node, ($$render) => {
      if (get(url)) $$render(consequent);
    });
  }
  append($$anchor, span);
  pop();
}
var root_2$5 = from_html(`<div> </div>`);
var root_3$3 = from_html(`<div></div>`);
const $$css$7 = {
  hash: "svelte-ftuc3d",
  code: ".sectionTitle.svelte-ftuc3d {padding:4px 12px;font-size:11px;letter-spacing:0.4px;line-height:16px;color:var(--cl-listTitle-foreground);user-select:none;}.row.svelte-ftuc3d {height:38px;width:fit-content;}.title.svelte-ftuc3d {align-items:center;box-sizing:border-box;display:flex;font-size:11px;height:100%;letter-spacing:0.4px;padding:6px 6px 0 18px;text-transform:uppercase;color:var(--cl-listTitle-foreground);}.icons.svelte-ftuc3d {align-items:center;display:flex;height:100%;overflow:hidden;padding:0 6px;}"
};
function EmojiList($$anchor, $$props) {
  push($$props, true);
  append_styles($$anchor, $$css$7);
  const { t } = useTranslation();
  const rows = [];
  const chunkSize = 9;
  function chunkArray(arr) {
    const result = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
      result.push(arr.slice(i, i + chunkSize));
    }
    return result;
  }
  Icons$2.forEach((group) => {
    rows.push({ type: "title", title: group.title });
    chunkArray(group.icons).forEach((chunk) => {
      rows.push({ type: "list", icons: chunk });
    });
  });
  var fragment = comment();
  var node = first_child(fragment);
  each(node, 17, () => rows, index, ($$anchor2, row) => {
    var fragment_1 = comment();
    var node_1 = first_child(fragment_1);
    {
      var consequent = ($$anchor3) => {
        var div = root_2$5();
        var text = child(div);
        template_effect(
          ($0, $1) => {
            set_class(div, 1, $0, "svelte-ftuc3d");
            set_text(text, $1);
          },
          [
            () => clsx(clsx$1("row", "title")),
            () => t(get(row).title)
          ]
        );
        append($$anchor3, div);
      };
      var alternate = ($$anchor3) => {
        var div_1 = root_3$3();
        each(div_1, 21, () => get(row).icons, index, ($$anchor4, icon, index2, $$array) => {
          {
            let $0 = user_derived(() => ifLeftClick(() => $$props.onpointerup(get(icon))));
            Item($$anchor4, {
              tag: "div",
              class: "item",
              get onpointerup() {
                return get($0);
              },
              children: ($$anchor5, $$slotProps) => {
                EmojiPreview($$anchor5, {
                  get emoji() {
                    return get(icon);
                  }
                });
              },
              $$slots: { default: true }
            });
          }
        });
        template_effect(($0) => set_class(div_1, 1, $0, "svelte-ftuc3d"), [() => clsx(clsx$1("row", "icons"))]);
        append($$anchor3, div_1);
      };
      if_block(node_1, ($$render) => {
        if (get(row).type === "title") $$render(consequent);
        else $$render(alternate, false);
      });
    }
    append($$anchor2, fragment_1);
  });
  append($$anchor, fragment);
  pop();
}
const Icons$1 = [
  {
    title: "tool.icon.group.gestures&smileys",
    icons: [
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M20.84 13.2c.34-.58.54-1.2.54-1.95a3.4 3.4 0 0 0-3.36-3.34H16.6c.19-.5.34-1.1.34-1.82 0-2.84-1.47-4.09-3.72-4.09-2.4 0-2.27 3.7-2.8 4.24-.89.9-1.94 2.6-2.69 3.26H3.87c-.69 0-1.25.56-1.25 1.25v9.38c0 .69.56 1.25 1.25 1.25h2.5c.59 0 1.08-.4 1.22-.94 1.73.04 2.93 1.56 6.94 1.56h.87c3.01 0 4.37-1.54 4.41-3.72.52-.72.8-1.69.68-2.62.38-.72.53-1.58.35-2.46Zm-2.41 2.1c.49.83.05 1.93-.55 2.25.3 1.9-.69 2.57-2.07 2.57h-1.48c-2.8 0-4.61-1.47-6.7-1.47v-7.27h.42c1.1 0 2.66-2.77 3.7-3.81 1.1-1.11.73-2.96 1.47-3.7 1.85 0 1.85 1.3 1.85 2.22 0 1.53-1.11 2.22-1.11 3.7h4.06c.83 0 1.48.73 1.48 1.47s-.5 1.48-.87 1.48c.53.57.64 1.77-.2 2.56ZM6.06 18.87a.94.94 0 1 1-1.87 0 .94.94 0 0 1 1.87 0Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M20.84 10.8c.18-.88.03-1.74-.35-2.46.11-.93-.16-1.9-.68-2.62C19.77 3.54 18.41 2 15.4 2h-.87c-4.05 0-5.3 1.56-6.9 1.56H7.2c-.22-.2-.5-.31-.83-.31h-2.5c-.69 0-1.25.56-1.25 1.25v9.38c0 .69.56 1.24 1.25 1.24h2.5c.47 0 .87-.25 1.09-.62h.27c.75.66 1.8 2.37 2.69 3.26.53.53.4 4.24 2.8 4.24 2.25 0 3.72-1.25 3.72-4.1 0-.71-.15-1.3-.34-1.8h1.42a3.4 3.4 0 0 0 3.36-3.35c0-.75-.2-1.37-.54-1.95ZM5.13 13.56a.94.94 0 1 1 0-1.87.94.94 0 0 1 0 1.87Zm12.9.66h-4.07c0 1.47 1.1 2.16 1.1 3.69 0 .93 0 2.21-1.84 2.21-.74-.73-.37-2.58-1.48-3.69-1.03-1.04-2.58-3.8-3.69-3.8h-.43V5.34c2.1 0 3.91-1.47 6.71-1.47h1.48c1.38 0 2.37.66 2.07 2.57.6.32 1.04 1.42.55 2.25.84.8.73 2 .2 2.56.37 0 .87.74.87 1.48s-.65 1.48-1.48 1.48Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M6.06 10.75H2.94a.94.94 0 0 0-.94.94v9.37c0 .52.42.94.94.94h3.12c.52 0 .94-.42.94-.94V11.7a.94.94 0 0 0-.94-.94ZM4.5 20.44a.94.94 0 1 1 0-1.88.94.94 0 0 1 0 1.88ZM17 5.18c0 1.66-1.01 2.59-1.3 3.7h3.97c1.3 0 2.32 1.08 2.33 2.26 0 .7-.3 1.46-.76 1.93.38.91.32 2.19-.37 3.1.34 1.02 0 2.26-.64 2.92.17.7.09 1.28-.24 1.75-.8 1.14-2.77 1.16-4.44 1.16h-.11c-1.89 0-3.43-.69-4.67-1.24a6.15 6.15 0 0 0-2.06-.63.47.47 0 0 1-.46-.47v-8.35c0-.13.05-.25.14-.33 1.55-1.53 2.21-3.15 3.48-4.42.58-.58.79-1.46 1-2.3.17-.73.53-2.26 1.32-2.26.94 0 2.81.31 2.81 3.18Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M2 4.19v9.37c0 .52.42.94.94.94h3.12c.52 0 .94-.42.94-.94V4.2a.94.94 0 0 0-.94-.94H2.94a.94.94 0 0 0-.94.94ZM3.56 12a.94.94 0 1 1 1.88 0 .94.94 0 0 1-1.88 0ZM14.2 22c-.8 0-1.15-1.53-1.33-2.26-.2-.84-.41-1.72-.99-2.3-1.27-1.27-1.93-2.89-3.48-4.42a.47.47 0 0 1-.14-.33V4.34c0-.26.2-.46.46-.47a6.15 6.15 0 0 0 2.06-.63A11.21 11.21 0 0 1 15.44 2h.1c1.68 0 3.66.02 4.45 1.16.33.47.41 1.06.24 1.75.64.66.98 1.9.64 2.92.69.91.75 2.19.37 3.1.47.47.76 1.22.76 1.93a2.33 2.33 0 0 1-2.33 2.27H15.7c.29 1.1 1.3 2.03 1.3 3.69 0 2.87-1.88 3.18-2.81 3.18Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M18.75 7.38h-3.37c.06-.3.09-.59.09-.88 0-1.87-1.37-3.25-3.6-3.25-1.77 0-2.22 1.9-2.95 3.08-.3.48-.67.9-1.01 1.3H7.9c-.6.7-.9.93-1.18.93h-.1c-.23-.2-.53-.31-.87-.31h-2.5c-.69 0-1.25.5-1.25 1.13v9c0 .62.56 1.12 1.25 1.12h2.5c.34 0 .64-.12.86-.31h.1c1.13 0 2.63 1.56 4.98 1.56h.83c2.44 0 3.86-1.51 3.9-3.56.5-.7.73-1.6.63-2.45.14-.28.24-.57.3-.87h1.4A3.27 3.27 0 0 0 22 10.63a3.3 3.3 0 0 0-3.25-3.26Zm0 4.62h-3.56c.5.57.57 1.67-.19 2.38.44.77.07 1.79-.5 2.1.25 1.53-.4 2.4-1.98 2.4h-.83c-1.78 0-3.02-1.4-4.69-1.55v-6.9c.99-.13 1.68-.84 2.3-1.56.45-.49.86-.98 1.21-1.55.57-.92 1.02-2.2 1.37-2.2.9 0 1.71.35 1.71 1.38 0 1.38-1.03 2.07-1.03 2.75h6.19c.72 0 1.38.64 1.38 1.38A1.4 1.4 0 0 1 18.75 12ZM5.44 17a.94.94 0 1 1-1.88 0 .94.94 0 0 1 1.88 0Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M5.25 7.38h3.37a4.51 4.51 0 0 1-.09-.88c0-1.87 1.37-3.25 3.6-3.25 1.77 0 2.22 1.9 2.95 3.08.3.48.67.9 1.01 1.3h.01c.6.7.9.93 1.18.93h.1c.23-.2.53-.31.87-.31h2.5c.69 0 1.25.5 1.25 1.13v9c0 .62-.56 1.12-1.25 1.12h-2.5c-.34 0-.64-.12-.86-.31h-.1c-1.13 0-2.63 1.56-4.98 1.56h-.83c-2.44 0-3.86-1.51-3.9-3.56-.5-.7-.73-1.6-.63-2.45a3.64 3.64 0 0 1-.3-.87h-1.4A3.27 3.27 0 0 1 2 10.63a3.3 3.3 0 0 1 3.25-3.26Zm0 4.62h3.56c-.5.57-.57 1.67.19 2.38-.44.77-.07 1.79.5 2.1-.25 1.53.4 2.4 1.98 2.4h.83c1.78 0 3.02-1.4 4.69-1.55v-6.9c-.99-.13-1.68-.84-2.3-1.56-.45-.49-.86-.98-1.21-1.55-.57-.92-1.02-2.2-1.37-2.2-.9 0-1.71.35-1.71 1.38 0 1.38 1.03 2.07 1.03 2.75H5.25c-.72 0-1.38.64-1.38 1.38 0 .74.64 1.37 1.38 1.37Zm13.31 5a.94.94 0 1 0 1.88 0 .94.94 0 0 0-1.88 0Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm3.5 1.25h-.65a6.8 6.8 0 0 1-5.7 0H8.5a5.25 5.25 0 0 0-5.25 5.25v1.63c0 1.03.84 1.87 1.88 1.87h13.75c1.03 0 1.87-.84 1.87-1.88V18.5c0-2.9-2.35-5.25-5.25-5.25Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M7.38 5.25v3.37a4.51 4.51 0 0 0-.88-.09c-1.87 0-3.25 1.37-3.25 3.6 0 1.77 1.9 2.22 3.08 2.95.48.3.9.67 1.3 1.01v.01c.7.6.93.9.93 1.18v.1c-.2.23-.31.53-.31.87v2.5c0 .69.5 1.25 1.13 1.25h9c.62 0 1.12-.56 1.12-1.25v-2.5c0-.34-.12-.64-.31-.86v-.1c0-1.13 1.56-2.63 1.56-4.98v-.83c0-2.44-1.51-3.86-3.56-3.9-.7-.5-1.6-.73-2.45-.63a3.64 3.64 0 0 0-.87-.3v-1.4A3.27 3.27 0 0 0 10.63 2a3.3 3.3 0 0 0-3.26 3.25Zm4.62 0v3.56c.57-.5 1.67-.57 2.38.19.77-.44 1.79-.07 2.1.5 1.53-.25 2.4.4 2.4 1.98v.83c0 1.78-1.4 3.02-1.55 4.69h-6.9c-.13-.99-.84-1.68-1.56-2.3-.49-.45-.98-.86-1.55-1.21-.92-.57-2.2-1.02-2.2-1.37 0-.9.35-1.71 1.38-1.71 1.38 0 2.07 1.03 2.75 1.03V5.25c0-.72.64-1.38 1.38-1.38.74 0 1.37.64 1.37 1.38Zm5 13.31a.94.94 0 1 1 0 1.88.94.94 0 0 1 0-1.88Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M16.63 18.75v-3.37c.28.06.58.09.87.09 1.87 0 3.25-1.37 3.25-3.6 0-1.77-1.9-2.22-3.08-2.95-.48-.3-.9-.67-1.3-1.01V7.9c-.7-.6-.93-.9-.93-1.18v-.1c.2-.23.31-.53.31-.87v-2.5c0-.69-.5-1.25-1.13-1.25h-9C5 2 4.5 2.56 4.5 3.25v2.5c0 .34.12.64.31.86v.1c0 1.13-1.56 2.63-1.56 4.98v.83c0 2.44 1.51 3.86 3.56 3.9.7.5 1.6.73 2.45.63.28.14.57.24.87.3v1.4A3.27 3.27 0 0 0 13.37 22a3.3 3.3 0 0 0 3.26-3.25Zm-4.63 0v-3.56c-.57.5-1.67.57-2.38-.19-.77.44-1.79.07-2.1-.5-1.53.25-2.4-.4-2.4-1.98v-.83c0-1.78 1.4-3.02 1.55-4.69h6.9c.13.99.84 1.68 1.56 2.3.49.45.98.86 1.55 1.21.92.57 2.2 1.02 2.2 1.37 0 .9-.35 1.71-1.38 1.71-1.38 0-2.07-1.03-2.75-1.03v6.19c0 .72-.64 1.38-1.38 1.38A1.4 1.4 0 0 1 12 18.75ZM7 5.44a.94.94 0 1 1 0-1.88.94.94 0 0 1 0 1.88Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 18.06a8.07 8.07 0 1 1 .02-16.14A8.07 8.07 0 0 1 12 20.06Zm-3.23-8.7a1.29 1.29 0 1 0 0-2.58 1.29 1.29 0 0 0 0 2.57Zm6.46 0a1.29 1.29 0 1 0 0-2.58 1.29 1.29 0 0 0 0 2.57Zm.16 2.92a4.4 4.4 0 0 1-6.78 0 .97.97 0 0 0-1.36-.12.97.97 0 0 0-.13 1.36 6.33 6.33 0 0 0 9.75 0 .97.97 0 1 0-1.48-1.24Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 18.06a8.07 8.07 0 1 1 .02-16.14A8.07 8.07 0 0 1 12 20.06Zm-3.23-8.7a1.29 1.29 0 1 0 0-2.58 1.29 1.29 0 0 0 0 2.57Zm6.46-2.59a1.29 1.29 0 1 0 0 2.58 1.29 1.29 0 0 0 0-2.58Zm.32 5.81h-7.1a.97.97 0 0 0-.97.97c0 .53.44.97.97.97h7.1c.53 0 .97-.44.97-.97a.97.97 0 0 0-.97-.97Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 18.06a8.07 8.07 0 1 1 .02-16.14A8.07 8.07 0 0 1 12 20.06Zm-3.23-8.7a1.29 1.29 0 1 0 0-2.58 1.29 1.29 0 0 0 0 2.57Zm6.46-2.59a1.29 1.29 0 1 0 0 2.58 1.29 1.29 0 0 0 0-2.58ZM12 13.94c-1.62 0-3.15.7-4.19 1.96a.97.97 0 1 0 1.5 1.23 3.5 3.5 0 0 1 5.39 0c.32.4.93.48 1.36.13a.97.97 0 0 0 .13-1.36A5.44 5.44 0 0 0 12 13.94Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 2a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Zm1.88 5.63h-.45c-.89.4-1.94.42-2.86 0h-.45c-1.03 0-1.87.83-1.87 1.87v5.31c0 .52.42.94.94.94h.62v5.31c0 .52.42.94.94.94h2.5c.52 0 .94-.42.94-.94v-5.31h.62c.52 0 .94-.42.94-.94V9.5c0-1.04-.84-1.88-1.88-1.88Z"></path></svg>'
    ]
  },
  {
    title: "tool.icon.group.symbols&flags",
    icons: [
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M15.13 5.13c-1.92 0-3.64-1.25-6.32-1.25-1.23 0-2.28.25-3.16.59A1.88 1.88 0 1 0 2.94 5.5v15.88c0 .34.28.62.62.62h.63c.34 0 .62-.28.62-.63v-3.25a10.75 10.75 0 0 1 5-1.12c1.91 0 3.64 1.25 6.32 1.25 2.28 0 3.98-.88 5.02-1.56.53-.35.85-.94.85-1.57V5.75a1.87 1.87 0 0 0-2.61-1.73c-1.4.6-2.87 1.1-4.26 1.1Zm5 10a7.35 7.35 0 0 1-4 1.24c-2.34 0-3.98-1.25-6.32-1.25-1.7 0-3.77.37-5 .94V7a7.35 7.35 0 0 1 4-1.25c2.34 0 3.98 1.25 6.32 1.25 1.7 0 3.76-.68 5-1.25v9.38Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M11.35 9.42v2.66c1.02.23 1.92.6 2.87.87v-2.66c-1.02-.23-1.93-.6-2.87-.87Zm8.72-4.8a11.4 11.4 0 0 1-4.57 1.24c-2.1 0-3.82-1.36-6.45-1.36a7.6 7.6 0 0 0-2.66.47 2.19 2.19 0 1 0-3.3 1.01v15.08c0 .52.42.94.94.94h.63c.52 0 .94-.42.94-.94v-3.68c1.1-.48 2.48-.87 4.46-.87 2.1 0 3.82 1.36 6.46 1.36 1.88 0 3.38-.64 4.78-1.6.34-.23.54-.61.54-1.03v-9.5c0-.9-.94-1.5-1.77-1.13Zm-11.6 10.1c-1 .1-1.95.32-2.87.64v-2.75c1.02-.36 1.85-.59 2.87-.68v2.79Zm11.5-5.26c-.92.38-1.8.76-2.87.94v2.77c.96-.13 2-.46 2.87-1.01v2.75c-.98.63-1.9.97-2.87 1.06v-2.8a6.6 6.6 0 0 1-2.88-.22v2.64c-.93-.3-1.85-.66-2.87-.84v-2.67a8.68 8.68 0 0 0-2.88-.15V9.2c-.87.12-1.74.4-2.87.81V7.26c1.3-.48 1.95-.77 2.87-.86v2.8a6.64 6.64 0 0 1 2.88.22V6.79c.92.29 1.84.65 2.87.83v2.67c.93.2 1.86.27 2.88.1V7.6c1.05-.19 2.04-.53 2.87-.88v2.75Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M15.5 5.86c-2.1 0-3.82-1.36-6.46-1.36a7.6 7.6 0 0 0-2.65.47 2.19 2.19 0 1 0-3.3 1.01v15.08c0 .52.42.94.94.94h.63c.51 0 .93-.42.93-.94v-3.68c1.11-.48 2.49-.87 4.47-.87 2.1 0 3.83 1.36 6.46 1.36 1.88 0 3.38-.64 4.78-1.6.34-.23.54-.61.54-1.03v-9.5c0-.9-.94-1.51-1.77-1.13a11.37 11.37 0 0 1-4.57 1.25Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M20.06 4.45a5.34 5.34 0 0 0-7.29.53l-.77.8-.77-.8a5.34 5.34 0 0 0-7.29-.53 5.6 5.6 0 0 0-.38 8.12l7.55 7.8c.5.5 1.28.5 1.77 0l7.56-7.8a5.6 5.6 0 0 0-.38-8.12Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M10.93 3.1 8.49 8.03l-5.47.8a1.2 1.2 0 0 0-.66 2.04l3.95 3.85-.93 5.44a1.2 1.2 0 0 0 1.73 1.26L12 18.86l4.89 2.57a1.2 1.2 0 0 0 1.73-1.26l-.93-5.44 3.95-3.85c.7-.69.32-1.9-.66-2.04l-5.47-.8-2.44-4.95a1.2 1.2 0 0 0-2.14 0Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="m20.98 8.84-5.47-.8-2.44-4.95a1.2 1.2 0 0 0-2.14 0L8.49 8.04l-5.47.8a1.2 1.2 0 0 0-.66 2.04l3.95 3.85-.93 5.44a1.2 1.2 0 0 0 1.73 1.26L12 18.86l4.89 2.57a1.2 1.2 0 0 0 1.73-1.26l-.93-5.44 3.95-3.85c.7-.69.32-1.9-.66-2.04Zm-5.22 5.26.89 5.18L12 16.84l-4.65 2.44.89-5.18-3.76-3.66 5.2-.75L12 4.97l2.33 4.72 5.2.75-3.77 3.66Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M18.93 12.68v3.84c0 .96-.34 1.78-1.01 2.46A3.33 3.33 0 0 1 15.47 20h-10c-.96 0-1.78-.34-2.45-1.02A3.36 3.36 0 0 1 2 16.52V6.48c0-.96.34-1.78 1.02-2.46A3.33 3.33 0 0 1 5.46 3h10.01c.5 0 .97.1 1.4.3.13.06.2.15.22.28a.38.38 0 0 1-.1.35l-.6.6a.38.38 0 0 1-.27.11c-.03 0-.06 0-.1-.02a2.13 2.13 0 0 0-.55-.07h-10c-.54 0-.99.18-1.37.56-.37.38-.56.84-.56 1.37v10.04c0 .53.19.99.56 1.37.38.38.83.56 1.36.56h10.01c.53 0 .98-.18 1.36-.56.38-.38.56-.84.56-1.37v-3.06c0-.1.04-.2.11-.27l.77-.77a.38.38 0 0 1 .28-.12c.05 0 .1 0 .14.03.16.07.24.18.24.35Zm2.78-5.9-9.79 9.83c-.2.19-.42.29-.68.29-.27 0-.5-.1-.69-.3l-5.17-5.18a.94.94 0 0 1-.29-.7c0-.26.1-.49.29-.68L6.7 8.7c.2-.2.42-.29.69-.29.26 0 .5.1.68.3l3.17 3.17 7.78-7.82c.19-.19.42-.29.68-.29.27 0 .5.1.69.3L21.7 5.4c.2.2.29.43.29.7 0 .26-.1.49-.29.68Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="m8.8 19.16-6.5-6.5a1 1 0 0 1 0-1.41l1.4-1.41a1 1 0 0 1 1.42 0L9.5 14.2l9.38-9.37a1 1 0 0 1 1.41 0l1.42 1.41a1 1 0 0 1 0 1.41l-11.5 11.5a1 1 0 0 1-1.42 0Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="m15.8 12 5.68-5.69c.7-.7.7-1.82 0-2.52L20.2 2.52c-.7-.7-1.83-.7-2.52 0L12 8.21 6.31 2.52c-.7-.7-1.82-.7-2.52 0L2.52 3.8c-.7.7-.7 1.83 0 2.52L8.21 12l-5.69 5.69c-.7.7-.7 1.82 0 2.52l1.27 1.27c.7.7 1.83.7 2.52 0L12 15.79l5.69 5.69c.7.7 1.83.7 2.52 0l1.27-1.27c.7-.7.7-1.83 0-2.52L15.79 12Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M17.71 4.15a9.84 9.84 0 1 1-11.44 0 .96.96 0 0 1 1.4.3l.62 1.12c.24.42.13.95-.26 1.23a6.66 6.66 0 1 0 7.93 0 .95.95 0 0 1-.25-1.23l.62-1.11a.95.95 0 0 1 1.38-.31Zm-4.12 8.33V2.95a.95.95 0 0 0-.96-.95h-1.27a.95.95 0 0 0-.95.95v9.53c0 .52.43.95.96.95h1.26c.53 0 .96-.43.96-.95Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M8.49 13.08H6.86c-.3 0-.54.24-.54.54v6.49c0 .3.25.54.54.54H8.5c.3 0 .54-.24.54-.54v-6.49c0-.3-.24-.54-.54-.54Zm-4.33 3.24H2.54c-.3 0-.54.25-.54.54v3.25c0 .3.24.54.54.54h1.62c.3 0 .54-.24.54-.54v-3.25c0-.3-.24-.54-.54-.54Zm8.65-6.48H11.2c-.3 0-.54.24-.54.54v9.73c0 .3.24.54.54.54h1.62c.3 0 .54-.24.54-.54v-9.73c0-.3-.24-.54-.54-.54Zm4.33-3.25H15.5c-.3 0-.54.25-.54.55V20.1c0 .3.24.54.54.54h1.63c.3 0 .54-.24.54-.54V7.14c0-.3-.25-.55-.54-.55Zm4.32-3.24h-1.62c-.3 0-.54.24-.54.54v16.22c0 .3.24.54.54.54h1.62c.3 0 .54-.24.54-.54V3.89c0-.3-.24-.54-.54-.54Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M16.63 7.05a6.78 6.78 0 0 0-11.2 3.29.49.49 0 0 1-.47.37H2.65a.48.48 0 0 1-.48-.57 10 10 0 0 1 16.74-5.37l1.44-1.44A.97.97 0 0 1 22 4v5.4c0 .54-.43.98-.97.98h-5.4a.97.97 0 0 1-.69-1.65l1.69-1.69ZM2.97 13.61h5.4a.97.97 0 0 1 .69 1.66l-1.69 1.68a6.78 6.78 0 0 0 11.2-3.29.49.49 0 0 1 .47-.37h2.31c.3 0 .53.27.48.57a10 10 0 0 1-16.74 5.37l-1.44 1.44A.97.97 0 0 1 2 20v-5.4c0-.54.43-.98.97-.98Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M21.52 2h-1.88a.48.48 0 0 0-.47.5l.16 3.29a9.81 9.81 0 0 0-7.5-3.47 9.83 9.83 0 1 0 6.59 17.14.48.48 0 0 0 .02-.7l-1.34-1.34a.48.48 0 0 0-.65-.02 6.98 6.98 0 1 1 1.18-9.14l-4.03-.19a.48.48 0 0 0-.5.48v1.88a.48.48 0 0 0 .48.47h7.94a.48.48 0 0 0 .48-.47V2.48a.48.48 0 0 0-.48-.47Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 3.94a8.06 8.06 0 1 1 0 16.12 8.06 8.06 0 0 1 0-16.12ZM12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 6.77a3.23 3.23 0 1 0 0 6.46 3.23 3.23 0 0 0 0-6.46Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M11.23 21.6C5.55 13.37 4.5 12.52 4.5 9.5a7.5 7.5 0 1 1 15 0c0 3.02-1.05 3.87-6.73 12.1a.94.94 0 0 1-1.54 0Zm.77-8.98a3.12 3.12 0 1 0 0-6.24 3.12 3.12 0 0 0 0 6.25Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M19.86 22H4.14A2.14 2.14 0 0 1 2 19.86V4.14C2 2.96 2.96 2 4.14 2h15.72C21.04 2 22 2.96 22 4.14v15.72c0 1.18-.96 2.14-2.14 2.14Zm-9.14-4.38 8.21-8.21a.71.71 0 0 0 0-1.01l-1-1.01a.71.71 0 0 0-1.02 0l-6.7 6.7-3.12-3.13a.71.71 0 0 0-1.01 0l-1.01 1a.71.71 0 0 0 0 1.02l4.64 4.64c.28.28.73.28 1 0Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm5.8 11.13c0 .27-.21.48-.48.48h-3.7v3.71c0 .27-.22.49-.5.49h-2.25a.49.49 0 0 1-.48-.49v-3.7H6.68a.49.49 0 0 1-.49-.5v-2.25c0-.27.22-.48.49-.48h3.7V6.68c0-.27.22-.49.5-.49h2.25c.27 0 .48.22.48.49v3.7h3.71c.27 0 .49.22.49.5v2.25Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20ZM6.68 13.61a.49.49 0 0 1-.49-.48v-2.26c0-.27.22-.48.49-.48h10.64c.27 0 .49.21.49.48v2.26c0 .27-.22.48-.49.48H6.68Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm4.9 12.63c.2.18.2.5 0 .68l-1.6 1.6a.48.48 0 0 1-.68 0L12 14.25 9.37 16.9a.48.48 0 0 1-.68 0l-1.6-1.6a.48.48 0 0 1 0-.68L9.75 12 7.1 9.37a.48.48 0 0 1 0-.68l1.6-1.6c.18-.19.49-.19.68 0L12 9.74l2.63-2.64c.18-.2.5-.2.68 0l1.6 1.6c.19.18.19.49 0 .68L14.26 12l2.64 2.63Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Zm-9.73-6.7c-2.2 0-3.6.93-4.7 2.58-.14.21-.1.5.1.65l1.4 1.06c.22.16.52.13.68-.08.72-.92 1.21-1.45 2.31-1.45.82 0 1.84.53 1.84 1.33 0 .6-.5.92-1.3 1.37-.96.54-2.21 1.2-2.21 2.85v.16c0 .27.21.49.48.49h2.26c.27 0 .48-.22.48-.49v-.05c0-1.15 3.36-1.2 3.36-4.3 0-2.34-2.43-4.11-4.7-4.11Zm-.27 10a1.86 1.86 0 1 0 0 3.72 1.86 1.86 0 0 0 0-3.71Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Zm-11.16 5.3 7.42-7.42a.65.65 0 0 0 0-.92l-.91-.9a.65.65 0 0 0-.91 0l-6.05 6.04-2.83-2.82a.65.65 0 0 0-.91 0l-.91.9a.65.65 0 0 0 0 .92l4.2 4.2c.24.25.65.25.9 0Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 4.44a1.7 1.7 0 1 1 0 3.38 1.7 1.7 0 0 1 0-3.38Zm2.26 10.24c0 .26-.22.48-.49.48h-3.54a.48.48 0 0 1-.49-.48v-.97c0-.27.22-.48.49-.48h.48v-2.58h-.48a.48.48 0 0 1-.49-.49v-.97c0-.26.22-.48.49-.48h2.58c.26 0 .48.22.48.48v4.04h.48c.27 0 .49.21.49.48v.97Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M21.53 10.75h-1.18a8.44 8.44 0 0 0-7.1-7.1V2.47a.47.47 0 0 0-.47-.47h-1.56a.47.47 0 0 0-.47.47v1.18a8.44 8.44 0 0 0-7.1 7.1H2.47a.47.47 0 0 0-.47.47v1.56c0 .26.21.47.47.47h1.18a8.44 8.44 0 0 0 7.1 7.1v1.18c0 .26.21.47.47.47h1.56c.26 0 .47-.21.47-.47v-1.18a8.44 8.44 0 0 0 7.1-7.1h1.18c.26 0 .47-.21.47-.47v-1.56a.47.47 0 0 0-.47-.47Zm-8.28 7.06v-1.6a.47.47 0 0 0-.47-.46h-1.56a.47.47 0 0 0-.47.47v1.59a5.94 5.94 0 0 1-4.56-4.56h1.6c.25 0 .46-.21.46-.47v-1.56a.47.47 0 0 0-.47-.47H6.2a5.94 5.94 0 0 1 4.56-4.56v1.6c0 .25.21.46.47.46h1.56c.26 0 .47-.21.47-.47V6.2a5.94 5.94 0 0 1 4.56 4.56h-1.6a.47.47 0 0 0-.46.47v1.56c0 .26.21.47.47.47h1.59a5.94 5.94 0 0 1-4.56 4.56Zm0-5.81a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 18.06a8.06 8.06 0 1 1 0-16.12 8.06 8.06 0 0 1 0 16.12ZM16.1 9.5 13.6 12l2.5 2.5c.2.2.2.5 0 .7l-.9.9a.48.48 0 0 1-.7 0L12 13.6l-2.5 2.5a.48.48 0 0 1-.7 0l-.9-.9a.48.48 0 0 1 0-.7l2.5-2.5-2.5-2.5a.48.48 0 0 1 0-.7l.9-.9c.2-.2.5-.2.7 0l2.5 2.5 2.5-2.5c.2-.2.5-.2.7 0l.9.9c.2.2.2.5 0 .7Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 1.94a8.06 8.06 0 1 1 0 16.12 8.06 8.06 0 0 1 0-16.12Zm5.65 5.25-.9-.92a.48.48 0 0 0-.69 0l-5.7 5.65-2.41-2.43a.48.48 0 0 0-.68 0l-.92.9c-.19.2-.2.5 0 .7L10 16.76c.19.2.5.2.68 0l6.96-6.9c.19-.19.2-.5 0-.68Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm5.25 4.75a7.42 7.42 0 0 1 .83 9.5L7.74 5.93a7.42 7.42 0 0 1 9.5.83Zm-10.5 10.5a7.42 7.42 0 0 1-.83-9.5l10.34 10.33a7.42 7.42 0 0 1-9.5-.83Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M20.57 9.86h-6.43V3.43c0-.79-.64-1.43-1.43-1.43H11.3c-.8 0-1.43.64-1.43 1.43v6.43H3.43c-.79 0-1.43.64-1.43 1.43v1.42c0 .8.64 1.43 1.43 1.43h6.43v6.43c0 .79.64 1.43 1.43 1.43h1.42c.8 0 1.43-.64 1.43-1.43v-6.43h6.43c.79 0 1.43-.64 1.43-1.43V11.3c0-.8-.64-1.43-1.43-1.43Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M20.57 9.86H3.43c-.79 0-1.43.64-1.43 1.43v1.42c0 .8.64 1.43 1.43 1.43h17.14c.79 0 1.43-.64 1.43-1.43V11.3c0-.8-.64-1.43-1.43-1.43Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M20.68 15.05 15.13 12l5.55-3.05a.94.94 0 0 0 .36-1.3l-.76-1.3a.94.94 0 0 0-1.3-.34l-5.42 3.28.14-6.33a.94.94 0 0 0-.94-.96h-1.52a.94.94 0 0 0-.94.96l.14 6.33-5.42-3.28a.94.94 0 0 0-1.3.33l-.76 1.32a.94.94 0 0 0 .36 1.29L8.87 12l-5.55 3.05a.94.94 0 0 0-.36 1.3l.76 1.3c.26.46.85.61 1.3.34l5.42-3.28-.14 6.33c-.01.53.41.96.94.96h1.52c.53 0 .95-.43.94-.96l-.14-6.33 5.42 3.28a.94.94 0 0 0 1.3-.33l.76-1.32a.94.94 0 0 0-.36-1.29Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Zm-10 2.02a1.85 1.85 0 1 0 0 3.7 1.85 1.85 0 0 0 0-3.7Zm-1.76-6.67.3 5.48c.01.26.22.46.48.46h1.96c.26 0 .47-.2.48-.46l.3-5.48a.48.48 0 0 0-.48-.51h-2.56c-.28 0-.5.23-.48.5Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M21.77 18.39a1.67 1.67 0 0 1-1.44 2.5H3.67a1.67 1.67 0 0 1-1.45-2.5l8.34-14.45a1.67 1.67 0 0 1 2.88 0l8.33 14.45ZM12 15.4a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2Zm-1.52-5.74.26 4.72c.01.22.2.4.42.4h1.68c.22 0 .4-.18.42-.4l.26-4.72a.42.42 0 0 0-.42-.44h-2.2c-.24 0-.43.2-.42.44Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M21.88 11.5A11.14 11.14 0 0 0 12 5.32c-4.27 0-8 2.5-9.88 6.16a1.12 1.12 0 0 0 0 1.02A11.14 11.14 0 0 0 12 18.67c4.27 0 8-2.5 9.88-6.16a1.12 1.12 0 0 0 0-1.02ZM12 17a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm0-8.33c-.3 0-.6.05-.88.13a1.66 1.66 0 0 1-2.32 2.32A3.33 3.33 0 1 0 12 8.67Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 16.5a4.48 4.48 0 0 1-4.47-4.16L4.26 9.81c-.43.54-.83 1.1-1.15 1.73a1.01 1.01 0 0 0 0 .92C4.8 15.76 8.16 18 12 18c.84 0 1.65-.13 2.43-.33l-1.62-1.25a4.5 4.5 0 0 1-.81.08Zm9.8 1.82-3.45-2.67a10.35 10.35 0 0 0 2.54-3.2 1.01 1.01 0 0 0 0-.9A10.02 10.02 0 0 0 12 6c-1.6 0-3.2.4-4.6 1.18L3.42 4.1a.5.5 0 0 0-.7.08L2.1 5a.5.5 0 0 0 .08.7l18.39 14.2a.5.5 0 0 0 .7-.08l.61-.8a.5.5 0 0 0-.08-.7Zm-5.73-4.44-1.23-.95a2.96 2.96 0 0 0-3.63-3.81c.19.25.29.56.29.88 0 .1-.02.21-.05.31l-2.3-1.78a4.45 4.45 0 0 1 6.03.29 4.5 4.5 0 0 1 .89 5.06Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 3.25c-5.52 0-10 3.64-10 8.13 0 1.93.84 3.7 2.23 5.1a9.94 9.94 0 0 1-2.14 3.74.31.31 0 0 0-.06.34.3.3 0 0 0 .28.19 8.93 8.93 0 0 0 5.5-2c1.27.47 2.69.75 4.19.75 5.52 0 10-3.64 10-8.13 0-4.48-4.48-8.12-10-8.12Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M19.9 4.51c-2.25-1.9-5.74-1.61-7.9.59-2.16-2.2-5.65-2.5-7.9-.59a5.91 5.91 0 0 0-.42 8.64l6.85 6.98a2.05 2.05 0 0 0 2.94 0l6.85-6.98a5.91 5.91 0 0 0-.41-8.64Zm-.92 7.32-6.85 6.98c-.1.1-.17.1-.26 0l-6.85-6.98a4.03 4.03 0 0 1 .28-5.88c1.52-1.28 3.86-1.09 5.33.4L12 7.76l1.37-1.4c1.47-1.5 3.82-1.68 5.33-.4 2 1.68 1.7 4.44.28 5.88Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="m19.91 12 1.8-1.76a.93.93 0 0 0-.42-1.58l-2.44-.62.69-2.42a.95.95 0 0 0-1.16-1.16l-2.42.69-.63-2.45a.94.94 0 0 0-1.57-.42L12 4.1l-1.76-1.8a.94.94 0 0 0-1.57.4l-.63 2.46-2.42-.7a.95.95 0 0 0-1.16 1.17l.7 2.42-2.45.62a.93.93 0 0 0-.42 1.58L4.09 12l-1.8 1.75a.93.93 0 0 0 .42 1.58l2.44.63-.69 2.42a.95.95 0 0 0 1.16 1.16l2.42-.7.63 2.45a.93.93 0 0 0 1.57.42l1.76-1.8 1.76 1.8c.49.53 1.4.3 1.57-.42l.63-2.44 2.42.69a.95.95 0 0 0 1.16-1.16l-.7-2.42 2.45-.63a.93.93 0 0 0 .42-1.58L19.91 12Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 3.25c-5.52 0-10 3.64-10 8.13 0 1.85.78 3.56 2.07 4.93a9.91 9.91 0 0 1-1.81 2.86.94.94 0 0 0 .68 1.58c2.4 0 4.3-1 5.43-1.8 1.13.35 2.35.55 3.63.55 5.52 0 10-3.64 10-8.12 0-4.5-4.48-8.13-10-8.13Zm0 14.37c-1.04 0-2.07-.16-3.06-.47l-.89-.28-.76.54a8.4 8.4 0 0 1-2.24 1.13c.28-.47.56-1 .77-1.57l.42-1.1-.8-.85c-.72-.75-1.56-2-1.56-3.64 0-3.45 3.64-6.25 8.12-6.25 4.48 0 8.13 2.8 8.13 6.25 0 3.44-3.65 6.24-8.13 6.24Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M13.88 3.88a1.88 1.88 0 1 1-3.76 0 1.88 1.88 0 0 1 3.76 0ZM12 18.24A1.88 1.88 0 1 0 12 22a1.88 1.88 0 0 0 0-3.75Zm8.13-8.13a1.88 1.88 0 1 0 0 3.76 1.88 1.88 0 0 0 0-3.76ZM5.74 12A1.88 1.88 0 1 0 2 12a1.88 1.88 0 0 0 3.75 0Zm.5 3.87a1.88 1.88 0 1 0 0 3.75 1.88 1.88 0 0 0 0-3.75Zm11.5 0a1.88 1.88 0 1 0 0 3.75 1.88 1.88 0 0 0 0-3.75ZM6.25 4.38a1.87 1.87 0 1 0 0 3.75 1.87 1.87 0 0 0 0-3.75Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="m20.98 8.85-5.47-.8-2.44-4.94A1.19 1.19 0 0 0 12 2.45c-.43 0-.85.22-1.07.66L8.49 8.05l-5.47.8a1.2 1.2 0 0 0-.66 2.03l3.95 3.85-.93 5.42a1.2 1.2 0 0 0 1.73 1.26L12 18.85l4.88 2.56a1.2 1.2 0 0 0 1.73-1.26l-.92-5.42 3.95-3.85a1.2 1.2 0 0 0-.66-2.03Zm-4.55 4.6-.67.65.16.93.73 4.23-3.82-2-.83-.43V4.99l1.9 3.85.42.85.93.13 4.27.63-3.09 3Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M19.36 2.14 3.12 9.64c-1.87.87-1.25 3.62.75 3.62h6.87v6.87c0 2 2.75 2.62 3.63.75l7.5-16.24c.62-1.5-1-3.13-2.5-2.5Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 6.44a5.56 5.56 0 1 1-.01 11.13A5.56 5.56 0 0 1 12 6.44ZM12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12.02 2A7.57 7.57 0 0 0 5.3 5.56c-.3.4-.2.98.2 1.28l1.68 1.28c.4.3.98.23 1.3-.16.98-1.23 1.7-1.94 3.23-1.94 1.2 0 2.7.78 2.7 1.94 0 .88-.73 1.34-1.92 2-1.38.78-3.22 1.74-3.22 4.16v.38c0 .52.42.94.94.94h2.83c.52 0 .94-.42.94-.94v-.23c0-1.67 4.9-1.74 4.9-6.27 0-3.41-3.55-6-6.86-6Zm-.4 14.59a2.7 2.7 0 1 0 .01 5.42 2.7 2.7 0 0 0 0-5.42Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M9.03 18.57h.78v-5.64h-.78a.78.78 0 0 1-.78-.78v-1.87c0-.43.35-.78.78-.78h4.38c.43 0 .78.35.78.78v8.3h.78c.43 0 .78.34.78.77v1.87c0 .43-.35.78-.78.78H9.03a.78.78 0 0 1-.78-.78v-1.87c0-.43.35-.78.78-.78ZM12 2a2.81 2.81 0 1 0 0 5.62A2.81 2.81 0 0 0 12 2Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M15.13 18.88a3.13 3.13 0 1 1-6.26-.01 3.13 3.13 0 0 1 6.26 0Zm-5.9-15.9.54 10.63c.02.5.43.89.93.89h2.6c.5 0 .9-.4.93-.9l.53-10.62a.94.94 0 0 0-.93-.98h-3.66a.94.94 0 0 0-.93.98Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 17.42a7.42 7.42 0 1 1 0-14.83 7.42 7.42 0 0 1 0 14.83Zm0-12.58a5.16 5.16 0 1 0 0 10.32 5.16 5.16 0 0 0 0-10.32Zm0 7.74a2.58 2.58 0 1 1 0-5.17 2.58 2.58 0 0 1 0 5.17Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M9.75 15.03c0 .87-.45 2.3-1.53 2.3-1.07 0-1.52-1.43-1.52-2.3 0-.87.45-2.3 1.52-2.3 1.08 0 1.53 1.43 1.53 2.3ZM22 12.93c0 1.32-.13 2.73-.73 3.95-1.58 3.2-5.92 3.12-9.03 3.12-3.16 0-7.76.11-9.4-3.12A8.92 8.92 0 0 1 2 12.92c0-1.74.58-3.4 1.73-4.73a6.52 6.52 0 0 1-.32-2.03c0-.9.2-1.35.6-2.16 1.9 0 3.1.37 4.54 1.5a15.96 15.96 0 0 1 7.05-.03A6.44 6.44 0 0 1 20.09 4c.4.81.6 1.26.6 2.16 0 .68-.1 1.36-.32 2A7.18 7.18 0 0 1 22 12.93Zm-2.68 2.1c0-1.83-1.11-3.44-3.06-3.44-.79 0-1.54.14-2.34.25a12.25 12.25 0 0 1-3.75 0c-.78-.11-1.54-.25-2.34-.25-1.95 0-3.06 1.61-3.06 3.44 0 3.66 3.35 4.22 6.27 4.22h2c2.94 0 6.28-.56 6.28-4.22Zm-3.44-2.3c-1.08 0-1.53 1.43-1.53 2.3 0 .87.45 2.3 1.53 2.3 1.07 0 1.53-1.43 1.53-2.3 0-.87-.46-2.3-1.53-2.3Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M11.87 6.82c.04.02.07.06.12.06.04 0 .1-.01.11-.06.01-.05-.07-.09-.12-.1-.07-.04-.16-.05-.22-.01-.01 0-.03.02-.02.04.01.05.09.04.13.07Zm-.85.06c.04 0 .07-.04.11-.06.05-.03.12-.02.14-.07 0-.01 0-.03-.02-.04-.07-.03-.15-.02-.22 0-.05.03-.13.06-.12.12 0 .04.07.06.1.05Zm8.63 10.9c-.14-.16-.2-.46-.28-.78-.07-.31-.15-.65-.41-.87a1.05 1.05 0 0 0-.32-.2 4.52 4.52 0 0 0-.14-3.08 10.42 10.42 0 0 0-1.82-2.9c-.66-.85-1.31-1.65-1.3-2.82.02-1.8.2-5.13-2.96-5.13-4 0-3 4.04-3.04 5.28a4.53 4.53 0 0 1-.88 2.53c-.74.88-1.78 2.3-2.27 3.78-.24.7-.35 1.4-.25 2.08-.25.22-.44.57-.64.79-.17.16-.4.23-.67.32-.26.1-.54.23-.72.57a1 1 0 0 0-.1.48c0 .15.01.3.04.46.04.32.1.61.03.81-.2.57-.23.96-.09 1.24.15.29.45.41.79.48.67.14 1.6.1 2.31.5.78.4 1.56.54 2.19.4.45-.1.82-.38 1-.8.5 0 1.04-.2 1.9-.25.58-.05 1.3.2 2.15.16.02.09.05.18.1.26.32.66.93.96 1.57.9a2.85 2.85 0 0 0 1.89-1.09c.53-.64 1.4-.9 1.98-1.25.3-.18.53-.4.55-.72.01-.32-.17-.67-.6-1.16ZM11.98 5.4c.39-.87 1.34-.85 1.72-.02.26.56.14 1.21-.16 1.58l-.5-.19c.05-.05.12-.1.16-.18.18-.46-.01-1.05-.36-1.07-.29-.01-.54.43-.46.9a2.78 2.78 0 0 0-.5-.17c-.05-.27-.02-.57.1-.85Zm-1.59-.45c.4 0 .82.56.75 1.3-.14.05-.28.1-.4.19.05-.35-.13-.79-.37-.77-.33.03-.39.83-.07 1.1.04.03.07 0-.23.22-.61-.57-.41-2.04.32-2.04Zm-.53 2.37.55-.4c.19-.18.53-.56 1.1-.56.27 0 .6.09 1 .34.25.16.45.18.89.37.33.13.53.38.4.7-.1.29-.42.57-.88.72-.43.14-.77.62-1.49.58-.15-.01-.27-.04-.38-.08-.3-.14-.47-.41-.78-.59-.33-.19-.51-.4-.57-.6-.06-.19 0-.35.16-.48ZM10 20.38c-.1 1.37-1.71 1.34-2.94.7-1.17-.62-2.68-.25-2.99-.85-.09-.19-.09-.5.1-1.04.1-.3.03-.63-.02-.94-.05-.3-.07-.58.04-.78.13-.26.33-.35.57-.44.4-.14.47-.13.77-.39.21-.22.37-.5.56-.7.2-.21.39-.32.69-.27.32.05.59.27.86.63l.76 1.39c.37.77 1.68 1.89 1.6 2.69Zm-.05-1.01a8.38 8.38 0 0 0-.56-.77c.27 0 .55-.09.65-.35.09-.24 0-.58-.3-.97-.52-.71-1.49-1.27-1.49-1.27a2.11 2.11 0 0 1-.96-1.17 2.64 2.64 0 0 1-.01-1.37c.2-.9.73-1.77 1.06-2.31.1-.07.03.12-.34.8-.33.64-.95 2.09-.1 3.23.02-.81.22-1.64.54-2.4.47-1.08 1.46-2.93 1.54-4.4.04.02.17.12.24.15.18.1.31.26.49.4.48.4 1.11.36 1.66.05.24-.14.43-.3.62-.35.38-.12.7-.34.87-.59.3 1.2 1 2.9 1.45 3.74.24.45.72 1.39.92 2.53.13 0 .28.01.43.05.54-1.4-.46-2.9-.91-3.32-.19-.18-.2-.25-.1-.25.49.44 1.14 1.32 1.37 2.3.11.46.13.93.02 1.4.64.26 1.4.7 1.2 1.36h-.17c.13-.4-.15-.69-.89-1.02-.76-.34-1.4-.34-1.5.49-.47.16-.7.57-.83 1.06-.11.44-.14.97-.17 1.56-.02.3-.14.7-.27 1.13-1.25.9-3 1.29-4.46.29Zm10.05-.45c-.03.65-1.6.77-2.47 1.81a2.6 2.6 0 0 1-1.7 1 1.28 1.28 0 0 1-1.32-.75c-.18-.44-.09-.9.05-1.42.14-.56.36-1.13.38-1.59.03-.6.07-1.11.17-1.51.1-.4.26-.67.53-.82l.04-.02c.03.51.29 1.04.74 1.15.49.13 1.2-.3 1.5-.64.35-.01.6-.03.88.2.39.33.28 1.18.67 1.63.41.45.54.76.53.96ZM10.02 7.8l.3.28c.27.2.63.4 1.07.4.46 0 .88-.22 1.25-.41.19-.1.42-.28.57-.4.16-.14.24-.25.13-.27-.11 0-.1.1-.24.2-.17.13-.38.3-.54.39-.29.16-.76.4-1.17.4-.4 0-.73-.2-.97-.38l-.3-.27c-.06-.06-.08-.18-.17-.2-.06 0-.07.15.07.26Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M17.65 12.57c-.01-1.64.73-2.88 2.23-3.79A4.8 4.8 0 0 0 16.1 6.8c-1.59-.12-3.32.93-3.95.93-.67 0-2.2-.88-3.41-.88-2.5.04-5.14 1.98-5.14 5.94 0 1.17.21 2.38.64 3.63.57 1.64 2.63 5.66 4.79 5.59 1.12-.03 1.92-.8 3.38-.8 1.42 0 2.16.8 3.41.8 2.17-.03 4.04-3.68 4.58-5.33-2.9-1.37-2.75-4.02-2.75-4.1Zm-2.53-7.33c1.22-1.45 1.1-2.77 1.07-3.24a4.73 4.73 0 0 0-3.03 1.56 4.27 4.27 0 0 0-1.14 3.2c1.16.1 2.23-.5 3.1-1.52Z"></path></svg>'
    ]
  },
  {
    title: "tool.icon.group.nature",
    icons: [
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M20.97 3.45c-.2-.44-.75-.45-.99-.04a5.95 5.95 0 0 1-5.2 3.03H12a6.67 6.67 0 0 0-6.67 6.67c0 .24.03.48.05.71 2.22-1.58 5.42-2.93 9.95-2.93.3 0 .56.25.56.55 0 .31-.25.56-.56.56C6.6 12 2.9 17.35 2.08 19.36a1.11 1.11 0 0 0 2.06.85c.05-.13.73-1.67 2.5-3.15a6.65 6.65 0 0 0 6.07 2.68c5.45-.4 9.29-5.29 9.29-11.27 0-1.75-.38-3.55-1.03-5.02Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="m21.3 10.67-2.33-1.58.53-2.78a1.59 1.59 0 0 0-1.85-1.85l-2.77.53-1.57-2.34c-.6-.87-2.03-.87-2.62 0L9.11 5l-2.76-.53A1.58 1.58 0 0 0 4.5 6.32l.53 2.77-2.33 1.58a1.58 1.58 0 0 0 0 2.62l2.33 1.58-.53 2.77a1.58 1.58 0 0 0 1.85 1.86l2.76-.54 1.58 2.34a1.58 1.58 0 0 0 2.62 0l1.57-2.34 2.77.54c.53.1 1.05-.06 1.42-.43.37-.38.53-.9.43-1.42l-.53-2.78 2.33-1.58a1.58 1.58 0 0 0 0-2.62ZM16.9 14l.68 3.56-3.55-.68-2.03 3-2.03-3-3.55.68.69-3.56-3-2.03 3-2.03-.69-3.57 3.56.7 2.02-3 2.03 3 3.55-.7-.69 3.57 3 2.03-3 2.03ZM12 7.94a4.07 4.07 0 1 0 .01 8.14A4.07 4.07 0 0 0 12 7.94Zm0 6.25a2.19 2.19 0 1 1 0-4.38 2.19 2.19 0 0 1 0 4.38Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12.9 22c3.08 0 5.9-1.4 7.77-3.7a1.88 1.88 0 0 0-1.8-3.03 5.2 5.2 0 0 1-3.55-9.63 1.88 1.88 0 0 0-.6-3.47A10 10 0 1 0 12.9 22Zm0-18.13c.51 0 1 .05 1.49.14a7.07 7.07 0 0 0 4.83 13.1A8.1 8.1 0 0 1 4.78 12a8.13 8.13 0 0 1 8.12-8.13Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M22 13.29c-.02.68-.6 1.21-1.28 1.21h-2.16v.63c0 .85-.19 1.66-.53 2.38l2.35 2.36a1.25 1.25 0 0 1-1.76 1.76l-2.14-2.13a5.6 5.6 0 0 1-3.54 1.25v-9.53a.47.47 0 0 0-.47-.47h-.94a.47.47 0 0 0-.47.47v9.53a5.6 5.6 0 0 1-3.54-1.25l-2.14 2.13a1.25 1.25 0 0 1-1.76-1.76l2.35-2.36a5.6 5.6 0 0 1-.53-2.39v-.62H3.28c-.69 0-1.26-.53-1.28-1.21-.02-.71.55-1.29 1.25-1.29h2.19V9.7L3.62 7.89a1.25 1.25 0 0 1 1.76-1.76l2.14 2.13h8.96l2.14-2.13a1.25 1.25 0 0 1 1.76 1.76l-1.82 1.83V12h2.19c.7 0 1.27.58 1.25 1.29ZM12.04 2a4.37 4.37 0 0 0-4.38 4.38h8.75A4.37 4.37 0 0 0 12.04 2Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M17.31 8.25h-4.5l1.66-5.07a.94.94 0 0 0-.9-1.18H7.93a.94.94 0 0 0-.93.81L5.76 12.2a.94.94 0 0 0 .93 1.06h4.63l-1.8 7.6a.94.94 0 0 0 1.73.68l6.87-11.87a.94.94 0 0 0-.8-1.41Z"></path></svg>'
    ]
  },
  {
    title: "tool.icon.group.nature",
    icons: [
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M18.73 19.04a.54.54 0 0 0-.64-.42c-.48.11-1.22.25-2.03.25a5.75 5.75 0 0 1-5.42-3.82h5.07a.53.53 0 0 0 .53-.42l.28-1.26a.54.54 0 0 0-.52-.66h-6a9.64 9.64 0 0 1 .01-1.88h6.55a.54.54 0 0 0 .52-.42l.3-1.33a.54.54 0 0 0-.53-.65h-6.18a5.6 5.6 0 0 1 5.26-3.35c.64 0 1.27.1 1.69.18.27.06.55-.1.62-.38l.54-1.98a.54.54 0 0 0-.42-.67A13 13 0 0 0 16 2a9.54 9.54 0 0 0-9.14 6.43H5.4c-.3 0-.54.24-.54.53v1.33c0 .3.24.54.54.54h.96c-.04.6-.05 1.3 0 1.88H5.4c-.3 0-.54.24-.54.54v1.27c0 .3.24.53.54.53h1.34A9.35 9.35 0 0 0 16.01 22c1.17 0 2.16-.2 2.72-.35a.54.54 0 0 0 .4-.62l-.4-1.99Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M18.6 16.29h-2.02c-.3 0-.54.24-.54.53v2.27h-5.47v-5.66h3.75c.3 0 .54-.24.54-.54v-1.78c0-.3-.24-.54-.54-.54h-3.75V7.73c0-1.44 1.1-2.54 2.76-2.54 1.06 0 2.05.5 2.57.84.23.14.53.09.7-.12l1.28-1.59a.54.54 0 0 0-.1-.76A7.67 7.67 0 0 0 13.25 2C9.59 2 7 4.35 7 7.62v2.95H5.75c-.3 0-.54.24-.54.54v1.78c0 .3.24.54.54.54H7v5.71H5.4c-.3 0-.54.24-.54.54v1.78c0 .3.24.54.53.54h13.22c.3 0 .53-.24.53-.54v-4.64c0-.3-.24-.53-.53-.53Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="m14.55 11.12-4.22-1.24a1.15 1.15 0 0 1 .32-2.26h2.6c.47 0 .94.15 1.33.42a.6.6 0 0 0 .76-.08l1.36-1.33a.63.63 0 0 0-.07-.96 5.52 5.52 0 0 0-3.38-1.17V2.62a.63.63 0 0 0-.63-.62h-1.25a.63.63 0 0 0-.62.63V4.5h-.1A4.28 4.28 0 0 0 6.4 9.17a4.47 4.47 0 0 0 3.28 3.78l4 1.17a1.15 1.15 0 0 1-.32 2.26h-2.6c-.47 0-.94-.15-1.33-.42a.6.6 0 0 0-.76.08L7.3 17.37a.63.63 0 0 0 .07.96 5.52 5.52 0 0 0 3.38 1.17v1.88c0 .34.28.62.62.62h1.25c.35 0 .63-.28.63-.63V19.5a4.41 4.41 0 0 0 4.13-2.84 4.29 4.29 0 0 0-2.83-5.53Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M18.6 4.86c.3 0 .54-.24.54-.54V2.54c0-.3-.24-.54-.53-.54H5.39c-.3 0-.53.24-.53.54v2c0 .29.24.53.53.53H9.2c1.22 0 2.15.44 2.72 1.22H5.4c-.3 0-.53.24-.53.53v1.79c0 .3.24.53.53.53h7.09c-.28 1.61-1.47 2.62-3.34 2.62H5.4c-.3 0-.53.24-.53.54v2.36c0 .15.06.3.17.4l7.37 6.8c.1.09.23.14.36.14h3.69c.48 0 .72-.6.36-.93l-6.74-6.22a6.12 6.12 0 0 0 6.18-5.7h2.36c.3 0 .53-.25.53-.54V6.82c0-.3-.24-.53-.53-.53h-2.62c-.16-.52-.37-1-.64-1.43h3.26Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M19.1 2h-2.9c-.21 0-.4.12-.5.3l-2.46 5.05c-.65 1.55-1.21 3.21-1.21 3.21h-.06s-.56-1.66-1.21-3.2L8.28 2.3A.54.54 0 0 0 7.8 2H4.9c-.41 0-.67.43-.48.79L7.99 9.5H5.4c-.3 0-.53.24-.53.54v1.42c0 .3.24.54.53.54h3.94l.88 1.66v1.2H5.4c-.3 0-.53.24-.53.53v1.43c0 .3.24.54.53.54h4.82v4.1c0 .3.24.54.54.54h2.5c.3 0 .53-.24.53-.54v-4.1h4.83c.3 0 .53-.24.53-.54V15.4c0-.3-.24-.53-.53-.53h-4.83v-1.2l.89-1.66h3.94c.3 0 .53-.24.53-.54v-1.42c0-.3-.24-.54-.53-.54H16l3.57-6.71A.53.53 0 0 0 19.1 2Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M14.11 14.86c3.8 0 6.46-2.66 6.46-6.47 0-3.82-2.66-6.39-6.46-6.39H6.82c-.3 0-.53.24-.53.54v9.22H3.96c-.3 0-.53.24-.53.54v2.02c0 .3.24.54.53.54H6.3v1.43H3.96c-.3 0-.53.24-.53.53v1.79c0 .3.24.53.53.53H6.3v2.32c0 .3.24.54.53.54h2.62c.3 0 .53-.24.53-.54v-2.32h7.2c.3 0 .54-.24.54-.53v-1.79c0-.3-.24-.53-.53-.53h-7.2v-1.43h4.13Zm-4.14-9.8h3.52c2.08 0 3.34 1.3 3.34 3.33 0 2.04-1.26 3.37-3.4 3.37H9.97v-6.7Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M21.58 9.77c.23 0 .42-.2.42-.42V7.96a.42.42 0 0 0-.42-.42h-1.66l.64-2.8a.42.42 0 0 0-.4-.5h-1.6c-.2 0-.37.13-.41.32l-.5 2.98h-3.82l-.68-2.98a.42.42 0 0 0-.4-.33h-1.53c-.2 0-.37.14-.41.33l-.7 2.98H6.34l-.6-2.97a.42.42 0 0 0-.42-.34H3.86a.42.42 0 0 0-.4.51l.62 2.8H2.42a.42.42 0 0 0-.42.42v1.39c0 .23.19.42.42.42h2.16l.25 1.1H2.42a.42.42 0 0 0-.42.42v1.4c0 .22.19.4.42.4h2.91l1.42 6.35c.04.19.21.33.4.33h1.98c.2 0 .36-.14.4-.33L11 13.1h1.92l1.47 6.34c.04.19.21.33.4.33h1.98c.2 0 .36-.14.4-.33l1.47-6.34h2.94c.23 0 .42-.19.42-.42V11.3a.42.42 0 0 0-.42-.41h-2.43l.26-1.11h2.17Zm-13.2 5.2c-.21.9-.23 1.64-.25 1.64h-.04s-.06-.76-.24-1.64l-.38-1.87h1.35l-.44 1.87Zm.96-4.1H7.02l-.23-1.1h2.8l-.25 1.1Zm2.18 0 .07-.3c.07-.27.12-.55.17-.8h.4c.05.25.1.53.17.8l.07.3h-.88Zm4.55 4.1c-.18.88-.24 1.64-.24 1.64h-.04c-.02 0-.04-.74-.25-1.64l-.43-1.87h1.36l-.4 1.87Zm.87-4.1H14.6l-.25-1.1h2.83l-.24 1.1Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M20.04 12h-2.15c-.28 0-.53.22-.53.5 0 4.5-3.66 6.64-7.5 6.64v-7.1l6-1.34a.54.54 0 0 0 .43-.52V8.35c0-.35-.32-.6-.66-.53L9.86 9.11V7.75l6-1.34a.54.54 0 0 0 .43-.52V4.06c0-.34-.32-.6-.66-.52L9.86 4.82V2.54c0-.3-.24-.54-.54-.54h-2.5c-.3 0-.53.24-.53.54v3.08l-2.44.54a.54.54 0 0 0-.42.52v1.83c0 .34.32.6.65.52l2.2-.49V9.9l-2.43.54a.54.54 0 0 0-.42.53v1.83c0 .34.32.6.65.52l2.2-.5v8.64c0 .3.25.54.54.54h3.55c5.99 0 9.97-3.47 10.2-9.45a.54.54 0 0 0-.53-.55Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M16.62 11.48c1.08-.56 1.77-1.54 1.61-3.18-.2-2.24-2.05-2.99-4.49-3.2V2h-1.9v3.02c-.48 0-.99 0-1.5.02V2H8.46v3.1c-.7.02-1.5.01-3.8 0v2.02c1.5-.03 2.28-.12 2.46.84v8.5c-.12.75-.72.64-2.08.62l-.38 2.25 3.8.01V22h1.9v-2.62l1.5.01V22h1.9v-2.66c3.17-.17 5.3-.97 5.58-3.96.22-2.4-.92-3.47-2.71-3.9Zm-6.24-4.22c1.07 0 4.42-.34 4.42 1.9 0 2.12-3.35 1.87-4.42 1.87V7.26Zm0 9.83v-4.16c1.28 0 5.2-.36 5.2 2.08 0 2.35-3.92 2.08-5.2 2.08Z"></path></svg>'
    ]
  },
  {
    title: "tool.icon.group.currency",
    icons: [
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M21.61 4.25c.83-.83.24-2.25-.93-2.25H3.32a1.32 1.32 0 0 0-.93 2.25l8.36 8.36v7.52H8.56c-.86 0-1.56.7-1.56 1.56 0 .17.14.31.31.31h9.38c.17 0 .31-.14.31-.31 0-.87-.7-1.57-1.56-1.57h-2.19v-7.5l8.36-8.37Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="m21.73 19.3-3.9-3.9a.94.94 0 0 0-.66-.28h-.64a8.12 8.12 0 1 0-1.4 1.4v.65c0 .25.1.48.27.66l3.9 3.9c.36.36.95.36 1.32 0l1.1-1.11a.94.94 0 0 0 0-1.33Zm-11.6-4.18a5 5 0 1 1-.01-9.99 5 5 0 0 1 0 10Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M13.88 9.5v1.25c0 .26-.22.47-.47.47h-2.2v2.19c0 .25-.2.46-.46.46H9.5a.47.47 0 0 1-.47-.46v-2.2H6.84a.47.47 0 0 1-.46-.46V9.5c0-.26.2-.47.46-.47h2.2V6.84c0-.25.2-.47.46-.47h1.25c.26 0 .47.22.47.47v2.2h2.19c.25 0 .47.2.47.46Zm7.85 11.12-1.1 1.1a.93.93 0 0 1-1.33 0l-3.9-3.89a.94.94 0 0 1-.27-.66v-.64a8.12 8.12 0 1 1 1.4-1.4h.64c.25 0 .49.1.66.27l3.9 3.9c.36.36.36.95 0 1.32Zm-6.3-10.5a5.3 5.3 0 1 0-10.6 0 5.3 5.3 0 0 0 10.6 0Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="m11.73 8.26-6.4 5.27v5.7a.56.56 0 0 0 .56.55l3.89-.01a.56.56 0 0 0 .55-.56V15.9a.56.56 0 0 1 .56-.56h2.22a.56.56 0 0 1 .56.56v3.32a.56.56 0 0 0 .55.56h3.89a.56.56 0 0 0 .56-.55v-5.7l-6.4-5.26a.42.42 0 0 0-.54 0Zm10.12 3.58-2.9-2.4v-4.8a.42.42 0 0 0-.42-.42h-1.95a.42.42 0 0 0-.41.42v2.52L13.06 4.6a1.67 1.67 0 0 0-2.12 0l-8.79 7.24a.42.42 0 0 0-.05.59l.88 1.07a.42.42 0 0 0 .59.06l8.16-6.73a.42.42 0 0 1 .54 0l8.16 6.73a.42.42 0 0 0 .59-.05l.89-1.08a.42.42 0 0 0-.06-.59Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 18.06a8.06 8.06 0 1 1 0-16.12 8.06 8.06 0 0 1 0 16.12Zm2.5-4.2-3.43-2.5a.49.49 0 0 1-.2-.38V6.35c0-.26.22-.48.48-.48h1.3c.26 0 .48.22.48.48v5.72l2.7 1.96c.21.16.25.46.1.68l-.76 1.04a.49.49 0 0 1-.68.1Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M22 7.63v11.25c0 1.03-.84 1.87-1.88 1.87H3.88A1.88 1.88 0 0 1 2 18.87V7.63c0-1.03.84-1.87 1.88-1.87H7.3l.48-1.29c.28-.73.98-1.21 1.76-1.21h4.9c.78 0 1.48.48 1.75 1.21l.49 1.29h3.43c1.04 0 1.88.84 1.88 1.88Zm-5.31 5.62a4.7 4.7 0 1 0-9.39 0 4.7 4.7 0 0 0 9.39 0Zm-1.25 0a3.44 3.44 0 1 1-6.89-.01 3.44 3.44 0 0 1 6.89.01Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="m21.33 14.4-1.72-.99c.17-.93.17-1.9 0-2.83l1.72-1c.2-.1.28-.34.22-.56a10.04 10.04 0 0 0-2.2-3.81.49.49 0 0 0-.6-.1l-1.72 1a7.61 7.61 0 0 0-2.45-1.42V2.71a.48.48 0 0 0-.38-.47c-1.48-.33-3-.31-4.4 0a.48.48 0 0 0-.38.47V4.7c-.9.32-1.73.8-2.45 1.41l-1.72-.99a.48.48 0 0 0-.6.1 9.98 9.98 0 0 0-2.2 3.8c-.07.23.02.46.22.57l1.72 1c-.17.93-.17 1.89 0 2.83l-1.72.99a.49.49 0 0 0-.22.56 10.04 10.04 0 0 0 2.2 3.82c.16.16.4.2.6.09l1.72-1c.72.63 1.55 1.1 2.45 1.42v1.99c0 .22.16.42.38.47 1.48.33 3 .31 4.4 0a.48.48 0 0 0 .38-.47V19.3c.9-.32 1.73-.8 2.45-1.41l1.72.99c.2.11.45.08.6-.1a9.98 9.98 0 0 0 2.2-3.8.5.5 0 0 0-.22-.58Zm-9.33.82a3.23 3.23 0 1 1 0-6.46 3.23 3.23 0 0 1 0 6.46Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M13.14 2.86c-.3-1.12-1.93-1.17-2.28 0-1.83 6.17-5.73 7.84-5.73 12.18A6.91 6.91 0 0 0 12 22c3.8 0 6.88-3.11 6.88-6.96 0-4.36-3.9-5.99-5.74-12.18ZM12 19.5a4.38 4.38 0 0 1-4.38-4.38.62.62 0 1 1 1.25 0c0 1.73 1.4 3.13 3.13 3.13a.62.62 0 1 1 0 1.25Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M3.25 19.5c0 .7.56 1.25 1.25 1.25h6.25V14.5h-7.5v5Zm10 1.25h6.25c.7 0 1.25-.56 1.25-1.25v-5h-7.5v6.25Zm7.5-12.5h-1.64a3.4 3.4 0 0 0-3.05-5c-1.62 0-2.67.83-4.02 2.67-1.35-1.84-2.4-2.67-4.02-2.67a3.44 3.44 0 0 0-3.44 3.44c0 .56.15 1.09.4 1.56H3.24C2.55 8.25 2 8.81 2 9.5v3.13c0 .34.28.62.63.62h18.75c.34 0 .62-.28.62-.63V9.5c0-.7-.56-1.25-1.25-1.25Zm-12.74 0a1.56 1.56 0 1 1 0-3.13c.78 0 1.35.13 3.37 3.13H8Zm8.05 0H12.7c2-2.99 2.57-3.13 3.36-3.13a1.56 1.56 0 1 1 0 3.13Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M18.67 9.78H14.7l-3.65-6.39a.56.56 0 0 0-.48-.28H8.29a.56.56 0 0 0-.53.7l1.7 5.97H5.89l-1.5-2a.56.56 0 0 0-.45-.22H2.56a.56.56 0 0 0-.54.69L3.12 12l-1.1 3.75c-.1.35.17.7.54.7h1.38c.18 0 .34-.09.45-.23l1.5-2h3.57l-1.7 5.96c-.1.36.16.7.53.7h2.28c.2 0 .38-.1.48-.27l3.65-6.39h3.97c1.22 0 3.33-1 3.33-2.22 0-1.23-2.1-2.22-3.33-2.22Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M8.4 7.78H2.48A.47.47 0 0 1 2 7.31V4.2a1.4 1.4 0 0 1 1.4-1.4h4.07a1.4 1.4 0 0 1 1.4 1.4V7.3a.46.46 0 0 1-.46.47ZM22 7.31V4.2a1.4 1.4 0 0 0-1.4-1.41h-4.07a1.4 1.4 0 0 0-1.4 1.4v3.13a.47.47 0 0 0 .46.47h5.94A.46.46 0 0 0 22 7.3Zm-6.4 1.72a.47.47 0 0 0-.47.47v2.03c0 5-6.26 5-6.26 0V9.5a.47.47 0 0 0-.46-.47H2.47a.47.47 0 0 0-.47.48c0 .83.03 1.57 0 2.08 0 5.88 5.32 9.63 10.03 9.63 4.71 0 9.96-3.75 9.96-9.64-.02-.5 0-1.29 0-2.07a.47.47 0 0 0-.46-.48h-5.94Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M15 14.5h1.5c.25 0 .5-.25.5-.5V8.75c0-.25-.25-.5-.5-.5H15c-.25 0-.5.25-.5.5V14c0 .25.25.5.5.5Zm3.75 0h1.5c.25 0 .5-.25.5-.5V5c0-.25-.25-.5-.5-.5h-1.5c-.25 0-.5.25-.5.5v9c0 .25.25.5.5.5Zm-11.25 0H9c.25 0 .5-.25.5-.5v-2.75c0-.25-.25-.5-.5-.5H7.5c-.25 0-.5.25-.5.5V14c0 .25.25.5.5.5Zm3.75 0h1.5c.25 0 .5-.25.5-.5V6.25c0-.25-.25-.5-.5-.5h-1.5c-.25 0-.5.25-.5.5V14c0 .25.25.5.5.5ZM21.38 17H4.5V5.12a.62.62 0 0 0-.63-.62H2.63a.62.62 0 0 0-.62.63v13.12c0 .69.56 1.25 1.25 1.25h18.13c.34 0 .62-.28.62-.63v-1.25a.62.62 0 0 0-.63-.62Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M22 8.88a6.87 6.87 0 0 1-8.16 6.75l-.94 1.06a.94.94 0 0 1-.7.31h-1.45v1.56c0 .52-.42.94-.94.94H8.25v1.56c0 .52-.42.94-.94.94H2.94a.94.94 0 0 1-.94-.94v-3.05c0-.25.1-.48.27-.66l6.32-6.32A6.87 6.87 0 1 1 22 8.88ZM15.12 7a1.88 1.88 0 1 0 3.76 0 1.88 1.88 0 0 0-3.75 0Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="m21.45 7.55-1.8 1.8a.47.47 0 0 1-.67 0L14.65 5a.47.47 0 0 1 0-.66l1.8-1.8a1.88 1.88 0 0 1 2.65 0l2.35 2.35c.73.73.73 1.91 0 2.65ZM13.1 5.9 2.84 16.15l-.83 4.75a.94.94 0 0 0 1.1 1.09l4.74-.84L18.1 10.9a.47.47 0 0 0 0-.67L13.77 5.9a.47.47 0 0 0-.67 0Zm-6.25 9.37a.54.54 0 0 1 0-.77l6.01-6.01a.54.54 0 0 1 .78 0c.21.21.21.55 0 .77l-6.02 6.01a.54.54 0 0 1-.77 0Zm-1.41 3.29H7.3v1.42l-2.52.44-1.21-1.22.44-2.51h1.42v1.87Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M22 11.44c0-.82-.45-1.52-1.11-1.9V4.21c0-.3-.24-1.1-1.11-1.1-.25 0-.5.07-.7.23l-2.95 2.37a8.43 8.43 0 0 1-5.24 1.84H4.22C3 7.56 2 8.55 2 9.78v3.33c0 1.23 1 2.22 2.22 2.22H5.4a8.8 8.8 0 0 0 .81 4.96c.18.38.58.6.99.6h2.58c.9 0 1.45-1.04.9-1.76a4.42 4.42 0 0 1-.76-3.8h.98c1.9 0 3.76.66 5.24 1.84l2.95 2.36c.2.16.45.25.7.25.86 0 1.1-.8 1.1-1.11v-5.31A2.21 2.21 0 0 0 22 11.44Zm-3.33 4.91-1.15-.91a10.65 10.65 0 0 0-6.63-2.33V9.78c2.4 0 4.75-.83 6.63-2.33l1.15-.92v9.82Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M20.41 16.15c-.75-.8-2.16-2.03-2.16-6.02a6.17 6.17 0 0 0-5-6.07v-.81a1.25 1.25 0 1 0-2.5 0v.81c-2.87.6-5 3.03-5 6.07 0 4-1.4 5.21-2.16 6.02a1.25 1.25 0 0 0 .92 2.1H19.5a1.25 1.25 0 0 0 .91-2.1Zm-14.52.23c.83-1.1 1.73-2.9 1.74-6.23v-.03a4.37 4.37 0 1 1 8.75 0v.03c0 3.32.9 5.13 1.73 6.22H5.9ZM12 22a2.5 2.5 0 0 0 2.5-2.5h-5A2.5 2.5 0 0 0 12 22Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 8.5c-1.66 0-3 1.57-3 3.5s1.34 3.5 3 3.5 3-1.57 3-3.5-1.34-3.5-3-3.5Zm1.25 5.25c0 .14-.11.25-.25.25h-2a.25.25 0 0 1-.25-.25v-.5c0-.14.11-.25.25-.25h.5v-1.73h-.01a.25.25 0 0 1-.35-.06l-.28-.42a.25.25 0 0 1 .07-.34l.48-.32a.75.75 0 0 1 .42-.13h.42c.14 0 .25.11.25.25V13h.5c.14 0 .25.11.25.25v.5ZM21 6H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1Zm-.5 8.5a2 2 0 0 0-2 2h-13a2 2 0 0 0-2-2v-5a2 2 0 0 0 2-2h13c0 1.1.9 2 2 2v5Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="m21.73 9.79-.89-.89a.94.94 0 0 0-1.32 0l-.23.22-4.41-4.41.22-.23a.94.94 0 0 0 0-1.32l-.89-.89a.94.94 0 0 0-1.32 0L8.03 7.14a.94.94 0 0 0 0 1.32l.88.89c.37.36.96.36 1.32 0l.23-.23L12 10.67l-3.16 3.17-.22-.22a1.25 1.25 0 0 0-1.77 0L2.37 18.1a1.25 1.25 0 0 0 0 1.77l1.76 1.76c.5.5 1.28.5 1.77 0l4.48-4.48c.5-.49.5-1.28 0-1.77l-.22-.22L13.33 12l1.55 1.54-.23.23a.94.94 0 0 0 0 1.32l.89.88c.36.37.96.37 1.32 0l4.87-4.86a.94.94 0 0 0 0-1.32Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 5.13a3.75 3.75 0 0 0-3.75 3.75.62.62 0 1 0 1.25 0 2.5 2.5 0 0 1 2.5-2.5.62.62 0 1 0 0-1.25Zm-3.12 14.8c0 .13.03.25.1.35l.96 1.44c.12.18.31.28.52.28h3.08c.2 0 .4-.1.52-.28l.96-1.44c.07-.1.1-.22.1-.34v-1.69H8.88v1.69ZM12 2a6.85 6.85 0 0 0-5.17 11.4c.65.74 1.67 2.3 2.04 3.6h1.88c0-.2-.03-.38-.08-.55-.22-.7-.9-2.53-2.43-4.29A4.98 4.98 0 0 1 12 3.88a5 5 0 0 1 3.76 8.28 12.34 12.34 0 0 0-2.42 4.28c-.06.18-.09.37-.09.56h1.88c.37-1.3 1.4-2.86 2.04-3.6A6.88 6.88 0 0 0 12 2Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 22a2.5 2.5 0 0 0 2.5-2.5h-5A2.5 2.5 0 0 0 12 22Zm8.41-5.85c-.75-.8-2.16-2.03-2.16-6.02a6.17 6.17 0 0 0-5-6.07v-.81a1.25 1.25 0 1 0-2.5 0v.81c-2.87.6-5 3.03-5 6.07 0 4-1.4 5.21-2.16 6.02a1.25 1.25 0 0 0 .92 2.1H19.5a1.25 1.25 0 0 0 .91-2.1Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M21.73 2.75a.67.67 0 0 0-.48-.48C20 2 19.01 2 18.03 2 14 2 11.58 4.16 9.78 7H5.7c-.63 0-1.38.46-1.67 1.03L2.1 11.9a.94.94 0 0 0 .84 1.36h4.05l-.88.88c-.44.44-.5 1.26 0 1.77l2 1.98c.43.44 1.25.52 1.76 0l.88-.87v4.05a.94.94 0 0 0 1.36.84l3.85-1.93A2.05 2.05 0 0 0 17 18.3v-4.08c2.83-1.81 5-4.24 5-8.25C22 5 22 4 21.73 2.75ZM17 8.56a1.56 1.56 0 1 1 0-3.12 1.56 1.56 0 0 1 0 3.12Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M2.42 15.34h1.13c.76 3.58 4.76 5.58 8.45 5.58 3.7 0 7.7-2 8.45-5.58h1.13c.37 0 .56-.45.3-.7l-2.34-2.34a.42.42 0 0 0-.59 0l-2.33 2.33a.42.42 0 0 0 .3.71h1.22c-.71 1.9-2.96 3.02-5.03 3.28V12h1.82c.23 0 .41-.19.41-.42v-1.4a.42.42 0 0 0-.41-.41H13.1v-.19a3.35 3.35 0 1 0-2.22 0v.19H9.07a.42.42 0 0 0-.41.42v1.4c0 .22.18.41.41.41h1.82v6.62c-2.06-.26-4.32-1.38-5.03-3.28H7.1c.37 0 .56-.45.3-.7L5.04 12.3a.42.42 0 0 0-.6 0l-2.33 2.33a.42.42 0 0 0 .3.71ZM12 5.31a1.12 1.12 0 1 1 0 2.23 1.12 1.12 0 0 1 0-2.23Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M19.63 16.42a2.81 2.81 0 0 0-1.7-5.04h-.54A2.49 2.49 0 0 0 15.75 7h-.23a3.75 3.75 0 0 0-4.1-4.94A3.1 3.1 0 0 1 8.87 7h-.63a2.49 2.49 0 0 0-1.64 4.38h-.55a2.81 2.81 0 0 0-1.7 5.04A2.8 2.8 0 0 0 4.82 22H19.2a2.81 2.81 0 0 0 .44-5.58ZM9.5 12a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Zm6.23 5.43c-.41 1.09-2.28 2.07-3.73 2.07-1.45 0-3.32-.98-3.73-2.07a.32.32 0 0 1 .3-.43h6.86c.22 0 .38.22.3.43ZM14.5 14.5a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5Z"></path></svg>'
    ]
  },
  {
    title: "tool.icon.group.objects",
    icons: [
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="m13.5 20.44-1 1c-.41.41-1.1.41-1.5 0L2.3 12.75a1.07 1.07 0 0 1 0-1.51L11 2.57c.42-.42 1.1-.42 1.52 0l.99.99c.42.42.41 1.12-.02 1.53L8.1 10.21h12.83c.6 0 1.07.48 1.07 1.08v1.42c0 .6-.48 1.08-1.07 1.08H8.1l5.38 5.12c.44.42.45 1.1.02 1.53Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="m10.5 3.56 1-1c.41-.41 1.1-.41 1.5 0l8.69 8.68c.41.42.41 1.1 0 1.51L13 21.43c-.42.42-1.1.42-1.52 0l-.99-.99a1.07 1.07 0 0 1 .02-1.53l5.38-5.12H3.07c-.6 0-1.07-.48-1.07-1.08V11.3c0-.6.48-1.08 1.07-1.08H15.9L10.52 5.1a1.06 1.06 0 0 1-.02-1.53Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="m3.56 13.5-.99-1a1.07 1.07 0 0 1 0-1.5l8.67-8.69c.42-.41 1.1-.41 1.52 0L21.43 11c.42.42.42 1.1 0 1.51l-1 1c-.42.42-1.1.4-1.52-.03L13.79 8.1v12.83c0 .6-.48 1.07-1.07 1.07h-1.43c-.6 0-1.07-.48-1.07-1.07V8.1l-5.13 5.38c-.41.44-1.1.45-1.53.02Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="m20.44 10.5 1 1c.41.41.41 1.1 0 1.5l-8.68 8.69c-.42.41-1.1.41-1.51 0L2.57 13a1.07 1.07 0 0 1 0-1.52l.99-.99a1.07 1.07 0 0 1 1.53.02l5.12 5.38V3.07c0-.6.48-1.07 1.08-1.07h1.42c.6 0 1.08.48 1.08 1.07V15.9l5.12-5.38c.42-.44 1.1-.45 1.53-.02Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="m6.25 11.22 8.9-8.9a1.1 1.1 0 0 1 1.56 0l1.04 1.04a1.1 1.1 0 0 1 0 1.55L10.69 12l7.06 7.09a1.1 1.1 0 0 1 0 1.55l-1.04 1.04a1.1 1.1 0 0 1-1.56 0l-8.9-8.9a1.1 1.1 0 0 1 0-1.56Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="m17.75 12.78-8.9 8.9a1.1 1.1 0 0 1-1.56 0l-1.04-1.04a1.1 1.1 0 0 1 0-1.55L13.31 12 6.25 4.91a1.1 1.1 0 0 1 0-1.55L7.3 2.32a1.1 1.1 0 0 1 1.56 0l8.9 8.9a1.1 1.1 0 0 1 0 1.56Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="m12.78 6.25 8.9 8.9a1.1 1.1 0 0 1 0 1.56l-1.04 1.04a1.1 1.1 0 0 1-1.55 0L12 10.69l-7.09 7.06a1.1 1.1 0 0 1-1.55 0L2.32 16.7a1.1 1.1 0 0 1 0-1.56l8.9-8.9a1.1 1.1 0 0 1 1.56 0Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="m11.22 17.75-8.9-8.9a1.1 1.1 0 0 1 0-1.56l1.04-1.04a1.1 1.1 0 0 1 1.55 0L12 13.31l7.09-7.06a1.1 1.1 0 0 1 1.55 0l1.04 1.04a1.1 1.1 0 0 1 0 1.56l-8.9 8.9a1.1 1.1 0 0 1-1.56 0Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M15.36 16.76h-1.8V7.24h1.8a.94.94 0 0 0 .66-1.6l-3.36-3.37a.94.94 0 0 0-1.32 0L7.98 5.64c-.6.59-.18 1.6.66 1.6h1.8v9.52h-1.8a.94.94 0 0 0-.66 1.6l3.36 3.37c.36.36.96.36 1.32 0l3.36-3.37c.6-.59.18-1.6-.66-1.6Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M16.76 8.64v1.8H7.24v-1.8a.94.94 0 0 0-1.6-.66l-3.37 3.36a.94.94 0 0 0 0 1.32l3.37 3.36c.59.6 1.6.18 1.6-.66v-1.8h9.52v1.8a.94.94 0 0 0 1.6.66l3.37-3.36a.94.94 0 0 0 0-1.32l-3.37-3.36a.94.94 0 0 0-1.6.66Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20Zm-1.17 5.79 3.05 2.92H6.52a.97.97 0 0 0-.97.97v.64c0 .54.43.97.97.97h7.36l-3.05 2.92c-.39.37-.4 1-.01 1.38l.44.44c.38.38 1 .38 1.37 0l5.35-5.34c.38-.38.38-1 0-1.37l-5.35-5.36a.96.96 0 0 0-1.37 0l-.44.44a.97.97 0 0 0 .01 1.39Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M2 12a10 10 0 1 1 20 0 10 10 0 0 1-20 0Zm5.79 1.17 2.92-3.05v7.36c0 .54.43.97.97.97h.64c.54 0 .97-.43.97-.97v-7.36l2.92 3.05c.37.39 1 .4 1.38.01l.44-.44c.38-.38.38-1 0-1.37L12.7 6.02a.96.96 0 0 0-1.37 0l-5.36 5.35a.96.96 0 0 0 0 1.37l.44.44a.97.97 0 0 0 1.39-.01Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Zm-5.79-1.17-2.92 3.05V6.52a.97.97 0 0 0-.97-.97h-.64a.97.97 0 0 0-.97.97v7.36l-2.92-3.05c-.37-.39-1-.4-1.38-.01l-.44.44a.96.96 0 0 0 0 1.37l5.34 5.35c.38.38 1 .38 1.37 0l5.35-5.35c.38-.38.38-1 0-1.37l-.44-.44a.97.97 0 0 0-1.38.01Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M17.67 3.35v17.3c0 1.2-1.45 1.8-2.3.95l-8.65-8.65a1.34 1.34 0 0 1 0-1.9l8.66-8.65c.84-.85 2.3-.25 2.3.95Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M6.33 20.65V3.35c0-1.2 1.45-1.8 2.3-.95l8.65 8.65c.52.52.52 1.38 0 1.9L8.62 21.6c-.84.85-2.3.25-2.3-.95Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M3.35 6.33h17.3c1.2 0 1.8 1.44.95 2.3l-8.65 8.65c-.52.52-1.38.52-1.9 0L2.4 8.62c-.85-.85-.25-2.3.95-2.3Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M20.65 17.67H3.35c-1.2 0-1.8-1.45-.95-2.3l8.65-8.65a1.34 1.34 0 0 1 1.9 0l8.65 8.66c.85.84.25 2.3-.95 2.3Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="m12.85 11.98 6.83 6.83a1.2 1.2 0 0 1 0 1.7l-1.14 1.13a1.2 1.2 0 0 1-1.7 0L12 16.81l-4.84 4.84a1.2 1.2 0 0 1-1.7 0L4.33 20.5a1.2 1.2 0 0 1 0-1.7L11.15 12a1.2 1.2 0 0 1 1.7 0Zm-1.7-9.63L4.33 9.18a1.2 1.2 0 0 0 0 1.7L5.46 12a1.2 1.2 0 0 0 1.7 0l4.83-4.84 4.84 4.84a1.2 1.2 0 0 0 1.7 0l1.13-1.13a1.2 1.2 0 0 0 0-1.7l-6.82-6.83a1.2 1.2 0 0 0-1.7 0Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M11.15 12.01 4.32 5.2a1.2 1.2 0 0 1 0-1.7l1.14-1.14a1.2 1.2 0 0 1 1.7 0l4.83 4.84 4.84-4.84a1.2 1.2 0 0 1 1.7 0l1.15 1.13a1.2 1.2 0 0 1 0 1.7l-6.83 6.83a1.2 1.2 0 0 1-1.7 0Zm1.7 9.64 6.83-6.83a1.2 1.2 0 0 0 0-1.7L18.54 12a1.2 1.2 0 0 0-1.7 0L12 16.82l-4.84-4.84a1.2 1.2 0 0 0-1.7 0l-1.14 1.14a1.2 1.2 0 0 0 0 1.7l6.83 6.82a1.2 1.2 0 0 0 1.7 0Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="m5.98 10.94 8.5-8.5a1.5 1.5 0 0 1 2.12 0L18 3.85a1.5 1.5 0 0 1 0 2.12L11.99 12l6.03 6.02a1.5 1.5 0 0 1 0 2.12l-1.42 1.42a1.5 1.5 0 0 1-2.11 0l-8.5-8.5a1.5 1.5 0 0 1 0-2.12Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="m18.01 13.06-8.5 8.5a1.5 1.5 0 0 1-2.11 0l-1.41-1.41a1.5 1.5 0 0 1 0-2.12L12 12 5.99 5.98a1.5 1.5 0 0 1 0-2.11l1.4-1.43a1.5 1.5 0 0 1 2.12 0l8.5 8.5c.6.59.6 1.53 0 2.12Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="m13.06 5.98 8.5 8.5a1.5 1.5 0 0 1 0 2.12L20.15 18a1.5 1.5 0 0 1-2.12 0L12 11.99l-6.02 6.03a1.5 1.5 0 0 1-2.12 0L2.44 16.6a1.5 1.5 0 0 1 0-2.11l8.5-8.5a1.5 1.5 0 0 1 2.12 0Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="m10.94 18.02-8.5-8.5a1.5 1.5 0 0 1 0-2.12l1.41-1.42a1.5 1.5 0 0 1 2.12 0L12 12.01l6.03-6.03a1.5 1.5 0 0 1 2.12 0l1.4 1.42a1.5 1.5 0 0 1 0 2.11l-8.5 8.5c-.57.6-1.52.6-2.1 0Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20Zm-4.6-9.31 5.47 5.46c.38.38 1 .38 1.37 0l.68-.69c.38-.38.38-.99 0-1.36l-4.1-4.1 4.1-4.1c.38-.38.38-.99 0-1.36l-.68-.69a.96.96 0 0 0-1.37 0l-5.46 5.46a.97.97 0 0 0 0 1.38Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M2 12a10 10 0 1 1 20 0 10 10 0 0 1-20 0Zm9.31-4.6-5.46 5.47a.96.96 0 0 0 0 1.37l.69.68c.38.38.99.38 1.36 0l4.1-4.1 4.1 4.1c.38.38.99.38 1.36 0l.69-.68c.38-.38.38-1 0-1.37l-5.46-5.46a.97.97 0 0 0-1.38 0Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Zm-9.31 4.6 5.46-5.47c.38-.38.38-1 0-1.37l-.69-.68a.96.96 0 0 0-1.36 0l-4.1 4.1-4.1-4.1a.96.96 0 0 0-1.36 0l-.69.68a.96.96 0 0 0 0 1.37l5.46 5.46c.38.38 1 .38 1.38 0Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M2.32 9.42 9.2 3.48a.94.94 0 0 1 1.55.7v3.14C17.02 7.39 22 8.64 22 14.59c0 2.4-1.55 4.78-3.26 6.02-.53.39-1.29-.1-1.1-.73 1.78-5.66-.83-7.16-6.89-7.25v3.43a.94.94 0 0 1-1.55.71l-6.88-5.94a.94.94 0 0 1 0-1.41Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M21.68 9.42 14.8 3.48a.94.94 0 0 0-1.55.7v3.14C6.98 7.39 2 8.64 2 14.59c0 2.4 1.55 4.78 3.26 6.02.53.39 1.29-.1 1.1-.73-1.78-5.66.83-7.16 6.89-7.25v3.43c0 .81.95 1.23 1.55.71l6.88-5.94a.94.94 0 0 0 0-1.41Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M18 6.67 13.94 2.3c-.37-.4-1-.4-1.38 0L8.5 6.67a.94.94 0 0 0 .69 1.58h2.5v10.63H8.4a.47.47 0 0 0-.33.13l-2.2 2.19c-.29.3-.08.8.34.8h7.66c.51 0 .93-.42.93-.94V8.25h2.5A.94.94 0 0 0 18 6.67Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="m18 17.33-4.06 4.37c-.37.4-1 .4-1.38 0L8.5 17.33a.94.94 0 0 1 .69-1.58h2.5V5.12H8.4A.47.47 0 0 1 8.08 5L5.88 2.8c-.29-.3-.08-.8.34-.8h7.66c.51 0 .93.42.93.94v12.81h2.5c.82 0 1.25.98.69 1.58Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M7.98 13.79h13.48c.3 0 .54-.24.54-.54v-2.5c0-.3-.24-.54-.54-.54H7.98V8.16c0-.96-1.15-1.43-1.82-.76L2.3 11.24c-.41.42-.41 1.1 0 1.52l3.85 3.84c.67.67 1.82.2 1.82-.76V13.8Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M16.02 10.21H2.54c-.3 0-.54.24-.54.54v2.5c0 .3.24.54.54.54h13.48v2.05c0 .96 1.15 1.43 1.82.76l3.85-3.84c.41-.42.41-1.1 0-1.52L17.84 7.4a1.07 1.07 0 0 0-1.82.76v2.05Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M13.79 16.02V2.54c0-.3-.24-.54-.54-.54h-2.5c-.3 0-.54.24-.54.54v13.48H8.16a1.07 1.07 0 0 0-.76 1.82l3.84 3.85c.42.41 1.1.41 1.52 0l3.84-3.85c.67-.67.2-1.82-.76-1.82H13.8Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M10.21 7.98v13.48c0 .3.24.54.54.54h2.5c.3 0 .54-.24.54-.54V7.98h2.05c.96 0 1.43-1.15.76-1.82L12.76 2.3a1.07 1.07 0 0 0-1.52 0L7.4 6.16c-.67.67-.2 1.82.76 1.82h2.05Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm0-18.06a8.06 8.06 0 1 1 0 16.12 8.06 8.06 0 0 1 0-16.12Zm-.8 2.9h1.6c.27 0 .49.22.49.48V12h2.7c.43 0 .65.52.34.83l-3.99 3.99a.48.48 0 0 1-.68 0l-4-4a.48.48 0 0 1 .35-.82h2.7V7.32c0-.26.22-.48.48-.48Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 18.06a8.06 8.06 0 1 1 0-16.12 8.06 8.06 0 0 1 0 16.12Zm.8-2.9h-1.6a.49.49 0 0 1-.49-.48V12h-2.7a.48.48 0 0 1-.34-.83l3.99-3.99c.19-.19.5-.19.68 0l4 4c.3.3.08.82-.35.82h-2.7v4.68c0 .26-.22.48-.48.48Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="m11.5 14.65-4.14 4.14 1.47 1.38c.67.68.2 1.83-.76 1.83h-5C2.47 22 2 21.52 2 20.93v-5c0-.96 1.15-1.43 1.83-.76l1.38 1.47 4.14-4.13a.71.71 0 0 1 1.01 0l1.13 1.13c.28.28.28.73 0 1Zm1-5.3 4.14-4.14-1.47-1.38c-.67-.68-.2-1.83.76-1.83h5c.6 0 1.07.48 1.07 1.07v5c0 .96-1.15 1.43-1.83.76L18.8 7.36l-4.14 4.13a.71.71 0 0 1-1.01 0l-1.13-1.13a.71.71 0 0 1 0-1Z"></path></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="m2.2 19.65 4.44-4.44-1.47-1.38c-.67-.68-.2-1.83.76-1.83h5c.6 0 1.07.48 1.07 1.07v5c0 .96-1.15 1.43-1.83.76L8.8 17.36l-4.44 4.43a.71.71 0 0 1-1 0L2.2 20.66a.71.71 0 0 1 0-1.01Zm19.6-15.3L17.35 8.8l1.47 1.38c.67.68.2 1.83-.76 1.83h-5c-.6 0-1.07-.48-1.07-1.07v-5c0-.96 1.15-1.43 1.83-.76l1.38 1.47 4.44-4.43a.71.71 0 0 1 1 0l1.14 1.13c.28.28.28.73 0 1.01Z"></path></svg>'
    ]
  }
];
var root_2$4 = from_html(`<div> </div>`);
var root_5$4 = from_html(`<span class="icon svelte-12ytihu"><!></span>`);
var root_3$2 = from_html(`<div></div>`);
const $$css$6 = {
  hash: "svelte-12ytihu",
  code: ".sectionTitle.svelte-12ytihu {padding:4px 12px;font-size:11px;letter-spacing:0.4px;line-height:16px;color:var(--cl-listTitle-foreground);user-select:none;}.row.svelte-12ytihu {height:38px;width:fit-content;}.title.svelte-12ytihu {align-items:center;box-sizing:border-box;display:flex;font-size:11px;height:100%;letter-spacing:0.4px;padding:6px 6px 0 18px;text-transform:uppercase;color:var(--cl-listTitle-foreground);user-select:none;}.icons.svelte-12ytihu {align-items:center;display:flex;height:100%;overflow:hidden;padding:0 6px;}.icon.svelte-12ytihu {width:38px;height:38px;display:flex;justify-content:center;align-items:center;}"
};
function IconList($$anchor, $$props) {
  push($$props, true);
  append_styles($$anchor, $$css$6);
  const { t } = useTranslation();
  const rows = [];
  const chunkSize = 9;
  function chunkArray(arr) {
    const result = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
      result.push(arr.slice(i, i + chunkSize));
    }
    return result;
  }
  Icons$1.forEach((group) => {
    rows.push({ type: "title", title: group.title });
    chunkArray(group.icons).forEach((chunk) => {
      rows.push({ type: "list", icons: chunk });
    });
  });
  var fragment = comment();
  var node = first_child(fragment);
  each(node, 17, () => rows, index, ($$anchor2, row) => {
    var fragment_1 = comment();
    var node_1 = first_child(fragment_1);
    {
      var consequent = ($$anchor3) => {
        var div = root_2$4();
        var text = child(div);
        template_effect(
          ($0, $1) => {
            set_class(div, 1, $0, "svelte-12ytihu");
            set_text(text, $1);
          },
          [
            () => clsx(clsx$1("row", "title")),
            () => t(get(row).title)
          ]
        );
        append($$anchor3, div);
      };
      var alternate = ($$anchor3) => {
        var div_1 = root_3$2();
        each(div_1, 21, () => get(row).icons, index, ($$anchor4, icon, index2, $$array) => {
          {
            let $0 = user_derived(() => ifLeftClick(() => $$props.onpointerup(get(icon))));
            Item($$anchor4, {
              tag: "div",
              class: "item",
              get onpointerup() {
                return get($0);
              },
              children: ($$anchor5, $$slotProps) => {
                var span = root_5$4();
                var node_2 = child(span);
                html(node_2, () => get(icon));
                append($$anchor5, span);
              },
              $$slots: { default: true }
            });
          }
        });
        template_effect(($0) => set_class(div_1, 1, $0, "svelte-12ytihu"), [() => clsx(clsx$1("row", "icons"))]);
        append($$anchor3, div_1);
      };
      if_block(node_1, ($$render) => {
        if (get(row).type === "title") $$render(consequent);
        else $$render(alternate, false);
      });
    }
    append($$anchor2, fragment_1);
  });
  append($$anchor, fragment);
  pop();
}
var root_7$1 = from_html(`<div> </div>`);
var root_2$3 = from_html(`<div class="preview-container svelte-weol7a"><div class="menu svelte-weol7a"><!></div></div> <div class="tab-bar svelte-weol7a"></div>`, 1);
const $$css$5 = {
  hash: "svelte-weol7a",
  code: ' .cl-icons-menu {padding:6px 0 0;min-height:250px;overflow:auto;-webkit-font-smoothing:antialiased;-webkit-text-size-adjust:100%;font-variation-settings:normal;font-feature-settings:"tnum" on, "lnum" on, "rlig" 1, "calt" 1;font-family:var(--cl-font-family);} .cl-icons-menu.mdc-menu-surface--open {display:flex;flex-direction:column;}.preview-container.svelte-weol7a {flex-grow:1;flex-shrink:1;width:fit-content;height:100%;overflow-x:hidden;overflow-y:auto;overscroll-behavior:contain;}.preview-container.svelte-weol7a::-webkit-scrollbar {-webkit-appearance:none;width:3px;height:3px;}.preview-container.svelte-weol7a::-webkit-scrollbar-corner {display:none;}.preview-container.svelte-weol7a::-webkit-scrollbar-thumb {background-clip:content-box;background-color:var(--cl-scrollbarThumb-background);border-radius:3px;}.preview-container.svelte-weol7a::-webkit-scrollbar-track {background-color:initial;border-radius:3px;}.menu.svelte-weol7a {overflow-x:hidden;}.menu.svelte-weol7a .mdc-deprecated-list {margin:0;padding:0;list-style:none;}.menu.svelte-weol7a .item {display:flex;flex-flow:row nowrap;align-items:center;cursor:default;color:var(--cl-listItem-foreground);}\n@media (hover: hover) and (pointer: fine) {.menu.svelte-weol7a .item:hover:not(.itemSelected):not(.itemDisabled) {background-color:var(--cl-listItem-hoverBackground);}\n}.tab-bar.svelte-weol7a {flex-grow:0;flex-shrink:0;height:43px;display:flex;flex-direction:row;align-items:center;justify-content:center;margin:0 0 4px;border-top:1px solid var(--cl-gutter-background);}.tab.svelte-weol7a {position:relative;height:100%;display:flex;align-items:center;justify-content:center;font-size:16px;padding:0 12px;color:var(--cl-foreground);cursor:default;user-select:none;}\n@media (hover: hover) and (pointer: fine) {.tab.svelte-weol7a:hover {color:var(--cl-selectedForeground);}\n}.tabActive.svelte-weol7a {color:var(--cl-selectedForeground);}.tabActive.svelte-weol7a::after {margin:0 12px;content:"";position:absolute;height:4px;left:0;right:0;top:100%;background-color:var(--cl-selectedForeground);}'
};
function Icons($$anchor, $$props) {
  push($$props, true);
  append_styles($$anchor, $$css$5);
  const [$$stores, $$cleanup] = setup_stores();
  const $activeType = () => store_get(activeType, "$activeType", $$stores);
  const { t } = useTranslation();
  const commandService = useService(ICommandService);
  const toolService = useService(IToolService);
  const configurationService = useService(IConfigurationService);
  const drawingsAccessType = configurationService.getValue("drawingsAccessType");
  const drawingsAccess = configurationService.getValue("drawingsAccess");
  const options = function() {
    let opts = [iconEmoji, iconIcon];
    switch (drawingsAccessType) {
      case "black": {
        return opts.filter((o) => drawingsAccess[o.type] !== "black");
      }
      case "white": {
        return opts.filter((o) => drawingsAccess[o.type] === "white");
      }
      default: {
        return opts;
      }
    }
  }();
  let selected = state(proxy(options[0]));
  const activeType = derived(toolService.store, (store) => store.activeType);
  const handleSelect = (opt) => {
    set(selected, opt, true);
  };
  const onEmoji = async (emoji) => {
    const url = await getTwemojiUrl(emoji, "svg");
    const icon = await fetch(url).then((resp) => resp.text());
    commandService.executeCommand("tool.emoji", { preset: { props: { icon } } });
  };
  const onIcon = (icon) => {
    commandService.executeCommand("tool.icon", { preset: { props: { icon } } });
  };
  var fragment = comment();
  var node = first_child(fragment);
  {
    var consequent_1 = ($$anchor2) => {
      {
        let $0 = user_derived(() => $activeType() === get(selected).type);
        IconButton($$anchor2, {
          get icon() {
            return get(selected).icon;
          },
          get tip() {
            return get(selected).type;
          },
          get active() {
            return get($0);
          },
          moreTip: "tool.more.icons",
          class: "icons",
          menuClass: "cl-icons-menu",
          asMenuTrigger: true,
          children: ($$anchor3, $$slotProps) => {
            var fragment_2 = root_2$3();
            var div = first_child(fragment_2);
            var div_1 = child(div);
            var node_1 = child(div_1);
            List(node_1, {
              children: ($$anchor4, $$slotProps2) => {
                var fragment_3 = comment();
                var node_2 = first_child(fragment_3);
                {
                  var consequent = ($$anchor5) => {
                    EmojiList($$anchor5, { onpointerup: onEmoji });
                  };
                  var alternate = ($$anchor5) => {
                    Scheduler($$anchor5, {
                      children: ($$anchor6, $$slotProps3) => {
                        IconList($$anchor6, { onpointerup: onIcon });
                      },
                      $$slots: { default: true }
                    });
                  };
                  if_block(node_2, ($$render) => {
                    if (get(selected).type === iconEmoji.type) $$render(consequent);
                    else $$render(alternate, false);
                  });
                }
                append($$anchor4, fragment_3);
              },
              $$slots: { default: true }
            });
            var div_2 = sibling(div, 2);
            each(div_2, 21, () => options, index, ($$anchor4, opt) => {
              var div_3 = root_7$1();
              var event_handler = user_derived(() => ifLeftClick(() => handleSelect(get(opt))));
              div_3.__pointerup = function(...$$args) {
                var _a;
                (_a = get(event_handler)) == null ? void 0 : _a.apply(this, $$args);
              };
              var text = child(div_3);
              template_effect(
                ($02, $1) => {
                  set_class(div_3, 1, $02, "svelte-weol7a");
                  set_text(text, $1);
                },
                [
                  () => clsx(clsx$1("tab", get(opt).type === get(selected).type && "tabActive")),
                  () => t(get(opt).type)
                ]
              );
              append($$anchor4, div_3);
            });
            append($$anchor3, fragment_2);
          },
          $$slots: { default: true }
        });
      }
    };
    if_block(node, ($$render) => {
      if (options.length) $$render(consequent_1);
    });
  }
  append($$anchor, fragment);
  pop();
  $$cleanup();
}
delegate(["pointerup"]);
const iconKeepDraw = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width="28" height="28"><path fill="currentColor" d="M17.27 4.56a2.5 2.5 0 0 0-3.54 0l-.58.59-9 9-1 1-.15.14V20h4.7l.15-.15 1-1 9-9 .59-.58a2.5 2.5 0 0 0 0-3.54l-1.17-1.17Zm-2.83.7a1.5 1.5 0 0 1 2.12 0l1.17 1.18a1.5 1.5 0 0 1 0 2.12l-.23.23-3.3-3.29.24-.23Zm-.94.95 3.3 3.29-8.3 8.3-3.3-3.3 8.3-8.3Zm-9 9 3.3 3.29-.5.5H4v-3.3l.5-.5Zm16.5.29a1.5 1.5 0 0 0-3 0V18h4.5c.83 0 1.5.67 1.5 1.5v4c0 .83-.67 1.5-1.5 1.5h-6a1.5 1.5 0 0 1-1.5-1.5v-4c0-.83.67-1.5 1.5-1.5h.5v-2.5a2.5 2.5 0 0 1 5 0v.5h-1v-.5ZM16.5 19a.5.5 0 0 0-.5.5v4c0 .28.22.5.5.5h6a.5.5 0 0 0 .5-.5v-4a.5.5 0 0 0-.5-.5h-6Zm2.5 4v-2h1v2h-1Z"></path></svg>\n';
function KeepDrawing($$anchor, $$props) {
  push($$props, false);
  const [$$stores, $$cleanup] = setup_stores();
  const $keepDrawing = () => store_get(keepDrawing, "$keepDrawing", $$stores);
  const toolService = useService(IToolService);
  const keepDrawing = derived(toolService.store, (store) => store.keepDrawingMode);
  const toggleKeepDrawingMode = () => {
    toolService.setKeepDrawingMode(!get$1(keepDrawing));
  };
  init();
  IconButton($$anchor, {
    tip: "tool.keepDraw",
    get icon() {
      return iconKeepDraw;
    },
    get active() {
      return $keepDrawing();
    },
    onselect: toggleKeepDrawingMode,
    negativeColor: true
  });
  pop();
  $$cleanup();
}
const iconMagentStrong = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width="28" height="28"><path fill="currentColor" fill-rule="nonzero" d="M14 5a7 7 0 0 0-7 7v3h4v-3a3 3 0 1 1 6 0v3h4v-3a7 7 0 0 0-7-7zm7 11h-4v3h4v-3zm-10 0H7v3h4v-3zm-5-4a8 8 0 1 1 16 0v8h-6v-8a2 2 0 1 0-4 0v8H6v-8zm3.293 11.294l-1.222-2.037.858-.514 1.777 2.963-2 1 1.223 2.037-.858.514-1.778-2.963 2-1zm9.778-2.551l.858.514-1.223 2.037 2 1-1.777 2.963-.858-.514 1.223-2.037-2-1 1.777-2.963z"></path></svg>\n';
var root_4$2 = from_html(`<div class="itemIcon svelte-13i8k1l"><!></div> <div class="itemLabel svelte-13i8k1l"> </div>`, 1);
var root_5$3 = from_html(`<div class="itemIcon svelte-13i8k1l"><!></div> <div class="itemLabel svelte-13i8k1l"> </div>`, 1);
var root_3$1 = from_html(`<!> <!>`, 1);
var root_2$2 = from_html(`<div class="menu svelte-13i8k1l"><!></div>`);
const $$css$4 = {
  hash: "svelte-13i8k1l",
  code: '.menu.svelte-13i8k1l {-webkit-font-smoothing:antialiased;-webkit-text-size-adjust:100%;font-variation-settings:normal;font-feature-settings:"tnum" on, "lnum" on, "rlig" 1, "calt" 1;font-family:var(--cl-font-family);height:100%;overflow-x:hidden;overflow-y:auto;overscroll-behavior:contain;height:fit-content;}.menu.svelte-13i8k1l::-webkit-scrollbar {-webkit-appearance:none;width:3px;height:3px;}.menu.svelte-13i8k1l::-webkit-scrollbar-corner {display:none;}.menu.svelte-13i8k1l::-webkit-scrollbar-thumb {background-clip:content-box;background-color:var(--cl-scrollbarThumb-background);border-radius:3px;}.menu.svelte-13i8k1l::-webkit-scrollbar-track {background-color:initial;border-radius:3px;}.menu.svelte-13i8k1l .mdc-deprecated-list {margin:0;padding:0;list-style:none;}.menu.svelte-13i8k1l .item {padding:6px 10px;display:flex;flex-flow:row nowrap;align-items:center;cursor:default;color:var(--cl-listItem-foreground);}\n@media (hover: hover) and (pointer: fine) {.menu.svelte-13i8k1l .item:hover:not(.mdc-deprecated-list-item--selected):not(.mdc-deprecated-list-item--disabled) {background-color:var(--cl-listItem-hoverBackground);}\n}.menu.svelte-13i8k1l .mdc-deprecated-list-item--disabled {cursor:not-allowed;color:var(--cl-listItem-disabledForeground);}.menu.svelte-13i8k1l .mdc-deprecated-list-item--selected {color:var(--cl-listItem-selectedForeground);background:var(--cl-listItem-selectedBackground);}.itemIcon.svelte-13i8k1l {flex-shrink:0;margin-right:6px;height:28px;width:28px;display:flex;align-items:center;justify-content:center;}.itemLabel.svelte-13i8k1l {font-size:14px;white-space:nowrap;flex:0 1 100%;padding-right:12px;user-select:none;}'
};
function Magnet($$anchor, $$props) {
  push($$props, false);
  append_styles($$anchor, $$css$4);
  const [$$stores, $$cleanup] = setup_stores();
  const $icon = () => store_get(icon, "$icon", $$stores);
  const $mode = () => store_get(mode, "$mode", $$stores);
  const iconMagentWeak = () => __vitePreload(() => import("./magnetWeak-DelgZQTp.js"), true ? [] : void 0, import.meta.url).then((mod) => mod.default);
  const { t } = useTranslation();
  const toolService = useService(IToolService);
  const configurationService = useService(IConfigurationService);
  const strongMagnetEnabled = configurationService.featureEnabled("left_strong_magnet");
  const mode = derived(toolService.store, (store) => {
    return store.magnetModeOverride ?? store.magnetMode;
  });
  const icon = derived(mode, (mode2) => {
    return mode2 === MagnetMode.StrongMagnet ? iconMagentStrong : iconMagentWeak;
  });
  const toggleMagnet = () => {
    if (get$1(mode) === MagnetMode.Normal) {
      toolService.setMagnetMode(MagnetMode.WeakMagnet);
    } else {
      toolService.setMagnetMode(MagnetMode.Normal);
    }
  };
  const setStrongMagnet = () => {
    toolService.setMagnetMode(MagnetMode.StrongMagnet);
  };
  const setWeakMagnet = () => {
    toolService.setMagnetMode(MagnetMode.WeakMagnet);
  };
  const kb = KeyMod.CtrlCmd;
  init();
  {
    let $0 = derived_safe_equal(() => $mode() !== MagnetMode.Normal);
    let $1 = derived_safe_equal(() => strongMagnetEnabled ? "tool.more.magnet" : void 0);
    IconButton($$anchor, {
      get icon() {
        return $icon();
      },
      tip: "tool.magnet",
      get active() {
        return get($0);
      },
      get keybinding() {
        return kb;
      },
      get moreTip() {
        return get($1);
      },
      onselect: toggleMagnet,
      negativeColor: true,
      children: ($$anchor2, $$slotProps) => {
        var fragment_1 = comment();
        var node = first_child(fragment_1);
        {
          var consequent = ($$anchor3) => {
            var div = root_2$2();
            var node_1 = child(div);
            List(node_1, {
              children: ($$anchor4, $$slotProps2) => {
                var fragment_2 = root_3$1();
                var node_2 = first_child(fragment_2);
                {
                  let $02 = derived_safe_equal(() => $mode() === MagnetMode.WeakMagnet);
                  let $12 = derived_safe_equal(() => ifLeftClick(setWeakMagnet));
                  Item(node_2, {
                    tag: "div",
                    class: "item",
                    get selected() {
                      return get($02);
                    },
                    get onpointerup() {
                      return get($12);
                    },
                    children: ($$anchor5, $$slotProps3) => {
                      var fragment_3 = root_4$2();
                      var div_1 = first_child(fragment_3);
                      var node_3 = child(div_1);
                      AsyncSvgIcon(node_3, { icon: iconMagentWeak });
                      var div_2 = sibling(div_1, 2);
                      var text = child(div_2);
                      template_effect(($03) => set_text(text, $03), [() => t("tool.magnet.weak")]);
                      append($$anchor5, fragment_3);
                    },
                    $$slots: { default: true }
                  });
                }
                var node_4 = sibling(node_2, 2);
                {
                  let $02 = derived_safe_equal(() => $mode() === MagnetMode.StrongMagnet);
                  let $12 = derived_safe_equal(() => ifLeftClick(setStrongMagnet));
                  Item(node_4, {
                    tag: "div",
                    class: "item",
                    get selected() {
                      return get($02);
                    },
                    get onpointerup() {
                      return get($12);
                    },
                    children: ($$anchor5, $$slotProps3) => {
                      var fragment_4 = root_5$3();
                      var div_3 = first_child(fragment_4);
                      var node_5 = child(div_3);
                      AsyncSvgIcon(node_5, {
                        get icon() {
                          return iconMagentStrong;
                        }
                      });
                      var div_4 = sibling(div_3, 2);
                      var text_1 = child(div_4);
                      template_effect(($03) => set_text(text_1, $03), [() => t("tool.magnet.strong")]);
                      append($$anchor5, fragment_4);
                    },
                    $$slots: { default: true }
                  });
                }
                append($$anchor4, fragment_2);
              },
              $$slots: { default: true }
            });
            append($$anchor3, div);
          };
          if_block(node, ($$render) => {
            if (strongMagnetEnabled) $$render(consequent);
          });
        }
        append($$anchor2, fragment_1);
      },
      $$slots: { default: true }
    });
  }
  pop();
  $$cleanup();
}
function Measure($$anchor, $$props) {
  push($$props, false);
  const [$$stores, $$cleanup] = setup_stores();
  const $activeType = () => store_get(activeType, "$activeType", $$stores);
  const toolService = useService(IToolService);
  const configurationService = useService(IConfigurationService);
  const drawingsAccessType = configurationService.getValue("drawingsAccessType");
  const drawingsAccess = configurationService.getValue("drawingsAccess");
  const accessable = function() {
    switch (drawingsAccessType) {
      case "white": {
        return drawingsAccess[MeasureToolType] === "white";
      }
      case "black": {
        return drawingsAccess[MeasureToolType] !== "black";
      }
      default:
        return true;
    }
  }();
  const activeType = derived(toolService.store, (store) => store.activeType);
  init();
  var fragment = comment();
  var node = first_child(fragment);
  {
    var consequent = ($$anchor2) => {
      {
        let $0 = derived_safe_equal(() => $activeType() === measure.type);
        IconButton($$anchor2, {
          tip: "tool.measure",
          get icon() {
            return measure.icon;
          },
          get keybinding() {
            return KeyMod.Shift;
          },
          contentAfterKb: "tool.measure.after",
          get active() {
            return get($0);
          },
          onselect: () => {
            toolService.switchTool(measure.type);
          }
        });
      }
    };
    if_block(node, ($$render) => {
      if (accessable) $$render(consequent);
    });
  }
  append($$anchor, fragment);
  pop();
  $$cleanup();
}
const iconRemoveAll = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width="28" height="28"><path fill="currentColor" d="M18 7h5v1h-2.01l-1.33 14.64a1.5 1.5 0 0 1-1.5 1.36H9.84a1.5 1.5 0 0 1-1.49-1.36L7.01 8H5V7h5V6c0-1.1.9-2 2-2h4a2 2 0 0 1 2 2v1Zm-6-2a1 1 0 0 0-1 1v1h6V6a1 1 0 0 0-1-1h-4ZM8.02 8l1.32 14.54a.5.5 0 0 0 .5.46h8.33a.5.5 0 0 0 .5-.46L19.99 8H8.02Z"></path></svg>\n';
var root_3 = from_html(`<div class="itemLabel svelte-13i8k1l"> </div>`);
var root_4$1 = from_html(`<div class="itemLabel svelte-13i8k1l"> </div>`);
var root_5$2 = from_html(`<div class="itemLabel svelte-13i8k1l"> </div>`);
var root_2$1 = from_html(`<!> <!> <!>`, 1);
var root_1$1 = from_html(`<div class="menu svelte-13i8k1l"><!></div>`);
const $$css$3 = {
  hash: "svelte-13i8k1l",
  code: '.menu.svelte-13i8k1l {-webkit-font-smoothing:antialiased;-webkit-text-size-adjust:100%;font-variation-settings:normal;font-feature-settings:"tnum" on, "lnum" on, "rlig" 1, "calt" 1;font-family:var(--cl-font-family);height:100%;overflow-x:hidden;overflow-y:auto;overscroll-behavior:contain;height:fit-content;}.menu.svelte-13i8k1l::-webkit-scrollbar {-webkit-appearance:none;width:3px;height:3px;}.menu.svelte-13i8k1l::-webkit-scrollbar-corner {display:none;}.menu.svelte-13i8k1l::-webkit-scrollbar-thumb {background-clip:content-box;background-color:var(--cl-scrollbarThumb-background);border-radius:3px;}.menu.svelte-13i8k1l::-webkit-scrollbar-track {background-color:initial;border-radius:3px;}.menu.svelte-13i8k1l .mdc-deprecated-list {margin:0;padding:0;list-style:none;}.menu.svelte-13i8k1l .item {padding:6px 10px;display:flex;flex-flow:row nowrap;align-items:center;cursor:default;color:var(--cl-listItem-foreground);}\n@media (hover: hover) and (pointer: fine) {.menu.svelte-13i8k1l .item:hover:not(.mdc-deprecated-list-item--selected):not(.mdc-deprecated-list-item--disabled) {background-color:var(--cl-listItem-hoverBackground);}\n}.menu.svelte-13i8k1l .mdc-deprecated-list-item--disabled {cursor:not-allowed;color:var(--cl-listItem-disabledForeground);}.menu.svelte-13i8k1l .mdc-deprecated-list-item--selected {color:var(--cl-listItem-selectedForeground);background:var(--cl-listItem-selectedBackground);}.itemLabel.svelte-13i8k1l {font-size:14px;white-space:nowrap;flex:0 1 100%;padding-right:12px;user-select:none;}'
};
function Remove($$anchor, $$props) {
  push($$props, false);
  append_styles($$anchor, $$css$3);
  const [$$stores, $$cleanup] = setup_stores();
  const $drawingCount = () => store_get(drawingCount, "$drawingCount", $$stores);
  const $indicatorCount = () => store_get(indicatorCount, "$indicatorCount", $$stores);
  const { t } = useTranslation();
  const chartManagementService = useService(IChartManagementService);
  const indicatorCount = derived(chartManagementService.store, (store) => {
    var _a;
    return ((_a = store.instances[store.activeIndex]) == null ? void 0 : _a.studyList.length) ?? 0;
  });
  const drawingCount = derived(chartManagementService.store, (store) => {
    var _a;
    return ((_a = store.instances[store.activeIndex]) == null ? void 0 : _a.drawingInfos.length) ?? 0;
  });
  const removeDrawings = async () => {
    chartManagementService.activeChart().getController().removeAll();
  };
  const removeIndicators = () => {
    chartManagementService.activeChart().removeAllStudy();
  };
  const removeAll = () => {
    removeDrawings();
    removeIndicators();
  };
  init();
  IconButton($$anchor, {
    get icon() {
      return iconRemoveAll;
    },
    tip: "tool.removeObjects",
    moreTip: "tool.more.remove",
    asMenuTrigger: true,
    children: ($$anchor2, $$slotProps) => {
      var div = root_1$1();
      var node = child(div);
      List(node, {
        children: ($$anchor3, $$slotProps2) => {
          var fragment_1 = root_2$1();
          var node_1 = first_child(fragment_1);
          {
            let $0 = derived_safe_equal(() => ifLeftClick(removeDrawings));
            Item(node_1, {
              tag: "div",
              class: "item",
              get onpointerup() {
                return get($0);
              },
              children: ($$anchor4, $$slotProps3) => {
                var div_1 = root_3();
                var text = child(div_1);
                template_effect(($02) => set_text(text, $02), [() => t("tool.remove.drawing", { draw: $drawingCount() })]);
                append($$anchor4, div_1);
              },
              $$slots: { default: true }
            });
          }
          var node_2 = sibling(node_1, 2);
          {
            let $0 = derived_safe_equal(() => ifLeftClick(removeIndicators));
            Item(node_2, {
              tag: "div",
              class: "item",
              get onpointerup() {
                return get($0);
              },
              children: ($$anchor4, $$slotProps3) => {
                var div_2 = root_4$1();
                var text_1 = child(div_2);
                template_effect(($02) => set_text(text_1, $02), [() => t("tool.remove.indicator", { ind: $indicatorCount() })]);
                append($$anchor4, div_2);
              },
              $$slots: { default: true }
            });
          }
          var node_3 = sibling(node_2, 2);
          {
            let $0 = derived_safe_equal(() => ifLeftClick(removeAll));
            Item(node_3, {
              tag: "div",
              class: "item",
              get onpointerup() {
                return get($0);
              },
              children: ($$anchor4, $$slotProps3) => {
                var div_3 = root_5$2();
                var text_2 = child(div_3);
                template_effect(($02) => set_text(text_2, $02), [
                  () => t("tool.remove.drawingAndIndicator", { draw: $drawingCount(), ind: $indicatorCount() })
                ]);
                append($$anchor4, div_3);
              },
              $$slots: { default: true }
            });
          }
          append($$anchor3, fragment_1);
        },
        $$slots: { default: true }
      });
      append($$anchor2, div);
    },
    $$slots: { default: true }
  });
  pop();
  $$cleanup();
}
var root_5$1 = from_html(`<div class="sectionTitle svelte-13i8k1l"> </div>`);
var root_8$1 = from_html(`<div class="itemKeybinding svelte-13i8k1l"> </div>`);
var root_7 = from_html(`<div class="itemIcon svelte-13i8k1l"><!></div> <div class="itemLabel svelte-13i8k1l"> </div> <!>`, 1);
var root_9$1 = from_html(`<div class="separator svelte-13i8k1l"></div>`);
var root_4 = from_html(`<!> <!> <!>`, 1);
var root_2 = from_html(`<div class="menu svelte-13i8k1l"><!></div>`);
const $$css$2 = {
  hash: "svelte-13i8k1l",
  code: '.menu.svelte-13i8k1l {-webkit-font-smoothing:antialiased;-webkit-text-size-adjust:100%;font-variation-settings:normal;font-feature-settings:"tnum" on, "lnum" on, "rlig" 1, "calt" 1;font-family:var(--cl-font-family);height:100%;overflow-x:hidden;overflow-y:auto;overscroll-behavior:contain;height:fit-content;}.menu.svelte-13i8k1l::-webkit-scrollbar {-webkit-appearance:none;width:3px;height:3px;}.menu.svelte-13i8k1l::-webkit-scrollbar-corner {display:none;}.menu.svelte-13i8k1l::-webkit-scrollbar-thumb {background-clip:content-box;background-color:var(--cl-scrollbarThumb-background);border-radius:3px;}.menu.svelte-13i8k1l::-webkit-scrollbar-track {background-color:initial;border-radius:3px;}.menu.svelte-13i8k1l .mdc-deprecated-list {margin:0;padding:0;list-style:none;}.sectionTitle.svelte-13i8k1l {padding:4px 12px;font-size:11px;letter-spacing:0.4px;line-height:16px;color:var(--cl-listTitle-foreground);user-select:none;}.menu.svelte-13i8k1l .item {padding:6px 10px;display:flex;flex-flow:row nowrap;align-items:center;cursor:default;color:var(--cl-listItem-foreground);}\n@media (hover: hover) and (pointer: fine) {.menu.svelte-13i8k1l .item:hover:not(.mdc-deprecated-list-item--selected):not(.mdc-deprecated-list-item--disabled) {background-color:var(--cl-listItem-hoverBackground);}\n}.menu.svelte-13i8k1l .mdc-deprecated-list-item--disabled {cursor:not-allowed;color:var(--cl-listItem-disabledForeground);}.menu.svelte-13i8k1l .mdc-deprecated-list-item--selected {color:var(--cl-listItem-selectedForeground);background:var(--cl-listItem-selectedBackground);}.itemIcon.svelte-13i8k1l {flex-shrink:0;margin-right:6px;height:28px;width:28px;display:flex;align-items:center;justify-content:center;}.itemLabel.svelte-13i8k1l {font-size:14px;white-space:nowrap;flex:0 1 100%;padding-right:12px;user-select:none;}.itemKeybinding.svelte-13i8k1l {font-size:12px;margin-left:58px;margin-right:5px;text-align:right;white-space:nowrap;color:var(--cl-listKeybinding-foreground);user-select:none;}.separator.svelte-13i8k1l {width:100%;height:1px;margin-bottom:6px;margin-top:6px;background-color:var(--cl-gutter-background);}'
};
function ToolsGroups($$anchor, $$props) {
  var _a;
  push($$props, true);
  append_styles($$anchor, $$css$2);
  const [$$stores, $$cleanup] = setup_stores();
  const $selected = () => store_get(selected, "$selected", $$stores);
  const $activeType = () => store_get(activeType, "$activeType", $$stores);
  const { t } = useTranslation();
  const toolService = useService(IToolService);
  const storeService = useService(IStoreService);
  const configurationService = useService(IConfigurationService);
  const drawingsAccessType = configurationService.getValue("drawingsAccessType");
  const drawingsAccess = configurationService.getValue("drawingsAccess");
  const activeType = derived(toolService.store, (store) => store.activeType);
  const accessableGroups = (() => {
    switch (drawingsAccessType) {
      case "black": {
        return $$props.groups.reduce(
          (acc, group) => {
            const items = group.items.filter((i) => drawingsAccess[i.type] !== "black");
            if (items.length) {
              acc.push({ name: group.name, items });
            }
            return acc;
          },
          []
        );
      }
      case "white": {
        return $$props.groups.reduce(
          (acc, group) => {
            const items = group.items.filter((i) => drawingsAccess[i.type] === "white");
            if (items.length) {
              acc.push({ name: group.name, items });
            }
            return acc;
          },
          []
        );
      }
      default:
        return $$props.groups;
    }
  })();
  const selectedType = storeService.defineStore($$props.name, (_a = accessableGroups[0]) == null ? void 0 : _a.items[0].type);
  const selected = derived(selectedType, (selectedType2) => {
    var _a2;
    for (let group of accessableGroups) {
      for (let item of group.items) {
        if (item.type === selectedType2) {
          return item;
        }
      }
    }
    return ((_a2 = accessableGroups[0]) == null ? void 0 : _a2.items[0]) ?? /* @__PURE__ */ Object.create(null);
  });
  const onDefaultOneSelected = () => {
    toolService.switchTool(get$1(selectedType));
  };
  const onItemSelected = (id) => {
    toolService.switchTool(id);
  };
  useDisposable(toolService.onDidChangeTool((e) => {
    const { next, source } = e;
    if (!next) return;
    if (source === TriggerSource.program) return;
    accessableGroups.forEach((group) => {
      const entry = group.items.find((i) => i.type === next.type);
      if (entry) {
        selectedType.set(next.type);
      }
    });
  }));
  var fragment = comment();
  var node = first_child(fragment);
  {
    var consequent_3 = ($$anchor2) => {
      {
        let $0 = user_derived(() => $activeType() === $selected().type);
        IconButton($$anchor2, {
          get icon() {
            return $selected().icon;
          },
          get tip() {
            return $selected().type;
          },
          get disabled() {
            return $selected().disabled;
          },
          get active() {
            return get($0);
          },
          get moreTip() {
            return $$props.moreTip;
          },
          onselect: onDefaultOneSelected,
          children: ($$anchor3, $$slotProps) => {
            var div = root_2();
            var node_1 = child(div);
            List(node_1, {
              children: ($$anchor4, $$slotProps2) => {
                var fragment_2 = comment();
                var node_2 = first_child(fragment_2);
                each(node_2, 17, () => accessableGroups, index, ($$anchor5, group, index$1) => {
                  var fragment_3 = root_4();
                  var node_3 = first_child(fragment_3);
                  {
                    var consequent = ($$anchor6) => {
                      var div_1 = root_5$1();
                      var text = child(div_1);
                      template_effect(($02) => set_text(text, $02), [() => t(get(group).name)]);
                      append($$anchor6, div_1);
                    };
                    if_block(node_3, ($$render) => {
                      if (get(group).name) $$render(consequent);
                    });
                  }
                  var node_4 = sibling(node_3, 2);
                  each(node_4, 17, () => get(group).items, index, ($$anchor6, item, index2, $$array) => {
                    {
                      let $02 = user_derived(() => $activeType() === get(item).type);
                      let $1 = user_derived(() => ifLeftClick(() => {
                        if (get(item).disabled) return;
                        onItemSelected(get(item).type);
                      }));
                      Item($$anchor6, {
                        tag: "div",
                        get disabled() {
                          return get(item).disabled;
                        },
                        get selected() {
                          return get($02);
                        },
                        class: "item",
                        get onpointerup() {
                          return get($1);
                        },
                        children: ($$anchor7, $$slotProps3) => {
                          var fragment_5 = root_7();
                          var div_2 = first_child(fragment_5);
                          var node_5 = child(div_2);
                          AsyncSvgIcon(node_5, {
                            get icon() {
                              return get(item).icon;
                            }
                          });
                          var div_3 = sibling(div_2, 2);
                          var text_1 = child(div_3);
                          var node_6 = sibling(div_3, 2);
                          {
                            var consequent_1 = ($$anchor8) => {
                              var div_4 = root_8$1();
                              var text_2 = child(div_4);
                              template_effect(($03) => set_text(text_2, $03), [() => getKeybindingLabel(get(item).keybinding)]);
                              append($$anchor8, div_4);
                            };
                            if_block(node_6, ($$render) => {
                              if (get(item).keybinding) $$render(consequent_1);
                            });
                          }
                          template_effect(($03) => set_text(text_1, $03), [() => t(get(item).type)]);
                          append($$anchor7, fragment_5);
                        },
                        $$slots: { default: true }
                      });
                    }
                  });
                  var node_7 = sibling(node_4, 2);
                  {
                    var consequent_2 = ($$anchor6) => {
                      var div_5 = root_9$1();
                      append($$anchor6, div_5);
                    };
                    if_block(node_7, ($$render) => {
                      if (index$1 !== accessableGroups.length - 1) $$render(consequent_2);
                    });
                  }
                  append($$anchor5, fragment_3);
                });
                append($$anchor4, fragment_2);
              },
              $$slots: { default: true }
            });
            append($$anchor3, div);
          },
          $$slots: { default: true }
        });
      }
    };
    if_block(node, ($$render) => {
      if (accessableGroups.length) $$render(consequent_3);
    });
  }
  append($$anchor, fragment);
  pop();
  $$cleanup();
}
function Tools($$anchor) {
  const groupedTools = [
    CursorTools,
    LineTools,
    ChannelTools,
    FibAndGannTools,
    PatternTools,
    MeasureTools,
    ShapesTools,
    AnnotationTools
  ];
  var fragment = comment();
  var node = first_child(fragment);
  each(node, 1, () => groupedTools, index, ($$anchor2, item) => {
    ToolsGroups($$anchor2, spread_props(() => get(item)));
  });
  append($$anchor, fragment);
}
const $$css$1 = {
  hash: "svelte-13i8k1l",
  code: "\n@media (hover: hover) and (pointer: fine) {\n}"
};
function Visibility($$anchor, $$props) {
  push($$props, false);
  append_styles($$anchor, $$css$1);
  const [$$stores, $$cleanup] = setup_stores();
  const $icon = () => store_get(icon, "$icon", $$stores);
  const $tip = () => store_get(tip, "$tip", $$stores);
  const $active = () => store_get(active, "$active", $$stores);
  const iconHideAll = () => __vitePreload(() => import("./hideAll-CT8K8bky.js"), true ? [] : void 0, import.meta.url).then((mod) => mod.default);
  const iconHideDrawings = () => __vitePreload(() => import("./hideDrawings-DnxvwFti.js"), true ? [] : void 0, import.meta.url).then((mod) => mod.default);
  const iconHideIndicators = () => __vitePreload(() => import("./hideIndicators-xnR479IT.js"), true ? [] : void 0, import.meta.url).then((mod) => mod.default);
  const iconHidePositionsAndOrders = () => __vitePreload(() => import("./hidePositionsAndOrders-CKU09gd1.js"), true ? [] : void 0, import.meta.url).then((mod) => mod.default);
  const iconShowAll = () => __vitePreload(() => import("./showAll-CfI-GzNS.js"), true ? [] : void 0, import.meta.url).then((mod) => mod.default);
  const iconShowDrawings = () => __vitePreload(() => import("./showDrawings-gUum4OAP.js"), true ? [] : void 0, import.meta.url).then((mod) => mod.default);
  const iconShowIndicators = () => __vitePreload(() => import("./showIndicators-B9sZjyIe.js"), true ? [] : void 0, import.meta.url).then((mod) => mod.default);
  const iconShowPositionAndOrders = () => __vitePreload(() => import("./showPositionsAndOrders-YU1vuRH4.js"), true ? [] : void 0, import.meta.url).then((mod) => mod.default);
  const service = useService(IChartManagementService);
  const keybindingsRegistry = useService(IKeybindingsRegistry);
  let icon = writable(iconShowAll);
  let tip = writable("tool.hide.hideAll");
  const hideDrawings = derived(service.store, (store) => {
    return store.hideBits === HideDrawingsBit;
  });
  const hideIndicators = derived(service.store, (store) => {
    return store.hideBits === HideIndicatorsBit;
  });
  const hidePositionsAndOrders = derived(service.store, (store) => {
    return store.hideBits === HidePositionsAndOrdersBit;
  });
  const hideAll = derived(service.store, (store) => store.hideBits === (HideDrawingsBit | HideIndicatorsBit | HidePositionsAndOrdersBit));
  const active = derived(
    [
      hideDrawings,
      hideIndicators,
      hidePositionsAndOrders,
      hideAll
    ],
    ([
      hideDrawings2,
      hideIndicators2,
      hidePositionsAndOrders2,
      hideAll2
    ]) => {
      const i = get$1(icon);
      if (i === iconHideAll && hideAll2) return true;
      if (i === iconHideDrawings && hideDrawings2) return true;
      if (i === iconHideIndicators && hideIndicators2) return true;
      if (i === iconHidePositionsAndOrders && hidePositionsAndOrders2) return true;
      return false;
    }
  );
  const toggle = () => {
    const i = get$1(icon);
    if (i === iconHideAll || i === iconShowAll) {
      toggleAll();
    }
    if (i === iconHideDrawings || i === iconShowDrawings) {
      toggleDrawings();
    }
    if (i === iconHideIndicators || i === iconShowIndicators) {
      toggleIndicators();
    }
    if (i === iconHidePositionsAndOrders || i === iconShowPositionAndOrders) {
      togglePositionsAndOrders();
    }
  };
  const toggleDrawings = () => {
    const toSet = get$1(hideDrawings) ? 0 : HideDrawingsBit;
    icon.set(toSet ? iconHideDrawings : iconShowDrawings);
    tip.set(toSet ? "tool.hide.showDrawing" : "tool.hide.hideDrawing");
    service.setHideBits(toSet);
  };
  const toggleIndicators = () => {
    const toSet = get$1(hideIndicators) ? 0 : HideIndicatorsBit;
    icon.set(toSet ? iconHideIndicators : iconShowIndicators);
    tip.set(toSet ? "tool.hide.showIndicator" : "tool.hide.hideIndicator");
    service.setHideBits(toSet);
  };
  const togglePositionsAndOrders = () => {
    const toSet = get$1(hidePositionsAndOrders) ? 0 : HidePositionsAndOrdersBit;
    icon.set(toSet ? iconHidePositionsAndOrders : iconShowPositionAndOrders);
    tip.set(toSet ? "tool.hide.showPosition" : "tool.hide.hidePosition");
    service.setHideBits(toSet);
  };
  const toggleAll = () => {
    const toSet = get$1(hideAll) ? 0 : HideDrawingsBit | HideIndicatorsBit | HidePositionsAndOrdersBit;
    icon.set(toSet ? iconHideAll : iconShowAll);
    tip.set(toSet ? "tool.hide.showAll" : "tool.hide.hideAll");
    service.setHideBits(toSet);
  };
  const kb = KeyCode.KeyH | KeyMod.CtrlCmd | KeyMod.Alt;
  useDisposable(keybindingsRegistry.registerCommandAndKeybindingRule({
    id: "hides",
    primary: kb,
    weight: KeybindingWeight.ChartContrib,
    handler() {
      toggle();
    }
  }));
  init();
  IconButton($$anchor, {
    get icon() {
      return $icon();
    },
    get tip() {
      return $tip();
    },
    get active() {
      return $active();
    },
    get keybinding() {
      return kb;
    },
    onselect: toggle,
    negativeColor: true
  });
  pop();
  $$cleanup();
}
const iconZoomOut = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width="28" height="28" fill="currentColor"><path d="M17.646 18.354l4 4 .708-.708-4-4z"></path><path d="M12.5 21a8.5 8.5 0 1 1 0-17 8.5 8.5 0 0 1 0 17zm0-1a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15z"></path><path d="M9 13h7v-1H9z"></path></svg>\n';
var root_1 = from_html(`<!> <!>`, 1);
function Zoom($$anchor, $$props) {
  push($$props, false);
  const [$$stores, $$cleanup] = setup_stores();
  const $activeType = () => store_get(activeType, "$activeType", $$stores);
  const $canZoomOut = () => store_get(canZoomOut, "$canZoomOut", $$stores);
  const chartManagementService = useService(IChartManagementService);
  const toolService = useService(IToolService);
  const configurationService = useService(IConfigurationService);
  const drawingsAccessType = configurationService.getValue("drawingsAccessType");
  const drawingsAccess = configurationService.getValue("drawingsAccess");
  const accessable = function() {
    switch (drawingsAccessType) {
      case "white": {
        return drawingsAccess[ZoomInToolType] === "white";
      }
      case "black": {
        return drawingsAccess[ZoomInToolType] !== "black";
      }
      default:
        return true;
    }
  }();
  const activeType = derived(toolService.store, (store) => store.activeType);
  const canZoomOut = derived(chartManagementService.store, (store) => {
    const { activeIndex } = store;
    if (!isFinite(activeIndex)) return false;
    return store.instances[activeIndex].viewports.length > 0;
  });
  init();
  var fragment = comment();
  var node = first_child(fragment);
  {
    var consequent_1 = ($$anchor2) => {
      var fragment_1 = root_1();
      var node_1 = first_child(fragment_1);
      {
        let $0 = derived_safe_equal(() => $activeType() === zoomIn.type);
        IconButton(node_1, {
          tip: "tool.zoomIn",
          get icon() {
            return zoomIn.icon;
          },
          get active() {
            return get($0);
          },
          onselect: () => {
            toolService.switchTool(zoomIn.type);
          }
        });
      }
      var node_2 = sibling(node_1, 2);
      {
        var consequent = ($$anchor3) => {
          IconButton($$anchor3, {
            tip: "tool.zoomOut",
            get icon() {
              return iconZoomOut;
            },
            onselect: () => {
              chartManagementService.activeChart().zoomFromViewport();
            }
          });
        };
        if_block(node_2, ($$render) => {
          if ($canZoomOut()) $$render(consequent);
        });
      }
      append($$anchor2, fragment_1);
    };
    if_block(node, ($$render) => {
      if (accessable) $$render(consequent_1);
    });
  }
  append($$anchor, fragment);
  pop();
  $$cleanup();
}
const handleMouseOver = (_, checkButtonsVisibility) => {
  checkButtonsVisibility();
};
var root_5 = from_html(`<div class="separator svelte-19m1c0u"></div> <!>`, 1);
var root_8 = from_html(`<div class="separator svelte-19m1c0u"></div> <!>`, 1);
var root_10 = from_html(`<div> </div>`);
var root_9 = from_html(`<button aria-label="Toggle Visibility" class="leftToggle svelte-19m1c0u"><span><svg xmlns="http://www.w3.org/2000/svg" width="9" height="27" viewBox="0 0 9 27"><g fill="none" fill-rule="evenodd"><path class="background svelte-19m1c0u" d="M4.5.5a4 4 0 0 1 4 4v18a4 4 0 1 1-8 0v-18a4 4 0 0 1 4-4z"></path><path class="arrow svelte-19m1c0u" d="M5.5 10l-2 3.5 2 3.5"></path></g></svg></span></button> <!>`, 1);
var root = from_html(`<div><div class="drawingToolbar svelte-19m1c0u"><div class="content svelte-19m1c0u"><!> <!> <!> <!> <!> <!> <!> <!></div></div> <div><div class="iconWrap svelte-19m1c0u"><!></div></div> <div><div class="iconWrap"><!></div></div> <!></div>`);
const $$css = {
  hash: "svelte-19m1c0u",
  code: ".left.svelte-19m1c0u {--gap: 8px;width:52px;height:100%;position:relative;color:var(--cl-foreground);background-color:var(--cl-background);border-top-right-radius:4px;margin-right:4px;box-sizing:border-box;}.left.collapsed.svelte-19m1c0u {width:0;margin-right:calc(4px + 5px);}.left.collapsed.svelte-19m1c0u > .drawingToolbar:where(.svelte-19m1c0u) {display:none;}.left.collapsed.svelte-19m1c0u .leftToggle:where(.svelte-19m1c0u) {left:0;margin-left:0;}.separator.svelte-19m1c0u {display:block;height:1px;background-color:var(--cl-gutter-background);margin:6px 8px;}.drawingToolbar.svelte-19m1c0u {height:100%;width:100%;overflow-y:auto;overscroll-behavior:contain;}.drawingToolbar.svelte-19m1c0u::-webkit-scrollbar {display:none;height:0;width:0;}.drawingToolbar.svelte-19m1c0u::-webkit-scrollbar-thumb {display:none;}.drawingToolbar.svelte-19m1c0u::-webkit-scrollbar-track {display:none;}.drawingToolbar.svelte-19m1c0u::-webkit-scrollbar-corner {display:none;}.content.svelte-19m1c0u {height:fit-content;margin:6px 0;}.scrollBtn.svelte-19m1c0u {position:absolute;width:100%;height:24px;left:0;display:none;align-items:center;justify-content:center;background-color:var(--cl-scroll-background);transition:background-color 0.35s ease, transform 0.11666667s cubic-bezier(0.55, 0.055, 0.675, 0.19);}.scrollBtn.svelte-19m1c0u svg {color:var(--cl-scroll-foreground);transition:transform 60ms ease;}.isVisible.svelte-19m1c0u {transform:translateY(0);transition-timing-function:cubic-bezier(0.215, 0.61, 0.355, 1);}\n\n@media (hover: hover) and (pointer: fine) {.left.svelte-19m1c0u:hover .scrollBtn.isVisible:where(.svelte-19m1c0u) {display:flex;}.scrollBtn.svelte-19m1c0u:hover {transition:background-color 58.33333ms ease, transform 0.11666667s cubic-bezier(0.215, 0.61, 0.355, 1);}.scrollBtn.svelte-19m1c0u:hover svg {transform:translateY(1px);}\n}.scrollTop.svelte-19m1c0u {top:0;border-top-right-radius:4px;}.scrollTop.svelte-19m1c0u .iconWrap:where(.svelte-19m1c0u) {transform:rotate(180deg);}.scrollBot.svelte-19m1c0u {bottom:0;}.leftToggle.svelte-19m1c0u {outline:none;border:none;background:none;padding-block:initial;padding-inline:initial;font-family:inherit;color:inherit;position:absolute;bottom:58px;left:100%;margin-left:-6px;z-index:10;}.leftToggle.svelte-19m1c0u .container:where(.svelte-19m1c0u) {transition:fill 60ms ease, stroke 60ms ease;}.leftToggle.svelte-19m1c0u .background:where(.svelte-19m1c0u) {fill:var(--cl-background);stroke:var(--cl-gutter-background);}.leftToggle.svelte-19m1c0u .arrow:where(.svelte-19m1c0u) {stroke:var(--cl-handle-foreground);}.leftToggle.svelte-19m1c0u .mirror:where(.svelte-19m1c0u) {transform:rotate(180deg);}.leftToggle.svelte-19m1c0u .mirror:where(.svelte-19m1c0u) .background:where(.svelte-19m1c0u) {fill:var(--cl-negative-background);stroke:var(--cl-negative-background);}.leftToggle.svelte-19m1c0u .mirror:where(.svelte-19m1c0u) .arrow:where(.svelte-19m1c0u) {stroke:var(--cl-negative-foreground);}"
};
function Left($$anchor, $$props) {
  push($$props, true);
  append_styles($$anchor, $$css);
  const { t } = useTranslation();
  const chartManagementService = useService(IChartManagementService);
  let collapsed = state(false);
  const data = proxy({
    heightOuter: 0,
    heightInner: 0,
    isTopButtonVisible: false,
    isBotButtonVisible: false
  });
  let outerDiv;
  let container;
  const currentPosition = () => {
    return outerDiv.scrollTop;
  };
  const isAtTop = () => {
    return currentPosition() <= 1;
  };
  const isAtBot = () => {
    return currentPosition() + data.heightOuter >= data.heightInner - 1;
  };
  const checkButtonsVisibility = () => {
    const { isTopButtonVisible, isBotButtonVisible } = data;
    const atTop = isAtTop();
    const atBottom = isAtBot();
    if (!atTop && !isTopButtonVisible) {
      data.isTopButtonVisible = true;
    } else if (atTop && isBotButtonVisible) {
      data.isTopButtonVisible = false;
    }
    if (!atBottom && !isBotButtonVisible) {
      data.isBotButtonVisible = true;
    } else if (atBottom && isBotButtonVisible) {
      data.isBotButtonVisible = false;
    }
  };
  const handleResizeOuter = (rect) => {
    data.heightOuter = rect.height;
  };
  const handleResizeInner = (rect) => {
    data.heightInner = rect.height;
  };
  const handleScroll = () => {
    checkButtonsVisibility();
  };
  const animateTo = (targetScrollTop, duration = 350) => {
    if (outerDiv) {
      doAnimate({
        onStep: (progress, currentValue) => {
          outerDiv.scrollTop = currentValue;
        },
        from: outerDiv.scrollTop,
        to: Math.round(targetScrollTop),
        easing: easingFunc.easeInOutCubic,
        duration
      });
    }
  };
  const handleScrollTop = () => {
    animateTo(Math.max(0, currentPosition() - (data.heightOuter - 50)));
  };
  const handleScrollBot = () => {
    animateTo(Math.min(data.heightInner - data.heightOuter, currentPosition() + (data.heightOuter - 50)));
  };
  const toggleToolbarVisibility = () => {
    set(collapsed, !get(collapsed));
    if (get(collapsed)) {
      container.classList.add("collapsed");
    } else {
      container.classList.remove("collapsed");
    }
    chartManagementService.autoResizeNow();
  };
  useIdlePriority(() => {
    checkButtonsVisibility();
  });
  onDestroy(() => {
    container = null;
    outerDiv = null;
  });
  var div = root();
  var div_1 = child(div);
  div_1.__mouseover = [handleMouseOver, checkButtonsVisibility];
  var div_2 = child(div_1);
  var node = child(div_2);
  Scheduler(node, {
    idle: true,
    children: ($$anchor2, $$slotProps) => {
      Tools($$anchor2);
    },
    $$slots: { default: true }
  });
  var node_1 = sibling(node, 2);
  Scheduler(node_1, {
    idle: true,
    children: ($$anchor2, $$slotProps) => {
      Icons($$anchor2, {});
    },
    $$slots: { default: true }
  });
  var node_2 = sibling(node_1, 2);
  Scheduler(node_2, {
    idle: true,
    children: ($$anchor2, $$slotProps) => {
      Measure($$anchor2, {});
    },
    $$slots: { default: true }
  });
  var node_3 = sibling(node_2, 2);
  Scheduler(node_3, {
    idle: true,
    children: ($$anchor2, $$slotProps) => {
      Zoom($$anchor2, {});
    },
    $$slots: { default: true }
  });
  var node_4 = sibling(node_3, 2);
  Scheduler(node_4, {
    idle: true,
    children: ($$anchor2, $$slotProps) => {
      var fragment_4 = root_5();
      var node_5 = sibling(first_child(fragment_4), 2);
      Magnet(node_5, {});
      append($$anchor2, fragment_4);
    },
    $$slots: { default: true }
  });
  var node_6 = sibling(node_4, 2);
  Scheduler(node_6, {
    idle: true,
    children: ($$anchor2, $$slotProps) => {
      KeepDrawing($$anchor2, {});
    },
    $$slots: { default: true }
  });
  var node_7 = sibling(node_6, 2);
  Scheduler(node_7, {
    idle: true,
    children: ($$anchor2, $$slotProps) => {
      Visibility($$anchor2, {});
    },
    $$slots: { default: true }
  });
  var node_8 = sibling(node_7, 2);
  Scheduler(node_8, {
    idle: true,
    children: ($$anchor2, $$slotProps) => {
      var fragment_7 = root_8();
      var node_9 = sibling(first_child(fragment_7), 2);
      Remove(node_9, {});
      append($$anchor2, fragment_7);
    },
    $$slots: { default: true }
  });
  bind_this(div_1, ($$value) => outerDiv = $$value, () => outerDiv);
  var div_3 = sibling(div_1, 2);
  var event_handler = user_derived(() => ifLeftClick(handleScrollTop));
  div_3.__pointerup = function(...$$args) {
    var _a;
    (_a = get(event_handler)) == null ? void 0 : _a.apply(this, $$args);
  };
  var div_4 = child(div_3);
  var node_10 = child(div_4);
  html(node_10, () => Chevron);
  var div_5 = sibling(div_3, 2);
  var event_handler_1 = user_derived(() => ifLeftClick(handleScrollBot));
  div_5.__pointerup = function(...$$args) {
    var _a;
    (_a = get(event_handler_1)) == null ? void 0 : _a.apply(this, $$args);
  };
  var div_6 = child(div_5);
  var node_11 = child(div_6);
  html(node_11, () => Chevron);
  var node_12 = sibling(div_5, 2);
  Wrapper(node_12, {
    children: ($$anchor2, $$slotProps) => {
      var fragment_8 = root_9();
      var button = first_child(fragment_8);
      var event_handler_2 = user_derived(() => ifLeftClick(toggleToolbarVisibility));
      button.__pointerup = function(...$$args) {
        var _a;
        (_a = get(event_handler_2)) == null ? void 0 : _a.apply(this, $$args);
      };
      var span = child(button);
      var svg = child(span);
      var node_13 = sibling(button, 2);
      Tooltip(node_13, {
        xPos: "side_end",
        yPos: "side",
        children: ($$anchor3, $$slotProps2) => {
          var div_7 = root_10();
          var text = child(div_7);
          template_effect(($0) => set_text(text, $0), [
            () => t(get(collapsed) ? "drawingBar.show" : "drawingBar.hide")
          ]);
          append($$anchor3, div_7);
        },
        $$slots: { default: true }
      });
      template_effect(() => set_class(svg, 0, clsx(["container", get(collapsed) && "mirror"]), "svelte-19m1c0u"));
      append($$anchor2, fragment_8);
    },
    $$slots: { default: true }
  });
  bind_this(div, ($$value) => container = $$value, () => container);
  template_effect(() => {
    set_class(div, 1, clsx(["left", get(collapsed) && "collapsed"]), "svelte-19m1c0u");
    set_class(
      div_3,
      1,
      clsx([
        "scrollBtn",
        "scrollTop",
        data.isTopButtonVisible && data.heightInner > data.heightOuter && "isVisible"
      ]),
      "svelte-19m1c0u"
    );
    set_class(
      div_5,
      1,
      clsx([
        "scrollBtn",
        "scrollBot",
        data.isBotButtonVisible && data.heightInner > data.heightOuter && "isVisible"
      ]),
      "svelte-19m1c0u"
    );
  });
  event("scroll", div_1, handleScroll);
  bind_resize_observer(div_2, "contentRect", handleResizeInner);
  bind_resize_observer(div_1, "contentRect", handleResizeOuter);
  append($$anchor, div);
  pop();
}
delegate(["mouseover", "pointerup"]);
export {
  Left as default
};
