<template>
  <div
    v-if="currentSelect.startColumnIndex > 0 && currentSelect.startRowIndex > 0"
    class="edit-container"
    :style="`left: ${ currentSelect.x }px; top: ${ currentSelect.y }px`"
  >
    <!-- 选择框 -->
    <div
      class="edit-border"
      :style="`width: ${ cellWidth }px; height: ${ cellHeight }px`"
    />
    <!-- 单元格文本内容 -->
    <canvas
      ref="editContent"
      class="edit-content"
      :style="`width: ${ cellWidth }px; height: ${ cellHeight }px`"
    />
    <!-- 光标效果 -->
    <div class="edit-cursor" />
    <!-- 文本区域 用于暂存单元格填写数据 -->
    <textarea
      class="edit-textarea"
      ref="CellTextarea"
      @input="handleCellInput"
      @keydown.delete="handleCellDelete"
    />
  </div>
</template>

<script>
import { IEVersion } from '@/utils/util'

export default {
  name: 'editLayer',
  components: {
  },
  props: {
    // 浏览器缩放比例
    browserRatio: {
      type: Number,
      required: true
    },
    // 行
    rows: {
      type: Array,
      required: true
    },
    // 列
    columns: {
      type: Array,
      required: true
    },
    // 表格数据
    tableData: {
      type: Array,
      required: true
    },
    // 当前选择
    currentSelect: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      editContentContext: '',
      editLock: false
    }
  },
  computed: {
    cellWidth: function () {
      let width = 90
      if (this.columns.length > 0 && this.currentSelect.startColumnIndex > 0) {
        width = this.columns[this.currentSelect.startColumnIndex].width - 2
      }
      return width
    },
    cellHeight: function () {
      let height = 25
      if (this.rows.length > 0 && this.currentSelect.startRowIndex > 0) {
        height = this.rows[this.currentSelect.startRowIndex].height - 2
      }
      return height
    },
    listenChange: function () {
      const { startColumnIndex, endColumnIndex, startRowIndex, endRowIndex, x, y } = this.currentSelect
      return {
        startColumnIndex,
        endColumnIndex,
        startRowIndex,
        endRowIndex,
        x,
        y
      }
    }
  },
  watch: {
    'listenChange': function () {
      console.log('listenChange')
      if (this.currentSelect.startRowIndex > 0 && this.currentSelect.startColumnIndex > 0) {
        this.$refs.CellTextarea.focus()
        this.editContentContext = this.$refs.editContent.getContext('2d')
      }
    }
  },
  mounted () {
    this.$refs.CellTextarea.focus()
    this.$refs.CellTextarea.addEventListener('compositionstart', () => {
      this.editLock = true
    })
    this.$refs.CellTextarea.addEventListener('compositionend', (e) => {
      this.editLock = false
      const inputValue = e.data
      // 修改单元格内容
      this.$emit('changeTableData', {
        columnIndex: this.currentSelect.startColumnIndex,
        rowIndex: this.currentSelect.startRowIndex,
        type: 'content',
        data: inputValue
      })
      // 清空输入框
      this.$refs.CellTextarea.value = ''
    })
    // 绑定粘贴事件
    this.$refs.CellTextarea.addEventListener('paste', this.handleCellPaste)
  },
  methods: {
    // 粘贴
    // ClipboardEvent.clipboardData: https://developer.mozilla.org/zh-CN/docs/Web/API/ClipboardEvent/clipboardData
    // 常见 MIME 类型列表: https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Complete_list_of_MIME_types
    handleCellPaste (e) {
      console.log('event:', e)
      // 是否为IE浏览器
      const isIE = IEVersion() > -1
      // 现代浏览器 e.clipboardData
      // IE浏览器 window.clipboardData
      const clipboard = isIE ? window.clipboardData : e.clipboardData
      let clipboardData = void 0
      console.log('clipboard:', clipboard)
      console.log('clipboard.types:', clipboard.types)
      console.log('clipboard.items:', clipboard.items)
      for (const item of clipboard.items) {
        console.log(item)
      }
      if (isIE) {
        // IE浏览器只能用 Text 参数
        clipboardData = clipboard.getData('Text')
      } else {
        // 判断类型
        // 目前已知文件，text/html，text/plain
        // HTML
        clipboardData = clipboard.getData('text/html')
        // 文字
        clipboardData = clipboard.getData('text/plain')
      }
      console.log('clipboardData:', clipboardData)
      this.sheetData += this.parsePasteText(clipboardData)
    },
    // 输入
    handleCellInput (e) {
      console.log(e)
      const inputType = e.inputType
      const isInsert = inputType === 'insertText' // 是否为输入
      // const isPaste = inputType === 'insertFromPaste' // 是否为黏贴
      const inputValue = e.target.value
      console.log('inputValue:', inputValue)
      console.log('editLock', this.editLock)
      if (!this.editLock) {
        // 判断正常输入或黏贴行为
        if (isInsert) {
          // 输入模式
          // 修改单元格内容
          this.$emit('changeTableData', {
            columnIndex: this.currentSelect.startColumnIndex,
            rowIndex: this.currentSelect.startRowIndex,
            type: 'content',
            data: inputValue
          })
        } else {
          // 黏贴模式
          // 判断是否含有换行符和tab
          // %09 === tab %0A === enter
          const escapeInputValue = escape(inputValue)
          if (escapeInputValue.indexOf('%09') > -1 || escapeInputValue.indexOf('%0A') > -1) {
            const rows = this.queryAllRow(escapeInputValue)
            // 遍历每一行
            for (const row of rows) {
              // 查询行的全部单元格
              const cells = this.queryAllCell(row)
              const cellsValue = []
              // 遍历单元格
              for (const cell of cells) {
                const cellValue = unescape(cell)
                console.log(cellValue)
                cellsValue.push(cellValue)
              }
              this.list.push(cellsValue)
            }
          } else {
            // 输入模型
            // 修改单元格内容
            this.$emit('changeTableData', {
              columnIndex: this.currentSelect.startColumnIndex,
              rowIndex: this.currentSelect.startRowIndex,
              type: 'content',
              data: inputValue
            })
          }
        }
        // 清空富文本输入框
        this.$refs.CellTextarea.value = ''
      }
    },
    // 删除
    handleCellDelete (e) {
      console.log(e)
      this.$emit('deleteTableData', {
        columnIndex: this.currentSelect.startColumnIndex,
        rowIndex: this.currentSelect.startRowIndex
      })
    },
    /*
      解析粘贴文本
      判断是否含有enter和tab
      %09 === tab
      %0A === enter
    */
    parsePasteText (data) {
      const escapeInputValue = escape(data)
      if (escapeInputValue.indexOf('%09') > -1 || escapeInputValue.indexOf('%0A') > -1) {
        const rows = this.queryAllRow(escapeInputValue)
        // 遍历每一行
        for (const row of rows) {
          // 查询行的全部单元格
          const cells = this.queryAllCell(row)
          const cellsValue = []
          // 遍历单元格
          for (const cell of cells) {
            const cellValue = unescape(cell)
            console.log(cellValue)
            cellsValue.push(cellValue)
          }
          this.list.push(cellsValue)
        }
      } else {
        // 输入模型
        this.sheetData += data
      }
    },
    queryAllRow (inputValue) {
      const rows = []
      let startIndex = 0
      let endIndex = inputValue.indexOf('%0A')
      let isContainNextRow = endIndex > -1
      while (isContainNextRow) {
        rows.push(inputValue.substring(startIndex, endIndex))
        startIndex = endIndex + 3
        endIndex = inputValue.indexOf('%0A', startIndex)
        isContainNextRow = endIndex > -1
      }
      return rows
    },
    queryAllCell (row) {
      const cells = []
      let startIndex = 0
      let endIndex = row.indexOf('%09')
      let isContainNextRow = endIndex > -1
      while (isContainNextRow) {
        cells.push(row.substring(startIndex, endIndex))
        startIndex = endIndex + 3
        endIndex = row.indexOf('%09', startIndex)
        isContainNextRow = endIndex > -1
      }
      cells.push(row.substring(startIndex))
      return cells
    }
  }
}
</script>

<style lang="scss" scoped>
.edit-container {
  position: absolute;

  .edit-border {
    position: absolute;
    outline: none;
    box-sizing: content-box;
    resize: none;
    background: RGBA(0, 0, 0, 0);
    border: 2px solid RGB(34, 167, 242);
    transform: translate(-1px, -2px);
  }

  .edit-content {
    position: absolute;
  }

  .edit-cursor {
    width: 1px;
    background: #000;
    vertical-align: center;
    animation: edit-cursor 1s ease infinite;
    position: absolute;
  }

  .edit-textarea {
    opacity: 0;
    position: absolute;
    top: 13px;
    left: 0;
  }
}

@keyframes edit-cursor {
  0% {
    opacity: 0
  }
  50% {
    opacity: 1
  }
  to {
    opacity: 0
  }
}
</style>
