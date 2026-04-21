import api from './client'
import type { LoginModel, RegisterModel, AuthResponse } from '../types'

export const authApi = {
  login: (data: LoginModel) => api.post<AuthResponse>('/auth/login', data),
  register: (data: RegisterModel) => api.post<AuthResponse>('/auth/register', data),
  changePassword: (data: object) => api.post('/auth/change-password', data),
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data: object) => api.put('/user/profile', data),
  validateId: (idNumber: string) => api.post('/user/validate-id', { idNumber }),
}

export const tasksApi = {
  getAvailable: (page = 1, pageSize = 10, filters: Record<string, string> = {}) => {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize), ...filters })
    return api.get(`/tasks/available?${params}`)
  },
  getMyPosted: () => api.get('/tasks/my-posted'),
  getMyActive: () => api.get('/tasks/my-active'),
  getMyCompleted: () => api.get('/tasks/my-completed'),
  getById: (id: string) => api.get(`/tasks/${id}`),
  create: (data: object) => api.post('/tasks', data),
  update: (id: string, data: object) => api.put(`/tasks/${id}`, data),
  claim: (id: string, helperName: string, helperContact: string) =>
    api.post(`/tasks/${id}/claim`, { HelperName: helperName, HelperContact: helperContact }),
  complete: (id: string) => api.post(`/tasks/${id}/complete`, {}),
  confirm: (id: string) => api.post(`/tasks/${id}/confirm`, {}),
  cancel: (id: string, reason: string) => api.post(`/tasks/${id}/cancel`, { reason }),
  getMessages: (id: string, params?: object) => api.get(`/tasks/${id}/messages`, { params }),
  sendMessage: (id: string, content: string) => api.post(`/tasks/${id}/messages`, { content }),
  markMessagesRead: (id: string) => api.put(`/tasks/${id}/messages/read`, {}),
  getDashboardStats: () => api.get('/tasks/dashboard/stats'),
  getRecentActivity: (limit = 5) => api.get(`/tasks/dashboard/activity?limit=${limit}`),
  getPaymentUrl: (id: string) => api.get(`/tasks/${id}/payment-url`),
  initiatePayment: (taskId: string) => api.post('/payment/initiate', { taskId }),
  getFilters: () => api.get('/tasks/filters'),
}

export const walletApi = {
  getBalance: () => api.get('/wallet/balance'),
  getTransactions: (page = 1, pageSize = 20) =>
    api.get(`/wallet/transactions?page=${page}&pageSize=${pageSize}`),
  getBankAccounts: () => api.get('/banking/accounts'),
  addBankAccount: (data: object) => api.post('/banking/accounts', data),
  requestWithdrawal: (data: object) => api.post('/wallet/withdraw', data),
  getPendingWithdrawals: () => api.get('/wallet/withdrawals/pending'),
}

export const notificationsApi = {
  getAll: (page = 1, pageSize = 20) => api.get('/notifications', { params: { page, pageSize } }),
  markRead: (id: string) => api.post(`/notifications/${id}/mark-read`, {}),
  markAllRead: () => api.post('/notifications/mark-all-read', {}),
  markTaskRead: (taskId: number) => api.post('/notifications/mark-task-read', { taskId }),
  remove: (id: string) => api.delete(`/notifications/${id}`),
  clearRead: () => api.delete('/notifications/clear-read'),
}

export const ratingsApi = {
  submit: (taskId: string, ratingValue: number, review?: string) =>
    api.post('/ratings', { taskId, ratingValue, review }),
  getForUser: (userId: number, page = 1, pageSize = 5) =>
    api.get(`/ratings/user/${userId}?page=${page}&pageSize=${pageSize}`),
  canRate: (taskId: string) => api.get(`/ratings/can-rate/${taskId}`),
}

export const categoryApi = {
  getAll: () => api.get('/categories'),
}

export const userPreferencesApi = {
  get: () => api.get('/UserPreferences'),
  update: (data: object) => api.put('/UserPreferences', data),
}

export const disputesApi = {
  raise: (taskId: string, issue: string, category: string) =>
    api.post('/disputes', { taskId, issue, category }),
  getMy: () => api.get('/disputes/my'),
}

export const adminApi = {
  getDashboard: () => api.get('/admin/dashboard'),
  getPayments: () => api.get('/admin/payments'),
  getTasks: (params?: object) => api.get('/admin/tasks', { params }),
  verifyPayment: (id: string) => api.patch(`/admin/tasks/${id}/verify`, {}),
  unverifyPayment: (id: string) => api.patch(`/admin/tasks/${id}/unverify`, {}),
  bulkVerify: (ids: string[]) => api.patch('/admin/tasks/bulk-verify', { taskIds: ids }),
  forceReleaseEscrow: (id: string) => api.patch(`/admin/tasks/${id}/force-release-escrow`, {}),
  getUsers: (params?: object) => api.get('/admin/users', { params }),
  updateUserStatus: (id: number, isVerified: boolean) =>
    api.patch(`/admin/users/${id}/status`, { isVerified }),
  updateUserRole: (id: number, role: string) => api.patch(`/admin/users/${id}/role`, { role }),
  getAuditLogs: (page = 1, pageSize = 20) =>
    api.get(`/admin/audit-logs?page=${page}&pageSize=${pageSize}`),
  getWithdrawalRequests: (params?: object) => api.get('/admin/withdrawal-requests', { params }),
  getDisputes: (params?: object) => api.get('/disputes', { params }),
  resolveDispute: (id: number, resolution: string, action: string) =>
    api.patch(`/disputes/${id}/resolve`, { resolution, action }),
  deleteTask: (taskId: string) => api.delete(`/admin/tasks/${taskId}`),
  deleteUser: (userId: number) => api.delete(`/admin/users/${userId}`),
}
