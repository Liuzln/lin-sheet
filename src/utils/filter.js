import Vue from 'vue'
import moment from 'moment'
import 'moment/locale/zh-cn'
moment.locale('zh-cn')

// 数字格式化
Vue.filter('NumberFormat', function (value) {
  if (!value) {
    return '0'
  }
  const intPartFormat = value.toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,') // 将整数部分逢三一断
  return intPartFormat
})

// 时间格式化
Vue.filter('moment', function (dataStr, pattern = 'YYYY-MM-DD HH:mm:ss') {
  return moment(dataStr).format(pattern)
})

// 时间格式化
Vue.filter('moment_short_date', function (dataStr, pattern = 'MM-DD') {
  return moment(dataStr).format(pattern)
})

// 时间格式化
Vue.filter('moment_month_day', function (dataStr, pattern = 'MM-DD') {
  return moment(dataStr).format(pattern)
})
