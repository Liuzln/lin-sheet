export function drawVerticalLine ({ ctx, startX = 0, startY = 0, length, color, lineWidth = 1 }) {
  ctx.beginPath()
  ctx.moveTo(startX, startY)
  ctx.lineTo(startX, startY + length)
  ctx.lineWidth = lineWidth
  ctx.strokeStyle = color
  ctx.closePath()
  ctx.stroke()
}

export function drawHorizontalLine ({ ctx, startX = 0, startY = 0, length, color, lineWidth = 1 }) {
  ctx.beginPath()
  ctx.moveTo(startX, startY)
  ctx.lineTo(startX + length, startY)
  ctx.lineWidth = lineWidth
  ctx.strokeStyle = color
  ctx.closePath()
  ctx.stroke()
}

export function drawFillRect ({ ctx, startX, startY, width, height, color }) {
  ctx.fillStyle = color
  ctx.fillRect(startX, startY, width, height)
}

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
