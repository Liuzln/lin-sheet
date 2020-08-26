import '@babel/polyfill'

import Vue from 'vue'
import App from './App.vue'

import moment from 'moment'

// 导入图标
// 使用的是 阿里 IconFont
// 地址：https://www.iconfont.cn/
import './assets/icon/iconfont.css'

// mock
import './mock'

import './utils/filter' // global filter

Vue.prototype.$moment = moment

Vue.config.productionTip = false

new Vue({
  render: h => h(App)
}).$mount('#app')
