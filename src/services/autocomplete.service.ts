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

// Number of suggestions to show preview images for
const PREVIEW_LIMIT = 4;

@Injectable({
  providedIn: 'root'
})
export class AutocompleteService {
  private commands: LatexCommand[] = [];
  private isLoaded = signal(false);

  // Cache for preview URLs to avoid repeated requests
  private previewCache = new Map<string, string>();

  constructor() {
    this.loadCommands();
  }

  /**
   * Get preview URL for a command example (cached)
   */
  getPreviewUrl(cmd: LatexCommand): string {
    const example = cmd.example;
    if (this.previewCache.has(example)) {
      return this.previewCache.get(example)!;
    }

    const url = `https://latex.codecogs.com/svg.latex?${encodeURIComponent(example)}`;
    this.previewCache.set(example, url);
    return url;
  }

  /**
   * Check if a suggestion should show preview (only first N)
   */
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
   * Fuzzy search - matches characters in order but not necessarily consecutively
   */
  private fuzzyMatch(searchTerm: string, text: string): boolean {
    const searchLower = searchTerm.toLowerCase();
    const textLower = text.toLowerCase();
    let searchIndex = 0;

    for (let i = 0; i < textLower.length && searchIndex < searchLower.length; i++) {
      if (textLower[i] === searchLower[searchIndex]) {
        searchIndex++;
      }
    }
    return searchIndex === searchLower.length;
  }

  /**
   * Filter and rank commands based on search term
   */
  filterCommands(searchTerm: string, maxResults: number = 6): LatexCommand[] {
    if (!searchTerm || !this.isLoaded()) {
      return [];
    }

    // Remove leading backslash for search
    const term = searchTerm.startsWith('\\') ? searchTerm.slice(1) : searchTerm;
    if (!term) {
      return [];
    }

    const scored: ScoredCommand[] = [];

    for (const cmd of this.commands) {
      const cmdName = cmd.command.slice(1); // Remove backslash
      let score = 0;

      // Exact match (highest priority)
      if (cmdName === term) {
        score = 100;
      }
      // Starts with search term
      else if (cmdName.startsWith(term)) {
        score = 50 + (term.length / cmdName.length) * 30;
      }
      // Contains search term
      else if (cmdName.includes(term)) {
        score = 25;
      }
      // Fuzzy match on command name
      else if (this.fuzzyMatch(term, cmdName)) {
        score = 15;
      }
      // Match in description
      else if (cmd.description.toLowerCase().includes(term.toLowerCase())) {
        score = 10;
      }
      // Fuzzy match on description
      else if (this.fuzzyMatch(term, cmd.description)) {
        score = 5;
      }

      if (score > 0) {
        scored.push({ command: cmd, score });
      }
    }

    // Sort by score descending, then alphabetically
    scored.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.command.command.localeCompare(b.command.command);
    });

    return scored.slice(0, maxResults).map(s => s.command);
  }

  /**
   * Get the command string to insert (command + empty argument placeholders)
   */
  getInsertText(cmd: LatexCommand): { text: string; cursorOffset: number } {
    let text = cmd.command;
    let cursorOffset = cmd.command.length;

    if (cmd.arguments) {
      // Replace argument placeholders with empty braces
      const args = cmd.arguments.replace(/\{[^}]*\}/g, '{}');
      text += args;

      // Position cursor inside first brace if there is one
      const firstBraceIndex = text.indexOf('{}');
      if (firstBraceIndex !== -1) {
        cursorOffset = firstBraceIndex + 1;
      }
    }

    return { text, cursorOffset };
  }

  /**
   * Extract the partial command being typed at cursor position
   */
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
