import BaseModule from './BaseModule'

class TableManager extends BaseModule {
  constructor () {
    super('TableManager')
  }

  /**
   * 获取表格数据
   * @param { Number } columnIndex 列页数
   * @param { Number } columnSize 列大小
   * @param { Number } rowIndex 行页数
   * @param { Number } rowSize 行大小
   */
  getTableData ({ columnIndex = 1, columnSize = 30, rowIndex = 1, rowSize = 100 }) {
    return this.post('/sheet/data', {
      rowIndex: rowIndex,
      rowSize: rowSize,
      columnIndex: columnIndex,
      columnSize: columnSize
    })
  }
}

export default new TableManager()
