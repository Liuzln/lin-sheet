import { create, all } from 'mathjs'

// create a mathjs instance
const math = create(all)

math.config({
  number: 'BigNumber', // 默认使用 BigNumber
  precision: 16
})

/**
 * 通过表达式解析器 进行计算
 * @param { String } operators 计算公式
 */
export function evaluate (value) {
  return Number(math.format(math.evaluate(value)))
}

export default math
