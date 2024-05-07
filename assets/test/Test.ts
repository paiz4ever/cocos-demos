import { _decorator, Component, EditBox, Label, Node } from "cc";
import { defineStore } from "../core/responsive-data/zustand-wrap/main";
const { ccclass, property } = _decorator;

export const store = defineStore<{
  count: number;
  data: { count: number; ok: boolean; text1: string };
  addCount: () => void;
}>((set, get) => ({
  count: 0,
  data: {
    count: 0,
    ok: false,
    text1: "哈哈哈",
  },

  addCount: () => {
    set((state) => ({
      count: state.count + 1,
    }));
    set((state) => (state.count = 1));
  },
  addDataCount: () => {
    set((state) => ({
      data: {
        ...state.data,
        count: state.data.count + 1,
      },
    }));
  },
}));

(<any>window).store = store;

@ccclass("Test")
export class Test extends Component {
  @store.text("count")
  @property(Label)
  countLabel: Label;

  @store.input((state) => state.data.text1)
  @property(EditBox)
  editBox: EditBox;

  // @store.text((state) => state.data.count)
  // @property(Label)
  // dataCountLabel: Label;

  // @store.text((state) => state.data.count)
  @store.text("data.count")
  @property(Node)
  node1: Node;

  protected onLoad(): void {
    // window.countLabel = this.countLabel;
  }
}
