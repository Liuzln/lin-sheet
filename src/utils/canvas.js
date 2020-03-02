/**
 * 清空画板
 * @param { Object } ctx - context 对象
 * @param { Number } width - 宽度
 * @param { Number } height - 高度
 */
export function clearContext (ctx, width = 0, height = 0) {
  ctx.clearRect(0, 0, width, height)
}

/**
 * 绘制竖线
 * @param { Object } ctx - context 对象
 * @param { Number } startX - 起始X轴坐标
 * @param { Number } startY - 起始Y轴坐标
 * @param { Number } length - 长度
 * @param { String } color - 线段颜色
 * @param { Number } lineWidth - 线宽
 */
export function drawVerticalLine ({ ctx, startX = 0, startY = 0, length, color, lineWidth = 1 }) {
  ctx.beginPath()
  ctx.moveTo(startX, startY)
  ctx.lineTo(startX, startY + length)
  ctx.lineWidth = lineWidth
  ctx.strokeStyle = color
  ctx.closePath()
  ctx.stroke()
}

/**
 * 绘制横线
 * @param { Object } ctx - context 对象
 * @param { Number } startX - 起始X轴坐标
 * @param { Number } startY - 起始Y轴坐标
 * @param { Number } length - 长度
 * @param { String } color - 线段颜色
 * @param { Number } lineWidth - 线宽
 */
export function drawHorizontalLine ({ ctx, startX = 0, startY = 0, length, color, lineWidth = 1 }) {
  ctx.beginPath()
  ctx.moveTo(startX, startY)
  ctx.lineTo(startX + length, startY)
  ctx.lineWidth = lineWidth
  ctx.strokeStyle = color
  ctx.closePath()
  ctx.stroke()
}

/**
 * 绘制填充矩形
 * @param { Object } ctx - context 对象
 * @param { Number } startX - 起始X轴坐标
 * @param { Number } startY - 起始Y轴坐标
 * @param { Number } width - 宽度
 * @param { Number } height - 高度
 * @param { String } color - 填充颜色
 */
export function drawFillRect ({ ctx, startX, startY, width, height, color }) {
  ctx.fillStyle = color
  ctx.fillRect(startX, startY, width, height)
}

/**
 * 绘制文本
 * @param { Object } ctx - context 对象
 * @param { Number } x - X轴坐标
 * @param { Number } y - Y轴坐标
 * @param { Number } content - 文本内容
 * @param { Number } fontSize - 文本的字体大小
 * @param { String } fontFamily - 文本的字体
 * @param { String } fontColor - 文本的字体颜色
 * @param { String } textBaseline - 文本基线
 * @param { String } textAlign - 文本对齐
 */
export function drawText ({ ctx, x, y, content, fontSize, fontFamily, fontColor,
  textBaseline = 'middle', textAlign = 'center' }) {
  // 设置字体
  ctx.font = `${fontSize} ${fontFamily}`
  // 设置颜色
  ctx.fillStyle = fontColor
  // 设置水平对齐方式
  ctx.textBaseline = textBaseline
  // 设置垂直对齐方式
  ctx.textAlign = textAlign
  // 绘制文字（内容，x坐标，y坐标）
  ctx.fillText(content, x, y)
}
