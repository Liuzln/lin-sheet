<template>
  <div id="lin-sheet">
    <!-- 选择层 -->
    <div
      class="edit-layer"
      @click="handleClickSheet"
    />
    <!-- 修改层 -->
    <edit-layer
      :browserRatio="browserRatio"
      :rows="rows"
      :columns="columns"
      :tableData="tableData"
      :currentSelect="currentSelect"
    />
    <!-- 单元格绘制 -->
    <sheet-layer
      ref="sheetLayer"
      :width="sheetWidth"
      :height="sheetHeight"
      :browserRatio="browserRatio"
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
      sheetWidth: getInnerWidth(),
      sheetHeight: getInnerHeight(),
      currentSelect: {
        columnNum: 0,
        rowNum: 0,
        x: 0,
        y: 0
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
      // console.log(offsetX)
      // console.log(offsetY)
      // 判断点击哪个单元格
      let currentX = 0
      let columnNum = 0
      let currrntY = 0
      let rowNum = 0
      for (let len = this.columns.length; columnNum < len; columnNum++) {
        const columnWidth = this.columns[columnNum].width
        if (currentX + columnWidth >= offsetX) {
          this.currentSelect.x = currentX
          this.currentSelect.columnNum = columnNum
          break
        } else {
          if (columnNum === 0) {
            currentX += 45
          } else {
            currentX += columnWidth
          }
        }
      }
      for (let len = this.rows.length; rowNum < len; rowNum++) {
        const rowHeight = this.rows[rowNum].height
        if (currrntY + rowHeight >= offsetY) {
          this.currentSelect.y = currrntY
          this.currentSelect.rowNum = rowNum
          break
        } else {
          currrntY += rowHeight
        }
      }
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
