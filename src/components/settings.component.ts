import { Component, inject, output } from '@angular/core';
import { PreferencesService, SyntaxColors, ThemeMode } from '../services/preferences.service';

interface ColorRow {
  key: keyof SyntaxColors;
  label: string;
  hint: string;
}

interface ThemeModeOption {
  value: ThemeMode;
  label: string;
  icon: 'sun' | 'moon' | 'desktop';
}

const COLOR_ROWS: ColorRow[] = [
  { key: 'command',  label: 'Commands',  hint: '\\frac, \\alpha' },
  { key: 'brace',    label: 'Braces',    hint: '{ }' },
  { key: 'bracket',  label: 'Brackets',  hint: '[ ]' },
  { key: 'operator', label: 'Operators', hint: '+ - = ^ _' },
  { key: 'number',   label: 'Numbers',   hint: '0-9' },
  { key: 'text',     label: 'Plain text',hint: 'Everything else' },
];

@Component({
  selector: 'app-settings',
  standalone: true,
  template: `
    <div
      class="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      (click)="onBackdropClick($event)"
    >
      <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10 w-full max-w-md max-h-[88vh] overflow-y-auto">

        <!-- Header -->
        <div class="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-5 py-4 flex items-center justify-between z-10 rounded-t-2xl">
          <div class="flex items-center gap-2.5">
            <div class="p-1.5 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 class="text-sm font-semibold text-gray-900 dark:text-gray-100 tracking-tight">Settings</h2>
          </div>
          <button
            (click)="close.emit()"
            class="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Close settings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="px-5 py-4 space-y-5">

          <!-- Appearance -->
          <div>
            <p class="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2.5">Appearance</p>
            <div class="flex rounded-xl bg-gray-100 dark:bg-gray-800 p-1">
              @for (mode of themeModes; track mode.value) {
                <button
                  type="button"
                  (click)="setTheme(mode.value)"
                  class="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-medium transition-all duration-150"
                  [class]="prefs.prefs().theme === mode.value
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-black/5 dark:ring-white/10'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'"
                >
                  @switch (mode.icon) {
                    @case ('sun') {
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25M12 18.75V21M4.97 4.97l1.59 1.59M17.44 17.44l1.59 1.59M3 12h2.25M18.75 12H21M4.97 19.03l1.59-1.59M17.44 6.56l1.59-1.59M15.75 12A3.75 3.75 0 118.25 12a3.75 3.75 0 017.5 0z" />
                      </svg>
                    }
                    @case ('moon') {
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M21 12.79A9 9 0 1111.21 3c-.05.32-.08.66-.08 1a8 8 0 008 8c.34 0 .68-.03 1-.08z" />
                      </svg>
                    }
                    @case ('desktop') {
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
                      </svg>
                    }
                  }
                  <span>{{ mode.label }}</span>
                </button>
              }
            </div>
          </div>

          <!-- Editor -->
          <div>
            <p class="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2.5">Editor</p>
            <label class="flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 cursor-pointer group">
              <span>
                <span class="block text-sm font-medium text-gray-800 dark:text-gray-100">Syntax highlighting</span>
                <span class="block text-xs text-gray-400 dark:text-gray-500 mt-0.5">Color-code commands, braces, numbers</span>
              </span>
              <!-- Toggle switch -->
              <div class="relative flex-shrink-0">
                <input
                  type="checkbox"
                  [checked]="prefs.prefs().syntaxHighlightingEnabled"
                  (change)="toggleHighlighting($event)"
                  class="sr-only peer"
                />
                <div class="w-9 h-5 bg-gray-200 dark:bg-gray-700 peer-checked:bg-indigo-500 rounded-full transition-colors duration-200 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform after:duration-200 peer-checked:after:translate-x-4 after:shadow-sm"></div>
              </div>
            </label>
          </div>

          <!-- Syntax Colors -->
          <div>
            <p class="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2.5">Syntax Colors</p>

            <!-- Light palette -->
            <div class="rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 overflow-hidden mb-2">
              <div class="flex items-center justify-between px-3.5 py-2.5 border-b border-gray-100 dark:border-gray-700/60">
                <div class="flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25M12 18.75V21M4.97 4.97l1.59 1.59M17.44 17.44l1.59 1.59M3 12h2.25M18.75 12H21M4.97 19.03l1.59-1.59M17.44 6.56l1.59-1.59M15.75 12A3.75 3.75 0 118.25 12a3.75 3.75 0 017.5 0z" />
                  </svg>
                  <span class="text-xs font-medium text-gray-600 dark:text-gray-300">Light mode</span>
                </div>
                <button type="button" (click)="resetLight()" class="text-[11px] text-indigo-500 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors">Reset</button>
              </div>
              <div class="px-3.5 py-2.5 grid grid-cols-2 gap-x-3 gap-y-1.5">
                @for (row of colorRows; track row.key) {
                  <div class="flex items-center gap-2">
                    <input
                      type="color"
                      [value]="prefs.prefs().syntaxColors[row.key]"
                      (input)="updateLight(row.key, $event)"
                      class="h-6 w-6 flex-shrink-0 rounded-md cursor-pointer border-0 bg-transparent p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-0"
                    />
                    <span class="text-xs text-gray-500 dark:text-gray-400 w-14 flex-shrink-0">{{ row.label }}</span>
                    <input
                      type="text"
                      [value]="prefs.prefs().syntaxColors[row.key]"
                      (change)="updateLightHex(row.key, $event)"
                      maxlength="7"
                      spellcheck="false"
                      class="w-full min-w-0 text-[11px] font-mono text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                }
              </div>
            </div>

            <!-- Dark palette -->
            <div class="rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 overflow-hidden">
              <div class="flex items-center justify-between px-3.5 py-2.5 border-b border-gray-100 dark:border-gray-700/60">
                <div class="flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 12.79A9 9 0 1111.21 3c-.05.32-.08.66-.08 1a8 8 0 008 8c.34 0 .68-.03 1-.08z" />
                  </svg>
                  <span class="text-xs font-medium text-gray-600 dark:text-gray-300">Dark mode</span>
                </div>
                <button type="button" (click)="resetDark()" class="text-[11px] text-indigo-500 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors">Reset</button>
              </div>
              <div class="px-3.5 py-2.5 grid grid-cols-2 gap-x-3 gap-y-1.5">
                @for (row of colorRows; track row.key) {
                  <div class="flex items-center gap-2">
                    <input
                      type="color"
                      [value]="prefs.prefs().syntaxColorsDark[row.key]"
                      (input)="updateDark(row.key, $event)"
                      class="h-6 w-6 flex-shrink-0 rounded-md cursor-pointer border-0 bg-transparent p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-0"
                    />
                    <span class="text-xs text-gray-500 dark:text-gray-400 w-14 flex-shrink-0">{{ row.label }}</span>
                    <input
                      type="text"
                      [value]="prefs.prefs().syntaxColorsDark[row.key]"
                      (change)="updateDarkHex(row.key, $event)"
                      maxlength="7"
                      spellcheck="false"
                      class="w-full min-w-0 text-[11px] font-mono text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="pt-1 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <button
              type="button"
              (click)="resetAll()"
              class="flex items-center gap-1.5 text-xs text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset all to defaults
            </button>
            <button
              type="button"
              (click)="close.emit()"
              class="text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              Done
            </button>
          </div>

        </div>
      </div>
    </div>
  `
})
export class SettingsComponent {
  prefs = inject(PreferencesService);
  close = output<void>();

