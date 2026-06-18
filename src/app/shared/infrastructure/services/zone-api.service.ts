import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

/**
 * @summary Backend DTO returned by /api/v1/zones/property/{propertyId}.
 * Zones are computed server-side from device locationArea groupings.
 * @author SofTech
 */
export interface ZoneApiResource {
  name: string;
  deviceCount: number;
  status: string;
  signalStrength: number;
}

/**
 * @summary HTTP service for /api/v1/zones.
 * @author SofTech
 */
@Injectable({ providedIn: 'root' })
export class ZoneApiService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/zones`;

  findByProperty(propertyId: string): Observable<ZoneApiResource[]> {
    return this.http.get<ZoneApiResource[]>(`${this.base}/property/${propertyId}`);
  }
}
