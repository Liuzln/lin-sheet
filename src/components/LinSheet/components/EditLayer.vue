<template>
  <div>
    <div
      v-if="currentSelect.startColumnIndex > 0 && currentSelect.startRowIndex > 0"
      class="edit-container"
      :style="`left: ${ currentSelect.cellX - scrollX }px;
               top: ${ currentSelect.cellY - scrollY }px;
               z-index: ${ currentSelect.isEditMode ? 2 : 1 };`"
    >
      <!-- 单元格框选区域 -->
      <canvas
        v-show="cell.contentType === 'text'"
        ref="editSelection"
        class="edit-selection"
        :width="cellWidth"
        :height="cellHeight"
        :style="`width: ${ cellWidth }px;
                 height: ${ cellHeight }px;
                 z-index: ${ currentSelect.isEditMode ? 4 : 0 };
                 opacity: ${ selection.xAxisVector !== 0 ? 1 : 0 };`"
      />
      <!-- 选择框 -->
      <div
        class="edit-border"
        :style="`width: ${ cellWidth }px; height: ${ cellHeight }px;`"
      />
      <a-date-picker
        v-if="cell.contentType === 'date' || cell.contentType === 'shortDate'"
        :open="currentSelect.isEditMode"
        placeholder="日期"
        :value="cell.content ? $moment(cell.content) : null"
        :style="`z-index: ${ currentSelect.isEditMode ? 3 : 0 };`"
        @change="handleChangeDate"
        style="position: absolute; top: 0; left: 0;"
      >
        <span></span>
      </a-date-picker>
      <!-- 单元格文本内容 -->
      <canvas
        ref="editContent"
        class="edit-content"
        :style="`width: ${ cellWidth }px; height: ${ cellHeight }px;`"
      />
      <!-- 光标效果 -->
      <div
        v-show="cell.contentType === 'text' && selection.xAxisVector === 0"
        class="edit-cursor"
        :style="`width: ${ currentSelect.isEditMode ? 1 : 0 }px;
                 left: ${ cursor.posX }px;
                 top: ${ cursor.posY }px;
                 height: ${ cursor.height * ratio }px;`"
      />
    </div>
    <!-- 文本区域 用于暂存单元格填写数据 -->
    <textarea
      class="edit-textarea"
      ref="CellTextarea"
      @input="handleCellInput"
      @keydown.delete="handleCellDelete"
      :style="`left: ${ currentSelect.cellX - scrollX }px;
               top: ${ currentSelect.cellY - scrollY }px;`"
    />
  </div>
</template>

<script>
import Vue from 'vue'
import { DatePicker } from 'ant-design-vue'
import { IEVersion } from '@/utils/util'
import { addEventListener, removeEventListener } from '@/utils/event'
import { drawFillRect, clearContext } from '@/utils/canvas'

Vue.use(DatePicker)

export default {
  name: 'editLayer',
  props: {
    // 是否是选择当前表格
    isSelectCurrentSheet: {
      type: Boolean,
      required: true
    },
    // 缩放比例
    ratio: {
      type: Number,
      required: true
    },
    // 浏览器 缩放比例
    browserRatio: {
      type: Number,
      required: true
    },
    // 浏览器缩放比例
    canvasRatio: {
      type: Number,
      required: true
    },
    // 是否显示行名称
    isVisibleRowHeader: {
      type: Boolean,
      default: true
    },
    // 是否显示列名称
    isVisibleColumnHeader: {
      type: Boolean,
      default: true
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
    // 列开始宽度
    columnStartWidth: {
      type: Number,
      default: 45
    },
    // 行头部高度
    rowHeaderHeight: {
      type: Number,
      default: 24
    },
    // 自定义表格数据Key
    customTableDataKey: {
      type: String,
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
      editSelectionContext: '',
      editLock: false, // 编辑锁 用于处理中文输入
      // 光标
      cursor: {
        xAxisIndex: 0, // 光标X轴索引
        yAxisIndex: 0, // 光标Y轴索引
        posX: 0, // Y位置
        posY: 3, // Y坐标
        height: 18 // 光标高度
      },
      selection: {
        xAxisVector: 0,
        yAxisVector: 0
      },
      // 内容选择图
      cellSelectionMap: [],
      contentWidth: 0, // 内容宽度
      scrollX: 0,
      scrollY: 0,
      inputCount: 0 // 输入次数
    }
  },
  computed: {
    // 单元格宽度
    cellWidth: function () {
      // 默认列开始宽度
      let width = this.isVisibleColumnHeader ? this.columnStartWidth : 0
      const startColumnIndex = this.currentSelect.startColumnIndex
      const endColumnIndex = this.currentSelect.endColumnIndex
      if (this.columns.length > 0 && startColumnIndex > 0 && endColumnIndex > 0 &&
          this.columns.length >= startColumnIndex && this.columns.length >= endColumnIndex) {
        width = 0
        for (let i = startColumnIndex; i <= endColumnIndex; i++) {
          if (this.columns[i - 1].width) {
            width += this.columns[i - 1].width
          }
        }
      }
      return width * this.ratio
    },
    // 单元格高度
    cellHeight: function () {
      // 默认行头部高度
      let height = this.isVisibleRowHeader ? this.rowHeaderHeight : 0
      const startRowIndex = this.currentSelect.startRowIndex
      const endRowIndex = this.currentSelect.endRowIndex
      if (this.rows.length > 0 && startRowIndex > 0 && endRowIndex > 0 &&
          this.rows.length >= startRowIndex && this.rows.length >= endRowIndex) {
        height = 0
        for (let i = startRowIndex; i <= endRowIndex; i++) {
          if (this.rows[i - 1].height) {
            height += this.rows[i - 1].height
          }
        }
      }
      return height * this.ratio
    },
    // 单元格数据
    cell: function () {
      if (this.tableData.length > 0) {
        return this.tableData[this.currentSelect.startColumnIndex - 1][this.currentSelect.startRowIndex - 1]
      }
      return {}
    },
    // 用于监听传参修改
    listenChange: function () {
      const { startColumnIndex, endColumnIndex,
        startRowIndex, endRowIndex, isEditMode,
        cellX, cellY, clickX, clickY
      } = this.currentSelect
      return {
        startColumnIndex,
        endColumnIndex,
        startRowIndex,
        endRowIndex,
        isEditMode,
        cellX,
        cellY,
        clickX,
        clickY
      }
    }
  },
  watch: {
    // 传参修改的话，则是更换单元格
    'listenChange': function () {
      // console.log('listenChange')
      // console.log(this.currentSelect.startRowIndex)
      // console.log(this.currentSelect.startColumnIndex)
      if (this.currentSelect.startRowIndex > 0 && this.currentSelect.startColumnIndex > 0) {
        if (this.currentSelect.isEditMode) {
          this.handleClickEditSelection()
        } else {
          // 重置光标位置
          this.cursor = {
            xAxisIndex: 0,
            yAxisIndex: 0,
            posX: 3,
            posY: 3,
            height: 18
          }
          // 重置框选
          this.selection = {
            xAxisVector: 0,
            yAxisVector: 0
          }
          this.inputCount = 0
        }
        this.$nextTick(() => {
          this.$refs.CellTextarea.focus()
          this.editContentContext = this.$refs.editContent.getContext('2d')
          this.editSelectionContext = this.$refs.editSelection.getContext('2d')
        })
      }
    }
  },
  mounted () {
    this.editContentContext = this.$refs.editContent.getContext('2d')
    this.editSelectionContext = this.$refs.editSelection.getContext('2d')
    this.$refs.CellTextarea.focus()
    // 处理单元格有中文输入、有候选词、一连串操作的情况
    this.$refs.CellTextarea.addEventListener('compositionstart', () => {
      this.editLock = true
    })
    this.$refs.CellTextarea.addEventListener('compositionend', (e) => {
      if (this.editLock) {
        this.editLock = false
        const inputValue = e.data
        this.handleChangeTableData(inputValue)
      }
    })
    // 绑定粘贴事件
    this.$refs.CellTextarea.addEventListener('paste', this.handleCellPaste)
    // 绑定粘贴事件
    this.$refs.CellTextarea.addEventListener('copy', this.handleCellCopy)
  },
  methods: {
    initEventListener () {
      addEventListener(window, 'updateScrollX', this.handleSheetScrollX)
      addEventListener(window, 'updateScrollY', this.handleSheetScrollY)
      addEventListener(window, 'mousedown', this.handleEditSelectionMouseDown)
      addEventListener(window, 'mouseup', this.handleEditSelectionMouseUp)
    },
    // 处理表格滚动
    handleSheetScrollX (e) {
      // 当鼠标向左移(即正数)，表格则是向右移动(即负数)
      // 表格偏移量 = 鼠标偏移量 * 表格缩放比例 * 内容宽度与可视宽度的比例
      if (this.isSelectCurrentSheet) {
        this.scrollX = Math.round(e.detail.scrollX * this.ratio * e.detail.sheetMoveRatio)
      }
    },
    // 处理表格滚动
    handleSheetScrollY (e) {
      // 当鼠标向左移(即正数)，表格则是向右移动(即负数)
      // 表格偏移量 = 鼠标偏移量 * 表格缩放比例 * 内容宽度与可视宽度的比例
      if (this.isSelectCurrentSheet) {
        this.scrollY = Math.round(e.detail.scrollY * this.ratio * e.detail.sheetMoveRatio)
      }
    },
    drawEditSelection () {
      const ctx = this.editSelectionContext
      clearContext(ctx, this.cellWidth, this.cellHeight)
      const xAxisVector = this.selection.xAxisVector
      // 获取内容的开始位置
      let startX = this._getContentStartX({
        textAlign: this.cell.format.textAlign,
        cellWidth: this.cellWidth
      })
      const xAxisIndex = this.cursor.xAxisIndex
      for (let i = 0, len = xAxisIndex; i < len; i++) {
        startX += this.cellSelectionMap[i]
      }
      // 框选宽度
      let width = 0
      if (xAxisVector > 0) {
        // 根据第一个位置，获取开始位置
        // 根据框选索引，获取选择框宽度
        for (let i = xAxisIndex, len = xAxisIndex + xAxisVector; i < len; i++) {
          width += this.cellSelectionMap[i]
        }
      } else if (xAxisVector < 0) {
        // 根据第一个位置，获取开始位置
        // 根据框选索引，获取选择框宽度
        for (let i = xAxisIndex + xAxisVector, len = xAxisIndex; i < len; i++) {
          width += this.cellSelectionMap[i]
        }
        width = -width
      }
      // 绘制背景颜色
      drawFillRect({
        ctx: ctx,
        startX: startX,
        startY: 8,
        width: width,
        height: 18,
        color: 'RGBA(50, 50, 50, 0.35)'
      })
    },
    // 根据单元格内容 生成选择Map
    _generateCellSelectionMap ({ ctx, textAlign, content }) {
      this.cellSelectionMap = []
      // 计算每个文字的宽度
      const chinesePattern = new RegExp('[\u4E00-\u9FA5]+')
      const englishPattern = new RegExp('[A-Za-z]+')
      const numberPattern = new RegExp('^[0-9]*$')
      for (let i = 0, len = content.length; i < len; i++) {
        const text = content[i]
        if (chinesePattern.test(text)) {
          // 判断是否为中文
          this.cellSelectionMap.push(Number(ctx.measureText(text).width) + 1.925)
        } else if (englishPattern.test(text)) {
          // 判断是否为英文
          this.cellSelectionMap.push(Number(ctx.measureText(text).width) + 1.125)
        } else if (numberPattern.test(text)) {
          // 判断是否为数字
          this.cellSelectionMap.push(Number(ctx.measureText(text).width) + 1.125)
        } else {
          // 判断是否为英文
          this.cellSelectionMap.push(Number(ctx.measureText(text).width) + 1.125)
        }
      }
    },
    // 获取文本宽度
    _getTextWidth ({ ctx, text }) {
      let textWidth = ctx.measureText(text).width
      const chinesePattern = new RegExp('[\u4E00-\u9FA5]+')
      const englishPattern = new RegExp('[A-Za-z]+')
      const numberPattern = new RegExp('^[0-9]*$')
      for (let i = 0, len = text.length; i < len; i++) {
        const char = text[i]
        if (chinesePattern.test(char)) {
          // 判断是否为中文
          textWidth += 1.925
        } else if (englishPattern.test(char)) {
          // 判断是否为英文
          textWidth += 1.125
        } else if (numberPattern.test(char)) {
          // 判断是否为数字
          textWidth += 1.125
        } else {
          // 判断是否为英文
          textWidth += 1.125
        }
      }
      return textWidth
    },
    // 获取内容的起始X坐标
    _getContentStartX ({ textAlign, cellWidth }) {
      let startX = 0
      if (textAlign === 'start' || textAlign === 'left') {
        // 左对齐的文字：
        // 从6开始计算，逐个获取文字宽度叠加，即可获取到点击哪一个字，再根据字宽除以一半，就知道是点击文字的坐标还是右边，即可知道光标位置
        startX = 6
      } else if (textAlign === 'center') {
        // 居中对齐的文字：
        // 先获取单元格宽度和所有文字宽度，将单元格宽度除以一半，求出最左侧的初始位置，然后逐个获取文字宽度叠加，即可获取到点击哪一个字，再根据字宽除以一半，就知道是点击文字的坐标还是右边，即可知道光标位置
        startX = cellWidth / 2 - this.contentWidth / 2
      } else if (textAlign === 'end' || textAlign === 'right') {
        // 右对齐的文字：
        // 先获取单元格宽度和所有文字宽度，求出最左侧的初始位置，然后逐个获取文字宽度叠加，即可获取到点击哪一个字，再根据字宽除以一半，就知道是点击文字的坐标还是右边，即可知道光标位置
        startX = cellWidth - this.contentWidth - 6
      }
      return startX
    },
    /**
     * 更新光标位置
     * @param { Object } ctx - canvas 上下文
     * @param { Object } textAlign - 文字对齐方式
     * @param { String } content - 内容
     * @param { Number } cellWidth - 单元格宽度
     * @param { Number } clickX - 点击位置X
     * @param { Number } clickY - 点击位置Y
     */
    _updateCursorPos ({ ctx, textAlign, content, cellWidth, clickX, clickY }) {
      // console.log('ctx:', ctx)
      // console.log('content:', content)
      // console.log('cellWidth:', cellWidth)
      // console.log('clickX:', clickX)
      // console.log('clickY:', clickY)
      // 根据单元格内容生成选择Map
      this._generateCellSelectionMap({
        ctx: ctx,
        textAlign: textAlign,
        content: String(content)
      })
      // 文字宽度
      this.contentWidth = this._getTextWidth({
        ctx: ctx,
        text: String(content)
      })
      let startX = 0
      if (textAlign === 'start' || textAlign === 'left') {
        // 左对齐的文字：
        // 从6开始计算，逐个获取文字宽度叠加，即可获取到点击哪一个字，再根据字宽除以一半，就知道是点击文字的坐标还是右边，即可知道光标位置
        startX = 6
      } else if (textAlign === 'center') {
        // 居中对齐的文字：
        // 先获取单元格宽度和所有文字宽度，将单元格宽度除以一半，求出最左侧的初始位置，然后逐个获取文字宽度叠加，即可获取到点击哪一个字，再根据字宽除以一半，就知道是点击文字的坐标还是右边，即可知道光标位置
        startX = cellWidth / 2 - this.contentWidth / 2
      } else if (textAlign === 'end' || textAlign === 'right') {
        // 右对齐的文字：
        // 先获取单元格宽度和所有文字宽度，求出最左侧的初始位置，然后逐个获取文字宽度叠加，即可获取到点击哪一个字，再根据字宽除以一半，就知道是点击文字的坐标还是右边，即可知道光标位置
        startX = cellWidth - this.contentWidth - 6
      }
      let cursorIndex = 0
      for (let len = this.cellSelectionMap.length; cursorIndex < len; cursorIndex++) {
        if (startX < clickX) {
          startX += this.cellSelectionMap[cursorIndex]
        } else {
          break
        }
      }
      this.cursor.posX = startX
      this.cursor.posY = (this.cellHeight / 2) - 9
      this.cursor.xAxisIndex = cursorIndex
    },
    _updateCursorEndIndex ({ ctx, textAlign, content, cellWidth, clickX, clickY }) {
      // console.log('ctx:', ctx)
      // console.log('content:', content)
      // console.log('cellWidth:', cellWidth)
      // console.log('clickX:', clickX)
      // console.log('clickY:', clickY)
      // 根据单元格内容生成选择Map
      this._generateCellSelectionMap({
        ctx: ctx,
        textAlign: textAlign,
        content: String(content)
      })
      // 文字宽度
      this.contentWidth = this._getTextWidth({
        ctx: ctx,
        text: String(content)
      })
      let startX = 0
      if (textAlign === 'start' || textAlign === 'left') {
        // 左对齐的文字：
        // 从6开始计算，逐个获取文字宽度叠加，即可获取到点击哪一个字，再根据字宽除以一半，就知道是点击文字的坐标还是右边，即可知道光标位置
        startX = 6
      } else if (textAlign === 'center') {
        // 居中对齐的文字：
        // 先获取单元格宽度和所有文字宽度，将单元格宽度除以一半，求出最左侧的初始位置，然后逐个获取文字宽度叠加，即可获取到点击哪一个字，再根据字宽除以一半，就知道是点击文字的坐标还是右边，即可知道光标位置
        startX = cellWidth / 2 - this.contentWidth / 2
      } else if (textAlign === 'end' || textAlign === 'right') {
        // 右对齐的文字：
        // 先获取单元格宽度和所有文字宽度，求出最左侧的初始位置，然后逐个获取文字宽度叠加，即可获取到点击哪一个字，再根据字宽除以一半，就知道是点击文字的坐标还是右边，即可知道光标位置
        startX = cellWidth - this.contentWidth - 6
      }
      let cursorIndex = 0
      for (let len = this.cellSelectionMap.length; cursorIndex < len; cursorIndex++) {
        if (startX < clickX) {
          startX += this.cellSelectionMap[cursorIndex]
        } else {
          break
        }
      }
      this.cursor.posX = startX
      this.cursor.posY = (this.cellHeight / 2) - 9
      this.cursor.xAxisIndex = cursorIndex
    },
    /**
     * 根据文字位置，更新光标位置
     * @param { Object } ctx - canvas 上下文
     * @param { Object } textAlign - 文字对齐方式
     * @param { String } content - 内容
     * @param { Number } cellWidth - 单元格宽度
     * @param { Number } clickX - 点击位置X
     */
    _updateCursorPosByCursorIndex ({ ctx, textAlign, content, cellWidth, cursorIndex }) {
      // console.log('ctx:', ctx)
      // console.log('content:', content)
      // console.log('cellWidth:', cellWidth)
      // console.log('cursorIndex:', cursorIndex)
      // 根据单元格内容生成选择Map
      this._generateCellSelectionMap({
        ctx: ctx,
        content: String(content)
      })
      // 文字宽度
      this.contentWidth = this._getTextWidth({
        ctx: ctx,
        text: String(content)
      })
      let startX = 0
      if (textAlign === 'start' || textAlign === 'left') {
        // 左对齐的文字：
        // 从6开始计算，逐个获取文字宽度叠加，即可获取到点击哪一个字，再根据字宽除以一半，就知道是点击文字的坐标还是右边，即可知道光标位置
        startX = 6
      } else if (textAlign === 'center') {
        // 居中对齐的文字：
        // 先获取单元格宽度和所有文字宽度，将单元格宽度除以一半，求出最左侧的初始位置，然后逐个获取文字宽度叠加，即可获取到点击哪一个字，再根据字宽除以一半，就知道是点击文字的坐标还是右边，即可知道光标位置
        startX = cellWidth / 2 - this.contentWidth / 2
      } else if (textAlign === 'end' || textAlign === 'right') {
        // 右对齐的文字：
        // 先获取单元格宽度和所有文字宽度，求出最左侧的初始位置，然后逐个获取文字宽度叠加，即可获取到点击哪一个字，再根据字宽除以一半，就知道是点击文字的坐标还是右边，即可知道光标位置
        startX = cellWidth - this.contentWidth - 6
      }
      // 查询光标X坐标
      for (let i = 0, len = this.cellSelectionMap.length; i < len; i++) {
        if (cursorIndex > i) {
          startX += this.cellSelectionMap[i]
        } else {
          break
        }
      }
      this.cursor.xAxisIndex = cursorIndex
      this.cursor.posX = startX
      this.cursor.posY = (this.cellHeight / 2) - 9
    },
    /**
     * 根据向量
     * @param { String } vector - 向量
     */
    updateCursorPosByVector ({ vector }) {
      // 判断是否超出移动范围
      if (this.cursor.xAxisIndex + vector <= this.cellSelectionMap.length && this.cursor.xAxisIndex + vector > -1) {
        let startX = 0
        if (this.cell.format.textAlign === 'start' || this.cell.format.textAlign === 'left') {
          // 左对齐的文字：
          // 从6开始计算，逐个获取文字宽度叠加，即可获取到点击哪一个字，再根据字宽除以一半，就知道是点击文字的坐标还是右边，即可知道光标位置
          startX = 6
        } else if (this.cell.format.textAlign === 'center') {
          // 居中对齐的文字：
          // 先获取单元格宽度和所有文字宽度，将单元格宽度除以一半，求出最左侧的初始位置，然后逐个获取文字宽度叠加，即可获取到点击哪一个字，再根据字宽除以一半，就知道是点击文字的坐标还是右边，即可知道光标位置
          startX = this.cellWidth / 2 - this.contentWidth / 2
        } else if (this.cell.format.textAlign === 'end' || this.cell.format.textAlign === 'right') {
          // 右对齐的文字：
          // 先获取单元格宽度和所有文字宽度，求出最左侧的初始位置，然后逐个获取文字宽度叠加，即可获取到点击哪一个字，再根据字宽除以一半，就知道是点击文字的坐标还是右边，即可知道光标位置
          startX = this.cellWidth - this.contentWidth - 6
        }
        // 查询光标X坐标
        for (let i = 0, len = this.cellSelectionMap.length; i < len; i++) {
          console.log(this.cellSelectionMap[i])
          if (this.cursor.xAxisIndex + vector > i) {
            startX += this.cellSelectionMap[i]
          } else {
            break
          }
        }
        this.cursor.xAxisIndex = this.cursor.xAxisIndex + vector
        this.cursor.posX = startX
        this.cursor.posY = (this.cellHeight / 2) - 9
      }
    },
    /**
     * 根据坐标获取光标索引
     * @param { Object } ctx - canvas 上下文
     * @param { Object } textAlign - 文字对齐方式
     * @param { String } content - 内容
     * @param { Number } cellWidth - 单元格宽度
     * @param { Number } clickX - 点击位置X
     */
    _getCursorIndexByPos ({ ctx, textAlign, content, cellWidth, clickX }) {
      // console.log('ctx:', ctx)
      // console.log('textAlign:', textAlign)
      // console.log('content:', content)
      // console.log('cellWidth:', cellWidth)
      // console.log('clickX:', clickX)
      // 根据单元格内容生成选择Map
      this._generateCellSelectionMap({
        ctx: ctx,
        content: String(content)
      })
      // 文字宽度
      this.contentWidth = this._getTextWidth({
        ctx: ctx,
        text: String(content)
      })
      let startX = 0
      if (textAlign === 'start' || textAlign === 'left') {
        // 左对齐的文字：
        // 从6开始计算，逐个获取文字宽度叠加，即可获取到点击哪一个字，再根据字宽除以一半，就知道是点击文字的坐标还是右边，即可知道光标位置
        startX = 6
      } else if (textAlign === 'center') {
        // 居中对齐的文字：
        // 先获取单元格宽度和所有文字宽度，将单元格宽度除以一半，求出最左侧的初始位置，然后逐个获取文字宽度叠加，即可获取到点击哪一个字，再根据字宽除以一半，就知道是点击文字的坐标还是右边，即可知道光标位置
        startX = this.cellWidth / 2 - this.contentWidth / 2
      } else if (textAlign === 'end' || textAlign === 'right') {
        // 右对齐的文字：
        // 先获取单元格宽度和所有文字宽度，求出最左侧的初始位置，然后逐个获取文字宽度叠加，即可获取到点击哪一个字，再根据字宽除以一半，就知道是点击文字的坐标还是右边，即可知道光标位置
        startX = this.cellWidth - this.contentWidth - 6
      }
      let cursorIndex = 0
      for (let len = this.cellSelectionMap.length; cursorIndex < len; cursorIndex++) {
        if (startX < clickX) {
          startX += this.cellSelectionMap[cursorIndex]
        } else {
          break
        }
      }
      return cursorIndex
    },
    // 处理选择区域鼠标点下
    handleEditSelectionMouseDown (e) {
      console.log('handleEditSelectionMouseDown')
      // console.log('event:', e)
      clearContext(this.editSelectionContext, this.cellWidth, this.cellHeight)
      // 判断是否点击到选择区域
      if (event.target.className === 'edit-selection') {
        addEventListener(window, 'mousemove', this.handleEditSelectionMouseMove)
        let offsetX = 0
        let offsetY = 0
        if (event) {
          offsetX = event.offsetX
          offsetY = event.offsetY
        } else {
          // 根据鼠标点击位置和单元格起始位置，计算出单元格相对点击位置
          offsetX = this.currentSelect.clickX - this.currentSelect.cellX
          offsetY = this.currentSelect.clickY - this.currentSelect.cellY
        }
        // 根据鼠标点击位置，获取光标索引
        const cursorIndex = this._getCursorIndexByPos({
          ctx: this.editContentContext,
          textAlign: this.cell.format.textAlign,
          content: this.cell[this.customTableDataKey],
          cellWidth: this.cellWidth,
          clickX: offsetX,
          clickY: offsetY
        })
        console.log('cursorIndex:', cursorIndex)
        this.selectedIndex = [cursorIndex]
        this.cursor.xAxisIndex = cursorIndex
        this.selection = {
          xAxisVector: 0,
          yAxisVector: 0
        }
      }
    },
    // 处理选择区域鼠标松开
    handleEditSelectionMouseUp (event) {
      console.log('handleEditSelectionMouseUp')
      console.log('event:', event)
      removeEventListener(window, 'mousemove', this.handleEditSelectionMouseMove)
      // 判断是否点击到选择区域
      if (event.target.className === 'edit-selection') {
        if (this.cell.contentType === 'text') {
          let offsetX = 0
          let offsetY = 0
          if (event) {
            offsetX = event.offsetX
            offsetY = event.offsetY
          } else {
            // 根据鼠标点击位置和单元格起始位置，计算出单元格相对点击位置
            offsetX = this.currentSelect.clickX - this.currentSelect.cellX
            offsetY = this.currentSelect.clickY - this.currentSelect.cellY
          }
          // console.log('offsetX:', offsetX)
          // console.log('offsetY:', offsetY)
          this.$refs.CellTextarea.focus()
          // 更新光标位置
          this._updateCursorPos({
            ctx: this.editContentContext,
            textAlign: this.cell.format.textAlign,
            content: this.cell[this.customTableDataKey],
            cellWidth: this.cellWidth,
            clickX: offsetX,
            clickY: offsetY
          })
        }
      }
    },
    // 处理选择区域鼠标移动
    handleEditSelectionMouseMove (event) {
      // console.log('handleEditSelectionMouseMove')
      // console.log('event:', event)
      let offsetX = 0
      let offsetY = 0
      if (event) {
        offsetX = event.offsetX
        offsetY = event.offsetY
      } else {
        // 根据鼠标点击位置和单元格起始位置，计算出单元格相对点击位置
        offsetX = this.currentSelect.clickX - this.currentSelect.cellX
        offsetY = this.currentSelect.clickY - this.currentSelect.cellY
      }
      // 根据鼠标点击位置，获取光标索引
      const cursorIndex = this._getCursorIndexByPos({
        ctx: this.editContentContext,
        textAlign: this.cell.format.textAlign,
        content: this.cell[this.customTableDataKey],
        cellWidth: this.cellWidth,
        clickX: offsetX,
        clickY: offsetY
      })
      const xAxisIndex = this.cursor.xAxisIndex
      this.selection.xAxisVector = cursorIndex - xAxisIndex
      this.drawEditSelection()
    },
    // 处理点击选择区域
    handleClickEditSelection (event) {
      console.log('handleClickEditSelection')
      if (this.cell.contentType === 'text') {
        let offsetX = 0
        let offsetY = 0
        if (event) {
          offsetX = event.offsetX
          offsetY = event.offsetY
        } else {
          // 根据鼠标点击位置和单元格起始位置，计算出单元格相对点击位置
          offsetX = this.currentSelect.clickX - this.currentSelect.cellX
          offsetY = this.currentSelect.clickY - this.currentSelect.cellY
        }
        // console.log('offsetX:', offsetX)
        // console.log('offsetY:', offsetY)
        this.$refs.CellTextarea.focus()
        // 更新光标位置
        this._updateCursorPos({
          ctx: this.editContentContext,
          textAlign: this.cell.format.textAlign,
          content: this.cell[this.customTableDataKey],
          cellWidth: this.cellWidth,
          clickX: offsetX,
          clickY: offsetY
        })
      }
    },
    // 复制
    handleCellCopy (e) {
      const isIE = IEVersion() > -1
      const clipboard = isIE ? window.clipboardData : e.clipboardData
      const content = this.cell.content
      // 判断是否为选择模式
      if (this.currentSelect.isEditMode) {
        // 判断是否已框选
        if (this.selection.xAxisVector !== 0) {
          let startIndex = 0
          let vector = 0
          if (this.selection.xAxisVector > 0) {
            startIndex = this.cursor.xAxisIndex - this.selection.xAxisVector
            vector = this.selection.xAxisVector
          } else if (this.selection.xAxisVector < 0) {
            startIndex = this.cursor.xAxisIndex
            vector = -this.selection.xAxisVector
          }
          // 复制框选内容
          clipboard.setData('text/plain', content.substr(startIndex, vector))
        }
      } else {
        // 若不是选择模式，则复制单元格所有内容
        clipboard.setData('text/plain', content)
      }
      e.preventDefault()
    },
    // 粘贴
    // ClipboardEvent.clipboardData: https://developer.mozilla.org/zh-CN/docs/Web/API/ClipboardEvent/clipboardData
    // 常见 MIME 类型列表: https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Complete_list_of_MIME_types
    handleCellPaste (e) {
      console.log('handleCellPaste')
      console.log('event:', e)
      // 阻止浏览器默认事件 防止触发input事件
      e.preventDefault()
      // 是否为IE浏览器
      const isIE = IEVersion() > -1
      // 现代浏览器 e.clipboardData
      // IE浏览器 window.clipboardData
      const clipboard = isIE ? window.clipboardData : e.clipboardData
      let clipboardData = void 0
      if (isIE) {
        // IE浏览器只能用 Text 参数
        // clipboard.types clipboard.items 为 Null
        clipboardData = clipboard.getData('Text')
      } else {
        console.log('clipboard:', clipboard)
        console.log('clipboard.types:', clipboard.types)
        console.log('clipboard.items:', clipboard.items)
        for (const item of clipboard.items) {
          console.log(item)
        }
        // 判断类型
        // 目前已知文件，text/html，text/plain
        // HTML
        clipboardData = clipboard.getData('text/html')
        // 文字
        clipboardData = clipboard.getData('text/plain')
      }
      console.log('clipboardData:', clipboardData)
      this.parsePasteText(clipboardData)
    },
    // 输入
    handleCellInput (e) {
      console.log('handleCellInput')
      console.log(e)
      const inputType = e.inputType
      if (inputType) {
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
            this.handleChangeTableData(inputValue)
          }
        }
      } else {
        // 兼容无输入类型的浏览器
        const inputValue = e.target.value
        console.log('inputValue:', inputValue)
        console.log('editLock', this.editLock)
        if (!this.editLock) {
          // 修改单元格内容
          this.handleChangeTableData(inputValue)
        }
      }
    },
    // 删除
    handleCellDelete (e) {
      console.log(e)
      this.$emit('deleteTableData', {
        columnIndex: this.currentSelect.startColumnIndex,
        rowIndex: this.currentSelect.startRowIndex,
        cursorIndex: this.cursor.xAxisIndex,
        selectionXAxisVector: this.selection.xAxisVector
      })
      let cursorIndex = 0
      if (this.cursor.xAxisIndex > 0) {
        if (this.selection.xAxisVector > 0) {
          cursorIndex = this.cursor.xAxisIndex > 0 ? this.cursor.xAxisIndex - this.selection.xAxisVector : 0
        } else if (this.selection.xAxisVector < 0) {
          cursorIndex = this.cursor.xAxisIndex > 0 ? this.cursor.xAxisIndex : 0
        } else {
          cursorIndex = this.cursor.xAxisIndex - 1
        }
      }
      // 更新光标位置
      this._updateCursorPosByCursorIndex({
        ctx: this.editContentContext,
        textAlign: this.cell.format.textAlign,
        content: this.cell[this.customTableDataKey],
        cellWidth: this.cellWidth,
        cursorIndex: cursorIndex
      })
      // 重置框选
      this.selection = {
        xAxisVector: 0,
        yAxisVector: 0
      }
    },
    // 修改日期
    handleChangeDate (date, dateString) {
      // 修改单元格内容
      this.$emit('changeTableData', {
        columnIndex: this.currentSelect.startColumnIndex,
        rowIndex: this.currentSelect.startRowIndex,
        dataType: 'date',
        data: date
      })
    },
    // 修改表格数据
    handleChangeTableData (inputValue) {
      let isCover = false // 是否覆盖填写
      // 不是编辑模式和输入次数为0的时候，则删除
      if (!this.currentSelect.isEditMode && this.inputCount === 0) {
        isCover = true
      }
      this.inputCount += 1 // 累加输入次数
      // 修改表格数据
      this.$emit('changeTableData', {
        columnIndex: this.currentSelect.startColumnIndex,
        rowIndex: this.currentSelect.startRowIndex,
        dataType: 'text',
        data: inputValue,
        cursorIndex: this.cursor.xAxisIndex,
        selectionXAxisVector: this.selection.xAxisVector,
        isCover: isCover
      })
      let cursorIndex = this.cursor.xAxisIndex + inputValue.length
      if (this.cursor.xAxisIndex > 0 && this.selection.xAxisVector > 0) {
        cursorIndex = this.cursor.xAxisIndex > 0 ? this.cursor.xAxisIndex - this.selection.xAxisVector + inputValue.length : 0
      }
      // 更新光标位置
      this._updateCursorPosByCursorIndex({
        ctx: this.editContentContext,
        textAlign: this.cell.format.textAlign,
        content: this.cell[this.customTableDataKey],
        cellWidth: this.cellWidth,
        cursorIndex: cursorIndex
      })
      // 重置框选
      this.selection = {
        xAxisVector: 0,
        yAxisVector: 0
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
      const emitData = []
      if (escapeInputValue.indexOf('%09') > -1 || escapeInputValue.indexOf('%0A') > -1) {
        const rows = this.queryAllRow(escapeInputValue)
        // 遍历每一行
        for (let r = 0, len1 = rows.length; r < len1; r++) {
          const row = rows[r]
          // 查询行的全部单元格
          const cells = this.queryAllCell(row)
          // 遍历单元格
          for (let c = 0, len2 = cells.length; c < len2; c++) {
            const cell = cells[c]
            const cellValue = unescape(cell)
            emitData.push({
              columnIndex: this.currentSelect.startColumnIndex + c,
              rowIndex: this.currentSelect.startRowIndex + r,
              dataType: 'text',
              data: cellValue,
              cursorIndex: this.cursor.xAxisIndex,
              isCover: true
            })
          }
        }
        this.$emit('pasteTableData', emitData)
      } else {
        // 输入模式
        // 修改单元格内容
        this.$emit('pasteTableData', [{
          columnIndex: this.currentSelect.startColumnIndex,
          rowIndex: this.currentSelect.startRowIndex,
          dataType: 'text',
          data: data,
          cursorIndex: this.cursor.xAxisIndex,
          selectionXAxisVector: this.selection.xAxisVector,
          isCover: !this.currentSelect.isEditMode ||
            (!this.currentSelect.isEditMode && this.selection.xAxisVector === 0) // 若向量为0，则覆盖录入
        }])
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
      // 兼容最后无换行符
      if (inputValue.substring(startIndex).length > 0) {
        rows.push(inputValue.substring(startIndex))
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

<style lang="scss">
.edit-container {
  position: absolute;

  .edit-selection {
    opacity: 0;
    position: absolute;
    top: 0;
    left: 0;
    cursor: text;
  }

  .edit-border {
    position: absolute;
    top: 0;
    left: 0;
    outline: none;
    box-sizing: content-box;
    resize: none;
    background: RGBA(0, 0, 0, 0);
    border: 2px solid RGB(34, 167, 242);
    transform: translate(-2.5px, -2.5px);
  }

  .edit-content {
    position: absolute;
  }

  .edit-cursor {
    z-index: 3;
    width: 1px;
    background: #000;
    vertical-align: center;
    animation: edit-cursor 1s ease infinite;
    position: absolute;
  }
}

.edit-textarea {
  opacity: 0;
  z-index: -1;
  position: absolute;
  top: 13px;
  left: 0;
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
