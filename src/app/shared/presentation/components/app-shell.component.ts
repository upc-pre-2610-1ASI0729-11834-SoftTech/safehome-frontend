import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SafeHomeStore } from '../../application/safehome.store';
import { AuthService } from '../../../iam/infrastructure/services/auth.service';
import { IoTSimulatorService } from '../../application/iot-simulator.service';
import { LanguageSwitcherComponent } from './language-switcher.component';
import { SecurityEventEntity } from '../../../monitoring/domain/model/security-event.entity';

interface ToastNotification {
  id: number;
  event: SecurityEventEntity;
  visible: boolean;
}

/**
 * @summary Main layout with sidebar, topbar and routed content.
 * Refreshes backend events periodically so real Tuya alerts appear without manual reload.
 * @author SofTech
 */
@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, TranslateModule, LanguageSwitcherComponent],
  template: `
    <div class="app-layout">
      <aside class="sidebar" aria-label="SafeHome sidebar navigation">
        <a class="brand" routerLink="/dashboard" aria-label="Go to dashboard">
          <span class="brand-icon material-icons">home</span><span>SafeHome</span>
        </a>

        <nav class="menu" aria-label="Main navigation">
          <p>{{ 'NAV.MAIN' | translate }}</p>
          <a routerLink="/dashboard" routerLinkActive="active"><span class="material-icons">grid_view</span>{{ 'NAV.DASHBOARD' | translate }}</a>
          <a routerLink="/home-status" routerLinkActive="active"><span class="material-icons">shield</span>{{ 'NAV.HOME_STATUS' | translate }}</a>
          <a routerLink="/devices" routerLinkActive="active"><span class="material-icons">devices_other</span>{{ 'NAV.DEVICES' | translate }}</a>
          <a routerLink="/alerts" routerLinkActive="active"><span class="material-icons">notifications_none</span>{{ 'NAV.ALERTS' | translate }}<small *ngIf="store.pendingAlerts()">{{ store.pendingAlerts() }}</small></a>
          <a routerLink="/history" routerLinkActive="active"><span class="material-icons">history</span>{{ 'NAV.HISTORY' | translate }}</a>
          <p>{{ 'NAV.ACCOUNT' | translate }}</p>
          <a routerLink="/profile" routerLinkActive="active"><span class="material-icons">person_outline</span>{{ 'NAV.PROFILE' | translate }}</a>
          <a routerLink="/settings" routerLinkActive="active"><span class="material-icons">settings</span>{{ 'NAV.SETTINGS' | translate }}</a>
          <a routerLink="/support" routerLinkActive="active"><span class="material-icons">help_outline</span>{{ 'NAV.SUPPORT' | translate }}</a>
        </nav>

        <button class="logout" type="button" (click)="logout()" aria-label="Log out">
          <span class="material-icons">logout</span>{{ 'NAV.LOGOUT' | translate }}
        </button>
      </aside>

      <main class="content">
        <header class="topbar" aria-label="Application topbar">
          <div class="top-actions">
            <app-language-switcher />
            <button class="bell" type="button" routerLink="/alerts" aria-label="Open alerts"><span class="material-icons">notifications_none</span></button>
            <button class="user" type="button" routerLink="/profile" aria-label="Open profile">
              <span>{{ store.user().initials }}</span>
              <strong>{{ shortName() }}</strong>
              <small>{{ store.user().plan }}</small>
            </button>
          </div>
        </header>

        <section class="route-box"><router-outlet /></section>
      </main>
    </div>

    <!-- Real-time-like event notifications -->
    <div class="toast-stack" aria-live="polite" aria-label="IoT event notifications">
      <div
          *ngFor="let toast of toasts()"
          [class]="'iot-toast ' + severityClass(toast.event.severity) + (toast.visible ? ' visible' : '')"
          role="alert"
      >
        <span class="toast-icon material-icons">{{ eventIcon(toast.event.type) }}</span>
        <div class="toast-body">
          <strong>{{ toast.event.title }}</strong>
          <p>{{ toast.event.device }} · {{ toast.event.zone }}</p>
        </div>
        <button class="toast-close material-icons" type="button" (click)="dismissToast(toast.id)" aria-label="Dismiss notification">close</button>
      </div>
    </div>
  `,
  styles: [`
    .app-layout { min-height: 100vh; display: grid; grid-template-columns: 260px minmax(0, 1fr); background: var(--page); }
    .sidebar { position: sticky; top: 0; height: 100vh; background: #fff; border-right: 1px solid var(--line); display: flex; flex-direction: column; padding: 22px 18px; }
    .brand { display: inline-flex; align-items: center; gap: 12px; color: var(--ink); font-size: 20px; font-weight: 900; margin-bottom: 28px; }
    .brand-icon { width: 44px; height: 44px; display: grid; place-items: center; border-radius: 14px; background: var(--primary); color: #fff; }
    .menu { display: grid; gap: 7px; }
    .menu p { margin: 16px 0 6px; color: #95a2bc; font-size: 12px; font-weight: 900; text-transform: uppercase; letter-spacing: .05em; }
    .menu a { min-height: 44px; border-radius: 12px; color: #63708c; display: flex; align-items: center; gap: 12px; padding: 0 13px; font-weight: 800; }
    .menu a .material-icons { width: 30px; height: 30px; border-radius: 9px; background: #e1fff8; color: var(--primary-dark); display: grid; place-items: center; font-size: 20px; }
    .menu a .material-icons { color: #7d8ba5; font-size: 20px; }
    .menu a.active, .menu a:hover { background: var(--primary-soft); color: var(--primary-dark); }
    .menu a.active .material-icons, .menu a:hover .material-icons { background: var(--primary); color: #06223d; }
    .menu a.active .material-icons, .menu a:hover .material-icons { color: var(--primary-dark); }
    .menu small { margin-left: auto; background: #ffeff1; color: var(--danger); border-radius: 50%; min-width: 22px; min-height: 22px; display: grid; place-items: center; font-weight: 900; }
    .logout { margin-top: auto; min-height: 44px; border: 0; background: transparent; color: #ff4f63; display: inline-flex; align-items: center; gap: 12px; font-weight: 800; padding: 0 10px; }
    .content { min-width: 0; }
    .topbar { height: 72px; background: #fff; border-bottom: 1px solid var(--line); display: flex; align-items: center; justify-content: flex-end; gap: 16px; padding: 0 30px; }
    .top-actions { display: flex; align-items: center; gap: 12px; }
    .bell { width: 42px; height: 42px; border: 0; background: transparent; color: #66748d; }
    .user { border: 0; background: transparent; display: grid; grid-template-columns: 42px auto; column-gap: 10px; text-align: left; align-items: center; }
    .user span { grid-row: span 2; width: 42px; height: 42px; border-radius: 50%; display: grid; place-items: center; background: var(--primary); color: #fff; font-weight: 900; }
    .user strong { font-size: 14px; color: var(--ink); }
    .user small { color: #8391aa; }
    .route-box { max-width: 1320px; margin: 0 auto; padding: 36px 36px 54px; }

    .toast-stack { position: fixed; bottom: 24px; right: 24px; display: flex; flex-direction: column; gap: 12px; z-index: 9999; pointer-events: none; }
    .iot-toast {
      pointer-events: all;
      display: flex; align-items: center; gap: 14px;
      min-width: 320px; max-width: 420px;
      background: #fff; border-radius: 16px;
      padding: 14px 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,.14), 0 2px 8px rgba(0,0,0,.08);
      border-left: 5px solid #ccc;
      opacity: 0; transform: translateX(24px);
      transition: opacity .35s ease, transform .35s ease;
    }
    .iot-toast.visible { opacity: 1; transform: translateX(0); }
    .iot-toast.toast-critical { border-color: #f55b73; }
    .iot-toast.toast-medium   { border-color: #f5a623; }
    .iot-toast.toast-info     { border-color: #3b9eff; }
    .iot-toast.toast-resolved { border-color: #28d2bf; }
    .toast-icon { font-size: 28px; flex-shrink: 0; }
    .toast-critical .toast-icon { color: #f55b73; }
    .toast-medium   .toast-icon { color: #f5a623; }
    .toast-info     .toast-icon { color: #3b9eff; }
    .toast-resolved .toast-icon { color: #28d2bf; }
    .toast-body { flex: 1; min-width: 0; }
    .toast-body strong { display: block; font-size: 14px; color: var(--ink); margin-bottom: 2px; }
    .toast-body p { margin: 0; font-size: 12px; color: var(--muted); }
    .toast-close { border: 0; background: transparent; color: #aab; font-size: 18px; padding: 4px; cursor: pointer; flex-shrink: 0; }

    @media (max-width: 980px) { .app-layout { grid-template-columns: 1fr; } .sidebar { position: relative; height: auto; } .menu { grid-template-columns: repeat(2, minmax(0, 1fr)); } .topbar { padding: 14px; height: auto; align-items: stretch; flex-direction: column; } .route-box { padding: 24px 16px; } }
    @media (max-width: 650px) { .iot-toast { min-width: 0; width: calc(100vw - 32px); } .toast-stack { right: 16px; bottom: 16px; } }
  `]
})
export class AppShellComponent implements OnInit, OnDestroy {
  store = inject(SafeHomeStore);
  private router = inject(Router);
  private simulator = inject(IoTSimulatorService);
  private authService = inject(AuthService);

