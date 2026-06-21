import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SafeHomeStore } from '../../../shared/application/safehome.store';

/**
 * @summary Shows security alerts and filtering actions.
 * @author SofTech
 */
@Component({
  selector: 'app-alerts-page',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  template: `
    <section aria-label="Alerts page">
      <div class="page-head">
        <div>
          <h1 class="page-title">{{ 'ALERTS.TITLE' | translate }}</h1>
          <p class="page-subtitle">{{ 'ALERTS.SUBTITLE' | translate }}</p>
        </div>

        <div class="actions">
          <button class="safe-button-outline" type="button" (click)="showFilters.set(!showFilters())">
            <span class="material-icons">filter_list</span>
            {{ 'COMMON.FILTER' | translate }}
          </button>

          <button class="safe-button" type="button" (click)="store.markAllAlertsAttended()">
            {{ 'ALERTS.MARK_ALL' | translate }}
          </button>
        </div>
      </div>

      <section class="alert-summary">
        <article class="safe-card danger">
          <strong>{{ count('critical') }}</strong>
          <small>{{ 'ALERTS.CRITICAL' | translate }}</small>
        </article>

        <article class="safe-card warning">
          <strong>{{ count('medium') }}</strong>
          <small>{{ 'ALERTS.MEDIUM' | translate }}</small>
        </article>

        <article class="safe-card info">
          <strong>{{ count('info') }}</strong>
          <small>{{ 'ALERTS.INFO' | translate }}</small>
        </article>

        <article class="safe-card success">
          <strong>{{ count('resolved') }}</strong>
          <small>{{ 'ALERTS.RESOLVED' | translate }}</small>
        </article>
      </section>

      <div class="filters" *ngIf="showFilters()">
        <button
            *ngFor="let item of filters"
            type="button"
            [class.active]="filter() === item.value"
            (click)="filter.set(item.value)">
          {{ item.labelKey | translate }}
        </button>
      </div>

      <section class="alert-list">
        <article
            *ngFor="let event of filteredEvents()"
            [class]="'safe-card alert-row ' + tone(event.severity)">

          <span class="material-icons">{{ icon(event.type) }}</span>

          <div>
            <strong>{{ translatedBackendText(event.title) }}</strong>
            <p>
              {{ event.device }}
              · {{ translatedBackendText(event.zone) }}
              · {{ event.createdAt }}
            </p>
          </div>

          <span [class]="'badge ' + tone(event.severity)">
            {{ statusLabel(event.status) | translate }}
          </span>

          <a class="safe-button-outline" [routerLink]="['/alerts', event.id]">
            {{ 'COMMON.DETAIL' | translate }}
          </a>
        </article>
      </section>
    </section>
  `,
  styles: [`
    .page-head{
      display:flex;
      justify-content:space-between;
      align-items:start;
      gap:16px;
    }

    .actions{
      display:flex;
      gap:10px;
      flex-wrap:wrap;
    }

    .alert-summary{
      display:grid;
      grid-template-columns:repeat(4,1fr);
      gap:16px;
      margin-bottom:18px;
    }

    .alert-summary article{
      padding:22px;
      box-shadow:none;
      border-top:4px solid var(--primary);
    }

    .alert-summary .danger{
      border-color:var(--danger);
    }

    .alert-summary .warning{
      border-color:var(--warning);
    }

    .alert-summary .info{
      border-color:var(--info);
    }

    .alert-summary .success{
      border-color:var(--success);
    }

    .alert-summary strong{
      font-size:32px;
      display:block;
    }

    .alert-summary small{
      color:var(--muted);
    }

    .filters{
      display:flex;
      gap:10px;
      flex-wrap:wrap;
      margin-bottom:18px;
    }

    .filters button{
      border:1px solid var(--line);
      background:#fff;
      border-radius:999px;
      padding:10px 18px;
      font-weight:800;
      color:#63708c;
    }

    .filters button.active{
      background:var(--primary);
      color:#041833;
      border-color:var(--primary);
    }

    .alert-list{
      display:grid;
      gap:14px;
    }

    .alert-row{
      padding:18px;
      display:grid;
      grid-template-columns:54px 1fr auto auto;
      gap:16px;
      align-items:center;
      box-shadow:none;
      border-left:5px solid var(--line);
    }

    .alert-row.danger{
      border-left-color:var(--danger);
    }

    .alert-row.warning{
      border-left-color:var(--warning);
    }

    .alert-row.info{
      border-left-color:var(--info);
    }

    .alert-row.success{
      border-left-color:var(--success);
    }

    .alert-row>.material-icons{
      width:46px;
      height:46px;
      border-radius:50%;
      display:grid;
      place-items:center;
      background:#f4f7fb;
    }

    .alert-row p{
      margin:5px 0 0;
      color:var(--muted);
    }

    @media(max-width:920px){
      .alert-summary{
        grid-template-columns:repeat(2,1fr);
      }

      .alert-row{
        grid-template-columns:54px 1fr;
      }

      .alert-row .badge,
      .alert-row .safe-button-outline{
        grid-column:2;
      }
    }

    @media(max-width:600px){
      .page-head,
      .actions{
        flex-direction:column;
      }

      .alert-summary{
        grid-template-columns:1fr;
      }
    }
  `]
})
export class AlertsPageComponent {
  store = inject(SafeHomeStore);
  private translate = inject(TranslateService);

  filter = signal('all');
  showFilters = signal(true);

  filters = [
    { value: 'all', labelKey: 'DEVICES.FILTER_ALL' },
    { value: 'active', labelKey: 'STATUS_LABELS.ACTIVE' },
    { value: 'critical', labelKey: 'ALERTS.CRITICAL' },
    { value: 'medium', labelKey: 'ALERTS.MEDIUM' },
    { value: 'info', labelKey: 'ALERTS.INFO' },
    { value: 'resolved', labelKey: 'ALERTS.RESOLVED' }
  ];

  filteredEvents = computed(() =>
      this.store.events().filter(event =>
          this.filter() === 'all' ||
          event.status === this.filter() ||
          event.severity === this.filter()
      )
  );

  count(value: string): number {
    return this.store.events().filter(event =>
        value === 'resolved'
            ? event.status === 'resolved'
            : event.severity === value
    ).length;
  }

  tone(severity: string): string {
    return severity === 'critical'
        ? 'danger'
        : severity === 'medium'
            ? 'warning'
            : severity === 'info'
                ? 'info'
                : 'success';
  }

  icon(type: string): string {
    return type === 'battery'
        ? 'bolt'
        : type === 'camera'
            ? 'videocam'
            : type === 'lock'
                ? 'lock'
                : type === 'smoke'
                    ? 'local_fire_department'
                    : 'warning';
  }

  statusLabel(status: string): string {
    return `STATUS_LABELS.${status.toUpperCase()}`;
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