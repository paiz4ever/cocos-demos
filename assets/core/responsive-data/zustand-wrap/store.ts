import { EditBox, Label, Node, RichText } from "cc";
import { StoreApi, createStore } from "zustand/vanilla";
import { subscribeWithSelector } from "zustand/middleware";
// 此处导入会出现process is not defined报错，确定引入了plugin/declare-process插件
import { produce } from "immer";
import {
  ExtractTargetKey,
  StateCreator,
  WithSelectorSubscribe,
  Write,
} from "./zustand-wrap";

export function defineStore<T = {}>(creator: StateCreator<T>) {
  // TODO 替选择器实现数组监听（底层使用Object.is，使用shallow）
  const store = createStore(immer(subscribeWithSelector(creator)));
  const setState = store.setState;
  store.setState = function (partial: any, replace) {
    const nextState =
      typeof partial === "function" ? produce(partial) : partial;
    return setState(nextState, replace);
  };
  return new StoreWrapper<T>(store) as StoreWrapper<T> &
    T &
    WithSelectorSubscribe<StoreApi<T>>;
}

function warn(...arg) {
  console.warn("[Store]", ...arg);
}

function match(o: any, ...arg: any) {
  const isNode = o instanceof Node;
  for (let st of arg) {
    if (isNode) {
      let c = o.getComponent(st);
      if (c) return c;
    } else {
      if (o instanceof st) return o;
    }
  }
  return null;
}

function getStringObject(o: any, k: string) {
  let keys = k.split(".");
  keys.forEach((key, i) => {
    o = o[key];
  });
  return o;
}

function setStringObject(o: any, k: string, value: any) {
  let keys = k.split(".");
  keys.forEach((key, i) => {
    if (i === keys.length - 1) {
      o[key] = value;
      return;
    }
    o = o[key];
  });
}

function selector2fn(
  selector: string | ((state: any) => any)
): (state: any) => any {
  if (typeof selector === "string") {
    return (state) => getStringObject(state, selector);
  }
  return selector;
}

function selector2attr(selector: string | ((state: any) => any), state: any) {
  if (typeof selector === "string") return selector;
  let attr = "";
  function proxy(state) {
    return new Proxy(state, {
      get(target, key) {
        attr += (attr ? "." : "") + (key as string);
        if (typeof target[key] === "object" && target[key] !== null) {
          return proxy(target[key]);
        }
        return Reflect.get(target, key);
      },
      set(target, key, value) {
        return Reflect.set(target, key, value);
      },
    });
  }
  let p = proxy(state);
  selector(p);
  return attr;
}

function immer(config) {
  return (set, get, api) =>
    config(
      (partial, replace) => {
        const nextState =
          typeof partial === "function" ? produce(partial) : partial;
        return set(nextState, replace);
      },
      get,
      api
    );
}

class StoreWrapper<T = {}> {
  constructor(private store: WithSelectorSubscribe<StoreApi<T>>) {
    Object.keys(store).forEach((key) => {
      this[key] = store[key];
    });
    Object.keys(store.getState()).forEach((key) => {
      if (key in this) {
        warn(
          `conflict key in store: ${key}, you can only read it by 【store.getState().${key}】`
        );
        return;
      }
      Object.defineProperty(this, key, {
        get() {
          return store.getState()[key];
        },
        set(value) {
          warn(
            `you can only set store state by【store.setState({ ${key}: ${value} })】or【store.setState((state) => { state.${key} = ${value} })】`
          );
        },
      });
    });
  }

  /**
   * 绑定文本组件（Label，RichText，EditBox）
   * @param selector 状态选择器
   * @description
   * - 使用该装饰器绑定后，不应该使用`[组件.string]`的方法改变文本。使用`[store.setState]`
   * - `EditBox`支持双向数据绑定
   * @example
   * ```ts
   * const store = defineStore({
   *   count: 0,
   * })
   *
   * class Test extends Component {
   *   `@store.text("count")`
   *   `@property(Label)`
   *   label: Label
   * }
   * ```
   */
  text(
    selector:
      | (
          | ExtractTargetKey<number | string, T>
          | `${ExtractTargetKey<object, T>}.${string}`
          | `${string}\${${
              | ExtractTargetKey<number | string, T>
              | `${ExtractTargetKey<object, T>}.${string}`}}${string}`
        )
      | ((state: T) => number | string)
  ) {
    return (target, name) => {
      const { onLoad } = target;
      const that = this;
      let unsub: () => void;
      target.onLoad = function () {
        if (!this[name]) return;
        let c = match(this[name], Label, RichText, EditBox);
        if (!c) {
          warn("text decorator only support Label/RichText/EditBox");
          return;
        }
        // 双向绑定
        if (c instanceof EditBox) {
          c.node.on(EditBox.EventType.TEXT_CHANGED, (editBox: EditBox) => {
            that.store.setState((state) => {
              setStringObject(
                state,
                selector2attr(selector, state),
                editBox.string
              );
            });
          });
        }
        const { onEnable, onDisable } = c;
        c.onEnable = function () {
          unsub = that.store.subscribe(
            selector2fn(selector),
            (selectedState) => {
              c.string = String(selectedState);
            },
            {
              fireImmediately: true,
            }
          );
          onEnable?.call(this);
        };
        c.onDisable = function () {
          unsub?.();
          unsub = null;
          onDisable?.call(this);
        };
        onLoad?.call(this);
      };
    };
  }
}
