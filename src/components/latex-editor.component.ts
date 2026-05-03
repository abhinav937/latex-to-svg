import { Component, inject, signal, computed, ElementRef, viewChild, HostListener, Injector } from '@angular/core';
import { HistoryService } from '../services/history.service';
import { RateLimiterService, RateLimit } from '../services/rate-limiter.service';
import { AutocompleteService, LatexCommand } from '../services/autocomplete.service';
import { PreferencesService } from '../services/preferences.service';

const FEATURES = {
  COPY_SVG_URL: false,
  AI_FIX: false,
};

const HTML_ESC: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

@Component({
  selector: 'app-latex-editor',
  standalone: true,
  template: `
    <div class="flex flex-col min-h-full gap-4 sm:gap-6 p-3 sm:p-4 md:p-6 max-w-4xl mx-auto w-full">

      <!-- Preview Section -->
      <div class="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col md:flex-row min-h-[200px] sm:min-h-[250px]">
        <div class="flex-1 p-4 sm:p-6 md:p-8 latex-preview-container flex items-center justify-center relative bg-gray-50 dark:bg-gray-900">
           @if (previewUrl()) {
             <img
               [src]="previewUrl()"
               alt="LaTeX Preview"
               (load)="onPreviewLoad($event)"
               [style.width]="previewDisplayWidth()"
               [style.maxWidth]="'100%'"
               [style.maxHeight]="'400px'"
               [style.background]="prefs.effectiveTheme() === 'dark' ? 'white' : 'transparent'"
               [style.padding]="prefs.effectiveTheme() === 'dark' ? '8px' : '0'"
               [style.borderRadius]="prefs.effectiveTheme() === 'dark' ? '6px' : '0'"
               class="transition-all duration-300 z-10"
               loading="eager"
               fetchpriority="high"
             />
             <div class="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 text-xs text-gray-500 dark:text-gray-300 bg-white/80 dark:bg-gray-800/80 px-2 py-1 rounded backdrop-blur-sm border border-gray-200 dark:border-gray-700">
                {{ outputSizeLabel() }}
             </div>
           } @else {
             <div class="text-center text-gray-400 dark:text-gray-500 px-4">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-2 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
               </svg>
               <p class="text-sm sm:text-base">Enter LaTeX code and click Render to preview</p>
             </div>
           }
        </div>

        <!-- Quick Actions / Info -->
        <div class="w-full md:w-56 bg-gray-50 dark:bg-gray-900 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700 p-3 sm:p-4 flex flex-col gap-2.5">
           <div class="text-[11px] sm:text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-[0.14em]">Quick Actions</div>

           @if (features.COPY_SVG_URL) {
             <button
               (click)="copySvgUrl()"
               class="flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-indigo-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-sm group min-h-9">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-400 group-hover:text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
               </svg>
               <span class="truncate">{{ copiedUrl() ? 'Copied URL!' : 'Copy URL' }}</span>
             </button>
           }

           <button
             (click)="copySvgCode()"
             [disabled]="!previewUrl()"
             class="flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-indigo-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-sm group disabled:opacity-40 disabled:cursor-not-allowed min-h-9">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-400 group-hover:text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
             </svg>
             <span class="truncate">{{ copiedSvg() ? 'Copied SVG!' : 'Copy SVG Code' }}</span>
           </button>

           <button
             (click)="copySvgAsImage()"
             [disabled]="!previewUrl()"
             class="flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-indigo-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-sm group disabled:opacity-40 disabled:cursor-not-allowed min-h-9">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-400 group-hover:text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
             </svg>
             <span class="truncate">{{ copiedImage() ? 'Copied!' : 'Copy as Image' }}</span>
           </button>

           <button
             (click)="copyPngToClipboard()"
             [disabled]="!previewUrl() || isCopyingPng()"
             class="flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-indigo-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-sm group disabled:opacity-40 disabled:cursor-not-allowed min-h-9">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-400 group-hover:text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
             </svg>
             <span class="truncate">{{ copiedPng() ? 'Copied PNG!' : (isCopyingPng() ? 'Copying...' : 'Copy as PNG') }}</span>
           </button>

           <button
             (click)="downloadSvg()"
             [disabled]="!previewUrl()"
             class="flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-indigo-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-sm group disabled:opacity-40 disabled:cursor-not-allowed min-h-9">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-400 group-hover:text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
             </svg>
             <span class="truncate">Download SVG</span>
           </button>

           <button
             (click)="downloadPng()"
             [disabled]="!previewUrl()"
             class="flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-indigo-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-sm group disabled:opacity-40 disabled:cursor-not-allowed min-h-9">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-400 group-hover:text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
             </svg>
             <span class="truncate">Download PNG</span>
           </button>

           <!-- Output Size -->
           <div class="pt-2.5 border-t border-gray-200 dark:border-gray-700">
             <div class="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-[0.14em] mb-2">Output Size</div>

             <div class="mb-2.5">
               <div class="flex items-center justify-between mb-1">
                 <span class="text-xs text-gray-500 dark:text-gray-400">Font size</span>
                 <div class="flex items-center gap-1">
                   <span class="text-xs font-semibold text-indigo-600 dark:text-indigo-400 min-w-[2.5rem] text-right tabular-nums">{{ svgFontSize() }}</span>
                   <select
                     (change)="onSvgUnitChange($event)"
                     class="px-1.5 py-0.5 text-[11px] border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
                   >
                     <option value="pt" [selected]="svgExportUnit() === 'pt'">pt</option>
                     <option value="px" [selected]="svgExportUnit() === 'px'">px</option>
                     <option value="mm" [selected]="svgExportUnit() === 'mm'">mm</option>
                   </select>
                 </div>
               </div>
               <input
                 type="range"
                 [attr.min]="sliderConfig().min"
                 [attr.max]="sliderConfig().max"
                 [attr.step]="sliderConfig().step"
                 [value]="svgFontSize()"
                 (input)="onFontSizeInput($event)"
                 class="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-indigo-600 bg-gray-200 dark:bg-gray-700"
               />
             </div>

             <div class="flex items-center gap-1.5">
               <span class="text-xs text-gray-500 dark:text-gray-400 w-8 flex-shrink-0">PNG</span>
               <select
                 (change)="onPngDpiChange($event)"
                 class="flex-1 px-2 py-1 text-[11px] border border-gray-300 dark:border-gray-600 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
               >
                 <option value="72"  [selected]="pngDpi() === 72">72 dpi</option>
                 <option value="96"  [selected]="pngDpi() === 96">96 dpi</option>
                 <option value="150" [selected]="pngDpi() === 150">150 dpi</option>
                 <option value="300" [selected]="pngDpi() === 300">300 dpi</option>
                 <option value="600" [selected]="pngDpi() === 600">600 dpi</option>
               </select>
             </div>
           </div>

           <div class="pt-2.5 border-t border-gray-200 dark:border-gray-700">
             <p class="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
               Uses <span class="font-semibold text-gray-700 dark:text-gray-200">CodeCogs API</span> for rendering.
             </p>
           </div>
        </div>
      </div>

      <!-- Editor Section -->
      <div class="flex-1 min-h-0 flex flex-col gap-2 sm:gap-3">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
          <label class="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 sm:h-4 sm:w-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            LaTeX Input
          </label>

          <div class="flex gap-2 w-full sm:w-auto">
            <button
              (click)="renderLatex()"
              [disabled]="isRendering() || !latexInput().trim()"
              class="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded-md text-xs font-semibold hover:bg-green-100 dark:hover:bg-green-900/60 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              @if (isRendering()) {
                <svg class="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span class="hidden sm:inline">Rendering...</span>
                <span class="sm:hidden">...</span>
              } @else {
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Render</span>
              }
            </button>

            @if (features.AI_FIX) {
              <button
                (click)="fixWithAi()"
                [disabled]="isAiLoading() || !latexInput()"
                class="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-md text-xs font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/60 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                @if (isAiLoading()) {
                  <svg class="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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

        <!-- Editor with syntax-highlight overlay -->
        <div class="relative font-mono text-xs sm:text-sm">
          <pre
            #highlightLayer
            aria-hidden="true"
            class="absolute inset-0 m-0 p-3 sm:p-4 whitespace-pre-wrap break-words pointer-events-none overflow-hidden rounded-lg sm:rounded-xl"
            [style.color]="prefs.effectiveColors().text"
            [innerHTML]="highlightedHtml()"
          ></pre>
          <textarea
            #textareaRef
            [value]="latexInput()"
            (input)="updateLatex($event)"
            (keydown)="handleKeydown($event)"
            (scroll)="syncScroll($event)"
            (blur)="hideAutocompleteDelayed()"
            class="relative w-full h-32 sm:h-36 p-3 sm:p-4 bg-transparent text-transparent caret-gray-900 dark:caret-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none shadow-sm transition-all selection:bg-indigo-300/40 dark:selection:bg-indigo-500/40"
            placeholder="\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}"
          ></textarea>
        </div>

        <!-- Example Chips -->
        <div class="flex flex-wrap gap-1.5 sm:gap-2">
          <span class="text-xs text-gray-500 dark:text-gray-400 py-1">Try:</span>
          @for (ex of examples; track ex.label) {
            <button
              (click)="setLatex(ex.code)"
              class="px-2 sm:px-3 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 hover:text-indigo-700 dark:hover:text-indigo-300 text-gray-600 dark:text-gray-300 text-xs rounded-full border border-gray-200 dark:border-gray-700 hover:border-indigo-300 transition-colors shadow-sm"
            >
              {{ ex.label }}
            </button>
          }
        </div>

        <!-- Autocomplete Suggestions -->
        @if (showAutocomplete() && suggestions().length > 0) {
          <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-72 overflow-y-auto">
            @for (cmd of suggestions(); track cmd.command; let i = $index) {
              <button
                type="button"
                (mousedown)="selectCommand(cmd, $event)"
                class="w-full px-3 py-2 flex items-center gap-3 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 transition-colors text-left border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                [class.bg-indigo-50]="i === selectedIndex()"
                [class.dark:bg-indigo-900\/40]="i === selectedIndex()"
              >
                @if (autocompleteService.shouldShowPreview(i)) {
                  <div class="w-16 h-8 flex items-center justify-center bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 flex-shrink-0 overflow-hidden">
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
                <code class="text-indigo-600 dark:text-indigo-300 font-mono text-sm font-medium min-w-[100px]">{{ cmd.command }}</code>
                <span class="text-gray-500 dark:text-gray-400 text-xs flex-1 truncate">{{ cmd.description }}</span>
                <span class="text-gray-400 dark:text-gray-300 text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded flex-shrink-0">{{ cmd.category }}</span>
              </button>
            }
            <div class="px-3 py-1.5 text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
              <kbd class="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-300">Tab</kbd> to select, <kbd class="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-300">Esc</kbd> to close
            </div>
          </div>
        }

        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-0 text-xs text-gray-500 dark:text-gray-400 px-1">
          <span class="text-xs">
            <kbd class="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-300">Enter</kbd> to render
            <span class="mx-2 text-gray-300 dark:text-gray-600">·</span>
            <kbd class="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-300">\\</kbd> for autocomplete
            @if (activeSnippet()) {
              <span class="mx-2 text-gray-300 dark:text-gray-600">·</span>
              <kbd class="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-300">Tab</kbd> next slot
            }
          </span>
          <span>{{ latexInput().length }} chars</span>
        </div>
      </div>
    </div>
  `
})
export class LatexEditorComponent {
  private injector = inject(Injector);
  private historyService = inject(HistoryService);
  private rateLimiter = inject(RateLimiterService);
  autocompleteService = inject(AutocompleteService);
  prefs = inject(PreferencesService);

