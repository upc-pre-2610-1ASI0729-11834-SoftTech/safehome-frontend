import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SafeHomeStore } from '../../../shared/application/safehome.store';

/**
 * @summary Shows the full information of one alert or event.
 * @author SofTech
 */
@Component({
  selector: 'app-alert-detail-page',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  template: `
    <section *ngIf="event() as item" aria-label="Alert detail page">
      <div class="toolbar-row">
        <a class="safe-button-ghost" [routerLink]="backPath()"><span class="material-icons">arrow_back</span>{{ 'COMMON.BACK' | translate }}</a>
        <div class="actions">
          <button class="safe-button-danger" type="button" (click)="deleteEvent(item.id)">{{ 'COMMON.DELETE' | translate }}</button>
          <button class="safe-button" type="button" (click)="store.markEventAttended(item.id)">{{ 'ALERTS.MARK_ATTENDED' | translate }}</button>
        </div>
      </div>

      <article [class]="'alert-hero ' + tone(item.severity)">
        <div class="hero-icon"><span class="material-icons">{{ severityIcon(item.severity) }}</span></div>
        <div>
          <small>{{ item.type }} · {{ statusLabel(item.status) | translate }}</small>
          <h1>{{ translatedEventTitle(item) }}</h1>
          <p>{{ translatedEventDescription(item) }}</p>
          <strong>{{ item.createdAt }}</strong>
        </div>
      </article>

      <section class="detail-layout">
        <main>
          <article class="safe-card info">
            <h3>{{ 'ALERTS.INFORMATION' | translate }}</h3>
            <p><span>{{ 'ALERTS.TYPE' | translate }}</span><strong>{{ item.type }}</strong></p>
            <p><span>{{ 'ALERTS.DATE' | translate }}</span><strong>{{ item.createdAt }}</strong></p>
            <p><span>{{ 'ALERTS.DEVICE' | translate }}</span><strong>{{ item.device }}</strong></p>
            <p><span>{{ 'ALERTS.LOCATION' | translate }}</span><strong>{{ item.zone }}</strong></p>
            <p><span>{{ 'ALERTS.STATUS' | translate }}</span><strong>{{ statusLabel(item.status) | translate }}</strong></p>
          </article>

          <article class="safe-card recommendations">
            <h3>{{ 'ALERTS.RECOMMENDATIONS' | translate }}</h3>
            <ol>
              <li>{{ 'ALERTS.REC_1' | translate }}</li>
              <li>{{ 'ALERTS.REC_2' | translate }}</li>
              <li>{{ 'ALERTS.REC_3' | translate }}</li>
            </ol>
          </article>

          <div class="bottom-actions">
            <button class="safe-button" type="button" (click)="store.markEventAttended(item.id)">{{ 'ALERTS.MARK_ATTENDED' | translate }}</button>
            <a class="safe-button-outline" [routerLink]="['/devices', relatedDeviceId(item.device)]">{{ 'ALERTS.GO_DEVICE' | translate }}</a>
            <button class="safe-button-outline" type="button" (click)="downloadEvidence(item)">{{ 'ALERTS.DOWNLOAD' | translate }}</button>
          </div>
        </main>

        <aside>
          <article class="safe-card side">
            <h3>{{ 'ALERTS.TIMELINE' | translate }}</h3>
            <p><span class="status-dot danger"></span>{{ 'ALERTS.TIMELINE_1' | translate }}</p>
            <p><span class="status-dot info"></span>{{ 'ALERTS.TIMELINE_2' | translate }}</p>
            <p><span class="status-dot warning"></span>{{ 'ALERTS.TIMELINE_3' | translate }}</p>
          </article>

          <article class="safe-card side">
            <h3>{{ 'ALERTS.EVENT_LOCATION' | translate }}</h3>
            <div class="mini-map"><span>{{ item.zone }}</span></div>
          </article>

          <article class="safe-card side related-box">
            <h3>{{ 'ALERTS.RELATED_DEVICE' | translate }}</h3>
            <p>{{ item.device }}</p>
            <small>{{ item.zone }}</small>
          </article>
        </aside>
      </section>
    </section>
  `,
  styles: [`
    .toolbar-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}.actions{display:flex;gap:10px;flex-wrap:wrap}
    .alert-hero{border-radius:22px;padding:28px;display:grid;grid-template-columns:76px 1fr;gap:20px;margin-bottom:22px;border:1px solid #d8e2ee;background:#f7faff}
    .alert-hero.danger{background:#f7f2f8;border-color:#d7d0ea}.alert-hero.warning{background:#fff9e9;border-color:#ffe4a0}.alert-hero.info{background:#f1f5ff;border-color:#cbd8ff}.alert-hero.success{background:#effdf7;border-color:#bbefd9}
    .hero-icon{width:60px;height:60px;border-radius:14px;background:#ffe8ec;display:grid;place-items:center}.alert-hero.warning .hero-icon{background:#fff2cc}.alert-hero.info .hero-icon{background:#e7eeff}.alert-hero.success .hero-icon{background:#dffdf2}
    .hero-icon .material-icons{font-size:38px;color:var(--danger)}.alert-hero.warning .hero-icon .material-icons{color:#d39700}.alert-hero.info .hero-icon .material-icons{color:#6a8dff}.alert-hero.success .hero-icon .material-icons{color:var(--success)}
    .alert-hero h1{margin:6px 0;font-size:30px}.alert-hero p{color:#52617e}
    .detail-layout{display:grid;grid-template-columns:minmax(0,1fr)330px;gap:22px}
    .info,.recommendations,.side{padding:24px;box-shadow:none;margin-bottom:18px}
    .info p{display:grid;grid-template-columns:180px 1fr;gap:12px;border-top:1px solid var(--line);padding:14px 0;margin:0}.info span{color:var(--muted)}
    .recommendations{background:#fff8e8;border-color:#f2d28f}.recommendations h3{margin-top:0}
    .bottom-actions{display:flex;gap:12px;flex-wrap:wrap}
    .side p{display:flex;align-items:center;gap:10px;border-top:1px solid var(--line);padding:12px 0;margin:0;color:var(--muted)}
    .mini-map{height:150px;border-radius:14px;background:#e8f8f5;border:1px solid var(--line);display:grid;place-items:center}.mini-map span{color:#2d415f;font-weight:800}
    .related-box{background:#fff3f5;border-color:#f3d7de} .related-box p{color:#6a7c99;border:0;padding-bottom:6px}
    @media(max-width:900px){.detail-layout,.alert-hero{grid-template-columns:1fr}.info p{grid-template-columns:1fr}.toolbar-row{flex-direction:column;align-items:stretch}}
  `]
})
export class AlertDetailPageComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  store = inject(SafeHomeStore);
  private translate = inject(TranslateService);
  event = computed(() => this.store.events().find((event) => event.id === (this.route.snapshot.paramMap.get('id') ?? '')));

  deleteEvent(id: string): void { this.store.deleteEvent(id); this.router.navigateByUrl(this.backPath()); }
  backPath(): string { return this.router.url.startsWith('/events') ? '/events' : '/alerts'; }

  downloadEvidence(item: { id: string; title: string; device: string; zone: string; createdAt: string; status: string }): void {
    const content = `SafeHome event evidence\nEvent: ${item.title}\nDevice: ${item.device}\nZone: ${item.zone}\nDate: ${item.createdAt}\nStatus: ${item.status}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `safehome-event-${item.id}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  severityIcon(severity: string): string { return severity === 'critical' ? 'warning' : severity === 'medium' ? 'report_problem' : severity === 'info' ? 'info' : 'check_circle'; }
  relatedDeviceId(name: string): string { return this.store.devices().find((device) => device.name === name)?.id ?? ''; }
  tone(severity: string): string { return severity === 'critical' ? 'danger' : severity === 'medium' ? 'warning' : severity === 'info' ? 'info' : 'success'; }
  statusLabel(status: string): string { return `STATUS_LABELS.${status.toUpperCase()}`; }
  translatedEventTitle(event: { id: string; title: string }): string { const key = `EVENT_TEXT.TITLE_${event.id}`; const value = this.translate.instant(key); return value === key ? event.title : value; }
  translatedEventDescription(event: { id: string; description: string }): string { const key = `EVENT_TEXT.DESCRIPTION_${event.id}`; const value = this.translate.instant(key); return value === key ? event.description : value; }
}
