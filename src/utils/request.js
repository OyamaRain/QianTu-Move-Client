import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '../router'

const request = axios.create({
  baseURL: '/admin',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.token = token
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

request.interceptors.response.use(
  (response) => {
    const res = response.data
    // 检查响应是否为字符串，如果是，尝试解析为JSON
    let parsedRes = res
    if (typeof res === 'string') {
      try {
        parsedRes = JSON.parse(res)
      } catch (e) {
        // 如果解析失败，返回原始响应
        parsedRes = res
      }
    }
    
    // 处理正常响应
    if (typeof parsedRes === 'object' && parsedRes.code === 1) {
      return parsedRes
    } else {
      // 处理异常响应
      ElMessage.error(typeof parsedRes === 'object' ? parsedRes.msg || '请求失败' : '请求失败')
      return Promise.reject(new Error(typeof parsedRes === 'object' ? parsedRes.msg || '请求失败' : '请求失败'))
    }
  },
  (error) => {
    if (error.response) {
      const status = error.response.status
      switch (status) {
        case 401:
          ElMessage.error('登录已过期，请重新登录')
          localStorage.removeItem('token')
          localStorage.removeItem('userInfo')
          router.push('/login')
          break
        case 403:
          ElMessage.error('没有权限访问')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器错误，请稍后重试')
          break
        default:
          // 处理响应数据为非JSON格式的情况
          const errorMsg = error.response.data && typeof error.response.data === 'object' ? 
            error.response.data.msg : '请求失败'
          ElMessage.error(errorMsg)
      }
    } else if (error.request) {
      ElMessage.error('网络连接异常，请检查网络')
    } else {
      ElMessage.error('请求配置错误')
    }
    return Promise.reject(error)
  }
)

export default request
