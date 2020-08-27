class History {
  constructor () {
    this.records = [] // 历史修改记录
    this.recordIndex = 0 // 当前历史修改记录索引
  }

  // 添加历史记录
  addHistoryRecord (record) {
    const {
      currentSelect,
      dataType, oldValue, newValue, diff,
      type, cursorIndex, selectionXAxisVector, isCover
    } = record
    // 若添加修改记录，则舍弃可前进的历史记录
    this.records = this.records.slice(0, this.recordIndex + 1)
    this.records.push({
      currentSelect: {
        startColumnIndex: currentSelect.startColumnIndex,
        endColumnIndex: currentSelect.endColumnIndex,
        startRowIndex: currentSelect.startRowIndex,
        endRowIndex: currentSelect.endRowIndex,
        cellX: currentSelect.cellX,
        cellY: currentSelect.cellY
      },
      dataType: dataType,
      oldValue: oldValue,
      newValue: newValue,
      diff: diff,
      type: type,
      cursorIndex: cursorIndex,
      selectionXAxisVector: selectionXAxisVector,
      isCover: isCover
    })
    this.recordIndex = this.records.length - 1
  }

  // 获取当前历史记录索引
  getRecordIndex () {
    return this.recordIndex
  }

  // 获取历史修改记录列表
  getHistoryRecord (index) {
    if (this.records[index]) {
      const record = { ...this.records[index] }
      return record
    } else {
      return null
    }
  }

  // 获取历史修改记录列表
  getHistoryRecords () {
    const records = [...this.records.map(item => { return { ...item } })]
    return records
  }

  /**
   * 退回上一条历史记录，并返回退回的历史记录
   * @return { Object } 历史记录
   */
  backToPrevHistoryRecord () {
    if (this.recordIndex < 0) {
      return null
    }
    const record = { ...this.records[this.recordIndex] }
    this.recordIndex -= 1
    return record
  }

  /**
   * 前进下一条历史记录，并返回前进的历史记录
   * @return { Object } 历史记录
   */
  goToNextHistoryRecord () {
    if (this.recordIndex < 0) {
      return null
    }
    const record = { ...this.records[this.recordIndex] }
    this.recordIndex += 1
    return record
  }
}

export default History
