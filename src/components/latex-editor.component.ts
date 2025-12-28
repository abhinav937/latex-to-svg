import { Component, inject, signal, ElementRef, viewChild } from '@angular/core';
import { GeminiService } from '../services/gemini.service';
import { HistoryService } from '../services/history.service';
import { RateLimiterService, RateLimit } from '../services/rate-limiter.service';
import { AutocompleteService, LatexCommand } from '../services/autocomplete.service';

// Feature flags
const FEATURES = {
  COPY_SVG_URL: false, // Disabled - use Copy as Image instead
  AI_FIX: false, // Enabled via ?ai=true query param
};

@Component({
  selector: 'app-latex-editor',
  standalone: true,
  template: `
    <div class="flex flex-col min-h-full gap-4 sm:gap-6 p-3 sm:p-4 md:p-6 max-w-4xl mx-auto w-full">
      
      <!-- Preview Section -->
      <div class="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 overflow-hidden flex flex-col md:flex-row min-h-[200px] sm:min-h-[250px]">
        <div class="flex-1 p-4 sm:p-6 md:p-8 latex-preview-container flex items-center justify-center relative bg-gray-50">
           @if (previewUrl()) {
             <img 
               [src]="previewUrl()" 
               alt="LaTeX Preview" 
               class="max-w-full max-h-[150px] sm:max-h-[200px] transition-all duration-300 z-10"
             />
             <div class="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 text-xs text-gray-400 bg-white/80 px-2 py-1 rounded backdrop-blur-sm border border-gray-200">
                SVG Preview
             </div>
           } @else {
             <div class="text-center text-gray-400 px-4">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
               </svg>
               <p class="text-sm sm:text-base">Enter LaTeX code and click Render to preview</p>
             </div>
           }
        </div>
        
        <!-- Quick Actions / Info -->
        <div class="w-full md:w-64 bg-gray-50 border-t md:border-t-0 md:border-l border-gray-200 p-4 sm:p-5 flex flex-col gap-3 sm:gap-4">
           <div class="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">Quick Actions</div>
           
           @if (features.COPY_SVG_URL) {
             <button
               (click)="copySvgUrl()"
               class="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-white border border-gray-300 rounded-lg text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-indigo-300 hover:text-indigo-600 transition-all shadow-sm group">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 group-hover:text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
               </svg>
               <span class="truncate">{{ copiedUrl() ? 'Copied URL!' : 'Copy URL' }}</span>
             </button>
           }

           <button
             (click)="copySvgCode()"
             class="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-white border border-gray-300 rounded-lg text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-indigo-300 hover:text-indigo-600 transition-all shadow-sm group">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 group-hover:text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
             </svg>
             <span class="truncate">{{ copiedSvg() ? 'Copied SVG!' : 'Copy SVG Code' }}</span>
           </button>

           <button
             (click)="copySvgAsImage()"
             [disabled]="isCopyingImage()"
             class="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-white border border-gray-300 rounded-lg text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-indigo-300 hover:text-indigo-600 transition-all shadow-sm group disabled:opacity-50 disabled:cursor-not-allowed">
             @if (isCopyingImage()) {
               <svg class="animate-spin h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                 <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                 <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
             } @else {
               <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 group-hover:text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
               </svg>
             }
             <span class="truncate">{{ copiedImage() ? 'Copied!' : 'Copy as Image' }}</span>
           </button>

           <button
             (click)="downloadSvg()"
             class="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-white border border-gray-300 rounded-lg text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-indigo-300 hover:text-indigo-600 transition-all shadow-sm group">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 group-hover:text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
             </svg>
             <span class="truncate">Download SVG</span>
           </button>

           <div class="mt-auto pt-3 sm:pt-4 border-t border-gray-200">
             <p class="text-xs text-gray-500 leading-relaxed">
               Uses <span class="font-semibold text-gray-700">CodeCogs API</span> for rendering.
             </p>
           </div>
        </div>
      </div>

      <!-- Editor Section -->
      <div class="flex-1 min-h-0 flex flex-col gap-2 sm:gap-3">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
          <label class="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 sm:h-4 sm:w-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            LaTeX Input
          </label>

          <div class="flex gap-2 w-full sm:w-auto">
            <button
              (click)="renderLatex()"
              [disabled]="isRendering() || !latexInput().trim()"
              class="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-md text-xs font-semibold hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              @if (isRendering()) {
                <svg class="animate-spin h-3 w-3 text-green-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span class="hidden sm:inline">Rendering...</span>
                <span class="sm:hidden">...</span>
              } @else {
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="hidden sm:inline">Render</span>
                <span class="sm:hidden">Render</span>
              }
            </button>

            @if (features.AI_FIX) {
              <button
                (click)="fixWithAi()"
                [disabled]="isAiLoading() || !latexInput()"
                class="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-md text-xs font-semibold hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                @if (isAiLoading()) {
                  <svg class="animate-spin h-3 w-3 text-indigo-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span class="hidden sm:inline">Fixing...</span>
                  <span class="sm:hidden">...</span>
                } @else {
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span class="hidden sm:inline">Fix with AI</span>
                  <span class="sm:hidden">AI Fix</span>
                }
              </button>
            }
          </div>
        </div>

        <div class="relative group">
          <textarea
            #textareaRef
            [value]="latexInput()"
            (input)="updateLatex($event)"
            (keydown)="handleKeydown($event)"
            (blur)="hideAutocompleteDelayed()"
            class="w-full h-32 sm:h-36 p-3 sm:p-4 bg-white border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none font-mono text-xs sm:text-sm shadow-sm transition-all"
            placeholder="\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}"
          ></textarea>
        </div>

        <!-- Example Chips (outside textarea) -->
        <div class="flex flex-wrap gap-1.5 sm:gap-2">
          <span class="text-xs text-gray-500 py-1">Try:</span>
          @for (ex of examples; track ex.label) {
            <button
              (click)="setLatex(ex.code)"
              class="px-2 sm:px-3 py-1 bg-gray-100 hover:bg-indigo-100 hover:text-indigo-700 text-gray-600 text-xs rounded-full border border-gray-200 hover:border-indigo-300 transition-colors shadow-sm"
            >
              {{ ex.label }}
            </button>
          }
        </div>

        <!-- Autocomplete Suggestions (outside textarea) -->
        @if (showAutocomplete() && suggestions().length > 0) {
          <div class="bg-white border border-gray-200 rounded-lg shadow-lg max-h-72 overflow-y-auto">
            @for (cmd of suggestions(); track cmd.command; let i = $index) {
              <button
                type="button"
                (mousedown)="selectCommand(cmd, $event)"
                class="w-full px-3 py-2 flex items-center gap-3 hover:bg-indigo-50 transition-colors text-left border-b border-gray-100 last:border-b-0"
                [class.bg-indigo-50]="i === selectedIndex()"
              >
                <!-- Preview image (only for first 4) -->
                @if (autocompleteService.shouldShowPreview(i)) {
                  <div class="w-16 h-8 flex items-center justify-center bg-gray-50 rounded border border-gray-200 flex-shrink-0 overflow-hidden">
                    <img
                      [src]="autocompleteService.getPreviewUrl(cmd)"
                      alt=""
                      class="max-w-full max-h-full object-contain"
                      loading="lazy"
                    />
                  </div>
                } @else {
                  <div class="w-16 h-8 flex-shrink-0"></div>
                }
                <code class="text-indigo-600 font-mono text-sm font-medium min-w-[100px]">{{ cmd.command }}</code>
                <span class="text-gray-500 text-xs flex-1 truncate">{{ cmd.description }}</span>
                <span class="text-gray-400 text-xs px-1.5 py-0.5 bg-gray-100 rounded flex-shrink-0">{{ cmd.category }}</span>
              </button>
            }
            <div class="px-3 py-1.5 text-xs text-gray-400 bg-gray-50 border-t border-gray-200">
              <kbd class="px-1 py-0.5 bg-gray-200 rounded text-gray-600">Tab</kbd> to select, <kbd class="px-1 py-0.5 bg-gray-200 rounded text-gray-600">Esc</kbd> to close
            </div>
          </div>
        }

        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-0 text-xs text-gray-500 px-1">
          <span class="text-xs">Press <kbd class="px-1 py-0.5 bg-gray-200 rounded text-gray-600">Enter</kbd> to render</span>
          <span>{{ latexInput().length }} chars</span>
        </div>
      </div>
    </div>
  `
})
export class LatexEditorComponent {
  private geminiService = inject(GeminiService);
  private historyService = inject(HistoryService);
  private rateLimiter = inject(RateLimiterService);
  autocompleteService = inject(AutocompleteService);

