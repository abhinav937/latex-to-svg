import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  readonly history = signal<string[]>([]);
  private readonly STORAGE_KEY = 'latex_history_v1';

  constructor() {
    this.loadHistory();
  }

  private loadHistory() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.history.set(JSON.parse(stored));
      }
    } catch (error: unknown) {
      console.error('Failed to load history', error);
    }
  }

  addToHistory(latex: string) {
    if (!latex.trim()) return;
    
    this.history.update(current => {
      // Remove duplicates and keep top 50
      const filtered = current.filter(item => item !== latex);
      const updated = [latex, ...filtered].slice(0, 50);
      this.saveToStorage(updated);
      return updated;
    });
  }

  removeFromHistory(latex: string) {
    this.history.update(current => {
      const updated = current.filter(item => item !== latex);
      this.saveToStorage(updated);
      return updated;
    });
  }

  clearHistory() {
    this.history.set([]);
    localStorage.removeItem(this.STORAGE_KEY);
  }

  private saveToStorage(items: string[]) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
    } catch (error: unknown) {
      console.error('Failed to save history', error);
    }
  }
}