<template>
  <div id="lin-sheet">
    <!-- 水平滚动条 -->
    <horizontal-scroll-bar
      :canvasRatio="canvasRatio"
      :columnStartWidth="columnStartWidth"
      :columnTotalWidth="columnTotalWidth"
      :windowWidth="sheetWidth"
      :ratio="ratio"
    />
    <!-- 垂直滚动条 -->
    <!-- <vertical-scroll-bar
      :height="sheetHeight"
    /> -->
    <!-- 修改层 -->
    <edit-layer
      :ratio="ratio"
      :browserRatio="browserRatio"
      :canvasRatio="canvasRatio"
      :rows="rows"
      :columns="columns"
      :tableData="tableData"
      :customTableDataKey="customTableDataKey"
      :currentSelect="currentSelect"
      @changeTableData="handleChangeTableData"
      @deleteTableData="handleDeleteTableData"
    />
    <!-- 选择层 -->
    <div
      :id="tableKey"
      class="edit-layer"
      @click="handleClickSheet"
    />
    <!-- 单元格绘制 -->
    <sheet-layer
      ref="sheetLayer"
      :width="sheetWidth"
      :height="sheetHeight"
      :columnTotalWidth="columnTotalWidth"
      :rowTotalHeight="rowTotalHeight"
      :browserRatio="browserRatio"
      :canvasRatio="canvasRatio"
      :ratio="ratio"
      :columnStartWidth="columnStartWidth"
      :rowHeaderHeight="rowHeaderHeight"
      :rows="rows"
      :isCustomRowName="isCustomRowName"
      :customRowNameKey="customRowNameKey"
      :columns="columns"
      :isCustomColumnName="isCustomColumnName"
      :customColumnNameKey="customColumnNameKey"
      :tableData="tableData"
      :customTableDataKey="customTableDataKey"
      :isBindZoomEventListener="isBindZoomEventListener"
    />
  </div>
</template>

<script>
// TODO: 根据坐标改变光标
// TODO: 根据点击位置选择单元格、列、行
// import debounce from 'lodash.debounce'
import uuidv1 from 'uuid/v1'
import { evaluate } from '@/utils/math'
import { addEventListener } from '@/utils/event'

import SheetLayer from './components/SheetLayer.vue'
import EditLayer from './components/EditLayer.vue'
import HorizontalScrollBar from './components/HorizontalScrollBar.vue'
// import VerticalScrollBar from './components/VerticalScrollBar.vue'

