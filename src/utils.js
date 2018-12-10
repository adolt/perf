/**
 * 检查字符串是否包含片段
 *
 * @param {String} str
 * @param {String} piece
 * @returns {Boolean}
 */
export const includes = (str, piece) => str.indexOf(piece) !== -1

/**
 * 生成一个通过资源路径判断资源是否为 type 类型的函数
 *
 * @param {String} type
 * @returns {Function}
 */
export const isType = type => name => includes(name, type)

/**
 * 通过资源路径判断资源是否为 JavaScript
 *
 * @param {String} name
 * @returns {Boolean}
 */
export const isScript = isType('.js')

/**
 * 通过资源路径判断资源是否为 CSS
 *
 * @param {String} name
 * @returns {Boolean}
 */
export const isStyle = isType('.css')

/**
 * 通过资源路径判断资源是否为图片
 *
 * @param {String} name
 * @returns {Boolean}
 */
export const isImage = name =>
  ['png', 'jpg', 'gif', 'jpeg', 'webp'].some(type => isType(type)(name)) &&
  !['//pr.map.qq.com', '//hm.baidu.com'].some(url => includes(name, url))

/**
 * 通过资源路径判断资源是否为字体
 *
 * @param {String} name
 * @returns {Boolean}
 */
export const isFont = name =>
  ['eot', 'ttf', 'woff', 'woff2', 'svg'].some(type => isType(type)(name))

/**
 * 通过资源路径判断资源是否为 jsonp 请求
 *
 * @param {String} name
 * @returns {Boolean}
 */
export const isJsonp = name => includes(name, 'output=jsonp')

/**
 * 定点格式化数字
 *
 * @param {Number} num
 * @param {Number} [digits=2]
 * @returns {Number}
 */
export const toFixed = (num, digits = 2) => {
  if (!num) return 0

  return +num.toFixed(digits)
}

/**
 * 将数值单位由字节转换为 KB
 *
 * @param {Number} byte
 * @returns {Number}
 */
export const byteToKb = byte => {
  if (!byte) return 0

  return toFixed(byte / Math.pow(2, 10))
}

/**
 * 通过 xhr 发送数据
 *
 * @param {String} endpoint
 * @param {String} data
 */
export const xhrSend = (endpoint, data) => {
  const client = new XMLHttpRequest()

  client.open('POST', endpoint, false) // 同步请求
  client.send(data)
}
