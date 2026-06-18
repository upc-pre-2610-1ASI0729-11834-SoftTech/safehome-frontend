import { computed, inject, Injectable, signal } from '@angular/core';
import { DeviceEntity } from '../../devices/domain/model/device.entity';
import { SecurityEventEntity } from '../../monitoring/domain/model/security-event.entity';
import {
  AccountActivityEntity, HomeZoneEntity, SafeSettingsEntity,
  SafeUserEntity, SupportTicketEntity
} from '../domain/model/safehome-state.entity';
import { AuthService } from '../../iam/infrastructure/services/auth.service';
import { UserApiService } from '../../iam/infrastructure/services/user-api.service';
import { DeviceApiService } from '../../devices/infrastructure/services/device-api.service';
import { DeviceAssembler } from '../../devices/infrastructure/assemblers/device.assembler';
import { SecurityEventApiService } from '../../monitoring/infrastructure/services/security-event-api.service';
import { SecurityEventAssembler } from '../../monitoring/infrastructure/assemblers/security-event.assembler';
import { SupportTicketApiService } from '../../support/infrastructure/services/support-ticket-api.service';
import { SupportTicketAssembler } from '../../support/infrastructure/assemblers/support-ticket.assembler';
import { UserSettingsApiService } from '../../settings/infrastructure/services/user-settings-api.service';
import { UserSettingsAssembler } from '../../settings/infrastructure/assemblers/user-settings.assembler';
import { ZoneApiService, ZoneApiResource } from '../infrastructure/services/zone-api.service';

const ACTIVITIES_KEY = 'safehome-v7-activities';
const SETTINGS_KEY = 'safehome-v7-settings';

const defaultSettings: SafeSettingsEntity = {
  homeName: 'My Home',
  emailNotifications: true,
  pushNotifications: true,
  systemNotifications: true,
  emailSummary: false,
  autoArm: false,
  darkMode: false,
  twoFactor: false,
  autoLogout: true,
  loginAlerts: true,
  sensibility: 'medium',
  updateTime: '30 seconds',
  sessionDuration: '8 hours',
  zoneReviewInterval: '6 hours',
  historyRetention: '6 months',
  hiddenSensors: false,
  language: 'en'
};

@Injectable({ providedIn: 'root' })
export class SafeHomeStore {
  private authService      = inject(AuthService);
  private userApi          = inject(UserApiService);
  private deviceApi        = inject(DeviceApiService);
  private securityEventApi = inject(SecurityEventApiService);
  private supportTicketApi = inject(SupportTicketApiService);
  private userSettingsApi  = inject(UserSettingsApiService);
  private zoneApi          = inject(ZoneApiService);

  user = signal<SafeUserEntity>({
    id:          this.authService.getUserId() ?? '',
    name:        this.authService.getUserName(),
    email:       this.authService.getUserEmail(),
    phone:       this.authService.getUserPhone ? this.authService.getUserPhone() : '',
    address:     this.authService.getUserAddress ? this.authService.getUserAddress() : '',
    plan:        'SafeHome Pro',
    initials:    this.getInitials(this.authService.getUserName()),
    memberSince: ''
  });

  devices    = signal<DeviceEntity[]>([]);
  events     = signal<SecurityEventEntity[]>([]);
  zones      = signal<HomeZoneEntity[]>([]);
  settings   = signal<SafeSettingsEntity>(this.loadSettingsFromStorage());
  tickets    = signal<SupportTicketEntity[]>([]);
  activities = signal<AccountActivityEntity[]>(this.loadActivities());

  loading = signal<boolean>(false);
  error   = signal<string | null>(null);

  activeDevices  = computed(() => this.devices().filter(d => d.status === 'active').length);
  pendingAlerts  = computed(() => this.events().filter(e => e.status === 'active').length);
  warningDevices = computed(() => this.devices().filter(d => d.status === 'warning').length);
  offlineDevices = computed(() => this.devices().filter(d => d.status === 'offline').length);
  totalEvents    = computed(() => this.events().length);

  uptime = computed(() => {
    const total  = this.devices().length || 1;
    const stable = this.devices().filter(d => d.status === 'active' || d.status === 'warning').length;
    return `${Math.min(99.9, Math.round((stable / total) * 998) / 10)}%`;
  });

