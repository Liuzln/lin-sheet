<template>
  <div id="lin-sheet">
    <!-- 单元格绘制 -->
    <sheet-layer
      ref="sheetLayer"
      :width="sheetWidth"
      :height="sheetHeight"
      :browserRatio="browserRatio"
      :rows="rows"
      :columns="columns"
      @s-click="handleClickSheet"
    />
    <!-- 选择框层 -->
    <!-- 修改层 -->
    <edit-layer />
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
  data () {
    return {
      generateRowNumber: 50,
      generateColumnNumber: 50,
      sheetWidth: getInnerWidth(),
      sheetHeight: getInnerHeight(),
      rows: [],
      columns: []
    }
  },
  computed: {
    browserRatio: () => {
      return window.devicePixelRatio || 1
    }
  },
  mounted () {
    window.addEventListener('resize', this.handleWindowResizeChange)
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
  methods: {
    // 处理窗口大小变化
    handleWindowResizeChange () {
      console.log('handleWindowResizeChange')
      this.sheetWidth = getInnerWidth() // 获取当前窗口宽度
      this.sheetHeight = getInnerHeight() // 获取当前窗口高度
      this.$refs.sheetLayer.drawSheet()
    },
    handleClickSheet ({ x, y }) {
      console.log(x)
      console.log(y)
    }
  }
}
</script>

<style lang="scss">
@import './index.scss';
</style>
