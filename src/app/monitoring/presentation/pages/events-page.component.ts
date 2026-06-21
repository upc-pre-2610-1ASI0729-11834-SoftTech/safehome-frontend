import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SafeHomeStore } from '../../../shared/application/safehome.store';

/**
 * @summary Shows real-time events with panel controls.
 * @author SofTech
 */
@Component({
  selector: 'app-events-page',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  template: `
    <section aria-label="Real time events page">
      <div class="page-head">
        <div><h1 class="page-title">{{ 'EVENTS.TITLE' | translate }}</h1><p class="page-subtitle">{{ 'EVENTS.SUBTITLE' | translate }}</p></div>
        <div class="actions">
          <button class="safe-button-outline" type="button" (click)="showFilters.set(!showFilters())"><span class="material-icons">filter_list</span>{{ 'COMMON.FILTER' | translate }}</button>
          <button class="safe-button" type="button" (click)="paused.set(!paused())">{{ (paused() ? 'EVENTS.RESUME' : 'EVENTS.PAUSE') | translate }}</button>
        </div>
      </div>

      <div *ngIf="showFilters()" class="filters" aria-label="Event filters">
        <button type="button" [class.active]="filter() === 'all'" (click)="filter.set('all')">{{ 'DEVICES.FILTER_ALL' | translate }}</button>
        <button type="button" [class.active]="filter() === 'active'" (click)="filter.set('active')">{{ 'STATUS_LABELS.ACTIVE' | translate }}</button>
        <button type="button" [class.active]="filter() === 'critical'" (click)="filter.set('critical')">{{ 'PRIORITY.CRITICAL' | translate }}</button>
        <button type="button" [class.active]="filter() === 'medium'" (click)="filter.set('medium')">{{ 'PRIORITY.MEDIUM' | translate }}</button>
        <button type="button" [class.active]="filter() === 'resolved'" (click)="filter.set('resolved')">{{ 'STATUS_LABELS.RESOLVED' | translate }}</button>
      </div>

      <section class="summary-grid">
        <article class="safe-card summary-card"><span class="summary-icon success material-icons">bolt</span><strong>{{ store.totalEvents() }}</strong><small>{{ 'EVENTS.TODAY' | translate }}</small></article>
        <article class="safe-card summary-card"><span class="summary-icon danger material-icons">warning</span><strong>{{ criticalCount() }}</strong><small>{{ 'EVENTS.CRITICAL' | translate }}</small></article>
        <article class="safe-card summary-card"><span class="summary-icon aqua material-icons">home</span><strong>{{ store.zones().length }}</strong><small>{{ 'EVENTS.ONLINE_ZONES' | translate }}</small></article>
        <article class="safe-card summary-card"><span class="summary-icon info material-icons">devices_other</span><strong>{{ store.activeDevices() }}</strong><small>{{ 'EVENTS.ACTIVE_DEVICES' | translate }}</small></article>
      </section>

      <section class="live-grid">
        <article class="safe-card feed">
          <div class="card-title"><h3>{{ 'EVENTS.FEED' | translate }}</h3><span class="badge success">● {{ paused() ? ('EVENTS.PAUSED' | translate) : ('EVENTS.ACTIVE' | translate) }}</span></div>
          <a *ngFor="let event of visibleEvents()" [routerLink]="['/events', event.id]" class="feed-row">
            <span [class]="'feed-icon material-icons ' + tone(event.severity)">{{ eventIcon(event.type) }}</span>
            <div><strong>{{ translatedEventTitle(event.id, event.title) }}</strong><small>{{ event.device }} · {{ event.zone }}</small></div>
            <em>{{ statusLabel(event.status) | translate }}</em>
          </a>
          <button *ngIf="visibleEvents().length < filteredEvents().length" class="safe-button-outline load" type="button" (click)="limit.set(limit()+3)">{{ 'EVENTS.LOAD_MORE' | translate }}</button>
        </article>

        <aside>
          <article class="safe-card side"><h3>{{ 'EVENTS.LIVE_SUMMARY' | translate }}</h3><p><strong>{{ store.totalEvents() }}</strong>{{ 'EVENTS.TODAY' | translate }}</p><p><strong>{{ criticalCount() }}</strong>{{ 'EVENTS.CRITICAL' | translate }}</p><p><strong>14:32</strong>{{ 'EVENTS.LAST_UPDATE' | translate }}</p></article>
          <article class="safe-card side"><h3>{{ 'EVENTS.ACTIVITY_ZONE' | translate }}</h3><p *ngFor="let zone of store.zones()"><span [class]="'status-dot ' + zoneTone(zone.status)"></span>{{ zone.name }}<small>{{ zoneStatusLabel(zone.status) | translate }}</small></p></article>
          <article class="tip">{{ 'EVENTS.SYSTEM_TIP' | translate }}</article>
        </aside>
      </section>
    </section>
  `,
  styles: [`
    .page-head{display:flex;justify-content:space-between;align-items:start;gap:16px}.actions{display:flex;gap:10px;flex-wrap:wrap}
    .filters{display:flex;gap:10px;flex-wrap:wrap;margin:-10px 0 20px}.filters button{border:1px solid var(--line);background:#fff;border-radius:999px;padding:10px 18px;font-weight:800;color:#63708c}.filters button.active{background:var(--primary);color:#041833;border-color:var(--primary)}
    .summary-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:22px}.summary-card{padding:22px;box-shadow:none;display:grid;gap:10px}.summary-icon{width:40px;height:40px;border-radius:12px;display:grid;place-items:center}
    .summary-icon.success{background:#ddfff4;color:#12b98a}.summary-icon.danger{background:#ffe6eb;color:#f55b73}.summary-icon.aqua{background:#ddfff9;color:#09baa5}.summary-icon.info{background:#eef2ff;color:#6079ff}
    .summary-grid strong{display:block;font-size:30px}.summary-grid small{color:var(--muted)}
    .live-grid{display:grid;grid-template-columns:minmax(0,1fr)330px;gap:22px}.feed,.side{padding:24px;box-shadow:none}.card-title{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}
    .feed-row{display:grid;grid-template-columns:38px 1fr auto;gap:12px;align-items:center;padding:14px 0;border-top:1px solid var(--line)}.feed-row small{display:block;color:var(--muted);margin-top:4px}.feed-row em{font-style:normal;color:var(--muted);font-size:12px}
    .feed-icon{width:34px;height:34px;border-radius:10px;display:grid;place-items:center;font-size:20px;background:#eef6ff;color:#6079ff}.feed-icon.danger{background:#ffe6eb;color:#f55b73}.feed-icon.warning{background:#fff4cb;color:#d79b00}.feed-icon.info{background:#eef2ff;color:#6079ff}.feed-icon.success{background:#ddfff4;color:#12b98a}
    .load{margin:18px auto 0}.side{margin-bottom:18px}.side p{display:flex;align-items:center;gap:10px;border-top:1px solid var(--line);padding:12px 0;margin:0;color:var(--muted)}.side p strong{font-size:22px;color:var(--ink);margin-right:8px}.side p small{margin-left:auto}.tip{background:#b6f2e7;border-radius:18px;padding:18px;color:#06423d;font-weight:800}
    @media(max-width:1000px){.live-grid{grid-template-columns:1fr}.summary-grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:600px){.summary-grid{grid-template-columns:1fr}.page-head,.actions{flex-direction:column}}
  `]
})
export class EventsPageComponent {
  store = inject(SafeHomeStore);
  private translate = inject(TranslateService);
  paused = signal(false);
  showFilters = signal(false);
  filter = signal('all');
  limit = signal(6);
  filteredEvents = computed(() => this.store.events().filter((event) => this.filter() === 'all' || event.status === this.filter() || event.severity === this.filter()));
  visibleEvents = computed(() => this.filteredEvents().slice(0, this.limit()));

  criticalCount(): number { return this.store.events().filter((event) => event.severity === 'critical').length; }
  tone(severity: string): string { return severity === 'critical' ? 'danger' : severity === 'medium' ? 'warning' : severity === 'info' ? 'info' : 'success'; }
  zoneTone(status: string): string { return status === 'critical' ? 'danger' : status === 'warning' ? 'warning' : 'success'; }
  statusLabel(status: string): string { return `STATUS_LABELS.${status.toUpperCase()}`; }
  zoneStatusLabel(status: string): string { return status === 'safe' ? 'STATUS_LABELS.SAFE' : status === 'critical' ? 'STATUS_LABELS.CRITICAL' : 'STATUS_LABELS.WARNING'; }
  eventIcon(type: string): string { return type === 'camera' ? 'videocam' : type === 'battery' ? 'battery_alert' : type === 'lock' ? 'lock' : type === 'system' ? 'bolt' : 'warning'; }
  translatedEventTitle(id: string, title: string): string { const key = `EVENT_TEXT.TITLE_${id}`; const value = this.translate.instant(key); return value === key ? title : value; }
}