  weeklyActivity = computed(() => {
    const labels = [
      'DASHBOARD.DAY_MON', 'DASHBOARD.DAY_TUE', 'DASHBOARD.DAY_WED',
      'DASHBOARD.DAY_THU', 'DASHBOARD.DAY_FRI', 'DASHBOARD.DAY_SAT', 'DASHBOARD.DAY_SUN'
    ];

    const values = [0, 0, 0, 0, 0, 0, 0];

    this.events().forEach((event, index) => {
      values[index % 7] += event.status === 'active' ? 2 : 1;
    });

    const max = Math.max(1, ...values);

    return labels.map((labelKey, index) => ({
      labelKey,
      value: values[index],
      height: Math.max(18, Math.round((values[index] / max) * 88))
    }));
  });

  averageBattery = computed(() => {
    const devs = this.devices().filter(device => device.battery > 0);
    if (!devs.length) return 0;
    return Math.round(devs.reduce((total, device) => total + device.battery, 0) / devs.length);
  });

  loadDevices(): void {
    this.loading.set(true);
    this.error.set(null);

    const propertyId = this.authService.getPropertyId();
    const request$ = propertyId
        ? this.deviceApi.findByProperty(propertyId)
        : this.deviceApi.findAll();

    request$.subscribe({
      next: resources => {
        this.devices.set(DeviceAssembler.toEntities(resources));
        this.loading.set(false);
      },
      error: err => {
        this.error.set(this.friendlyError(err, 'Could not load devices'));
        this.loading.set(false);
      }
    });
  }

  loadEvents(): void {
    this.error.set(null);

    const propertyId = this.authService.getPropertyId();
    const request$ = propertyId
        ? this.securityEventApi.findByProperty(propertyId)
        : this.securityEventApi.findAll();

    request$.subscribe({
      next: resources => this.events.set(SecurityEventAssembler.toEntities(resources)),
      error: err => this.error.set(this.friendlyError(err, 'Could not load security events'))
    });
  }

  loadZones(): void {
    const propertyId = this.authService.getPropertyId();

    if (!propertyId) {
      this.deriveZonesFromDevices();
      return;
    }

    this.zoneApi.findByProperty(propertyId).subscribe({
      next: resources => {
        this.zones.set(resources.map((resource, index) => this.zoneResourceToEntity(resource, index)));
      },
      error: () => this.deriveZonesFromDevices()
    });
  }

  loadTickets(): void {
    const userId = this.authService.getUserId();
    if (!userId) return;

    this.supportTicketApi.findByUser(userId).subscribe({
      next: resources => this.tickets.set(
          SupportTicketAssembler.toEntities(resources, this.user().email, this.user().name)
      ),
      error: err => this.error.set(this.friendlyError(err, 'Could not load support tickets'))
    });
  }

  loadSettings(): void {
    const localSettings = this.loadSettingsFromStorage();
    this.settings.set(localSettings);
    document.body.classList.toggle('dark-mode', localSettings.darkMode);

    const userId = this.authService.getUserId();
    if (!userId) return;

    this.userSettingsApi.findByUser(userId).subscribe({
      next: resource => {
        const backendSettings = UserSettingsAssembler.toEntity(resource);

        const savedRaw = localStorage.getItem(SETTINGS_KEY);

        if (savedRaw) {
          const savedSettings = this.loadSettingsFromStorage();
          this.settings.set(savedSettings);
          document.body.classList.toggle('dark-mode', savedSettings.darkMode);
          return;
        }

        this.settings.set(backendSettings);
        this.saveSettingsToStorage(backendSettings);
        document.body.classList.toggle('dark-mode', backendSettings.darkMode);
      },
      error: () => {
        this.settings.set(localSettings);
        document.body.classList.toggle('dark-mode', localSettings.darkMode);
      }
    });
  }

  addDevice(device: Omit<DeviceEntity, 'id'>): void {
    const propertyId = this.authService.getPropertyId() ?? undefined;
    const request = DeviceAssembler.toRequest(device, propertyId);

    this.error.set(null);

    this.deviceApi.create(request).subscribe({
      next: resource => {
        const newDevice = DeviceAssembler.toEntity(resource);
        this.devices.update(devices => [newDevice, ...devices]);
        this.addActivity('Device added', `${newDevice.name} registered`, 'success');
        this.loadZones();
      },
      error: err => this.error.set(this.friendlyError(err, 'Could not add device'))
    });
  }

  updateDevice(device: DeviceEntity): void {
    const propertyId = this.authService.getPropertyId() ?? undefined;
    const request = DeviceAssembler.toRequest(device, propertyId);

    this.deviceApi.update(device.id, request).subscribe({
      next: resource => {
        const updated = DeviceAssembler.toEntity(resource);
        this.devices.update(devices => devices.map(current => current.id === device.id ? updated : current));
        this.addActivity('Device updated', `${device.name} information changed`, 'info');
      },
      error: err => this.error.set(this.friendlyError(err, 'Could not update device'))
    });
  }

