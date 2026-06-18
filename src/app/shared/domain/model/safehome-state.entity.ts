/**
 * @summary Entity that represents the current SafeHome user.
 * @author SofTech
 */
export interface SafeUserEntity {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  plan: string;
  initials: string;
  memberSince: string;
}

/**
 * @summary Entity that represents a monitored home zone.
 * @author SofTech
 */
export interface HomeZoneEntity {
  id: string;
  name: string;
  deviceCount: number;
  status: 'safe' | 'warning' | 'critical';
  signal: number;
}

/**
 * @summary Entity that stores SafeHome configuration preferences.
 * @author SofTech
 */
export interface SafeSettingsEntity {
  homeName: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  systemNotifications: boolean;
  emailSummary: boolean;
  autoArm: boolean;
  darkMode: boolean;
  twoFactor: boolean;
  autoLogout: boolean;
  loginAlerts: boolean;
  sensibility: string;
  updateTime: string;
  sessionDuration: string;
  zoneReviewInterval: string;
  historyRetention: string;
  hiddenSensors: boolean;
  language: 'en' | 'es';
}

/**
 * @summary Entity that represents account activity in the profile page.
 * @author SofTech
 */
export interface AccountActivityEntity {
  id: string;
  title: string;
  description: string;
  time: string;
  tone: 'success' | 'warning' | 'info' | 'danger';
}

/**
 * @summary Entity that represents a support message sent by the user.
 * @author SofTech
 */
export interface SupportTicketEntity {
  id: string;
  name: string;
  email: string;
  category: string;
  subject: string;
  message: string;
  createdAt: string;
  status?: string;
  priority?: string;
}
