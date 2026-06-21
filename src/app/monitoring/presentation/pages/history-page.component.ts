import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SafeHomeStore } from '../../../shared/application/safehome.store';
import { SecurityEventEntity } from '../../domain/model/security-event.entity';

/**
 * @summary Shows historical events with search, filters and export.
 * @author SofTech
 */
@Component({
  selector: 'app-history-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  template: `
    <section aria-label="Event history page">
      <div class="page-head">
        <div>
          <h1 class="page-title">{{ 'HISTORY.TITLE' | translate }}</h1>
          <p class="page-subtitle">{{ 'HISTORY.SUBTITLE' | translate }}</p>
        </div>

        <button class="safe-button-outline" type="button" (click)="exportData()" aria-label="Export event history">
          <span class="material-icons">download</span>
          {{ 'COMMON.EXPORT' | translate }}
        </button>
      </div>

      <section class="safe-card filter-card" aria-label="History filters">
        <label class="search-box">
          <span class="material-icons">search</span>
          <input
              name="historySearch"
              [(ngModel)]="search"
              [placeholder]="'HISTORY.SEARCH' | translate">
        </label>

        <select class="safe-select" name="historyStatus" [(ngModel)]="status">
          <option value="all">{{ 'HISTORY.ALL_STATUS' | translate }}</option>
          <option value="active">{{ 'STATUS_LABELS.ACTIVE' | translate }}</option>
          <option value="attended">{{ 'STATUS_LABELS.ATTENDED' | translate }}</option>
          <option value="resolved">{{ 'STATUS_LABELS.RESOLVED' | translate }}</option>
        </select>

        <select class="safe-select" name="historyPriority" [(ngModel)]="priority">
          <option value="all">{{ 'HISTORY.ALL_PRIORITIES' | translate }}</option>
          <option value="critical">{{ 'PRIORITY.CRITICAL' | translate }}</option>
          <option value="medium">{{ 'PRIORITY.MEDIUM' | translate }}</option>
          <option value="info">{{ 'PRIORITY.INFO' | translate }}</option>
          <option value="resolved">{{ 'PRIORITY.LOW' | translate }}</option>
        </select>

        <select class="safe-select" name="historyDevice" [(ngModel)]="device">
          <option value="all">{{ 'HISTORY.ALL_DEVICES' | translate }}</option>
          <option *ngFor="let name of deviceNames()" [value]="name">{{ name }}</option>
        </select>
      </section>

      <section class="safe-card table-card">
        <div class="table-wrap">
          <table aria-label="Event history table">
            <thead>
            <tr>
              <th>{{ 'ALERTS.DATE' | translate }}</th>
              <th>{{ 'EVENTS.EVENT' | translate }}</th>
              <th>{{ 'ALERTS.DEVICE' | translate }}</th>
              <th>{{ 'ALERTS.LOCATION' | translate }}</th>
              <th>{{ 'HISTORY.PRIORITY' | translate }}</th>
              <th>{{ 'ALERTS.STATUS' | translate }}</th>
              <th>{{ 'HISTORY.DESCRIPTION' | translate }}</th>
              <th>{{ 'COMMON.DETAIL' | translate }}</th>
            </tr>
            </thead>

            <tbody>
            <tr *ngFor="let event of filteredEvents()">
              <td>{{ event.createdAt }}</td>

              <td>
                <strong>{{ translatedBackendText(event.title) }}</strong>
              </td>

              <td>{{ event.device }}</td>

              <td>{{ translatedBackendText(event.zone) }}</td>

              <td>
                  <span [class]="'badge ' + tone(event.severity)">
                    {{ priorityLabel(event.severity) | translate }}
                  </span>
              </td>

              <td>
                  <span [class]="'status-pill ' + event.status">
                    {{ statusLabel(event.status) | translate }}
                  </span>
              </td>

              <td class="description-cell">
                {{ translatedBackendText(event.description) }}
              </td>

              <td>
                <a class="safe-button-outline compact" [routerLink]="['/alerts', event.id]">
                  {{ 'COMMON.DETAIL' | translate }}
                </a>
              </td>
            </tr>
            </tbody>
          </table>
        </div>

        <footer class="table-footer">
          <span>{{ 'HISTORY.SHOWING' | translate:{ count: filteredEvents().length } }}</span>
        </footer>
      </section>

      <p *ngIf="toast()" class="toast">{{ toast() }}</p>
    </section>
  `,
  styles: [`
    .page-head{
      display:flex;
      justify-content:space-between;
      align-items:start;
      gap:16px;
    }

    .filter-card{
      padding:18px;
      display:grid;
      grid-template-columns:minmax(260px,1fr)170px 180px 200px;
      gap:12px;
      margin-bottom:20px;
      box-shadow:none;
    }

    .search-box{
      display:flex;
      align-items:center;
      gap:10px;
      border:1px solid #d8e2ee;
      border-radius:12px;
      background:#fff;
      padding:0 14px;
    }

    .search-box input{
      border:0;
      outline:0;
      width:100%;
      min-height:48px;
      background:transparent;
    }

    .table-card{
      padding:18px;
      box-shadow:none;
    }

    .table-wrap{
      overflow:visible;
    }

    .table-card table{
      table-layout:fixed;
    }

    .table-card th,
    .table-card td{
      white-space:normal;
      vertical-align:top;
      font-size:13px;
      line-height:1.35;
      padding:12px 8px;
    }

    .table-card th:nth-child(1){width:12%}
    .table-card th:nth-child(2){width:18%}
    .table-card th:nth-child(3){width:14%}
    .table-card th:nth-child(4){width:13%}
    .table-card th:nth-child(5){width:11%}
    .table-card th:nth-child(6){width:11%}
    .table-card th:nth-child(7){width:14%}
    .table-card th:nth-child(8){width:7%}

    .compact{
      min-height:32px;
      padding:0 10px;
      font-size:12px;
    }

    .description-cell{
      color:var(--muted);
    }

    .status-pill{
      display:inline-flex;
      border-radius:999px;
      padding:5px 9px;
      font-size:11px;
      font-weight:900;
    }

    .status-pill.active{
      background:#ffe8ec;
      color:var(--danger);
    }

    .status-pill.attended{
      background:#edf1ff;
      color:var(--info);
    }

    .status-pill.resolved{
      background:#e2fff3;
      color:var(--success);
    }

    .table-footer{
      display:flex;
      justify-content:flex-start;
      align-items:center;
      gap:12px;
      padding:16px 6px 4px;
      color:var(--muted);
      font-weight:800;
    }

    .toast{
      position:fixed;
      right:24px;
      bottom:24px;
    }

    @media(max-width:1100px){
      .filter-card{
        grid-template-columns:1fr 1fr;
      }

      .table-card th,
      .table-card td{
        font-size:12px;
        padding:10px 6px;
      }
    }

    @media(max-width:720px){
      .filter-card{
        grid-template-columns:1fr;
      }

      .page-head{
        flex-direction:column;
      }

      .table-card{
        overflow-x:auto;
      }

      .table-card .table-wrap{
        min-width:860px;
      }
    }
  `]
})
export class HistoryPageComponent {
  store = inject(SafeHomeStore);
  private translate = inject(TranslateService);

  search = '';
  status = 'all';
  priority = 'all';
  device = 'all';
  toast = signal('');

  deviceNames(): string[] {
    return Array.from(new Set(this.store.events().map(event => event.device)));
  }

  filteredEvents(): SecurityEventEntity[] {
    const search = this.search.trim().toLowerCase();

    return this.store.events().filter(event => {
      const text = `
        ${event.title}
        ${event.description}
        ${event.device}
        ${event.zone}
        ${event.createdAt}
        ${this.translatedBackendText(event.title)}
        ${this.translatedBackendText(event.description)}
        ${this.translatedBackendText(event.zone)}
      `.toLowerCase();

      return (!search || text.includes(search)) &&
          (this.status === 'all' || event.status === this.status) &&
          (this.priority === 'all' || event.severity === this.priority) &&
          (this.device === 'all' || event.device === this.device);
    });
  }

  exportData(): void {
    const rows = this.filteredEvents().map(event => [
      event.createdAt,
      this.translatedBackendText(event.title),
      event.device,
      this.translatedBackendText(event.zone),
      this.translate.instant(this.priorityLabel(event.severity)),
      this.translate.instant(this.statusLabel(event.status)),
      this.translatedBackendText(event.description)
    ]);

    const headers = [
      this.translate.instant('ALERTS.DATE'),
      this.translate.instant('EVENTS.EVENT'),
      this.translate.instant('ALERTS.DEVICE'),
      this.translate.instant('ALERTS.LOCATION'),
      this.translate.instant('HISTORY.PRIORITY'),
      this.translate.instant('ALERTS.STATUS'),
      this.translate.instant('HISTORY.DESCRIPTION')
    ];

    const csv = [headers, ...rows]
        .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    link.href = URL.createObjectURL(blob);
    link.download = 'safehome-event-history.csv';
    link.click();

    URL.revokeObjectURL(link.href);

    this.toast.set(this.translate.instant('MESSAGES.EXPORTED'));
    setTimeout(() => this.toast.set(''), 2000);
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

  statusLabel(status: string): string {
    return `STATUS_LABELS.${status.toUpperCase()}`;
  }

  priorityLabel(severity: string): string {
    return severity === 'critical'
        ? 'PRIORITY.CRITICAL'
        : severity === 'medium'
            ? 'PRIORITY.MEDIUM'
            : severity === 'info'
                ? 'PRIORITY.INFO'
                : 'PRIORITY.LOW';
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