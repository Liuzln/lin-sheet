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
      let columnSpan = 1
      let rowSpan = 1
      let mainCellPos = []
      if (ci === 0 && ri === 1) {
        rowSpan = 2
      }
      if (ci === 0 && ri === 2) {
        rowSpan = 0
        mainCellPos = [0, 1]
      }
      if (ci === 4 && ri === 4) {
        columnSpan = 2
      }
      if (ci === 5 && ri === 4) {
        columnSpan = 0
        mainCellPos = [4, 4]
      }
      if (ci === 2 && ri === 2) {
        columnSpan = 2
        rowSpan = 2
      }
      if (ci === 3 && ri === 2) {
        columnSpan = 0
        mainCellPos = [2, 2]
      }
      if (ci === 2 && ri === 3) {
        rowSpan = 0
        mainCellPos = [2, 2]
      }
      if (ci === 3 && ri === 3) {
        rowSpan = 0
        mainCellPos = [2, 2]
      }
      tempList.push({
        // 内容
        content: ri < 10 && ci < 10 ? `${ci}-${ri}` : '',
        // 内容类型
        contentType: 'text',
        attr: {
          // 列的跨度
          columnSpan: columnSpan,
          // 行的跨度
          rowSpan: rowSpan,
          mainCellPos: mainCellPos
        },
        // 单元格格式
        format: {
          fontSize: '12',
          fontFamily: 'bold 黑体',
          fontColor: 'RGB(0, 0, 0)',
          textBaseline: 'middle',
          textAlign: 'center',
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
