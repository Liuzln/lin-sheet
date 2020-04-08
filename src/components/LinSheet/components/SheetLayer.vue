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
  drawVerticalLine, drawHorizontalLine,
  drawFillRect, drawText
} from '@/utils/canvas'
import { getColumnsName } from '@/utils/sheet'
import { addEventListener } from '@/utils/event'

export default {
  name: 'sheetLayer',
  props: {
    // 是否是选择当前表格
    isSelectCurrentSheet: {
      type: Boolean,
      required: true
    },
    width: {
      type: Number,
      required: true
    },
    height: {
      type: Number,
      required: true
    },
    columnTotalWidth: {
      type: Number,
      required: true
    },
    rowTotalHeight: {
      type: Number,
      required: true
    },
    // 浏览器 缩放比例
    browserRatio: {
      type: Number,
      required: true
    },
    // canvas 缩放比例
    canvasRatio: {
      type: Number,
      required: true
    },
    ratio: {
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
      offScreenCanvas: '',
      offScreenCanvasContext: '',
      scrollX: 0,
      scrollY: 0
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
    listenChange: function () {
      const { canvasRatio, columnTotalWidth, rowTotalHeight } = this
      return {
        canvasRatio,
        columnTotalWidth,
        rowTotalHeight
      }
    }
  },
  watch: {
    'listenChange': function () {
      this.refresh(true)
    }
  },
  mounted () {
    this.sheetCanvasContext = this.$refs.sheetCanvas.getContext('2d')
    addEventListener(window, 'updateScrollX', this.handleSheetScrollX)
    addEventListener(window, 'updateScrollY', this.handleSheetScrollY)
  },
  methods: {
    refresh (force) {
      // 绘制离屏数据
      this.drawOffScreenCanvas(force)
      // 根据离屏数据绘制表格
      this.drawSheet()
    },
    // 绘制离屏表格数据
    drawOffScreenCanvas (force) {
      // 在离屏 canvas 上绘制
      if ((!this.offScreenCanvas && this.columnTotalWidth > this.columnStartWidth && this.rowTotalHeight > this.rowHeaderHeight) || force) {
        this.offScreenCanvas = document.createElement('canvas')
        // 离屏渲染的宽高是内容宽高
        this.offScreenCanvas.width = this.columnTotalWidth * this.canvasRatio
        this.offScreenCanvas.height = this.rowTotalHeight * this.canvasRatio
        this.offScreenCanvasContext = this.offScreenCanvas.getContext('2d')
        // 绘制所需内容
        this.drawColumnHeader(this.offScreenCanvasContext)
        this.drawRowHeader(this.offScreenCanvasContext)
        this.drawCell(this.offScreenCanvasContext)
      }
    },
    // 绘制表格
    drawSheet () {
      // 清空画板
      // clearContext(this.sheetCanvasContext, this.canvasWidth, this.canvasHeight)
      // 根据 scrollX scrollY 裁剪所需区域，绘制到画板上
      if (this.offScreenCanvas) {
        setTimeout(() => {
          this.sheetCanvasContext.drawImage(
            this.offScreenCanvas,
            this.scrollX, this.scrollY, this.canvasWidth, this.canvasHeight,
            0, 0, this.canvasWidth, this.canvasHeight
          )
        }, 0)
      }
    },
    // 处理表格滚动
    handleSheetScrollX (e) {
      // 当鼠标向左移(即正数)，表格则是向右移动(即负数)
      // 表格偏移量 = 鼠标偏移量 * 表格缩放比例 * 内容宽度与可视宽度的比例
      // const movementX = Math.round(-e.detail.movementX * this.canvasRatio * e.detail.sheetMoveRatio)
      if (this.isSelectCurrentSheet) {
        this.scrollX = Math.round(e.detail.scrollX * this.canvasRatio * e.detail.sheetMoveRatio)
        this.drawSheet()
      }
    },
    // 处理表格滚动
    handleSheetScrollY (e) {
      // 当鼠标向左移(即正数)，表格则是向右移动(即负数)
      // 表格偏移量 = 鼠标偏移量 * 表格缩放比例 * 内容宽度与可视宽度的比例
      // const movementY = Math.round(-e.detail.movementY * this.canvasRatio * e.detail.sheetMoveRatio)
      if (this.isSelectCurrentSheet) {
        this.scrollY = Math.round(e.detail.scrollY * this.canvasRatio * e.detail.sheetMoveRatio)
        this.drawSheet()
      }
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
    drawColumnHeader (ctx) {
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
    drawRowHeader (ctx) {
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
    async drawCell (ctx) {
      let startX = this.columnStartWidth
      let startY = this.rowHeaderHeight
      for (let rowIndex = 0, len1 = this.tableData.length; rowIndex < len1; rowIndex++) {
        const row = this.tableData[rowIndex]
        const rowHeight = this.rows[rowIndex].height
        for (let cloumnIndex = 0, len2 = row.length; cloumnIndex < len2; cloumnIndex++) {
          const cell = row[cloumnIndex]
          const columnWidth = this.columns[cloumnIndex].width
          // 判断此单元格是否需要已被合并
          if (cell.attr.columnSpan > 0 && cell.attr.rowSpan > 0) {
            // 获取绘制宽度
            let drawWidth = 0
            for (let i = 0; i < cell.attr.columnSpan; i++) {
              drawWidth += this.columns[cloumnIndex + i].width
            }
            // 绘制高度
            let drawHeight = 0
            for (let i = 0; i < cell.attr.rowSpan; i++) {
              drawHeight += this.rows[rowIndex + i].height
            }
            // 绘制背景颜色
            drawFillRect({
              ctx: ctx,
              startX: startX * this.canvasRatio,
              startY: startY * this.canvasRatio,
              width: drawWidth * this.canvasRatio,
              height: drawHeight * this.canvasRatio,
              color: 'RGB(255, 255, 255)'
            })
            // 绘制右边框
            drawVerticalLine({
              ctx: ctx,
              startX: (startX + drawWidth) * this.canvasRatio,
              startY: startY * this.canvasRatio,
              length: drawHeight * this.canvasRatio,
              color: 'RGB(215, 218, 222)'
            })
            // 绘制下边框
            drawHorizontalLine({
              ctx: ctx,
              startX: startX * this.canvasRatio,
              startY: (startY + drawHeight) * this.canvasRatio,
              length: drawWidth * this.canvasRatio,
              color: 'RGB(215, 218, 222)'
            })
            // 默认左对齐
            let textX = startX * this.canvasRatio
            if (cell.format.textAlign === 'start' || cell.format.textAlign === 'left') {
              // 左对齐 将文字X轴坐标放到单元格左边
              textX = (startX + 6) * this.canvasRatio
            } else if (cell.format.textAlign === 'center') {
              // 水平居中 将文字X轴坐标放到单元格中间
              textX = (startX + (drawWidth / 2)) * this.canvasRatio
            } else if (cell.format.textAlign === 'end' || cell.format.textAlign === 'right') {
              // 右对齐 将文字X轴坐标放到单元格右边
              textX = (startX + drawWidth - 6) * this.canvasRatio
            }
            drawText({
              ctx: ctx,
              x: textX,
              y: (startY + (drawHeight * 0.5)) * this.canvasRatio,
              content: cell[this.customTableDataKey],
              fontSize: `${cell.format.fontSize * this.canvasRatio}px`,
              fontFamily: cell.format.fontFamily,
              fontColor: cell.format.fontColor,
              textAlign: cell.format.textAlign,
              textBaseline: cell.format.textBaseline
            })
          }
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
  position: relative;
  top: 0;
  left: 0;
  overflow: hidden;
}
</style>