export default {
  name: 'LinSheet',
  components: {
    SheetLayer,
    EditLayer,
    HorizontalScrollBar
    // VerticalScrollBar
  },
  props: {
    // 当前选择的表格Key 用于多个表格时判断目前点击哪个表格
    currentSelectTableKey: {
      type: String
    },
    // 表格Key
    tableKey: {
      type: String,
      default: uuidv1()
    },
    // 行头部高度
    rowHeaderHeight: {
      type: Number,
      default: 24
    },
    // 表格行
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
    // 列开始宽度
    columnStartWidth: {
      type: Number,
      default: 45
    },
    // 表格字段
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
    // 表格数据
    tableData: {
      type: Array,
      required: true
    },
    // 自定义表格数据Key
    customTableDataKey: {
      type: String,
      default: 'content'
    },
    // 表格宽度
    width: {
      type: Number,
      required: true
    },
    // 表格高度
    height: {
      type: Number,
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
      canvasRatio: 0,
      sheetWidth: this.width, // 表格宽度
      sheetHeight: this.height, // 表格高度
      // 当前选择
      currentSelect: {
        startColumnIndex: 1, // 列开始索引 单选时用的坐标
        endColumnIndex: 1, // 列结束索引 多选时用的坐标
        startRowIndex: 1, // 行开始索引 单选时用的坐标
        endRowIndex: 1, // 行结束索引 多选时用的坐标
        isEditMode: false, // 单元格编辑模式
        cellX: this.columnStartWidth, // 单元格左上角位置X轴
        cellY: this.rowHeaderHeight, // 单元格左上角位置Y轴
        clickX: 0, // 鼠标点击位置
        clickY: 0 // 鼠标点击位置
      }
    }
  },
  computed: {
    // 浏览器缩放比例
    browserRatio: function () {
      return window.devicePixelRatio || 1
    },
    table: function () {
      const { rows, columns, tableData } = this
      return {
        rows,
        columns,
        tableData
      }
    },
    ratio: function () {
      let ratio = 1
      if (this.canvasRatio && this.browserRatio) {
        ratio = evaluate(`${this.canvasRatio} / ${this.browserRatio}`)
      }
      return ratio
    },
    // 列总宽度
    columnTotalWidth: function () {
      let totalWidth = this.columnStartWidth
      for (let i = 0, len = this.columns.length; i < len; i++) {
        const column = this.columns[i]
        totalWidth += column.width
      }
      return totalWidth
    },
    // 行总高度
    rowTotalHeight: function () {
      let totalHeight = this.rowHeaderHeight
      for (let i = 0, len = this.rows.length; i < len; i++) {
        const row = this.rows[i]
        totalHeight += row.height
      }
      return totalHeight
    }
  },
  watch: {
    'browserRatio': function (value) {
      this.canvasRatio = value
    },
    'currentSelectTableKey': function () {
      this.currentSelect = {
        startColumnIndex: 0,
        endColumnIndex: 0,
        startRowIndex: 0,
        endRowIndex: 0,
        isEditMode: false,
        cellX: 0,
        cellY: 0,
        clickX: 0,
        clickY: 0
      }
    },
    'table': function () {
      this.$refs.sheetLayer.drawSheet()
    },
    'ratio': function (newValue, oldValue) {
      this.currentSelect.cellX = this.currentSelect.cellX / oldValue * newValue
      this.currentSelect.cellY = this.currentSelect.cellY / oldValue * newValue
    }
  },
  mounted () {
    this.canvasRatio = window.devicePixelRatio || 1
    window.addEventListener('resize', this.handleWindowResizeChange)
    // 判断是否监听缩放事件
    if (this.isBindZoomEventListener) {
      // Ctrl+鼠标滚轮缩放
      addEventListener(window, 'mousewheel', (e) => {
        console.log(e)
        // 监测滚轮事件中是否按下了Ctrl键
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault()
          // 滚轮下滚
          if (e.delta < 0) {
            if (this.ratio > 0.5) {
              this.canvasRatio = evaluate(`${this.canvasRatio} - 0.2`)
            }
          }
          // 滚轮上滚
          if (e.delta > 0) {
            if (this.ratio < 3) {
              this.canvasRatio = evaluate(`${this.canvasRatio} + 0.2`)
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
            if (this.ratio < 3) {
              this.canvasRatio = evaluate(`${this.canvasRatio} + 0.2`)
            }
          }
          // Ctrl -
          if (e.code === 'Minus') {
            e.preventDefault()
            if (this.ratio > 0.5) {
              this.canvasRatio = evaluate(`${this.canvasRatio} - 0.2`)
            }
          }
          // Ctrl 0
          if (e.code === 'Digit0') {
            e.preventDefault()
            this.canvasRatio = this.browserRatio
          }
        }
      }, { passive: false })
    }
  },
  methods: {
    // 处理窗口大小变化
    handleWindowResizeChange () {
      console.log('handleWindowResizeChange')
      this.$refs.sheetLayer.drawSheet()
    },
    // 处理点击表格
    handleClickSheet (e) {
      // console.log(event)
      // 鼠标点击位置
      this.currentSelect.clickX = e.offsetX
      this.currentSelect.clickY = e.offsetY
      let currentX = 0
      let columnIndex = 0
      let isRepeatClickColumn = false
      let currrntY = 0
      let rowIndex = 0
      let isRepeatClickRow = false
      // 判断点击X轴上的哪一个
      for (let len = this.columns.length; columnIndex <= len; columnIndex++) {
        let columnWidth = 0
        if (columnIndex === 0) {
          columnWidth = this.columnStartWidth * this.ratio
        } else {
          columnWidth = this.columns[columnIndex - 1].width * this.ratio
        }
        currentX += columnWidth
        if (currentX >= this.currentSelect.clickX) {
          if (this.currentSelect.startColumnIndex === columnIndex) {
            isRepeatClickColumn = true
          } else {
            this.currentSelect.startColumnIndex = columnIndex
            if (this.currentSelect.startColumnIndex > 0) {
              this.currentSelect.cellX = currentX - columnWidth
            } else {
              this.currentSelect.cellX = 0
            }
          }
          break
        }
      }
      // 判断点击Y轴上的哪一个
      for (let len = this.rows.length; rowIndex <= len; rowIndex++) {
        let rowHeight = 0
        if (rowIndex === 0) {
          rowHeight = this.rowHeaderHeight * this.ratio
        } else {
          rowHeight = this.rows[rowIndex - 1].height * this.ratio
        }
        currrntY += rowHeight
        if (currrntY >= this.currentSelect.clickY) {
          if (this.currentSelect.startRowIndex === rowIndex) {
            isRepeatClickRow = true
          } else {
            this.currentSelect.startRowIndex = rowIndex
            if (this.currentSelect.startRowIndex > 0) {
              this.currentSelect.cellY = currrntY - rowHeight
            } else {
              this.currentSelect.cellY = 0
            }
          }
          break
        }
      }
      // 判断是否为二次点击
      if (isRepeatClickColumn && isRepeatClickRow) {
        this.currentSelect.isEditMode = true
      } else {
        this.currentSelect.isEditMode = false
      }
    },
    // 处理修改表格数据
    handleChangeTableData ({ columnIndex, rowIndex, type, textIndex, data }) {
      console.log(columnIndex)
      console.log(rowIndex)
      console.log(type)
      console.log(textIndex)
      console.log(data)
      if (type === 'content') {
        console.log(data)
        console.log('customTableDataKey:', this.customTableDataKey)
        const cell = this.tableData[rowIndex - 1][columnIndex - 1]
        const content = cell[this.customTableDataKey]
        if (cell.contentType === 'text') {
          if (content.length > 0) {
            cell[this.customTableDataKey] = content.slice(0, textIndex) + data + content.slice(textIndex)
          } else {
            cell[this.customTableDataKey] += data
          }
        }
      }
      this.$refs.sheetLayer.drawSheet()
    },
    // 处理删除表格数据
    handleDeleteTableData ({ columnIndex, rowIndex }) {
      console.log(columnIndex)
      console.log(rowIndex)
      this.tableData[rowIndex - 1][columnIndex - 1].content = this.tableData[rowIndex - 1][columnIndex - 1].content.substr(0, this.tableData[rowIndex - 1][columnIndex - 1].content.length - 1)
      this.$refs.sheetLayer.drawSheet()
    }
  }
}
</script>

<style lang="scss">
#lin-sheet {
  position: relative;
  width: 100%;
  height: 100%;
}

.edit-layer {
  z-index: 1;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