  toggleDevice(id: string): void {
    const device = this.devices().find(item => item.id === id);
    if (!device) return;

    const newStatus = device.status === 'active' ? 'inactive' : 'active';
    const propertyId = this.authService.getPropertyId() ?? undefined;
    const request = DeviceAssembler.toRequest({ ...device, status: newStatus }, propertyId);

    this.deviceApi.update(id, request).subscribe({
      next: resource => {
        const updated = DeviceAssembler.toEntity(resource);
        this.devices.update(devices => devices.map(current => current.id === id ? updated : current));
      },
      error: err => this.error.set(this.friendlyError(err, 'Could not update device status'))
    });
  }

  deleteDevice(id: string): void {
    this.deviceApi.delete(id).subscribe({
      next: () => {
        this.devices.update(devices => devices.filter(device => device.id !== id));
        this.addActivity('Device deleted', 'A device was removed from the panel', 'warning');
        this.loadZones();
      },
      error: err => this.error.set(this.friendlyError(err, 'Could not delete device'))
    });
  }

  markEventAttended(id: string): void {
    this.securityEventApi.attend(id).subscribe({
      next: resource => {
        const updated = SecurityEventAssembler.fromApi(resource);
        this.events.update(events =>
            events.map(event => event.id === id ? updated : event)
        );
        this.addActivity('Alert attended', 'A security alert was marked as attended', 'success');
      },
      error: err => this.error.set(this.friendlyError(err, 'Could not mark event as attended'))
    });
  }

  markAllAlertsAttended(): void {
    const activeEvents = this.events().filter(event => event.status === 'active');

    if (!activeEvents.length) {
      this.addActivity('Alerts updated', 'There were no active alerts to update', 'info');
      return;
    }

    activeEvents.forEach(event => {
      this.securityEventApi.attend(event.id).subscribe({
        next: resource => {
          const updated = SecurityEventAssembler.fromApi(resource);
          this.events.update(events =>
              events.map(current => current.id === updated.id ? updated : current)
          );
        },
        error: err => this.error.set(this.friendlyError(err, 'Could not mark all alerts as attended'))
      });
    });

    this.addActivity('Alerts updated', 'All active alerts were marked as attended', 'success');
  }

  updateEvent(event: SecurityEventEntity): void {
    this.events.update(events =>
        events.map(current => current.id === event.id ? event : current)
    );
    this.addActivity('Event updated', event.title, 'info');
  }

  reactivateEvent(id: string): void {
    this.securityEventApi.reactivate(id).subscribe({
      next: resource => {
        const updated = SecurityEventAssembler.fromApi(resource);
        this.events.update(events =>
            events.map(event => event.id === id ? updated : event)
        );
        this.addActivity('Event reactivated', 'An event was restored as active', 'warning');
      },
      error: err => this.error.set(this.friendlyError(err, 'Could not reactivate event'))
    });
  }

  resolveEvent(id: string): void {
    this.securityEventApi.resolve(id).subscribe({
      next: resource => {
        const updated = SecurityEventAssembler.fromApi(resource);
        this.events.update(events =>
            events.map(event => event.id === id ? updated : event)
        );
        this.addActivity('Event resolved', 'A security event was resolved', 'success');
      },
      error: err => this.error.set(this.friendlyError(err, 'Could not resolve event'))
    });
  }

  deleteEvent(id: string): void {
    this.securityEventApi.delete(id).subscribe({
      next: () => {
        this.events.update(events => events.filter(event => event.id !== id));
        this.addActivity('Event deleted', 'An event was removed from the history', 'warning');
      },
      error: err => this.error.set(this.friendlyError(err, 'Could not delete event'))
    });
  }

