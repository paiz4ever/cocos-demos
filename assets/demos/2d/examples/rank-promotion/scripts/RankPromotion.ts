import {
  _decorator,
  CCInteger,
  Color,
  Component,
  ScrollView,
  Sprite,
} from "cc";
import { playRankPromotion } from "../../../../../packages/2d/examples/rank-promotion";
const { ccclass, property } = _decorator;

@ccclass("RankPromotion")
export class RankPromotion extends Component {
  @property({ type: CCInteger, tooltip: "起点序号" })
  fromIndex: number;
  @property({ type: CCInteger, tooltip: "终点序号" })
  toIndex: number;

  private scrollView: ScrollView;

  protected onLoad(): void {
    this.scrollView = this.getComponent(ScrollView);
    this.scrollView.content.children[this.fromIndex].children[0].getComponent(
      Sprite
    ).color = Color.GREEN;
    playRankPromotion({
      sv: this.scrollView,
      fromIndex: this.fromIndex,
      toIndex: this.toIndex,
    });
  }
}
