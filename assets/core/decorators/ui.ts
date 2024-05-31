/**
 * 按钮节流
 * @param time - 按钮防抖时间（秒）Default: 0.5s
 * @param onBlockCall - 阻塞时的回调
 */
export function btnThrottle(time?: number): DecoratorFunc;
export function btnThrottle(options: {
  time?: number;
  onBlockCall?: () => void;
}): DecoratorFunc;
export function btnThrottle(
  options:
    | number
    | {
        time?: number;
        onBlockCall?: () => void;
      }
): DecoratorFunc {
  return (target, key, descriptor: PropertyDescriptor) => {
    let func = descriptor.value;
    let isBlock = false;
    if (!options) options = 0.5;
    let time = typeof options === "number" ? options : options.time || 0.5;
    let onBlockCall = typeof options === "number" ? null : options.onBlockCall;
    descriptor.value = function (...args: any[]) {
      if (isBlock) {
        onBlockCall?.();
        return;
      }
      isBlock = true;
      const endCall = () => {
        isBlock = false;
      };
      if (this.scheduleOnce) {
        this.scheduleOnce(endCall, time);
      } else {
        setTimeout(endCall, time * 1000);
      }
      func.apply(this, args);
    };
  };
}
