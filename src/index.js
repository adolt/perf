import UAParser from 'ua-parser-js'
import {
  isScript,
  isStyle,
  isFont,
  isImage,
  isJsonp,
  toFixed,
  byteToKb,
  xhrSend,
} from './utils'

/**
 * 获取资源加载的性能数据
 *
 * @param {PerformanceEntry} resourceEntry
 * @returns {Object}
 */
const getResPerfData = resourceEntry => {
  // "link", "img", "script", "css", "fetch", "xmlhttprequest", "beacon", "other"
  const {
    initiatorType,
    name,
    domainLookupStart,
    domainLookupEnd,
    connectStart,
    connectEnd,
    requestStart,
    responseStart,
    responseEnd,
    transferSize,
  } = resourceEntry

  const ret = {
    '资源路径': name,
    'DNS 查找耗时': toFixed(domainLookupEnd - domainLookupStart),
    '建立 TCP 连接耗时': toFixed(connectEnd - connectStart),
    '请求到响应耗时': toFixed(responseStart - requestStart),
    '请求到响应完成耗时': toFixed(responseEnd - requestStart),
  }

  if (transferSize !== undefined) {
    ret['资源体积'] = byteToKb(transferSize)
  }

  let resType = 'other'

  switch (initiatorType) {
  case 'link':
    /*
      考虑到 <link> 标签会发出 preload 或 prefetch 的请求，
      而不只是用来加载 css 资源，
      所以这里针对资源路径做类型判断。
    */
    if (isScript(name)) {
      resType = 'javascript'
    } else if (isStyle(name)) {
      resType = 'css'
    } else if (isImage(name)) {
      resType = 'image'
    } else {
      resType = isFont(name) ? 'font' : 'other'
    }
    break

  case 'img':
    // 百度统计的请求是通过 new Image 的方式发出的
    resType = isImage(name) ? 'image' : 'other'
    break

  case 'script':
    // 部分 JSONP 请求是以 <script> 方式发出的
    resType = isJsonp(name) ? 'api' : 'javascript'
    break

  case 'css':
    // css 中通常会加载图片或字体资源
    if (isImage(name)) {
      resType = 'image'
    } else {
      resType = isFont(name) ? 'font' : 'other'
    }
    break

  case 'fetch':
  case 'beacon':
  case 'xmlhttprequest':
    resType = 'api'
    break
  }

  ret['资源类型'] = resType

  return ret
}

/**
 * 获取页面加载的性能数据
 *
 * @returns {Object}
 */
const getNavigationTiming = () => {
  const ret = {},
    navigationEntries = window.performance.getEntriesByType('navigation')

  if (!navigationEntries || !navigationEntries.length) return ret

  const {
    domainLookupStart,
    domainLookupEnd,
    connectStart,
    connectEnd,
    requestStart,
    responseStart,
    responseEnd,
    transferSize,
    domContentLoadedEventEnd,
    domComplete,
  } = navigationEntries[0]

  if (transferSize !== undefined) {
    ret['资源体积'] = byteToKb(transferSize)
  }

  ret['DNS 查找耗时'] = toFixed(domainLookupEnd - domainLookupStart)
  ret['建立 TCP 连接耗时'] = toFixed(connectEnd - connectStart)
  ret['请求到响应耗时'] = toFixed(responseStart - requestStart)
  ret['请求到响应完成耗时'] = toFixed(responseEnd - requestStart)
  ret['白屏时间'] = toFixed(domContentLoadedEventEnd)
  ret['加载完成时间'] = toFixed(domComplete)

  // 页面可交互时间并不是 domInteractive 时间点
  // ret['可交互时间'] = domInteractive

  // 如果支持 PerformancePaintTiming API，用确切的 first-contentful-paint 时间点来衡量白屏时间
  const paintEntries = window.performance.getEntriesByType('paint')

  if (paintEntries.length) {
    const fcp = paintEntries.find(({ name }) => name === 'first-contentful-paint')

    if (fcp) ret['白屏时间'] = toFixed(fcp.startTime)
  }

  return ret
}

/**
 * 获取资源加载数据
 *
 * @returns {Array<Object>}
 */
const getResourceTiming = () => {
  const resourceEntries = window.performance.getEntriesByType('resource')

  if (!resourceEntries || !resourceEntries.length) return []

  return resourceEntries.reduce(
    (ret, resourceEntry) => [...ret, getResPerfData(resourceEntry)],
    []
  )
}

/**
 * 获取设备及其它信息
 *
 * @returns {Object}
 */
const getExtraInfo = () => {
  const parser = new UAParser(),
    browser = parser.getBrowser(),
    os = parser.getOS()

  return {
    '浏览器类型': browser.name,
    '浏览器版本': browser.version,
    '系统类型': os.name,
    '系统版本': os.version,
  }
}

/**
 * 发送性能数据
 *
 * @param {Object} data
 */
const logData = data => {
  const dataStr = JSON.stringify(data)
  // TODO: 更换上报 URL
  const endpoint =
    'https://easy-mock.com/mock/5940f4a28ac26d795f00537d/example/logging'

  if ('sendBeacon' in navigator) {
    const success = window.navigator.sendBeacon(endpoint, dataStr)

    if (!success) {
      xhrSend(endpoint, dataStr)
    }
  } else {
    xhrSend(endpoint, dataStr)
  }
}

/**
 * 初始化插件
 *
 * @param {String} project
 * @param {String} version
 */
export const init = ({ project, version }) => {
  if (!window.performance || !window.performance.getEntriesByType) return

  const timestamp = Date.now()

  window.addEventListener(
    'unload',
    () => {
      logData({
        project,
        version,
        timestamp,
        device: getExtraInfo(),
        resource: getResourceTiming(),
        navigation: getNavigationTiming(),
      })
    },
    false
  )
}
