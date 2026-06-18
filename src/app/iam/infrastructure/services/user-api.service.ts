import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface UserApiResource {
    id: string;
    fullName?: string;
    name?: string;
    email: string;
    phone?: string;
    address?: string;
    role?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface UserApiRequest {
    fullName?: string;
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
}

@Injectable({ providedIn: 'root' })
export class UserApiService {
    private http = inject(HttpClient);
    private base = `${environment.apiBaseUrl}/users`;

    findById(id: string): Observable<UserApiResource> {
        return this.http.get<UserApiResource>(`${this.base}/${id}`);
    }

    update(id: string, request: UserApiRequest): Observable<UserApiResource> {
        return this.http.put<UserApiResource>(`${this.base}/${id}`, request);
    }
}