  textareaRef = viewChild<ElementRef<HTMLTextAreaElement>>('textareaRef');
  highlightLayer = viewChild<ElementRef<HTMLPreElement>>('highlightLayer');

  features = { ...FEATURES };

  latexInput = signal('');
  previewUrl = signal('');
  renderedLatex = signal('');
  isRendering = signal(false);
  isAiLoading = signal(false);
  copiedUrl = signal(false);
  copiedSvg = signal(false);
  copiedImage = signal(false);
  copiedPng = signal(false);
  isCopyingPng = signal(false);

  svgFontSize = signal<number>(12);
  svgExportUnit = signal<'mm' | 'pt' | 'px'>('pt');
  pngDpi = signal<number>(150);

  private static readonly CODECOGS_BASE_PT = 10;

  private svgNativeDims = signal<{ wPt: number; hPt: number } | null>(null);
  private svgMetadataController: AbortController | null = null;
  private renderVersion = 0;

  // Snippet tabstop tracking
  activeSnippet = signal<{ baseIndex: number; tabstops: number[]; current: number } | null>(null);

  readonly sliderConfig = computed(() => {
    const unit = this.svgExportUnit();
    const configs: Record<string, { min: number; max: number; step: number }> = {
      pt: { min: 6,   max: 72,  step: 1 },
      px: { min: 8,   max: 96,  step: 1 },
      mm: { min: 2,   max: 25,  step: 1 },
    };
    return configs[unit] ?? configs['pt'];
  });

