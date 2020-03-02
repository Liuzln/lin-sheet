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
      :tableData="tableData"
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
      sheetHeight: getInnerHeight()
    }
  },
  computed: {
    browserRatio: () => {
      return window.devicePixelRatio || 1
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
