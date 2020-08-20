// Event 兼容性处理
const _eventCompat = (event) => {
  const type = event.type
  // 滚轮事件 兼容 Firefox
  if (type === 'DOMMouseScroll' || type === 'mousewheel') {
    event.delta = (event.wheelDelta) ? event.wheelDelta / 120 : -(event.detail || 0) / 3
  }
  // 触发事件元素 兼容 IE
  if (event.srcElement && !event.target) {
    event.target = event.srcElement
  }
  // 阻止默认操作 兼容 IE
  if (!event.preventDefault && event.returnValue !== undefined) {
    event.preventDefault = () => {
      event.returnValue = false
    }
  }
  // 其他兼容性处理
  return event
}

const eventList = []

// 添加缩放监听器
export function addEventListener (el, type, fn, capture) {
  // 现代浏览器
  if (window.addEventListener) {
    // 兼容鼠标滚轮事件
    // Firefox 的鼠标滚轮事件：DOMMouseScroll
    // 参考文章：https://www.zhangxinxu.com/wordpress/2013/04/js-mousewheel-dommousescroll-event/
    if (type === 'mousewheel' && document.mozFullScreen !== undefined) {
      type = 'DOMMouseScroll'
    }
    // 添加事件监听
    const handler = (event) => {
      fn.call(this, _eventCompat(event))
    }
    eventList.push({
      'element': el,
      'type': type,
      'fn': fn,
      'capture': capture,
      'handler': handler
    })
    el.addEventListener(type, handler, capture || false)
  // IE浏览器
  } else if (window.attachEvent) {
    el.attachEvent('on' + type, (event) => {
      event = event || window.event
      fn.call(el, _eventCompat(event))
    })
  }
}

// 移除监听器
export function removeEventListener (el, type, fn, capture) {
  // 现代浏览器
  if (window.removeEventListener) {
    if (type === 'mousewheel' && document.mozFullScreen !== undefined) {
      type = 'DOMMouseScroll'
    }
    for (let i = 0; i < eventList.length; i++) {
      const event = eventList[i]
      if (event.fn === fn) {
        // 移除事件监听
        el.removeEventListener(type, event.handler, capture || false)
        eventList.splice(i, 1)
      }
    }
  // IE浏览器
  } else if (window.detachEvent) {
    el.detachEvent('on' + type, (event) => {
      event = event || window.event
      fn.call(el, _eventCompat(event))
    })
  }
}

// 清空监视器
export function clearEventListener () {
  for (let i = 0; i < eventList.length; i++) {
    const event = eventList[i]
    console.log('event:', event)
    event.element.removeEventListener(
      event.type,
      event.handler,
      event.capture
    )
    eventList.splice(i, 1)
    i--
  }
}
