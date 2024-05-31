import { Component, Label } from "cc";
import { ExtractTargetKey } from "./zustand";

export class StorableComponent<T = any> extends Component {
  private state: T;

  protected setState(
    partial: T | Partial<T> | ((state: T) => T | Partial<T> | void),
    replace?: boolean | undefined
  ): void {}

  protected subscribe() {}
}

export function self<T>(c: typeof StorableComponent<T>) {
  return {
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
      };
    },
  };
}

interface HHH {
  ppp: number;
  aaa: string;
}
class FFF extends StorableComponent<HHH> {
  @self(FFF).text("${aaa}个")
  label: Label;
  protected onLoad(): void {
    this.setState((state) => {
      state.aaa = "aaa";
    });
  }
}
