import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

/**
 * @summary Backend DTO for /api/v1/alerts.
 * Alerts are notifications linked to security events.
 * They are distinct from security events — do NOT mix them.
 * @author SofTech
 */
export interface AlertApiResource {
  id: string;
  userId: string;
  securityEventId: string;
  priority: string;
  message: string;
  status: string;
  sentAt: string;
  readAt?: string;
}

/**
 * @summary HTTP service for /api/v1/alerts.
 * Only exposes findAll, findById and markAsRead (PATCH /{id}/read).
 * @author SofTech
 */
@Injectable({ providedIn: 'root' })
export class AlertApiService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/alerts`;

  findAll(): Observable<AlertApiResource[]> {
    return this.http.get<AlertApiResource[]>(this.base);
  }

  findById(id: string): Observable<AlertApiResource> {
    return this.http.get<AlertApiResource>(`${this.base}/${id}`);
  }

  /** Marks an alert (not a security event) as read. Endpoint: PATCH /alerts/{id}/read */
  markAsRead(id: string): Observable<AlertApiResource> {
    return this.http.patch<AlertApiResource>(`${this.base}/${id}/read`, {});
  }
}
