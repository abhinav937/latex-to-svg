import { Injectable, signal, computed, effect } from '@angular/core';

export interface SyntaxColors {
  command: string;
  brace: string;
  bracket: string;
  operator: string;
  number: string;
  text: string;
}

export type ThemeMode = 'light' | 'dark' | 'system';

export interface Preferences {
  theme: ThemeMode;
  syntaxHighlightingEnabled: boolean;
  syntaxColors: SyntaxColors;
  syntaxColorsDark: SyntaxColors;
}

const DEFAULT_LIGHT_COLORS: SyntaxColors = {
  command: '#7c3aed',
  brace: '#9ca3af',
  bracket: '#9ca3af',
  operator: '#0891b2',
  number: '#ea580c',
  text: '#111827',
};

const DEFAULT_DARK_COLORS: SyntaxColors = {
  command: '#c4b5fd',
  brace: '#9ca3af',
  bracket: '#9ca3af',
  operator: '#67e8f9',
  number: '#fdba74',
  text: '#f3f4f6',
};

const DEFAULT_PREFS: Preferences = {
  theme: 'system',
  syntaxHighlightingEnabled: true,
  syntaxColors: DEFAULT_LIGHT_COLORS,
  syntaxColorsDark: DEFAULT_DARK_COLORS,
};

@Injectable({ providedIn: 'root' })
export class PreferencesService {
  private readonly STORAGE_KEY = 'latex_prefs_v1';

  readonly prefs = signal<Preferences>(DEFAULT_PREFS);
  private systemDark = signal<boolean>(this.detectSystemDark());

  readonly effectiveTheme = computed<'light' | 'dark'>(() => {
    const theme = this.prefs().theme;
    if (theme === 'system') return this.systemDark() ? 'dark' : 'light';
    return theme;
  });

  readonly effectiveColors = computed<SyntaxColors>(() => {
    return this.effectiveTheme() === 'dark'
      ? this.prefs().syntaxColorsDark
      : this.prefs().syntaxColors;
  });

  readonly defaultLightColors: SyntaxColors = DEFAULT_LIGHT_COLORS;
  readonly defaultDarkColors: SyntaxColors = DEFAULT_DARK_COLORS;

  constructor() {
    this.load();

    if (typeof window !== 'undefined' && window.matchMedia) {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = (e: MediaQueryListEvent) => this.systemDark.set(e.matches);
      if (mq.addEventListener) {
        mq.addEventListener('change', handler);
      } else {
        mq.addListener(handler);
      }
    }

    effect(() => {
      const isDark = this.effectiveTheme() === 'dark';
      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('dark', isDark);
      }
    });
  }

  updatePrefs(patch: Partial<Preferences>): void {
    this.prefs.update(current => ({ ...current, ...patch }));
    this.save();
  }

  updateLightColor<K extends keyof SyntaxColors>(key: K, value: string): void {
    this.prefs.update(current => ({
      ...current,
      syntaxColors: { ...current.syntaxColors, [key]: value },
    }));
    this.save();
  }

  updateDarkColor<K extends keyof SyntaxColors>(key: K, value: string): void {
    this.prefs.update(current => ({
      ...current,
      syntaxColorsDark: { ...current.syntaxColorsDark, [key]: value },
    }));
    this.save();
  }

  resetSyntaxColors(): void {
    this.prefs.update(current => ({
      ...current,
      syntaxColors: { ...DEFAULT_LIGHT_COLORS },
      syntaxColorsDark: { ...DEFAULT_DARK_COLORS },
    }));
    this.save();
  }

  resetAll(): void {
    this.prefs.set({ ...DEFAULT_PREFS });
    this.save();
  }

  private detectSystemDark(): boolean {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  private load(): void {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      this.prefs.set({
        theme: parsed.theme ?? DEFAULT_PREFS.theme,
        syntaxHighlightingEnabled:
          parsed.syntaxHighlightingEnabled ?? DEFAULT_PREFS.syntaxHighlightingEnabled,
        syntaxColors: { ...DEFAULT_LIGHT_COLORS, ...(parsed.syntaxColors ?? {}) },
        syntaxColorsDark: { ...DEFAULT_DARK_COLORS, ...(parsed.syntaxColorsDark ?? {}) },
      });
    } catch (error: unknown) {
      console.error('Failed to load preferences', error);
    }
  }

  private save(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.prefs()));
    } catch (error: unknown) {
      console.error('Failed to save preferences', error);
    }
  }
}
