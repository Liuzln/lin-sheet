<template>
  <div id="lin-sheet">
    <!-- 自定义层 -->
    <slot
      v-bind:columnTotalWidth="columnTotalWidth"
      v-bind:rowTotalHeight="rowTotalHeight"
      v-bind:scrollX="scrollX / canvasRatio"
      v-bind:scrollY="scrollY / canvasRatio"
    />
    <!-- 修改层 -->
    <edit-layer
      ref="EditLayer"
      class="edit-layer"
      :isSelectCurrentSheet="isSelectCurrentSheet"
      :ratio="ratio"
      :browserRatio="browserRatio"
      :canvasRatio="canvasRatio"
      :rows="rows"
      :columns="columns"
      :tableData="tableData"
      :columnStartWidth="columnStartWidth"
      :rowHeaderHeight="rowHeaderHeight"
      :customTableDataKey="customTableDataKey"
      :currentSelect="currentSelect"
      @changeTableData="handleChangeTableData"
      @deleteTableData="handleDeleteTableData"
    />
    <!-- 选择层 -->
    <div
      :id="tableKey"
      class="click-layer"
      @click="handleClickSheet"
    />
    <!-- 水平滚动条 -->
    <horizontal-scroll-bar
      v-if="columnTotalWidth > sheetWidth * canvasRatio"
      :isSelectCurrentSheet="isSelectCurrentSheet"
      :canvasRatio="canvasRatio"
      :columnStartWidth="columnStartWidth"
      :columnTotalWidth="columnTotalWidth"
      :windowWidth="sheetWidth"
      :ratio="ratio"
    />
    <!-- 垂直滚动条 -->
    <vertical-scroll-bar
      v-if="rowTotalHeight > sheetHeight * canvasRatio"
      :isSelectCurrentSheet="isSelectCurrentSheet"
      :canvasRatio="canvasRatio"
      :rowHeaderHeight="rowHeaderHeight"
      :rowTotalHeight="rowTotalHeight"
      :windowHeight="sheetHeight"
      :ratio="ratio"
    />
    <!-- 单元格绘制 -->
    <sheet-layer
      ref="sheetLayer"
      :isSelectCurrentSheet="isSelectCurrentSheet"
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
import debounce from 'lodash.debounce'
import uuidv1 from 'uuid/v1'
import { evaluate } from '@/utils/math'
import { addEventListener } from '@/utils/event'

import SheetLayer from './components/SheetLayer.vue'
import EditLayer from './components/EditLayer.vue'
import HorizontalScrollBar from './components/HorizontalScrollBar.vue'
import VerticalScrollBar from './components/VerticalScrollBar.vue'