  // Template reference for textarea
  textareaRef = viewChild<ElementRef<HTMLTextAreaElement>>('textareaRef');

  // Expose feature flags to template (mutable copy)
  features = { ...FEATURES };

  latexInput = signal('');
  previewUrl = signal('');
  isRendering = signal(false);
  isAiLoading = signal(false);
  copiedUrl = signal(false);
  copiedSvg = signal(false);
  copiedImage = signal(false);
  isCopyingImage = signal(false);

  // Autocomplete state
  showAutocomplete = signal(false);
  suggestions = signal<LatexCommand[]>([]);
  selectedIndex = signal(0);
  private autocompleteStartIndex = 0;
  private hideTimeout: ReturnType<typeof setTimeout> | null = null;

  // Rate limits: CodeCogs allows reasonable usage, we'll limit to 30 requests per minute
  private readonly CODECOGS_RATE_LIMIT: RateLimit = {
    requests: 30,
    windowMs: 60 * 1000 // 1 minute
  };

  // Examples for quick start
  examples = [
    { label: 'Quadratic', code: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}' },
    { label: 'Integral', code: '\\int_{a}^{b} x^2 \\,dx' },
    { label: 'Matrix', code: '\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}' },
    { label: 'Summation', code: '\\sum_{i=0}^n i^2 = \\frac{(n^2+n)(2n+1)}{6}' }
  ];

