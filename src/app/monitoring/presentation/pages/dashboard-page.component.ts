import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SafeHomeStore } from '../../../shared/application/safehome.store';

/**
 * @summary Shows the main SafeHome dashboard.
 * @author SofTech
 */
@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  template: `
    <section aria-label="Dashboard page">
      <div class="page-head">
        <div>
          <h1 class="page-title">{{ 'DASHBOARD.HELLO' | translate:{ name: firstName() } }}</h1>
          <p class="page-subtitle">{{ 'DASHBOARD.SUBTITLE' | translate }}</p>
        </div>
        <a class="safe-button" routerLink="/devices/new" aria-label="Add device"><span class="material-icons">add</span>{{ 'DEVICES.ADD' | translate }}</a>
      </div>

      <article class="hero-status" aria-label="Home status summary">
        <div>
          <span class="badge success">● {{ 'DASHBOARD.ALL_GOOD' | translate }}</span>
          <h2>{{ 'DASHBOARD.HOME_SAFE' | translate }}</h2>
          <p>{{ 'DASHBOARD.HOME_SAFE_TEXT' | translate:{ total: store.devices().length } }}</p>
          <div class="hero-metrics">
            <span><small>{{ 'DASHBOARD.ZONES' | translate }}</small><strong>{{ store.zones().length }} {{ 'DASHBOARD.ROOMS' | translate }}</strong></span>
            <span><small>{{ 'DASHBOARD.LAST_ALERT' | translate }}</small><strong>{{ lastAlertLabel() }}</strong></span>
          </div>
        </div>
        <div class="shield">
          <div class="shield-ring outer">
            <div class="shield-ring middle">
              <div class="shield-ring inner">
                <span class="material-icons">shield</span>
              </div>
            </div>
          </div>
        </div>
      </article>

      <section class="metric-grid" aria-label="Dashboard indicators">
        <a class="metric-card safe-card" routerLink="/devices"><span class="metric-icon aqua material-icons">devices_other</span><strong>{{ store.activeDevices() }}</strong><p>{{ 'DASHBOARD.DEVICES_CONNECTED' | translate }}</p><small>+2</small></a>
        <a class="metric-card safe-card" routerLink="/alerts"><span class="metric-icon red material-icons">notifications_none</span><strong>{{ store.pendingAlerts() }}</strong><p>{{ 'DASHBOARD.PENDING_ALERTS' | translate }}</p><small>{{ 'DASHBOARD.ACTIVE' | translate }}</small></a>
        <a class="metric-card safe-card" routerLink="/history"><span class="metric-icon yellow material-icons">event_note</span><strong>{{ store.totalEvents() }}</strong><p>{{ 'DASHBOARD.REGISTERED_EVENTS' | translate }}</p><small>{{ 'DASHBOARD.TODAY' | translate }}</small></a>
        <a class="metric-card safe-card" routerLink="/events"><span class="metric-icon green material-icons">schedule</span><strong>{{ store.uptime() }}</strong><p>{{ 'DASHBOARD.UPTIME' | translate }}</p><small>{{ 'DASHBOARD.OPTIMAL' | translate }}</small></a>
      </section>

      <section class="dashboard-grid">
        <article class="safe-card chart-card" aria-label="Weekly activity chart">
          <div class="card-title">
            <div>
              <h3>{{ 'DASHBOARD.WEEK_ACTIVITY' | translate }}</h3>
              <p>{{ 'DASHBOARD.EVENTS_PER_DAY' | translate }}</p>
            </div>
            <strong>{{ 'DASHBOARD.LAST_7_DAYS' | translate }}</strong>
          </div>
          <div class="chart" role="img" aria-label="Events detected per day during the last seven days">
            <div *ngFor="let bar of store.weeklyActivity()" class="bar-item">
              <div class="bar-value">{{ bar.value }}</div>
              <div class="bar" [style.height.%]="bar.height" [attr.aria-label]="(bar.labelKey | translate) + ': ' + bar.value + ' events'"></div>
              <span>{{ bar.labelKey | translate }}</span>
            </div>
          </div>
        </article>

        <article class="safe-card alert-card" aria-label="Recent incidents">
          <div class="card-title incidents-head">
            <h3>{{ 'DASHBOARD.ACTIVE_ALERTS' | translate }}</h3>
            <a class="history-link" routerLink="/history">{{ 'STATUS.SEE_HISTORY' | translate }}</a>
          </div>
          <a *ngFor="let event of store.events().slice(0,3)" class="alert-line" [routerLink]="['/alerts', event.id]">
            <span [class]="'status-dot ' + tone(event.severity)"></span>
            <div><strong>{{ translatedBackendText(event.title) }}</strong></div>
            <small>{{ event.createdAt }}</small>
          </a>
        </article>
      </section>
    </section>
  `,
  styles: [`
    .page-head { display: flex; justify-content: space-between; align-items: start; gap: 20px; margin-bottom: 22px; }
    .hero-status { min-height: 230px; border-radius: 28px; background: #28d2bf; display: flex; justify-content: space-between; align-items: center; gap: 24px; padding: 34px 42px; margin-bottom: 26px; overflow: hidden; }
    .hero-status h2 { font-size: 31px; margin: 18px 0 8px; letter-spacing: -0.03em; }
    .hero-status p { margin: 0; max-width: 620px; color: #08243d; }
    .hero-metrics { margin-top: 24px; display: flex; gap: 42px; flex-wrap: wrap; }
    .hero-metrics small { display: block; font-size: 12px; text-transform: uppercase; font-weight: 900; letter-spacing: .08em; color: #044c48; }
    .hero-metrics strong { display: block; margin-top: 8px; font-size: 18px; }
    .shield { width: 190px; display: grid; place-items: center; }
    .shield-ring { display: grid; place-items: center; border-radius: 50%; }
    .outer { width: 154px; height: 154px; background: rgba(255,255,255,.14); }
    .middle { width: 108px; height: 108px; background: rgba(255,255,255,.14); }
    .inner { width: 68px; height: 68px; background: rgba(255,255,255,.72); }
    .inner .material-icons { font-size: 36px; color: var(--primary-dark); }
    .metric-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; margin-bottom: 26px; }
    .metric-card { padding: 24px; position: relative; display: grid; gap: 8px; box-shadow: none; }
    .metric-icon { width: 44px; height: 44px; border-radius: 12px; display: grid; place-items: center; }
    .aqua { background: #d8fff7; color: #0ca896; } .red { background: #ffe6eb; color: #f55b73; } .yellow { background: #fff4c7; color: #c99600; } .green { background: #dff9ea; color: #18b98f; }
    .metric-card strong { font-size: 32px; letter-spacing: -.04em; }
    .metric-card p { margin: 0; color: var(--text); }
    .metric-card small { position: absolute; top: 24px; right: 24px; color: var(--primary-dark); font-weight: 900; }
    .dashboard-grid { display: grid; grid-template-columns: minmax(0, 1fr) 380px; gap: 24px; }
    .chart-card, .alert-card { padding: 28px; box-shadow: none; }
    .card-title { display: flex; justify-content: space-between; align-items: start; gap: 16px; margin-bottom: 26px; }
    .card-title h3 { margin: 0 0 6px; font-size: 20px; }
    .card-title p { margin: 0; color: var(--muted); }
    .chart { height: 280px; display: grid; grid-template-columns: repeat(7, 1fr); align-items: end; gap: 20px; padding-top: 20px; }
    .bar-item { height: 100%; display: grid; grid-template-rows: 28px 1fr 28px; align-items: end; text-align: center; color: #7e8ca7; font-weight: 800; }
    .bar-value { color: var(--primary-dark); font-weight: 900; font-size: 13px; }
    .bar { width: 100%; border-radius: 10px 10px 0 0; background: #52d7cb; min-height: 34px; }
    .incidents-head { align-items: center; }
    .history-link { color: var(--primary-dark); font-weight: 900; text-decoration: underline; text-underline-offset: 3px; }
    .alert-line { display: grid; grid-template-columns: 14px 1fr auto; gap: 14px; align-items: center; padding: 16px 0; border-top: 1px solid var(--line); }
    .alert-line strong { display: block; color: var(--ink); }
    .alert-line small { display: block; color: var(--ink); }
    @media (max-width: 1100px) { .metric-grid { grid-template-columns: repeat(2, 1fr); } .dashboard-grid { grid-template-columns: 1fr; } }
    @media (max-width: 650px) { .page-head, .hero-status { flex-direction: column; } .metric-grid { grid-template-columns: 1fr; } .shield { width: 100px; } }
  `]
})
export class DashboardPageComponent {
  store = inject(SafeHomeStore);
  private translate = inject(TranslateService);