  /** Highlighted HTML for the overlay <pre>. */
  readonly highlightedHtml = computed<string>(() => {
    const src = this.latexInput();
    // Trailing space ensures the last line has height when text ends with newline
    if (!this.prefs.prefs().syntaxHighlightingEnabled) {
      return this.escapeHtml(src) + '\n';
    }
    return this.tokenize(src) + '\n';
  });

  onPreviewLoad(_event: Event): void {
    // no-op
  }

  private static readonly PX_TO_UNIT: Record<string, number> = {
    mm: 25.4 / 96,
    pt: 72 / 96,
    px: 1,
  };

  private toPt(value: number, unit: 'mm' | 'pt' | 'px'): number {
    const factors: Record<string, number> = { mm: 72 / 25.4, pt: 1, px: 72 / 96 };
    return value * (factors[unit] ?? 1);
  }

  readonly fontScaleFactor = computed<number>(() => {
    const desiredPt = this.toPt(this.svgFontSize(), this.svgExportUnit());
    return desiredPt / LatexEditorComponent.CODECOGS_BASE_PT;
  });

  private readonly scaledDimsPx = computed<{ wPx: number; hPx: number } | null>(() => {
    const native = this.svgNativeDims();
    if (!native?.wPt || !native?.hPt) return null;
    const scale = this.fontScaleFactor();
    const ptToPx = 96 / 72;
    return {
      wPx: native.wPt * scale * ptToPx,
      hPx: native.hPt * scale * ptToPx,
    };
  });