  toasts = signal<ToastNotification[]>([]);
  private toastCounter = 0;

  // Polling del frontend: permite ver alertas reales de Tuya sin refrescar manualmente.
  private alertRefreshIntervalId?: number;

  // Evita mostrar toasts de eventos antiguos cuando entras a la app.
  private knownEventIds = new Set<string>();

  ngOnInit(): void {
    // Carga inicial desde backend.
    this.store.loadDevices();
    this.store.loadEvents();
    this.store.loadZones();
    this.store.loadTickets();
    this.store.loadSettings();

    // Guardamos los eventos que ya existían para no notificarlos como nuevos.
    setTimeout(() => {
      this.knownEventIds = new Set(this.store.events().map((event) => event.id));
    }, 1000);

    // Reconsulta eventos cada 3 segundos para que las alertas Tuya aparezcan sin refrescar.
    this.alertRefreshIntervalId = window.setInterval(() => {
      const beforeIds = new Set(this.store.events().map((event) => event.id));

      this.store.loadEvents();

      setTimeout(() => {
        const currentEvents = this.store.events();

        const newEvents = currentEvents.filter((event) =>
            !beforeIds.has(event.id) &&
            !this.knownEventIds.has(event.id)
        );

        newEvents.forEach((event) => this.showToast(event));
        currentEvents.forEach((event) => this.knownEventIds.add(event.id));
      }, 700);
    }, 3000);

    this.simulator.onEvent = (event) => this.showToast(event);

    // Para demo real con sensor Tuya, dejamos apagado el simulador local.
    // Si lo activas, puede crear alertas falsas y mezclarse con las reales.
    // this.simulator.start(180_000, 1_800_000);
  }

