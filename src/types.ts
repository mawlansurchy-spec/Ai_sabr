export type LanguageCode = "ku_so" | "ku_ba" | "ar" | "en";

export type AccountStatus = "ACTIVE" | "SUSPENDED" | "DISABLED";

export type SubscriptionStatus = "PENDING" | "ACTIVE" | "REJECTED" | "EXPIRED";

export type PaymentStatus = "PENDING" | "PAID" | "REJECTED";

export interface User {
  id: string;
  full_name: string;
  username: string;
  email: string;
  phone: string;
  balance: number;
  free_ai_credits: number; // starts at 4
  account_status: AccountStatus;
  language: LanguageCode;
  profile_image?: string;
  two_factor_enabled: boolean;
  recovery_codes?: string[];
  created_at: string;
  updated_at: string;
  active_subscription?: UserSubscription | null;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_name: "WEEKLY" | "MONTHLY" | "YEARLY";
  price: number;
  duration_days: number;
  start_date: string | null;
  expiry_date: string | null;
  payment_status: PaymentStatus;
  subscription_status: SubscriptionStatus;
  request_id: string;
  created_at: string;
  updated_at: string;
  remaining_days?: number;
}

export interface GenerationItem {
  id: string;
  user_id: string;
  prompt: string;
  negative_prompt?: string;
  style: string;
  aspect_ratio: string;
  image_url: string;
  generation_type: string;
  credit_used: number; // 1 or 0
  status: "SUCCESS" | "FAILED";
  created_at: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  created_at: string;
}

export interface ServiceItem {
  id: string;
  key: string;
  name: string;
  description: string;
  icon: string;
  price_credit: number;
  is_active: boolean;
  category: string;
}

export type Generation = GenerationItem;
export type Subscription = UserSubscription;
export type Notification = AppNotification;

export interface SubscriptionPlan {
  id: "WEEKLY" | "MONTHLY" | "YEARLY";
  name: string;
  price: number;
  duration_days: number;
  popular?: boolean;
  features: string[];
}

export interface HistoryItem {
  id: string;
  date: string;
  asset?: string;
  timeframe?: string;
  signal?: string;
  entryPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  [key: string]: any;
}

export interface FullHistoryItem extends HistoryItem {
  chartImage?: string;
  rawAnalysis?: string;
  confidence?: number;
  report?: any;
  [key: string]: any;
}

export interface AiModelOption {
  id: string;
  name: string;
  description?: string;
  badge?: string;
  [key: string]: any;
}

export interface SignalData {
  action?: "BUY" | "SELL" | "HOLD" | string;
  asset?: string;
  timeframe?: string;
  entry?: number;
  stopLoss?: number;
  takeProfit?: number;
  confidence?: number;
  rationale?: string;
  [key: string]: any;
}

export interface RiskManagementDetails {
  riskRewardRatio?: string;
  suggestedLotSize?: string;
  maxDrawdown?: string;
  [key: string]: any;
}

// ==========================================
// DEVAN USER & ADMIN AUTHENTICATION TYPES
// ==========================================
export type DevanAccountStatus = "PENDING" | "ACTIVE" | "EXPIRED" | "SUSPENDED";
export type DevanSubscriptionType = "WEEKLY" | "MONTHLY" | "YEARLY" | "NONE";

export interface DevanUser {
  uid: string;
  fullName: string;
  email: string;
  phone: string;
  registrationDate: string;
  accountStatus: DevanAccountStatus;
  activationDate?: string | null;
  expirationDate?: string | null;
  subscriptionType: DevanSubscriptionType;
  emailVerified: boolean;
}

export interface DevanActivationRequest {
  requestId: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  requestDate: string;
  requestStatus: "PENDING" | "APPROVED" | "REJECTED";
  telegramRequestStatus: "PENDING" | "SENT";
}

export interface DevanSubscription {
  subscriptionId: string;
  userId: string;
  plan: "WEEKLY" | "MONTHLY" | "YEARLY";
  startDate: string;
  expirationDate: string;
  status: "ACTIVE" | "EXPIRED" | "CANCELLED";
}

export interface DevanAdminLog {
  logId: string;
  adminId: string;
  action: string;
  targetUserId?: string;
  timestamp: string;
}

export interface DevanAdminStats {
  totalUsers: number;
  activeUsers: number;
  pendingUsers: number;
  expiredUsers: number;
  suspendedUsers: number;
}


