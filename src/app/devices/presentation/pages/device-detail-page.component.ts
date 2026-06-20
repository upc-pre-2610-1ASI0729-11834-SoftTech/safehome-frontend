import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SafeHomeStore } from '../../../shared/application/safehome.store';
import { DeviceEntity } from '../../domain/model/device.entity';

/**
 * @summary Shows and edits one selected device.
 * @author SofTech
 */
@Component({
  selector: 'app-device-detail-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  template: `
    <section *ngIf="device() as item" aria-label="Device detail page">
      <div class="toolbar-row">
        <a class="safe-button-ghost" routerLink="/devices"><span class="material-icons">arrow_back</span>{{ 'COMMON.BACK' | translate }}</a>
        <div class="actions">
          <button class="safe-button-danger" type="button" (click)="deleteDevice(item.id)"><span class="material-icons">delete</span>{{ 'COMMON.DELETE' | translate }}</button>
          <button class="safe-button-outline" type="button" (click)="startEdit(item)"><span class="material-icons">edit</span>{{ editing ? ('COMMON.CANCEL' | translate) : ('COMMON.EDIT' | translate) }}</button>
        </div>
      </div>

      <article class="device-hero">
        <span class="device-icon material-icons">{{ icon(item.type) }}</span>
        <div>
          <span [class]="'badge ' + statusClass(item.status)">● {{ statusLabel(item.status) | translate }}</span>
          <h1>{{ item.name }}</h1>
          <p>{{ item.description }}</p>
          <small>{{ item.zone }} · {{ item.code }}</small>
        </div>
        <label class="status-toggle">
          <span>{{ 'DEVICES.STATUS' | translate }}</span>
          <label class="toggle"><input type="checkbox" [checked]="item.status === 'active'" (change)="store.toggleDevice(item.id)"><span></span></label>
        </label>
      </article>

      <section class="detail-grid">
        <article class="safe-card"><small>{{ 'DEVICES.TYPE' | translate }}</small><strong>{{ item.type }}</strong></article>
        <article class="safe-card"><small>{{ 'DEVICES.ZONE' | translate }}</small><strong>{{ item.zone }}</strong></article>
        <article class="safe-card"><small>{{ 'DEVICES.CODE' | translate }}</small><strong>{{ item.code }}</strong></article>
        <article class="safe-card"><small>{{ 'DEVICES.BATTERY' | translate }}</small><strong>{{ item.battery }}%</strong><div class="battery"><i [style.width.%]="item.battery"></i></div></article>
        <article class="safe-card"><small>{{ 'DEVICES.REGISTERED' | translate }}</small><strong>Jan 15, 2025</strong></article>
      </section>

      <section class="bottom-grid">
        <article class="safe-card activity-card">
          <div class="activity-head">
            <h3>{{ 'DEVICES.RECENT_ACTIVITY' | translate }}</h3>
            <a class="safe-button-outline compact" routerLink="/history">{{ 'COMMON.DETAIL' | translate }}</a>
          </div>
          <ng-container *ngIf="relatedEvents().length; else emptyActivity">
            <p *ngFor="let event of relatedEvents()">
              <span class="activity-icon material-icons">{{ eventIcon(event.type) }}</span>
              <span>
                <strong>{{ translatedBackendText(event.title) }}</strong>
                <small>{{ translatedBackendText(event.description) }}</small>
              </span>
              <small>{{ event.createdAt }}</small>
            </p>
          </ng-container>
          <ng-template #emptyActivity>
            <div class="empty-activity">
              <span class="material-icons">info</span>
              <strong>No unusual activity was reported.</strong>
            </div>
          </ng-template>
        </article>

        <article class="safe-card config-card">
          <h3>{{ 'DEVICES.SENSOR_CONFIG' | translate }}</h3>
          <label><span>{{ 'DEVICES.SENSIBILITY' | translate }}</span><select class="safe-select" name="sensibility" [(ngModel)]="sensorSensitivity" (ngModelChange)="saveLocalConfig()"><option>High</option><option>Medium</option><option>Low</option></select></label>
          <label><span>{{ 'DEVICES.NIGHT_MODE' | translate }}</span><label class="toggle"><input type="checkbox" name="nightMode" [(ngModel)]="nightMode" (ngModelChange)="saveLocalConfig()"><span></span></label></label>
          <label><span>{{ 'DEVICES.AUTO_ALERTS' | translate }}</span><label class="toggle"><input type="checkbox" name="autoAlerts" [(ngModel)]="autoAlerts" (ngModelChange)="saveLocalConfig()"><span></span></label></label>
          <div class="tip">{{ 'DEVICES.DEVICE_READY' | translate }}</div>
        </article>
      </section>

      <form class="safe-card edit-card" *ngIf="editing" (ngSubmit)="save(item)" aria-label="Edit device form">
        <h3>{{ 'COMMON.EDIT' | translate }}</h3>
        <div class="fields">
          <label><span class="field-label">{{ 'DEVICES.NAME' | translate }}</span><input class="safe-input" name="editName" [(ngModel)]="draft.name"></label>
          <label><span class="field-label">{{ 'DEVICES.ZONE' | translate }}</span><input class="safe-input" name="editZone" [(ngModel)]="draft.zone"></label>
          <label><span class="field-label">{{ 'DEVICES.DESCRIPTION' | translate }}</span><input class="safe-input" name="editDescription" [(ngModel)]="draft.description"></label>
        </div>
        <button class="safe-button" type="submit">{{ 'COMMON.SAVE' | translate }}</button>
      </form>
    </section>
  `,
  styles: [`
    .toolbar-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:22px}.actions{display:flex;gap:10px;flex-wrap:wrap}
    .device-hero{border-radius:24px;background:#6ce7d8;padding:34px;display:grid;grid-template-columns:90px 1fr auto;gap:22px;align-items:center;margin-bottom:24px}
    .device-icon{width:78px;height:78px;border-radius:20px;background:rgba(255,255,255,.55);display:grid;place-items:center;font-size:40px;color:#06223d}
    .device-hero h1{margin:12px 0 6px;font-size:34px}.device-hero p,.device-hero small{color:#42506b}
    .status-toggle{display:grid;gap:10px;justify-items:center;background:rgba(255,255,255,.38);padding:14px;border-radius:18px;font-weight:900}
    .detail-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:16px}.detail-grid article{padding:22px;box-shadow:none}.detail-grid small{display:block;color:var(--muted);margin-bottom:10px}
    .battery{height:7px;background:#edf2f9;border-radius:999px;margin-top:12px}.battery i{display:block;height:100%;border-radius:inherit;background:var(--primary)}
    .bottom-grid{display:grid;grid-template-columns:minmax(0,1.4fr)340px;gap:20px;margin-top:22px}.activity-card,.config-card,.edit-card{padding:24px;box-shadow:none}.activity-head{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:8px}
    .compact{min-height:32px;padding:0 10px;font-size:12px}
    .activity-card p{display:grid;grid-template-columns:40px 1fr auto;align-items:center;border-top:1px solid var(--line);padding:14px 0;margin:0;gap:12px}
    .activity-card p span strong{display:block}.activity-card p span small{display:block;color:var(--muted);margin-top:3px}
    .activity-icon{width:34px;height:34px;border-radius:10px;background:#eef6ff;color:#5371a3;display:grid;place-items:center;font-size:20px}
    .empty-activity{border-top:1px solid var(--line);padding:18px 0 6px;display:grid;grid-template-columns:40px 1fr;gap:12px;align-items:start;color:var(--muted)}
    .empty-activity .material-icons{width:34px;height:34px;border-radius:10px;background:#eef6ff;color:#5371a3;display:grid;place-items:center}
    .empty-activity strong{color:var(--text)}
    .config-card label{display:flex;justify-content:space-between;align-items:center;padding:13px 0;border-top:1px solid var(--line)}.tip{background:#e4fff5;border:1px solid #a7ead3;border-radius:16px;padding:16px;color:var(--success);font-weight:800}.edit-card{margin-top:22px}.fields{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:16px}
    @media(max-width:1080px){.detail-grid{grid-template-columns:repeat(2,1fr)}.bottom-grid,.device-hero{grid-template-columns:1fr}}@media(max-width:620px){.toolbar-row,.actions{flex-direction:column;align-items:stretch}.fields,.activity-card p{grid-template-columns:1fr}}
  `]
})
export class DeviceDetailPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  store = inject(SafeHomeStore);
  private translate = inject(TranslateService);
  editing = false;
  sensorSensitivity = 'High';
  nightMode = true;
  autoAlerts = true;
  draft: Partial<DeviceEntity> = {};
  device = computed(() => this.store.devices().find((device) => device.id === this.route.snapshot.paramMap.get('id')));
  relatedEvents = computed(() => this.store.events().filter((event) => event.device === this.device()?.name).slice(0, 4));

  ngOnInit(): void {
    const data = localStorage.getItem(this.configKey());
    if (!data) return;
    try {
      const config = JSON.parse(data) as { sensorSensitivity: string; nightMode: boolean; autoAlerts: boolean };
      this.sensorSensitivity = config.sensorSensitivity ?? this.sensorSensitivity;
      this.nightMode = config.nightMode ?? this.nightMode;
      this.autoAlerts = config.autoAlerts ?? this.autoAlerts;
    } catch {
      this.saveLocalConfig();
    }
  }

  saveLocalConfig(): void {
    localStorage.setItem(this.configKey(), JSON.stringify({ sensorSensitivity: this.sensorSensitivity, nightMode: this.nightMode, autoAlerts: this.autoAlerts }));
  }

  configKey(): string {
    return `safehome-front-v4-device-config-${this.route.snapshot.paramMap.get('id') || ''}`;
  }

  startEdit(item: DeviceEntity): void { this.editing = !this.editing; this.draft = { ...item }; }
  save(current: DeviceEntity): void { this.store.updateDevice({ ...current, ...this.draft } as DeviceEntity); this.editing = false; }
  deleteDevice(id: string): void { this.store.deleteDevice(id); this.router.navigateByUrl('/devices'); }
  icon(type: string): string { return type === 'camera' ? 'photo_camera' : type === 'lock' ? 'lock' : type === 'smoke' ? 'local_fire_department' : type === 'window' ? 'sensor_window' : 'sensors'; }
  eventIcon(type: string): string { return type === 'camera' ? 'videocam' : type === 'intrusion' ? 'warning' : type === 'battery' ? 'battery_alert' : type === 'lock' ? 'lock' : 'info'; }
  statusClass(status: string): string { return status === 'warning' ? 'warning' : status === 'offline' ? 'danger' : status === 'inactive' ? 'info' : 'success'; }
  statusLabel(status: string): string { return `STATUS_LABELS.${status.toUpperCase()}`; }

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