  ngOnDestroy(): void {
    this.simulator.stop();

    if (this.alertRefreshIntervalId) {
      clearInterval(this.alertRefreshIntervalId);
    }
  }

  shortName(): string {
    const names = this.store.user().name.split(' ').filter(Boolean);
    const first = names[0] || 'User';
    const second = names[1]?.[0] || '';
    return second ? `${first} ${second}.` : first;
  }

  logout(): void {
    this.simulator.stop();

    if (this.alertRefreshIntervalId) {
      clearInterval(this.alertRefreshIntervalId);
    }

    this.store.clearState();
    this.authService.logout();
  }

  dismissToast(id: number): void {
    this.toasts.update((list) => list.map((t) => t.id === id ? { ...t, visible: false } : t));
    setTimeout(() => this.toasts.update((list) => list.filter((t) => t.id !== id)), 400);
  }

  severityClass(severity: string): string {
    return `toast-${severity}`;
  }

  eventIcon(type: string): string {
    const icons: Record<string, string> = {
      intrusion: 'warning',
      smoke: 'local_fire_department',
      camera: 'photo_camera',
      lock: 'lock',
      battery: 'battery_alert',
      system: 'sensor_window',
      motion: 'sensors'
    };
    return icons[type] ?? 'notifications';
  }

  private showToast(event: SecurityEventEntity): void {
    const id = ++this.toastCounter;
    this.toasts.update((list) => [...list, { id, event, visible: false }]);

    setTimeout(() => {
      this.toasts.update((list) => list.map((t) => t.id === id ? { ...t, visible: true } : t));
    }, 30);

    setTimeout(() => this.dismissToast(id), 6_000);

    if (this.toasts().length > 4) {
      this.dismissToast(this.toasts()[0].id);
    }
  }
}