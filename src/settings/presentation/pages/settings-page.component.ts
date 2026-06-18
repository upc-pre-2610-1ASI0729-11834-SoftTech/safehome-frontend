import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SafeHomeStore } from '../../../shared/application/safehome.store';
import { SafeSettingsEntity } from '../../../shared/domain/model/safehome-state.entity';
import { LanguageSwitcherComponent } from '../../../shared/presentation/components/language-switcher.component';

/**
 * @summary Shows functional settings and saves preference changes.
 * @author SofTech
 */
@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, LanguageSwitcherComponent],
  template: `
    <section aria-label="Settings page">
      <div class="page-head">
        <div>
          <h1 class="page-title">{{ 'SETTINGS.TITLE' | translate }}</h1>
          <p class="page-subtitle">{{ 'SETTINGS.SUBTITLE' | translate }}</p>
        </div>
        <button class="safe-button" type="button" (click)="saveAndNotify()" aria-label="Save settings">
          {{ 'COMMON.SAVE' | translate }}
        </button>
      </div>

      <section class="settings-grid">
        <div>
          <article class="safe-card settings-card">
            <h3>
              <span class="material-icons">home</span>
              {{ 'SETTINGS.HOME_CONFIG' | translate }}
            </h3>

            <label class="stack">
              <span>{{ 'SETTINGS.HOME_NAME' | translate }}</span>
              <input
                  class="safe-input"
                  name="homeName"
                  [(ngModel)]="draft.homeName">
            </label>
          </article>

          <article class="safe-card settings-card">
            <h3>
              <span class="material-icons">warning</span>
              Preferencias de alerta
            </h3>

            <label>
              <span>{{ 'SETTINGS.SENSIBILITY' | translate }}</span>
              <select
                  class="safe-select"
                  name="sensibility"
                  [(ngModel)]="draft.sensibility">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
          </article>
        </div>

        <div>
          <article class="safe-card settings-card zones-card">
            <h3>
              <span class="material-icons">dashboard</span>
              Zonas detectadas
            </h3>

            <div class="zone-line" *ngFor="let zone of store.zones()">
              <div>
                <strong>{{ zone.name }}</strong>
                <small>{{ zone.deviceCount }} {{ 'STATUS.DEVICES' | translate }} · {{ zone.signal }}%</small>
              </div>
              <span class="zone-status">{{ statusText(zone.status) }}</span>
            </div>

            <p class="helper-text" *ngIf="!store.zones().length">
              No hay zonas detectadas todavía. Agrega dispositivos para generar zonas automáticamente.
            </p>
          </article>

          <article class="safe-card settings-card">
            <h3>
              <span class="material-icons">palette</span>
              {{ 'SETTINGS.APPEARANCE' | translate }}
            </h3>

            <label>
              <span>{{ 'SETTINGS.DARK_MODE' | translate }}</span>
              <label class="toggle">
                <input
                    type="checkbox"
                    name="darkMode"
                    [(ngModel)]="draft.darkMode"
                    (ngModelChange)="applyDarkMode()">
                <span></span>
              </label>
            </label>

            <div class="language-block">
              <span>{{ 'SETTINGS.LANGUAGE' | translate }}</span>
              <app-language-switcher />
            </div>

            <button class="safe-button-danger" type="button" (click)="restoreDefaultConfig()">
              {{ 'SETTINGS.RESET' | translate }}
            </button>
          </article>
        </div>
      </section>

      <p *ngIf="message" class="toast">{{ message }}</p>
    </section>
  `,
  styles: [`
    .page-head{display:flex;justify-content:space-between;align-items:start;gap:16px}
    .settings-grid{display:grid;grid-template-columns:1fr 1fr;gap:22px}
    .settings-card{padding:24px;box-shadow:none;margin-bottom:22px}
    .settings-card h3{margin:0 0 18px;display:flex;align-items:center;gap:10px}
    .settings-card h3 .material-icons{width:34px;height:34px;border-radius:10px;background:#d6fff7;color:var(--primary-dark);display:grid;place-items:center}
    .settings-card label,.language-block{display:flex;justify-content:space-between;align-items:center;gap:16px;padding:14px 0;border-top:1px solid var(--line);color:var(--text);font-weight:800}
    .settings-card label.stack{display:grid;gap:8px}
    .settings-card select{width:160px}
    .zone-line{display:flex;justify-content:space-between;align-items:center;gap:14px;border-top:1px solid var(--line);padding:12px 0}
    .zone-line small{display:block;color:var(--muted);margin-top:3px}
    .zone-status{font-weight:800;color:var(--primary-dark);background:#e8f8f5;border-radius:999px;padding:8px 12px}
    .helper-text{color:var(--muted);border-top:1px solid var(--line);padding-top:14px}
    .safe-button-danger{margin-top:18px;width:100%}
    .toast{position:fixed;right:24px;bottom:24px}
    @media(max-width:950px){.settings-grid{grid-template-columns:1fr}}
    @media(max-width:600px){.page-head{flex-direction:column}.settings-card label,.language-block,.zone-line{align-items:start;flex-direction:column}.settings-card select{width:100%}}
  `]
})
export class SettingsPageComponent {
  store = inject(SafeHomeStore);
  private translate = inject(TranslateService);

  draft: SafeSettingsEntity = { ...this.store.settings() };
  message = '';

  /**
   * @summary Saves the current settings values.
   */
  saveAll(): void {
    this.store.updateSettings({ ...this.draft });
  }

  /**
   * @summary Applies dark mode immediately while keeping the value ready to save.
   */
  applyDarkMode(): void {
    document.body.classList.toggle('dark-mode', this.draft.darkMode);
  }

  /**
   * @summary Saves settings and shows a confirmation.
   */
  saveAndNotify(): void {
    this.saveAll();
    this.showMessage('MESSAGES.SAVED');
  }

  /**
   * @summary Restores the functional default settings.
   */
  restoreDefaultConfig(): void {
    const currentLanguage = this.store.settings().language;

    this.draft = {
      ...this.store.settings(),
      homeName: 'Mi Hogar',
      sensibility: 'medium',
      darkMode: false,
      language: currentLanguage
    };

    document.body.classList.remove('dark-mode');
    this.store.updateSettings({ ...this.draft });
    this.showMessage('MESSAGES.RESET');
  }

  /**
   * @summary Shows a readable zone status.
   */
  statusText(status: string): string {
    const map: Record<string, string> = {
      safe: 'Seguro',
      warning: 'Advertencia',
      critical: 'Crítico'
    };

    return map[status] ?? 'Seguro';
  }

  /**
   * @summary Shows a translated notification message.
   */
  showMessage(key: string): void {
    this.message = this.translate.instant(key);
    setTimeout(() => this.message = '', 2000);
  }
}