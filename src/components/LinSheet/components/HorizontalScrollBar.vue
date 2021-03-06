<template>
  <div
    id="horizontal-scroll-bar"
    ref="HorizontalScrollBar"
    :style="`left: ${ columnStartWidth * ratio }px;`"
  >
    <div class="prev-btn"></div>
    <div class="scroll">
      <div class="thumb" :style="`width: ${ thumbWidth }px; margin-left: ${ scrollX }px;`"></div>
    </div>
    <div class="next-btn"></div>
  </div>
</template>

<script>
import { addEventListener } from '@/utils/event'

export default {
  name: 'HorizontalScrollBar',
  components: {
  },
  props: {
    // 是否是选择当前表格
    isSelectCurrentSheet: {
      type: Boolean,
      required: true
    },
    // 列开始宽度
    columnStartWidth: {
      type: Number,
      required: true
    },
    // 内容宽度
    columnTotalWidth: {
      type: Number,
      required: true
    },
    // 窗口宽度
    windowWidth: {
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
      scrollX: 0
    }
  },
  computed: {
    // 键宽度
    // 可视宽度 / 缩放比例 / 内容宽度
    thumbWidth: function () {
      // 可视宽度
      const visibleWidth = this.windowWidth - 16
      // 滚动条宽度
      const scrollWidth = this.windowWidth - 32 - (this.columnStartWidth * this.ratio) - 16
      // 可视内容宽度 与 内容宽度的比例
      const widthRatio = visibleWidth / this.ratio / this.columnTotalWidth
      return scrollWidth * widthRatio
    }
  },
  mounted () {
    this.$refs.HorizontalScrollBar.addEventListener('mousedown', (e) => {
      this.lock = false
    })
    this.$refs.HorizontalScrollBar.addEventListener('ondragenter', (e) => {
      e.preventDefault()
    })
    this.$refs.HorizontalScrollBar.addEventListener('ondragover', (e) => {
      e.preventDefault()
    })
  },
  methods: {
    initEventListener () {
      addEventListener(window, 'mousemove', this.handleMouseMove)
      addEventListener(window, 'mouseup', this.handleMouseUp)
      // 滚动
      addEventListener(window, 'mousewheel', this.handleMouseWheel)
    },
    handleMouseMove (e) {
      const canOffsetValue = this.windowWidth - 32 - this.thumbWidth - (this.columnStartWidth * this.ratio) - 16
      const visibleWidth = this.windowWidth - 16
      if (this.lock === false) {
        // 判断滚动条是否在最左边和最右边
        if (this.scrollX <= 0 && e.movementX < 0) {
          return
        } else if (this.scrollX >= canOffsetValue && e.movementX > 0) {
          return
        }
        // 鼠标移动量
        // TODO: firefox浏览器在高DPI的情况下会不正常
        let movementX = (e.movementX / this.canvasRatio) * this.ratio
        if (this.scrollX + movementX < 0) {
          movementX = -this.scrollX
        } else if (this.scrollX + movementX > canOffsetValue) {
          movementX = canOffsetValue - this.scrollX
        }
        this.scrollX += movementX
        window.dispatchEvent(new CustomEvent('updateScrollX', {
          bubbles: true,
          detail: {
            scrollX: this.scrollX,
            movementX: movementX,
            sheetMoveRatio: (this.columnTotalWidth - (visibleWidth / this.ratio)) / canOffsetValue
          }
        }))
        // 内容宽度 - 可视区域(已减去左偏移) = 需偏移空间量
        // 需偏移空间量 / 滚动条可偏移量
      }
    },
    handleMouseUp (e) {
      this.lock = true
    },
    handleMouseWheel (e) {
      if (e.shiftKey && this.isSelectCurrentSheet && !e.ctrlKey) {
        const stepWidth = -25 * e.delta // 步宽
        // 可偏置值
        const canOffsetValue = this.windowWidth - 32 - this.thumbWidth - (this.columnStartWidth * this.ratio) - 16
        const visibleWidth = this.windowWidth - 16
        // 判断滚动条是否在最左边和最右边
        if (this.scrollX <= 0 && stepWidth < 0) {
          return
        } else if (this.scrollX >= canOffsetValue && stepWidth > 0) {
          return
        }
        // 移动量
        let movementX = (stepWidth / this.canvasRatio) * this.ratio
        if (this.scrollX + movementX <= 0) {
          movementX = -this.scrollX
        } else if (this.scrollX + movementX >= canOffsetValue) {
          movementX = canOffsetValue - this.scrollX
        }
        this.scrollX += movementX
        window.dispatchEvent(new CustomEvent('updateScrollX', {
          bubbles: true,
          detail: {
            scrollX: this.scrollX,
            movementX: movementX,
            sheetMoveRatio: (this.columnTotalWidth - (visibleWidth / this.ratio)) / canOffsetValue
          }
        }))
      }
    }
  }
}
</script>

<style lang="scss">
#horizontal-scroll-bar {
  z-index: 2;
  position: absolute;
  right: 16px;
  bottom: 0;
  border-top: 1px solid #e2e6ed;
  height: 16px;
  background: #f2f4f7;

  .prev-btn {
    position: absolute;
    width: 16px;
    height: 16px;
    left: 0;

    &::after {
      position: absolute;
      content: "";
      width: 0;
      height: 0;
      left: 5px;
      bottom: 4px;
      border-color: transparent #c0c6cf transparent transparent;
      border-style: solid solid solid none;
      border-width: 4px 4px 4px 0
    }
  }

  .scroll {
    position: absolute;
    left: 16px;
    right: 16px;
    padding-top: 4px;
    padding-bottom: 4px;

    .thumb {
      position: relative;
      height: 8px;
      border-radius: 4px;
      background: #c0c6cf;
    }
  }

  .next-btn {
    position: absolute;
    width: 16px;
    height: 16px;
    right: 0;

    &::after {
      position: absolute;
      content: "";
      width: 0;
      height: 0;
      right: 5px;
      bottom: 4px;
      border-color: transparent transparent transparent #c0c6cf;
      border-style: solid none solid solid;
      border-width: 4px 0 4px 4px
    }
  }
}
</style>
