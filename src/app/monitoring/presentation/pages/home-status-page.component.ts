import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SafeHomeStore } from '../../../shared/application/safehome.store';

/**
 * @summary Shows the general status of the monitored home.
 * @author SofTech
 */
@Component({
  selector: 'app-home-status-page',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  template: `
    <section aria-label="General home status page">
      <div class="page-head">
        <div><h1 class="page-title">{{ 'STATUS.TITLE' | translate }}</h1><p class="page-subtitle">{{ 'STATUS.SUBTITLE' | translate }}</p></div>
        <div class="actions">
          <button class="safe-button-outline" type="button" (click)="exportReport()"><span class="material-icons">download</span>{{ 'STATUS.EXPORT_REPORT' | translate }}</button>
          <a class="safe-button" routerLink="/devices">{{ 'STATUS.VIEW_DEVICES' | translate }}</a>
        </div>
      </div>

      <article class="status-hero">
        <span class="material-icons">verified_user</span>
        <div>
          <small class="badge success">● {{ 'STATUS.SECURE' | translate }}</small>
          <h2>{{ 'STATUS.HOME_SECURE' | translate }}</h2>
          <p>{{ 'STATUS.HOME_TEXT' | translate }}</p>
          <div class="stats">
            <strong>{{ store.activeDevices() }}/{{ store.devices().length }}<small>{{ 'STATUS.ACTIVE_DEVICES' | translate }}</small></strong>
            <strong>{{ store.zones().length }}/6<small>{{ 'STATUS.MONITORED_ZONES' | translate }}</small></strong>
            <strong>{{ store.uptime() }}<small>{{ 'STATUS.UPTIME' | translate }}</small></strong>
          </div>
        </div>
      </article>

      <h3>{{ 'STATUS.ZONES' | translate }}</h3>
      <section class="zone-grid">
        <article *ngFor="let zone of store.zones()" class="safe-card zone-card">
          <div><strong>{{ zone.name }}</strong><small>{{ zone.deviceCount }} {{ 'STATUS.DEVICES' | translate }}</small></div>
          <span [class]="'badge ' + zoneClass(zone.status)">{{ zoneStatusLabel(zone.status) | translate }}</span>
          <div class="progress"><i [style.width.%]="zone.signal"></i></div>
        </article>
      </section>

      <h3>{{ 'STATUS.RISK_SUMMARY' | translate }}</h3>
      <section class="risk-grid">
        <article *ngFor="let risk of risks" class="safe-card risk-card">
          <span class="material-icons">{{ risk.icon }}</span><strong>{{ risk.titleKey | translate }}</strong><small>{{ risk.textKey | translate }}</small>
        </article>
      </section>

      <article class="safe-card incident-card">
        <div class="card-title"><h3>{{ 'STATUS.LAST_INCIDENTS' | translate }}</h3><a routerLink="/history">{{ 'STATUS.SEE_HISTORY' | translate }}</a></div>
        <a *ngFor="let event of store.events().slice(0,3)" [routerLink]="['/alerts', event.id]">
          <span [class]="'status-dot ' + tone(event.severity)"></span><strong>{{ translatedBackendText(event.title) }}</strong><small>{{ event.createdAt }}</small>
        </a>
      </article>
      <p *ngIf="toast()" class="toast">{{ toast() }}</p>
    </section>
  `,
  styles: [`
    .page-head { display:flex; justify-content:space-between; gap:18px; align-items:start; }
    .actions { display:flex; gap:12px; flex-wrap:wrap; }
    .status-hero { border-radius:28px; background:linear-gradient(135deg,#aef3e9,#16cab7); padding:34px; display:grid; grid-template-columns:100px 1fr; gap:24px; align-items:center; margin-bottom:26px; }
    .status-hero > span { width:86px;height:86px;border-radius:50%;background:rgba(255,255,255,.45);display:grid;place-items:center;font-size:44px; }
    .status-hero h2 { font-size:34px;margin:12px 0 6px; }
    .status-hero p { color:#31445f; }
    .stats { display:flex;gap:42px;flex-wrap:wrap;margin-top:20px; }
    .stats strong { font-size:20px; } .stats small { display:block;color:#33546c;font-size:11px;text-transform:uppercase;margin-top:4px; }
    h3 { margin:28px 0 14px; }
    .zone-grid { display:grid;grid-template-columns:repeat(3,1fr);gap:16px; }
    .zone-card { padding:20px;box-shadow:none;display:grid;gap:14px; }
    .zone-card div:first-child { display:flex;justify-content:space-between;gap:12px; } .zone-card small { color:var(--muted); }
    .progress { height:7px;background:#eef3f9;border-radius:999px; } .progress i { display:block;height:100%;border-radius:inherit;background:var(--primary); }
    .risk-grid { display:grid;grid-template-columns:repeat(5,1fr);gap:14px; }
    .risk-card { padding:18px;text-align:center;display:grid;gap:8px;box-shadow:none; } .risk-card span { color:var(--primary-dark); }
    .incident-card { margin-top:24px;padding:22px;box-shadow:none; } .card-title { display:flex;justify-content:space-between;align-items:center; }
    .incident-card a:not(.card-title a) { display:grid;grid-template-columns:14px 1fr auto;align-items:center;gap:12px;padding:14px 0;border-top:1px solid var(--line); }
    .toast { position:fixed; right:24px; bottom:24px; }
    @media(max-width:1000px){.zone-grid{grid-template-columns:repeat(2,1fr)}.risk-grid{grid-template-columns:repeat(2,1fr)}}
    @media(max-width:650px){.page-head,.actions{flex-direction:column}.status-hero,.zone-grid,.risk-grid{grid-template-columns:1fr}.incident-card a:not(.card-title a){grid-template-columns:14px 1fr}.incident-card small{grid-column:2}}
  `]
})
export class HomeStatusPageComponent {
  store = inject(SafeHomeStore);
  private translate = inject(TranslateService);
  toast = signal('');
  risks = [
    { icon: 'security', titleKey: 'STATUS.RISK_INTRUSION', textKey: 'STATUS.RISK_OK' },
    { icon: 'local_fire_department', titleKey: 'STATUS.RISK_SMOKE', textKey: this.store.warningDevices() ? 'STATUS.RISK_WARNING' : 'STATUS.RISK_OK' },
    { icon: 'gas_meter', titleKey: 'STATUS.RISK_GAS', textKey: 'STATUS.RISK_OK' },
    { icon: 'water_drop', titleKey: 'STATUS.RISK_WATER', textKey: 'STATUS.RISK_OK' },
    { icon: 'bolt', titleKey: 'STATUS.RISK_ELECTRICITY', textKey: 'STATUS.RISK_OK' }
  ];

  /**
   * @summary Exports the current home status report.
   */
  exportReport(): void {
    const rows = [
      ['Metric', 'Value'],
      ['Active devices', `${this.store.activeDevices()}/${this.store.devices().length}`],
      ['Monitored zones', String(this.store.zones().length)],
      ['Uptime', this.store.uptime()],
      ['Pending alerts', String(this.store.pendingAlerts())]
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    this.download(csv, 'safehome-status-report.csv');
    this.toast.set(this.translate.instant('MESSAGES.EXPORTED'));
    setTimeout(() => this.toast.set(''), 2000);
  }

  /**
   * @summary Downloads a CSV file.
   */
  download(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  zoneClass(status: string): string { return status === 'critical' ? 'danger' : status === 'warning' ? 'warning' : 'success'; }
  zoneStatusLabel(status: string): string { return status === 'safe' ? 'STATUS_LABELS.SAFE' : status === 'critical' ? 'STATUS_LABELS.CRITICAL' : 'STATUS_LABELS.WARNING'; }
  tone(severity: string): string { return severity === 'critical' ? 'danger' : severity === 'medium' ? 'warning' : severity === 'info' ? 'info' : 'success'; }
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
