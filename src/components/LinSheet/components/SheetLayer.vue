<template>
  <canvas
    ref="sheetCanvas"
    class="sheet-canvas"
    :width="canvasWidth"
    :height="canvasHeight"
    @click="handleClickSheet"
    :style="`width: ${canvasWidth / ratio}px; height: ${canvasHeight / ratio}px`"
  />
</template>

<script>

import { drawVerticalLine, drawHorizontalLine, drawRect, drawText } from '@/utils/canvas'
import { colunmsName } from '@/utils/const'

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
    // 行
    rows: {
      type: Array,
      required: true
    },
    rowStartY: {
      type: Number,
      default: 24.5
    },
    // 列
    columns: {
      type: Array,
      required: true
    },
    // 列的开始位置
    columnsStartX: {
      type: Number,
      default: 45.5
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
      canvasWidth: '',
      canvasHeight: '',
      ratio: ''
    }
  },
  mounted () {
    this.sheetCanvasContext = this.$refs.sheetCanvas.getContext('2d')
    this.drawSheet()
  },
  methods: {
    // 计算比例
    computeRatio () {
      const devicePixelRatio = window.devicePixelRatio || 1
      const backingStoreRatio = this.sheetCanvasContext.webkitBackingStorePixelRatio ||
                        this.sheetCanvasContext.mozBackingStorePixelRatio ||
                        this.sheetCanvasContext.msBackingStorePixelRatio ||
                        this.sheetCanvasContext.oBackingStorePixelRatio ||
                        this.sheetCanvasContext.backingStorePixelRatio || 1
      return devicePixelRatio / backingStoreRatio
    },
    // 绘制表格
    drawSheet () {
      this.ratio = this.computeRatio() // 计算比例
      this.canvasWidth = this.width * this.ratio
      this.canvasHeight = this.height * this.ratio
      setTimeout(() => {
        this.sheetCanvasContext.scale(this.ratio, this.ratio)
        setTimeout(() => {
          this.drawColumn()
          this.drawRow()
        }, 0)
      }, 0)
    },
    // TODO: 根据坐标改变光标
    // TODO: 根据点击位置选择单元格、列、行
    getLinearGradient () {
      const ctx = this.sheetCanvasContext
      const linearGradient = ctx.createLinearGradient(45, 0, 45, 24)
      linearGradient.addColorStop(0, 'RGB(242, 244, 247)')
      linearGradient.addColorStop(1, 'RGB(215, 218, 222)')
      return linearGradient
    },
    drawColumn () {
      const ctx = this.sheetCanvasContext
      let lineStartX = this.columnsStartX
      drawRect({
        ctx: ctx,
        startX: 0,
        startY: 0,
        width: lineStartX,
        height: this.columnHeight,
        color: 'RGB(242, 244, 247)'
      })
      drawVerticalLine({
        ctx: ctx,
        startX: lineStartX,
        startY: 0,
        length: this.columnHeight,
        color: this.getLinearGradient()
      })
      for (let i = 0, len = this.columns.length; i < len; i++) {
        const column = this.columns[i]
        drawRect({
          ctx: ctx,
          startX: lineStartX,
          startY: 0,
          width: column.width,
          height: this.columnHeight,
          color: 'RGB(242, 244, 247)'
        })
        drawVerticalLine({
          ctx: ctx,
          startX: lineStartX,
          startY: 0,
          length: 100000,
          color: 'RGB(215, 218, 222)'
        })

        let content = ''
        if (i < 26) {
          content = colunmsName[i]
        } else {
          let temp = i - 26
          let count = 0
          // console.log('temp:', temp)
          while (temp >= 26) {
            temp -= 26
            count++
          }
          content = colunmsName[count]
          content += colunmsName[i % 26]
        }
        drawText({
          ctx: ctx,
          x: lineStartX + (column.width * 0.5),
          y: 13,
          content: content,
          fontSize: '12px',
          fontFamily: 'bold 黑体',
          fontColor: 'RGB(0, 0, 0)'
        })
        lineStartX = lineStartX + column.width
      }
    },
    drawRow () {
      const ctx = this.sheetCanvasContext
      let startY = this.rowStartY
      for (let i = 0, len = this.rows.length; i < len; i++) {
        const row = this.rows[i]
        drawRect({
          ctx: ctx,
          startX: 0,
          startY: startY,
          width: this.columnsStartX,
          height: row.height,
          color: 'RGB(242, 244, 247)'
        })
        drawVerticalLine({
          ctx: ctx,
          startX: this.columnsStartX,
          startY: startY,
          length: row.height,
          color: 'RGB(215, 218, 222)'
        })
        drawHorizontalLine({
          ctx: ctx,
          startX: 0,
          startY: startY,
          length: 100000,
          color: 'RGB(215, 218, 222)'
        })
        drawText({
          ctx: ctx,
          x: 24,
          y: startY + (row.height * 0.5),
          content: i + 1,
          fontSize: '12px',
          fontFamily: 'bold 黑体',
          fontColor: 'RGB(0, 0, 0)'
        })
        startY = startY + row.height
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
