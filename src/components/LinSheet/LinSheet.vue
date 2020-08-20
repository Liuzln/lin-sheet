<template>
  <div id="lin-sheet">
    <!-- 自定义层 -->
    <slot
      name="customize-layer"
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
      :isVisibleRowHeader="isVisibleRowHeader"
      :isVisibleColumnHeader="isVisibleColumnHeader"
      :rows="rows"
      :columns="columns"
      :tableData="tableData"
      :columnStartWidth="columnStartWidth"
      :rowHeaderHeight="rowHeaderHeight"
      :customTableDataKey="customTableDataKey"
      :currentSelect="currentSelect"
      @changeTableData="handleChangeTableData"
      @pasteTableData="handlePasteTableData"
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
      ref="HorizontalScrollBar"
      v-show="columnTotalWidth > sheetWidth"
      :isSelectCurrentSheet="isSelectCurrentSheet"
      :canvasRatio="canvasRatio"
      :columnStartWidth="columnStartWidth"
      :columnTotalWidth="columnTotalWidth"
      :windowWidth="sheetWidth"
      :ratio="ratio"
    />
    <!-- 垂直滚动条 -->
    <vertical-scroll-bar
      ref="VerticalScrollBar"
      v-show="rowTotalHeight > sheetHeight"
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
      :isVisibleRowHeader="isVisibleRowHeader"
      :isVisibleColumnHeader="isVisibleColumnHeader"
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
import { addEventListener, clearEventListener } from '@/utils/event'

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
    // 是否显示行名称
    isVisibleRowHeader: {
      type: Boolean,
      default: true
    },
    // 是否显示列名称
    isVisibleColumnHeader: {
      type: Boolean,
      default: true
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
    // 最大表格宽度
    maxWidth: {
      type: Number
    },
    // 最大表格高度
    maxHeight: {
      type: Number
    },
    // 是否绑定缩放事件监听器
    isBindZoomEventListener: {
      type: Boolean,
      default: true
    },
    // 是否自动注册事件监听器
    isAutorRgisterEventListener: {
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
        cellX: this.isVisibleColumnHeader ? this.columnStartWidth : 0, // 单元格左上角位置X轴
        cellY: this.isVisibleRowHeader ? this.rowHeaderHeight : 0, // 单元格左上角位置Y轴
        clickX: 0, // 鼠标点击位置
        clickY: 0 // 鼠标点击位置
      },
      scrollX: 0,
      scrollY: 0,
      sheetWidth: 0,
      sheetHeight: 0,
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
      let totalWidth = this.isVisibleColumnHeader ? this.columnStartWidth : 0
      for (let i = 0, len = this.columns.length; i < len; i++) {
        const column = this.columns[i]
        totalWidth += column.width
      }
      return totalWidth
    },
    // 行总高度
    rowTotalHeight: function () {
      let totalHeight = this.isVisibleRowHeader ? this.rowHeaderHeight : 0
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
  created () {
    if (this.width) {
      // 控制表格最大宽度
      if (this.maxWidth && this.width > this.maxWidth) {
        this.sheetWidth = this.maxWidth
      } else {
        this.sheetWidth = this.width
      }
    }
    if (this.height) {
      // 控制表格最大高度
      if (this.maxHeight && this.height > this.maxHeight) {
        this.sheetHeight = this.maxHeight
      } else {
        this.sheetHeight = this.height
      }
    }
  },
  mounted () {
    this.canvasRatio = window.devicePixelRatio || 1
    if (this.isAutorRgisterEventListener) {
      this.initEventListener()
    }
  },
  beforeDestroy () {
    this.clearEventListener()
  },
  methods: {
    // 初始化事件监听
    initEventListener () {
      console.log('initEventListener')
      // 判断是否监听缩放事件
      if (this.isBindZoomEventListener) {
        // Ctrl+鼠标滚轮缩放
        addEventListener(window, 'mousewheel', this.handleZoomMousewheel, { passive: false })
        // 监听键盘按键
        addEventListener(window, 'keydown', this.handleZoomKeydown)
      }
      // 监听键盘按键
      addEventListener(window, 'keydown', this.handleSheetKeydown, { passive: false })
      addEventListener(window, 'updateScrollX', this.handleSheetScrollX)
      addEventListener(window, 'updateScrollY', this.handleSheetScrollY)
      this.$nextTick(() => {
        this.$refs.EditLayer.initEventListener()
        this.$refs.VerticalScrollBar.initEventListener()
        this.$refs.HorizontalScrollBar.initEventListener()
        this.$refs.sheetLayer.initEventListener()
      })
    },
    clearEventListener () {
      // 清理所有事件监听器
      clearEventListener()
    },
    handleZoomMousewheel (e) {
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
    },
    handleZoomKeydown (e) {
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
    },
    handleSheetKeydown (e) {
      // 退格键 屏蔽国产浏览器的退格键返回上一页功能
      if (e.code === 'Backspace') {
        e.preventDefault()
      }
      // Tab键 向右切换单元格
      if (e.code === 'Tab') {
        if (!this.getEditLock() && !this.currentSelect.isEditMode) {
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
      }
      // 回车键 向下切换单元格 并且会切换到按Tab键的那格下面
      if (e.code === 'Enter') {
        if (!this.getEditLock() && !this.currentSelect.isEditMode) {
          if (this.currentSelect.startRowIndex - this.tabVector < this.rows.length) {
            e.preventDefault()
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
      }
      // 方向键 控制选择的单元格
      // 上
      if (e.code === 'ArrowUp') {
        if (!this.getEditLock() && !this.currentSelect.isEditMode) {
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
      }
      // 右
      if (e.code === 'ArrowRight') {
        // 判断是否为编辑状态
        if (!this.getEditLock() && this.currentSelect.isEditMode) {
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
        if (!this.getEditLock() && !this.currentSelect.isEditMode) {
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
      }
      // 左
      if (e.code === 'ArrowLeft') {
        // 判断是否为编辑状态
        if (!this.getEditLock() && this.currentSelect.isEditMode) {
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
    },
    getEditLock () {
      return this.$refs.EditLayer.editLock
    },
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
      this.sheetWidth = this.width || 0
      this.sheetHeight = this.height || 0
      this.$refs.sheetLayer.refresh()
    },
    // 根据鼠标点击坐标获取单元格位置
    _getCellLocationByMousePos (clickX, clickY) {
      let columnIndex = 0
      let x = 0
      for (let len = this.columns.length; columnIndex <= len; columnIndex++) {
        let columnWidth = 0
        if (columnIndex === 0) {
          if (this.isVisibleColumnHeader) {
            columnWidth = this.columnStartWidth * this.ratio
          }
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
          if (this.isVisibleRowHeader) {
            rowHeight = this.rowHeaderHeight * this.ratio
          }
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
          if (this.isVisibleColumnHeader) {
            cellX = this.columnStartWidth * this.ratio
          }
        } else {
          cellX += this.columns[i - 1].width * this.ratio
        }
      }
      // 获取单元格Y坐标
      for (let i = 0; i < y; i++) {
        if (i === 0) {
          if (this.isVisibleRowHeader) {
            cellY = this.rowHeaderHeight * this.ratio
          }
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
     * @param { Number } selectionXAxisVector 框选X轴向量
     * @param { Boolean } isCover 是否覆盖填写
     */
    handleChangeTableData ({ columnIndex, rowIndex, dataType, data, cursorIndex,
      selectionXAxisVector, isCover = false }) {
      if (dataType === 'text') {
        const cell = this.tableData[columnIndex - 1][rowIndex - 1] // 单元格对象
        const content = String(cell[this.customTableDataKey]) // 单元格内容
        if (isCover) {
          // 直接覆盖
          cell[this.customTableDataKey] = data
        } else {
          let beforeSpliceIndex = 0
          let afterSpliceIndex = 0
          if (selectionXAxisVector > 0) {
            beforeSpliceIndex = cursorIndex - selectionXAxisVector
            afterSpliceIndex = cursorIndex
          } else {
            beforeSpliceIndex = cursorIndex
            afterSpliceIndex = cursorIndex + -selectionXAxisVector
          }
          // 若内容长度大于0，则
          if (content.length > 0) {
            cell[this.customTableDataKey] =
              content.slice(0, beforeSpliceIndex) + data + content.slice(afterSpliceIndex)
          } else {
            cell[this.customTableDataKey] += data
          }
        }
      } else if (dataType === 'date') {
        // 日期类型
        this.currentSelect.isEditMode = false
        const cell = this.tableData[columnIndex - 1][rowIndex - 1]
        cell[this.customTableDataKey] = data
      }
      this.$refs.sheetLayer.refresh(true)
      // 事件冒泡
      const event = {
        columnIndex: columnIndex,
        rowIndex: rowIndex,
        dataType: dataType,
        data: data,
        cursorIndex: cursorIndex,
        isCover: isCover
      }
      this.$emit('changeTableData', event)
    },
    handlePasteTableData (pasteData) {
      console.log('LinSheet:handlePasteTableData')
      for (const item of pasteData) {
        console.log('item:', item)
        if (item.dataType === 'text') {
          if (item.columnIndex < this.tableData.length) {
            const cell = this.tableData[item.columnIndex - 1][item.rowIndex - 1]
            if (cell) {
              const content = String(cell[this.customTableDataKey])
              if (item.isCover) {
                cell[this.customTableDataKey] = item.data
              } else {
                // 若无向量，则删除
                if (item.cursorIndex && item.selectionXAxisVector !== 0) {
                  let beforeSpliceIndex = 0
                  let afterSpliceIndex = 0
                  if (item.selectionXAxisVector > 0) {
                    beforeSpliceIndex = item.cursorIndex - item.selectionXAxisVector
                    afterSpliceIndex = item.cursorIndex
                  } else {
                    beforeSpliceIndex = item.cursorIndex
                    afterSpliceIndex = item.cursorIndex + -item.selectionXAxisVector
                  }
                  cell[this.customTableDataKey] = content.slice(0, beforeSpliceIndex) + item.data + content.slice(afterSpliceIndex)
                } else if (item.cursorIndex) {
                  cell[this.customTableDataKey] = content.slice(0, item.cursorIndex) + item.data + content.slice(item.cursorIndex)
                } else {
                  cell[this.customTableDataKey] += item.data
                }
              }
            }
          }
        } else if (item.dataType === 'date') {
          // 日期类型
          this.currentSelect.isEditMode = false
          const cell = this.tableData[item.columnIndex - 1][item.rowIndex - 1]
          if (cell) {
            cell[this.customTableDataKey] = item.data
          }
        }
      }
      this.$refs.sheetLayer.refresh(true)
      this.$emit('pasteTableData', pasteData)
    },
    // 处理删除表格数据
    handleDeleteTableData ({ columnIndex, rowIndex, cursorIndex, selectionXAxisVector }) {
      console.log(columnIndex)
      console.log(rowIndex)
      console.log(cursorIndex)
      console.log(selectionXAxisVector)
      const cell = this.tableData[columnIndex - 1][rowIndex - 1]
      // 判断删除内容类型
      if (cell.contentType === 'text') {
        const content = String(cell[this.customTableDataKey])
        if (content.length > 0) {
          // 若无光标位置，则全删除
          if (cursorIndex && selectionXAxisVector !== 0) {
            let beforeSpliceIndex = 0
            let afterSpliceIndex = 0
            if (selectionXAxisVector > 0) {
              beforeSpliceIndex = cursorIndex - selectionXAxisVector
              afterSpliceIndex = cursorIndex
            } else {
              beforeSpliceIndex = cursorIndex
              afterSpliceIndex = cursorIndex + -selectionXAxisVector
            }
            cell[this.customTableDataKey] = content.slice(0, beforeSpliceIndex) + content.slice(afterSpliceIndex)
          } else if (cursorIndex) {
            cell[this.customTableDataKey] = content.slice(0, cursorIndex - 1) + content.slice(cursorIndex)
          } else {
            cell[this.customTableDataKey] = ''
          }
        }
      } else if (cell.contentType === 'date') {
        cell[this.customTableDataKey] = ''
      }
      this.$refs.sheetLayer.refresh(true)
      const event = {
        columnIndex: columnIndex,
        rowIndex: rowIndex,
        dataType: cell.contentType,
        data: cell[this.customTableDataKey],
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
