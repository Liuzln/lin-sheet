<template>
  <div id="app">
    <lin-sheet
      :currentSelectTableKey="'1'"
      :tableKey="'1'"
      :rows="rows"
      :columns="columns"
      :tableData="tableData"
      :width="width"
      :height="height"
    />
  </div>
</template>

<script>
import { getInnerWidth, getInnerHeight } from '@/utils/util'

import LinSheet from './components/LinSheet'
import TableManager from '@/services/TableManager'

export default {
  name: 'app',
  components: {
    LinSheet
  },
  data () {
    return {
      rows: [],
      columns: [],
      tableData: [],
      width: getInnerWidth(),
      height: getInnerHeight()
    }
  },
  created () {
    this.init()
  },
  mounted () {
    window.addEventListener('resize', this.handleWindowResizeChange)
  },
  methods: {
    // 处理窗口大小变化
    handleWindowResizeChange () {
      console.log('handleWindowResizeChange')
      this.width = getInnerWidth() // 获取当前窗口宽度
      this.height = getInnerHeight() // 获取当前窗口高度
    },
    async init () {
      // 获取表格数据
      const res = await TableManager.getTableData({
        columnIndex: 1,
        columnSize: 30,
        rowIndex: 1,
        rowSize: 100
      })
      console.log('tableData:', res.data)
      this.rows = res.data.rows
      this.columns = res.data.columns
      this.tableData = res.data.tableData
    },
    handleClickSheet ({ x, y }) {
      console.log(x)
      console.log(y)
    }
  }
}
</script>

<style lang="scss">
body {
  margin: 0;
  padding: 0;
  overflow: hidden;
}

#app {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