  readonly colorRows = COLOR_ROWS;
  readonly themeModes: ThemeModeOption[] = [
    { value: 'light',  label: 'Light',  icon: 'sun' },
    { value: 'dark',   label: 'Dark',   icon: 'moon' },
    { value: 'system', label: 'System', icon: 'desktop' },
  ];

  setTheme(mode: ThemeMode): void {
    this.prefs.updatePrefs({ theme: mode });
  }

  toggleHighlighting(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.prefs.updatePrefs({ syntaxHighlightingEnabled: checked });
  }

  updateLight(key: keyof SyntaxColors, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.prefs.updateLightColor(key, value);
  }

  updateDark(key: keyof SyntaxColors, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.prefs.updateDarkColor(key, value);
  }

  updateLightHex(key: keyof SyntaxColors, event: Event): void {
    const input = event.target as HTMLInputElement;
    const val = input.value.trim();
    const hex = val.startsWith('#') ? val : '#' + val;
    if (/^#[0-9a-fA-F]{6}$/.test(hex)) {
      this.prefs.updateLightColor(key, hex);
      input.value = hex;
    } else {
      input.value = this.prefs.prefs().syntaxColors[key];
    }
  }

  updateDarkHex(key: keyof SyntaxColors, event: Event): void {
    const input = event.target as HTMLInputElement;
    const val = input.value.trim();
    const hex = val.startsWith('#') ? val : '#' + val;
    if (/^#[0-9a-fA-F]{6}$/.test(hex)) {
      this.prefs.updateDarkColor(key, hex);
      input.value = hex;
    } else {
      input.value = this.prefs.prefs().syntaxColorsDark[key];
    }
  }

  resetLight(): void {
    Object.entries(this.prefs.defaultLightColors).forEach(([k, v]) => {
      this.prefs.updateLightColor(k as keyof SyntaxColors, v as string);
    });
  }

  resetDark(): void {
    Object.entries(this.prefs.defaultDarkColors).forEach(([k, v]) => {
      this.prefs.updateDarkColor(k as keyof SyntaxColors, v as string);
    });
  }

  resetAll(): void {
    this.prefs.resetAll();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }
}