export default {
  name: 'LinSheet',
  components: {
    SheetLayer,
    EditLayer,
    HorizontalScrollBar,
    VerticalScrollBar
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
    this.handleTableDataChange = debounce(this.handleTableDataChange, 300)
    return {
      canvasRatio: 0,
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
      },
      scrollX: 0,
      scrollY: 0,
      sheetWidth: this.width,
      sheetHeight: this.height,
      tabVector: 0
    }
  },
  computed: {
    // 浏览器缩放比例
    browserRatio: function () {
      return window.devicePixelRatio || 1
    },
    table: function () {
      const { width, height, rows, columns, tableData } = this
      return {
        width,
        height,
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
    },
    // 是否是选择当前表格
    isSelectCurrentSheet: function () {
      return this.currentSelectTableKey === this.tableKey
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
      this.handleTableDataChange()
    },
    'ratio': function (newValue, oldValue) {
      this.currentSelect.cellX = this.currentSelect.cellX / oldValue * newValue
      this.currentSelect.cellY = this.currentSelect.cellY / oldValue * newValue
    }
  },
  mounted () {
    this.canvasRatio = window.devicePixelRatio || 1
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
      // 监听键盘按键
      addEventListener(window, 'keydown', (e) => {
        // 键盘快捷键缩放
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
      })
    }
    // 监听键盘按键
    addEventListener(window, 'keydown', (e) => {
      console.log(e)
      // Tab键 向右切换单元格
      if (e.code === 'Tab') {
        if (this.currentSelect.startColumnIndex < this.columns.length) {
          e.preventDefault()
          // 选择单元格向右移动
          this.currentSelect = {
            startColumnIndex: this.currentSelect.startColumnIndex + 1,
            endColumnIndex: this.currentSelect.startColumnIndex + 1,
            startRowIndex: this.currentSelect.startRowIndex,
            endRowIndex: this.currentSelect.startRowIndex,
            isEditMode: this.currentSelect.isEditMode,
            cellX: this.currentSelect.cellX + this.columns[this.currentSelect.startColumnIndex].width,
            cellY: this.currentSelect.cellY,
            clickX: 0,
            clickY: 0
          }
          this.tabVector += 1
        }
      }
      // 回车键 向下切换单元格 并且会切换到按Tab键的那格下面
      if (e.code === 'Enter') {
        if (this.currentSelect.startRowIndex - this.tabVector < this.rows.length) {
          // 选择单元格向下移动
          this.currentSelect = {
            startColumnIndex: this.currentSelect.startColumnIndex - this.tabVector,
            endColumnIndex: this.currentSelect.startColumnIndex - this.tabVector,
            startRowIndex: this.currentSelect.startRowIndex + 1,
            endRowIndex: this.currentSelect.startRowIndex + 1,
            isEditMode: this.currentSelect.isEditMode,
            cellX: this._getCellPosByCellLocation(this.currentSelect.startColumnIndex - this.tabVector, this.currentSelect.startRowIndex + 1)[0],
            cellY: this.currentSelect.cellY + this.rows[this.currentSelect.startRowIndex].height,
            clickX: 0,
            clickY: 0
          }
          this.tabVector = 0
        }
      }
      // 方向键 控制选择的单元格
      // 上
      if (e.code === 'ArrowUp') {
        if (this.currentSelect.startRowIndex - 1 > 0) {
          // 选择单元格向上移动
          this.currentSelect = {
            startColumnIndex: this.currentSelect.startColumnIndex,
            endColumnIndex: this.currentSelect.startColumnIndex,
            startRowIndex: this.currentSelect.startRowIndex - 1,
            endRowIndex: this.currentSelect.startRowIndex - 1,
            isEditMode: this.currentSelect.isEditMode,
            cellX: this.currentSelect.cellX,
            cellY: this.currentSelect.cellY - this.rows[this.currentSelect.startRowIndex].height,
            clickX: 0,
            clickY: 0
          }
          this.tabVector = 0
        }
      }
      // 右
      if (e.code === 'ArrowRight') {
        // 判断是否为编辑状态
        if (this.currentSelect.isEditMode) {
          // 移动光标
          this.$refs.EditLayer.updateCursorPosByVector({
            vector: 1
          })
        } else if (this.currentSelect.startColumnIndex < this.columns.length) {
          // 选择单元格向右移动
          this.currentSelect = {
            startColumnIndex: this.currentSelect.startColumnIndex + 1,
            endColumnIndex: this.currentSelect.startColumnIndex + 1,
            startRowIndex: this.currentSelect.startRowIndex,
            endRowIndex: this.currentSelect.startRowIndex,
            isEditMode: this.currentSelect.isEditMode,
            cellX: this.currentSelect.cellX + this.columns[this.currentSelect.startColumnIndex].width,
            cellY: this.currentSelect.cellY,
            clickX: 0,
            clickY: 0
          }
          this.tabVector = 0
        }
      }
      // 下
      if (e.code === 'ArrowDown') {
        if (this.currentSelect.startRowIndex < this.rows.length) {
          // 选择单元格向下移动
          this.currentSelect = {
            startColumnIndex: this.currentSelect.startColumnIndex,
            endColumnIndex: this.currentSelect.startColumnIndex,
            startRowIndex: this.currentSelect.startRowIndex + 1,
            endRowIndex: this.currentSelect.startRowIndex + 1,
            isEditMode: this.currentSelect.isEditMode,
            cellX: this.currentSelect.cellX,
            cellY: this.currentSelect.cellY + this.rows[this.currentSelect.startRowIndex].height,
            clickX: 0,
            clickY: 0
          }
          this.tabVector = 0
        }
      }
      // 左
      if (e.code === 'ArrowLeft') {
        // 判断是否为编辑状态
        if (this.currentSelect.isEditMode) {
          // 移动光标
          this.$refs.EditLayer.updateCursorPosByVector({
            vector: -1
          })
        } else if (this.currentSelect.startColumnIndex - 1 > 0) {
          // 选择单元格向左移动
          this.currentSelect = {
            startColumnIndex: this.currentSelect.startColumnIndex - 1,
            endColumnIndex: this.currentSelect.startColumnIndex - 1,
            startRowIndex: this.currentSelect.startRowIndex,
            endRowIndex: this.currentSelect.startRowIndex,
            isEditMode: this.currentSelect.isEditMode,
            cellX: this.currentSelect.cellX - this.columns[this.currentSelect.startColumnIndex].width,
            cellY: this.currentSelect.cellY,
            clickX: 0,
            clickY: 0
          }
          this.tabVector = 0
        }
      }
    }, { passive: false })
    addEventListener(window, 'updateScrollX', this.handleSheetScrollX)
    addEventListener(window, 'updateScrollY', this.handleSheetScrollY)
  },
  methods: {
    // 刷新
    refresh () {
      this.$refs.sheetLayer.refresh(true)
    },
    // 清空当前选择
    clearCurrentSelect () {
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
    // 处理表格滚动
    handleSheetScrollX (e) {
      if (this.isSelectCurrentSheet) {
        this.scrollX = Math.round(e.detail.scrollX * this.canvasRatio * e.detail.sheetMoveRatio)
      }
    },
    // 处理表格滚动
    handleSheetScrollY (e) {
      if (this.isSelectCurrentSheet) {
        this.scrollY = Math.round(e.detail.scrollY * this.canvasRatio * e.detail.sheetMoveRatio)
      }
    },
    // 处理窗口大小变化
    handleTableDataChange () {
      this.sheetWidth = this.width
      this.sheetHeight = this.height
      this.$refs.sheetLayer.refresh()
    },
    // 根据鼠标点击坐标获取单元格位置
    _getCellLocationByMousePos (clickX, clickY) {
      let columnIndex = 0
      let x = 0
      for (let len = this.columns.length; columnIndex <= len; columnIndex++) {
        let columnWidth = 0
        if (columnIndex === 0) {
          columnWidth = this.columnStartWidth * this.ratio
        } else {
          columnWidth = this.columns[columnIndex - 1].width * this.ratio
        }
        x += columnWidth
        if (x >= clickX) {
          break
        }
      }
      let rowIndex = 0
      let y = 0
      for (let len = this.rows.length; rowIndex <= len; rowIndex++) {
        let rowHeight = 0
        if (rowIndex === 0) {
          rowHeight = this.rowHeaderHeight * this.ratio
        } else {
          rowHeight = this.rows[rowIndex - 1].height * this.ratio
        }
        y += rowHeight
        if (y >= clickY) {
          break
        }
      }
      return [columnIndex, rowIndex]
    },
    // 根据单元格位置获取单元格位于表格的XY坐标
    _getCellPosByCellLocation (x, y) {
      let cellX = 0
      let cellY = 0
      // 获取单元格X坐标
      for (let i = 0; i < x; i++) {
        if (i === 0) {
          cellX = this.columnStartWidth * this.ratio
        } else {
          cellX += this.columns[i - 1].width * this.ratio
        }
      }
      // 获取单元格Y坐标
      for (let i = 0; i < y; i++) {
        if (i === 0) {
          cellY = this.rowHeaderHeight * this.ratio
        } else {
          cellY += this.rows[i - 1].height * this.ratio
        }
      }
      return [cellX, cellY]
    },
    // 处理点击表格
    handleClickSheet (e) {
      // 鼠标点击位置
      this.currentSelect.clickX = e.offsetX + (this.scrollX / this.canvasRatio)
      this.currentSelect.clickY = e.offsetY + (this.scrollY / this.canvasRatio)
      // 获取单元格坐标
      const cellLocation = this._getCellLocationByMousePos(this.currentSelect.clickX, this.currentSelect.clickY)
      // 判断是否为点击出界
      if (cellLocation[0] > this.tableData.length || cellLocation[1] > this.tableData[cellLocation[0] - 1].length) {
        return
      }
      let cell = this.tableData[cellLocation[0] - 1][cellLocation[1] - 1]
      // 判断点击的单元格是否为已合并的单元格
      if (cell.attr.columnSpan > 0 && cell.attr.rowSpan > 0) {
        // 获取单元格位置
        const cellPos = this._getCellPosByCellLocation(cellLocation[0], cellLocation[1])
        this.currentSelect.cellX = cellPos[0]
        this.currentSelect.cellY = cellPos[1]
        // 判断是否为重复点击
        if (this.currentSelect.startColumnIndex === cellLocation[0] && this.currentSelect.startRowIndex === cellLocation[1]) {
          this.currentSelect.isEditMode = true
        } else {
          this.currentSelect.isEditMode = false
        }
        this.currentSelect.startColumnIndex = cellLocation[0]
        this.currentSelect.endColumnIndex = cellLocation[0] - 1 + cell.attr.columnSpan
        this.currentSelect.startRowIndex = cellLocation[1]
        this.currentSelect.endRowIndex = cellLocation[1] - 1 + cell.attr.rowSpan
      } else {
        // 处理已被合并的单元格
        const mainCellPos = cell.attr.mainCellPos // 合并单元格的主单元格
        cell = this.tableData[mainCellPos[0]][mainCellPos[1]]
        // 判断是否为重复点击
        if (this.currentSelect.startColumnIndex === mainCellPos[0] + 1 && this.currentSelect.startRowIndex === mainCellPos[1] + 1) {
          this.currentSelect.isEditMode = true
        } else {
          this.currentSelect.isEditMode = false
        }
        this.currentSelect.startColumnIndex = mainCellPos[0] + 1
        this.currentSelect.endColumnIndex = mainCellPos[0] + cell.attr.columnSpan
        this.currentSelect.startRowIndex = mainCellPos[1] + 1
        this.currentSelect.endRowIndex = mainCellPos[1] + cell.attr.rowSpan
        // 获取单元格位置
        const cellPos = this._getCellPosByCellLocation(
          this.currentSelect.startColumnIndex, this.currentSelect.startRowIndex
        )
        this.currentSelect.cellX = cellPos[0]
        this.currentSelect.cellY = cellPos[1]
      }
    },
    /**
     * 处理修改表格数据
     * @param { Number } columnIndex 列索引
     * @param { Number } rowIndex 行索引
     * @param { Number } dataType 内容类型
     * @param { Number } data 修改数据
     * @param { Number } cursorIndex 光标位置
     */
    handleChangeTableData ({ columnIndex, rowIndex, dataType, data, cursorIndex }) {
      if (dataType === 'text') {
        console.log(data)
        const cell = this.tableData[columnIndex - 1][rowIndex - 1]
        const content = cell[this.customTableDataKey]
        if (content.length > 0) {
          cell[this.customTableDataKey] = content.slice(0, cursorIndex) + data + content.slice(cursorIndex)
        } else {
          cell[this.customTableDataKey] += data
        }
      } else if (dataType === 'date') {
        // 日期类型
        console.log(data)
        const cell = this.tableData[columnIndex - 1][rowIndex - 1]
        cell[this.customTableDataKey] = data
      }
      this.$refs.sheetLayer.refresh(true)
      const event = {
        columnIndex: columnIndex,
        rowIndex: rowIndex,
        dataType: dataType,
        data: data,
        cursorIndex: cursorIndex
      }
      this.$emit('changeTableData', event)
    },
    // 处理删除表格数据
    handleDeleteTableData ({ columnIndex, rowIndex, cursorIndex }) {
      console.log(columnIndex)
      console.log(rowIndex)
      const cell = this.tableData[columnIndex - 1][rowIndex - 1]
      const content = cell[this.customTableDataKey]
      if (content.length > 0) {
        // 若无光标位置，则全删除
        if (cursorIndex) {
          cell[this.customTableDataKey] = content.slice(0, cursorIndex - 1) + content.slice(cursorIndex)
        } else {
          cell[this.customTableDataKey] = ''
        }
      }
      this.$refs.sheetLayer.refresh(true)
      const event = {
        columnIndex: columnIndex,
        rowIndex: rowIndex,
        cursorIndex: cursorIndex
      }
      this.$emit('deleteTableData', event)
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

.click-layer {
  z-index: 1;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.edit-layer {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
