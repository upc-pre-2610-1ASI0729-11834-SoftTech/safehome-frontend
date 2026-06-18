import { Component, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SafeHomeStore } from '../../application/safehome.store';

/**
 * @summary Lets the user switch between English and Spanish.
 * @author SofTech
 */
@Component({
  selector: 'app-language-switcher',
  standalone: true,
  template: `
    <div class="lang-switch" aria-label="Language selector">
      <button type="button" [class.active]="language() === 'en'" (click)="changeLanguage('en')" aria-label="Use English">EN</button>
      <button type="button" [class.active]="language() === 'es'" (click)="changeLanguage('es')" aria-label="Usar español">ES</button>
    </div>
  `,
  styles: [`
    .lang-switch { display: inline-flex; border: 1px solid #d9e2ef; border-radius: 12px; overflow: hidden; background: #fff; }
    button { min-width: 46px; min-height: 38px; border: 0; background: transparent; color: #61708d; font-weight: 900; }
    button.active { background: var(--primary); color: #041833; }
  `]
})
export class LanguageSwitcherComponent {
  private translate = inject(TranslateService);
  private store = inject(SafeHomeStore);
  language = signal(localStorage.getItem('safehome-language') || this.store.settings().language || 'en');

  /**
   * @summary Changes and stores the selected language.
   */
  changeLanguage(language: 'en' | 'es'): void {
    this.language.set(language);
    localStorage.setItem('safehome-language', language);
    this.translate.use(language);
    document.documentElement.lang = language;
    this.store.updateSettings({ ...this.store.settings(), language });
  }
}
