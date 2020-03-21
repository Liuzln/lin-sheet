import axios from 'axios'

class BaseModule {
  constructor () {
    this.$http = axios.create({
      // URL地址
      baseUrl: 'https://sheet.liuzln.com'
    })
    // 响应拦截器
    this.$http.interceptors.response.use(response => {
      // 通过判断 return_code 确认状态
      switch (response.data.return_code) {
        // 正常
        case 0:
          return response.data
        // 默认返回报错
        default:
          return Promise.reject(response)
      }
    })
  }

  get (url, config = {}) {
    return this.$http.get(url, config)
  }

  post (url, data = undefined, config = {}) {
    return this.$http.post(url, data, config)
  }

  put (url, data = undefined, config = {}) {
    return this.$http.put(url, data, config)
  }

  delete (url, config = {}) {
    return this.$http.delete(url, config)
  }
}

export default BaseModule
