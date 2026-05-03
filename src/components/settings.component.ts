import { Component, inject, output } from '@angular/core';
import { PreferencesService, SyntaxColors, ThemeMode } from '../services/preferences.service';

interface ColorRow {
  key: keyof SyntaxColors;
  label: string;
  hint: string;
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
      class="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4"
      (click)="onBackdropClick($event)"
    >
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <!-- Header -->
        <div class="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
          <h2 class="text-lg font-bold text-gray-900 dark:text-gray-100">Settings</h2>
          <button
            (click)="close.emit()"
            class="p-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            aria-label="Close settings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="p-6 space-y-6">
          <!-- Theme -->
          <section>
            <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider mb-3">Theme</h3>
            <div class="grid grid-cols-3 gap-2">
              @for (mode of themeModes; track mode.value) {
                <button
                  type="button"
                  (click)="setTheme(mode.value)"
                  [class.ring-2]="prefs.prefs().theme === mode.value"
                  [class.ring-indigo-500]="prefs.prefs().theme === mode.value"
                  [class.bg-indigo-50]="prefs.prefs().theme === mode.value"
                  class="dark:[&.ring-2]:bg-indigo-900/40 px-3 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex flex-col items-center gap-1"
                >
                  <span class="text-base">{{ mode.icon }}</span>
                  <span>{{ mode.label }}</span>
                </button>
              }
            </div>
          </section>

          <!-- Editor -->
          <section>
            <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider mb-3">Editor</h3>
            <label class="flex items-center justify-between gap-3 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 cursor-pointer">
              <span>
                <span class="block text-sm font-medium text-gray-800 dark:text-gray-100">Syntax highlighting</span>
                <span class="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">Color-code commands, braces, numbers and operators</span>
              </span>
              <input
                type="checkbox"
                [checked]="prefs.prefs().syntaxHighlightingEnabled"
                (change)="toggleHighlighting($event)"
                class="h-5 w-5 accent-indigo-600 cursor-pointer"
              />
            </label>
          </section>

          <!-- Light palette -->
          <section>
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Syntax Colors — Light</h3>
              <button
                type="button"
                (click)="resetLight()"
                class="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Reset
              </button>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              @for (row of colorRows; track row.key) {
                <label class="flex items-center gap-3 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                  <input
                    type="color"
                    [value]="prefs.prefs().syntaxColors[row.key]"
                    (input)="updateLight(row.key, $event)"
                    class="h-8 w-10 rounded cursor-pointer border border-gray-300 dark:border-gray-600 bg-transparent"
                  />
                  <span class="flex-1 min-w-0">
                    <span class="block text-sm text-gray-800 dark:text-gray-100">{{ row.label }}</span>
                    <span class="block text-xs text-gray-500 dark:text-gray-400 truncate font-mono">{{ row.hint }}</span>
                  </span>
                </label>
              }
            </div>
          </section>

          <!-- Dark palette -->
          <section>
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Syntax Colors — Dark</h3>
              <button
                type="button"
                (click)="resetDark()"
                class="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Reset
              </button>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              @for (row of colorRows; track row.key) {
                <label class="flex items-center gap-3 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                  <input
                    type="color"
                    [value]="prefs.prefs().syntaxColorsDark[row.key]"
                    (input)="updateDark(row.key, $event)"
                    class="h-8 w-10 rounded cursor-pointer border border-gray-300 dark:border-gray-600 bg-transparent"
                  />
                  <span class="flex-1 min-w-0">
                    <span class="block text-sm text-gray-800 dark:text-gray-100">{{ row.label }}</span>
                    <span class="block text-xs text-gray-500 dark:text-gray-400 truncate font-mono">{{ row.hint }}</span>
                  </span>
                </label>
              }
            </div>
          </section>

          <!-- Reset all -->
          <section class="pt-2 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              (click)="resetAll()"
              class="text-sm text-red-600 dark:text-red-400 hover:underline"
            >
              Reset all settings to defaults
            </button>
          </section>
        </div>
      </div>
    </div>
  `
})
export class SettingsComponent {
  prefs = inject(PreferencesService);
  close = output<void>();

  readonly colorRows = COLOR_ROWS;
  readonly themeModes: { value: ThemeMode; label: string; icon: string }[] = [
    { value: 'light',  label: 'Light',  icon: '☀️' },
    { value: 'dark',   label: 'Dark',   icon: '🌙' },
    { value: 'system', label: 'System', icon: '🖥️' },
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