  async renderLatex() {
    const code = this.latexInput().trim();
    if (!code) {
      this.previewUrl.set('');
      return;
    }

    // Check rate limit
    if (!this.rateLimiter.canMakeRequest('codecogs', this.CODECOGS_RATE_LIMIT)) {
      console.warn('CodeCogs API rate limit exceeded. Please wait before rendering again.');
      return;
    }

    this.isRendering.set(true);
    try {
      // Encode and add some styling for better visibility
      const url = `https://latex.codecogs.com/svg.latex?\\huge ${encodeURIComponent(code)}`;
      this.previewUrl.set(url);
      
      // Add to history after successful render
      this.historyService.addToHistory(code);
    } catch (error) {
      console.error('Failed to render LaTeX:', error);
    } finally {
      this.isRendering.set(false);
    }
  }

  updateLatex(event: Event) {
    const input = event.target as HTMLTextAreaElement;
    this.latexInput.set(input.value);
    this.checkAutocomplete(input);
  }

  private checkAutocomplete(textarea: HTMLTextAreaElement) {
    const cursorPosition = textarea.selectionStart;
    const partial = this.autocompleteService.getPartialCommand(textarea.value, cursorPosition);

    if (partial && partial.term.length > 1) {
      this.autocompleteStartIndex = partial.startIndex;
      const results = this.autocompleteService.filterCommands(partial.term);
      this.suggestions.set(results);
      this.selectedIndex.set(0);
      this.showAutocomplete.set(results.length > 0);
    } else {
      this.hideAutocomplete();
    }
  }

  handleKeydown(event: KeyboardEvent) {
    const suggestions = this.suggestions();

    // Handle autocomplete navigation
    if (this.showAutocomplete() && suggestions.length > 0) {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          this.selectedIndex.set((this.selectedIndex() + 1) % suggestions.length);
          return;
        case 'ArrowUp':
          event.preventDefault();
          this.selectedIndex.set((this.selectedIndex() - 1 + suggestions.length) % suggestions.length);
          return;
        case 'Tab':
          event.preventDefault();
          const selected = suggestions[this.selectedIndex()];
          if (selected) {
            this.selectCommand(selected);
          }
          return;
        case 'Escape':
          event.preventDefault();
          this.hideAutocomplete();
          return;
      }
    }

