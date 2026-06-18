import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, switchMap, tap, of, catchError, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  LoginRequest, LoginResponse, RegisterRequest, UserResponse,
  PropertyResponse, PropertyRequest
} from '../../domain/model/auth.model';

const TOKEN_KEY        = 'safehome-jwt';
const USER_ID_KEY      = 'safehome-userId';
const USER_NAME_KEY    = 'safehome-userName';
const USER_EMAIL_KEY   = 'safehome-userEmail';
const USER_PHONE_KEY   = 'safehome-userPhone';
const USER_ADDRESS_KEY = 'safehome-userAddress';
const PROPERTY_ID_KEY  = 'safehome-propertyId';

interface UserDetailResponse {
  id: string;
  fullName?: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

/**
 * @summary Handles authentication, user session data and property resolution.
 * @author SofTech
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private http   = inject(HttpClient);
  private router = inject(Router);

  private authBase     = `${environment.apiBaseUrl}/auth`;
  private userBase     = `${environment.apiBaseUrl}/users`;
  private propertyBase = `${environment.apiBaseUrl}/properties`;

  isLoggedIn = signal<boolean>(this.hasToken());

  private hasToken(): boolean {
    return !!localStorage.getItem(TOKEN_KEY);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  getUserId(): string | null {
    return localStorage.getItem(USER_ID_KEY);
  }

  getUserName(): string {
    return localStorage.getItem(USER_NAME_KEY) ?? '';
  }

  getUserEmail(): string {
    return localStorage.getItem(USER_EMAIL_KEY) ?? '';
  }

  getUserPhone(): string {
    return localStorage.getItem(USER_PHONE_KEY) ?? '';
  }

  getUserAddress(): string {
    return localStorage.getItem(USER_ADDRESS_KEY) ?? '';
  }

  getPropertyId(): string | null {
    return localStorage.getItem(PROPERTY_ID_KEY);
  }

  updateStoredUser(user: {
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
  }): void {
    if (user.id !== undefined) {
      localStorage.setItem(USER_ID_KEY, user.id);
    }

    if (user.name !== undefined) {
      localStorage.setItem(USER_NAME_KEY, user.name);
    }

    if (user.email !== undefined) {
      localStorage.setItem(USER_EMAIL_KEY, user.email);
    }

    if (user.phone !== undefined) {
      localStorage.setItem(USER_PHONE_KEY, user.phone);
    }

    if (user.address !== undefined) {
      localStorage.setItem(USER_ADDRESS_KEY, user.address);
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.authBase}/login`, credentials).pipe(
        tap(response => {
          localStorage.setItem(TOKEN_KEY, response.token);
          localStorage.setItem(USER_ID_KEY, String(response.userId));
          localStorage.setItem(USER_NAME_KEY, response.fullName);
          localStorage.setItem(USER_EMAIL_KEY, response.email);
          this.isLoggedIn.set(true);
        }),

        switchMap(response =>
            this.loadUserDetails(String(response.userId)).pipe(
                catchError(() => of(null)),
                switchMap(() =>
                    this.resolveProperty(String(response.userId), response.fullName).pipe(
                        catchError(() => of(null)),
                        map(() => response)
                    )
                )
            )
        )
    );
  }

  register(data: RegisterRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${this.authBase}/register`, data);
  }

  me(): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.authBase}/me`);
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_ID_KEY);
    localStorage.removeItem(USER_NAME_KEY);
    localStorage.removeItem(USER_EMAIL_KEY);
    localStorage.removeItem(USER_PHONE_KEY);
    localStorage.removeItem(USER_ADDRESS_KEY);
    localStorage.removeItem(PROPERTY_ID_KEY);

    this.isLoggedIn.set(false);
    this.router.navigate(['/login']);
  }

  private loadUserDetails(userId: string): Observable<UserDetailResponse> {
    return this.http.get<UserDetailResponse>(`${this.userBase}/${userId}`).pipe(
        tap(user => {
          const name = user.fullName ?? user.name ?? this.getUserName();
          const email = user.email ?? this.getUserEmail();

          this.updateStoredUser({
            id: user.id ?? userId,
            name,
            email,
            phone: user.phone ?? '',
            address: user.address ?? ''
          });
        })
    );
  }

  private resolveProperty(userId: string, userName: string): Observable<PropertyResponse> {
    return this.http.get<PropertyResponse[]>(`${this.propertyBase}/user/${userId}`).pipe(
        switchMap(properties => {
          if (properties && properties.length > 0) {
            localStorage.setItem(PROPERTY_ID_KEY, String(properties[0].id));
            return of(properties[0]);
          }

          const request: PropertyRequest = {
            userId,
            name: `${userName}'s Home`,
            address: 'My address',
            propertyType: 'HOUSE'
          };

          return this.http.post<PropertyResponse>(this.propertyBase, request).pipe(
              tap(created => localStorage.setItem(PROPERTY_ID_KEY, String(created.id)))
          );
        })
    );
  }
}