  updateSettings(settings: SafeSettingsEntity): void {
    const updatedSettings: SafeSettingsEntity = { ...settings };

    this.settings.set(updatedSettings);
    this.saveSettingsToStorage(updatedSettings);
    document.body.classList.toggle('dark-mode', updatedSettings.darkMode);

    const userId = this.authService.getUserId();

    if (!userId) {
      this.addActivity('Settings updated', 'Preferences were saved locally', 'info');
      return;
    }

    const request = UserSettingsAssembler.toRequest(updatedSettings, userId);

    this.userSettingsApi.update(userId, request).subscribe({
      next: resource => {
        const backendSettings = UserSettingsAssembler.toEntity(resource);

        const finalSettings: SafeSettingsEntity = {
          ...backendSettings,
          darkMode: updatedSettings.darkMode,
          homeName: updatedSettings.homeName,
          sensibility: updatedSettings.sensibility,
          language: updatedSettings.language
        };

        this.settings.set(finalSettings);
        this.saveSettingsToStorage(finalSettings);
        document.body.classList.toggle('dark-mode', finalSettings.darkMode);
        this.addActivity('Settings updated', 'Preferences were saved', 'info');
      },
      error: () => {
        this.userSettingsApi.create({ ...request, userId }).subscribe({
          next: resource => {
            const backendSettings = UserSettingsAssembler.toEntity(resource);

            const finalSettings: SafeSettingsEntity = {
              ...backendSettings,
              darkMode: updatedSettings.darkMode,
              homeName: updatedSettings.homeName,
              sensibility: updatedSettings.sensibility,
              language: updatedSettings.language
            };

            this.settings.set(finalSettings);
            this.saveSettingsToStorage(finalSettings);
            document.body.classList.toggle('dark-mode', finalSettings.darkMode);
            this.addActivity('Settings created', 'Preferences were saved', 'success');
          },
          error: () => {
            this.settings.set(updatedSettings);
            this.saveSettingsToStorage(updatedSettings);
            document.body.classList.toggle('dark-mode', updatedSettings.darkMode);
            this.addActivity('Settings updated', 'Preferences were saved locally', 'info');
          }
        });
      }
    });
  }

  restoreDefaultConfig(): void {
    const restored = { ...defaultSettings };
    this.settings.set(restored);
    this.saveSettingsToStorage(restored);
    document.body.classList.remove('dark-mode');
    this.addActivity('Default configuration restored', 'Settings returned to standard values', 'info');

    const userId = this.authService.getUserId();
    if (!userId) return;

    const request = UserSettingsAssembler.toRequest(restored, userId);

    this.userSettingsApi.update(userId, request).subscribe({
      next: resource => {
        const updated = UserSettingsAssembler.toEntity(resource);
        this.settings.set(updated);
        this.saveSettingsToStorage(updated);
        document.body.classList.toggle('dark-mode', updated.darkMode);
      },
      error: () => {
        this.userSettingsApi.create({ ...request, userId }).subscribe({
          next: resource => {
            const created = UserSettingsAssembler.toEntity(resource);
            this.settings.set(created);
            this.saveSettingsToStorage(created);
            document.body.classList.toggle('dark-mode', created.darkMode);
          },
          error: () => {
            this.settings.set(restored);
            this.saveSettingsToStorage(restored);
            document.body.classList.toggle('dark-mode', restored.darkMode);
          }
        });
      }
    });
  }

  addTicket(ticket: Omit<SupportTicketEntity, 'id' | 'createdAt'>): void {
    const userId = this.authService.getUserId();
    if (!userId) return;

    this.supportTicketApi.create({
      userId,
      subject: ticket.subject,
      description: ticket.message,
      priority: 'MEDIUM'
    }).subscribe({
      next: resource => {
        const saved = SupportTicketAssembler.toEntity(resource, ticket.email, ticket.name);
        this.tickets.update(tickets => [saved, ...tickets]);
        this.addActivity('Support message sent', saved.subject, 'success');
      },
      error: err => this.error.set(this.friendlyError(err, 'Could not send support ticket'))
    });
  }

  updateUser(user: SafeUserEntity): void {
    const userId = this.authService.getUserId();

    const localUser: SafeUserEntity = {
      ...user,
      id: user.id || userId || '',
      initials: this.getInitials(user.name)
    };

    this.user.set(localUser);

    this.authService.updateStoredUser({
      id: localUser.id,
      name: localUser.name,
      email: localUser.email,
      phone: localUser.phone,
      address: localUser.address
    });

    if (!userId) {
      this.addActivity('Profile updated', 'Personal information was saved locally', 'info');
      return;
    }

    this.userApi.update(userId, {
      fullName: user.name,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address
    }).subscribe({
      next: resource => {
        const fullName = resource.fullName ?? resource.name ?? user.name;

        const updatedUser: SafeUserEntity = {
          ...localUser,
          id: resource.id ?? userId,
          name: fullName,
          email: resource.email ?? user.email,
          phone: resource.phone ?? user.phone,
          address: resource.address ?? user.address,
          initials: this.getInitials(fullName)
        };

        this.user.set(updatedUser);

        this.authService.updateStoredUser({
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          address: updatedUser.address
        });

        this.addActivity('Profile updated', 'Personal information was saved', 'info');
      },
      error: () => {
        this.addActivity('Profile updated', 'Personal information was saved locally', 'info');
      }
    });
  }

