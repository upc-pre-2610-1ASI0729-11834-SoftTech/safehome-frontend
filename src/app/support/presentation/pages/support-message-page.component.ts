import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SafeHomeStore } from '../../../shared/application/safehome.store';

/**
 * @summary Saves a support message.
 * @author SofTech
 */
@Component({
  selector: 'app-support-message-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  template: `
    <section aria-label="Support message page">
      <a class="safe-button-ghost" routerLink="/support"><span class="material-icons">arrow_back</span>{{ 'COMMON.BACK' | translate }}</a><h1 class="page-title">{{ 'SUPPORT.MESSAGE_TITLE' | translate }}</h1><p class="page-subtitle">{{ 'SUPPORT.MESSAGE_SUBTITLE' | translate }}</p>
      <section class="message-layout"><form class="safe-card form-card" (ngSubmit)="send()" aria-label="Support message form"><div class="fields"><label><span class="field-label">{{ 'SUPPORT.NAME' | translate }}</span><input class="safe-input" name="ticketName" [(ngModel)]="ticket.name" placeholder="Example: Ana Torres"></label><label><span class="field-label">{{ 'SUPPORT.EMAIL' | translate }}</span><input class="safe-input" name="ticketEmail" [(ngModel)]="ticket.email" placeholder="example@email.com"></label></div><label><span class="field-label">{{ 'SUPPORT.CATEGORY' | translate }}</span><select class="safe-select" name="ticketCategory" [(ngModel)]="ticket.category"><option>{{ 'SUPPORT.CAT_DEVICES' | translate }}</option><option>{{ 'SUPPORT.CAT_ALERTS' | translate }}</option><option>{{ 'SUPPORT.CAT_ACCOUNT' | translate }}</option></select></label><label><span class="field-label">{{ 'SUPPORT.SUBJECT' | translate }}</span><input class="safe-input" name="ticketSubject" [(ngModel)]="ticket.subject" placeholder="Example: Sensor connection issue"></label><label><span class="field-label">{{ 'SUPPORT.MESSAGE' | translate }}</span><textarea class="safe-textarea" name="ticketMessage" [(ngModel)]="ticket.message" placeholder="Describe the problem clearly."></textarea></label><label class="upload"><span class="material-icons">upload</span>{{ evidenceName || ('SUPPORT.UPLOAD' | translate) }}<input type="file" aria-label="Upload optional evidence" (change)="selectEvidence($event)"></label><div class="form-actions"><a class="safe-button-outline" routerLink="/support">{{ 'COMMON.CANCEL' | translate }}</a><button class="safe-button" type="submit">{{ 'SUPPORT.SEND' | translate }} <span class="material-icons">send</span></button></div></form><aside><article class="safe-card side"><h3>{{ 'SUPPORT.LIVE_CHAT' | translate }}</h3><p>{{ 'SUPPORT.LIVE_CHAT_TEXT' | translate }}</p></article><article class="safe-card side"><h3>{{ 'SUPPORT.EMAIL_DIRECT' | translate }}</h3><p>support@safehome.pe</p></article><article class="safe-card emergency"><h3>{{ 'SUPPORT.EMERGENCY' | translate }}</h3><strong>0800-547-911</strong></article></aside></section>
    <p *ngIf="message" class="toast">{{ message }}</p>
    </section>
  `,
  styles: [`
    .message-layout{display:grid;grid-template-columns:minmax(0,1fr)330px;gap:24px}.form-card,.side,.emergency{padding:24px;box-shadow:none;margin-bottom:18px}.form-card{display:grid;gap:16px}.fields{display:grid;grid-template-columns:1fr 1fr;gap:14px}.upload{min-height:180px;border:2px dashed var(--line);border-radius:18px;display:grid;place-items:center;text-align:center;color:var(--muted);font-weight:900}.upload input{display:none}.upload .material-icons{font-size:66px;color:#111}.form-actions{display:flex;justify-content:flex-end;gap:12px}.toast{position:fixed;right:24px;bottom:24px;background:#07111f;color:#fff;padding:12px 14px;border-radius:14px;font-weight:800;z-index:30}.side p{color:var(--muted)}.emergency{background:#a7f3e4}@media(max-width:900px){.message-layout{grid-template-columns:1fr}.fields{grid-template-columns:1fr}}@media(max-width:600px){.form-actions{flex-direction:column}}
  `]
})
export class SupportMessagePageComponent {
  private store = inject(SafeHomeStore);
  private router = inject(Router);
  private translate = inject(TranslateService);
  ticket = { name: '', email: '', category: 'Devices', subject: '', message: '' };
  evidenceName = '';
  message = '';

  /**
   * @summary Stores the selected evidence file name.
   */
  selectEvidence(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.evidenceName = input.files?.[0]?.name || '';
  }

  /**
   * @summary Saves the support request locally.
   */
  send(): void {
    if (!this.ticket.name.trim() || !this.ticket.email.trim() || !this.ticket.subject.trim() || !this.ticket.message.trim()) {
      this.message = this.translate.instant('MESSAGES.REQUIRED_FIELDS');
      setTimeout(() => this.message = '', 2200);
      return;
    }

    this.store.addTicket({ ...this.ticket, subject: this.evidenceName ? `${this.ticket.subject} (${this.evidenceName})` : this.ticket.subject });
    this.message = this.translate.instant('MESSAGES.SUPPORT_SENT');
    setTimeout(() => this.router.navigateByUrl('/support'), 1000);
  }
}
