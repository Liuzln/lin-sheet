<template>
  <div
    id="vertical-scroll-bar"
    ref="VerticalScrollBar"
    :style="`top: ${ rowHeaderHeight * ratio }px;`"
  >
    <div class="prev-btn"></div>
    <div class="scroll">
      <div class="thumb" :style="`height: ${ thumbHeight }px; margin-top: ${ scrollY }px;`"></div>
    </div>
    <div class="next-btn"></div>
  </div>
</template>

<script>
import { addEventListener } from '@/utils/event'

export default {
  name: 'VerticalScrollBar',
  components: {
  },
  props: {
    // 是否是选择当前表格
    isSelectCurrentSheet: {
      type: Boolean,
      required: true
    },
    // 行开始高度
    rowHeaderHeight: {
      type: Number,
      required: true
    },
    // 内容高度
    rowTotalHeight: {
      type: Number,
      required: true
    },
    // 窗口高度
    windowHeight: {
      type: Number,
      required: true
    },
    canvasRatio: {
      type: Number,
      required: true
    },
    ratio: {
      type: Number,
      required: true
    }
  },
  data () {
    return {
      lock: true,
      scrollY: 0
    }
  },
  computed: {
    // 键高度
    // 可视高度 / 缩放比例 / 内容高度
    thumbHeight: function () {
      // 可视高度
      const visibleHeight = this.windowHeight - 16
      // 滚动条宽度
      const scrollHeight = this.windowHeight - 32 - (this.rowHeaderHeight * this.ratio) - 16
      // 可视内容宽度 与 内容宽度的比例
      const heightRatio = visibleHeight / this.ratio / this.rowTotalHeight
      return scrollHeight * heightRatio
    }
  },
  mounted () {
    this.$refs.VerticalScrollBar.addEventListener('mousedown', (e) => {
      this.lock = false
    })
    this.$refs.VerticalScrollBar.addEventListener('ondragenter', (e) => {
      e.preventDefault()
    })
    this.$refs.VerticalScrollBar.addEventListener('ondragover', (e) => {
      e.preventDefault()
    })
    addEventListener(window, 'mousemove', (e) => {
      e.preventDefault()
      const canOffsetValue = this.windowHeight - 32 - this.thumbHeight - (this.rowHeaderHeight * this.ratio) - 16
      const visibleHeight = this.windowHeight - 16
      if (this.lock === false) {
        // 判断滚动条是否在最左边和最右边
        if (this.scrollY <= 0 && e.movementY < 0) {
          return
        } else if (this.scrollY >= canOffsetValue && e.movementY > 0) {
          return
        }
        // 鼠标移动量
        let movementY = (e.movementY / this.canvasRatio) * this.ratio
        if (this.scrollY + movementY < 0) {
          movementY = -this.scrollY
        } else if (this.scrollY + movementY > canOffsetValue) {
          movementY = canOffsetValue - this.scrollY
        }
        this.scrollY += movementY
        window.dispatchEvent(new CustomEvent('updateScrollY', {
          bubbles: true,
          detail: {
            scrollY: this.scrollY,
            movementY: movementY,
            sheetMoveRatio: (this.rowTotalHeight - (visibleHeight / this.ratio)) / canOffsetValue
          }
        }))
      }
    })
    addEventListener(window, 'mouseup', (e) => {
      this.lock = true
    })
    // Ctrl+鼠标滚轮缩放
    addEventListener(window, 'mousewheel', (e) => {
      if (!e.shiftKey && this.isSelectCurrentSheet && !e.ctrlKey) {
        console.log(e.delta)
        const stepHeight = -25 * e.delta
        const canOffsetValue = this.windowHeight - 32 - this.thumbHeight - (this.rowHeaderHeight * this.ratio) - 16
        const visibleHeight = this.windowHeight - 16
        // 判断滚动条是否在最上面和最下面
        if (this.scrollY <= 0 && stepHeight < 0) {
          return
        } else if (this.scrollY >= canOffsetValue && stepHeight > 0) {
          return
        }
        // 移动量
        let movementY = (stepHeight / this.canvasRatio) * this.ratio
        if (this.scrollY + stepHeight < 0) {
          movementY = -this.scrollY
        } else if (this.scrollY + stepHeight > canOffsetValue) {
          movementY = canOffsetValue - this.scrollY
        }
        this.scrollY += movementY
        window.dispatchEvent(new CustomEvent('updateScrollY', {
          bubbles: true,
          detail: {
            scrollY: this.scrollY,
            movementY: movementY,
            sheetMoveRatio: (this.rowTotalHeight - (visibleHeight / this.ratio)) / canOffsetValue
          }
        }))
      }
    })
  },
  methods: {
  }
}
</script>

<style lang="scss">
#vertical-scroll-bar {
  z-index: 2;
  position: absolute;
  right: 0;
  top: 0;
  bottom: 16px;
  border-left: 1px solid #e2e6ed;
  width: 16px;
  background: #f2f4f7;

  .prev-btn {
    position: absolute;
    width: 16px;
    height: 16px;
    top: 0;

    &::after {
      position: absolute;
      content: "";
      width: 0;
      height: 0;
      top: 5px;
      left: 4px;
      border-color: transparent transparent #c0c6cf;
      border-style: none solid solid;
      border-width: 0 4px 4px;
    }
  }

  .scroll {
    position: absolute;
    top: 16px;
    bottom: 16px;
    padding-left: 4px;
    padding-right: 4px;

    .thumb {
      position: relative;
      width: 8px;
      border-radius: 4px;
      background: #c0c6cf;
    }
  }

  .next-btn {
    position: absolute;
    width: 16px;
    height: 16px;
    bottom: 0;

    &::after {
      position: absolute;
      content: "";
      width: 0;
      height: 0;
      left: 4px;
      bottom: 5px;
      border-color: #c0c6cf transparent transparent;
      border-style: solid solid none;
      border-width: 4px 4px 0;
    }
  }
}
</style>
