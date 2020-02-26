<template>
  <div class="edit-layer">
    <div class="edit-container">
      <!-- 单元格内容 包含内容、格式 -->
      <canvas ref="editContent" class="edit-content"></canvas>
      <!-- 光标效果 -->
      <div class="edit-cursor"></div>
    </div>
    <textarea
      ref="CellTextarea"
      @input="handleCellInput"
    />
  </div>
</template>

<script>
import { IEVersion } from '@/utils/util'

export default {
  name: 'editLayer',
  components: {
  },
  data () {
    return {
      editContentContext: ''
    }
  },
  mounted () {
    // 绑定粘贴事件
    this.$refs.CellTextarea.addEventListener('paste', this.handleCellPaste)
    this.editContentContext = this.$refs.editContent.getContext('2d')
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
      // 判断正常输入或黏贴行为
      if (isInsert) {
        // 输入模式
        this.sheetData += inputValue
      } else {
        // // 黏贴模式
        // // 判断是否含有换行符和tab
        // // %09 === tab %0A === enter
        // const escapeInputValue = escape(inputValue)
        // if (escapeInputValue.indexOf('%09') > -1 || escapeInputValue.indexOf('%0A') > -1) {
        //   const rows = this.queryAllRow(escapeInputValue)
        //   // 遍历每一行
        //   for (const row of rows) {
        //     // 查询行的全部单元格
        //     const cells = this.queryAllCell(row)
        //     const cellsValue = []
        //     // 遍历单元格
        //     for (const cell of cells) {
        //       const cellValue = unescape(cell)
        //       console.log(cellValue)
        //       cellsValue.push(cellValue)
        //     }
        //     this.list.push(cellsValue)
        //   }
        // } else {
        //   // 输入模型
        //   this.value += inputValue
        // }
      }
      // 清空富文本输入框
      this.$refs.CellTextarea.value = ''
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
.edit-layer {
  position: absolute;
  top: 0;
  left: 0;

  .edit-container {
    .edit-cursor {
      width: 1px;
      background: #000;
      vertical-align: center;
      animation: edit-cursor 1s ease infinite;
      position: absolute;
    }
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
