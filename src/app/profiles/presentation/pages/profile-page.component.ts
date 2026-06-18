import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SafeHomeStore } from '../../../shared/application/safehome.store';
import { AccountActivityEntity, SafeUserEntity } from '../../../shared/domain/model/safehome-state.entity';

/**
 * @summary Shows and edits the user profile with saved account data.
 * @author SofTech
 */
@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <section aria-label="Profile page">
      <div class="page-head">
        <div>
          <h1 class="page-title">{{ 'PROFILE.TITLE' | translate }}</h1>
          <p class="page-subtitle">{{ 'PROFILE.SUBTITLE' | translate }}</p>
        </div>

        <div class="actions">
          <button class="safe-button" type="button" (click)="toggleEdit()" aria-label="Edit profile">
            <span class="material-icons">edit</span>
            {{ editing ? ('COMMON.CANCEL' | translate) : ('PROFILE.EDIT' | translate) }}
          </button>
        </div>
      </div>

      <article class="profile-hero">
        <span>{{ store.user().initials }}</span>
        <div>
          <h2>{{ store.user().name || '-' }}</h2>
          <p>{{ 'PROFILE.ADMIN' | translate }}</p>
          <small>{{ 'PROFILE.ACTIVE_ACCOUNT' | translate }}</small>
        </div>
      </article>

      <section class="profile-grid">
        <main>
          <article class="safe-card info-card">
            <div class="card-title">
              <div>
                <h3>{{ 'PROFILE.PERSONAL_INFO' | translate }}</h3>
                <p>{{ 'PROFILE.PERSONAL_SUBTITLE' | translate }}</p>
              </div>

              <button class="safe-button-outline compact" type="button" (click)="toggleEdit()">
                <span class="material-icons">edit</span>
                {{ 'COMMON.EDIT' | translate }}
              </button>
            </div>

            <div class="info-line">
              <span class="material-icons">person</span>
              <small>{{ 'PROFILE.FULL_NAME' | translate }}</small>
              <strong>{{ store.user().name || '-' }}</strong>
            </div>

            <div class="info-line">
              <span class="material-icons">mail</span>
              <small>{{ 'PROFILE.EMAIL' | translate }}</small>
              <strong>{{ store.user().email || '-' }}</strong>
            </div>

            <div class="info-line">
              <span class="material-icons">call</span>
              <small>{{ 'PROFILE.PHONE' | translate }}</small>
              <strong>{{ store.user().phone || '-' }}</strong>
            </div>

            <div class="info-line">
              <span class="material-icons">home</span>
              <small>{{ 'PROFILE.ADDRESS' | translate }}</small>
              <strong>{{ store.settings().homeName || '-' }}</strong>
            </div>
          </article>

          <form class="safe-card edit-card" *ngIf="editing" (ngSubmit)="saveProfile()" aria-label="Edit profile form">
            <h3>{{ 'PROFILE.EDIT' | translate }}</h3>

            <div class="fields">
              <label>
                <span class="field-label">{{ 'PROFILE.FULL_NAME' | translate }}</span>
                <input class="safe-input" name="name" [(ngModel)]="draft.name">
              </label>

              <label>
                <span class="field-label">{{ 'PROFILE.EMAIL' | translate }}</span>
                <input class="safe-input" name="email" [(ngModel)]="draft.email">
              </label>

              <label>
                <span class="field-label">{{ 'PROFILE.PHONE' | translate }}</span>
                <input class="safe-input" name="phone" [(ngModel)]="draft.phone">
              </label>

              <label>
                <span class="field-label">{{ 'PROFILE.ADDRESS' | translate }}</span>
                <input class="safe-input" name="address" [(ngModel)]="draft.address">
              </label>
            </div>

            <div class="form-actions">
              <button class="safe-button-outline" type="button" (click)="toggleEdit()">
                {{ 'COMMON.CANCEL' | translate }}
              </button>
              <button class="safe-button" type="submit">
                {{ 'COMMON.SAVE' | translate }}
              </button>
            </div>
          </form>
        </main>

        <aside>
          <article class="safe-card activity">
            <h3>{{ 'PROFILE.RECENT_ACTIVITY' | translate }}</h3>

            <p *ngFor="let item of store.activities()">
              <span [class]="'status-dot ' + item.tone"></span>
              <strong>{{ activityTitle(item) }}</strong>
              <small>{{ activityDescription(item) }} · {{ activityTime(item.time) }}</small>
            </p>

            <p *ngIf="!store.activities().length" class="empty-state">
              {{ currentLang() === 'es' ? 'No hay actividad reciente registrada.' : 'No recent activity recorded.' }}
            </p>
          </article>
        </aside>
      </section>

      <p *ngIf="message" class="toast">{{ message }}</p>
    </section>
  `,
  styles: [`
    .page-head{display:flex;justify-content:space-between;align-items:start;gap:16px}
    .actions{display:flex;gap:10px;flex-wrap:wrap}

    .profile-hero{
      border-radius:24px;
      background:#35d5c4;
      padding:34px;
      display:flex;
      align-items:center;
      gap:24px;
      margin-bottom:24px;
      overflow:hidden;
      position:relative;
    }

    .profile-hero:after{
      content:'';
      position:absolute;
      right:-40px;
      top:-80px;
      width:230px;
      height:230px;
      border-radius:50%;
      background:rgba(255,255,255,.13);
    }

    .profile-hero>span{
      width:82px;
      height:82px;
      border-radius:50%;
      border:2px solid rgba(255,255,255,.6);
      display:grid;
      place-items:center;
      font-size:28px;
      color:#fff;
      font-weight:900;
    }

    .profile-hero h2{
      font-size:30px;
      margin:0 0 6px;
      color:#061832;
    }

    .profile-hero p,
    .profile-hero small{
      color:#16334d;
    }

    .profile-grid{
      display:grid;
      grid-template-columns:minmax(0,1fr)430px;
      gap:22px;
    }

    .info-card,
    .edit-card,
    .activity{
      padding:24px;
      box-shadow:none;
      margin-bottom:20px;
    }

    .card-title{
      display:flex;
      justify-content:space-between;
      gap:12px;
      align-items:start;
    }

    .card-title p{
      color:var(--muted);
      margin:.25rem 0 0;
    }

    .compact{
      min-height:36px;
      padding:0 12px;
    }

    .info-line{
      display:grid;
      grid-template-columns:46px 170px 1fr;
      gap:12px;
      align-items:center;
      border-top:1px solid var(--line);
      padding:16px 0;
    }

    .info-line .material-icons{
      width:42px;
      height:42px;
      border-radius:12px;
      background:#d6fff7;
      color:var(--primary-dark);
      display:grid;
      place-items:center;
    }

    .info-line small{
      color:var(--muted);
      font-weight:900;
      text-transform:uppercase;
    }

    .fields{
      display:grid;
      grid-template-columns:repeat(2,1fr);
      gap:14px;
      margin-bottom:16px;
    }

    .form-actions{
      display:flex;
      justify-content:flex-end;
      gap:12px;
    }

    .activity p{
      display:grid;
      grid-template-columns:14px 1fr;
      gap:10px;
      border-top:1px solid var(--line);
      padding:14px 0;
      margin:0;
    }

    .activity small{
      grid-column:2;
      color:var(--muted);
    }

    .empty-state{
      display:block!important;
      color:var(--muted);
    }

    .toast{
      position:fixed;
      right:24px;
      bottom:24px;
    }

    @media(max-width:1050px){
      .profile-grid{grid-template-columns:1fr}
    }

    @media(max-width:650px){
      .page-head,
      .actions,
      .profile-hero{flex-direction:column}

      .fields,
      .info-line{grid-template-columns:1fr}

      .form-actions{flex-direction:column}
    }
  `]
})
export class ProfilePageComponent {
  store = inject(SafeHomeStore);
  private translate = inject(TranslateService);

  editing = false;
  draft: SafeUserEntity = { ...this.store.user() };
  message = '';

  toggleEdit(): void {
    this.editing = !this.editing;
    this.draft = { ...this.store.user() };
  }

  saveProfile(): void {
    this.store.updateUser({ ...this.draft });
    this.editing = false;
    this.showMessage('MESSAGES.SAVED');
  }

  currentLang(): 'en' | 'es' {
    return (this.translate.currentLang || this.translate.defaultLang || 'en') as 'en' | 'es';
  }

  activityTitle(item: AccountActivityEntity): string {
    const lang = this.currentLang();

    const map: Record<string, { en: string; es: string }> = {
      'Profile updated': {
        en: 'Profile updated',
        es: 'Perfil actualizado'
      },
      'Settings updated': {
        en: 'Settings updated',
        es: 'Configuración actualizada'
      },
      'Settings created': {
        en: 'Settings saved',
        es: 'Configuración guardada'
      },
      'Support message sent': {
        en: 'Support message sent',
        es: 'Mensaje de soporte enviado'
      },
      'Alerts updated': {
        en: 'Alerts updated',
        es: 'Alertas actualizadas'
      },
      'Alert attended': {
        en: 'Alert attended',
        es: 'Alerta atendida'
      },
      'Event deleted': {
        en: 'Event deleted',
        es: 'Evento eliminado'
      },
      'Event resolved': {
        en: 'Event resolved',
        es: 'Evento resuelto'
      },
      'Event reactivated': {
        en: 'Event reactivated',
        es: 'Evento reactivado'
      },
      'Device added': {
        en: 'Device added',
        es: 'Dispositivo agregado'
      },
      'Device updated': {
        en: 'Device updated',
        es: 'Dispositivo actualizado'
      },
      'Device deleted': {
        en: 'Device deleted',
        es: 'Dispositivo eliminado'
      },
      'Default configuration restored': {
        en: 'Default configuration restored',
        es: 'Configuración predeterminada restaurada'
      }
    };

    return map[item.title]?.[lang] ?? item.title;
  }

  activityDescription(item: AccountActivityEntity): string {
    const lang = this.currentLang();

    const map: Record<string, { en: string; es: string }> = {
      'Personal information was saved': {
        en: 'Personal information was saved',
        es: 'La información personal fue guardada'
      },
      'Personal information was saved locally': {
        en: 'Personal information was saved locally',
        es: 'La información personal fue guardada localmente'
      },
      'Preferences were saved': {
        en: 'Preferences were saved',
        es: 'Las preferencias fueron guardadas'
      },
      'Preferences were saved locally': {
        en: 'Preferences were saved locally',
        es: 'Las preferencias fueron guardadas localmente'
      },
      'All active alerts were marked as attended': {
        en: 'All active alerts were marked as attended',
        es: 'Todas las alertas activas fueron marcadas como atendidas'
      },
      'There were no active alerts to update': {
        en: 'There were no active alerts to update',
        es: 'No había alertas activas para actualizar'
      },
      'A security alert was marked as attended': {
        en: 'A security alert was marked as attended',
        es: 'Una alerta de seguridad fue marcada como atendida'
      },
      'An event was removed from the history': {
        en: 'An event was removed from the history',
        es: 'Un evento fue eliminado del historial'
      },
      'A security event was resolved': {
        en: 'A security event was resolved',
        es: 'Un evento de seguridad fue resuelto'
      },
      'An event was restored as active': {
        en: 'An event was restored as active',
        es: 'Un evento fue restaurado como activo'
      },
      'A device was removed from the panel': {
        en: 'A device was removed from the panel',
        es: 'Un dispositivo fue eliminado del panel'
      },
      'Settings returned to standard values': {
        en: 'Settings returned to standard values',
        es: 'La configuración volvió a sus valores estándar'
      }
    };

    return map[item.description]?.[lang] ?? item.description;
  }

  activityTime(time: string): string {
    if (time !== 'Now') return time;
    return this.currentLang() === 'es' ? 'Ahora' : 'Now';
  }

  showMessage(key: string): void {
    this.message = this.translate.instant(key);
    setTimeout(() => this.message = '', 2200);
  }
}