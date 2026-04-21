export interface LoginModel { email: string; password: string }
export interface RegisterModel {
  firstName: string; lastName: string; email: string; phoneNumber: string
  userType: string; idNumber?: string; dateOfBirth?: string; address: string; password: string
}
export interface User {
  id: number; name: string; firstName?: string; lastName?: string; email: string
  contact: string; phoneNumber?: string; userType?: string; isVerified: boolean
  profileCompleted: boolean; profileCompletion?: number; rating: number
  completedTasks: number; createdAt: string; lastLoginAt?: string
  roles?: string[]; isAdmin?: boolean; idNumber?: string; address?: string
}
export interface AuthResponse {
  success: boolean; message: string; user?: User; token?: string
  refreshToken?: string; expiration?: string
}
export type PaymentStatus = 'pending' | 'verified' | 'failed' | 'expired' | 'refunded' | 'escrow_held'
export type TaskStatus = 'draft' | 'posted' | 'claimed' | 'in_progress' | 'completed' | 'confirmed' | 'runner_paid' | 'cancelled' | 'disputed'
export type Priority = 'standard' | 'urgent' | 'low'
export interface Task {
  id: number; taskId: string; timestamp: string; userName: string; userContact: string
  createdByUserId: number; taskName?: string; taskDescription: string; area: string
  dateNeeded: string; budget: number; notes?: string; paymentStatus: PaymentStatus
  taskStatus: TaskStatus; helperName?: string; helperContact?: string; helperEmail?: string
  acceptedByUserId?: number; priority: Priority; category?: string; createdAt: string
  updatedAt: string; completedAt?: string; escrowStatus?: string
  task_description?: string; area_suburb?: string; date_time_needed?: string
  contact_number?: string; name_and_surname?: string; taskid?: string; status?: string
}
export interface ChatMessage {
  id: string | number; taskId: string; senderId: number; senderName: string
  content: string; timestamp: string; isRead: boolean; isCurrentUser: boolean
}
export interface WalletBalance {
  availableBalance: number; pendingPayouts: number; totalEarned: number; totalWithdrawn: number
}
export interface BankAccount {
  id: number; bankName: string; accountNumber: string; accountHolderName: string
  accountType: string; branchCode: string; isVerified: boolean; isDefault: boolean
}
export interface AppNotification {
  id: number; type: string; title: string; message: string; isRead: boolean
  createdAt: string; updatedAt: string; count: number
  relatedTaskId?: number | null; relatedTaskStringId?: string | null; expiresAt?: string | null
}
export interface DashboardStats {
  postedTasks?: number; pendingPayment?: number; activeTasks?: number
  awaitingConfirmation?: number; completedPostedTasks?: number; totalSpent?: number
  thisMonthSpending?: number; averageTaskCost?: number; availableTasks?: number
  myActiveTasks?: number; runnerCompletedTasks?: number; totalEarnings?: number
  availableBalance?: number; pendingPayouts?: number; thisMonthEarnings?: number
  completionRate?: number; averageEarning?: number; myRating?: number
}
