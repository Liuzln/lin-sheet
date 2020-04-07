<template>
  <div
    id="horizontal-scroll-bar"
    ref="HorizontalScrollBar"
    :style="`left: ${ columnStartWidth * ratio }px;`"
  >
    <div class="prev-btn"></div>
    <div class="scroll">
      <div class="thumb" :style="`width: ${ thumbWidth }px; margin-left: ${ currentX }px;`"></div>
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
      currentX: 0
    }
  },
  computed: {
    // 窗口宽度和内容宽度的比例
    // 可视宽度 / 内容宽度 =
    thumbWidth: function () {
      // 滚动条宽度
      const scrollWidth = this.windowWidth - 32
      // 可视内容宽度 与 内容宽度的比例
      const ratio = ((this.windowWidth / this.ratio) / this.columnTotalWidth)
      return scrollWidth * ratio
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
    addEventListener(window, 'mousemove', (e) => {
      e.preventDefault()
      const canOffsetValue = this.windowWidth - 32 - this.thumbWidth
      if (this.lock === false) {
        // 判断滚动条是否在最左边和最右边
        if (this.currentX <= 0 && e.movementX < 0) {
          return
        } else if (this.currentX >= canOffsetValue && e.movementX > 0) {
          return
        }
        // 鼠标移动量
        let movementX = (e.movementX / this.canvasRatio) * this.ratio
        if (this.currentX + movementX < 0) {
          movementX = -this.currentX
        } else if (this.currentX + movementX > canOffsetValue) {
          movementX = canOffsetValue - this.currentX
        }
        this.currentX += movementX
        window.dispatchEvent(new CustomEvent('changeOffsetX', {
          bubbles: true,
          detail: {
            currtneX: this.currentX,
            movementX: movementX,
            sheetMoveRatio: (this.columnTotalWidth - (this.windowWidth / this.ratio)) / canOffsetValue
          }
        }))
        // 内容宽度 - 可视区域(已减去左偏移) = 需偏移空间量
        // 需偏移空间量 / 滚动条可偏移量
      }
    })
    addEventListener(window, 'mouseup', (e) => {
      this.lock = true
    })
  },
  methods: {
  }
}
</script>

<style lang="scss">
#horizontal-scroll-bar {
  z-index: 2;
  position: absolute;
  right: 0;
  bottom: 0;
  border-top: 1px solid #e2e6ed;
  height: 20px;
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