  readonly previewDisplayWidth = computed<string>(() => {
    const dims = this.scaledDimsPx();
    if (dims) {
      return `${Math.max(24, Math.min(600, dims.wPx))}px`;
    }
    return '120px';
  });

  readonly outputSizeLabel = computed<string>(() => {
    const dims = this.scaledDimsPx();
    const unit = this.svgExportUnit();
    const fontSize = this.svgFontSize();
    if (!dims) return `${fontSize} ${unit}`;
    const f = LatexEditorComponent.PX_TO_UNIT[unit] ?? 1;
    return `${(dims.wPx * f).toFixed(1)} × ${(dims.hPx * f).toFixed(1)} ${unit}`;
  });

  showAutocomplete = signal(false);
  suggestions = signal<LatexCommand[]>([]);
  selectedIndex = signal(0);
  private autocompleteStartIndex = 0;
  private hideTimeout: ReturnType<typeof setTimeout> | null = null;

  private readonly CODECOGS_RATE_LIMIT: RateLimit = {
    requests: 30,
    windowMs: 60 * 1000
  };

  private readonly MAX_LATEX_LENGTH = 5000;

  examples = [
    { label: 'Text', code: '\\text{Buck Converter}' },
    { label: 'Greek', code: '\\eta = \\frac{P_{out}}{P_{in}}' },
    { label: 'Equation', code: 'P = V \\cdot I' },
    { label: 'Fraction', code: '\\frac{V_{out}}{V_{in}} = D' },
    { label: 'State Space', code: '\\dot{x} = \\begin{bmatrix} 0 & -\\frac{1}{L} \\\\ \\frac{1}{C} & -\\frac{1}{RC} \\end{bmatrix} x + \\begin{bmatrix} \\frac{1}{L} \\\\ 0 \\end{bmatrix} u' }
  ];

