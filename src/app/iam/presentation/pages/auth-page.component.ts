import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../infrastructure/services/auth.service';
import { LanguageSwitcherComponent } from '../../../shared/presentation/components/language-switcher.component';

/**
 * @summary Shows the sign in, register, recovery and success screens.
 * Connects login and register to /api/v1/auth/* backend endpoints.
 * @author SofTech
 */
@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule, LanguageSwitcherComponent],
  template: `
    <main class="auth-page" aria-label="Authentication page">
      <section class="auth-layout">
        <article class="auth-panel">
          <a class="auth-brand" routerLink="/login" aria-label="SafeHome authentication">
            <span class="material-icons">home</span><strong>SafeHome</strong>
          </a>

          <form *ngIf="mode() === 'login'" class="auth-card" (ngSubmit)="login()" aria-label="Sign in form">
            <h1>{{ 'AUTH.SIGN_IN' | translate }}</h1>
            <p>{{ 'AUTH.SIGN_IN_SUBTITLE' | translate }}</p>
            <label><span class="field-label">{{ 'AUTH.EMAIL' | translate }}</span><input class="safe-input" name="loginEmail" type="email" [(ngModel)]="email" placeholder="name@email.com" aria-label="Email address"></label>
            <label><span class="field-label">{{ 'AUTH.PASSWORD' | translate }}</span><input class="safe-input" name="loginPassword" type="password" [(ngModel)]="password" placeholder="••••••" aria-label="Password"></label>
            <div class="form-row"><label class="check"><input type="checkbox" name="remember" [(ngModel)]="remember">{{ 'AUTH.REMEMBER' | translate }}</label><a routerLink="/forgot-password">{{ 'AUTH.FORGOT' | translate }}</a></div>
            <button class="safe-button wide" type="submit" [disabled]="loading()">
              <span *ngIf="!loading()">{{ 'AUTH.SIGN_IN' | translate }} <span class="material-icons">arrow_forward</span></span>
              <span *ngIf="loading()">{{ 'AUTH.LOADING' | translate }}</span>
            </button>
            <div class="switch-row"><span>{{ 'AUTH.NO_ACCOUNT' | translate }}</span><a class="safe-button-outline" routerLink="/register">{{ 'AUTH.CREATE_ACCOUNT' | translate }}</a></div>
            <app-language-switcher />
          </form>

          <form *ngIf="mode() === 'register'" class="auth-card" (ngSubmit)="register()" aria-label="Register form">
            <h1>{{ 'AUTH.CREATE_ACCOUNT' | translate }}</h1>
            <p>{{ 'AUTH.CREATE_SUBTITLE' | translate }}</p>
            <label><span class="field-label">{{ 'AUTH.FULL_NAME' | translate }}</span><input class="safe-input" name="name" [(ngModel)]="registerName" placeholder="Example: Ana Torres" aria-label="Full name"></label>
            <label><span class="field-label">{{ 'AUTH.EMAIL' | translate }}</span><input class="safe-input" name="registerEmail" type="email" [(ngModel)]="email" placeholder="example@email.com" aria-label="Email address"></label>
            <label><span class="field-label">{{ 'AUTH.PASSWORD' | translate }}</span><input class="safe-input" name="registerPassword" type="password" [(ngModel)]="password" placeholder="Example: ••••••" aria-label="Password"></label>
            <label><span class="field-label">{{ 'AUTH.CONFIRM_PASSWORD' | translate }}</span><input class="safe-input" name="confirmPassword" type="password" [(ngModel)]="confirmPassword" placeholder="Repeat your password" aria-label="Confirm password"></label>
            <label class="check"><input type="checkbox" name="terms" [(ngModel)]="acceptedTerms">{{ 'AUTH.ACCEPT_TERMS' | translate }}</label>
            <button class="safe-button wide" type="submit" [disabled]="loading()">
              <span *ngIf="!loading()">{{ 'AUTH.CREATE_ACCOUNT' | translate }} <span class="material-icons">arrow_forward</span></span>
              <span *ngIf="loading()">{{ 'AUTH.LOADING' | translate }}</span>
            </button>
            <div class="switch-row"><span>{{ 'AUTH.HAS_ACCOUNT' | translate }}</span><a class="safe-button-outline" routerLink="/login">{{ 'AUTH.SIGN_IN' | translate }}</a></div>
            <app-language-switcher />
          </form>

          <form *ngIf="mode() === 'forgot'" class="auth-card" (ngSubmit)="recover()" aria-label="Recovery form">
            <div class="round-icon"><span class="material-icons">lock_reset</span></div>
            <h1>{{ 'AUTH.FORGOT_TITLE' | translate }}</h1>
            <p>{{ 'AUTH.FORGOT_SUBTITLE' | translate }}</p>
            <label><span class="field-label">{{ 'AUTH.EMAIL' | translate }}</span><input class="safe-input" name="recoverEmail" type="email" [(ngModel)]="email" placeholder="example@email.com" aria-label="Email address"></label>
            <button class="safe-button wide" type="submit">{{ 'AUTH.SEND_RECOVERY' | translate }}</button>
            <p *ngIf="notice()" class="notice">{{ 'AUTH.RECOVERY_SENT' | translate }}</p>
            <a class="safe-button-outline wide" routerLink="/login">{{ 'AUTH.BACK_LOGIN' | translate }}</a>
            <app-language-switcher />
          </form>

          <p *ngIf="message()" class="toast">{{ message() }}</p>

          <article *ngIf="mode() === 'success'" class="auth-card success-card" aria-label="Created account message">
            <div class="round-icon ok"><span class="material-icons">check</span></div>
            <h1>{{ 'AUTH.SUCCESS_TITLE' | translate }}</h1>
            <p>{{ 'AUTH.SUCCESS_SUBTITLE' | translate }}</p>
            <div class="success-list">
              <span><i></i>{{ 'AUTH.SUCCESS_1' | translate }}</span>
              <span><i></i>{{ 'AUTH.SUCCESS_2' | translate }}</span>
              <span><i></i>{{ 'AUTH.SUCCESS_3' | translate }}</span>
            </div>
            <button class="safe-button wide" type="button" (click)="openDashboard()">{{ 'AUTH.GO_DASHBOARD' | translate }}</button>
            <button class="link-button" type="button" (click)="goToAddDevice()">{{ 'DEVICES.ADD' | translate }}</button>
          </article>
        </article>

        <article class="hero-card" aria-label="SafeHome value message">
          <div class="hero-content">
            <h2>{{ heroTitle() | translate }}</h2>
            <p>{{ heroText() | translate }}</p>
            <div class="hero-points">
              <span><i class="material-icons">shield</i>{{ 'AUTH.HERO_1' | translate }}</span>
              <span><i class="material-icons">notifications_active</i>{{ 'AUTH.HERO_2' | translate }}</span>
              <span><i class="material-icons">lock</i>{{ 'AUTH.HERO_3' | translate }}</span>
            </div>
          </div>
        </article>
      </section>
    </main>
  `,
  styles: [`
    .auth-page { min-height: 100vh; display: grid; place-items: center; padding: 32px; background: #fff; }
    .auth-layout { width: min(1260px, 100%); min-height: 760px; display: grid; grid-template-columns: 520px 1fr; gap: 62px; align-items: center; }
    .auth-panel { display: grid; gap: 14px; justify-items: stretch; }
    .auth-brand { display: inline-flex; align-items: center; gap: 14px; font-size: 24px; font-weight: 900; margin-left: 8px; }
    .auth-brand span, .round-icon { width: 52px; height: 52px; border-radius: 15px; background: var(--primary); color: #fff; display: grid; place-items: center; }
    .auth-card { width: 100%; max-width: 470px; justify-self: center; background: #fff; border: 1px solid var(--line); border-radius: 22px; box-shadow: 0 18px 45px rgba(15, 35, 70, .10); padding: 40px; display: grid; gap: 16px; }
    h1 { margin: 0; font-size: 38px; letter-spacing: -0.04em; color: var(--ink); }
    p { margin: 0; color: #647391; font-size: 18px; }
    .form-row, .switch-row { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
    .check { display: inline-flex; align-items: center; gap: 8px; color: var(--primary-dark); }
    a { color: var(--primary-dark); font-weight: 800; }
    .wide { width: 100%; }
    .notice { background: #e7fff8; color: var(--success); padding: 12px 14px; border-radius: 12px; font-size: 14px; font-weight: 800; }
    .toast { position: fixed; right: 24px; bottom: 24px; background: #07111f; color: #fff; padding: 12px 14px; border-radius: 14px; font-weight: 800; z-index: 30; }
    .success-card { text-align: center; justify-items: center; max-width: 460px; margin: auto; }
    .ok { background: var(--primary); }
    .success-list { width: 100%; display: grid; gap: 10px; }
    .success-list span { display: flex; align-items: center; gap: 10px; background: #f6f9fc; border-radius: 12px; padding: 14px; font-weight: 800; color: var(--text); }
    .success-list i { width: 10px; height: 10px; border-radius: 50%; background: var(--success); }
    .link-button { border: 0; background: transparent; color: var(--primary-dark); font-weight: 900; }
    .hero-card { min-height: 760px; border-radius: 28px; overflow: hidden; background: #28d2bf; position: relative; display: grid; place-items: center; }
    .hero-card::before, .hero-card::after { content: ''; position: absolute; border-radius: 50%; background: rgba(255,255,255,.12); }
    .hero-card::before { width: 330px; height: 330px; right: -70px; top: -60px; }
    .hero-card::after { width: 260px; height: 260px; right: 140px; top: 70px; }
    .hero-content { width: min(540px, 86%); position: relative; z-index: 1; }
    .hero-content h2 { font-size: 44px; line-height: 1.1; letter-spacing: -0.05em; margin: 0 0 42px; }
    .hero-content p { color: #061832; max-width: 520px; margin-bottom: 46px; }
    .hero-points { display: grid; gap: 16px; }
    .hero-points span { display: flex; align-items: center; gap: 16px; background: rgba(255,255,255,.45); border-radius: 16px; padding: 18px 24px; font-size: 19px; font-weight: 900; }
    @media (max-width: 1050px) { .auth-layout { grid-template-columns: 1fr; gap: 26px; } .hero-card { min-height: 460px; } }
    @media (max-width: 620px) { .auth-page { padding: 18px; } .auth-card { padding: 26px; } h1 { font-size: 30px; } .hero-content h2 { font-size: 32px; } }
  `]
})
export class AuthPageComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private translate = inject(TranslateService);

  mode = signal<'login' | 'register' | 'forgot' | 'success'>('login');
  notice = signal(false);
  message = signal('');
  loading = signal(false);
  email = '';
  password = '';
  confirmPassword = '';
  registerName = '';
  remember = false;
  acceptedTerms = false;

  constructor() {
    this.route.data.subscribe((data) => this.mode.set((data['mode'] || 'login') as 'login' | 'register' | 'forgot' | 'success'));
  }

  /**
   * @summary Authenticates user via /api/v1/auth/login.
   */
  login(): void {
    const email = this.email.trim().toLowerCase();
    if (!email || !this.password) {
      this.showMessage('AUTH.INVALID_CREDENTIALS');
      return;
    }

    this.loading.set(true);
    this.authService.login({ email, password: this.password }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigateByUrl('/dashboard');
      },
      error: () => {
        this.loading.set(false);
        this.showMessage('AUTH.INVALID_CREDENTIALS');
      }
    });
  }

  /**
   * @summary Registers user via /api/v1/auth/register and redirects to success.
   */
  register(): void {
    if (!this.registerName.trim() || !this.email.trim() || !this.password || this.password !== this.confirmPassword || !this.acceptedTerms) {
      this.showMessage('AUTH.REGISTER_ERROR');
      return;
    }

    this.loading.set(true);
    this.authService.register({
      fullName: this.registerName.trim(),
      email: this.email.trim(),
      password: this.password
    }).subscribe({
      next: () => {
        this.loading.set(false);
        // Auto-login after registration
        this.authService.login({ email: this.email.trim(), password: this.password }).subscribe({
          next: () => this.router.navigateByUrl('/account-created'),
          error: () => this.router.navigateByUrl('/account-created')
        });
      },
      error: () => {
        this.loading.set(false);
        this.showMessage('AUTH.REGISTER_ERROR');
      }
    });
  }

  openDashboard(): void {
    this.router.navigateByUrl('/dashboard');
  }

  showMessage(key: string): void {
    this.message.set(this.translate.instant(key));
    setTimeout(() => this.message.set(''), 2400);
  }

  recover(): void {
    this.notice.set(true);
  }

  goToAddDevice(): void {
    this.router.navigateByUrl('/devices/new');
  }

  heroTitle(): string {
    if (this.mode() === 'register') return 'AUTH.CREATE_HERO_TITLE';
    if (this.mode() === 'forgot') return 'AUTH.FORGOT_HERO_TITLE';
    return 'AUTH.LOGIN_HERO_TITLE';
  }

  heroText(): string {
    if (this.mode() === 'register') return 'AUTH.CREATE_HERO_TEXT';
    if (this.mode() === 'forgot') return 'AUTH.FORGOT_HERO_TEXT';
    return 'AUTH.LOGIN_HERO_TEXT';
  }
}