    // Enter to render (when autocomplete is not active)
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.renderLatex();
    }
  }

  selectCommand(cmd: LatexCommand, event?: MouseEvent) {
    if (event) {
      event.preventDefault();
    }

    const textarea = this.textareaRef()?.nativeElement;
    if (!textarea) return;

    const currentValue = textarea.value;
    const cursorPosition = textarea.selectionStart;

    // Get the insert text and cursor offset
    const { text, cursorOffset } = this.autocompleteService.getInsertText(cmd);

    // Replace the partial command with the full command
    const beforeCommand = currentValue.substring(0, this.autocompleteStartIndex);
    const afterCursor = currentValue.substring(cursorPosition);
    const newValue = beforeCommand + text + afterCursor;

    // Update the input
    this.latexInput.set(newValue);
    this.hideAutocomplete();

    // Set cursor position inside first argument brackets
    setTimeout(() => {
      const newCursorPos = this.autocompleteStartIndex + cursorOffset;
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }

  hideAutocomplete() {
    this.showAutocomplete.set(false);
    this.suggestions.set([]);
    this.selectedIndex.set(0);
  }

  hideAutocompleteDelayed() {
    // Delay hiding to allow click events on suggestions to fire
    this.hideTimeout = setTimeout(() => {
      this.hideAutocomplete();
    }, 150);
  }

  setLatex(code: string) {
    this.latexInput.set(code);
    this.historyService.addToHistory(code);
    // Auto-render when setting LaTeX from examples
    this.renderLatex();
  }

  async fixWithAi() {
    if (!this.latexInput()) return;
    
    this.isAiLoading.set(true);
    try {
      const fixed = await this.geminiService.fixLatex(this.latexInput());
      if (fixed) {
        this.latexInput.set(fixed);
        this.historyService.addToHistory(fixed);
        // Auto-render the fixed LaTeX
        await this.renderLatex();
      }
    } finally {
      this.isAiLoading.set(false);
    }
  }

  copySvgUrl() {
    const url = this.previewUrl();
    if (!url) return;
    
    navigator.clipboard.writeText(url).then(() => {
      this.copiedUrl.set(true);
      setTimeout(() => this.copiedUrl.set(false), 2000);
    });
  }

  async copySvgCode() {
    const url = this.previewUrl();
    if (!url) return;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response was not ok');
      const svgText = await response.text();
      await navigator.clipboard.writeText(svgText);

      this.copiedSvg.set(true);
      setTimeout(() => this.copiedSvg.set(false), 2000);
    } catch (error) {
      console.error('Failed to copy SVG code:', error);
    }
  }

  async copySvgAsImage() {
    const url = this.previewUrl();
    if (!url) return;

    this.isCopyingImage.set(true);
    try {
      // Fetch the SVG content
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response was not ok');
      const svgText = await response.text();

      // Parse SVG to get dimensions
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
      const svgElement = svgDoc.documentElement;

      // Get SVG dimensions (with fallback)
      let width = parseFloat(svgElement.getAttribute('width') || '300');
      let height = parseFloat(svgElement.getAttribute('height') || '100');

      // If dimensions are in non-pixel units or missing, use viewBox
      const viewBox = svgElement.getAttribute('viewBox');
      if (viewBox) {
        const [, , vbWidth, vbHeight] = viewBox.split(/\s+/).map(parseFloat);
        if (vbWidth && vbHeight) {
          width = vbWidth;
          height = vbHeight;
        }
      }

      // Scale up for better quality (4x)
      const scale = 4;
      const canvasWidth = Math.ceil(width * scale);
      const canvasHeight = Math.ceil(height * scale);

      // Create a blob URL from the SVG
      const svgBlob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);

      // Create image and canvas
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      // Wait for image to load
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load SVG image'));
        img.src = svgUrl;
      });

      // Set canvas size and draw
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      // Fill with white background for better visibility
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Draw scaled image
      ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);

      // Clean up blob URL
      URL.revokeObjectURL(svgUrl);

      // Convert canvas to PNG blob
      const pngBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create PNG blob'));
          }
        }, 'image/png');
      });

      // Copy to clipboard using Clipboard API
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': pngBlob
        })
      ]);

      this.copiedImage.set(true);
      setTimeout(() => this.copiedImage.set(false), 2000);
    } catch (error) {
      console.error('Failed to copy SVG as image:', error);
    } finally {
      this.isCopyingImage.set(false);
    }
  }

  async downloadSvg() {
    const url = this.previewUrl();
    if (!url) return;

    try {
      // Fetch SVG content to bypass cross-origin download restrictions
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response was not ok');
      const svgText = await response.text();

      // Create blob and download
      const blob = new Blob([svgText], { type: 'image/svg+xml' });
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'equation.svg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up blob URL
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Failed to download SVG:', error);
    }
  }

  constructor() {
    // Check URL query params for feature flags
    const params = new URLSearchParams(window.location.search);
    if (params.get('ai') === 'true') {
      this.features.AI_FIX = true;
    }
  }
}