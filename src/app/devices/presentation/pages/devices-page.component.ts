import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SafeHomeStore } from '../../../shared/application/safehome.store';

/**
 * @summary Shows and filters SafeHome devices.
 * @author SofTech
 */
@Component({
  selector: 'app-devices-page',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  template: `
    <section aria-label="Devices page">
      <div class="page-head"><div><h1 class="page-title">{{ 'DEVICES.TITLE' | translate }}</h1><p class="page-subtitle">{{ 'DEVICES.SUBTITLE' | translate }}</p></div><div class="actions"><button class="safe-button-outline" type="button" (click)="exportData()"><span class="material-icons">download</span>{{ 'COMMON.EXPORT' | translate }}</button><a class="safe-button" routerLink="/devices/new"><span class="material-icons">add</span>{{ 'DEVICES.ADD' | translate }}</a></div></div>
      <section class="summary-grid"><article class="safe-card"><strong>{{ store.devices().length }}</strong><small>{{ 'DEVICES.TOTAL' | translate }}</small></article><article class="safe-card"><strong>{{ store.activeDevices() }}</strong><small>{{ 'DEVICES.ACTIVE' | translate }}</small></article><article class="safe-card"><strong>{{ store.warningDevices() }}</strong><small>{{ 'DEVICES.WARNING' | translate }}</small></article><article class="safe-card"><strong>{{ store.offlineDevices() }}</strong><small>{{ 'DEVICES.OFFLINE' | translate }}</small></article></section>
      <div class="filters" aria-label="Device filters"><button *ngFor="let item of filterOptions" type="button" [class.active]="filter() === item.value" (click)="filter.set(item.value)">{{ item.labelKey | translate }}</button></div>
      <section class="device-grid"><article *ngFor="let device of filteredDevices()" class="safe-card device-card"><div class="device-top"><span class="material-icons">{{ icon(device.type) }}</span><span [class]="'badge ' + statusClass(device.status)">● {{ statusLabel(device.status) | translate }}</span></div><h3>{{ device.name }}</h3><p>{{ device.zone }}</p><small>{{ device.description }}</small><div class="battery"><i [style.width.%]="device.battery"></i></div><div class="device-actions"><a class="safe-button-outline" [routerLink]="['/devices', device.id]">{{ 'COMMON.DETAIL' | translate }}</a><label class="toggle" aria-label="Toggle device"><input type="checkbox" [checked]="device.status === 'active'" (change)="store.toggleDevice(device.id)"><span></span></label></div></article></section>
      <p *ngIf="toast()" class="toast">{{ toast() }}</p>
    </section>
  `,
  styles: [`
    .page-head { display:flex;justify-content:space-between;align-items:start;gap:16px; } .actions { display:flex;gap:10px;flex-wrap:wrap; }
    .summary-grid { display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:18px; } .summary-grid article { padding:22px;box-shadow:none; } .summary-grid strong { font-size:32px;display:block; } .summary-grid small { color:var(--muted); }
    .filters { display:flex;gap:10px;flex-wrap:wrap;margin-bottom:20px; } .filters button { border:1px solid var(--line);background:#fff;border-radius:999px;padding:10px 18px;font-weight:800;color:#63708c; } .filters button.active { background:var(--primary);color:#041833;border-color:var(--primary); }
    .device-grid { display:grid;grid-template-columns:repeat(3,1fr);gap:18px; } .device-card { padding:22px;display:grid;gap:12px;box-shadow:none; }
    .device-top { display:flex;justify-content:space-between;align-items:center; } .device-top .material-icons { width:46px;height:46px;border-radius:14px;background:#bffcf1;color:#053648;display:grid;place-items:center; }
    .device-card h3 { margin:6px 0 0; } .device-card p,.device-card small{margin:0;color:var(--muted);} .battery{height:7px;background:#eef3f9;border-radius:999px}.battery i{display:block;height:100%;border-radius:inherit;background:var(--primary)}
    .device-actions { display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:8px; }
    .toast { position:fixed;right:24px;bottom:24px; }
    @media(max-width:1100px){.device-grid{grid-template-columns:repeat(2,1fr)}.summary-grid{grid-template-columns:repeat(2,1fr)}} @media(max-width:650px){.page-head{flex-direction:column}.device-grid,.summary-grid{grid-template-columns:1fr}.actions{width:100%}.actions>*{flex:1}}
  `]
})
export class DevicesPageComponent {
  store = inject(SafeHomeStore);
  private translate = inject(TranslateService);
  filter = signal('all');
  toast = signal('');
  filterOptions = [
    { value: 'all', labelKey: 'DEVICES.FILTER_ALL' }, { value: 'motion', labelKey: 'DEVICES.FILTER_SENSORS' },
    { value: 'camera', labelKey: 'DEVICES.FILTER_CAMERAS' }, { value: 'lock', labelKey: 'DEVICES.FILTER_LOCKS' },
    { value: 'active', labelKey: 'DEVICES.ACTIVE' }, { value: 'inactive', labelKey: 'DEVICES.INACTIVE' }
  ];
  filteredDevices = computed(() => this.store.devices().filter((device) => this.filter() === 'all' || device.type === this.filter() || device.status === this.filter()));
  exportData(): void {
    const rows = this.filteredDevices().map((device) => [device.name, device.code, device.type, device.zone, this.translate.instant(this.statusLabel(device.status)), `${device.battery}%`, device.lastSeen, device.description]);
    const csv = [['Name', 'Code', 'Type', 'Zone', 'Status', 'Battery', 'Last seen', 'Description'], ...rows].map((row) => row.map((cell) => `\"${String(cell).replace(/\"/g, '\"\"')}\"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'safehome-devices.csv';
    link.click();
    URL.revokeObjectURL(link.href);
    this.toast.set(this.translate.instant('MESSAGES.EXPORTED'));
    setTimeout(() => this.toast.set(''), 2000);
  }
  icon(type: string): string { return type === 'camera' ? 'photo_camera' : type === 'lock' ? 'lock' : type === 'smoke' ? 'local_fire_department' : type === 'window' ? 'sensor_window' : 'sensors'; }
  statusClass(status: string): string { return status === 'warning' ? 'warning' : status === 'offline' ? 'danger' : status === 'inactive' ? 'info' : 'success'; }
  statusLabel(status: string): string { return `STATUS_LABELS.${status.toUpperCase()}`; }
}
