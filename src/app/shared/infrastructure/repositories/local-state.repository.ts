import { Injectable, inject } from '@angular/core';
import { LocalStorageService } from '../storage/local-storage.service';

/**
 * @summary Provides a simple repository for browser based persistence.
 * @author SofTech
 */
@Injectable({ providedIn: 'root' })
export class LocalStateRepository {
  private storage = inject(LocalStorageService);

  /**
   * @summary Gets a stored value or returns the default value.
   */
  find<T>(key: string, defaultValue: T): T {
    return this.storage.getItem(key, defaultValue);
  }

  /**
   * @summary Saves a value in the browser storage.
   */
  save<T>(key: string, value: T): void {
    this.storage.setItem(key, value);
  }
}