  private escapeHtml(s: string): string {
    return s.replace(/[&<>"']/g, c => HTML_ESC[c]);
  }

  /**
   * Tokenize LaTeX into colored spans. HTML-escapes first, then injects spans
   * around safe single-character / command tokens. We control every emitted byte
   * so [innerHTML] is safe.
   */
  private tokenize(src: string): string {
    const colors = this.prefs.effectiveColors();
    const escaped = this.escapeHtml(src);
    // Match against the *escaped* string. `\` survives escaping unchanged, so
    // command matching still works. Braces/brackets/operators also unchanged.
    const re = /(\\[a-zA-Z]+\*?)|([{}])|(\[|\])|(\d+(?:\.\d+)?)|([+\-=^_*\/<>])/g;
    return escaped.replace(re, (match, cmd, brace, bracket, num, op) => {
      if (cmd)     return `<span style="color:${colors.command}">${match}</span>`;
      if (brace)   return `<span style="color:${colors.brace}">${match}</span>`;
      if (bracket) return `<span style="color:${colors.bracket}">${match}</span>`;
      if (num)     return `<span style="color:${colors.number}">${match}</span>`;
      if (op)      return `<span style="color:${colors.operator}">${match}</span>`;
      return match;
    });
  }

  syncScroll(_event: Event): void {
    const ta = this.textareaRef()?.nativeElement;
    const layer = this.highlightLayer()?.nativeElement;
    if (!ta || !layer) return;
    layer.scrollTop = ta.scrollTop;
    layer.scrollLeft = ta.scrollLeft;
  }

  async renderLatex() {
    const code = this.latexInput().trim();
    if (!code) {
      this.clearRenderedOutput();
      return;
    }

    if (code.length > this.MAX_LATEX_LENGTH) {
      console.warn(`LaTeX input exceeds maximum length of ${this.MAX_LATEX_LENGTH} characters.`);
      return;
    }

    if (!this.rateLimiter.canMakeRequest('codecogs', this.CODECOGS_RATE_LIMIT)) {
      console.warn('CodeCogs API rate limit exceeded. Please wait before rendering again.');
      return;
    }

    this.isRendering.set(true);
    try {
      const renderVersion = ++this.renderVersion;
      this.svgMetadataController?.abort();
      const controller = new AbortController();
      this.svgMetadataController = controller;

      const url = `https://latex.codecogs.com/svg.image?${encodeURIComponent('\\dpi{300} ' + code)}`;
      this.previewUrl.set(url);
      this.renderedLatex.set(code);
      this.svgNativeDims.set(null);

      this.fetchSvgText(code, controller.signal).then(svgText => {
        if (controller.signal.aborted || renderVersion !== this.renderVersion || this.renderedLatex() !== code) {
          return;
        }
        const svgTagMatch = svgText.match(/<svg([^>]*)>/);
        if (!svgTagMatch) return;
        const wMatch = svgTagMatch[1].match(/\bwidth=['"]([0-9.]+)[a-z%]*['"]/);
        const hMatch = svgTagMatch[1].match(/\bheight=['"]([0-9.]+)[a-z%]*['"]/);
        if (wMatch && hMatch) {
          this.svgNativeDims.set({ wPt: parseFloat(wMatch[1]), hPt: parseFloat(hMatch[1]) });
        }
      }).catch((error: unknown) => {
        if ((error as Error)?.name === 'AbortError') return;
      });

      this.historyService.addToHistory(code);
    } catch (error: unknown) {
      console.error('Failed to render LaTeX:', error);
    } finally {
      this.isRendering.set(false);
    }
  }

  updateLatex(event: Event) {
    const input = event.target as HTMLTextAreaElement;
    this.latexInput.set(input.value);
    // Any text edit invalidates snippet tabstops (offsets become unreliable)
    if (this.activeSnippet()) this.activeSnippet.set(null);
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

    // Snippet tabstop navigation (when autocomplete is closed)
    const snip = this.activeSnippet();
    if (snip && event.key === 'Tab') {
      event.preventDefault();
      const ta = this.textareaRef()?.nativeElement;
      if (!ta) return;
      const next = snip.current + 1;
      if (next < snip.tabstops.length) {
        const pos = snip.baseIndex + snip.tabstops[next];
        ta.focus();
        ta.setSelectionRange(pos, pos);
        this.activeSnippet.set({ ...snip, current: next });
      } else {
        this.activeSnippet.set(null);
      }
      return;
    }
    if (snip && event.key === 'Escape') {
      this.activeSnippet.set(null);
    }

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

    const { text, cursorOffset, tabstops } = this.autocompleteService.getInsertText(cmd);

    const beforeCommand = currentValue.substring(0, this.autocompleteStartIndex);
    const afterCursor = currentValue.substring(cursorPosition);
    const newValue = beforeCommand + text + afterCursor;

    const baseIndex = this.autocompleteStartIndex;
    this.latexInput.set(newValue);
    this.hideAutocomplete();

    // Activate snippet if the inserted text has multiple tabstops
    if (tabstops.length > 1) {
      this.activeSnippet.set({ baseIndex, tabstops, current: 0 });
    } else {
      this.activeSnippet.set(null);
    }

    setTimeout(() => {
      const newCursorPos = baseIndex + cursorOffset;
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
    this.hideTimeout = setTimeout(() => {
      this.hideAutocomplete();
    }, 150);
  }

  setLatex(code: string) {
    this.latexInput.set(code);
    this.historyService.addToHistory(code);
    this.renderLatex();
  }

  async fixWithAi() {
    if (!this.latexInput()) return;

    this.isAiLoading.set(true);
    try {
      const { GeminiService } = await import('../services/gemini.service');
      const geminiService = this.injector.get(GeminiService);
      const fixed = await geminiService.fixLatex(this.latexInput());
      if (fixed) {
        this.latexInput.set(fixed);
        this.historyService.addToHistory(fixed);
        await this.renderLatex();
      }
    } finally {
      this.isAiLoading.set(false);
    }
  }

  private async fetchSvgText(code = this.renderedLatex().trim(), signal?: AbortSignal): Promise<string> {
    if (!code) throw new Error('No LaTeX to fetch');

    const url = `https://latex.codecogs.com/svg?${encodeURIComponent('\\dpi{300} ' + code)}`;
    const response = await fetch(url, { signal });
    if (!response.ok) throw new Error(`CodeCogs SVG fetch failed: ${response.status}`);
    return response.text();
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
    if (!this.previewUrl()) return;
    try {
      const svgText = this.scaleSvgForExport(await this.fetchSvgText());
      await navigator.clipboard.writeText(svgText);
      this.copiedSvg.set(true);
      setTimeout(() => this.copiedSvg.set(false), 2000);
    } catch (error: unknown) {
      console.error('Failed to copy SVG code:', error);
    }
  }

  async copySvgAsImage() {
    if (!this.previewUrl()) return;
    try {
      const svgText = this.scaleSvgForExport(await this.fetchSvgText());
      const svgBlob = new Blob([svgText], { type: 'image/svg+xml' });

      if ('supports' in ClipboardItem && ClipboardItem.supports('image/svg+xml')) {
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/svg+xml': svgBlob,
            'text/plain': new Blob([svgText], { type: 'text/plain' }),
          })
        ]);
      } else {
        await new Promise<void>((resolve, reject) => {
          const dummy = document.createElement('textarea');
          dummy.value = ' ';
          dummy.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;pointer-events:none';
          document.body.appendChild(dummy);
          dummy.focus();
          dummy.select();
          const onCopy = (e: ClipboardEvent) => {
            e.preventDefault();
            e.clipboardData?.setData('image/svg+xml', svgText);
            e.clipboardData?.setData('text/plain', svgText);
            document.body.removeChild(dummy);
            resolve();
          };
          document.addEventListener('copy', onCopy, { once: true });
          const ok = document.execCommand('copy');
          if (!ok) {
            document.removeEventListener('copy', onCopy);
            document.body.removeChild(dummy);
            reject(new Error('execCommand copy not supported'));
          }
        });
      }

      this.copiedImage.set(true);
      setTimeout(() => this.copiedImage.set(false), 2000);
    } catch (error: unknown) {
      console.error('Failed to copy SVG as image:', error);
    }
  }

  async copyPngToClipboard() {
    const code = this.renderedLatex().trim();
    if (!code || !this.previewUrl()) return;

    this.isCopyingPng.set(true);
    try {
      const dpi = this.pngDpi();
      const url = `https://latex.codecogs.com/png.image?${encodeURIComponent(`\\dpi{${dpi}}` + code)}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`CodeCogs PNG fetch failed: ${response.status}`);
      const blob = await response.blob();
      // PNG is universally supported by ClipboardItem (no MIME-type whitelist issues)
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      this.copiedPng.set(true);
      setTimeout(() => this.copiedPng.set(false), 2000);
    } catch (error: unknown) {
      console.error('Failed to copy PNG:', error);
    } finally {
      this.isCopyingPng.set(false);
    }
  }

  private generateFilename(latexInput: string, extension: string): string {
    const patterns = [
      { regex: /\\epsilon_0|\\varepsilon_0/, name: 'epsilon_not' },
      { regex: /\\epsilon|\\varepsilon/, name: 'epsilon' },
      { regex: /\\alpha/, name: 'alpha' },
      { regex: /\\beta/, name: 'beta' },
      { regex: /\\gamma/, name: 'gamma' },
      { regex: /\\delta/, name: 'delta' },
      { regex: /\\Delta/, name: 'delta_capital' },
      { regex: /\\pi/, name: 'pi' },
      { regex: /\\theta/, name: 'theta' },
      { regex: /\\lambda/, name: 'lambda' },
      { regex: /\\mu/, name: 'mu' },
      { regex: /\\sigma/, name: 'sigma' },
      { regex: /\\omega/, name: 'omega' },
      { regex: /\\int/, name: 'integral' },
      { regex: /\\sum/, name: 'summation' },
      { regex: /\\prod/, name: 'product' },
      { regex: /\\lim/, name: 'limit' },
      { regex: /\\frac/, name: 'fraction' },
      { regex: /\\sqrt/, name: 'square_root' },
      { regex: /\\begin\{matrix\}|\\begin\{bmatrix\}|\\begin\{pmatrix\}/, name: 'matrix' },
      { regex: /\\partial/, name: 'partial_derivative' },
      { regex: /\\nabla/, name: 'nabla' },
      { regex: /\\infty/, name: 'infinity' },
      { regex: /\\pm/, name: 'plus_minus' },
      { regex: /\\approx/, name: 'approximately' },
      { regex: /\\equiv/, name: 'equivalent' },
      { regex: /\\leq/, name: 'less_equal' },
      { regex: /\\geq/, name: 'greater_equal' },
      { regex: /\\neq/, name: 'not_equal' }
    ];

    for (const pattern of patterns) {
      if (pattern.regex.test(latexInput)) {
        return `${pattern.name}.${extension}`;
      }
    }

    if (latexInput.length <= 20) {
      const sanitized = latexInput
        .replace(/[^a-zA-Z0-9\s]/g, '_')
        .replace(/\s+/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '')
        .toLowerCase();
      return `${sanitized || 'equation'}.${extension}`;
    } else {
      const hash = this.simpleHash(latexInput);
      return `equation_${hash}.${extension}`;
    }
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36).substring(0, 8);
  }

  private triggerDownload(blob: Blob, filename: string): void {
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(blobUrl);
  }

  onFontSizeInput(event: Event): void {
    const val = parseFloat((event.target as HTMLInputElement).value);
    this.svgFontSize.set(isNaN(val) ? 12 : val);
  }

  onSvgUnitChange(event: Event): void {
    const newUnit = (event.target as HTMLSelectElement).value as 'mm' | 'pt' | 'px';
    const currentPt = this.toPt(this.svgFontSize(), this.svgExportUnit());
    const ptToUnit: Record<string, number> = { mm: 25.4 / 72, pt: 1, px: 96 / 72 };
    const converted = Math.round(currentPt * (ptToUnit[newUnit] ?? 1));
    const ranges: Record<string, { min: number; max: number }> = {
      pt: { min: 6,   max: 72 },
      px: { min: 8,   max: 96 },
      mm: { min: 2,   max: 25 },
    };
    const range = ranges[newUnit] ?? ranges['pt'];
    this.svgExportUnit.set(newUnit);
    this.svgFontSize.set(Math.max(range.min, Math.min(range.max, converted)));
  }

  onPngDpiChange(event: Event): void {
    this.pngDpi.set(parseInt((event.target as HTMLSelectElement).value, 10));
  }

  private scaleSvgForExport(svgText: string, overrideScale?: number): string {
    const scaleFactor = overrideScale ?? this.fontScaleFactor();

    const svgTagMatch = svgText.match(/<svg([^>]*)>/);
    if (!svgTagMatch) return svgText;

    const originalTag = svgTagMatch[0];
    let attrs = svgTagMatch[1];

    const wMatch = attrs.match(/\bwidth=['"]([0-9.]+)[a-z%]*['"]/);
    const hMatch = attrs.match(/\bheight=['"]([0-9.]+)[a-z%]*['"]/);
    if (!wMatch || !hMatch) return svgText;

    const nativeW = parseFloat(wMatch[1]);
    const nativeH = parseFloat(hMatch[1]);
    if (!nativeW || !nativeH) return svgText;

    const ptToPx = 96 / 72;
    const targetW = nativeW * scaleFactor * ptToPx;
    const targetH = nativeH * scaleFactor * ptToPx;

    const coordScale = scaleFactor * ptToPx;

    const vbMatch = attrs.match(/\bviewBox=['"]([^'"]+)['"]/);
    if (vbMatch) {
      const vbParts = vbMatch[1].trim().split(/[\s,]+/).map(Number);
      if (vbParts.length === 4) {
        const newVB = vbParts.map(v => (v * coordScale).toFixed(6)).join(' ');
        attrs = attrs.replace(/\bviewBox=['"][^'"]*['"]/, `viewBox="${newVB}"`);
      }
    } else {
      attrs += ` viewBox="0 0 ${targetW.toFixed(6)} ${targetH.toFixed(6)}"`;
    }

    attrs = attrs
      .replace(/\bwidth=['"][^'"]*['"]/, `width="${targetW.toFixed(3)}px"`)
      .replace(/\bheight=['"][^'"]*['"]/, `height="${targetH.toFixed(3)}px"`);

    let newTag = `<svg${attrs}>`;
    if (!/\bxmlns\s*=/.test(attrs)) {
      newTag = newTag.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
    }

    let result = svgText.replace(originalTag, newTag);

    result = result.replace(
      /(<g\s[^>]*transform=['"])matrix\(([^)]+)\)(['"][^>]*>)/,
      (_match, before, matrixStr, after) => {
        const m = matrixStr.trim().split(/[\s,]+/).map(Number);
        if (m.length === 6) {
          m[0] *= coordScale;
          m[3] *= coordScale;
          m[4] *= coordScale;
          m[5] *= coordScale;
          return `${before}matrix(${m.map(v => v.toFixed(6)).join(' ')})${after}`;
        }
        return _match;
      }
    );

    return result;
  }

  async downloadSvg() {
    if (!this.previewUrl()) return;

    try {
      const svgText = await this.fetchSvgText();
      const scaled = this.scaleSvgForExport(svgText);
      const blob = new Blob([scaled], { type: 'image/svg+xml' });
      this.triggerDownload(blob, this.generateFilename(this.renderedLatex(), 'svg'));
    } catch (error: unknown) {
      console.error('Failed to download SVG:', error);
    }
  }

  async downloadPng() {
    const code = this.renderedLatex().trim();
    if (!code) return;

    try {
      const dpi = this.pngDpi();
      const dpiPrefix = `\\dpi{${dpi}}`;
      const url = `https://latex.codecogs.com/png.image?${encodeURIComponent(dpiPrefix + code)}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`CodeCogs PNG fetch failed: ${response.status}`);
      const blob = await response.blob();
      this.triggerDownload(blob, this.generateFilename(code, 'png'));
    } catch (error: unknown) {
      console.error('Failed to download PNG:', error);
    }
  }

  constructor() {
    // Intentionally left blank.
  }

  @HostListener('document:keydown', ['$event'])
  onGlobalKeyDown(event: KeyboardEvent) {
    const textarea = this.textareaRef()?.nativeElement;
    if (!textarea || document.activeElement === textarea || this.shouldIgnoreGlobalKeydown(event)) {
      return;
    }

    const specialKeys = [
      'Shift', 'Control', 'Alt', 'Meta',
      'CapsLock', 'NumLock', 'ScrollLock',
      'Pause', 'Insert', 'Delete', 'Home', 'End', 'PageUp', 'PageDown',
      'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
      'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12',
      'Escape', 'Tab', 'Enter'
    ];

    if (specialKeys.includes(event.key) || event.ctrlKey || event.altKey || event.metaKey) {
      return;
    }

    event.preventDefault();
    textarea.focus();

    if (event.key.length === 1) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;
      textarea.value = value.substring(0, start) + event.key + value.substring(end);
      textarea.selectionStart = textarea.selectionEnd = start + 1;
      this.latexInput.set(textarea.value);
    }
  }

  private clearRenderedOutput(): void {
    this.svgMetadataController?.abort();
    this.svgMetadataController = null;
    this.previewUrl.set('');
    this.renderedLatex.set('');
    this.svgNativeDims.set(null);
  }

  private shouldIgnoreGlobalKeydown(event: KeyboardEvent): boolean {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return false;

    if (target.closest('app-settings')) return true;
    if (target.closest('input, textarea, select, button, a, [contenteditable="true"], [role="dialog"]')) {
      return true;
    }

    const active = document.activeElement;
    if (!(active instanceof HTMLElement)) return false;

    if (active.closest('app-settings')) return true;
    return !!active.closest('input, textarea, select, button, a, [contenteditable="true"], [role="dialog"]');
  }
}
