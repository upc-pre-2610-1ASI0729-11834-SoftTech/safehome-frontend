import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

interface SupportCategory {
  titleKey: string;
  icon: string;
  textKey: string;
  articleKeys: string[];
}

/**
 * @summary Shows support categories, search and help articles.
 * @author SofTech
 */
@Component({
  selector: 'app-support-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  template: `
    <section aria-label="Support page">
      <article class="support-hero">
        <h1>{{ 'SUPPORT.HERO' | translate }}</h1>
        <p>{{ 'SUPPORT.HERO_TEXT' | translate }}</p>
        <label aria-label="Search support categories">
          <span class="material-icons">search</span>
          <input type="search" [(ngModel)]="query" [placeholder]="'SUPPORT.SEARCH' | translate">
        </label>
      </article>

      <section class="category-grid" aria-label="Support categories">
        <article *ngFor="let category of filteredCategories()" class="safe-card category" [class.selected]="selected()?.titleKey === category.titleKey">
          <span class="material-icons">{{ category.icon }}</span>
          <h3>{{ category.titleKey | translate }}</h3>
          <p>{{ category.textKey | translate }}</p>
          <button type="button" (click)="openArticles(category)">{{ 'SUPPORT.SEE_ARTICLES' | translate }}</button>
        </article>
      </section>

      <article class="safe-card empty" *ngIf="filteredCategories().length === 0">
        <span class="material-icons">search_off</span>
        <strong>{{ 'SUPPORT.NO_RESULTS' | translate }}</strong>
        <p>{{ 'SUPPORT.NO_RESULTS_TEXT' | translate }}</p>
      </article>

      <article class="safe-card article-panel" *ngIf="selected() as category" aria-label="Support articles">
        <div class="article-head">
          <div>
            <span class="material-icons">{{ category.icon }}</span>
            <h2>{{ category.titleKey | translate }}</h2>
            <p>{{ category.textKey | translate }}</p>
          </div>
          <button class="safe-button-outline compact" type="button" (click)="closeArticles()">{{ 'COMMON.CANCEL' | translate }}</button>
        </div>
        <div class="mini-articles">
          <button *ngFor="let articleKey of category.articleKeys" type="button" [class.active]="openArticle() === articleKey" (click)="toggleArticle(articleKey)">
            <strong>{{ ('SUPPORT_ARTICLES.' + articleKey + '.TITLE') | translate }}</strong>
            <small>{{ ('SUPPORT_ARTICLES.' + articleKey + '.SUMMARY') | translate }}</small>
            <p *ngIf="openArticle() === articleKey">{{ ('SUPPORT_ARTICLES.' + articleKey + '.BODY') | translate }}</p>
          </button>
        </div>
      </article>

      <article class="safe-card faq">
        <h3>{{ 'SUPPORT.TOP_ARTICLES' | translate }}</h3>
        <button *ngFor="let question of filteredQuestions()" type="button" (click)="openQuestion.set(openQuestion() === question ? '' : question)">
          {{ question | translate }} <span>{{ openQuestion() === question ? '−' : '+' }}</span>
          <p *ngIf="openQuestion() === question">{{ answerForQuestion(question) | translate }}</p>
        </button>
      </article>

      <article class="black-box">
        <div>
          <h3>{{ 'SUPPORT.NOT_FOUND' | translate }}</h3>
          <p>{{ 'SUPPORT.NOT_FOUND_TEXT' | translate }}</p>
        </div>
        <a class="safe-button" routerLink="/support/message">{{ 'SUPPORT.CONTACT' | translate }}</a>
      </article>
    </section>
  `,
  styles: [`
    .support-hero{background:#a7f3e4;border-radius:24px;padding:44px;text-align:center;margin-bottom:26px}.support-hero h1{margin:0 0 8px;font-size:32px}.support-hero p{color:#456271}.support-hero label{width:min(520px,100%);margin:24px auto 0;background:#fff;border-radius:999px;display:flex;align-items:center;gap:10px;padding:0 18px;box-shadow:var(--shadow)}.support-hero input{width:100%;min-height:52px;border:0;outline:0;background:transparent}.category-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.category{padding:24px;box-shadow:none}.category .material-icons{width:46px;height:46px;border-radius:14px;background:#f4f7fb;display:grid;place-items:center}.category h3{margin:18px 0 8px}.category p{color:var(--muted);min-height:54px}.category button{border:0;background:transparent;color:var(--primary-dark);font-weight:900;padding:0}.category.selected{border-color:var(--primary);background:#effffb}.empty{margin-top:16px;padding:26px;text-align:center;box-shadow:none}.empty .material-icons{font-size:42px;color:var(--muted)}.article-panel{padding:24px;margin-top:24px;box-shadow:none;border-color:var(--primary)}.article-head{display:flex;justify-content:space-between;gap:16px}.article-head>div{display:grid;grid-template-columns:48px 1fr;column-gap:14px;align-items:center}.article-head .material-icons{width:48px;height:48px;border-radius:14px;background:#d6fff7;color:var(--primary-dark);display:grid;place-items:center}.article-head h2{margin:0}.article-head p{grid-column:2;margin:4px 0 0;color:var(--muted)}.compact{min-height:36px}.mini-articles{display:grid;gap:12px;margin-top:20px}.mini-articles button{border:1px solid var(--line);background:#fff;border-radius:16px;padding:16px;text-align:left}.mini-articles button.active{border-color:var(--primary);background:#f0fffb}.mini-articles small,.mini-articles p{display:block;color:var(--muted);margin-top:6px}.mini-articles p{line-height:1.6}.faq{padding:24px;margin-top:26px;box-shadow:none}.faq button{width:100%;border:0;background:#fff;border-top:1px solid var(--line);padding:16px 4px;text-align:left;font-weight:800}.faq span{float:right}.faq p{margin:10px 0 0;color:var(--muted);font-weight:500}.black-box{margin-top:24px;border-radius:22px;background:#050505;color:#fff;padding:28px;display:flex;justify-content:space-between;align-items:center;gap:18px}.black-box p{color:#a8b0c4}@media(max-width:900px){.category-grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:620px){.category-grid{grid-template-columns:1fr}.black-box,.article-head{flex-direction:column;align-items:stretch}}
  `]
})
export class SupportPageComponent {
  private translate = inject(TranslateService);
  query = '';
  selected = signal<SupportCategory | null>(null);
  openArticle = signal('');
  openQuestion = signal('');

  categories: SupportCategory[] = [
    { titleKey: 'SUPPORT.CAT_START', icon: 'attach_money', textKey: 'SUPPORT.CAT_START_TEXT', articleKeys: ['START_1', 'START_2', 'START_3'] },
    { titleKey: 'SUPPORT.CAT_DEVICES', icon: 'devices', textKey: 'SUPPORT.CAT_DEVICES_TEXT', articleKeys: ['DEVICES_1', 'DEVICES_2', 'DEVICES_3'] },
    { titleKey: 'SUPPORT.CAT_ALERTS', icon: 'notifications', textKey: 'SUPPORT.CAT_ALERTS_TEXT', articleKeys: ['ALERTS_1', 'ALERTS_2', 'ALERTS_3'] },
    { titleKey: 'SUPPORT.CAT_PRIVACY', icon: 'lock', textKey: 'SUPPORT.CAT_PRIVACY_TEXT', articleKeys: ['PRIVACY_1', 'PRIVACY_2', 'PRIVACY_3'] },
    { titleKey: 'SUPPORT.CAT_ACCOUNT', icon: 'person', textKey: 'SUPPORT.CAT_ACCOUNT_TEXT', articleKeys: ['ACCOUNT_1', 'ACCOUNT_2', 'ACCOUNT_3'] },
    { titleKey: 'SUPPORT.CAT_FAQ', icon: 'help', textKey: 'SUPPORT.CAT_FAQ_TEXT', articleKeys: ['FAQ_1', 'FAQ_2', 'FAQ_3'] }
  ];

  questions = ['SUPPORT.Q1', 'SUPPORT.Q2', 'SUPPORT.Q3'];

  /**
   * @summary Returns support categories that match the search text.
   */
  filteredCategories(): SupportCategory[] {
    const text = this.query.trim().toLowerCase();
    if (!text) return this.categories;
    return this.categories.filter((category) => `${this.translate.instant(category.titleKey)} ${this.translate.instant(category.textKey)}`.toLowerCase().includes(text));
  }

  /**
   * @summary Returns questions that match the search text.
   */
  filteredQuestions(): string[] {
    const text = this.query.trim().toLowerCase();
    if (!text) return this.questions;
    return this.questions.filter((question) => this.translate.instant(question).toLowerCase().includes(text));
  }

  /**
   * @summary Opens a category article panel.
   */
  openArticles(category: SupportCategory): void { this.selected.set(category); this.openArticle.set(category.articleKeys[0]); }

  /**
   * @summary Closes the article panel.
   */
  closeArticles(): void { this.selected.set(null); this.openArticle.set(''); }

  /**
   * @summary Opens or closes one mini article.
   */
  toggleArticle(articleKey: string): void { this.openArticle.set(this.openArticle() === articleKey ? '' : articleKey); }

  /**
   * @summary Returns the answer key for one question.
   */
  answerForQuestion(question: string): string { return question.replace('Q', 'A'); }
}
