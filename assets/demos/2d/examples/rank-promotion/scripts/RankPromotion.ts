import {
  _decorator,
  CCInteger,
  Color,
  Component,
  Input,
  Layout,
  log,
  Node,
  ScrollView,
  Size,
  Sprite,
  tween,
  UITransform,
  v2,
  v3,
  Vec3,
  warn,
} from "cc";
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
    if (
      !this.scrollView.content.children[this.fromIndex] ||
      !this.scrollView.content.children[this.toIndex]
    ) {
      warn(`fromIndex or toIndex is invalid`);
      return;
    }
    this.scrollView.content.children[this.fromIndex].children[0].getComponent(
      Sprite
    ).color = Color.GREEN;
    let layoutC = this.scrollView.content.getComponent(Layout);
    layoutC && (layoutC.enabled = false);
    this.scrollView.touchScrollLock = true;
    this.scrollView.scrollToItem(this.fromIndex, 0.1);
    this.scheduleOnce(() => this.play(), 0.5);
  }

  play() {
    const target = this.scrollView.content.children[this.fromIndex];
    target.setSiblingIndex(Infinity);
    const others = this.scrollView.content.children.slice(
      Math.min(this.toIndex, this.fromIndex),
      Math.max(this.toIndex, this.fromIndex)
    );
    const { width: targetWidth, height: targetHeight } =
      target.getComponent(UITransform);
    let othersOffsetX = 0,
      othersOffsetY = 0,
      targetOffsetX = 0,
      targetOffsetY = 0;

    if (this.scrollView.horizontal) {
      othersOffsetX = targetWidth * Math.sign(this.fromIndex - this.toIndex);
      targetOffsetX =
        others[0]
          .getComponent(UITransform)
          .getOuterDistance(others[others.length - 1].getComponent(UITransform))
          .x * Math.sign(this.toIndex - this.fromIndex);
    } else if (this.scrollView.vertical) {
      othersOffsetY = targetHeight * Math.sign(this.toIndex - this.fromIndex);
      targetOffsetY =
        others[0]
          .getComponent(UITransform)
          .getOuterDistance(others[others.length - 1].getComponent(UITransform))
          .y * Math.sign(this.fromIndex - this.toIndex);
    }
    tween(target)
      .to(0.25, {
        scale: target.getScale().multiplyScalar(1.5),
      })
      .call(() => {
        this.scrollView.scrollToOffset(
          v2(targetOffsetX, -targetOffsetY),
          1.5,
          false
        );
        let othersOffsetVec = v3(othersOffsetX, othersOffsetY);
        others.forEach((node: Node) => {
          tween(node)
            .by(1.5, {
              position: othersOffsetVec,
            })
            .start();
        });
      })
      .by(1.5, {
        position: v3(targetOffsetX, targetOffsetY),
      })
      .to(0.25, {
        scale: Vec3.ONE,
      })
      .start();
  }
}
