import api from '@/utils/axios'
import type { AxiosResponse } from 'axios'

export interface ApiResponse<T> {
  data: T
  message?: string
  status: 'success' | 'error'
}

export class ApiService {
  static async get<T>(url: string, config = {}): Promise<T> {
    const response: AxiosResponse<ApiResponse<T>> = await api.get(url, config)
    return response.data.data
  }

  static async post<T>(url: string, data = {}, config = {}): Promise<T> {
    const response: AxiosResponse<ApiResponse<T>> = await api.post(url, data, config)
    return response.data.data
  }
} 