  /**
   * @summary Returns the first name used in the greeting.
   */
  firstName(): string {
    return this.store.user().name.split(' ')[0] || 'User';
  }

  /**
   * @summary Returns a translated label for the latest alert.
   */
  lastAlertLabel(): string {
    return this.store.pendingAlerts() ? this.store.events()[0]?.createdAt || this.translate.instant('DASHBOARD.THREE_DAYS') : this.translate.instant('DASHBOARD.THREE_DAYS');
  }

  /**
   * @summary Returns a class by alert severity.
   */
  tone(severity: string): string {
    if (severity === 'critical') return 'danger';
    if (severity === 'medium') return 'warning';
    if (severity === 'info') return 'info';
    return 'success';
  }

  translatedBackendText(text: string): string {
    const lang = this.translate.currentLang || this.translate.defaultLang || 'en';

    const translations: Record<string, Record<string, string>> = {
      'Movimiento sospechoso detectado': {
        en: 'Suspicious motion detected',
        es: 'Movimiento sospechoso detectado'
      },
      'Se detectó movimiento en la sala mientras el sistema estaba armado.': {
        en: 'Motion was detected in the living room while the system was armed.',
        es: 'Se detectó movimiento en la sala mientras el sistema estaba armado.'
      },
      'Sala': {
        en: 'Living room',
        es: 'Sala'
      }
    };

    return translations[text]?.[lang] ?? text;
  }
}
