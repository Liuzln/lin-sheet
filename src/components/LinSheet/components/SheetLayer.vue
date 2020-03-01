<template>
  <canvas
    ref="sheetCanvas"
    class="sheet-canvas"
    :width="canvasWidth"
    :height="canvasHeight"
    @click="handleClickSheet"
    :style="`width: ${ styleWidth }px; height: ${ styleHeight }px`"
  />
</template>

<script>
import { evaluate } from '@/utils/math'
import { drawVerticalLine, drawHorizontalLine, drawFillRect, drawText } from '@/utils/canvas'
import { getColunmsName } from '@/utils/sheet'
import { addEventListener } from '@/utils/event'

export default {
  name: 'editLayer',
  props: {
    width: {
      type: Number,
      required: true
    },
    height: {
      type: Number,
      required: true
    },
    // 浏览器缩放比例
    browserRatio: {
      type: Number,
      required: true
    },
    // 行
    rows: {
      type: Array,
      required: true
    },
    rowStartY: {
      type: Number,
      default: 24.25
    },
    // 列
    columns: {
      type: Array,
      required: true
    },
    // 列的开始位置
    columnsStartX: {
      type: Number,
      default: 45.25
    },
    // 列的高度
    columnHeight: {
      type: Number,
      default: 24
    }
  },
  data () {
    return {
      sheetCanvasContext: '',
      canvasWidth: '', // canvas 宽度
      canvasHeight: '', // canvas 高度
      canvasRatio: this.browserRatio // canvas 缩放比例
    }
  },
  computed: {
    styleHeight: function () {
      let height = this.height
      if (this.canvasHeight && this.browserRatio) {
        height = evaluate(`${this.canvasHeight} / ${this.browserRatio}`)
      }
      return height
    },
    styleWidth: function () {
      let width = this.width
      if (this.canvasWidth && this.browserRatio) {
        width = evaluate(`${this.canvasWidth} / ${this.browserRatio}`)
      }
      return width
    },
    ration: function () {
      return evaluate(`${this.canvasRatio} / ${this.browserRatio}`)
    }
  },
  mounted () {
    this.sheetCanvasContext = this.$refs.sheetCanvas.getContext('2d')
    this.drawSheet()

    // Ctrl+鼠标滚轮缩放
    addEventListener(window, 'mousewheel', (e) => {
      // 监测滚轮事件中是否按下了Ctrl键
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        // 滚轮下滚
        if (e.delta === -2) {
          if (this.ration > 0.5) {
            this.canvasRatio = evaluate(`${this.canvasRatio} - 0.2`)
            this.drawSheet()
          }
        }
        // 滚轮上滚
        if (e.delta === 2) {
          if (this.ration < 3) {
            this.canvasRatio = evaluate(`${this.canvasRatio} + 0.2`)
            this.drawSheet()
          }
        }
      }
    }, { passive: false })

    // 键盘快捷键缩放
    addEventListener(window, 'keydown', (e) => {
      // 按下Ctrl 以及以下任意一键：+ - 或 0
      if (e.ctrlKey) {
        // Ctrl +
        if (e.code === 'Equal') {
          e.preventDefault()
          if (this.ration < 3) {
            this.canvasRatio = evaluate(`${this.canvasRatio} + 0.2`)
            this.drawSheet()
          }
        }
        // Ctrl -
        if (e.code === 'Minus') {
          e.preventDefault()
          if (this.ration > 0.5) {
            this.canvasRatio = evaluate(`${this.canvasRatio} - 0.2`)
            this.drawSheet()
          }
        }
        // Ctrl 0
        if (e.code === 'Digit0') {
          e.preventDefault()
          this.canvasRatio = this.browserRatio
          this.drawSheet()
        }
      }
    }, { passive: false })
  },
  methods: {
    // 绘制表格
    drawSheet () {
      this.canvasWidth = 0
      this.canvasHeight = 0
      setTimeout(() => {
        this.canvasWidth = evaluate(`${this.width} * ${this.browserRatio}`)
        this.canvasHeight = evaluate(`${this.height} * ${this.browserRatio}`)
        setTimeout(() => {
          this.drawColumnHeader()
          this.drawRowHeader()
        }, 0)
      }, 0)
    },
    // 渐变色
    getLinearGradient () {
      const ctx = this.sheetCanvasContext
      const linearGradient = ctx.createLinearGradient(45, 0, 45, 24)
      linearGradient.addColorStop(0, 'RGB(242, 244, 247)')
      linearGradient.addColorStop(1, 'RGB(215, 218, 222)')
      return linearGradient
    },
    // 绘制列头部
    drawColumnHeader () {
      const ctx = this.sheetCanvasContext
      let lineStartX = this.columnsStartX
      // 绘制列头左上角
      drawFillRect({
        ctx: ctx,
        startX: 0,
        startY: 0,
        width: evaluate(`${lineStartX} * ${this.canvasRatio}`),
        height: evaluate(`${this.columnHeight} * ${this.canvasRatio}`),
        color: 'RGB(242, 244, 247)'
      })
      drawVerticalLine({
        ctx: ctx,
        startX: evaluate(`${lineStartX} * ${this.canvasRatio}`),
        startY: 0,
        length: evaluate(`${this.columnHeight} * ${this.canvasRatio}`),
        color: this.getLinearGradient()
      })
      // 绘制列标题
      for (let i = 0, len = this.columns.length; i < len; i++) {
        const column = this.columns[i]
        // 绘制背景色块
        drawFillRect({
          ctx: ctx,
          startX: evaluate(`${lineStartX} * ${this.canvasRatio}`),
          startY: 0,
          width: evaluate(`${column.width} * ${this.canvasRatio}`),
          height: evaluate(`${this.columnHeight} * ${this.canvasRatio}`),
          color: 'RGB(242, 244, 247)'
        })
        // 绘制分割线段
        drawVerticalLine({
          ctx: ctx,
          startX: evaluate(`${lineStartX} * ${this.canvasRatio}`),
          startY: 0,
          length: evaluate(`${this.columnHeight} * ${this.canvasRatio}`),
          color: 'RGB(215, 218, 222)'
        })
        // 绘制列标题
        drawText({
          ctx: ctx,
          x: evaluate(`(${lineStartX} + (${column.width} * 0.5)) * ${this.canvasRatio}`),
          y: evaluate(`13 * ${this.canvasRatio}`),
          content: getColunmsName(i),
          fontSize: `${evaluate(`12 * ${this.canvasRatio}`)}px`,
          fontFamily: 'bold 黑体',
          fontColor: 'RGB(0, 0, 0)'
        })
        lineStartX = evaluate(`${lineStartX} + ${column.width}`)
      }
    },
    // 绘制行头部
    drawRowHeader () {
      const ctx = this.sheetCanvasContext
      let startY = this.rowStartY
      for (let i = 0, len = this.rows.length; i < len; i++) {
        const row = this.rows[i]
        drawFillRect({
          ctx: ctx,
          startX: 0,
          startY: evaluate(`${startY} * ${this.canvasRatio}`),
          width: evaluate(`${this.columnsStartX} * ${this.canvasRatio}`),
          height: evaluate(`${row.height} * ${this.canvasRatio}`),
          color: 'RGB(242, 244, 247)'
        })
        drawVerticalLine({
          ctx: ctx,
          startX: evaluate(`${this.columnsStartX} * ${this.canvasRatio}`),
          startY: evaluate(`${startY} * ${this.canvasRatio}`),
          length: evaluate(`${row.height} * ${this.canvasRatio}`),
          color: 'RGB(215, 218, 222)'
        })
        drawHorizontalLine({
          ctx: ctx,
          startX: 0,
          startY: evaluate(`${startY} * ${this.canvasRatio}`),
          length: evaluate(`${this.columnsStartX} * ${this.canvasRatio}`),
          color: 'RGB(215, 218, 222)'
        })
        drawText({
          ctx: ctx,
          x: evaluate(`${24} * ${this.canvasRatio}`),
          y: evaluate(`(${startY} + (${row.height} * ${0.5})) * ${this.canvasRatio}`),
          content: evaluate(`${i} + 1`),
          fontSize: `${evaluate(`12 * ${this.canvasRatio}`)}px`,
          fontFamily: 'bold 黑体',
          fontColor: 'RGB(0, 0, 0)'
        })
        startY = evaluate(`${startY} + ${row.height}`)
      }
    },
    handleClickSheet (e) {
      console.log(e)
      const offsetX = e.offsetX
      const offsetY = e.offsetY
      console.log(offsetX)
      console.log(offsetY)
    }
  }
}
</script>

<style lang="scss">
.sheet-canvas {
  overflow: hidden;
}
</style>
