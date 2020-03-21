import Mock from 'mockjs2'
import { builder, getBody } from '../util'

const tableData = (options) => {
  const parameters = getBody(options)

  console.log(parameters)
  const generateRowNumber = 25
  const generateColumnNumber = 25
  const rows = []
  const columns = []
  for (let i = 0, len = generateRowNumber; i < len; i++) {
    rows.push({ id: i, height: 25 })
  }
  for (let i = 0, len = generateColumnNumber; i < len; i++) {
    columns.push({ id: i, width: 90 })
  }
  // 表格格式
  const tableData = [
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

  return builder({
    'id': 1,
    'rows': rows,
    'columns': columns,
    'tableData': tableData
  })
}

Mock.mock(/\/sheet\/data/, 'post', tableData)
