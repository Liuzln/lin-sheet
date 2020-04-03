<template>
  <canvas
    ref="sheetCanvas"
    class="sheet-canvas"
    :width="canvasWidth"
    :height="canvasHeight"
    :style="`width: ${ styleWidth }px; height: ${ styleHeight }px`"
  />
</template>

<script>
import { evaluate } from '@/utils/math'
import {
  clearContext, drawVerticalLine, drawHorizontalLine,
  drawFillRect, drawText
} from '@/utils/canvas'
import { getColumnsName } from '@/utils/sheet'
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
    // 是否使用自定义行名称
    isCustomRowName: {
      type: Boolean,
      default: false
    },
    // 自定义列名称的Key
    customRowNameKey: {
      type: String,
      default: 'name'
    },
    // 行的开始位置
    rowHeaderHeight: {
      type: Number,
      required: true
    },
    // 列
    columns: {
      type: Array,
      required: true
    },
    // 是否使用自定义列名称
    isCustomColumnName: {
      type: Boolean,
      default: false
    },
    // 自定义列名称的Key
    customColumnNameKey: {
      type: String,
      default: 'name'
    },
    // 列的开始位置
    columnStartWidth: {
      type: Number,
      required: true
    },
    // 列的高度
    columnHeight: {
      type: Number,
      default: 24
    },
    // 表格数据
    tableData: {
      type: Array,
      required: true
    },
    // 自定义表格数据Key
    customTableDataKey: {
      type: String,
      required: true
    },
    // 是否绑定缩放事件监听器
    isBindZoomEventListener: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      sheetCanvasContext: '',
      canvasRatio: this.browserRatio // canvas 缩放比例
    }
  },
  computed: {
    // canvas 宽度
    canvasWidth: function () {
      return evaluate(`${this.width} * ${this.browserRatio}`)
    },
    // canvas 高度
    canvasHeight: function () {
      return evaluate(`${this.height} * ${this.browserRatio}`)
    },
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

    // 判断是否监听缩放事件
    if (this.isBindZoomEventListener) {
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
    }
  },
  methods: {
    // 绘制表格
    drawSheet () {
      this.$nextTick(() => {
        // 清空画板
        clearContext(this.sheetCanvasContext, this.canvasWidth, this.canvasHeight)
        // 重新绘制
        this.drawColumnHeader()
        this.drawRowHeader()
        this.drawCell()
      })
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
      let lineStartX = this.columnStartWidth
      // 绘制列头左上角
      drawFillRect({
        ctx: ctx,
        startX: 0,
        startY: 0,
        width: lineStartX * this.canvasRatio,
        height: this.rowHeaderHeight * this.canvasRatio,
        color: 'RGB(242, 244, 247)'
      })
      drawVerticalLine({
        ctx: ctx,
        startX: lineStartX * this.canvasRatio,
        startY: 0,
        length: this.rowHeaderHeight * this.canvasRatio,
        color: this.getLinearGradient()
      })
      // 绘制列标题
      for (let i = 0, len = this.columns.length; i < len; i++) {
        const column = this.columns[i]
        // 绘制背景色块
        drawFillRect({
          ctx: ctx,
          startX: lineStartX * this.canvasRatio,
          startY: 0,
          width: column.width * this.canvasRatio,
          height: this.rowHeaderHeight * this.canvasRatio,
          color: 'RGB(242, 244, 247)'
        })
        // 绘制分割线段
        drawVerticalLine({
          ctx: ctx,
          startX: lineStartX * this.canvasRatio,
          startY: 0,
          length: this.rowHeaderHeight * this.canvasRatio,
          color: 'RGB(215, 218, 222)'
        })
        // 绘制列标题
        let content = ''
        if (this.isCustomColumnName) {
          content = column[this.customColumnNameKey]
        } else {
          content = getColumnsName(i)
        }
        drawText({
          ctx: ctx,
          x: (lineStartX + (column.width * 0.5)) * this.canvasRatio,
          y: this.rowHeaderHeight / 2 * this.canvasRatio,
          content: content,
          fontSize: `${12 * this.canvasRatio}px`,
          fontFamily: 'bold 黑体',
          fontColor: 'RGB(0, 0, 0)'
        })
        lineStartX = lineStartX + column.width
      }
    },
    // 绘制行头部
    drawRowHeader () {
      const ctx = this.sheetCanvasContext
      let startY = this.rowHeaderHeight
      for (let i = 0, len = this.rows.length; i < len; i++) {
        const row = this.rows[i]
        drawFillRect({
          ctx: ctx,
          startX: 0,
          startY: startY * this.canvasRatio,
          width: this.columnStartWidth * this.canvasRatio,
          height: row.height * this.canvasRatio,
          color: 'RGB(242, 244, 247)'
        })
        drawVerticalLine({
          ctx: ctx,
          startX: this.columnStartWidth * this.canvasRatio,
          startY: startY * this.canvasRatio,
          length: row.height * this.canvasRatio,
          color: 'RGB(215, 218, 222)'
        })
        drawHorizontalLine({
          ctx: ctx,
          startX: 0,
          startY: startY * this.canvasRatio,
          length: this.columnStartWidth * this.canvasRatio,
          color: 'RGB(215, 218, 222)'
        })
        let content = ''
        if (this.isCustomRowName) {
          content = row[this.customRowNameKey]
        } else {
          content = i + 1
        }
        drawText({
          ctx: ctx,
          x: this.columnStartWidth / 2 * this.canvasRatio,
          y: (startY + (row.height * 0.5)) * this.canvasRatio,
          content: content,
          fontSize: `${12 * this.canvasRatio}px`,
          fontFamily: 'bold 黑体',
          fontColor: 'RGB(0, 0, 0)'
        })
        startY = startY + row.height
      }
    },
    // 绘制单元格
    async drawCell () {
      const ctx = this.sheetCanvasContext
      let startX = this.columnStartWidth
      let startY = this.rowHeaderHeight
      for (let rowIndex = 0, len1 = this.tableData.length; rowIndex < len1; rowIndex++) {
        const row = this.tableData[rowIndex]
        const rowHeight = this.rows[rowIndex].height
        for (let cloumnIndex = 0, len2 = row.length; cloumnIndex < len2; cloumnIndex++) {
          const cell = row[cloumnIndex]
          const columnWidth = this.columns[cloumnIndex].width
          drawFillRect({
            ctx: ctx,
            startX: startX * this.canvasRatio,
            startY: startY * this.canvasRatio,
            width: columnWidth * this.canvasRatio,
            height: rowHeight * this.canvasRatio,
            color: 'RGB(255, 255, 255)'
          })
          drawVerticalLine({
            ctx: ctx,
            startX: (startX + columnWidth) * this.canvasRatio,
            startY: startY * this.canvasRatio,
            length: rowHeight * this.canvasRatio,
            color: 'RGB(215, 218, 222)'
          })
          drawHorizontalLine({
            ctx: ctx,
            startX: startX * this.canvasRatio,
            startY: (startY + rowHeight) * this.canvasRatio,
            length: columnWidth * this.canvasRatio,
            color: 'RGB(215, 218, 222)'
          })
          // 默认左对齐
          let textX = startX * this.canvasRatio
          if (cell.format.textAlign === 'start' || cell.format.textAlign === 'left') {
            // 左对齐 将文字X轴坐标放到单元格左边
            textX = (startX + 6) * this.canvasRatio
          } else if (cell.format.textAlign === 'center') {
            // 水平居中 将文字X轴坐标放到单元格中间
            textX = (startX + (columnWidth / 2)) * this.canvasRatio
          } else if (cell.format.textAlign === 'end' || cell.format.textAlign === 'right') {
            // 右对齐 将文字X轴坐标放到单元格右边
            textX = (startX + columnWidth - 6) * this.canvasRatio
          }
          drawText({
            ctx: ctx,
            x: textX,
            y: (startY + (rowHeight * 0.5)) * this.canvasRatio,
            content: cell[this.customTableDataKey],
            fontSize: `${cell.format.fontSize * this.canvasRatio}px`,
            fontFamily: cell.format.fontFamily,
            fontColor: cell.format.fontColor,
            textAlign: cell.format.textAlign,
            textBaseline: cell.format.textBaseline
          })
          startX = startX + columnWidth
        }
        startX = this.columnStartWidth
        startY = startY + rowHeight
      }
    }
  }
}
</script>

<style lang="scss">
.sheet-canvas {
  overflow: hidden;
}
</style>
