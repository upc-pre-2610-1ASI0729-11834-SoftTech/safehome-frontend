import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

/**
 * @summary API resource for SupportTicket backend responses.
 * @author SofTech
 */
export interface SupportTicketApiResource {
  id: string;
  userId: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupportTicketApiRequest {
  userId: string;
  subject: string;
  description: string;
  priority?: string;
}

/**
 * @summary HTTP service for /api/v1/support-tickets.
 * @author SofTech
 */
@Injectable({ providedIn: 'root' })
export class SupportTicketApiService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/support-tickets`;

  findAll(): Observable<SupportTicketApiResource[]> {
    return this.http.get<SupportTicketApiResource[]>(this.base);
  }

  findByUser(userId: string): Observable<SupportTicketApiResource[]> {
    return this.http.get<SupportTicketApiResource[]>(`${this.base}/user/${userId}`);
  }

  findById(id: string): Observable<SupportTicketApiResource> {
    return this.http.get<SupportTicketApiResource>(`${this.base}/${id}`);
  }

  create(request: SupportTicketApiRequest): Observable<SupportTicketApiResource> {
    return this.http.post<SupportTicketApiResource>(this.base, request);
  }

  resolve(id: string): Observable<SupportTicketApiResource> {
    return this.http.patch<SupportTicketApiResource>(`${this.base}/${id}/resolve`, {});
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
