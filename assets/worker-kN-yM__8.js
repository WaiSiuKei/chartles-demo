var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
(function() {
  "use strict";
  /**
   * @license
   * Copyright 2019 Google LLC
   * SPDX-License-Identifier: Apache-2.0
   */
  const proxyMarker = Symbol("Comlink.proxy");
  const createEndpoint = Symbol("Comlink.endpoint");
  const releaseProxy = Symbol("Comlink.releaseProxy");
  const finalizer = Symbol("Comlink.finalizer");
  const throwMarker = Symbol("Comlink.thrown");
  const isObject = (val) => typeof val === "object" && val !== null || typeof val === "function";
  const proxyTransferHandler = {
    canHandle: (val) => isObject(val) && val[proxyMarker],
    serialize(obj) {
      const { port1, port2 } = new MessageChannel();
      expose(obj, port1);
      return [port2, [port2]];
    },
    deserialize(port) {
      port.start();
      return wrap(port);
    }
  };
  const throwTransferHandler = {
    canHandle: (value) => isObject(value) && throwMarker in value,
    serialize({ value }) {
      let serialized;
      if (value instanceof Error) {
        serialized = {
          isError: true,
          value: {
            message: value.message,
            name: value.name,
            stack: value.stack
          }
        };
      } else {
        serialized = { isError: false, value };
      }
      return [serialized, []];
    },
    deserialize(serialized) {
      if (serialized.isError) {
        throw Object.assign(new Error(serialized.value.message), serialized.value);
      }
      throw serialized.value;
    }
  };
  const transferHandlers = /* @__PURE__ */ new Map([
    ["proxy", proxyTransferHandler],
    ["throw", throwTransferHandler]
  ]);
  function isAllowedOrigin(allowedOrigins, origin) {
    for (const allowedOrigin of allowedOrigins) {
      if (origin === allowedOrigin || allowedOrigin === "*") {
        return true;
      }
      if (allowedOrigin instanceof RegExp && allowedOrigin.test(origin)) {
        return true;
      }
    }
    return false;
  }
  function expose(obj, ep = globalThis, allowedOrigins = ["*"]) {
    ep.addEventListener("message", function callback(ev) {
      if (!ev || !ev.data) {
        return;
      }
      if (!isAllowedOrigin(allowedOrigins, ev.origin)) {
        console.warn(`Invalid origin '${ev.origin}' for comlink proxy`);
        return;
      }
      const { id, type, path } = Object.assign({ path: [] }, ev.data);
      const argumentList = (ev.data.argumentList || []).map(fromWireValue);
      let returnValue;
      try {
        const parent = path.slice(0, -1).reduce((obj2, prop) => obj2[prop], obj);
        const rawValue = path.reduce((obj2, prop) => obj2[prop], obj);
        switch (type) {
          case "GET":
            {
              returnValue = rawValue;
            }
            break;
          case "SET":
            {
              parent[path.slice(-1)[0]] = fromWireValue(ev.data.value);
              returnValue = true;
            }
            break;
          case "APPLY":
            {
              returnValue = rawValue.apply(parent, argumentList);
            }
            break;
          case "CONSTRUCT":
            {
              const value = new rawValue(...argumentList);
              returnValue = proxy(value);
            }
            break;
          case "ENDPOINT":
            {
              const { port1, port2 } = new MessageChannel();
              expose(obj, port2);
              returnValue = transfer(port1, [port1]);
            }
            break;
          case "RELEASE":
            {
              returnValue = void 0;
            }
            break;
          default:
            return;
        }
      } catch (value) {
        returnValue = { value, [throwMarker]: 0 };
      }
      Promise.resolve(returnValue).catch((value) => {
        return { value, [throwMarker]: 0 };
      }).then((returnValue2) => {
        const [wireValue, transferables] = toWireValue(returnValue2);
        ep.postMessage(Object.assign(Object.assign({}, wireValue), { id }), transferables);
        if (type === "RELEASE") {
          ep.removeEventListener("message", callback);
          closeEndPoint(ep);
          if (finalizer in obj && typeof obj[finalizer] === "function") {
            obj[finalizer]();
          }
        }
      }).catch((error) => {
        const [wireValue, transferables] = toWireValue({
          value: new TypeError("Unserializable return value"),
          [throwMarker]: 0
        });
        ep.postMessage(Object.assign(Object.assign({}, wireValue), { id }), transferables);
      });
    });
    if (ep.start) {
      ep.start();
    }
  }
  function isMessagePort(endpoint) {
    return endpoint.constructor.name === "MessagePort";
  }
  function closeEndPoint(endpoint) {
    if (isMessagePort(endpoint))
      endpoint.close();
  }
  function wrap(ep, target) {
    const pendingListeners = /* @__PURE__ */ new Map();
    ep.addEventListener("message", function handleMessage(ev) {
      const { data } = ev;
      if (!data || !data.id) {
        return;
      }
      const resolver = pendingListeners.get(data.id);
      if (!resolver) {
        return;
      }
      try {
        resolver(data);
      } finally {
        pendingListeners.delete(data.id);
      }
    });
    return createProxy(ep, pendingListeners, [], target);
  }
  function throwIfProxyReleased(isReleased) {
    if (isReleased) {
      throw new Error("Proxy has been released and is not useable");
    }
  }
  function releaseEndpoint(ep) {
    return requestResponseMessage(ep, /* @__PURE__ */ new Map(), {
      type: "RELEASE"
    }).then(() => {
      closeEndPoint(ep);
    });
  }
  const proxyCounter = /* @__PURE__ */ new WeakMap();
  const proxyFinalizers = "FinalizationRegistry" in globalThis && new FinalizationRegistry((ep) => {
    const newCount = (proxyCounter.get(ep) || 0) - 1;
    proxyCounter.set(ep, newCount);
    if (newCount === 0) {
      releaseEndpoint(ep);
    }
  });
  function registerProxy(proxy2, ep) {
    const newCount = (proxyCounter.get(ep) || 0) + 1;
    proxyCounter.set(ep, newCount);
    if (proxyFinalizers) {
      proxyFinalizers.register(proxy2, ep, proxy2);
    }
  }
  function unregisterProxy(proxy2) {
    if (proxyFinalizers) {
      proxyFinalizers.unregister(proxy2);
    }
  }
  function createProxy(ep, pendingListeners, path = [], target = function() {
  }) {
    let isProxyReleased = false;
    const proxy2 = new Proxy(target, {
      get(_target, prop) {
        throwIfProxyReleased(isProxyReleased);
        if (prop === releaseProxy) {
          return () => {
            unregisterProxy(proxy2);
            releaseEndpoint(ep);
            pendingListeners.clear();
            isProxyReleased = true;
          };
        }
        if (prop === "then") {
          if (path.length === 0) {
            return { then: () => proxy2 };
          }
          const r = requestResponseMessage(ep, pendingListeners, {
            type: "GET",
            path: path.map((p) => p.toString())
          }).then(fromWireValue);
          return r.then.bind(r);
        }
        return createProxy(ep, pendingListeners, [...path, prop]);
      },
      set(_target, prop, rawValue) {
        throwIfProxyReleased(isProxyReleased);
        const [value, transferables] = toWireValue(rawValue);
        return requestResponseMessage(ep, pendingListeners, {
          type: "SET",
          path: [...path, prop].map((p) => p.toString()),
          value
        }, transferables).then(fromWireValue);
      },
      apply(_target, _thisArg, rawArgumentList) {
        throwIfProxyReleased(isProxyReleased);
        const last = path[path.length - 1];
        if (last === createEndpoint) {
          return requestResponseMessage(ep, pendingListeners, {
            type: "ENDPOINT"
          }).then(fromWireValue);
        }
        if (last === "bind") {
          return createProxy(ep, pendingListeners, path.slice(0, -1));
        }
        const [argumentList, transferables] = processArguments(rawArgumentList);
        return requestResponseMessage(ep, pendingListeners, {
          type: "APPLY",
          path: path.map((p) => p.toString()),
          argumentList
        }, transferables).then(fromWireValue);
      },
      construct(_target, rawArgumentList) {
        throwIfProxyReleased(isProxyReleased);
        const [argumentList, transferables] = processArguments(rawArgumentList);
        return requestResponseMessage(ep, pendingListeners, {
          type: "CONSTRUCT",
          path: path.map((p) => p.toString()),
          argumentList
        }, transferables).then(fromWireValue);
      }
    });
    registerProxy(proxy2, ep);
    return proxy2;
  }
  function myFlat(arr) {
    return Array.prototype.concat.apply([], arr);
  }
  function processArguments(argumentList) {
    const processed = argumentList.map(toWireValue);
    return [processed.map((v) => v[0]), myFlat(processed.map((v) => v[1]))];
  }
  const transferCache = /* @__PURE__ */ new WeakMap();
  function transfer(obj, transfers) {
    transferCache.set(obj, transfers);
    return obj;
  }
  function proxy(obj) {
    return Object.assign(obj, { [proxyMarker]: true });
  }
  function toWireValue(value) {
    for (const [name2, handler] of transferHandlers) {
      if (handler.canHandle(value)) {
        const [serializedValue, transferables] = handler.serialize(value);
        return [
          {
            type: "HANDLER",
            name: name2,
            value: serializedValue
          },
          transferables
        ];
      }
    }
    return [
      {
        type: "RAW",
        value
      },
      transferCache.get(value) || []
    ];
  }
  function fromWireValue(value) {
    switch (value.type) {
      case "HANDLER":
        return transferHandlers.get(value.name).deserialize(value.value);
      case "RAW":
        return value.value;
    }
  }
  function requestResponseMessage(ep, pendingListeners, msg, transfers) {
    return new Promise((resolve) => {
      const id = generateUUID();
      pendingListeners.set(id, resolve);
      if (ep.start) {
        ep.start();
      }
      ep.postMessage(Object.assign({ id }, msg), transfers);
    });
  }
  function generateUUID() {
    return new Array(4).fill(0).map(() => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16)).join("-");
  }
  const ao = (inputs, options) => {
    const maxPeriod = Math.max(options.shortPeriod, options.longPeriod);
    let shortSum = 0;
    let longSum = 0;
    let short = 0;
    let long = 0;
    return inputs.map((bar, i2) => {
      const output = /* @__PURE__ */ Object.create(null);
      output.time = bar.time;
      const middle = (bar.customValues.low + bar.customValues.high) / 2;
      shortSum += middle;
      longSum += middle;
      if (i2 >= options.shortPeriod - 1) {
        short = shortSum / options.shortPeriod;
        const agoKLineData = inputs[i2 - (options.shortPeriod - 1)];
        shortSum -= (agoKLineData.customValues.low + agoKLineData.customValues.high) / 2;
      }
      if (i2 >= options.longPeriod - 1) {
        long = longSum / options.longPeriod;
        const agoKLineData = inputs[i2 - (options.longPeriod - 1)];
        longSum -= (agoKLineData.customValues.low + agoKLineData.customValues.high) / 2;
      }
      if (i2 >= maxPeriod - 1) {
        output.study = {
          plot: short - long
        };
      }
      return output;
    });
  };
  const bbi = (inputs, options) => {
    const maxPeriod = Math.max(options.n1, options.n2, options.n3, options.n4);
    const closeSums = [];
    const mas = [];
    return inputs.map((bar, i2) => {
      const output = /* @__PURE__ */ Object.create(null);
      output.time = bar.time;
      const close = bar.customValues.close;
      [options.n1, options.n2, options.n3, options.n4].forEach((p, index) => {
        closeSums[index] = (closeSums[index] ?? 0) + close;
        if (i2 >= p - 1) {
          mas[index] = closeSums[index] / p;
          closeSums[index] -= inputs[i2 - (p - 1)].customValues.close;
        }
      });
      if (i2 >= maxPeriod - 1) {
        let maSum = 0;
        mas.forEach((ma2) => {
          maSum += ma2;
        });
        output.study = {
          plot: maSum / 4
        };
      }
      return output;
    });
  };
  const bias = (inputs) => {
    const closeSums = [];
    return inputs.map((bar, i2) => {
      const output = /* @__PURE__ */ Object.create(null);
      output.time = bar.time;
      const close = bar.customValues.close;
      [6, 12, 24].forEach((p, index) => {
        closeSums[index] = (closeSums[index] ?? 0) + close;
        if (i2 >= p - 1) {
          output.study = output.study || {};
          const mean = closeSums[index] / p;
          output.study[`bias${p}`] = (close - mean) / mean * 100;
          closeSums[index] -= inputs[i2 - (p - 1)].customValues.close;
        }
      });
      return output;
    });
  };
  const brar = (inputs) => {
    const params = [26];
    let hcy = 0;
    let cyl = 0;
    let ho = 0;
    let ol = 0;
    return inputs.map((bar, i2) => {
      const output = /* @__PURE__ */ Object.create(null);
      output.time = bar.time;
      const high = bar.customValues.high;
      const low = bar.customValues.low;
      const open = bar.customValues.open;
      const prevClose = (inputs[i2 - 1] ?? bar).customValues.close;
      ho += high - open;
      ol += open - low;
      hcy += high - prevClose;
      cyl += prevClose - low;
      if (i2 >= params[0] - 1) {
        output.study = output.study || {};
        if (ol !== 0) {
          output.study.ar = ho / ol * 100;
        } else {
          output.study.ar = 0;
        }
        if (cyl !== 0) {
          output.study.br = hcy / cyl * 100;
        } else {
          output.study.br = 0;
        }
        const agoKLineData = inputs[i2 - (params[0] - 1)];
        const agoHigh = agoKLineData.customValues.high;
        const agoLow = agoKLineData.customValues.low;
        const agoOpen = agoKLineData.customValues.open;
        const agoPreClose = (inputs[i2 - params[0]] ?? inputs[i2 - (params[0] - 1)]).customValues.close;
        hcy -= agoHigh - agoPreClose;
        cyl -= agoPreClose - agoLow;
        ho -= agoHigh - agoOpen;
        ol -= agoOpen - agoLow;
      }
      return output;
    });
  };
  const cr = (inputs) => {
    const params = [26, 10, 20, 40, 60];
    const ma1ForwardPeriod = Math.ceil(params[1] / 2.5 + 1);
    const ma2ForwardPeriod = Math.ceil(params[2] / 2.5 + 1);
    const ma3ForwardPeriod = Math.ceil(params[3] / 2.5 + 1);
    const ma4ForwardPeriod = Math.ceil(params[4] / 2.5 + 1);
    let ma1Sum = 0;
    const ma1List = [];
    let ma2Sum = 0;
    const ma2List = [];
    let ma3Sum = 0;
    const ma3List = [];
    let ma4Sum = 0;
    const ma4List = [];
    const result = [];
    inputs.forEach((bar, i2) => {
      var _a, _b, _c;
      const output = /* @__PURE__ */ Object.create(null);
      output.time = bar.time;
      const prevData = inputs[i2 - 1] ?? bar;
      const prevMid = (prevData.customValues.high + prevData.customValues.close + prevData.customValues.low + prevData.customValues.open) / 4;
      const highSubPreMid = Math.max(0, bar.customValues.high - prevMid);
      const preMidSubLow = Math.max(0, prevMid - bar.customValues.low);
      if (i2 >= params[0] - 1) {
        output.study = output.study || {};
        if (preMidSubLow !== 0) {
          output.study.cr = highSubPreMid / preMidSubLow * 100;
        } else {
          output.study.cr = 0;
        }
        ma1Sum += output.study.cr;
        ma2Sum += output.study.cr;
        ma3Sum += output.study.cr;
        ma4Sum += output.study.cr;
        if (i2 >= params[0] + params[1] - 2) {
          ma1List.push(ma1Sum / params[1]);
          if (i2 >= params[0] + params[1] + ma1ForwardPeriod - 3) {
            output.study.ma1 = ma1List[ma1List.length - 1 - ma1ForwardPeriod];
          }
          ma1Sum -= ((_a = result[i2 - (params[1] - 1)].study) == null ? void 0 : _a.cr) ?? 0;
        }
        if (i2 >= params[0] + params[2] - 2) {
          ma2List.push(ma2Sum / params[2]);
          if (i2 >= params[0] + params[2] + ma2ForwardPeriod - 3) {
            output.study.ma2 = ma2List[ma2List.length - 1 - ma2ForwardPeriod];
          }
          ma2Sum -= ((_b = result[i2 - (params[2] - 1)].study) == null ? void 0 : _b.cr) ?? 0;
        }
        if (i2 >= params[0] + params[3] - 2) {
          ma3List.push(ma3Sum / params[3]);
          if (i2 >= params[0] + params[3] + ma3ForwardPeriod - 3) {
            output.study.ma3 = ma3List[ma3List.length - 1 - ma3ForwardPeriod];
          }
          ma3Sum -= result[i2 - (params[3] - 1)].study.cr ?? 0;
        }
        if (i2 >= params[0] + params[4] - 2) {
          ma4List.push(ma4Sum / params[4]);
          if (i2 >= params[0] + params[4] + ma4ForwardPeriod - 3) {
            output.study.ma4 = ma4List[ma4List.length - 1 - ma4ForwardPeriod];
          }
          ma4Sum -= ((_c = result[i2 - (params[4] - 1)].study) == null ? void 0 : _c.cr) ?? 0;
        }
      }
      result.push(output);
    });
    return result;
  };
  var __INIT__ = (() => {
    var _scriptName = self.location.href;
    return async function(moduleArg = {}) {
      var moduleRtn;
      var Module = moduleArg;
      var readyPromiseResolve, readyPromiseReject;
      var readyPromise = new Promise((resolve, reject) => {
        readyPromiseResolve = resolve;
        readyPromiseReject = reject;
      });
      var ENVIRONMENT_IS_WEB = typeof window == "object";
      var ENVIRONMENT_IS_WORKER = typeof WorkerGlobalScope != "undefined";
      var ENVIRONMENT_IS_NODE = typeof process == "object" && typeof process.versions == "object" && typeof process.versions.node == "string" && process.type != "renderer";
      if (ENVIRONMENT_IS_NODE) {
        const { createRequire } = await Promise.resolve().then(function() {
          return __viteBrowserExternal;
        });
        var require = createRequire(self.location.href);
      }
      var moduleOverrides = Object.assign({}, Module);
      var arguments_ = [];
      var thisProgram = "./this.program";
      var quit_ = (status, toThrow) => {
        throw toThrow;
      };
      var scriptDirectory = "";
      function locateFile(path) {
        if (Module["locateFile"]) {
          return Module["locateFile"](path, scriptDirectory);
        }
        return scriptDirectory + path;
      }
      var readAsync, readBinary;
      if (ENVIRONMENT_IS_NODE) {
        var fs = require("fs");
        var nodePath = require("path");
        if (!self.location.href.startsWith("data:")) {
          scriptDirectory = nodePath.dirname(require("url").fileURLToPath(self.location.href)) + "/";
        }
        readBinary = (filename) => {
          filename = isFileURI(filename) ? new URL(filename) : filename;
          var ret = fs.readFileSync(filename);
          return ret;
        };
        readAsync = async (filename, binary2 = true) => {
          filename = isFileURI(filename) ? new URL(filename) : filename;
          var ret = fs.readFileSync(filename, binary2 ? void 0 : "utf8");
          return ret;
        };
        if (!Module["thisProgram"] && process.argv.length > 1) {
          thisProgram = process.argv[1].replace(/\\/g, "/");
        }
        arguments_ = process.argv.slice(2);
        quit_ = (status, toThrow) => {
          process.exitCode = status;
          throw toThrow;
        };
      } else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
        if (ENVIRONMENT_IS_WORKER) {
          scriptDirectory = self.location.href;
        } else if (typeof document != "undefined" && document.currentScript) {
          scriptDirectory = document.currentScript.src;
        }
        if (_scriptName) {
          scriptDirectory = _scriptName;
        }
        if (scriptDirectory.startsWith("blob:")) {
          scriptDirectory = "";
        } else {
          scriptDirectory = scriptDirectory.slice(
            0,
            scriptDirectory.replace(/[?#].*/, "").lastIndexOf("/") + 1
          );
        }
        {
          if (ENVIRONMENT_IS_WORKER) {
            readBinary = (url) => {
              var xhr = new XMLHttpRequest();
              xhr.open("GET", url, false);
              xhr.responseType = "arraybuffer";
              xhr.send(null);
              return new Uint8Array(xhr.response);
            };
          }
          readAsync = async (url) => {
            if (isFileURI(url)) {
              return new Promise((resolve, reject) => {
                var xhr = new XMLHttpRequest();
                xhr.open("GET", url, true);
                xhr.responseType = "arraybuffer";
                xhr.onload = () => {
                  if (xhr.status == 200 || xhr.status == 0 && xhr.response) {
                    resolve(xhr.response);
                    return;
                  }
                  reject(xhr.status);
                };
                xhr.onerror = reject;
                xhr.send(null);
              });
            }
            var response = await fetch(url, { credentials: "same-origin" });
            if (response.ok) {
              return response.arrayBuffer();
            }
            throw new Error(response.status + " : " + response.url);
          };
        }
      } else ;
      Module["print"] || console.log.bind(console);
      var err = Module["printErr"] || console.error.bind(console);
      Object.assign(Module, moduleOverrides);
      moduleOverrides = null;
      if (Module["arguments"]) arguments_ = Module["arguments"];
      if (Module["thisProgram"]) thisProgram = Module["thisProgram"];
      var dynamicLibraries = Module["dynamicLibraries"] || [];
      var wasmBinary = Module["wasmBinary"];
      var wasmMemory;
      var ABORT = false;
      var EXITSTATUS;
      var HEAP8, HEAPU8, HEAP16, HEAP32, HEAPU32, HEAPF32, HEAP64, HEAPF64;
      var runtimeInitialized = false;
      var isFileURI = (filename) => filename.startsWith("file://");
      function updateMemoryViews() {
        var b = wasmMemory.buffer;
        Module["HEAP8"] = HEAP8 = new Int8Array(b);
        Module["HEAP16"] = HEAP16 = new Int16Array(b);
        Module["HEAPU8"] = HEAPU8 = new Uint8Array(b);
        Module["HEAPU16"] = new Uint16Array(b);
        Module["HEAP32"] = HEAP32 = new Int32Array(b);
        Module["HEAPU32"] = HEAPU32 = new Uint32Array(b);
        Module["HEAPF32"] = HEAPF32 = new Float32Array(b);
        Module["HEAPF64"] = HEAPF64 = new Float64Array(b);
        Module["HEAP64"] = HEAP64 = new BigInt64Array(b);
        Module["HEAPU64"] = new BigUint64Array(b);
      }
      if (Module["wasmMemory"]) {
        wasmMemory = Module["wasmMemory"];
      } else {
        var INITIAL_MEMORY = Module["INITIAL_MEMORY"] || 16777216;
        wasmMemory = new WebAssembly.Memory({
          initial: INITIAL_MEMORY / 65536,
          maximum: INITIAL_MEMORY / 65536
        });
      }
      updateMemoryViews();
      var __RELOC_FUNCS__ = [];
      function preRun() {
        if (Module["preRun"]) {
          if (typeof Module["preRun"] == "function")
            Module["preRun"] = [Module["preRun"]];
          while (Module["preRun"].length) {
            addOnPreRun(Module["preRun"].shift());
          }
        }
        callRuntimeCallbacks(onPreRuns);
      }
      function initRuntime() {
        runtimeInitialized = true;
        callRuntimeCallbacks(__RELOC_FUNCS__);
        wasmExports["__wasm_call_ctors"]();
        callRuntimeCallbacks(onPostCtors);
      }
      function postRun() {
        if (Module["postRun"]) {
          if (typeof Module["postRun"] == "function")
            Module["postRun"] = [Module["postRun"]];
          while (Module["postRun"].length) {
            addOnPostRun(Module["postRun"].shift());
          }
        }
        callRuntimeCallbacks(onPostRuns);
      }
      var runDependencies = 0;
      var dependenciesFulfilled = null;
      function addRunDependency(id) {
        var _a;
        runDependencies++;
        (_a = Module["monitorRunDependencies"]) == null ? void 0 : _a.call(Module, runDependencies);
      }
      function removeRunDependency(id) {
        var _a;
        runDependencies--;
        (_a = Module["monitorRunDependencies"]) == null ? void 0 : _a.call(Module, runDependencies);
        if (runDependencies == 0) {
          if (dependenciesFulfilled) {
            var callback = dependenciesFulfilled;
            dependenciesFulfilled = null;
            callback();
          }
        }
      }
      function abort(what) {
        var _a;
        (_a = Module["onAbort"]) == null ? void 0 : _a.call(Module, what);
        what = "Aborted(" + what + ")";
        err(what);
        ABORT = true;
        what += ". Build with -sASSERTIONS for more info.";
        var e = new WebAssembly.RuntimeError(what);
        readyPromiseReject(e);
        throw e;
      }
      var wasmBinaryFile;
      function findWasmBinary() {
        if (Module["locateFile"]) {
          return locateFile("talib.wasm");
        }
        return new URL("" + new URL("talib-CX0CyGM9.wasm", self.location.href).href, self.location.href).href;
      }
      function getBinarySync(file) {
        if (file == wasmBinaryFile && wasmBinary) {
          return new Uint8Array(wasmBinary);
        }
        if (readBinary) {
          return readBinary(file);
        }
        throw "both async and sync fetching of the wasm failed";
      }
      async function getWasmBinary(binaryFile) {
        if (!wasmBinary) {
          try {
            var response = await readAsync(binaryFile);
            return new Uint8Array(response);
          } catch {
          }
        }
        return getBinarySync(binaryFile);
      }
      async function instantiateArrayBuffer(binaryFile, imports) {
        try {
          var binary2 = await getWasmBinary(binaryFile);
          var instance2 = await WebAssembly.instantiate(binary2, imports);
          return instance2;
        } catch (reason) {
          err(`failed to asynchronously prepare wasm: ${reason}`);
          abort(reason);
        }
      }
      async function instantiateAsync(binary2, binaryFile, imports) {
        if (!binary2 && typeof WebAssembly.instantiateStreaming == "function" && !isFileURI(binaryFile) && !ENVIRONMENT_IS_NODE) {
          try {
            var response = fetch(binaryFile, { credentials: "same-origin" });
            var instantiationResult = await WebAssembly.instantiateStreaming(
              response,
              imports
            );
            return instantiationResult;
          } catch (reason) {
            err(`wasm streaming compile failed: ${reason}`);
            err("falling back to ArrayBuffer instantiation");
          }
        }
        return instantiateArrayBuffer(binaryFile, imports);
      }
      function getWasmImports() {
        return {
          env: wasmImports,
          wasi_snapshot_preview1: wasmImports,
          "GOT.mem": new Proxy(wasmImports, GOTHandler),
          "GOT.func": new Proxy(wasmImports, GOTHandler)
        };
      }
      async function createWasm() {
        function receiveInstance(instance2, module2) {
          wasmExports = instance2.exports;
          wasmExports = relocateExports(wasmExports, 1024);
          var metadata2 = getDylinkMetadata(module2);
          if (metadata2.neededDynlibs) {
            dynamicLibraries = metadata2.neededDynlibs.concat(dynamicLibraries);
          }
          mergeLibSymbols(wasmExports);
          LDSO.init();
          loadDylibs();
          __RELOC_FUNCS__.push(wasmExports["__wasm_apply_data_relocs"]);
          removeRunDependency();
          return wasmExports;
        }
        addRunDependency();
        function receiveInstantiationResult(result2) {
          return receiveInstance(result2["instance"], result2["module"]);
        }
        var info2 = getWasmImports();
        if (Module["instantiateWasm"]) {
          return new Promise((resolve, reject) => {
            Module["instantiateWasm"](info2, (mod, inst) => {
              receiveInstance(mod, inst);
              resolve(mod.exports);
            });
          });
        }
        wasmBinaryFile ?? (wasmBinaryFile = findWasmBinary());
        try {
          var result = await instantiateAsync(wasmBinary, wasmBinaryFile, info2);
          var exports = receiveInstantiationResult(result);
          return exports;
        } catch (e) {
          readyPromiseReject(e);
          return Promise.reject(e);
        }
      }
      class ExitStatus {
        constructor(status) {
          __publicField(this, "name", "ExitStatus");
          this.message = `Program terminated with exit(${status})`;
          this.status = status;
        }
      }
      var GOT = {};
      var currentModuleWeakSymbols = /* @__PURE__ */ new Set([]);
      var GOTHandler = {
        get(obj, symName) {
          var rtn = GOT[symName];
          if (!rtn) {
            rtn = GOT[symName] = new WebAssembly.Global({
              value: "i32",
              mutable: true
            });
          }
          if (!currentModuleWeakSymbols.has(symName)) {
            rtn.required = true;
          }
          return rtn;
        }
      };
      var callRuntimeCallbacks = (callbacks) => {
        while (callbacks.length > 0) {
          callbacks.shift()(Module);
        }
      };
      var onPostRuns = [];
      var addOnPostRun = (cb) => onPostRuns.unshift(cb);
      var onPreRuns = [];
      var addOnPreRun = (cb) => onPreRuns.unshift(cb);
      var UTF8Decoder = typeof TextDecoder != "undefined" ? new TextDecoder() : void 0;
      var UTF8ArrayToString = (heapOrArray, idx = 0, maxBytesToRead = NaN) => {
        var endIdx = idx + maxBytesToRead;
        var endPtr = idx;
        while (heapOrArray[endPtr] && !(endPtr >= endIdx)) ++endPtr;
        if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
          return UTF8Decoder.decode(heapOrArray.subarray(idx, endPtr));
        }
        var str = "";
        while (idx < endPtr) {
          var u0 = heapOrArray[idx++];
          if (!(u0 & 128)) {
            str += String.fromCharCode(u0);
            continue;
          }
          var u1 = heapOrArray[idx++] & 63;
          if ((u0 & 224) == 192) {
            str += String.fromCharCode((u0 & 31) << 6 | u1);
            continue;
          }
          var u2 = heapOrArray[idx++] & 63;
          if ((u0 & 240) == 224) {
            u0 = (u0 & 15) << 12 | u1 << 6 | u2;
          } else {
            u0 = (u0 & 7) << 18 | u1 << 12 | u2 << 6 | heapOrArray[idx++] & 63;
          }
          if (u0 < 65536) {
            str += String.fromCharCode(u0);
          } else {
            var ch = u0 - 65536;
            str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023);
          }
        }
        return str;
      };
      var getDylinkMetadata = (binary2) => {
        var offset = 0;
        var end = 0;
        function getU8() {
          return binary2[offset++];
        }
        function getLEB() {
          var ret = 0;
          var mul = 1;
          while (1) {
            var byte = binary2[offset++];
            ret += (byte & 127) * mul;
            mul *= 128;
            if (!(byte & 128)) break;
          }
          return ret;
        }
        function getString() {
          var len = getLEB();
          offset += len;
          return UTF8ArrayToString(binary2, offset - len, len);
        }
        function failIf(condition, message) {
          if (condition) throw new Error(message);
        }
        var name2 = "dylink.0";
        if (binary2 instanceof WebAssembly.Module) {
          var dylinkSection = WebAssembly.Module.customSections(binary2, name2);
          if (dylinkSection.length === 0) {
            name2 = "dylink";
            dylinkSection = WebAssembly.Module.customSections(binary2, name2);
          }
          failIf(dylinkSection.length === 0, "need dylink section");
          binary2 = new Uint8Array(dylinkSection[0]);
          end = binary2.length;
        } else {
          var int32View = new Uint32Array(
            new Uint8Array(binary2.subarray(0, 24)).buffer
          );
          var magicNumberFound = int32View[0] == 1836278016;
          failIf(!magicNumberFound, "need to see wasm magic number");
          failIf(binary2[8] !== 0, "need the dylink section to be first");
          offset = 9;
          var section_size = getLEB();
          end = offset + section_size;
          name2 = getString();
        }
        var customSection = {
          neededDynlibs: [],
          tlsExports: /* @__PURE__ */ new Set(),
          weakImports: /* @__PURE__ */ new Set()
        };
        if (name2 == "dylink") {
          customSection.memorySize = getLEB();
          customSection.memoryAlign = getLEB();
          customSection.tableSize = getLEB();
          customSection.tableAlign = getLEB();
          var neededDynlibsCount = getLEB();
          for (var i2 = 0; i2 < neededDynlibsCount; ++i2) {
            var libname = getString();
            customSection.neededDynlibs.push(libname);
          }
        } else {
          failIf(name2 !== "dylink.0");
          var WASM_DYLINK_MEM_INFO = 1;
          var WASM_DYLINK_NEEDED = 2;
          var WASM_DYLINK_EXPORT_INFO = 3;
          var WASM_DYLINK_IMPORT_INFO = 4;
          var WASM_SYMBOL_TLS = 256;
          var WASM_SYMBOL_BINDING_MASK = 3;
          var WASM_SYMBOL_BINDING_WEAK = 1;
          while (offset < end) {
            var subsectionType = getU8();
            var subsectionSize = getLEB();
            if (subsectionType === WASM_DYLINK_MEM_INFO) {
              customSection.memorySize = getLEB();
              customSection.memoryAlign = getLEB();
              customSection.tableSize = getLEB();
              customSection.tableAlign = getLEB();
            } else if (subsectionType === WASM_DYLINK_NEEDED) {
              var neededDynlibsCount = getLEB();
              for (var i2 = 0; i2 < neededDynlibsCount; ++i2) {
                libname = getString();
                customSection.neededDynlibs.push(libname);
              }
            } else if (subsectionType === WASM_DYLINK_EXPORT_INFO) {
              var count = getLEB();
              while (count--) {
                var symname = getString();
                var flags2 = getLEB();
                if (flags2 & WASM_SYMBOL_TLS) {
                  customSection.tlsExports.add(symname);
                }
              }
            } else if (subsectionType === WASM_DYLINK_IMPORT_INFO) {
              var count = getLEB();
              while (count--) {
                getString();
                var symname = getString();
                var flags2 = getLEB();
                if ((flags2 & WASM_SYMBOL_BINDING_MASK) == WASM_SYMBOL_BINDING_WEAK) {
                  customSection.weakImports.add(symname);
                }
              }
            } else {
              offset += subsectionSize;
            }
          }
        }
        return customSection;
      };
      function getValue(ptr, type = "i8") {
        if (type.endsWith("*")) type = "*";
        switch (type) {
          case "i1":
            return HEAP8[ptr];
          case "i8":
            return HEAP8[ptr];
          case "i16":
            return HEAP16[ptr >> 1];
          case "i32":
            return HEAP32[ptr >> 2];
          case "i64":
            return HEAP64[ptr >> 3];
          case "float":
            return HEAPF32[ptr >> 2];
          case "double":
            return HEAPF64[ptr >> 3];
          case "*":
            return HEAPU32[ptr >> 2];
          default:
            abort(`invalid type for getValue: ${type}`);
        }
      }
      var newDSO = (name2, handle2, syms) => {
        var dso = { refcount: Infinity, name: name2, exports: syms, global: true };
        LDSO.loadedLibsByName[name2] = dso;
        if (handle2 != void 0) {
          LDSO.loadedLibsByHandle[handle2] = dso;
        }
        return dso;
      };
      var LDSO = {
        loadedLibsByName: {},
        loadedLibsByHandle: {},
        init() {
          newDSO("__main__", 0, wasmImports);
        }
      };
      var ___heap_base = 70416;
      var alignMemory = (size, alignment) => Math.ceil(size / alignment) * alignment;
      var getMemory = (size) => {
        if (runtimeInitialized) {
          return _calloc(size, 1);
        }
        var ret = ___heap_base;
        var end = ret + alignMemory(size, 16);
        ___heap_base = end;
        GOT["__heap_base"].value = end;
        return ret;
      };
      var isInternalSym = (symName) => [
        "__cpp_exception",
        "__c_longjmp",
        "__wasm_apply_data_relocs",
        "__dso_handle",
        "__tls_size",
        "__tls_align",
        "__set_stack_limits",
        "_emscripten_tls_init",
        "__wasm_init_tls",
        "__wasm_call_ctors",
        "__start_em_asm",
        "__stop_em_asm",
        "__start_em_js",
        "__stop_em_js"
      ].includes(symName) || symName.startsWith("__em_js__");
      var uleb128Encode = (n, target) => {
        if (n < 128) {
          target.push(n);
        } else {
          target.push(n % 128 | 128, n >> 7);
        }
      };
      var sigToWasmTypes = (sig) => {
        var typeNames = {
          i: "i32",
          j: "i64",
          f: "f32",
          d: "f64",
          e: "externref",
          p: "i32"
        };
        var type = {
          parameters: [],
          results: sig[0] == "v" ? [] : [typeNames[sig[0]]]
        };
        for (var i2 = 1; i2 < sig.length; ++i2) {
          type.parameters.push(typeNames[sig[i2]]);
        }
        return type;
      };
      var generateFuncType = (sig, target) => {
        var sigRet = sig.slice(0, 1);
        var sigParam = sig.slice(1);
        var typeCodes = { i: 127, p: 127, j: 126, f: 125, d: 124, e: 111 };
        target.push(96);
        uleb128Encode(sigParam.length, target);
        for (var i2 = 0; i2 < sigParam.length; ++i2) {
          target.push(typeCodes[sigParam[i2]]);
        }
        if (sigRet == "v") {
          target.push(0);
        } else {
          target.push(1, typeCodes[sigRet]);
        }
      };
      var convertJsFunctionToWasm = (func2, sig) => {
        if (typeof WebAssembly.Function == "function") {
          return new WebAssembly.Function(sigToWasmTypes(sig), func2);
        }
        var typeSectionBody = [1];
        generateFuncType(sig, typeSectionBody);
        var bytes = [0, 97, 115, 109, 1, 0, 0, 0, 1];
        uleb128Encode(typeSectionBody.length, bytes);
        bytes.push(...typeSectionBody);
        bytes.push(2, 7, 1, 1, 101, 1, 102, 0, 0, 7, 5, 1, 1, 102, 0, 0);
        var module2 = new WebAssembly.Module(new Uint8Array(bytes));
        var instance2 = new WebAssembly.Instance(module2, { e: { f: func2 } });
        var wrappedFunc = instance2.exports["f"];
        return wrappedFunc;
      };
      var wasmTable = new WebAssembly.Table({ initial: 1, element: "anyfunc" });
      var getWasmTableEntry = (funcPtr) => wasmTable.get(funcPtr);
      var updateTableMap = (offset, count) => {
        if (functionsInTableMap) {
          for (var i2 = offset; i2 < offset + count; i2++) {
            var item = getWasmTableEntry(i2);
            if (item) {
              functionsInTableMap.set(item, i2);
            }
          }
        }
      };
      var functionsInTableMap;
      var getFunctionAddress = (func2) => {
        if (!functionsInTableMap) {
          functionsInTableMap = /* @__PURE__ */ new WeakMap();
          updateTableMap(0, wasmTable.length);
        }
        return functionsInTableMap.get(func2) || 0;
      };
      var freeTableIndexes = [];
      var getEmptyTableSlot = () => {
        if (freeTableIndexes.length) {
          return freeTableIndexes.pop();
        }
        try {
          wasmTable.grow(1);
        } catch (err2) {
          if (!(err2 instanceof RangeError)) {
            throw err2;
          }
          throw "Unable to grow wasm table. Set ALLOW_TABLE_GROWTH.";
        }
        return wasmTable.length - 1;
      };
      var setWasmTableEntry = (idx, func2) => wasmTable.set(idx, func2);
      var addFunction = (func2, sig) => {
        var rtn = getFunctionAddress(func2);
        if (rtn) {
          return rtn;
        }
        var ret = getEmptyTableSlot();
        try {
          setWasmTableEntry(ret, func2);
        } catch (err2) {
          if (!(err2 instanceof TypeError)) {
            throw err2;
          }
          var wrapped = convertJsFunctionToWasm(func2, sig);
          setWasmTableEntry(ret, wrapped);
        }
        functionsInTableMap.set(func2, ret);
        return ret;
      };
      var updateGOT = (exports, replace) => {
        for (var symName in exports) {
          if (isInternalSym(symName)) {
            continue;
          }
          var value = exports[symName];
          GOT[symName] || (GOT[symName] = new WebAssembly.Global({
            value: "i32",
            mutable: true
          }));
          if (GOT[symName].value == 0) {
            if (typeof value == "function") {
              GOT[symName].value = addFunction(value);
            } else if (typeof value == "number") {
              GOT[symName].value = value;
            } else {
              err(`unhandled export type for '${symName}': ${typeof value}`);
            }
          }
        }
      };
      var relocateExports = (exports, memoryBase2, replace) => {
        var relocated = {};
        for (var e in exports) {
          var value = exports[e];
          if (typeof value == "object") {
            value = value.value;
          }
          if (typeof value == "number") {
            value += memoryBase2;
          }
          relocated[e] = value;
        }
        updateGOT(relocated);
        return relocated;
      };
      var isSymbolDefined = (symName) => {
        var existing = wasmImports[symName];
        if (!existing || existing.stub) {
          return false;
        }
        return true;
      };
      var dynCall = (sig, ptr, args2 = []) => {
        var rtn = getWasmTableEntry(ptr)(...args2);
        return rtn;
      };
      var stackSave = () => _emscripten_stack_get_current();
      var stackRestore = (val) => __emscripten_stack_restore(val);
      var createInvokeFunction = (sig) => (ptr, ...args2) => {
        var sp = stackSave();
        try {
          return dynCall(sig, ptr, args2);
        } catch (e) {
          stackRestore(sp);
          if (e !== e + 0) throw e;
          _setThrew(1, 0);
          if (sig[0] == "j") return 0n;
        }
      };
      var resolveGlobalSymbol = (symName, direct = false) => {
        var sym;
        if (isSymbolDefined(symName)) {
          sym = wasmImports[symName];
        } else if (symName.startsWith("invoke_")) {
          sym = wasmImports[symName] = createInvokeFunction(
            symName.split("_")[1]
          );
        }
        return { sym, name: symName };
      };
      var onPostCtors = [];
      var addOnPostCtor = (cb) => onPostCtors.unshift(cb);
      var UTF8ToString = (ptr, maxBytesToRead) => ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : "";
      var loadWebAssemblyModule = (binary, flags, libName, localScope, handle) => {
        var metadata = getDylinkMetadata(binary);
        currentModuleWeakSymbols = metadata.weakImports;
        function loadModule() {
          {
            var memAlign = Math.pow(2, metadata.memoryAlign);
            var memoryBase = metadata.memorySize ? alignMemory(getMemory(metadata.memorySize + memAlign), memAlign) : 0;
            var tableBase = metadata.tableSize ? wasmTable.length : 0;
          }
          var tableGrowthNeeded = tableBase + metadata.tableSize - wasmTable.length;
          if (tableGrowthNeeded > 0) {
            wasmTable.grow(tableGrowthNeeded);
          }
          var moduleExports;
          function resolveSymbol(sym) {
            var resolved = resolveGlobalSymbol(sym).sym;
            if (!resolved && localScope) {
              resolved = localScope[sym];
            }
            if (!resolved) {
              resolved = moduleExports[sym];
            }
            return resolved;
          }
          var proxyHandler = {
            get(stubs, prop) {
              switch (prop) {
                case "__memory_base":
                  return memoryBase;
                case "__table_base":
                  return tableBase;
              }
              if (prop in wasmImports && !wasmImports[prop].stub) {
                var res = wasmImports[prop];
                return res;
              }
              if (!(prop in stubs)) {
                var resolved;
                stubs[prop] = (...args2) => {
                  resolved || (resolved = resolveSymbol(prop));
                  return resolved(...args2);
                };
              }
              return stubs[prop];
            }
          };
          var proxy = new Proxy({}, proxyHandler);
          var info = {
            "GOT.mem": new Proxy({}, GOTHandler),
            "GOT.func": new Proxy({}, GOTHandler),
            env: proxy,
            wasi_snapshot_preview1: proxy
          };
          function postInstantiation(module, instance) {
            updateTableMap(tableBase, metadata.tableSize);
            moduleExports = relocateExports(instance.exports, memoryBase);
            if (!flags.allowUndefined) {
              reportUndefinedSymbols();
            }
            function addEmAsm(addr, body) {
              var args = [];
              var arity = 0;
              for (; arity < 16; arity++) {
                if (body.indexOf("$" + arity) != -1) {
                  args.push("$" + arity);
                } else {
                  break;
                }
              }
              args = args.join(",");
              var func = `(${args}) => { ${body} };`;
              eval(func);
            }
            if ("__start_em_asm" in moduleExports) {
              var start = moduleExports["__start_em_asm"];
              var stop = moduleExports["__stop_em_asm"];
              while (start < stop) {
                var jsString = UTF8ToString(start);
                addEmAsm(start, jsString);
                start = HEAPU8.indexOf(0, start) + 1;
              }
            }
            function addEmJs(name, cSig, body) {
              var jsArgs = [];
              cSig = cSig.slice(1, -1);
              if (cSig != "void") {
                cSig = cSig.split(",");
                for (var i in cSig) {
                  var jsArg = cSig[i].split(" ").pop();
                  jsArgs.push(jsArg.replace("*", ""));
                }
              }
              var func = `(${jsArgs}) => ${body};`;
              moduleExports[name] = eval(func);
            }
            for (var name in moduleExports) {
              if (name.startsWith("__em_js__")) {
                var start = moduleExports[name];
                var jsString = UTF8ToString(start);
                var parts = jsString.split("<::>");
                addEmJs(name.replace("__em_js__", ""), parts[0], parts[1]);
                delete moduleExports[name];
              }
            }
            var applyRelocs = moduleExports["__wasm_apply_data_relocs"];
            if (applyRelocs) {
              if (runtimeInitialized) {
                applyRelocs();
              } else {
                __RELOC_FUNCS__.push(applyRelocs);
              }
            }
            var init = moduleExports["__wasm_call_ctors"];
            if (init) {
              if (runtimeInitialized) {
                init();
              } else {
                addOnPostCtor(init);
              }
            }
            return moduleExports;
          }
          if (flags.loadAsync) {
            if (binary instanceof WebAssembly.Module) {
              var instance = new WebAssembly.Instance(binary, info);
              return Promise.resolve(postInstantiation(binary, instance));
            }
            return WebAssembly.instantiate(binary, info).then(
              (result) => postInstantiation(result.module, result.instance)
            );
          }
          var module = binary instanceof WebAssembly.Module ? binary : new WebAssembly.Module(binary);
          var instance = new WebAssembly.Instance(module, info);
          return postInstantiation(module, instance);
        }
        if (flags.loadAsync) {
          return metadata.neededDynlibs.reduce(
            (chain, dynNeeded) => chain.then(
              () => loadDynamicLibrary(dynNeeded, flags, localScope)
            ),
            Promise.resolve()
          ).then(loadModule);
        }
        metadata.neededDynlibs.forEach(
          (needed) => loadDynamicLibrary(needed, flags, localScope)
        );
        return loadModule();
      };
      var mergeLibSymbols = (exports, libName2) => {
        for (var [sym, exp] of Object.entries(exports)) {
          const setImport = (target) => {
            if (!isSymbolDefined(target)) {
              wasmImports[target] = exp;
            }
          };
          setImport(sym);
          const main_alias = "__main_argc_argv";
          if (sym == "main") {
            setImport(main_alias);
          }
          if (sym == main_alias) {
            setImport("main");
          }
        }
      };
      var asyncLoad = async (url) => {
        var arrayBuffer = await readAsync(url);
        return new Uint8Array(arrayBuffer);
      };
      var preloadPlugins = Module["preloadPlugins"] || [];
      var registerWasmPlugin = () => {
        var wasmPlugin = {
          promiseChainEnd: Promise.resolve(),
          canHandle: (name2) => !Module["noWasmDecoding"] && name2.endsWith(".so"),
          handle: (byteArray, name2, onload, onerror) => {
            wasmPlugin["promiseChainEnd"] = wasmPlugin["promiseChainEnd"].then(
              () => loadWebAssemblyModule(
                byteArray,
                { loadAsync: true, nodelete: true },
                name2,
                {}
              )
            ).then(
              (exports) => {
                preloadedWasm[name2] = exports;
                onload(byteArray);
              },
              (error) => {
                err(`failed to instantiate wasm: ${name2}: ${error}`);
                onerror();
              }
            );
          }
        };
        preloadPlugins.push(wasmPlugin);
      };
      var preloadedWasm = {};
      function loadDynamicLibrary(libName2, flags2 = { global: true, nodelete: true }, localScope2, handle2) {
        var dso = LDSO.loadedLibsByName[libName2];
        if (dso) {
          if (!flags2.global) {
            if (localScope2) {
              Object.assign(localScope2, dso.exports);
            }
          } else if (!dso.global) {
            dso.global = true;
            mergeLibSymbols(dso.exports);
          }
          if (flags2.nodelete && dso.refcount !== Infinity) {
            dso.refcount = Infinity;
          }
          dso.refcount++;
          return flags2.loadAsync ? Promise.resolve(true) : true;
        }
        dso = newDSO(libName2, handle2, "loading");
        dso.refcount = flags2.nodelete ? Infinity : 1;
        dso.global = flags2.global;
        function loadLibData() {
          var libFile = locateFile(libName2);
          if (flags2.loadAsync) {
            return asyncLoad(libFile);
          }
          if (!readBinary) {
            throw new Error(
              `${libFile}: file not found, and synchronous loading of external files is not available`
            );
          }
          return readBinary(libFile);
        }
        function getExports() {
          var preloaded = preloadedWasm[libName2];
          if (preloaded) {
            return flags2.loadAsync ? Promise.resolve(preloaded) : preloaded;
          }
          if (flags2.loadAsync) {
            return loadLibData().then(
              (libData) => loadWebAssemblyModule(libData, flags2, libName2, localScope2)
            );
          }
          return loadWebAssemblyModule(
            loadLibData(),
            flags2,
            libName2,
            localScope2
          );
        }
        function moduleLoaded(exports) {
          if (dso.global) {
            mergeLibSymbols(exports);
          } else if (localScope2) {
            Object.assign(localScope2, exports);
          }
          dso.exports = exports;
        }
        if (flags2.loadAsync) {
          return getExports().then((exports) => {
            moduleLoaded(exports);
            return true;
          });
        }
        moduleLoaded(getExports());
        return true;
      }
      var reportUndefinedSymbols = () => {
        for (var [symName, entry] of Object.entries(GOT)) {
          if (entry.value == 0) {
            var value = resolveGlobalSymbol(symName, true).sym;
            if (!value && !entry.required) {
              continue;
            }
            if (typeof value == "function") {
              entry.value = addFunction(value, value.sig);
            } else if (typeof value == "number") {
              entry.value = value;
            } else {
              throw new Error(
                `bad export type for '${symName}': ${typeof value}`
              );
            }
          }
        }
      };
      var loadDylibs = () => {
        if (!dynamicLibraries.length) {
          reportUndefinedSymbols();
          return;
        }
        addRunDependency();
        dynamicLibraries.reduce(
          (chain, lib) => chain.then(
            () => loadDynamicLibrary(lib, {
              loadAsync: true,
              global: true,
              nodelete: true,
              allowUndefined: true
            })
          ),
          Promise.resolve()
        ).then(() => {
          reportUndefinedSymbols();
          removeRunDependency();
        });
      };
      Module["noExitRuntime"] || true;
      function setValue(ptr, value, type = "i8") {
        if (type.endsWith("*")) type = "*";
        switch (type) {
          case "i1":
            HEAP8[ptr] = value;
            break;
          case "i8":
            HEAP8[ptr] = value;
            break;
          case "i16":
            HEAP16[ptr >> 1] = value;
            break;
          case "i32":
            HEAP32[ptr >> 2] = value;
            break;
          case "i64":
            HEAP64[ptr >> 3] = BigInt(value);
            break;
          case "float":
            HEAPF32[ptr >> 2] = value;
            break;
          case "double":
            HEAPF64[ptr >> 3] = value;
            break;
          case "*":
            HEAPU32[ptr >> 2] = value;
            break;
          default:
            abort(`invalid type for setValue: ${type}`);
        }
      }
      var ___memory_base = new WebAssembly.Global(
        { value: "i32", mutable: false },
        1024
      );
      var ___stack_pointer = new WebAssembly.Global(
        { value: "i32", mutable: true },
        70416
      );
      new WebAssembly.Global(
        { value: "i32", mutable: false },
        1
      );
      var abortOnCannotGrowMemory = (requestedSize) => {
        abort("OOM");
      };
      var _emscripten_resize_heap = (requestedSize) => {
        HEAPU8.length;
        abortOnCannotGrowMemory();
      };
      _emscripten_resize_heap.sig = "ip";
      var _proc_exit = (code) => {
        EXITSTATUS = code;
        quit_(code, new ExitStatus(code));
      };
      _proc_exit.sig = "vi";
      var exitJS = (status, implicit) => {
        EXITSTATUS = status;
        _proc_exit(status);
      };
      var handleException = (e) => {
        if (e instanceof ExitStatus || e == "unwind") {
          return EXITSTATUS;
        }
        quit_(1, e);
      };
      var lengthBytesUTF8 = (str) => {
        var len = 0;
        for (var i2 = 0; i2 < str.length; ++i2) {
          var c = str.charCodeAt(i2);
          if (c <= 127) {
            len++;
          } else if (c <= 2047) {
            len += 2;
          } else if (c >= 55296 && c <= 57343) {
            len += 4;
            ++i2;
          } else {
            len += 3;
          }
        }
        return len;
      };
      var stringToUTF8Array = (str, heap, outIdx, maxBytesToWrite) => {
        if (!(maxBytesToWrite > 0)) return 0;
        var startIdx = outIdx;
        var endIdx = outIdx + maxBytesToWrite - 1;
        for (var i2 = 0; i2 < str.length; ++i2) {
          var u = str.charCodeAt(i2);
          if (u >= 55296 && u <= 57343) {
            var u1 = str.charCodeAt(++i2);
            u = 65536 + ((u & 1023) << 10) | u1 & 1023;
          }
          if (u <= 127) {
            if (outIdx >= endIdx) break;
            heap[outIdx++] = u;
          } else if (u <= 2047) {
            if (outIdx + 1 >= endIdx) break;
            heap[outIdx++] = 192 | u >> 6;
            heap[outIdx++] = 128 | u & 63;
          } else if (u <= 65535) {
            if (outIdx + 2 >= endIdx) break;
            heap[outIdx++] = 224 | u >> 12;
            heap[outIdx++] = 128 | u >> 6 & 63;
            heap[outIdx++] = 128 | u & 63;
          } else {
            if (outIdx + 3 >= endIdx) break;
            heap[outIdx++] = 240 | u >> 18;
            heap[outIdx++] = 128 | u >> 12 & 63;
            heap[outIdx++] = 128 | u >> 6 & 63;
            heap[outIdx++] = 128 | u & 63;
          }
        }
        heap[outIdx] = 0;
        return outIdx - startIdx;
      };
      var stringToUTF8 = (str, outPtr, maxBytesToWrite) => stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
      var stackAlloc = (sz) => __emscripten_stack_alloc(sz);
      var stringToUTF8OnStack = (str) => {
        var size = lengthBytesUTF8(str) + 1;
        var ret = stackAlloc(size);
        stringToUTF8(str, ret, size);
        return ret;
      };
      var getCFunc = (ident) => {
        var func2 = Module["_" + ident];
        return func2;
      };
      var writeArrayToMemory = (array, buffer) => {
        HEAP8.set(array, buffer);
      };
      var ccall = (ident, returnType, argTypes, args2, opts) => {
        var toC = {
          string: (str) => {
            var ret2 = 0;
            if (str !== null && str !== void 0 && str !== 0) {
              ret2 = stringToUTF8OnStack(str);
            }
            return ret2;
          },
          array: (arr) => {
            var ret2 = stackAlloc(arr.length);
            writeArrayToMemory(arr, ret2);
            return ret2;
          }
        };
        function convertReturnValue(ret2) {
          if (returnType === "string") {
            return UTF8ToString(ret2);
          }
          if (returnType === "boolean") return Boolean(ret2);
          return ret2;
        }
        var func2 = getCFunc(ident);
        var cArgs = [];
        var stack = 0;
        if (args2) {
          for (var i2 = 0; i2 < args2.length; i2++) {
            var converter = toC[argTypes[i2]];
            if (converter) {
              if (stack === 0) stack = stackSave();
              cArgs[i2] = converter(args2[i2]);
            } else {
              cArgs[i2] = args2[i2];
            }
          }
        }
        var ret = func2(...cArgs);
        function onDone(ret2) {
          if (stack !== 0) stackRestore(stack);
          return convertReturnValue(ret2);
        }
        ret = onDone(ret);
        return ret;
      };
      registerWasmPlugin();
      var wasmImports = {
        __heap_base: ___heap_base,
        __indirect_function_table: wasmTable,
        __memory_base: ___memory_base,
        __stack_pointer: ___stack_pointer,
        emscripten_resize_heap: _emscripten_resize_heap,
        memory: wasmMemory
      };
      var wasmExports = await createWasm();
      wasmExports["__wasm_call_ctors"];
      Module["_TA_ACCBANDS"] = wasmExports["TA_ACCBANDS"];
      Module["_malloc"] = wasmExports["malloc"];
      Module["_free"] = wasmExports["free"];
      Module["_TA_SMA"] = wasmExports["TA_SMA"];
      Module["_TA_AD"] = wasmExports["TA_AD"];
      Module["_TA_ADOSC"] = wasmExports["TA_ADOSC"];
      Module["_TA_ADX"] = wasmExports["TA_ADX"];
      Module["_TA_ADXR"] = wasmExports["TA_ADXR"];
      Module["_TA_APO"] = wasmExports["TA_APO"];
      Module["_TA_MA"] = wasmExports["TA_MA"];
      Module["_TA_AROON"] = wasmExports["TA_AROON"];
      Module["_TA_AROONOSC"] = wasmExports["TA_AROONOSC"];
      Module["_TA_ATR"] = wasmExports["TA_ATR"];
      Module["_TA_TRANGE"] = wasmExports["TA_TRANGE"];
      Module["_TA_AVGDEV"] = wasmExports["TA_AVGDEV"];
      Module["_TA_AVGPRICE"] = wasmExports["TA_AVGPRICE"];
      Module["_TA_BBANDS"] = wasmExports["TA_BBANDS"];
      Module["_TA_STDDEV"] = wasmExports["TA_STDDEV"];
      Module["_TA_BOP"] = wasmExports["TA_BOP"];
      Module["_TA_CCI"] = wasmExports["TA_CCI"];
      Module["_TA_CMO"] = wasmExports["TA_CMO"];
      Module["_TA_DEMA"] = wasmExports["TA_DEMA"];
      Module["_TA_DX"] = wasmExports["TA_DX"];
      Module["_TA_EMA"] = wasmExports["TA_EMA"];
      Module["_TA_HT_DCPERIOD"] = wasmExports["TA_HT_DCPERIOD"];
      Module["_TA_HT_DCPHASE"] = wasmExports["TA_HT_DCPHASE"];
      Module["_TA_HT_PHASOR"] = wasmExports["TA_HT_PHASOR"];
      Module["_TA_HT_SINE"] = wasmExports["TA_HT_SINE"];
      Module["_TA_HT_TRENDLINE"] = wasmExports["TA_HT_TRENDLINE"];
      Module["_TA_HT_TRENDMODE"] = wasmExports["TA_HT_TRENDMODE"];
      Module["_TA_IMI"] = wasmExports["TA_IMI"];
      Module["_TA_KAMA"] = wasmExports["TA_KAMA"];
      Module["_TA_WMA"] = wasmExports["TA_WMA"];
      Module["_TA_TEMA"] = wasmExports["TA_TEMA"];
      Module["_TA_TRIMA"] = wasmExports["TA_TRIMA"];
      Module["_TA_MAMA"] = wasmExports["TA_MAMA"];
      Module["_TA_T3"] = wasmExports["TA_T3"];
      Module["_TA_MACD"] = wasmExports["TA_MACD"];
      Module["_TA_MACDEXT"] = wasmExports["TA_MACDEXT"];
      Module["_TA_MACDFIX"] = wasmExports["TA_MACDFIX"];
      Module["_TA_MAVP"] = wasmExports["TA_MAVP"];
      Module["_TA_MEDPRICE"] = wasmExports["TA_MEDPRICE"];
      Module["_TA_MFI"] = wasmExports["TA_MFI"];
      Module["_TA_MIDPOINT"] = wasmExports["TA_MIDPOINT"];
      Module["_TA_MIDPRICE"] = wasmExports["TA_MIDPRICE"];
      Module["_TA_MINUS_DI"] = wasmExports["TA_MINUS_DI"];
      Module["_TA_MINUS_DM"] = wasmExports["TA_MINUS_DM"];
      Module["_TA_MOM"] = wasmExports["TA_MOM"];
      Module["_TA_OBV"] = wasmExports["TA_OBV"];
      Module["_TA_PLUS_DI"] = wasmExports["TA_PLUS_DI"];
      Module["_TA_PLUS_DM"] = wasmExports["TA_PLUS_DM"];
      Module["_TA_PPO"] = wasmExports["TA_PPO"];
      Module["_TA_ROC"] = wasmExports["TA_ROC"];
      Module["_TA_ROCP"] = wasmExports["TA_ROCP"];
      Module["_TA_ROCR"] = wasmExports["TA_ROCR"];
      Module["_TA_ROCR100"] = wasmExports["TA_ROCR100"];
      Module["_TA_RSI"] = wasmExports["TA_RSI"];
      Module["_TA_SAR"] = wasmExports["TA_SAR"];
      Module["_TA_SAREXT"] = wasmExports["TA_SAREXT"];
      Module["_TA_STOCH"] = wasmExports["TA_STOCH"];
      Module["_TA_STOCHF"] = wasmExports["TA_STOCHF"];
      Module["_TA_STOCHRSI"] = wasmExports["TA_STOCHRSI"];
      Module["_TA_TRIX"] = wasmExports["TA_TRIX"];
      Module["_TA_TSF"] = wasmExports["TA_TSF"];
      Module["_TA_TYPPRICE"] = wasmExports["TA_TYPPRICE"];
      Module["_TA_ULTOSC"] = wasmExports["TA_ULTOSC"];
      Module["_TA_VAR"] = wasmExports["TA_VAR"];
      Module["_TA_WCLPRICE"] = wasmExports["TA_WCLPRICE"];
      Module["_TA_WILLR"] = wasmExports["TA_WILLR"];
      var _calloc = wasmExports["calloc"];
      var _setThrew = wasmExports["setThrew"];
      var __emscripten_stack_restore = wasmExports["_emscripten_stack_restore"];
      var __emscripten_stack_alloc = wasmExports["_emscripten_stack_alloc"];
      var _emscripten_stack_get_current = wasmExports["emscripten_stack_get_current"];
      wasmExports["__wasm_apply_data_relocs"];
      Module["ccall"] = ccall;
      Module["setValue"] = setValue;
      Module["getValue"] = getValue;
      function callMain(args2 = []) {
        var entryFunction = resolveGlobalSymbol("main").sym;
        if (!entryFunction) return;
        args2.unshift(thisProgram);
        var argc = args2.length;
        var argv = stackAlloc((argc + 1) * 4);
        var argv_ptr = argv;
        args2.forEach((arg) => {
          HEAPU32[argv_ptr >> 2] = stringToUTF8OnStack(arg);
          argv_ptr += 4;
        });
        HEAPU32[argv_ptr >> 2] = 0;
        try {
          var ret = entryFunction(argc, argv);
          exitJS(ret, true);
          return ret;
        } catch (e) {
          return handleException(e);
        }
      }
      function run(args2 = arguments_) {
        if (runDependencies > 0) {
          dependenciesFulfilled = run;
          return;
        }
        preRun();
        if (runDependencies > 0) {
          dependenciesFulfilled = run;
          return;
        }
        function doRun() {
          var _a;
          Module["calledRun"] = true;
          if (ABORT) return;
          initRuntime();
          readyPromiseResolve(Module);
          (_a = Module["onRuntimeInitialized"]) == null ? void 0 : _a.call(Module);
          var noInitialRun = Module["noInitialRun"];
          if (!noInitialRun) callMain(args2);
          postRun();
        }
        if (Module["setStatus"]) {
          Module["setStatus"]("Running...");
          setTimeout(() => {
            setTimeout(() => Module["setStatus"](""), 1);
            doRun();
          }, 1);
        } else {
          doRun();
        }
      }
      if (Module["preInit"]) {
        if (typeof Module["preInit"] == "function")
          Module["preInit"] = [Module["preInit"]];
        while (Module["preInit"].length > 0) {
          Module["preInit"].pop()();
        }
      }
      run();
      moduleRtn = readyPromise;
      return moduleRtn;
    };
  })();
  const API = { "ACCBANDS": { "name": "ACCBANDS", "inputs": [{ "name": "high", "type": "Double[]" }, { "name": "low", "type": "Double[]" }, { "name": "close", "type": "Double[]" }], "options": [{ "name": "timePeriod", "displayName": "Time Period", "defaultValue": 20, "hint": "Number of period", "type": "Integer", "range": { "min": 2, "max": 1e5 } }], "outputs": [{ "name": "upperBand", "type": "Double[]", "plotHint": "limit_upper" }, { "name": "middleBand", "type": "Double[]", "plotHint": "line" }, { "name": "lowerBand", "type": "Double[]", "plotHint": "limit_lower" }] }, "AD": { "name": "AD", "inputs": [{ "name": "high", "type": "Double[]" }, { "name": "low", "type": "Double[]" }, { "name": "close", "type": "Double[]" }, { "name": "volume", "type": "Double[]" }], "options": [], "outputs": [{ "name": "output", "type": "Double[]", "plotHint": "line" }] }, "ADOSC": { "name": "ADOSC", "inputs": [{ "name": "high", "type": "Double[]" }, { "name": "low", "type": "Double[]" }, { "name": "close", "type": "Double[]" }, { "name": "volume", "type": "Double[]" }], "options": [{ "name": "fastPeriod", "displayName": "Fast Period", "defaultValue": 3, "hint": "Number of period for the fast MA", "type": "Integer", "range": { "min": 2, "max": 1e5 } }, { "name": "slowPeriod", "displayName": "Slow Period", "defaultValue": 10, "hint": "Number of period for the slow MA", "type": "Integer", "range": { "min": 2, "max": 1e5 } }], "outputs": [{ "name": "output", "type": "Double[]", "plotHint": "line" }] }, "ADX": { "name": "ADX", "inputs": [{ "name": "high", "type": "Double[]" }, { "name": "low", "type": "Double[]" }, { "name": "close", "type": "Double[]" }], "options": [{ "name": "timePeriod", "displayName": "Time Period", "defaultValue": 14, "hint": "Number of period", "type": "Integer", "range": { "min": 2, "max": 1e5 } }], "outputs": [{ "name": "output", "type": "Double[]", "plotHint": "line" }] }, "ADXR": { "name": "ADXR", "inputs": [{ "name": "high", "type": "Double[]" }, { "name": "low", "type": "Double[]" }, { "name": "close", "type": "Double[]" }], "options": [{ "name": "timePeriod", "displayName": "Time Period", "defaultValue": 14, "hint": "Number of period", "type": "Integer", "range": { "min": 2, "max": 1e5 } }], "outputs": [{ "name": "output", "type": "Double[]", "plotHint": "line" }] }, "APO": { "name": "APO", "inputs": [{ "name": "inReal", "type": "Double[]" }], "options": [{ "name": "fastPeriod", "displayName": "Fast Period", "defaultValue": 12, "hint": "Number of period for the fast MA", "type": "Integer", "range": { "min": 2, "max": 1e5 } }, { "name": "slowPeriod", "displayName": "Slow Period", "defaultValue": 26, "hint": "Number of period for the slow MA", "type": "Integer", "range": { "min": 2, "max": 1e5 } }, { "name": "MAType", "displayName": "MA Type", "defaultValue": 0, "hint": "Type of Moving Average", "type": "MAType" }], "outputs": [{ "name": "output", "type": "Double[]", "plotHint": "line" }] }, "AROON": { "name": "AROON", "inputs": [{ "name": "high", "type": "Double[]" }, { "name": "low", "type": "Double[]" }], "options": [{ "name": "timePeriod", "displayName": "Time Period", "defaultValue": 14, "hint": "Number of period", "type": "Integer", "range": { "min": 2, "max": 1e5 } }], "outputs": [{ "name": "aroonDown", "type": "Double[]", "plotHint": "line_dash" }, { "name": "aroonUp", "type": "Double[]", "plotHint": "line" }] }, "AROONOSC": { "name": "AROONOSC", "inputs": [{ "name": "high", "type": "Double[]" }, { "name": "low", "type": "Double[]" }], "options": [{ "name": "timePeriod", "displayName": "Time Period", "defaultValue": 14, "hint": "Number of period", "type": "Integer", "range": { "min": 2, "max": 1e5 } }], "outputs": [{ "name": "output", "type": "Double[]", "plotHint": "line" }] }, "ATR": { "name": "ATR", "inputs": [{ "name": "high", "type": "Double[]" }, { "name": "low", "type": "Double[]" }, { "name": "close", "type": "Double[]" }], "options": [{ "name": "timePeriod", "displayName": "Time Period", "defaultValue": 14, "hint": "Number of period", "type": "Integer", "range": { "min": 1, "max": 1e5 } }], "outputs": [{ "name": "output", "type": "Double[]", "plotHint": "line" }] }, "AVGDEV": { "name": "AVGDEV", "inputs": [{ "name": "inReal", "type": "Double[]" }], "options": [{ "name": "timePeriod", "displayName": "Time Period", "defaultValue": 14, "hint": "Number of period", "type": "Integer", "range": { "min": 2, "max": 1e5 } }], "outputs": [{ "name": "output", "type": "Double[]", "plotHint": "line" }] }, "AVGPRICE": { "name": "AVGPRICE", "inputs": [{ "name": "open", "type": "Double[]" }, { "name": "high", "type": "Double[]" }, { "name": "low", "type": "Double[]" }, { "name": "close", "type": "Double[]" }], "options": [], "outputs": [{ "name": "output", "type": "Double[]", "plotHint": "line" }] }, "BBANDS": { "name": "BBANDS", "inputs": [{ "name": "inReal", "type": "Double[]" }], "options": [{ "name": "timePeriod", "displayName": "Time Period", "defaultValue": 5, "hint": "Number of period", "type": "Integer", "range": { "min": 2, "max": 1e5 } }, { "name": "nbDevUp", "displayName": "Deviations up", "defaultValue": 2, "hint": "Deviation multiplier for upper band", "type": "Double", "range": { "min": -3e37, "max": 3e37 } }, { "name": "nbDevDn", "displayName": "Deviations down", "defaultValue": 2, "hint": "Deviation multiplier for lower band", "type": "Double", "range": { "min": -3e37, "max": 3e37 } }, { "name": "MAType", "displayName": "MA Type", "defaultValue": 0, "hint": "Type of Moving Average", "type": "MAType" }], "outputs": [{ "name": "upperBand", "type": "Double[]", "plotHint": "limit_upper" }, { "name": "middleBand", "type": "Double[]", "plotHint": "line" }, { "name": "lowerBand", "type": "Double[]", "plotHint": "limit_lower" }] }, "BOP": { "name": "BOP", "inputs": [{ "name": "open", "type": "Double[]" }, { "name": "high", "type": "Double[]" }, { "name": "low", "type": "Double[]" }, { "name": "close", "type": "Double[]" }], "options": [], "outputs": [{ "name": "output", "type": "Double[]", "plotHint": "line" }] }, "CCI": { "name": "CCI", "inputs": [{ "name": "high", "type": "Double[]" }, { "name": "low", "type": "Double[]" }, { "name": "close", "type": "Double[]" }], "options": [{ "name": "timePeriod", "displayName": "Time Period", "defaultValue": 14, "hint": "Number of period", "type": "Integer", "range": { "min": 2, "max": 1e5 } }], "outputs": [{ "name": "output", "type": "Double[]", "plotHint": "line" }] }, "CMO": { "name": "CMO", "inputs": [{ "name": "inReal", "type": "Double[]" }], "options": [{ "name": "timePeriod", "displayName": "Time Period", "defaultValue": 14, "hint": "Number of period", "type": "Integer", "range": { "min": 2, "max": 1e5 } }], "outputs": [{ "name": "output", "type": "Double[]", "plotHint": "line" }] }, "DEMA": { "name": "DEMA", "inputs": [{ "name": "inReal", "type": "Double[]" }], "options": [{ "name": "timePeriod", "displayName": "Time Period", "defaultValue": 30, "hint": "Number of period", "type": "Integer", "range": { "min": 2, "max": 1e5 } }], "outputs": [{ "name": "output", "type": "Double[]", "plotHint": "line" }] }, "DX": { "name": "DX", "inputs": [{ "name": "high", "type": "Double[]" }, { "name": "low", "type": "Double[]" }, { "name": "close", "type": "Double[]" }], "options": [{ "name": "timePeriod", "displayName": "Time Period", "defaultValue": 14, "hint": "Number of period", "type": "Integer", "range": { "min": 2, "max": 1e5 } }], "outputs": [{ "name": "output", "type": "Double[]", "plotHint": "line" }] }, "EMA": { "name": "EMA", "inputs": [{ "name": "inReal", "type": "Double[]" }], "options": [{ "name": "timePeriod", "displayName": "Time Period", "defaultValue": 30, "hint": "Number of period", "type": "Integer", "range": { "min": 2, "max": 1e5 } }], "outputs": [{ "name": "output", "type": "Double[]", "plotHint": "line" }] }, "HT_DCPERIOD": { "name": "HT_DCPERIOD", "inputs": [{ "name": "inReal", "type": "Double[]" }], "options": [], "outputs": [{ "name": "output", "type": "Double[]", "plotHint": "line" }] }, "HT_DCPHASE": { "name": "HT_DCPHASE", "inputs": [{ "name": "inReal", "type": "Double[]" }], "options": [], "outputs": [{ "name": "output", "type": "Double[]", "plotHint": "line" }] }, "HT_PHASOR": { "name": "HT_PHASOR", "inputs": [{ "name": "inReal", "type": "Double[]" }], "options": [], "outputs": [{ "name": "inPhase", "type": "Double[]", "plotHint": "line" }, { "name": "quadrature", "type": "Double[]", "plotHint": "line_dash" }] }, "HT_SINE": { "name": "HT_SINE", "inputs": [{ "name": "inReal", "type": "Double[]" }], "options": [], "outputs": [{ "name": "sine", "type": "Double[]", "plotHint": "line" }, { "name": "leadSine", "type": "Double[]", "plotHint": "line_dash" }] }, "HT_TRENDLINE": { "name": "HT_TRENDLINE", "inputs": [{ "name": "inReal", "type": "Double[]" }], "options": [], "outputs": [{ "name": "output", "type": "Double[]", "plotHint": "line" }] }, "HT_TRENDMODE": { "name": "HT_TRENDMODE", "inputs": [{ "name": "inReal", "type": "Double[]" }], "options": [], "outputs": [{ "name": "output", "type": "Integer[]", "plotHint": "line" }] }, "IMI": { "name": "IMI", "inputs": [{ "name": "open", "type": "Double[]" }, { "name": "close", "type": "Double[]" }], "options": [{ "name": "timePeriod", "displayName": "Time Period", "defaultValue": 14, "hint": "Number of period", "type": "Integer", "range": { "min": 2, "max": 1e5 } }], "outputs": [{ "name": "output", "type": "Double[]", "plotHint": "line" }] }, "KAMA": { "name": "KAMA", "inputs": [{ "name": "inReal", "type": "Double[]" }], "options": [{ "name": "timePeriod", "displayName": "Time Period", "defaultValue": 30, "hint": "Number of period", "type": "Integer", "range": { "min": 2, "max": 1e5 } }], "outputs": [{ "name": "output", "type": "Double[]", "plotHint": "line" }] }, "MA": { "name": "MA", "inputs": [{ "name": "inReal", "type": "Double[]" }], "options": [{ "name": "timePeriod", "displayName": "Time Period", "defaultValue": 30, "hint": "Number of period", "type": "Integer", "range": { "min": 1, "max": 1e5 } }, { "name": "MAType", "displayName": "MA Type", "defaultValue": 0, "hint": "Type of Moving Average", "type": "MAType" }], "outputs": [{ "name": "output", "type": "Double[]", "plotHint": "line" }] }, "MACD": { "name": "MACD", "inputs": [{ "name": "inReal", "type": "Double[]" }], "options": [{ "name": "fastPeriod", "displayName": "Fast Period", "defaultValue": 12, "hint": "Number of period for the fast MA", "type": "Integer", "range": { "min": 2, "max": 1e5 } }, { "name": "slowPeriod", "displayName": "Slow Period", "defaultValue": 26, "hint": "Number of period for the slow MA", "type": "Integer", "range": { "min": 2, "max": 1e5 } }, { "name": "signalPeriod", "displayName": "Signal Period", "defaultValue": 9, "hint": "Smoothing for the signal line (nb of period)", "type": "Integer", "range": { "min": 1, "max": 1e5 } }], "outputs": [{ "name": "MACD", "type": "Double[]", "plotHint": "line" }, { "name": "MACDSignal", "type": "Double[]", "plotHint": "line_dash" }, { "name": "MACDHist", "type": "Double[]", "plotHint": "histogram" }] }, "MACDEXT": { "name": "MACDEXT", "inputs": [{ "name": "inReal", "type": "Double[]" }], "options": [{ "name": "fastPeriod", "displayName": "Fast Period", "defaultValue": 12, "hint": "Number of period for the fast MA", "type": "Integer", "range": { "min": 2, "max": 1e5 } }, { "name": "fastMAType", "displayName": "Fast MA", "defaultValue": 0, "hint": "Type of Moving Average for fast MA", "type": "MAType" }, { "name": "slowPeriod", "displayName": "Slow Period", "defaultValue": 26, "hint": "Number of period for the slow MA", "type": "Integer", "range": { "min": 2, "max": 1e5 } }, { "name": "slowMAType", "displayName": "Slow MA", "defaultValue": 0, "hint": "Type of Moving Average for slow MA", "type": "MAType" }, { "name": "signalPeriod", "displayName": "Signal Period", "defaultValue": 9, "hint": "Smoothing for the signal line (nb of period)", "type": "Integer", "range": { "min": 1, "max": 1e5 } }, { "name": "signalMAType", "displayName": "Signal MA", "defaultValue": 0, "hint": "Type of Moving Average for signal line", "type": "MAType" }], "outputs": [{ "name": "MACD", "type": "Double[]", "plotHint": "line" }, { "name": "MACDSignal", "type": "Double[]", "plotHint": "line_dash" }, { "name": "MACDHist", "type": "Double[]", "plotHint": "histogram" }] }, "MACDFIX": { "name": "MACDFIX", "inputs": [{ "name": "inReal", "type": "Double[]" }], "options": [{ "name": "signalPeriod", "displayName": "Signal Period", "defaultValue": 9, "hint": "Smoothing for the signal line (nb of period)", "type": "Integer", "range": { "min": 1, "max": 1e5 } }], "outputs": [{ "name": "MACD", "type": "Double[]", "plotHint": "line" }, { "name": "MACDSignal", "type": "Double[]", "plotHint": "line_dash" }, { "name": "MACDHist", "type": "Double[]", "plotHint": "histogram" }] }, "MAMA": { "name": "MAMA", "inputs": [{ "name": "inReal", "type": "Double[]" }], "options": [{ "name": "fastLimit", "displayName": "Fast Limit", "defaultValue": 0.5, "hint": "Upper limit use in the adaptive algorithm", "type": "Double", "range": { "min": 0.01, "max": 0.99 } }, { "name": "slowLimit", "displayName": "Slow Limit", "defaultValue": 0.05, "hint": "Lower limit use in the adaptive algorithm", "type": "Double", "range": { "min": 0.01, "max": 0.99 } }], "outputs": [{ "name": "MAMA", "type": "Double[]", "plotHint": "line" }, { "name": "FAMA", "type": "Double[]", "plotHint": "line_dash" }] }, "MAVP": { "name": "MAVP", "inputs": [{ "name": "inReal", "type": "Double[]" }, { "name": "inPeriods", "type": "Double[]" }], "options": [{ "name": "minPeriod", "displayName": "Minimum Period", "defaultValue": 2, "hint": "Value less than minimum will be changed to Minimum period", "type": "Integer", "range": { "min": 2, "max": 1e5 } }, { "name": "maxPeriod", "displayName": "Maximum Period", "defaultValue": 30, "hint": "Value higher than maximum will be changed to Maximum period", "type": "Integer", "range": { "min": 2, "max": 1e5 } }, { "name": "MAType", "displayName": "MA Type", "defaultValue": 0, "hint": "Type of Moving Average", "type": "MAType" }], "outputs": [{ "name": "output", "type": "Double[]", "plotHint": "line" }] }, "MEDPRICE": { "name": "MEDPRICE", "inputs": [{ "name": "high", "type": "Double[]" }, { "name": "low", "type": "Double[]" }], "options": [], "outputs": [{ "name": "output", "type": "Double[]", "plotHint": "line" }] }, "MFI": { "name": "MFI", "inputs": [{ "name": "high", "type": "Double[]" }, { "name": "low", "type": "Double[]" }, { "name": "close", "type": "Double[]" }, { "name": "volume", "type": "Double[]" }], "options": [{ "name": "timePeriod", "displayName": "Time Period", "defaultValue": 14, "hint": "Number of period", "type": "Integer", "range": { "min": 2, "max": 1e5 } }], "outputs": [{ "name": "output", "type": "Double[]", "plotHint": "line" }] }, "MIDPOINT": { "name": "MIDPOINT", "inputs": [{ "name": "inReal", "type": "Double[]" }], "options": [{ "name": "timePeriod", "displayName": "Time Period", "defaultValue": 14, "hint": "Number of period", "type": "Integer", "range": { "min": 2, "max": 1e5 } }], "outputs": [{ "name": "output", "type": "Double[]", "plotHint": "line" }] }, "MIDPRICE": { "name": "MIDPRICE", "inputs": [{ "name": "high", "type": "Double[]" }, { "name": "low", "type": "Double[]" }], "options": [{ "name": "timePeriod", "displayName": "Time Period", "defaultValue": 14, "hint": "Number of period", "type": "Integer", "range": { "min": 2, "max": 1e5 } }], "outputs": [{ "name": "output", "type": "Double[]", "plotHint": "line" }] }, "MINUS_DI": { "name": "MINUS_DI", "inputs": [{ "name": "high", "type": "Double[]" }, { "name": "low", "type": "Double[]" }, { "name": "close", "type": "Double[]" }], "options": [{ "name": "timePeriod", "displayName": "Time Period", "defaultValue": 14, "hint": "Number of period", "type": "Integer", "range": { "min": 1, "max": 1e5 } }], "outputs": [{ "name": "output", "type": "Double[]", "plotHint": "line" }] }, "MINUS_DM": { "name": "MINUS_DM", "inputs": [{ "name": "high", "type": "Double[]" }, { "name": "low", "type": "Double[]" }], "options": [{ "name": "timePeriod", "displayName": "Time Period", "defaultValue": 14, "hint": "Number of period", "type": "Integer", "range": { "min": 1, "max": 1e5 } }], "outputs": [{ "name": "output", "type": "Double[]", "plotHint": "line" }] }, "MOM": { "name": "MOM", "inputs": [{ "name": "inReal", "type": "Double[]" }], "options": [{ "name": "timePeriod", "displayName": "Time Period", "defaultValue": 10, "hint": "Number of period", "type": "Integer", "range": { "min": 1, "max": 1e5 } }], "outputs": [{ "name": "output", "type": "Double[]", "plotHint": "line" }] }, "OBV": { "name": "OBV", "inputs": [{ "name": "inReal", "type": "Double[]" }, { "name": "volume", "type": "Double[]" }], "options": [], "outputs": [{ "name": "output", "type": "Double[]", "plotHint": "line" }] }, "PLUS_DI": { "name": "PLUS_DI", "inputs": [{ "name": "high", "type": "Double[]" }, { "name": "low", "type": "Double[]" }, { "name": "close", "type": "Double[]" }], "options": [{ "name": "timePeriod", "displayName": "Time Period", "defaultValue": 14, "hint": "Number of period", "type": "Integer", "range": { "min": 1, "max": 1e5 } }], "outputs": [{ "name": "output", "type": "Double[]", "plotHint": "line" }] }, "PLUS_DM": { "name": "PLUS_DM", "inputs": [{ "name": "high", "type": "Double[]" }, { "name": "low", "type": "Double[]" }], "options": [{ "name": "timePeriod", "displayName": "Time Period", "defaultValue": 14, "hint": "Number of period", "type": "Integer", "range": { "min": 1, "max": 1e5 } }], "outputs": [{ "name": "output", "type": "Double[]", "plotHint": "line" }] }, "PPO": { "name": "PPO", "inputs": [{ "name": "inReal", "type": "Double[]" }], "options": [{ "name": "fastPeriod", "displayName": "Fast Period", "defaultValue": 12, "hint": "Number of period for the fast MA", "type": "Integer", "range": { "min": 2, "max": 1e5 } }, { "name": "slowPeriod", "displayName": "Slow Period", "defaultValue": 26, "hint": "Number of period for the slow MA", "type": "Integer", "range": { "min": 2, "max": 1e5 } }, { "name": "MAType", "displayName": "MA Type", "defaultValue": 0, "hint": "Type of Moving Average", "type": "MAType" }], "outputs": [{ "name": "output", "type": "Double[]", "plotHint": "line" }] }, "ROC": { "name": "ROC", "inputs": [{ "name": "inReal", "type": "Double[]" }], "options": [{ "name": "timePeriod", "displayName": "Time Period", "defaultValue": 10, "hint": "Number of period", "type": "Integer", "range": { "min": 1, "max": 1e5 } }], "outputs": [{ "name": "output", "type": "Double[]", "plotHint": "line" }] }, "ROCP": { "name": "ROCP", "inputs": [{ "name": "inReal", "type": "Double[]" }], "options": [{ "name": "timePeriod", "displayName": "Time Period", "defaultValue": 10, "hint": "Number of period", "type": "Integer", "range": { "min": 1, "max": 1e5 } }], "outputs": [{ "name": "output", "type": "Double[]", "plotHint": "line" }] }, "ROCR": { "name": "ROCR", "inputs": [{ "name": "inReal", "type": "Double[]" }], "options": [{ "name": "timePeriod", "displayName": "Time Period", "defaultValue": 10, "hint": "Number of period", "type": "Integer", "range": { "min": 1, "max": 1e5 } }], "outputs": [{ "name": "output", "type": "Double[]", "plotHint": "line" }] }, "ROCR100": { "name": "ROCR100", "inputs": [{ "name": "inReal", "type": "Double[]" }], "options": [{ "name": "timePeriod", "displayName": "Time Period", "defaultValue": 10, "hint": "Number of period", "type": "Integer", "range": { "min": 1, "max": 1e5 } }], "outputs": [{ "name": "output", "type": "Double[]", "plotHint": "line" }] }, "RSI": { "name": "RSI", "inputs": [{ "name": "inReal", "type": "Double[]" }], "options": [{ "name": "timePeriod", "displayName": "Time Period", "defaultValue": 14, "hint": "Number of period", "type": "Integer", "range": { "min": 2, "max": 1e5 } }], "outputs": [{ "name": "output", "type": "Double[]", "plotHint": "line" }] }, "SAR": { "name": "SAR", "inputs": [{ "name": "high", "type": "Double[]" }, { "name": "low", "type": "Double[]" }], "options": [{ "name": "acceleration", "displayName": "Acceleration Factor", "defaultValue": 0.02, "hint": "Acceleration Factor used up to the Maximum value", "type": "Double", "range": { "min": 0, "max": 3e37 } }, { "name": "maximum", "displayName": "AF Maximum", "defaultValue": 0.2, "hint": "Acceleration Factor Maximum value", "type": "Double", "range": { "min": 0, "max": 3e37 } }], "outputs": [{ "name": "output", "type": "Double[]", "plotHint": "line" }] }, "SAREXT": { "name": "SAREXT", "inputs": [{ "name": "high", "type": "Double[]" }, { "name": "low", "type": "Double[]" }], "options": [{ "name": "startValue", "displayName": "Start Value", "defaultValue": 0, "hint": "Start value and direction. 0 for Auto, >0 for Long, <0 for Short", "type": "Double", "range": { "min": -3e37, "max": 3e37 } }, { "name": "offsetOnReverse", "displayName": "Offset on Reverse", "defaultValue": 0, "hint": "Percent offset added/removed to initial stop on short/long reversal", "type": "Double", "range": { "min": 0, "max": 3e37 } }, { "name": "accelerationInitLong", "displayName": "AF Init Long", "defaultValue": 0.02, "hint": "Acceleration Factor initial value for the Long direction", "type": "Double", "range": { "min": 0, "max": 3e37 } }, { "name": "accelerationLong", "displayName": "AF Long", "defaultValue": 0.02, "hint": "Acceleration Factor for the Long direction", "type": "Double", "range": { "min": 0, "max": 3e37 } }, { "name": "accelerationMaxLong", "displayName": "AF Max Long", "defaultValue": 0.2, "hint": "Acceleration Factor maximum value for the Long direction", "type": "Double", "range": { "min": 0, "max": 3e37 } }, { "name": "accelerationInitShort", "displayName": "AF Init Short", "defaultValue": 0.02, "hint": "Acceleration Factor initial value for the Short direction", "type": "Double", "range": { "min": 0, "max": 3e37 } }, { "name": "accelerationShort", "displayName": "AF Short", "defaultValue": 0.02, "hint": "Acceleration Factor for the Short direction", "type": "Double", "range": { "min": 0, "max": 3e37 } }, { "name": "accelerationMaxShort", "displayName": "AF Max Short", "defaultValue": 0.2, "hint": "Acceleration Factor maximum value for the Short direction", "type": "Double", "range": { "min": 0, "max": 3e37 } }], "outputs": [{ "name": "output", "type": "Double[]", "plotHint": "line" }] }, "SMA": { "name": "SMA", "inputs": [{ "name": "inReal", "type": "Double[]" }], "options": [{ "name": "timePeriod", "displayName": "Time Period", "defaultValue": 30, "hint": "Number of period", "type": "Integer", "range": { "min": 2, "max": 1e5 } }], "outputs": [{ "name": "output", "type": "Double[]", "plotHint": "line" }] }, "STDDEV": { "name": "STDDEV", "inputs": [{ "name": "inReal", "type": "Double[]" }], "options": [{ "name": "timePeriod", "displayName": "Time Period", "defaultValue": 5, "hint": "Number of period", "type": "Integer", "range": { "min": 2, "max": 1e5 } }, { "name": "nbDev", "displayName": "Deviations", "defaultValue": 1, "hint": "Nb of deviations", "type": "Double", "range": { "min": -3e37, "max": 3e37 } }], "outputs": [{ "name": "output", "type": "Double[]", "plotHint": "line" }] }, "STOCH": { "name": "STOCH", "inputs": [{ "name": "high", "type": "Double[]" }, { "name": "low", "type": "Double[]" }, { "name": "close", "type": "Double[]" }], "options": [{ "name": "fastK_Period", "displayName": "Fast-K Period", "defaultValue": 5, "hint": "Time period for building the Fast-K line", "type": "Integer", "range": { "min": 1, "max": 1e5 } }, { "name": "slowK_Period", "displayName": "Slow-K Period", "defaultValue": 3, "hint": "Smoothing for making the Slow-K line. Usually set to 3", "type": "Integer", "range": { "min": 1, "max": 1e5 } }, { "name": "slowK_MAType", "displayName": "Slow-K MA", "defaultValue": 0, "hint": "Type of Moving Average for Slow-K", "type": "MAType" }, { "name": "slowD_Period", "displayName": "Slow-D Period", "defaultValue": 3, "hint": "Smoothing for making the Slow-D line", "type": "Integer", "range": { "min": 1, "max": 1e5 } }, { "name": "slowD_MAType", "displayName": "Slow-D MA", "defaultValue": 0, "hint": "Type of Moving Average for Slow-D", "type": "MAType" }], "outputs": [{ "name": "slowK", "type": "Double[]", "plotHint": "line_dash" }, { "name": "slowD", "type": "Double[]", "plotHint": "line_dash" }] }, "STOCHF": { "name": "STOCHF", "inputs": [{ "name": "high", "type": "Double[]" }, { "name": "low", "type": "Double[]" }, { "name": "close", "type": "Double[]" }], "options": [{ "name": "fastK_Period", "displayName": "Fast-K Period", "defaultValue": 5, "hint": "Time period for building the Fast-K line", "type": "Integer", "range": { "min": 1, "max": 1e5 } }, { "name": "fastD_Period", "displayName": "Fast-D Period", "defaultValue": 3, "hint": "Smoothing for making the Fast-D line. Usually set to 3", "type": "Integer", "range": { "min": 1, "max": 1e5 } }, { "name": "fastD_MAType", "displayName": "Fast-D MA", "defaultValue": 0, "hint": "Type of Moving Average for Fast-D", "type": "MAType" }], "outputs": [{ "name": "fastK", "type": "Double[]", "plotHint": "line" }, { "name": "fastD", "type": "Double[]", "plotHint": "line" }] }, "STOCHRSI": { "name": "STOCHRSI", "inputs": [{ "name": "inReal", "type": "Double[]" }], "options": [{ "name": "timePeriod", "displayName": "Time Period", "defaultValue": 14, "hint": "Number of period", "type": "Integer", "range": { "min": 2, "max": 1e5 } }, { "name": "fastK_Period", "displayName": "Fast-K Period", "defaultValue": 5, "hint": "Time period for building the Fast-K line", "type": "Integer", "range": { "min": 1, "max": 1e5 } }, { "name": "fastD_Period", "displayName": "Fast-D Period", "defaultValue": 3, "hint": "Smoothing for making the Fast-D line. Usually set to 3", "type": "Integer", "range": { "min": 1, "max": 1e5 } }, { "name": "fastD_MAType", "displayName": "Fast-D MA", "defaultValue": 0, "hint": "Type of Moving Average for Fast-D", "type": "MAType" }], "outputs": [{ "name": "fastK", "type": "Double[]", "plotHint": "line" }, { "name": "fastD", "type": "Double[]", "plotHint": "line" }] }, "T3": { "name": "T3", "inputs": [{ "name": "inReal", "type": "Double[]" }], "options": [{ "name": "timePeriod", "displayName": "Time Period", "defaultValue": 5, "hint": "Number of period", "type": "Integer", "range": { "min": 2, "max": 1e5 } }, { "name": "VFactor", "displayName": "Volume Factor", "defaultValue": 0.7, "hint": "Volume Factor", "type": "Double", "range": { "min": 0, "max": 1 } }], "outputs": [{ "name": "output", "type": "Double[]", "plotHint": "line" }] }, "TEMA": { "name": "TEMA", "inputs": [{ "name": "inReal", "type": "Double[]" }], "options": [{ "name": "timePeriod", "displayName": "Time Period", "defaultValue": 30, "hint": "Number of period", "type": "Integer", "range": { "min": 2, "max": 1e5 } }], "outputs": [{ "name": "output", "type": "Double[]", "plotHint": "line" }] }, "TRANGE": { "name": "TRANGE", "inputs": [{ "name": "high", "type": "Double[]" }, { "name": "low", "type": "Double[]" }, { "name": "close", "type": "Double[]" }], "options": [], "outputs": [{ "name": "output", "type": "Double[]", "plotHint": "line" }] }, "TRIMA": { "name": "TRIMA", "inputs": [{ "name": "inReal", "type": "Double[]" }], "options": [{ "name": "timePeriod", "displayName": "Time Period", "defaultValue": 30, "hint": "Number of period", "type": "Integer", "range": { "min": 2, "max": 1e5 } }], "outputs": [{ "name": "output", "type": "Double[]", "plotHint": "line" }] }, "TRIX": { "name": "TRIX", "inputs": [{ "name": "inReal", "type": "Double[]" }], "options": [{ "name": "timePeriod", "displayName": "Time Period", "defaultValue": 30, "hint": "Number of period", "type": "Integer", "range": { "min": 1, "max": 1e5 } }], "outputs": [{ "name": "output", "type": "Double[]", "plotHint": "line" }] }, "TSF": { "name": "TSF", "inputs": [{ "name": "inReal", "type": "Double[]" }], "options": [{ "name": "timePeriod", "displayName": "Time Period", "defaultValue": 14, "hint": "Number of period", "type": "Integer", "range": { "min": 2, "max": 1e5 } }], "outputs": [{ "name": "output", "type": "Double[]", "plotHint": "line" }] }, "TYPPRICE": { "name": "TYPPRICE", "inputs": [{ "name": "high", "type": "Double[]" }, { "name": "low", "type": "Double[]" }, { "name": "close", "type": "Double[]" }], "options": [], "outputs": [{ "name": "output", "type": "Double[]", "plotHint": "line" }] }, "ULTOSC": { "name": "ULTOSC", "inputs": [{ "name": "high", "type": "Double[]" }, { "name": "low", "type": "Double[]" }, { "name": "close", "type": "Double[]" }], "options": [{ "name": "timePeriod1", "displayName": "First Period", "defaultValue": 7, "hint": "Number of bars for 1st period.", "type": "Integer", "range": { "min": 1, "max": 1e5 } }, { "name": "timePeriod2", "displayName": "Second Period", "defaultValue": 14, "hint": "Number of bars fro 2nd period", "type": "Integer", "range": { "min": 1, "max": 1e5 } }, { "name": "timePeriod3", "displayName": "Third Period", "defaultValue": 28, "hint": "Number of bars for 3rd period", "type": "Integer", "range": { "min": 1, "max": 1e5 } }], "outputs": [{ "name": "output", "type": "Double[]", "plotHint": "line" }] }, "VAR": { "name": "VAR", "inputs": [{ "name": "inReal", "type": "Double[]" }], "options": [{ "name": "timePeriod", "displayName": "Time Period", "defaultValue": 5, "hint": "Number of period", "type": "Integer", "range": { "min": 1, "max": 1e5 } }, { "name": "nbDev", "displayName": "Deviations", "defaultValue": 1, "hint": "Nb of deviations", "type": "Double", "range": { "min": -3e37, "max": 3e37 } }], "outputs": [{ "name": "output", "type": "Double[]", "plotHint": "line" }] }, "WCLPRICE": { "name": "WCLPRICE", "inputs": [{ "name": "high", "type": "Double[]" }, { "name": "low", "type": "Double[]" }, { "name": "close", "type": "Double[]" }], "options": [], "outputs": [{ "name": "output", "type": "Double[]", "plotHint": "line" }] }, "WILLR": { "name": "WILLR", "inputs": [{ "name": "high", "type": "Double[]" }, { "name": "low", "type": "Double[]" }, { "name": "close", "type": "Double[]" }], "options": [{ "name": "timePeriod", "displayName": "Time Period", "defaultValue": 14, "hint": "Number of period", "type": "Integer", "range": { "min": 2, "max": 1e5 } }], "outputs": [{ "name": "output", "type": "Double[]", "plotHint": "line" }] }, "WMA": { "name": "WMA", "inputs": [{ "name": "inReal", "type": "Double[]" }], "options": [{ "name": "timePeriod", "displayName": "Time Period", "defaultValue": 30, "hint": "Number of period", "type": "Integer", "range": { "min": 2, "max": 1e5 } }], "outputs": [{ "name": "output", "type": "Double[]", "plotHint": "line" }] } };
  let Module;
  function double_array(size) {
    const BYTE_SIZE = 8;
    const offset = Module._malloc(size * BYTE_SIZE);
    const offsetF64 = offset / BYTE_SIZE;
    Module.HEAPF64.set(new Float64Array(size), offsetF64);
    return {
      data: Module.HEAPF64.subarray(offsetF64, offsetF64 + size),
      pointer: offset
    };
  }
  function c_pointer(type, initValue) {
    const offset = Module._malloc(4);
    const ref = {
      get data() {
        return Module.getValue(offset, type);
      },
      set data(val) {
        Module.setValue(offset, val, type);
      },
      pointer: offset
    };
    {
      ref.data = initValue;
    }
    return ref;
  }
  const TA_RET_CODE = {
    0: "TA_SUCCESS",
    1: "TA_LIB_NOT_INITIALIZE",
    2: "TA_BAD_PARAM",
    3: "TA_ALLOC_ERR",
    4: "TA_GROUP_NOT_FOUND",
    5: "TA_FUNC_NOT_FOUND",
    6: "TA_INVALID_HANDLE",
    7: "TA_INVALID_PARAM_HOLDER",
    8: "TA_INVALID_PARAM_HOLDER_TYPE",
    9: "TA_INVALID_PARAM_FUNCTION",
    10: "TA_INPUT_NOT_ALL_INITIALIZE",
    11: "TA_OUTPUT_NOT_ALL_INITIALIZE",
    12: "TA_OUT_OF_RANGE_START_INDEX",
    13: "TA_OUT_OF_RANGE_END_INDEX",
    14: "TA_INVALID_LIST_TYPE",
    15: "TA_BAD_OBJECT",
    16: "TA_NOT_SUPPORTED",
    5e3: "TA_INTERNAL_ERROR",
    [65535]: "TA_UNKNOWN_ERR"
  };
  const TA_INTEGER_DEFAULT = -2147483648;
  function callFunc(api2, params) {
    const funcIdent = `TA_${api2.name}`;
    if (!Module)
      throw Error(`${api2.name}() called before initialization.`);
    const ccallArgsLen = 2 + api2.inputs.length + api2.options.length + 2 + api2.outputs.length;
    const argTypes = new Array(ccallArgsLen).fill("number");
    for (const { name: name2 } of api2.inputs) {
      if (!Array.isArray(params[name2])) {
        if (params[name2] === void 0)
          throw Error(`Bad Param: "${name2}" is required`);
        throw Error(`Bad Param: "${name2}" should be array of number`);
      }
    }
    for (const { name: name2, range } of api2.options) {
      if (params[name2] === void 0) {
        params[name2] = TA_INTEGER_DEFAULT;
      } else if (range && (params[name2] < range.min || params[name2] > range.max)) {
        throw Error(`Bad Param: "${name2}" out of range (min: ${range.min}, max: ${range.max})`);
      }
    }
    let { startIdx, endIdx } = params;
    if (startIdx === void 0)
      startIdx = 0;
    const reqParamsLen = api2.inputs.map(({ name: name2 }) => params[name2].length);
    let minInputLen = Math.min(...reqParamsLen);
    if (endIdx === void 0) {
      endIdx = minInputLen - 1;
    }
    const args2 = [startIdx, endIdx];
    const memToFree = [];
    api2.inputs.forEach(({ name: name2 }) => {
      const argArray = double_array(endIdx + 1 - startIdx);
      const paramArray = params[name2];
      for (const i2 in paramArray)
        argArray.data[i2] = paramArray[i2];
      memToFree.push(argArray.pointer);
      args2.push(argArray.pointer);
    });
    api2.options.forEach(({ name: name2 }) => args2.push(params[name2]));
    const outBegIdxRef = c_pointer("i32", 0);
    const outNBElementRef = c_pointer("i32", 0);
    memToFree.push(outBegIdxRef.pointer);
    memToFree.push(outNBElementRef.pointer);
    args2.push(outBegIdxRef.pointer);
    args2.push(outNBElementRef.pointer);
    const outputs = api2.outputs.map(({ name: name2 }) => {
      const argArray = double_array(endIdx + 1 - startIdx);
      memToFree.push(argArray.pointer);
      args2.push(argArray.pointer);
      return { name: name2, array: argArray };
    });
    const retCode = Module.ccall(funcIdent, "number", argTypes, args2);
    const outBegIdx = outBegIdxRef.data;
    const outNBElement = outNBElementRef.data;
    const result = outputs.reduce((result2, current) => {
      const data = Array.from(current.array.data.slice(0, outNBElement));
      result2[current.name] = data;
      return result2;
    }, { outBegIdx, outNBElement });
    memToFree.forEach((offset) => Module._free(offset));
    if (retCode === 0) {
      return result;
    } else {
      throw Error("[C_ERROR] " + TA_RET_CODE[retCode]);
    }
  }
  var MAType$1;
  (function(MAType2) {
    MAType2[MAType2["SMA"] = 0] = "SMA";
    MAType2[MAType2["EMA"] = 1] = "EMA";
    MAType2[MAType2["WMA"] = 2] = "WMA";
    MAType2[MAType2["DEMA"] = 3] = "DEMA";
    MAType2[MAType2["TEMA"] = 4] = "TEMA";
    MAType2[MAType2["TRIMA"] = 5] = "TRIMA";
    MAType2[MAType2["KAMA"] = 6] = "KAMA";
    MAType2[MAType2["MAMA"] = 7] = "MAMA";
    MAType2[MAType2["T3"] = 8] = "T3";
  })(MAType$1 || (MAType$1 = {}));
  function init(wasmBinaryFilePath) {
    if (Module)
      return Promise.resolve(Module);
    if (wasmBinaryFilePath && typeof wasmBinaryFilePath !== "string") {
      return Promise.reject(new Error('Invalid argument, "init(wasmBinaryFilePath)" expects a string that specifies the location of wasm binary file'));
    }
    const locateFile2 = wasmBinaryFilePath ? () => wasmBinaryFilePath : void 0;
    return __INIT__({ locateFile: locateFile2 }).then((m) => Module = m).catch((e) => {
      let message = "TA-Lib WASM runtime init fail.";
      if (e && e.message) {
        message += "\nError: \n" + e.message;
      } else {
        message += "Unknown reason. Perhaps you specify the wrong file path to wasm binary?";
      }
      throw new Error(message);
    });
  }
  let __ACCBANDS_API__ = API["ACCBANDS"];
  function ACCBANDS(params) {
    return callFunc(__ACCBANDS_API__, params);
  }
  const accBands = ACCBANDS;
  let __AD_API__ = API["AD"];
  function AD(params) {
    return callFunc(__AD_API__, params);
  }
  const ad = AD;
  let __ADOSC_API__ = API["ADOSC"];
  function ADOSC(params) {
    return callFunc(__ADOSC_API__, params);
  }
  const adOsc = ADOSC;
  let __ADX_API__ = API["ADX"];
  function ADX(params) {
    return callFunc(__ADX_API__, params);
  }
  const adx = ADX;
  let __ADXR_API__ = API["ADXR"];
  function ADXR(params) {
    return callFunc(__ADXR_API__, params);
  }
  const adxr = ADXR;
  let __APO_API__ = API["APO"];
  function APO(params) {
    return callFunc(__APO_API__, params);
  }
  const apo = APO;
  let __AROON_API__ = API["AROON"];
  function AROON(params) {
    return callFunc(__AROON_API__, params);
  }
  const aroon = AROON;
  let __AROONOSC_API__ = API["AROONOSC"];
  function AROONOSC(params) {
    return callFunc(__AROONOSC_API__, params);
  }
  const aroonOsc = AROONOSC;
  let __ATR_API__ = API["ATR"];
  function ATR(params) {
    return callFunc(__ATR_API__, params);
  }
  const atr = ATR;
  let __AVGDEV_API__ = API["AVGDEV"];
  function AVGDEV(params) {
    return callFunc(__AVGDEV_API__, params);
  }
  const avgDev = AVGDEV;
  let __AVGPRICE_API__ = API["AVGPRICE"];
  function AVGPRICE(params) {
    return callFunc(__AVGPRICE_API__, params);
  }
  const avgPrice = AVGPRICE;
  let __BBANDS_API__ = API["BBANDS"];
  function BBANDS(params) {
    return callFunc(__BBANDS_API__, params);
  }
  const bbands = BBANDS;
  let __BOP_API__ = API["BOP"];
  function BOP(params) {
    return callFunc(__BOP_API__, params);
  }
  const bop = BOP;
  let __CCI_API__ = API["CCI"];
  function CCI(params) {
    return callFunc(__CCI_API__, params);
  }
  const cci = CCI;
  let __CMO_API__ = API["CMO"];
  function CMO(params) {
    return callFunc(__CMO_API__, params);
  }
  const cmo = CMO;
  let __DEMA_API__ = API["DEMA"];
  function DEMA(params) {
    return callFunc(__DEMA_API__, params);
  }
  const dema = DEMA;
  let __DX_API__ = API["DX"];
  function DX(params) {
    return callFunc(__DX_API__, params);
  }
  const dx = DX;
  let __EMA_API__ = API["EMA"];
  function EMA(params) {
    return callFunc(__EMA_API__, params);
  }
  const ema$1 = EMA;
  let __HT_DCPERIOD_API__ = API["HT_DCPERIOD"];
  function HT_DCPERIOD(params) {
    return callFunc(__HT_DCPERIOD_API__, params);
  }
  const htDcPeriod = HT_DCPERIOD;
  let __HT_DCPHASE_API__ = API["HT_DCPHASE"];
  function HT_DCPHASE(params) {
    return callFunc(__HT_DCPHASE_API__, params);
  }
  const htDcPhase = HT_DCPHASE;
  let __HT_PHASOR_API__ = API["HT_PHASOR"];
  function HT_PHASOR(params) {
    return callFunc(__HT_PHASOR_API__, params);
  }
  const htPhasor = HT_PHASOR;
  let __HT_SINE_API__ = API["HT_SINE"];
  function HT_SINE(params) {
    return callFunc(__HT_SINE_API__, params);
  }
  const htSine = HT_SINE;
  let __HT_TRENDLINE_API__ = API["HT_TRENDLINE"];
  function HT_TRENDLINE(params) {
    return callFunc(__HT_TRENDLINE_API__, params);
  }
  const htTrendline = HT_TRENDLINE;
  let __HT_TRENDMODE_API__ = API["HT_TRENDMODE"];
  function HT_TRENDMODE(params) {
    return callFunc(__HT_TRENDMODE_API__, params);
  }
  const htTrendMode = HT_TRENDMODE;
  let __IMI_API__ = API["IMI"];
  function IMI(params) {
    return callFunc(__IMI_API__, params);
  }
  const imi = IMI;
  let __KAMA_API__ = API["KAMA"];
  function KAMA(params) {
    return callFunc(__KAMA_API__, params);
  }
  const kama = KAMA;
  let __MA_API__ = API["MA"];
  function MA(params) {
    return callFunc(__MA_API__, params);
  }
  const movingAverage = MA;
  let __MACD_API__ = API["MACD"];
  function MACD(params) {
    return callFunc(__MACD_API__, params);
  }
  const macd = MACD;
  let __MACDEXT_API__ = API["MACDEXT"];
  function MACDEXT(params) {
    return callFunc(__MACDEXT_API__, params);
  }
  const macdExt = MACDEXT;
  let __MACDFIX_API__ = API["MACDFIX"];
  function MACDFIX(params) {
    return callFunc(__MACDFIX_API__, params);
  }
  const macdFix = MACDFIX;
  let __MAMA_API__ = API["MAMA"];
  function MAMA(params) {
    return callFunc(__MAMA_API__, params);
  }
  const mama = MAMA;
  let __MAVP_API__ = API["MAVP"];
  function MAVP(params) {
    return callFunc(__MAVP_API__, params);
  }
  const movingAverageVariablePeriod = MAVP;
  let __MEDPRICE_API__ = API["MEDPRICE"];
  function MEDPRICE(params) {
    return callFunc(__MEDPRICE_API__, params);
  }
  const medPrice = MEDPRICE;
  let __MFI_API__ = API["MFI"];
  function MFI(params) {
    return callFunc(__MFI_API__, params);
  }
  const mfi = MFI;
  let __MIDPOINT_API__ = API["MIDPOINT"];
  function MIDPOINT(params) {
    return callFunc(__MIDPOINT_API__, params);
  }
  const midPoint = MIDPOINT;
  let __MIDPRICE_API__ = API["MIDPRICE"];
  function MIDPRICE(params) {
    return callFunc(__MIDPRICE_API__, params);
  }
  const midPrice = MIDPRICE;
  let __MINUS_DI_API__ = API["MINUS_DI"];
  function MINUS_DI(params) {
    return callFunc(__MINUS_DI_API__, params);
  }
  const minusDI = MINUS_DI;
  let __MINUS_DM_API__ = API["MINUS_DM"];
  function MINUS_DM(params) {
    return callFunc(__MINUS_DM_API__, params);
  }
  const minusDM = MINUS_DM;
  let __MOM_API__ = API["MOM"];
  function MOM(params) {
    return callFunc(__MOM_API__, params);
  }
  const mom = MOM;
  let __OBV_API__ = API["OBV"];
  function OBV(params) {
    return callFunc(__OBV_API__, params);
  }
  const obv = OBV;
  let __PLUS_DI_API__ = API["PLUS_DI"];
  function PLUS_DI(params) {
    return callFunc(__PLUS_DI_API__, params);
  }
  const plusDI = PLUS_DI;
  let __PLUS_DM_API__ = API["PLUS_DM"];
  function PLUS_DM(params) {
    return callFunc(__PLUS_DM_API__, params);
  }
  const plusDM = PLUS_DM;
  let __PPO_API__ = API["PPO"];
  function PPO(params) {
    return callFunc(__PPO_API__, params);
  }
  const ppo = PPO;
  let __ROC_API__ = API["ROC"];
  function ROC(params) {
    return callFunc(__ROC_API__, params);
  }
  const roc = ROC;
  let __ROCP_API__ = API["ROCP"];
  function ROCP(params) {
    return callFunc(__ROCP_API__, params);
  }
  const rocP = ROCP;
  let __ROCR_API__ = API["ROCR"];
  function ROCR(params) {
    return callFunc(__ROCR_API__, params);
  }
  const rocR = ROCR;
  let __ROCR100_API__ = API["ROCR100"];
  function ROCR100(params) {
    return callFunc(__ROCR100_API__, params);
  }
  const rocR100 = ROCR100;
  let __RSI_API__ = API["RSI"];
  function RSI(params) {
    return callFunc(__RSI_API__, params);
  }
  const rsi = RSI;
  let __SAR_API__ = API["SAR"];
  function SAR(params) {
    return callFunc(__SAR_API__, params);
  }
  const sar$1 = SAR;
  let __SAREXT_API__ = API["SAREXT"];
  function SAREXT(params) {
    return callFunc(__SAREXT_API__, params);
  }
  const sarExt = SAREXT;
  let __SMA_API__ = API["SMA"];
  function SMA(params) {
    return callFunc(__SMA_API__, params);
  }
  const sma = SMA;
  let __STDDEV_API__ = API["STDDEV"];
  function STDDEV(params) {
    return callFunc(__STDDEV_API__, params);
  }
  const stdDev = STDDEV;
  let __STOCH_API__ = API["STOCH"];
  function STOCH(params) {
    return callFunc(__STOCH_API__, params);
  }
  const stoch = STOCH;
  let __STOCHF_API__ = API["STOCHF"];
  function STOCHF(params) {
    return callFunc(__STOCHF_API__, params);
  }
  const stochF = STOCHF;
  let __STOCHRSI_API__ = API["STOCHRSI"];
  function STOCHRSI(params) {
    return callFunc(__STOCHRSI_API__, params);
  }
  const stochRsi = STOCHRSI;
  let __T3_API__ = API["T3"];
  function T3(params) {
    return callFunc(__T3_API__, params);
  }
  const t3 = T3;
  let __TEMA_API__ = API["TEMA"];
  function TEMA(params) {
    return callFunc(__TEMA_API__, params);
  }
  const tema = TEMA;
  let __TRANGE_API__ = API["TRANGE"];
  function TRANGE(params) {
    return callFunc(__TRANGE_API__, params);
  }
  const trueRange = TRANGE;
  let __TRIMA_API__ = API["TRIMA"];
  function TRIMA(params) {
    return callFunc(__TRIMA_API__, params);
  }
  const trima = TRIMA;
  let __TRIX_API__ = API["TRIX"];
  function TRIX(params) {
    return callFunc(__TRIX_API__, params);
  }
  const trix$1 = TRIX;
  let __TSF_API__ = API["TSF"];
  function TSF(params) {
    return callFunc(__TSF_API__, params);
  }
  const tsf = TSF;
  let __TYPPRICE_API__ = API["TYPPRICE"];
  function TYPPRICE(params) {
    return callFunc(__TYPPRICE_API__, params);
  }
  const typPrice = TYPPRICE;
  let __ULTOSC_API__ = API["ULTOSC"];
  function ULTOSC(params) {
    return callFunc(__ULTOSC_API__, params);
  }
  const ultOsc = ULTOSC;
  let __VAR_API__ = API["VAR"];
  function VAR(params) {
    return callFunc(__VAR_API__, params);
  }
  const variance = VAR;
  let __WCLPRICE_API__ = API["WCLPRICE"];
  function WCLPRICE(params) {
    return callFunc(__WCLPRICE_API__, params);
  }
  const wclPrice = WCLPRICE;
  let __WILLR_API__ = API["WILLR"];
  function WILLR(params) {
    return callFunc(__WILLR_API__, params);
  }
  const willR = WILLR;
  let __WMA_API__ = API["WMA"];
  function WMA(params) {
    return callFunc(__WMA_API__, params);
  }
  const wma = WMA;
  var TA = /* @__PURE__ */ Object.freeze({
    __proto__: null,
    ACCBANDS,
    AD,
    ADOSC,
    ADX,
    ADXR,
    APO,
    AROON,
    AROONOSC,
    ATR,
    AVGDEV,
    AVGPRICE,
    BBANDS,
    BOP,
    CCI,
    CMO,
    DEMA,
    DX,
    EMA,
    HT_DCPERIOD,
    HT_DCPHASE,
    HT_PHASOR,
    HT_SINE,
    HT_TRENDLINE,
    HT_TRENDMODE,
    IMI,
    KAMA,
    MA,
    MACD,
    MACDEXT,
    MACDFIX,
    MAMA,
    get MAType() {
      return MAType$1;
    },
    MAVP,
    MEDPRICE,
    MFI,
    MIDPOINT,
    MIDPRICE,
    MINUS_DI,
    MINUS_DM,
    MOM,
    OBV,
    PLUS_DI,
    PLUS_DM,
    PPO,
    ROC,
    ROCP,
    ROCR,
    ROCR100,
    RSI,
    SAR,
    SAREXT,
    SMA,
    STDDEV,
    STOCH,
    STOCHF,
    STOCHRSI,
    T3,
    TEMA,
    TRANGE,
    TRIMA,
    TRIX,
    TSF,
    TYPPRICE,
    ULTOSC,
    VAR,
    WCLPRICE,
    WILLR,
    WMA,
    accBands,
    ad,
    adOsc,
    adx,
    adxr,
    apo,
    aroon,
    aroonOsc,
    atr,
    avgDev,
    avgPrice,
    bbands,
    bop,
    cci,
    cmo,
    dema,
    dx,
    ema: ema$1,
    htDcPeriod,
    htDcPhase,
    htPhasor,
    htSine,
    htTrendMode,
    htTrendline,
    imi,
    init,
    kama,
    macd,
    macdExt,
    macdFix,
    mama,
    medPrice,
    mfi,
    midPoint,
    midPrice,
    minusDI,
    minusDM,
    mom,
    movingAverage,
    movingAverageVariablePeriod,
    obv,
    plusDI,
    plusDM,
    ppo,
    roc,
    rocP,
    rocR,
    rocR100,
    rsi,
    sar: sar$1,
    sarExt,
    sma,
    stdDev,
    stoch,
    stochF,
    stochRsi,
    t3,
    tema,
    trima,
    trix: trix$1,
    trueRange,
    tsf,
    typPrice,
    ultOsc,
    variance,
    wclPrice,
    willR,
    wma
  });
  function enumToOptions(e) {
    return Object.keys(e).filter((key) => isNaN(Number(key))).map((key) => ({
      title: key,
      value: e[key]
    }));
  }
  var MAType = /* @__PURE__ */ ((MAType2) => {
    MAType2[MAType2["SMA"] = 0] = "SMA";
    MAType2[MAType2["EMA"] = 1] = "EMA";
    MAType2[MAType2["WMA"] = 2] = "WMA";
    MAType2[MAType2["DEMA"] = 3] = "DEMA";
    MAType2[MAType2["TEMA"] = 4] = "TEMA";
    MAType2[MAType2["TRIMA"] = 5] = "TRIMA";
    MAType2[MAType2["KAMA"] = 6] = "KAMA";
    MAType2[MAType2["MAMA"] = 7] = "MAMA";
    MAType2[MAType2["T3"] = 8] = "T3";
    return MAType2;
  })(MAType || {});
  function extractSource(input, source) {
    return input.map((d) => d.customValues[source]);
  }
  enumToOptions(MAType);
  var wasmUrl = "" + new URL("talib-CX0CyGM9.wasm", self.location.href).href;
  async function initTA() {
    await init(wasmUrl);
  }
  async function calcTA(funcName, inputs, outputs, args2) {
    await initTA();
    const func2 = Reflect.get(TA, funcName);
    const res = func2(args2);
    return inputs.map((d, index) => {
      const data = /* @__PURE__ */ Object.create(null);
      data.time = d.time;
      if (index < res.outBegIdx) return data;
      data.study = /* @__PURE__ */ Object.create(null);
      outputs.forEach((output) => {
        data.study[output.chartKey] = res[output.taKey][index - res.outBegIdx];
      });
      return data;
    });
  }
  const dmi = async (inputs) => {
    await initTA();
    const high = extractSource(inputs, "high");
    const low = extractSource(inputs, "low");
    const close = extractSource(inputs, "close");
    const pdi = PLUS_DI({
      high,
      low,
      close,
      timePeriod: 14
    });
    const mdi = MINUS_DI({
      high,
      low,
      close,
      timePeriod: 14
    });
    const adx2 = ADX({
      high,
      low,
      close,
      timePeriod: 14
    });
    return inputs.map((d, index) => {
      const data = /* @__PURE__ */ Object.create(null);
      data.time = d.time;
      if (index > pdi.outBegIdx) {
        if (!data.study) {
          data.study = /* @__PURE__ */ Object.create(null);
        }
        data.study["+di"] = pdi.output[index - pdi.outBegIdx];
      }
      if (index > mdi.outBegIdx) {
        if (!data.study) {
          data.study = /* @__PURE__ */ Object.create(null);
        }
        data.study["-di"] = mdi.output[index - mdi.outBegIdx];
      }
      if (index > adx2.outBegIdx) {
        if (!data.study) {
          data.study = /* @__PURE__ */ Object.create(null);
        }
        data.study["adx"] = adx2.output[index - adx2.outBegIdx];
      }
      return data;
    });
  };
  const ema = async (inputs) => {
    await initTA();
    const inReal = extractSource(inputs, "close");
    const ma5 = EMA({
      inReal,
      timePeriod: 5
    });
    const ma10 = EMA({
      inReal,
      timePeriod: 10
    });
    const ma30 = EMA({
      inReal,
      timePeriod: 30
    });
    const ma60 = EMA({
      inReal,
      timePeriod: 60
    });
    return inputs.map((d, index) => {
      const data = /* @__PURE__ */ Object.create(null);
      data.time = d.time;
      if (index > ma5.outBegIdx) {
        if (!data.study) {
          data.study = /* @__PURE__ */ Object.create(null);
        }
        data.study["ema5"] = ma5.output[index - ma5.outBegIdx];
      }
      if (index > ma10.outBegIdx) {
        data.study["ema10"] = ma10.output[index - ma10.outBegIdx];
      }
      if (index > ma30.outBegIdx) {
        data.study["ema30"] = ma30.output[index - ma30.outBegIdx];
      }
      if (index > ma60.outBegIdx) {
        data.study["ema60"] = ma60.output[index - ma60.outBegIdx];
      }
      return data;
    });
  };
  const emv = (inputs) => {
    const params = [14, 9];
    let emvValueSum = 0;
    const emvValueList = [];
    return inputs.map((bar, i2) => {
      const output = /* @__PURE__ */ Object.create(null);
      output.time = bar.time;
      if (i2 > 0) {
        const prevKLineData = inputs[i2 - 1];
        const high = bar.customValues.high;
        const low = bar.customValues.low;
        const volume = bar.customValues.volume ?? 0;
        const distanceMoved = (high + low) / 2 - (prevKLineData.customValues.high + prevKLineData.customValues.low) / 2;
        output.study = output.study || {};
        if (volume === 0 || high - low === 0) {
          output.study.emv = 0;
        } else {
          const ratio = volume / 1e8 / (high - low);
          output.study.emv = distanceMoved / ratio;
        }
        emvValueSum += output.study.emv;
        emvValueList.push(output.study.emv);
        if (i2 >= params[0]) {
          output.study.ma = emvValueSum / params[0];
          emvValueSum -= emvValueList[i2 - params[0]];
        }
      }
      return output;
    });
  };
  function getMaxMin(dataList, maxKey, minKey) {
    const maxMin = [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER];
    const dataLength = dataList.length;
    let index = 0;
    while (index < dataLength) {
      const data = dataList[index];
      maxMin[0] = Math.max(
        data.customValues[maxKey] ?? Number.MIN_SAFE_INTEGER,
        maxMin[0]
      );
      maxMin[1] = Math.min(
        data.customValues[minKey] ?? Number.MAX_SAFE_INTEGER,
        maxMin[1]
      );
      ++index;
    }
    return maxMin;
  }
  const kdj = (inputs) => {
    const params = [9, 3, 3];
    const result = [];
    inputs.forEach((bar, i2) => {
      var _a, _b, _c, _d;
      const output = /* @__PURE__ */ Object.create(null);
      output.time = bar.time;
      const close = bar.customValues.close;
      if (i2 >= params[0] - 1) {
        const lhn = getMaxMin(inputs.slice(i2 - (params[0] - 1), i2 + 1), "high", "low");
        const hn = lhn[0];
        const ln = lhn[1];
        const hnSubLn = hn - ln;
        const rsv = (close - ln) / (hnSubLn === 0 ? 1 : hnSubLn) * 100;
        const k = ((params[1] - 1) * (((_b = (_a = result[i2 - 1]) == null ? void 0 : _a.study) == null ? void 0 : _b.k) ?? 50) + rsv) / params[1];
        const d = ((params[2] - 1) * (((_d = (_c = result[i2 - 1]) == null ? void 0 : _c.study) == null ? void 0 : _d.d) ?? 50) + k) / params[2];
        const j = 3 * k - 2 * d;
        output.study = { k, d, j };
      }
      result.push(output);
    });
    return result;
  };
  const ma = async (inputs) => {
    await initTA();
    const inReal = extractSource(inputs, "close");
    const ma5 = MA({
      inReal,
      timePeriod: 5
    });
    const ma10 = MA({
      inReal,
      timePeriod: 10
    });
    const ma30 = MA({
      inReal,
      timePeriod: 30
    });
    const ma60 = MA({
      inReal,
      timePeriod: 60
    });
    return inputs.map((d, index) => {
      const data = /* @__PURE__ */ Object.create(null);
      data.time = d.time;
      if (index > ma5.outBegIdx) {
        if (!data.study) {
          data.study = /* @__PURE__ */ Object.create(null);
        }
        data.study["ma5"] = ma5.output[index - ma5.outBegIdx];
      }
      if (index > ma10.outBegIdx) {
        data.study["ma10"] = ma10.output[index - ma10.outBegIdx];
      }
      if (index > ma30.outBegIdx) {
        data.study["ma30"] = ma30.output[index - ma30.outBegIdx];
      }
      if (index > ma60.outBegIdx) {
        data.study["ma60"] = ma60.output[index - ma60.outBegIdx];
      }
      return data;
    });
  };
  const mtm = (inputs) => {
    const params = [12, 6];
    let mtmSum = 0;
    const result = [];
    inputs.forEach((bar, i2) => {
      var _a, _b;
      const output = /* @__PURE__ */ Object.create(null);
      output.time = bar.time;
      if (i2 >= params[0]) {
        const close = bar.customValues.close;
        const agoClose = inputs[i2 - params[0]].customValues.close;
        const mtm2 = close - agoClose;
        mtmSum += mtm2;
        output.study = {
          mtm: mtm2
        };
        if (i2 >= params[0] + params[1] - 1) {
          output.study.ma = mtmSum / params[1];
          mtmSum -= ((_b = (_a = result[i2 - (params[1] - 1)]) == null ? void 0 : _a.study) == null ? void 0 : _b.mtm) ?? 0;
        }
      }
      result.push(output);
    });
    return result;
  };
  const psy = (inputs) => {
    const params = [12, 6];
    const result = [];
    let upCount = 0;
    let psySum = 0;
    const upList = [];
    inputs.forEach((bar, i2) => {
      var _a;
      const output = /* @__PURE__ */ Object.create(null);
      output.time = bar.time;
      const prevClose = (inputs[i2 - 1] ?? bar).customValues.close;
      const upFlag = bar.customValues.close - prevClose > 0 ? 1 : 0;
      upList.push(upFlag);
      upCount += upFlag;
      if (i2 >= params[0] - 1) {
        const psy2 = upCount / params[0] * 100;
        psySum += psy2;
        output.study = { psy: psy2 };
        if (i2 >= params[0] + params[1] - 2) {
          output.study.ma = psySum / params[1];
          psySum -= ((_a = result[i2 - (params[1] - 1)].study) == null ? void 0 : _a.psy) ?? 0;
        }
        upCount -= upList[i2 - (params[0] - 1)];
      }
      result.push(output);
    });
    return result;
  };
  const pvt = (inputs) => {
    let sum = 0;
    return inputs.map((bar, i2) => {
      const output = /* @__PURE__ */ Object.create(null);
      output.time = bar.time;
      const close = bar.customValues.close;
      const volume = bar.customValues.volume ?? 1;
      const prevClose = (inputs[i2 - 1] ?? bar).customValues.close;
      let x = 0;
      const total = prevClose * volume;
      if (total !== 0) {
        x = (close - prevClose) / total;
      }
      sum += x;
      output.study = {
        plot: sum
      };
      return output;
    });
  };
  class DataSource {
    constructor(data) {
      __publicField(this, "_dataItems");
      this._dataItems = data;
    }
    getDataCount() {
      return this._dataItems.length;
    }
    getDataAt(index) {
      return this._dataItems[index];
    }
    toString() {
      return JSON.stringify(this._dataItems);
    }
  }
  const _ExprEnv = class _ExprEnv {
    constructor(ds) {
      __publicField(this, "_ds");
      __publicField(this, "_firstIndex", -1);
      this._ds = ds;
    }
    static get() {
      return _ExprEnv.inst;
    }
    static set(env) {
      _ExprEnv.inst = env;
    }
    getDataSource() {
      return this._ds;
    }
    setDataSource(ds) {
      this._ds = ds;
    }
    getFirstIndex() {
      return this._firstIndex;
    }
    setFirstIndex(n) {
      this._firstIndex = n;
    }
  };
  __publicField(_ExprEnv, "inst");
  let ExprEnv = _ExprEnv;
  class Expr {
    constructor() {
      __publicField(this, "_rid");
      this._rid = 0;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    reserve(rid, count) {
    }
    clear() {
    }
    toString() {
      return `[ Expr expr ]`;
    }
  }
  class ConstExpr extends Expr {
    constructor(v) {
      super();
      __publicField(this, "_value");
      this._value = v;
    }
    execute() {
      return this._value;
    }
  }
  class OpAExpr extends Expr {
    constructor(a) {
      super();
      __publicField(this, "_exprA");
      this._exprA = a;
    }
    reserve(rid, count) {
      if (this._rid < rid) {
        this._rid = rid;
        this._exprA.reserve(rid, count);
      }
    }
    clear() {
      this._exprA.clear();
    }
  }
  class AssignExpr extends OpAExpr {
    constructor(name2, a) {
      super(a);
      __publicField(this, "_name");
      __publicField(this, "_buf");
      this._name = name2;
      this._buf = [];
    }
    execute(index) {
      if (!this._buf[index] || isNaN(this._buf[index])) this.assign(index);
      return this._buf[index];
    }
    getName() {
      return this._name;
    }
    assign(index) {
      this._buf[index] = this._exprA.execute(index);
      if (ExprEnv.get().getFirstIndex() >= 0) {
        if (isNaN(this._buf[index]) && !isNaN(this._buf[index - 1]))
          throw this._name + ".assign(" + index + "): NaN";
      }
    }
    reserve(rid, count) {
      if (this._rid < rid) {
        for (let c = count; c > 0; c--) {
          this._buf.push(NaN);
        }
      }
      super.reserve(rid, count);
    }
    clear() {
      super.clear();
      this._buf = [];
    }
  }
  class OutputExpr extends AssignExpr {
  }
  class OpABCDExpr extends Expr {
    constructor(a, b, c, d) {
      super();
      __publicField(this, "_exprA");
      __publicField(this, "_exprB");
      __publicField(this, "_exprC");
      __publicField(this, "_exprD");
      this._exprA = a;
      this._exprB = b;
      this._exprC = c;
      this._exprD = d;
    }
    reserve(rid, count) {
      if (this._rid < rid) {
        this._rid = rid;
        this._exprA.reserve(rid, count);
        this._exprB.reserve(rid, count);
        this._exprC.reserve(rid, count);
        this._exprD.reserve(rid, count);
      }
    }
    clear() {
      this._exprA.clear();
      this._exprB.clear();
      this._exprC.clear();
      this._exprD.clear();
    }
  }
  class SarExpr extends OpABCDExpr {
    constructor() {
      super(...arguments);
      __publicField(this, "_buf", []);
      __publicField(this, "_range", -1);
      __publicField(this, "_min");
      __publicField(this, "_step");
      __publicField(this, "_max");
    }
    execute(index) {
      let i2;
      if (this._range < 0) {
        this._range = this._exprA.execute(0);
        this._min = this._exprB.execute(0);
        this._step = this._exprC.execute(0);
        this._max = this._exprD.execute(0);
      }
      const data = this._buf[index] || {};
      const exprEnv = ExprEnv.get();
      const first = exprEnv.getFirstIndex();
      if (first < 0) {
        data.longPos = true;
        data.sar = exprEnv.getDataSource().getDataAt(index).low;
        data.ep = exprEnv.getDataSource().getDataAt(index).high;
        data.af = 0.02;
      } else {
        let high = exprEnv.getDataSource().getDataAt(index).high;
        let low = exprEnv.getDataSource().getDataAt(index).low;
        const prev = this._buf[index - 1];
        data.sar = prev.sar + prev.af * (prev.ep - prev.sar);
        if (prev.longPos) {
          data.longPos = true;
          if (high > prev.ep) {
            data.ep = high;
            data.af = Math.min(prev.af + this._step, this._max);
          } else {
            data.ep = prev.ep;
            data.af = prev.af;
          }
          if (data.sar > low) {
            data.longPos = false;
            i2 = index - this._range + 1;
            for (i2 = Math.max(i2, first); i2 < index; i2++) {
              const h = exprEnv.getDataSource().getDataAt(i2).high;
              if (high < h) high = h;
            }
            data.sar = high;
            data.ep = low;
            data.af = 0.02;
          }
        } else {
          data.longPos = false;
          if (low < prev.ep) {
            data.ep = low;
            data.af = Math.min(prev.af + this._step, this._max);
          } else {
            data.ep = prev.ep;
            data.af = prev.af;
          }
          if (data.sar < high) {
            data.longPos = true;
            i2 = index - this._range + 1;
            for (i2 = Math.max(i2, first); i2 < index; i2++) {
              const l = exprEnv.getDataSource().getDataAt(i2).low;
              if (low > l) low = l;
            }
            data.sar = low;
            data.ep = high;
            data.af = 0.02;
          }
        }
      }
      return data.sar;
    }
    reserve(rid, count) {
      if (this._rid < rid) {
        for (let c = count; c > 0; c--) this._buf.push({ longPos: true, sar: NaN, ep: NaN, af: NaN });
      }
      super.reserve(rid, count);
    }
    clear() {
      super.clear();
      this._range = -1;
    }
  }
  class Indicator {
    constructor() {
      __publicField(this, "_rid");
      __publicField(this, "_params");
      __publicField(this, "_assigns");
      __publicField(this, "_outputs");
      this._rid = 0;
      this._params = [];
      this._assigns = [];
      this._outputs = [];
    }
    get exprEnv() {
      return ExprEnv.get();
    }
    get outputs() {
      return this._outputs;
    }
    addParameter(expr) {
      this._params.push(expr);
    }
    addAssign(expr) {
      this._assigns.push(expr);
    }
    addOutput(expr) {
      this._outputs.push(expr);
    }
    getParameterCount() {
      return this._params.length;
    }
    getParameterAt(index) {
      return this._params[index];
    }
    getOutputCount() {
      return this._outputs.length;
    }
    getOutputAt(index) {
      return this._outputs[index];
    }
    clear() {
      this.exprEnv.setFirstIndex(-1);
      let i2, cnt;
      cnt = this._assigns.length;
      for (i2 = 0; i2 < cnt; i2++) {
        this._assigns[i2].clear();
      }
      cnt = this._outputs.length;
      for (i2 = 0; i2 < cnt; i2++) {
        this._outputs[i2].clear();
      }
    }
    reserve(count) {
      this._rid++;
      let i2, cnt;
      cnt = this._assigns.length;
      for (i2 = 0; i2 < cnt; i2++) {
        this._assigns[i2].reserve(this._rid, count);
      }
      cnt = this._outputs.length;
      for (i2 = 0; i2 < cnt; i2++) {
        this._outputs[i2].reserve(this._rid, count);
      }
    }
    execute(ds, index) {
      if (index < 0) return;
      this.exprEnv.setDataSource(ds);
      ExprEnv.set(this.exprEnv);
      try {
        let i2, cnt;
        cnt = this._assigns.length;
        for (i2 = 0; i2 < cnt; i2++) {
          this._assigns[i2].assign(index);
        }
        cnt = this._outputs.length;
        for (i2 = 0; i2 < cnt; i2++) {
          this._outputs[i2].assign(index);
        }
        if (this.exprEnv.getFirstIndex() < 0) this.exprEnv.setFirstIndex(index);
      } catch (e) {
        if (this.exprEnv.getFirstIndex() >= 0) {
          throw e;
        }
      }
    }
    getParameters() {
      const params = [];
      let i2;
      const cnt = this._params.length;
      for (i2 = 0; i2 < cnt; i2++) params.push(this._params[i2].getValue());
      return params;
    }
    setParameters(params) {
      if (params instanceof Array && params.length == this._params.length) {
        for (const i2 in this._params) this._params[i2].setValue(params[i2]);
      }
    }
  }
  class Sar extends Indicator {
    constructor() {
      super();
      const N = new ConstExpr(5);
      const MIN = new ConstExpr(0.02);
      const STEP = new ConstExpr(0.02);
      const MAX = new ConstExpr(0.2);
      this.addOutput(new OutputExpr("sar", new SarExpr(N, MIN, STEP, MAX)));
    }
  }
  const sar = (inputs) => {
    const ds = new DataSource(
      inputs.map((d) => {
        return d.customValues;
      })
    );
    ExprEnv.set(new ExprEnv(ds));
    const indicator = new Sar();
    const count = ds.getDataCount();
    indicator.clear();
    indicator.reserve(count);
    for (let i2 = 0; i2 < count; i2++) {
      indicator.execute(ds, i2);
    }
    const outputCount = indicator.getOutputCount();
    const output = /* @__PURE__ */ Object.create(null);
    for (let i2 = 0; i2 < outputCount; i2++) {
      const out = indicator.getOutputAt(i2);
      output[out.getName()] = out._buf.slice();
    }
    const ret = inputs.map((d, index) => {
      const data = /* @__PURE__ */ Object.create(null);
      data.time = d.time;
      const arr = output["sar"];
      if (isFinite(arr[index])) {
        if (!data.study) {
          data.study = /* @__PURE__ */ Object.create(null);
        }
        data.study["plot"] = arr[index];
      }
      return data;
    });
    return ret;
  };
  class AbsExpr extends OpAExpr {
    execute(index) {
      return Math.abs(this._exprA.execute(index));
    }
  }
  class CloseExpr extends Expr {
    execute(index) {
      return ExprEnv.get().getDataSource().getDataAt(index).close;
    }
  }
  class OpABExpr extends Expr {
    constructor(a, b) {
      super();
      __publicField(this, "_exprA");
      __publicField(this, "_exprB");
      this._exprA = a;
      this._exprB = b;
    }
    reserve(rid, count) {
      if (this._rid < rid) {
        this._rid = rid;
        this._exprA.reserve(rid, count);
        this._exprB.reserve(rid, count);
      }
    }
    clear() {
      this._exprA.clear();
      this._exprB.clear();
    }
  }
  class DivExpr extends OpABExpr {
    execute(index) {
      const a = this._exprA.execute(index);
      const b = this._exprB.execute(index);
      if (a == 0) return a;
      if (b == 0) return a > 0 ? 1e7 : -1e7;
      return a / b;
    }
  }
  class RangeExpr extends OpABExpr {
    constructor(a, b) {
      super(a, b);
      __publicField(this, "_buf");
      __publicField(this, "_range");
      this._range = -1;
      this._buf = [];
    }
    execute(index) {
      if (this._range < 0) this.initRange();
      const rA = this._buf[index].resultA = this._exprA.execute(index);
      const r = this._buf[index].result = this.calcResult(index, rA);
      return r;
    }
    getRange() {
      return this._range;
    }
    initRange() {
      this._range = this._exprB.execute(0);
    }
    reserve(rid, count) {
      if (this._rid < rid) {
        for (let c = count; c > 0; c--) this._buf.push({ resultA: NaN, result: NaN });
      }
      super.reserve(rid, count);
    }
    clear() {
      super.clear();
      this._range = -1;
      this._buf = [];
    }
  }
  class HhvExpr extends RangeExpr {
    calcResult(index, resultA) {
      if (this._range == 0) return NaN;
      const first = ExprEnv.get().getFirstIndex();
      if (first < 0) return resultA;
      if (index > first) {
        const n = this._range;
        let result = resultA;
        const start2 = index - n + 1;
        let i2 = Math.max(first, start2);
        for (; i2 < index; i2++) {
          const p = this._buf[i2];
          if (result < p.resultA) result = p.resultA;
        }
        return result;
      } else {
        return resultA;
      }
    }
  }
  class LlvExpr extends RangeExpr {
    calcResult(index, resultA) {
      if (this._range == 0) return NaN;
      const first = ExprEnv.get().getFirstIndex();
      if (first < 0) return resultA;
      if (index > first) {
        const n = this._range;
        let result = resultA;
        const start2 = index - n + 1;
        let i2 = Math.max(first, start2);
        for (; i2 < index; i2++) {
          const p = this._buf[i2];
          if (result > p.resultA) result = p.resultA;
        }
        return result;
      } else {
        return resultA;
      }
    }
  }
  class MaExpr extends RangeExpr {
    calcResult(index, resultA) {
      if (this._range == 0) return NaN;
      const first = ExprEnv.get().getFirstIndex();
      if (first < 0) return resultA;
      if (index > first) {
        let n = this._range;
        if (n >= index + 1 - first) {
          n = index + 1 - first;
          return this._buf[index - 1].result * (1 - 1 / n) + resultA / n;
        }
        return this._buf[index - 1].result + (resultA - this._buf[index - n].resultA) / n;
      } else {
        return resultA;
      }
    }
  }
  class OPManyExpr extends Expr {
    constructor(...exprs) {
      super();
      __publicField(this, "_exprs");
      this._exprs = exprs;
    }
    reserve(rid, count) {
      if (this._rid < rid) {
        this._rid = rid;
        this._exprs.forEach((e) => e.reserve(rid, count));
      }
    }
    clear() {
      this._exprs.forEach((e) => e.clear());
    }
  }
  class MaxExpr extends OPManyExpr {
    execute(index) {
      const vals = this._exprs.map((e) => e.execute(index));
      return Math.max.apply(null, vals);
    }
  }
  class MulExpr extends OpABExpr {
    execute(index) {
      return this._exprA.execute(index) * this._exprB.execute(index);
    }
  }
  class ParameterExpr extends Expr {
    constructor(name2, minValue, maxValue, defaultValue) {
      super();
      __publicField(this, "_name");
      __publicField(this, "_minValue");
      __publicField(this, "_maxValue");
      __publicField(this, "_defaultValue");
      __publicField(this, "_value");
      this._name = name2;
      this._minValue = minValue;
      this._maxValue = maxValue;
      this._value = this._defaultValue = defaultValue;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    execute(index) {
      return this._value;
    }
    getMinValue() {
      return this._minValue;
    }
    getMaxValue() {
      return this._maxValue;
    }
    getDefaultValue() {
      return this._defaultValue;
    }
    getValue() {
      return this._value;
    }
    setValue(v) {
      if (v == 0) this._value = 0;
      else if (v < this._minValue) this._value = this._minValue;
      else if (v > this._maxValue) this._value = this._maxValue;
      else this._value = v;
    }
  }
  class RefExpr extends OpABExpr {
    constructor() {
      super(...arguments);
      __publicField(this, "_offset", -1);
    }
    execute(index) {
      if (this._offset < 0) {
        this._offset = this._exprB.execute(index);
        if (this._offset < 0) throw "offset < 0";
      }
      index -= this._offset;
      if (index < 0) throw "index < 0";
      const result = this._exprA.execute(index);
      if (isNaN(result)) throw "NaN";
      return result;
    }
  }
  class SmaExpr extends RangeExpr {
    constructor(a, b, c) {
      super(a, b);
      __publicField(this, "_exprC");
      __publicField(this, "_mul");
      this._exprC = c;
    }
    initRange() {
      super.initRange();
      this._mul = this._exprC.execute(0);
    }
    calcResult(index, resultA) {
      if (this._range == 0) return NaN;
      const first = ExprEnv.get().getFirstIndex();
      if (first < 0) return resultA;
      if (index > first) {
        let n = this._range;
        if (n > index + 1 - first) n = index + 1 - first;
        return ((n - 1) * this._buf[index - 1].result + resultA * this._mul) / n;
      }
      return resultA;
    }
  }
  class SubExpr extends OpABExpr {
    execute(index) {
      return this._exprA.execute(index) - this._exprB.execute(index);
    }
  }
  class StochRSI extends Indicator {
    constructor() {
      super();
      const N = new ParameterExpr("N", 3, 100, 14);
      const M = new ParameterExpr("M", 3, 100, 14);
      const P1 = new ParameterExpr("P1", 2, 50, 3);
      const P2 = new ParameterExpr("P2", 2, 50, 3);
      this.addParameter(N);
      this.addParameter(M);
      this.addParameter(P1);
      this.addParameter(P2);
      const LC = new AssignExpr("LC", new RefExpr(new CloseExpr(), new ConstExpr(1)));
      this.addAssign(LC);
      const CLOSE_LC = new AssignExpr("CLOSE_LC", new SubExpr(new CloseExpr(), LC));
      this.addAssign(CLOSE_LC);
      const RSI2 = new AssignExpr(
        "RSI",
        new MulExpr(
          new DivExpr(
            new SmaExpr(new MaxExpr(CLOSE_LC, new ConstExpr(0)), N, new ConstExpr(1)),
            new SmaExpr(new AbsExpr(CLOSE_LC), N, new ConstExpr(1))
          ),
          new ConstExpr(100)
        )
      );
      this.addAssign(RSI2);
      const STOCHRSI2 = new OutputExpr(
        "k",
        new MulExpr(
          new DivExpr(
            new MaExpr(new SubExpr(RSI2, new LlvExpr(RSI2, M)), P1),
            new MaExpr(new SubExpr(new HhvExpr(RSI2, M), new LlvExpr(RSI2, M)), P1)
          ),
          new ConstExpr(100)
        )
      );
      this.addOutput(STOCHRSI2);
      this.addOutput(new OutputExpr("d", new MaExpr(STOCHRSI2, P2)));
    }
  }
  const stochrsi = (inputs) => {
    const ds = new DataSource(
      inputs.map((d) => {
        return d.customValues;
      })
    );
    ExprEnv.set(new ExprEnv(ds));
    const indicator = new StochRSI();
    const count = ds.getDataCount();
    indicator.clear();
    indicator.reserve(count);
    for (let i2 = 0; i2 < count; i2++) {
      indicator.execute(ds, i2);
    }
    const outputCount = indicator.getOutputCount();
    const output = /* @__PURE__ */ Object.create(null);
    for (let i2 = 0; i2 < outputCount; i2++) {
      const out = indicator.getOutputAt(i2);
      output[out.getName()] = out._buf.slice();
    }
    const ret = inputs.map((d, index) => {
      const data = /* @__PURE__ */ Object.create(null);
      data.time = d.time;
      const slowK = output["k"];
      const slowD = output["d"];
      if (isFinite(slowK[index])) {
        if (!data.study) {
          data.study = /* @__PURE__ */ Object.create(null);
        }
        data.study["k"] = slowK[index];
      }
      if (isFinite(slowD[index])) {
        if (!data.study) {
          data.study = /* @__PURE__ */ Object.create(null);
        }
        data.study["d"] = slowD[index];
      }
      return data;
    });
    return ret;
  };
  class EmaExpr extends RangeExpr {
    constructor() {
      super(...arguments);
      __publicField(this, "_alpha");
    }
    initRange() {
      super.initRange();
      this._alpha = 2 / (this._range + 1);
    }
    calcResult(index, resultA) {
      if (this._range == 0) return NaN;
      const first = ExprEnv.get().getFirstIndex();
      if (first < 0) return resultA;
      if (index > first) {
        const prev = this._buf[index - 1];
        return this._alpha * (resultA - prev.result) + prev.result;
      }
      return resultA;
    }
  }
  class Trix extends Indicator {
    constructor() {
      super();
      const N = new ParameterExpr("N", 2, 100, 18);
      this.addParameter(N);
      const MTR = new AssignExpr(
        "MTR",
        new EmaExpr(new EmaExpr(new EmaExpr(new CloseExpr(), N), N), N)
      );
      this.addAssign(MTR);
      const TRIX2 = new OutputExpr(
        "trix",
        new MulExpr(
          new DivExpr(
            new SubExpr(MTR, new RefExpr(MTR, new ConstExpr(1))),
            new RefExpr(MTR, new ConstExpr(1))
          ),
          new ConstExpr(1e4)
        )
      );
      this.addOutput(TRIX2);
    }
  }
  const trix = (inputs) => {
    const ds = new DataSource(
      inputs.map((d) => {
        return d.customValues;
      })
    );
    ExprEnv.set(new ExprEnv(ds));
    const indicator = new Trix();
    const count = ds.getDataCount();
    indicator.clear();
    indicator.reserve(count);
    for (let i2 = 0; i2 < count; i2++) {
      indicator.execute(ds, i2);
    }
    const outputCount = indicator.getOutputCount();
    const output = /* @__PURE__ */ Object.create(null);
    for (let i2 = 0; i2 < outputCount; i2++) {
      const out = indicator.getOutputAt(i2);
      output[out.getName()] = out._buf.slice();
    }
    const ret = inputs.map((d, index) => {
      const data = /* @__PURE__ */ Object.create(null);
      data.time = d.time;
      const arr = output["trix"];
      if (isFinite(arr[index])) {
        if (!data.study) {
          data.study = /* @__PURE__ */ Object.create(null);
        }
        data.study["plot"] = arr[index];
      }
      return data;
    });
    return ret;
  };
  const vr = (inputs) => {
    const params = [26, 6];
    const result = [];
    let uvs = 0;
    let dvs = 0;
    let pvs = 0;
    let vrSum = 0;
    inputs.forEach((bar, i2) => {
      var _a;
      const output = /* @__PURE__ */ Object.create(null);
      output.time = bar.time;
      const close = bar.customValues.close;
      const preClose = (inputs[i2 - 1] ?? bar).customValues.close;
      const volume = bar.customValues.volume ?? 0;
      if (close > preClose) {
        uvs += volume;
      } else if (close < preClose) {
        dvs += volume;
      } else {
        pvs += volume;
      }
      if (i2 >= params[0] - 1) {
        const halfPvs = pvs / 2;
        output.study = {};
        if (dvs + halfPvs === 0) {
          output.study.vr = 0;
        } else {
          output.study.vr = (uvs + halfPvs) / (dvs + halfPvs) * 100;
        }
        vrSum += output.study.vr;
        if (i2 >= params[0] + params[1] - 2) {
          output.study.ma = vrSum / params[1];
          vrSum -= ((_a = result[i2 - (params[1] - 1)].study) == null ? void 0 : _a.vr) ?? 0;
        }
        const agoData = inputs[i2 - (params[0] - 1)];
        const agoPreData = inputs[i2 - params[0]] ?? agoData;
        const agoClose = agoData.customValues.close;
        const agoVolume = agoData.customValues.volume ?? 0;
        if (agoClose > agoPreData.customValues.close) {
          uvs -= agoVolume;
        } else if (agoClose < agoPreData.customValues.close) {
          dvs -= agoVolume;
        } else {
          pvs -= agoVolume;
        }
      }
      result.push(output);
    });
    return result;
  };
  var api = /* @__PURE__ */ Object.freeze({
    __proto__: null,
    ao,
    bbi,
    bias,
    brar,
    calcTA,
    cr,
    dmi,
    ema,
    emv,
    initTA,
    kdj,
    ma,
    mtm,
    psy,
    pvt,
    sar,
    stochrsi,
    trix,
    vr
  });
  expose(api);
  var __viteBrowserExternal = /* @__PURE__ */ Object.freeze({
    __proto__: null
  });
})();
