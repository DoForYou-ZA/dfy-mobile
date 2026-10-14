import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { clearAccessToken, getAccessToken } from '../core/tokenStorage'
import ENV from '../config/env'

const api = axios.create({
  baseURL: ENV.apiUrl,
  headers: { 'Content-Type': 'application/json', 'X-DFY-Client': 'mobile' },
})

api.interceptors.request.use(async (config) => {
  const token = await getAccessToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      await clearAccessToken()
      await AsyncStorage.removeItem('currentUser')
    }
    return Promise.reject(error)
  }
)

export default api
