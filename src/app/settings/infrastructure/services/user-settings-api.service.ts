import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

/**
 * @summary Backend DTO for /api/v1/user-settings.
 * @author SofTech
 */
export interface UserSettingsApiResource {
  id: string;
  userId: string;
  notificationsEnabled: boolean;
  pushEnabled: boolean;
  smsEnabled: boolean;
  emailEnabled: boolean;
  alertSensitivity: string;
  homeName: string;
  emailSummary: boolean;
  autoArm: boolean;
  darkMode: boolean;
  twoFactor: boolean;
  autoLogout: boolean;
  loginAlerts: boolean;
  updateTime: string;
  sessionDuration: string;
  zoneReviewInterval: string;
  historyRetention: string;
  hiddenSensors: boolean;
  language: string;
  updatedAt: string;
}

export interface UserSettingsApiRequest {
  userId?: string;
  notificationsEnabled?: boolean;
  pushEnabled?: boolean;
  smsEnabled?: boolean;
  emailEnabled?: boolean;
  alertSensitivity?: string;
  homeName?: string;
  emailSummary?: boolean;
  autoArm?: boolean;
  darkMode?: boolean;
  twoFactor?: boolean;
  autoLogout?: boolean;
  loginAlerts?: boolean;
  updateTime?: string;
  sessionDuration?: string;
  zoneReviewInterval?: string;
  historyRetention?: string;
  hiddenSensors?: boolean;
  language?: string;
}

/**
 * @summary HTTP service for /api/v1/user-settings.
 * findByUser: GET /user-settings/user/{userId}
 * create:     POST /user-settings  (used for new users with no settings row)
 * update:     PUT  /user-settings/user/{userId}
 * @author SofTech
 */
@Injectable({ providedIn: 'root' })
export class UserSettingsApiService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/user-settings`;

  findByUser(userId: string): Observable<UserSettingsApiResource> {
    return this.http.get<UserSettingsApiResource>(`${this.base}/user/${userId}`);
  }

  create(request: UserSettingsApiRequest): Observable<UserSettingsApiResource> {
    return this.http.post<UserSettingsApiResource>(this.base, request);
  }

  update(userId: string, request: UserSettingsApiRequest): Observable<UserSettingsApiResource> {
    return this.http.put<UserSettingsApiResource>(`${this.base}/user/${userId}`, request);
  }
}
