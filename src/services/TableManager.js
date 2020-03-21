import BaseModule from './BaseModule'

class TableManager extends BaseModule {
  constructor () {
    super('TableManager')
  }

  getTableData () {
    return this.post('/sheet/data')
  }
}

export default new TableManager()
