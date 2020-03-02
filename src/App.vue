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

export default {
  name: 'app',
  components: {
    LinSheet
  },
  data () {
    return {
      generateRowNumber: 50,
      generateColumnNumber: 50,
      rows: [],
      columns: [],
      tableData: []
    }
  },
  created () {
    this.mockData()
  },
  methods: {
    // 模拟数据
    mockData () {
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
      // 表格格式
      this.tableData = [
        [{
          // 内容
          content: '0-0',
          // 内容类型
          contentType: 'text',
          // 单元格格式
          format: {
            fontSize: '12',
            // 右边框
            borderRight: {
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: '#000000'
            },
            // 下边框
            borderBottom: {
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: '#000000'
            }
          }
        }, {
          // 内容
          content: '0-1',
          // 内容类型
          contentType: 'text',
          // 单元格格式
          format: {
            fontSize: '12',
            // 右边框
            borderRight: {
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: '#000000'
            },
            // 下边框
            borderBottom: {
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: '#000000'
            }
          }
        }, {
          // 内容
          content: '0-2',
          // 内容类型
          contentType: 'text',
          // 单元格格式
          format: {
            fontSize: '12',
            // 右边框
            borderRight: {
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: '#000000'
            },
            // 下边框
            borderBottom: {
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: '#000000'
            }
          }
        }],
        [{
          // 内容
          content: '1-0',
          // 内容类型
          contentType: 'text',
          // 单元格格式
          format: {
            fontSize: '12',
            // 右边框
            borderRight: {
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: '#000000'
            },
            // 下边框
            borderBottom: {
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: '#000000'
            }
          }
        }, {
          // 内容
          content: '1-1',
          // 内容类型
          contentType: 'text',
          // 单元格格式
          format: {
            fontSize: '12',
            // 右边框
            borderRight: {
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: '#000000'
            },
            // 下边框
            borderBottom: {
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: '#000000'
            }
          }
        }, {
          // 内容
          content: '1-2',
          // 内容类型
          contentType: 'text',
          // 单元格格式
          format: {
            fontSize: '12',
            // 右边框
            borderRight: {
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: '#000000'
            },
            // 下边框
            borderBottom: {
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: '#000000'
            }
          }
        }]
      ]
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
