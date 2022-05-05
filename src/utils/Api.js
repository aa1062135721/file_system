
import axios from 'axios'
import { APIMAP } from './ApiMap'
import { Toast } from 'vant';

// axios.defaults.baseURL = process.env.VUE_APP_API + '/index.php/api/'
axios.defaults.baseURL = '/api/index.php/api/'
axios.defaults.timeout = 20000

const initApiConfig = (key, params) => {
  let url = APIMAP[key]
  if (params && params['uid'] && url.indexOf(':uid') > -1) {
    return url.replace(':uid', params['uid'])
  } else if (url.indexOf(':uid') > -1) {
    return url.replace(':uid', '')
  }
  return url
}

let loading = null

axios.interceptors.request.use((config) => {
  loading = Toast.loading({
    message: '加载中...',
    forbidClick: true,
    loadingType: 'spinner',
    duration: 0
  });
  if ((config.params && config.params.hl) || (config.data && config.data.hl)) {
    console.log(111)
  }
  if (config.method === 'get' || config.method === 'delete') {
    config.params = Object.assign(config.params || {})
  } else {
    config.data = Object.assign(config.data || {})
  }
  if (localStorage.getItem('token')) {
    config.headers['userToken'] = 'Bearer ' + localStorage.getItem('token')
  }

  return config
}, (error) => {
  loading.clear()
  return Promise.reject(error)
})

axios.interceptors.response.use((res) => {
  loading.clear()
  if (res.data.code === 301 || res.data.code === 302) {
    return
  }
  if (res.data.status == 0 || res.data.status < 0) {
    Toast.fail(res.data.message);
  }
  return res
}, (error) => {
  loading.clear()
  if (error.message.indexOf('Network Error') !== -1) {
    Toast.fail('请求错误！')

  }
  if (error.code === 'ECONNABORTED' && error.message.indexOf('timeout') !== -1) {
    Toast.fail('网络请求超时，请稍后再试')
  }
  return Promise.reject(error)
})

export default {
  get: (key, params) => {
    const url = initApiConfig(key, params)
    return axios.get(url, { params: params })
  },

  post: (key, data) => {
    const url = initApiConfig(key, data)
    return axios.post(url, data)
  },

  put: (key, data) => {
    const url = initApiConfig(key, data)
    return axios.put(url, data)
  },

  delete: (key, params) => {
    const url = initApiConfig(key, params)
    return axios.delete(url, { params: params })
  },

  download: (key, params) => {
    const url = initApiConfig(key, params)
    return axios({
      url: url,
      params: params,
      method: 'GET',
      responseType: 'blob'
    })
  }
}