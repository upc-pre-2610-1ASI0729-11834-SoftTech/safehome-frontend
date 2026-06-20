import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

/**
 * @summary API resource for Device backend responses.
 * @author SofTech
 */
export interface DeviceApiResource {
  id: string;
  propertyId: string;
  name: string;
  deviceType: string;
  locationArea: string;
  status: string;
  qrCode: string;
  battery: number;
  lastSeenAt: string;
  description: string;
  signalStrength: number;
  registeredAt: string;
  attributes: Record<string, unknown>;
}

export interface DeviceApiRequest {
  propertyId?: string;
  name: string;
  deviceType: string;
  locationArea: string;
  status?: string;
  qrCode?: string;
  battery?: number;
  description?: string;
  signalStrength?: number;
  attributes?: Record<string, unknown>;
}

/**
 * @summary HTTP service for /api/v1/devices.
 * @author SofTech
 */
@Injectable({ providedIn: 'root' })
export class DeviceApiService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/devices`;

  findAll(): Observable<DeviceApiResource[]> {
    return this.http.get<DeviceApiResource[]>(this.base);
  }

  findByProperty(propertyId: string): Observable<DeviceApiResource[]> {
    return this.http.get<DeviceApiResource[]>(`${this.base}/property/${propertyId}`);
  }

  findById(id: string): Observable<DeviceApiResource> {
    return this.http.get<DeviceApiResource>(`${this.base}/${id}`);
  }

  create(request: DeviceApiRequest): Observable<DeviceApiResource> {
    return this.http.post<DeviceApiResource>(this.base, request);
  }

  update(id: string, request: DeviceApiRequest): Observable<DeviceApiResource> {
    return this.http.put<DeviceApiResource>(`${this.base}/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
