<template>
  <div id="app">
    <lin-sheet
      :rows="rows"
      :columns="columns"
      :tableData="tableData"
    />
  </div>
</template>

<script>
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
      tableData: []
    }
  },
  created () {
    this.init()
  },
  methods: {
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
