import BaseModule from './BaseModule'

class TableManager extends BaseModule {
  constructor () {
    super('TableManager')
  }

  /**
   * 获取表格数据
   * @param { Number } colunmIndex 列页数
   * @param { Number } colunmSize 列大小
   * @param { Number } rowIndex 行页数
   * @param { Number } rowSize 行大小
   */
  getTableData ({ colunmIndex = 1, colunmSize = 30, rowIndex = 1, rowSize = 100 }) {
    return this.post('/sheet/data', {
      rowIndex: rowIndex,
      rowSize: rowSize,
      colunmIndex: colunmIndex,
      colunmSize: colunmSize
    })
  }
}

export default new TableManager()
