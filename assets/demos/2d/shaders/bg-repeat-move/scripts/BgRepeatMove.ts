import { _decorator, CCFloat, Component, Material, Sprite } from "cc";
const { ccclass, property } = _decorator;

@ccclass("BgRepeatMove")
export default class BgRepeatMove extends Component {
  @property({ type: CCFloat, tooltip: "移动速度" })
  speed: number = 1;

  private time = 0;
  private mtl: Material;

  start() {
    this.time = 0;
    this.mtl = this.getComponent(Sprite).getMaterialInstance(0);
    this.mtl.setProperty("speed", this.speed);
  }

  update(dt) {
    this.time += dt;
    this.mtl.setProperty("time", this.time);
  }
}
