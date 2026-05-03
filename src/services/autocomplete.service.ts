import { Injectable, signal } from '@angular/core';

export interface LatexCommand {
  command: string;
  arguments: string;
  description: string;
  example: string;
  category: string;
}

interface ScoredCommand {
  command: LatexCommand;
  score: number;
}

const PREVIEW_LIMIT = 4;

@Injectable({
  providedIn: 'root'
})
export class AutocompleteService {
  private commands: LatexCommand[] = [];
  private isLoaded = signal(false);

  private previewCache = new Map<string, string>();

  constructor() {
    this.loadCommands();
  }

  getPreviewUrl(cmd: LatexCommand): string {
    const example = cmd.example;
    if (this.previewCache.has(example)) {
      return this.previewCache.get(example)!;
    }

    const url = `https://latex.codecogs.com/svg.latex?${encodeURIComponent(example)}`;
    this.previewCache.set(example, url);
    return url;
  }

  shouldShowPreview(index: number): boolean {
    return index < PREVIEW_LIMIT;
  }

  private async loadCommands(): Promise<void> {
    try {
      const response = await fetch('/latex-commands.json');
      const data = await response.json();
      this.commands = data.commands;
      this.isLoaded.set(true);
    } catch (error) {
      console.error('Failed to load LaTeX commands:', error);
      this.commands = [];
    }
  }

  /**
   * Subsequence-fuzzy score. Returns 0 if `term` is not a subsequence of `text`.
   * Otherwise rewards: start anchoring, consecutive runs, and match density.
   */
  private fuzzyScore(term: string, text: string): number {
    const t = term.toLowerCase();
    const s = text.toLowerCase();
    if (!t) return 0;

    let ti = 0;
    let firstIdx = -1;
    let lastIdx = -1;
    let consecutiveBonus = 0;
    let prevMatchIdx = -2;

    for (let i = 0; i < s.length && ti < t.length; i++) {
      if (s[i] === t[ti]) {
        if (firstIdx === -1) firstIdx = i;
        lastIdx = i;
        if (i === prevMatchIdx + 1) consecutiveBonus += 4;
        prevMatchIdx = i;
        ti++;
      }
    }
    if (ti < t.length) return 0;

    const span = Math.max(1, lastIdx - firstIdx + 1);
    const density = t.length / span;
    const startBonus = firstIdx === 0 ? 8 : 0;
    return Math.round(10 * density + consecutiveBonus + startBonus);
  }

  filterCommands(searchTerm: string, maxResults: number = 8): LatexCommand[] {
    if (!searchTerm || !this.isLoaded()) {
      return [];
    }

    const term = searchTerm.startsWith('\\') ? searchTerm.slice(1) : searchTerm;
    if (!term) {
      return [];
    }

    const scored: ScoredCommand[] = [];

    for (const cmd of this.commands) {
      const cmdName = cmd.command.slice(1);
      let score = 0;

      if (cmdName === term) {
        score = 100;
      } else if (cmdName.startsWith(term)) {
        score = 50 + (term.length / cmdName.length) * 30;
      } else if (cmdName.includes(term)) {
        score = 25;
      } else {
        const fuzzyOnName = this.fuzzyScore(term, cmdName);
        if (fuzzyOnName > 0) {
          // Bumped from 15 → 30 base; strong fuzzy can beat weak `includes`.
          score = 30 + fuzzyOnName;
        } else if (cmd.description.toLowerCase().includes(term.toLowerCase())) {
          score = 10;
        } else {
          const fuzzyOnDesc = this.fuzzyScore(term, cmd.description);
          if (fuzzyOnDesc > 0) score = 5 + Math.min(fuzzyOnDesc, 10);
        }
      }

      if (score > 0) {
        scored.push({ command: cmd, score });
      }
    }

    scored.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.command.command.localeCompare(b.command.command);
    });

    return scored.slice(0, maxResults).map(s => s.command);
  }

  /**
   * Returns the snippet text plus tabstop offsets for every `{}` placeholder.
   * `cursorOffset` points to the first tabstop (or end of text if none).
   */
  getInsertText(cmd: LatexCommand): { text: string; cursorOffset: number; tabstops: number[] } {
    let text = cmd.command;
    const tabstops: number[] = [];

    if (cmd.arguments) {
      const args = cmd.arguments.replace(/\{[^}]*\}/g, '{}');
      text += args;

      for (let i = 0; i < text.length - 1; i++) {
        if (text[i] === '{' && text[i + 1] === '}') {
          tabstops.push(i + 1);
        }
      }
    }

    const cursorOffset = tabstops.length > 0 ? tabstops[0] : text.length;
    return { text, cursorOffset, tabstops };
  }

  getPartialCommand(text: string, cursorPosition: number): { term: string; startIndex: number } | null {
    const beforeCursor = text.substring(0, cursorPosition);
    const match = beforeCursor.match(/\\([a-zA-Z]*)$/);

    if (match) {
      return {
        term: match[0],
        startIndex: cursorPosition - match[0].length
      };
    }
    return null;
  }
}
