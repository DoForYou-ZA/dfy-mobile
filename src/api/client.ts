import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import ENV from '../config/env'

const api = axios.create({
  baseURL: ENV.apiUrl,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.multiRemove(['token', 'currentUser'])
    }
    return Promise.reject(error)
  }
)

export default api
