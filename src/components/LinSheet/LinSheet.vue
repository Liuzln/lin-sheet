<template>
  <div id="lin-sheet">
    <!-- 修改层 -->
    <edit-layer
      :browserRatio="browserRatio"
      :rows="rows"
      :columns="columns"
      :tableData="tableData"
      :currentSelect="currentSelect"
      @changeTableData="handleChangeTableData"
      @deleteTableData="handleDeleteTableData"
    />
    <!-- 选择层 -->
    <div
      class="edit-layer"
      @click="handleClickSheet"
    />
    <!-- 单元格绘制 -->
    <sheet-layer
      ref="sheetLayer"
      :width="sheetWidth"
      :height="sheetHeight"
      :browserRatio="browserRatio"
      :columnsStartX="columnsStartX"
      :rowStartY="rowStartY"
      :rows="rows"
      :columns="columns"
      :tableData="tableData"
    />
  </div>
</template>

<script>
// TODO: 根据坐标改变光标
// TODO: 根据点击位置选择单元格、列、行
// import debounce from 'lodash.debounce'
import { getInnerWidth, getInnerHeight } from '@/utils/util'

import SheetLayer from './components/SheetLayer.vue'
import EditLayer from './components/EditLayer.vue'

export default {
  name: 'LinSheet',
  components: {
    SheetLayer,
    EditLayer
  },
  props: {
    rows: {
      type: Array,
      required: true
    },
    columns: {
      type: Array,
      required: true
    },
    tableData: {
      type: Array,
      required: true
    }
  },
  data () {
    return {
      columnsStartX: 45,
      rowStartY: 24,
      sheetWidth: getInnerWidth(),
      sheetHeight: getInnerHeight(),
      currentSelect: {
        startColumnIndex: 1, // 列开始索引 单选时用的坐标
        endColumnIndex: 1, // 列结束索引 多选时用的坐标
        startRowIndex: 1, // 行开始索引 单选时用的坐标
        endRowIndex: 1, // 行结束索引 多选时用的坐标
        isEditMode: false, // 单元格编辑模式
        cellX: 45, // 单元格左上角位置X轴
        cellY: 24, // 单元格左上角位置Y轴
        clickX: 0, // 鼠标点击位置
        clickY: 0 // 鼠标点击位置
      }
    }
  },
  computed: {
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
    }
  },
  watch: {
    'table': function () {
      this.$refs.sheetLayer.drawSheet()
    }
  },
  mounted () {
    window.addEventListener('resize', this.handleWindowResizeChange)
  },
  methods: {
    // 处理窗口大小变化
    handleWindowResizeChange () {
      console.log('handleWindowResizeChange')
      this.sheetWidth = getInnerWidth() // 获取当前窗口宽度
      this.sheetHeight = getInnerHeight() // 获取当前窗口高度
      this.$refs.sheetLayer.drawSheet()
    },
    handleClickSheet (e) {
      // console.log(event)
      const offsetX = e.offsetX
      const offsetY = e.offsetY
      console.log('offsetX:', offsetX)
      console.log('offsetY:', offsetY)
      this.currentSelect.clickX = offsetX
      this.currentSelect.clickY = offsetY
      // 判断点击哪个单元格
      let currentX = 0
      let columnIndex = 0
      let isRepeatClickColumn = false
      let currrntY = 0
      let rowIndex = 0
      let isRepeatClickRow = false
      for (let len = this.columns.length; columnIndex < len; columnIndex++) {
        const columnWidth = this.columns[columnIndex].width
        if (currentX >= offsetX) {
          if (this.currentSelect.startColumnIndex === columnIndex - 1) {
            isRepeatClickColumn = true
          } else {
            this.currentSelect.startColumnIndex = columnIndex - 1
            if (this.currentSelect.startColumnIndex > 0) {
              this.currentSelect.cellX = currentX - columnWidth
            } else {
              this.currentSelect.cellX = 0
            }
          }
          break
        } else {
          if (columnIndex === 0) {
            currentX += this.columnsStartX
          } else {
            currentX += columnWidth
          }
        }
      }
      for (let len = this.rows.length; rowIndex < len; rowIndex++) {
        const rowHeight = this.rows[rowIndex].height
        if (currrntY >= offsetY) {
          if (this.currentSelect.startRowIndex === rowIndex - 1) {
            isRepeatClickRow = true
          } else {
            this.currentSelect.startRowIndex = rowIndex - 1
            if (this.currentSelect.startRowIndex > 0) {
              this.currentSelect.cellY = currrntY - rowHeight
            } else {
              this.currentSelect.cellY = 0
            }
          }
          break
        } else {
          if (columnIndex === 0) {
            currrntY += this.rowStartY
          } else {
            currrntY += rowHeight
          }
        }
      }
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
        const content = this.tableData[rowIndex - 1][columnIndex - 1].content
        this.tableData[rowIndex - 1][columnIndex - 1].content = content.slice(0, textIndex) + data + content.slice(textIndex)
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
@import './index.scss';
.edit-layer {
  z-index: 1;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
