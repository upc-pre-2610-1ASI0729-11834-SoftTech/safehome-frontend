import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SafeHomeStore } from './shared/application/safehome.store';

/**
 * @summary Root component. Initialises i18n with English as default.
 * Language priority: user's stored preference → settings language → 'en'.
 * @author SofTech
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet />'
})
export class AppComponent {
  private translate = inject(TranslateService);
  private store     = inject(SafeHomeStore);

  constructor() {
    this.translate.addLangs(['en', 'es']);
    this.translate.setDefaultLang('en');
    this.translate.setFallbackLang('en');

    // Priority: explicitly stored preference → settings value → always fall back to 'en'
    const stored   = localStorage.getItem('safehome-language');
    const fromSettings = this.store.settings().language;
    const lang     = (stored || fromSettings || 'en') as string;
    const allowed  = ['en', 'es'];
    const resolved = allowed.includes(lang) ? lang : 'en';

    this.translate.use(resolved);
    document.documentElement.lang = resolved;
    document.body.classList.toggle('dark-mode', this.store.settings().darkMode);
  }
}
