import Mock from 'mockjs2'
import { builder, getBody } from '../util'

const tableData = (options) => {
  const body = getBody(options)
  console.log('body:', body)

  const rowIndex = body.rowIndex
  const rowSize = body.rowSize
  const columnIndex = body.columnIndex
  const columnSize = body.columnSize

  // 行数据
  const rows = []
  for (let i = (rowIndex - 1) * rowSize, len = rowIndex * rowSize; i < len; i++) {
    rows.push({ id: i, height: 25 })
  }

  // 列数据
  const columns = []
  for (let i = (columnIndex - 1) * columnSize, len = columnIndex * columnSize; i < len; i++) {
    columns.push({ id: i, width: 90 })
  }

  // 表格数据
  const tableData = []
  for (let ri = (rowIndex - 1) * rowSize, riLen = rowIndex * rowSize; ri < riLen; ri++) {
    const tempList = []
    for (let ci = (columnIndex - 1) * columnSize, ciLen = columnIndex * columnSize; ci < ciLen; ci++) {
      tempList.push({
        // 内容
        content: ri < 10 && ci < 10 ? `${ri}-${ci}` : '',
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
      })
    }
    tableData.push(tempList)
  }

  return builder({
    'id': 1,
    'rows': rows,
    'columns': columns,
    'tableData': tableData
  })
}

Mock.mock(/\/sheet\/data/, 'post', tableData)
