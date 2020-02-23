<template>
  <canvas
    ref="sheetCanvas"
    class="sheet-canvas"
    :width="innerWidth"
    :height="innerHeight"
    @click="handleClickSheet"
  />
</template>

<script>
import debounce from 'lodash.debounce'
import { drawVerticalLine, drawHorizontalLine, drawRect, drawText } from '@/utils/canvas'
import { getInnerWidth, getInnerHeight } from '@/utils/util'
import { colunmsName } from '@/utils/const'

export default {
  name: 'editLayer',
  data () {
    return {
      innerWidth: getInnerWidth(),
      innerHeight: getInnerHeight(),
      option: {
        // colunm
        offsetLeft: 45.5,
        // Row
        offsetTop: 24.5,
        columnHeight: 24
      },
      sheetCanvasContext: '',
      generateRowNumber: 100,
      generateColumnNumber: 100,
      rows: [],
      columns: []
    }
  },
  mounted () {
    this.init()
    this.sheetCanvasContext = this.$refs.sheetCanvas.getContext('2d')
    window.addEventListener('resize', debounce(() => {
      const imageData = this.sheetCanvasContext.getImageData(0, 0, this.innerWidth, this.innerHeight)
      this.innerWidth = getInnerWidth()
      this.innerHeight = getInnerHeight()
      this.sheetCanvasContext.putImageData(imageData, 0, 0)
    }, 20))
    this.$nextTick(() => {
      this.drawColumn()
      this.drawRow()
    })
  },
  methods: {
    init () {
      for (let i = 0, len = this.generateRowNumber; i < len; i++) {
        this.rows.push({
          id: i,
          height: 25
        })
      }
      for (let i = 0, len = this.generateColumnNumber; i < len; i++) {
        this.columns.push({
          id: i,
          width: 90
        })
      }
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
      let lineStartX = this.option.offsetLeft
      drawRect({
        ctx: ctx,
        startX: 0,
        startY: 0,
        width: lineStartX,
        height: this.option.columnHeight,
        color: 'RGB(242, 244, 247)'
      })
      drawVerticalLine({
        ctx: ctx,
        startX: lineStartX,
        startY: 0,
        length: this.option.columnHeight,
        color: this.getLinearGradient()
      })
      for (let i = 0, len = this.columns.length; i < len; i++) {
        const column = this.columns[i]
        drawRect({
          ctx: ctx,
          startX: lineStartX,
          startY: 0,
          width: column.width,
          height: this.option.columnHeight,
          color: 'RGB(242, 244, 247)'
        })
        drawVerticalLine({
          ctx: ctx,
          startX: lineStartX,
          startY: 0,
          length: 100000000,
          color: 'RGB(215, 218, 222)'
        })

        let content = ''
        if (i < 26) {
          content = colunmsName[i]
        } else {
          let temp = i - 26
          let count = 0
          console.log('temp:', temp)
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
      let startY = this.option.offsetTop
      for (let i = 0, len = this.rows.length; i < len; i++) {
        const row = this.rows[i]
        drawRect({
          ctx: ctx,
          startX: 0,
          startY: startY,
          width: this.option.offsetLeft,
          height: row.height,
          color: 'RGB(242, 244, 247)'
        })
        drawVerticalLine({
          ctx: ctx,
          startX: this.option.offsetLeft,
          startY: startY,
          length: row.height,
          color: 'RGB(215, 218, 222)'
        })
        drawHorizontalLine({
          ctx: ctx,
          startX: 0,
          startY: startY,
          length: 100000000,
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
