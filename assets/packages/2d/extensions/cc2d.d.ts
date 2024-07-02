declare module "cc" {
  interface ScrollView {
    /** 是否禁止触摸滚动（指通过api调用的滚动） */
    touchScrollLock: boolean;
    /** 滚动到指定的item */
    scrollToItem(
      index: number,
      timeInSecond?: number,
      attenuated?: boolean
    ): void;
  }
  interface UITransform {
    /** 获取两个节点之间的边缘距离 */
    getOuterDistance(transform: UITransform): Vec2;
  }
}
