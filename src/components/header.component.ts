import { Component, signal, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SettingsComponent } from './settings.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, SettingsComponent],
  template: `
    <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between shadow-sm z-50 relative">
      <div class="flex items-center gap-2 sm:gap-3">
        <a routerLink="/" class="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity">
          <div class="bg-indigo-600 text-white p-1.5 sm:p-2 rounded-lg shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 sm:w-6 sm:h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <div>
            <h1 class="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">LaTeX to SVG</h1>
          </div>
        </a>
      </div>

      <!-- Desktop Navigation -->
      <div class="hidden md:flex items-center gap-4">
        <nav class="flex items-center gap-4">
          <a routerLink="/help" routerLinkActive="text-indigo-600 dark:text-indigo-400 font-semibold" class="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium">
            Help
          </a>
          <a routerLink="/changelog" routerLinkActive="text-indigo-600 dark:text-indigo-400 font-semibold" class="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium">
            Changelog
          </a>
        </nav>

        <button
          type="button"
          (click)="openSettings($event)"
          class="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Open settings"
          title="Settings"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        <!-- Easter egg: version lore tooltip -->
        <div class="relative" (click)="toggleLore($event)">
          <span class="px-3 py-1 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded-full text-xs font-semibold border border-green-200 dark:border-green-800 cursor-pointer select-none">
            v2.2
          </span>
          @if (tooltipVisible()) {
            <div class="absolute top-full right-0 mt-2 w-64 bg-gray-900 text-white text-xs rounded-xl px-3 py-2.5 shadow-xl z-[9999] pointer-events-none">
              <div class="absolute bottom-full right-4 w-0 h-0 border-l-[5px] border-r-[5px] border-b-[5px] border-l-transparent border-r-transparent border-b-gray-900"></div>
              <div class="font-semibold text-green-400 mb-0.5">{{ currentLore().version }}</div>
              <div class="text-gray-300 italic leading-relaxed">{{ currentLore().lore }}</div>
            </div>
          }
        </div>
      </div>

      <!-- Mobile Menu Button -->
      <div class="md:hidden flex items-center gap-3">
        <button
          type="button"
          (click)="openSettings($event)"
          class="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Open settings"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        <div class="relative" (click)="toggleLore($event)">
          <span class="px-2 py-1 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded-full text-xs font-semibold border border-green-200 dark:border-green-800 cursor-pointer select-none">
            v2.2
          </span>
          @if (tooltipVisible()) {
            <div class="absolute top-full right-0 mt-2 w-56 bg-gray-900 text-white text-xs rounded-xl px-3 py-2.5 shadow-xl z-[9999] pointer-events-none">
              <div class="absolute bottom-full right-3 w-0 h-0 border-l-[5px] border-r-[5px] border-b-[5px] border-l-transparent border-r-transparent border-b-gray-900"></div>
              <div class="font-semibold text-green-400 mb-0.5">{{ currentLore().version }}</div>
              <div class="text-gray-300 italic leading-relaxed">{{ currentLore().lore }}</div>
            </div>
          }
        </div>
        <button
          (click)="mobileMenuOpen.set(!mobileMenuOpen())"
          class="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          @if (mobileMenuOpen()) {
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          } @else {
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          }
        </button>
      </div>

      <!-- Mobile Menu -->
      @if (mobileMenuOpen()) {
        <div class="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-lg md:hidden z-20">
          <nav class="flex flex-col py-2">
            <a
              routerLink="/help"
              routerLinkActive="bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 font-semibold"
              (click)="mobileMenuOpen.set(false)"
              class="px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors font-medium border-b border-gray-100 dark:border-gray-700">
              Help
            </a>
            <a
              routerLink="/changelog"
              routerLinkActive="bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 font-semibold"
              (click)="mobileMenuOpen.set(false)"
              class="px-4 py-3 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors font-medium">
              Changelog
            </a>
          </nav>
        </div>
      }
    </header>

    @if (settingsOpen()) {
      <app-settings (close)="settingsOpen.set(false)"></app-settings>
    }
  `
})
export class HeaderComponent {
  mobileMenuOpen = signal(false);
  settingsOpen = signal(false);

  tooltipVisible = signal(false);
  currentLore = signal({ version: '', lore: '' });

  private readonly versionLore = [
    { version: 'v2.2.0', lore: "Inkscape finally pastes equations at the right size. It only took scaling the viewBox, the matrix, and our patience." },
    { version: 'v2.2.0', lore: "The font size slider is back. It went to therapy and now actually controls font size." },
    { version: 'v2.2.0', lore: "12pt is the new default. Because 10pt was giving everyone squinting injuries." },
    { version: 'v2.2.0', lore: "Fractions are now taller than body text. Just like in real LaTeX. Just like in real life." },
    { version: 'v2.2.0', lore: "We scale the viewBox, the matrix, the width, the height. We scale everything. We are the scalers." },
    { version: 'v2.2.0', lore: "CodeCogs renders at 10pt. We asked nicely and it agreed to let us multiply by 1.2." },
    { version: 'v2.2.0', lore: "Dual MIME clipboard: image/svg+xml for the cultured, text/plain for the pragmatic." },
    { version: 'v2.2.0', lore: "PNG DPI selector added. Choose your resolution like you choose your battles." },
  ];

  openSettings(event: Event): void {
    event.stopPropagation();
    this.settingsOpen.set(true);
    this.mobileMenuOpen.set(false);
  }

  toggleLore(event?: Event): void {
    event?.stopPropagation();
    if (this.tooltipVisible()) {
      this.tooltipVisible.set(false);
    } else {
      const pick = this.versionLore[Math.floor(Math.random() * this.versionLore.length)];
      this.currentLore.set(pick);
      this.tooltipVisible.set(true);
    }
  }

  hideLore(): void {
    this.tooltipVisible.set(false);
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.hideLore();
  }
}
