import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

/**
 * @summary Backend DTO returned by /api/v1/security-events.
 * Status values from backend: PENDING | ACTIVE | ATTENDED | ACKNOWLEDGED | RESOLVED | REACTIVATED
 * @author SofTech
 */
export interface SecurityEventApiResource {
  id: string;
  deviceId: string;
  propertyId: string;
  deviceName?: string;
  locationArea?: string;
  eventType: string;
  severity: string;
  title: string;
  description: string;
  status: string;
  detectedAt: string;
  resolvedAt?: string;
}

export interface SecurityEventApiRequest {
  deviceId: string;
  propertyId: string;
  eventType: string;
  severity: string;
  title: string;
  description?: string;
  latitude?: number;
  longitude?: number;
}

/**
 * @summary HTTP service for /api/v1/security-events.
 * @author SofTech
 */
@Injectable({ providedIn: 'root' })
export class SecurityEventApiService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/security-events`;

  findAll(): Observable<SecurityEventApiResource[]> {
    return this.http.get<SecurityEventApiResource[]>(this.base);
  }

  findByProperty(propertyId: string): Observable<SecurityEventApiResource[]> {
    return this.http.get<SecurityEventApiResource[]>(`${this.base}/property/${propertyId}`);
  }

  findById(id: string): Observable<SecurityEventApiResource> {
    return this.http.get<SecurityEventApiResource>(`${this.base}/${id}`);
  }

  create(request: SecurityEventApiRequest): Observable<SecurityEventApiResource> {
    return this.http.post<SecurityEventApiResource>(this.base, request);
  }

  attend(id: string): Observable<SecurityEventApiResource> {
    return this.http.patch<SecurityEventApiResource>(`${this.base}/${id}/attend`, {});
  }

  resolve(id: string): Observable<SecurityEventApiResource> {
    return this.http.patch<SecurityEventApiResource>(`${this.base}/${id}/resolve`, {});
  }

  reactivate(id: string): Observable<SecurityEventApiResource> {
    return this.http.patch<SecurityEventApiResource>(`${this.base}/${id}/reactivate`, {});
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}