  addZone(): void {
    const nextId = String(this.zones().length + 1);
    this.zones.update(zones => [
      ...zones,
      { id: nextId, name: `New zone ${nextId}`, deviceCount: 0, status: 'safe', signal: 100 }
    ]);
  }

  updateZone(zone: HomeZoneEntity): void {
    this.zones.update(zones => zones.map(item => item.id === zone.id ? zone : item));
  }

  nextDeviceCode(type: DeviceEntity['type']): string {
    const prefixMap: Record<DeviceEntity['type'], string> = {
      motion: 'PIR',
      camera: 'CAM',
      lock: 'LOCK',
      smoke: 'SMK',
      window: 'WIN'
    };

    const count = this.devices().filter(device => device.type === type).length + 1;
    return `SH-2024-${prefixMap[type]}-${String(count).padStart(2, '0')}`;
  }

  addSimulatedEvent(event: SecurityEventEntity): void {
    this.events.update(events => [event, ...events]);
  }

  clearError(): void {
    this.error.set(null);
  }

  addActivity(title: string, description: string, tone: AccountActivityEntity['tone']): void {
    const activity: AccountActivityEntity = {
      id: String(Date.now()),
      title,
      description,
      time: 'Now',
      tone
    };

    const updated = [activity, ...this.activities()].slice(0, 8);
    this.activities.set(updated);

    try {
      localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(updated));
    } catch {
      /* ignore */
    }
  }

  clearState(): void {
    this.user.set({
      id: '',
      name: '',
      email: '',
      phone: '',
      address: '',
      plan: '',
      initials: '',
      memberSince: ''
    });

    this.devices.set([]);
    this.events.set([]);
    this.zones.set([]);
    this.settings.set({ ...defaultSettings });
    this.tickets.set([]);
    this.activities.set([]);
    this.error.set(null);

    try {
      localStorage.removeItem(ACTIVITIES_KEY);
      localStorage.removeItem(SETTINGS_KEY);
    } catch {
      /* ignore */
    }
  }

  private deriveZonesFromDevices(): void {
    const grouped = new Map<string, DeviceEntity[]>();

    this.devices().forEach(device => {
      const zone = device.zone || 'Unassigned';

      if (!grouped.has(zone)) {
        grouped.set(zone, []);
      }

      grouped.get(zone)!.push(device);
    });

    this.zones.set(
        Array.from(grouped.entries()).map(([name, devices], index) => ({
          id: String(index + 1),
          name,
          deviceCount: devices.length,
          status: devices.some(device => device.status === 'offline') ? 'critical'
              : devices.some(device => device.status === 'warning' || device.battery < 20) ? 'warning'
                  : 'safe',
          signal: Math.round(devices.reduce((sum, device) => sum + device.battery, 0) / devices.length)
        }))
    );
  }

  private zoneResourceToEntity(resource: ZoneApiResource, index: number): HomeZoneEntity {
    const statusMap: Record<string, HomeZoneEntity['status']> = {
      safe: 'safe',
      warning: 'warning',
      critical: 'critical',
      SAFE: 'safe',
      WARNING: 'warning',
      CRITICAL: 'critical'
    };

    return {
      id: String(index + 1),
      name: resource.name,
      deviceCount: resource.deviceCount,
      status: statusMap[resource.status] ?? 'safe',
      signal: resource.signalStrength ?? 100
    };
  }

  private saveSettingsToStorage(settings: SafeSettingsEntity): void {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      /* ignore */
    }
  }

  private loadSettingsFromStorage(): SafeSettingsEntity {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (!raw) return { ...defaultSettings };

      return {
        ...defaultSettings,
        ...JSON.parse(raw)
      };
    } catch {
      return { ...defaultSettings };
    }
  }

  private friendlyError(err: unknown, fallback: string): string {
    if (err && typeof err === 'object') {
      const e = err as Record<string, unknown>;

      if (e['error'] && typeof e['error'] === 'object') {
        const body = e['error'] as Record<string, unknown>;

        if (typeof body['message'] === 'string') {
          return body['message'];
        }
      }

      if (typeof e['message'] === 'string') {
        return e['message'];
      }

      if (typeof e['status'] === 'number') {
        return `${fallback} (HTTP ${e['status']})`;
      }
    }

    return fallback;
  }

  private loadActivities(): AccountActivityEntity[] {
    try {
      const raw = localStorage.getItem(ACTIVITIES_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private getInitials(name: string): string {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0])
        .join('')
        .toUpperCase() || 'SH';
  }
}