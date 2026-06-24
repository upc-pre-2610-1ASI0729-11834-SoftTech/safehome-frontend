import { Injectable } from '@angular/core';

/**
 * @summary Reads and writes SafeHome data in browser localStorage.
 * @author SofTech
 */
@Injectable({ providedIn: 'root' })
export class LocalStorageService {
  /**
   * @summary Gets a stored value or returns a fallback value.
   */
  getItem<T>(key: string, fallback: T): T {
    const value = localStorage.getItem(key);
    if (!value) return fallback;

    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }

  /**
   * @summary Saves a value in localStorage.
   */
  setItem<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  /**
   * @summary Removes a value from localStorage.
   */
  removeItem(key: string): void {
    localStorage.removeItem(key);
  }
}
