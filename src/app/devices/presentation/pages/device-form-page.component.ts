import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SafeHomeStore } from '../../../shared/application/safehome.store';
import { DeviceEntity } from '../../domain/model/device.entity';

/**
 * @summary Allows the user to add a new device and save the record.
 * @author SofTech
 */
@Component({
  selector: 'app-device-form-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  template: `
    <section aria-label="Add device page">
      <a class="safe-button-ghost" routerLink="/devices"><span class="material-icons">arrow_back</span>{{ 'COMMON.BACK' | translate }}</a>
      <h1 class="page-title">{{ 'DEVICES.ADD_TITLE' | translate }}</h1>
      <p class="page-subtitle">{{ 'DEVICES.ADD_SUBTITLE' | translate }}</p>

      <div class="stepper" aria-label="Device creation steps">
        <div class="step" [class.done]="step() > 1" [class.current]="step() === 1">
          <span>{{ step() > 1 ? '✓' : '1' }}</span>
          <strong>{{ 'DEVICES.SELECT_TYPE' | translate }}</strong>
        </div>
        <div class="step-line"></div>
        <div class="step" [class.done]="step() > 2" [class.current]="step() === 2">
          <span>{{ step() > 2 ? '✓' : '2' }}</span>
          <strong>{{ 'DEVICES.ENTER_DATA' | translate }}</strong>
        </div>
        <div class="step-line"></div>
        <div class="step" [class.current]="step() === 3">
          <span>3</span>
          <strong>{{ 'DEVICES.CONFIRM' | translate }}</strong>
        </div>
      </div>

      <section class="form-layout">
        <form class="safe-card form-card" (ngSubmit)="saveDevice()" aria-label="Device form">
          <ng-container *ngIf="step() === 1">
            <h3>{{ 'DEVICES.SELECT_TYPE' | translate }}</h3>
            <p class="helper">Choose the type of device you want to connect.</p>
            <div class="type-grid">
              <button type="button" *ngFor="let type of types" [class.active]="draft.type === type.value" (click)="selectType(type.value)">
                <span class="material-icons">{{ type.icon }}</span>
                <strong>{{ type.labelKey | translate }}</strong>
                <small>{{ type.textKey | translate }}</small>
              </button>
            </div>
            <div class="form-actions">
              <a class="safe-button-outline" routerLink="/devices">{{ 'COMMON.CANCEL' | translate }}</a>
              <button class="safe-button" type="button" (click)="nextStep()">{{ 'COMMON.NEXT' | translate }}</button>
            </div>
          </ng-container>

          <ng-container *ngIf="step() === 2">
            <h3>{{ 'DEVICES.DEVICE_DATA' | translate }}</h3>
            <div class="fields">
              <label><span class="field-label">{{ 'DEVICES.NAME' | translate }}</span><input class="safe-input" name="deviceName" [(ngModel)]="draft.name" placeholder="Example: Sensor PIR entrance" required></label>
              <label><span class="field-label">{{ 'DEVICES.CODE' | translate }}</span><input class="safe-input" name="deviceCode" [(ngModel)]="draft.code" readonly aria-label="Auto generated device code"></label>
              <label><span class="field-label">{{ 'DEVICES.ZONE' | translate }}</span><input class="safe-input" name="deviceZone" [(ngModel)]="draft.zone" placeholder="Example: Main entrance" required></label>
              <label><span class="field-label">{{ 'DEVICES.DESCRIPTION' | translate }}</span><input class="safe-input" name="deviceDescription" [(ngModel)]="draft.description" placeholder="Example: Sensor installed near the main door."></label>
            </div>
            <div class="status-select">
              <label [class.active]="draft.status === 'active'"><input type="radio" name="deviceStatus" value="active" [(ngModel)]="draft.status">{{ 'DEVICES.ACTIVE' | translate }}</label>
              <label [class.active]="draft.status === 'inactive'"><input type="radio" name="deviceStatus" value="inactive" [(ngModel)]="draft.status">{{ 'DEVICES.INACTIVE' | translate }}</label>
            </div>
            <div class="form-actions">
              <button class="safe-button-outline" type="button" (click)="previousStep()">{{ 'COMMON.BACK' | translate }}</button>
              <button class="safe-button" type="button" (click)="nextStep()">{{ 'COMMON.NEXT' | translate }}</button>
            </div>
          </ng-container>

          <ng-container *ngIf="step() === 3">
            <h3>{{ 'DEVICES.CONFIRM' | translate }}</h3>
            <div class="confirm-box">
              <div class="confirm-line"><small>{{ 'DEVICES.TYPE' | translate }}</small><strong>{{ typeLabel() }}</strong></div>
              <div class="confirm-line"><small>{{ 'DEVICES.NAME' | translate }}</small><strong>{{ draft.name || ('DEVICES.NEW_DEVICE' | translate) }}</strong></div>
              <div class="confirm-line"><small>{{ 'DEVICES.CODE' | translate }}</small><strong>{{ draft.code }}</strong></div>
              <div class="confirm-line"><small>{{ 'DEVICES.ZONE' | translate }}</small><strong>{{ draft.zone }}</strong></div>
              <div class="confirm-line"><small>{{ 'DEVICES.DESCRIPTION' | translate }}</small><strong>{{ draft.description || '-' }}</strong></div>
              <div class="confirm-line"><small>{{ 'DEVICES.STATUS' | translate }}</small><strong>{{ draft.status }}</strong></div>
            </div>
            <div class="form-actions">
              <button class="safe-button-outline" type="button" (click)="previousStep()">{{ 'COMMON.BACK' | translate }}</button>
              <button class="safe-button" type="submit">{{ 'COMMON.SAVE' | translate }}</button>
            </div>
          </ng-container>
        </form>

        <aside class="safe-card summary">
          <h3>{{ 'COMMON.SUMMARY' | translate }}</h3>
          <div class="summary-icon"><span class="material-icons">{{ selectedIcon() }}</span></div>
          <strong>{{ draft.name || ('DEVICES.NEW_DEVICE' | translate) }}</strong>
          <small>{{ draft.type }} · {{ draft.zone || ('DEVICES.NO_ZONE' | translate) }}</small>
          <p>{{ 'DEVICES.ADD_TIP' | translate }}</p>
        </aside>
      </section>
    <p *ngIf="message()" class="toast">{{ message() }}</p>
    </section>
  `,
  styles: [`
    .stepper { display: flex; align-items: center; gap: 12px; margin: 20px 0 26px; color: #8a98b0; flex-wrap: wrap; }
    .step { display: flex; align-items: center; gap: 10px; }
    .step span { width: 30px; height: 30px; border-radius: 50%; display: grid; place-items: center; background: #edf2f8; font-weight: 900; }
    .step.current span, .step.done span { background: var(--primary); color: #061832; }
    .step strong { font-size: 15px; }
    .step-line { width: 24px; height: 2px; background: #dbe4f0; }
    .form-layout { display: grid; grid-template-columns: minmax(0,1fr) 330px; gap: 22px; }
    .form-card, .summary { padding: 26px; box-shadow: none; }
    .helper { margin: -4px 0 18px; color: var(--muted); }
    .type-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; margin: 14px 0 26px; }
    .type-grid button { border: 1px solid var(--line); background: #fff; border-radius: 16px; min-height: 130px; display: grid; place-items: center; padding: 14px; text-align: center; }
    .type-grid button.active { background: #dffff7; border-color: var(--primary); box-shadow: 0 0 0 2px rgba(32,208,189,.2); }
    .type-grid .material-icons { font-size: 30px; color: var(--primary-dark); }
    .type-grid small { color: var(--muted); }
    .fields { display: grid; grid-template-columns: repeat(2,1fr); gap: 16px; }
    .status-select { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 22px 0; }
    .status-select label { border: 1px solid var(--line); border-radius: 14px; padding: 16px; font-weight: 800; }
    .status-select label.active { background: #e6fff8; border-color: var(--primary); }
    .confirm-box { border: 1px solid var(--line); border-radius: 18px; overflow: hidden; }
    .confirm-line { display: grid; grid-template-columns: 160px 1fr; gap: 14px; padding: 14px 16px; border-top: 1px solid var(--line); }
    .confirm-line:first-child { border-top: 0; }
    .confirm-line small { color: var(--muted); text-transform: uppercase; font-weight: 900; }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px; }
    .summary { display: grid; align-content: start; gap: 12px; }
    .summary-icon { height: 150px; border-radius: 16px; background: #b8f0e4; display: grid; place-items: center; }
    .summary-icon span { font-size: 54px; color: #06423d; }
    .summary p { background: #eef6ff; border: 1px solid #bfd8ff; border-radius: 14px; padding: 14px; color: #426189; } .safe-input[readonly]{background:#f6f9fc;color:#59677f}.toast{position:fixed;right:24px;bottom:24px;background:#07111f;color:#fff;padding:12px 14px;border-radius:14px;font-weight:800;z-index:30}
    @media(max-width:1000px){ .form-layout{grid-template-columns:1fr} .type-grid{grid-template-columns:repeat(2,1fr)} }
    @media(max-width:600px){ .fields,.status-select,.type-grid{grid-template-columns:1fr} .confirm-line{grid-template-columns:1fr} }
  `]
})
export class DeviceFormPageComponent {
  private router = inject(Router);
  private store = inject(SafeHomeStore);
  private translate = inject(TranslateService);
  step = signal(1);
  message = signal('');
  draft: Omit<DeviceEntity, 'id'> = {
    name: '',
    code: this.store.nextDeviceCode('motion'),
    type: 'motion',
    zone: '',
    status: 'active',
    battery: 100,
    lastSeen: 'Just now',
    description: ''
  };

  types: { value: DeviceEntity['type']; icon: string; labelKey: string; textKey: string }[] = [
    { value: 'motion', icon: 'sensors', labelKey: 'DEVICES.TYPE_MOTION', textKey: 'DEVICES.TYPE_MOTION_TEXT' },
    { value: 'camera', icon: 'photo_camera', labelKey: 'DEVICES.TYPE_CAMERA', textKey: 'DEVICES.TYPE_CAMERA_TEXT' },
    { value: 'lock', icon: 'lock', labelKey: 'DEVICES.TYPE_LOCK', textKey: 'DEVICES.TYPE_LOCK_TEXT' },
    { value: 'smoke', icon: 'local_fire_department', labelKey: 'DEVICES.TYPE_SMOKE', textKey: 'DEVICES.TYPE_SMOKE_TEXT' }
  ];

  /**
   * @summary Selects a device type.
   */
  selectType(type: DeviceEntity['type']): void { this.draft = { ...this.draft, type, code: this.store.nextDeviceCode(type) }; }

  /**
   * @summary Returns the current icon.
   */
  selectedIcon(): string { return this.types.find((item) => item.value === this.draft.type)?.icon || 'sensors'; }

  /**
   * @summary Returns the current type label.
   */
  typeLabel(): string { return this.types.find((item) => item.value === this.draft.type)?.value || this.draft.type; }

  /**
   * @summary Goes to the next step.
   */
  nextStep(): void {
    if (this.step() === 2 && (!this.draft.name.trim() || !this.draft.zone.trim())) {
      this.showMessage('MESSAGES.REQUIRED_FIELDS');
      return;
    }
    this.step.set(Math.min(3, this.step() + 1));
  }

  /**
   * @summary Goes to the previous step.
   */
  previousStep(): void { this.step.set(Math.max(1, this.step() - 1)); }

  /**
   * @summary Saves the new device.
   */
  saveDevice(): void {
    if (!this.draft.name.trim() || !this.draft.zone.trim()) {
      this.showMessage('MESSAGES.REQUIRED_FIELDS');
      return;
    }

    this.store.addDevice({ ...this.draft, name: this.draft.name.trim(), zone: this.draft.zone.trim(), description: this.draft.description.trim() });
    this.router.navigateByUrl('/devices');
  }

  /**
   * @summary Shows a translated notification.
   */
  showMessage(key: string): void {
    this.message.set(this.translate.instant(key));
    setTimeout(() => this.message.set(''), 2200);
  }
}
