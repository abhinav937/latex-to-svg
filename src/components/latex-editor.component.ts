import { Component, inject, signal, computed, ElementRef, viewChild, HostListener } from '@angular/core';
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
               (load)="onPreviewLoad($event)"
               [style.width]="previewDisplayWidth()"
               [style.maxWidth]="'100%'"
               [style.maxHeight]="'200px'"
               class="transition-all duration-300 z-10"
               loading="eager"
               fetchpriority="high"
             />
             <div class="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 text-xs text-gray-400 bg-white/80 px-2 py-1 rounded backdrop-blur-sm border border-gray-200">
                {{ outputSizeLabel() }}
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
             class="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-white border border-gray-300 rounded-lg text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-indigo-300 hover:text-indigo-600 transition-all shadow-sm group">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 group-hover:text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
             </svg>
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

           <button
             (click)="downloadPng()"
             class="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-white border border-gray-300 rounded-lg text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-indigo-300 hover:text-indigo-600 transition-all shadow-sm group">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 group-hover:text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
             </svg>
             <span class="truncate">Download PNG</span>
           </button>

           <!-- Output Size -->
           <div class="pt-3 sm:pt-4 border-t border-gray-200">
             <div class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5">Output Size</div>

             <!-- SVG Width Slider -->
             <div class="mb-3">
               <div class="flex items-center justify-between mb-1.5">
                 <span class="text-xs text-gray-500">SVG width</span>
                 <div class="flex items-center gap-1">
                   <span class="text-xs font-semibold text-indigo-600 min-w-[2.5rem] text-right tabular-nums">{{ svgExportWidth() }}</span>
                   <select
                     (change)="onSvgUnitChange($event)"
                     class="px-1.5 py-0.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-700"
                   >
                     <option value="px" [selected]="svgExportUnit() === 'px'">px</option>
                     <option value="mm" [selected]="svgExportUnit() === 'mm'">mm</option>
                     <option value="pt" [selected]="svgExportUnit() === 'pt'">pt</option>
                   </select>
                 </div>
               </div>
               <input
                 type="range"
                 [attr.min]="sliderConfig().min"
                 [attr.max]="sliderConfig().max"
                 [attr.step]="sliderConfig().step"
                 [value]="svgExportWidth()"
                 (input)="onSvgWidthInput($event)"
                 class="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-indigo-600 bg-gray-200"
               />
               <!-- Live height readout — shown once the SVG aspect ratio is known -->
               @if (svgAspectRatio()) {
                 <div class="text-xs text-gray-400 mt-1">
                   h ≈ {{ (svgExportWidth() / svgAspectRatio()!).toFixed(1) }} {{ svgExportUnit() }}
                 </div>
               }
             </div>

             <!-- PNG DPI -->
             <div class="flex items-center gap-1.5">
               <span class="text-xs text-gray-500 w-8 flex-shrink-0">PNG</span>
               <select
                 (change)="onPngDpiChange($event)"
                 class="flex-1 px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-700"
               >
                 <option value="72"  [selected]="pngDpi() === 72">72 dpi</option>
                 <option value="96"  [selected]="pngDpi() === 96">96 dpi</option>
                 <option value="150" [selected]="pngDpi() === 150">150 dpi</option>
                 <option value="300" [selected]="pngDpi() === 300">300 dpi</option>
                 <option value="600" [selected]="pngDpi() === 600">600 dpi</option>
               </select>
             </div>
           </div>

           <div class="pt-3 sm:pt-4 border-t border-gray-200">
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
          <span class="text-xs">
            <kbd class="px-1 py-0.5 bg-gray-200 rounded text-gray-600">Enter</kbd> to render
            <span class="mx-2 text-gray-300">·</span>
            <kbd class="px-1 py-0.5 bg-gray-200 rounded text-gray-600">\\</kbd> for autocomplete
          </span>
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

  // Output size / DPI
  svgExportWidth = signal<number>(12);
  svgExportUnit = signal<'mm' | 'pt' | 'px'>('px');
  pngDpi = signal<number>(150);

  /** Native SVG dimensions in pt, parsed from actual SVG source for accurate h≈ readout. */
  private svgNativeDims = signal<{ wPt: number; hPt: number } | null>(null);

  /** Aspect ratio (w/h) from the SVG's real pt dimensions — dimensionless and unit-safe. */
  readonly svgAspectRatio = computed<number | null>(() => {
    const d = this.svgNativeDims();
    return d && d.wPt && d.hPt ? d.wPt / d.hPt : null;
  });

  /** Slider min/max/step that adapts to the currently selected unit. */
  readonly sliderConfig = computed(() => {
    const unit = this.svgExportUnit();
    const configs: Record<string, { min: number; max: number; step: number }> = {
      px: { min: 1,   max: 800, step: 1   },
      mm: { min: 0.5, max: 300, step: 0.5 },
      pt: { min: 1,   max: 800, step: 1   },
    };
    return configs[unit] ?? { min: 1, max: 800, step: 1 };
  });

  onPreviewLoad(_event: Event): void {
    // no-op: aspect ratio is now derived from SVG source (see renderLatex background fetch)
  }

  /**
   * Converts the user's target export width to approximate CSS pixels for the
   * live preview image. Uses 96dpi as the screen baseline (standard CSS spec).
   * Clamped so the preview stays readable at extreme values.
   * Reactive computed signal — re-runs automatically when width or unit changes.
   */
  readonly previewDisplayWidth = computed<string | undefined>(() => {
    const w = this.svgExportWidth();
    const unit = this.svgExportUnit();
    const pxPerUnit: Record<string, number> = { mm: 3.7795, pt: 1.3333, px: 1 };
    const px = w * (pxPerUnit[unit] ?? 1);
    return `${Math.max(30, Math.min(380, px))}px`;
  });

  /**
   * Live badge label shown in the preview corner — e.g. "50 × 176.1 px".
   */
  readonly outputSizeLabel = computed<string>(() => {
    const w = this.svgExportWidth();
    const unit = this.svgExportUnit();
    const ratio = this.svgAspectRatio();
    const h = ratio ? (w / ratio).toFixed(1) : '—';
    return `${w} × ${h} ${unit}`;
  });

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

  // Maximum LaTeX input length to prevent DoS
  private readonly MAX_LATEX_LENGTH = 5000;

  // Examples for quick start
  examples = [
    { label: 'Text', code: '\\text{Buck Converter}' },
    { label: 'Greek', code: '\\eta = \\frac{P_{out}}{P_{in}}' },
    { label: 'Equation', code: 'P = V \\cdot I' },
    { label: 'Fraction', code: '\\frac{V_{out}}{V_{in}} = D' },
    { label: 'State Space', code: '\\dot{x} = \\begin{bmatrix} 0 & -\\frac{1}{L} \\\\ \\frac{1}{C} & -\\frac{1}{RC} \\end{bmatrix} x + \\begin{bmatrix} \\frac{1}{L} \\\\ 0 \\end{bmatrix} u' }
  ];

  async renderLatex() {
    const code = this.latexInput().trim();
    if (!code) {
      this.previewUrl.set('');
      return;
    }

    // Validate input length to prevent DoS
    if (code.length > this.MAX_LATEX_LENGTH) {
      console.warn(`LaTeX input exceeds maximum length of ${this.MAX_LATEX_LENGTH} characters.`);
      return;
    }

    // Check rate limit
    if (!this.rateLimiter.canMakeRequest('codecogs', this.CODECOGS_RATE_LIMIT)) {
      console.warn('CodeCogs API rate limit exceeded. Please wait before rendering again.');
      return;
    }

    this.isRendering.set(true);
    try {
      // Use the current svg.image endpoint (svg.latex is the legacy endpoint).
      // No size command — CodeCogs renders at 10pt (normalsize) by default.
      // Physical sizing for export/copy is handled entirely in svgToPngBlob.
      const url = `https://latex.codecogs.com/svg.image?${encodeURIComponent(code)}`;
      this.previewUrl.set(url);

      // Background: fetch SVG source to extract real pt dimensions for accurate h≈ readout.
      // img.naturalWidth/naturalHeight can be unreliable for cross-origin SVGs — parsing the
      // actual wPt/hPt values is dimensionless-correct for all unit modes.
      this.fetchSvgText().then(svgText => {
        const svgTagMatch = svgText.match(/<svg([^>]*)>/);
        if (!svgTagMatch) return;
        const wMatch = svgTagMatch[1].match(/\bwidth=['"]([0-9.]+)[a-z%]*['"]/);
        const hMatch = svgTagMatch[1].match(/\bheight=['"]([0-9.]+)[a-z%]*['"]/);
        if (wMatch && hMatch) {
          this.svgNativeDims.set({ wPt: parseFloat(wMatch[1]), hPt: parseFloat(hMatch[1]) });
        }
      }).catch(() => { /* silent — h≈ stays hidden if fetch fails */ });

      // Add to history after successful render
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

  /**
   * Fetches the current equation as raw SVG text using CodeCogs' JSON endpoint.
   *
   * Why JSON instead of fetching the svg.image? URL directly:
   *  - The JSON endpoint returns the SVG pre-encoded as base64, so no CORS
   *    issues and no intermediate blob-URL workaround required.
   *  - Response shape: { "latex": { "base64": "<base64-svg>", ... } }
   *  - The base64 is UTF-8 SVG text; we decode via TextDecoder for safety.
   */
  private async fetchSvgText(): Promise<string> {
    const code = this.latexInput().trim();
    if (!code) throw new Error('No LaTeX to fetch');

    const url = `https://latex.codecogs.com/svg.json?${encodeURIComponent(code)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`CodeCogs JSON fetch failed: ${response.status}`);

    const json = await response.json();
    const base64 = json?.latex?.base64;
    if (!base64) throw new Error('No base64 field in CodeCogs JSON response');

    // Decode base64 → UTF-8 SVG string
    const binaryStr = atob(base64);
    const bytes = Uint8Array.from(binaryStr, c => c.charCodeAt(0));
    return new TextDecoder('utf-8').decode(bytes);
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
      const svgText = this.scaleSvg(await this.fetchSvgText());
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
      const svgText = this.scaleSvg(await this.fetchSvgText());
      const svgBlob = new Blob([svgText], { type: 'image/svg+xml' });

      if ('supports' in ClipboardItem && ClipboardItem.supports('image/svg+xml')) {
        // Modern Chrome/Edge: native SVG clipboard support — pastes as editable
        // vectors in Inkscape, Illustrator, Figma etc.
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/svg+xml': svgBlob })
        ]);
      } else {
        // Fallback: intercept the native copy event so we can set image/svg+xml
        // via event.clipboardData, bypassing the Async Clipboard API MIME whitelist.
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

  private generateFilename(latexInput: string, extension: string): string {
    // Common LaTeX patterns and their readable names
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

    // Find the first matching pattern
    for (const pattern of patterns) {
      if (pattern.regex.test(latexInput)) {
        return `${pattern.name}.${extension}`;
      }
    }

    // If no specific pattern found, create a generic name based on length
    if (latexInput.length <= 20) {
      // Use the LaTeX content directly, sanitized
      const sanitized = latexInput
        .replace(/[^a-zA-Z0-9\s]/g, '_') // Replace special chars with underscores
        .replace(/\s+/g, '_') // Replace spaces with underscores
        .replace(/_+/g, '_') // Collapse multiple underscores
        .replace(/^_|_$/g, '') // Remove leading/trailing underscores
        .toLowerCase();
      return sanitized || 'equation';
    } else {
      // For longer expressions, use a hash-based name
      const hash = this.simpleHash(latexInput);
      return `equation_${hash}.${extension}`;
    }
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36).substring(0, 8);
  }

  /**
   * Triggers a file download using a temporary anchor element
   */
  private triggerDownload(blob: Blob, filename: string): void {
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(blobUrl);
  }

  onSvgWidthInput(event: Event): void {
    const val = parseFloat((event.target as HTMLInputElement).value);
    this.svgExportWidth.set(isNaN(val) ? 12 : val);
  }

  onSvgUnitChange(event: Event): void {
    const newUnit = (event.target as HTMLSelectElement).value as 'mm' | 'pt' | 'px';
    // Convert current value to the new unit so the physical size stays the same
    const currentPx = this.toPixels(this.svgExportWidth(), this.svgExportUnit());
    const factors: Record<string, number> = { mm: 3.7795275591, pt: 1.3333333333, px: 1 };
    const converted = +(currentPx / (factors[newUnit] ?? 1)).toFixed(1);
    this.svgExportWidth.set(converted);
    this.svgExportUnit.set(newUnit);
  }

  onPngDpiChange(event: Event): void {
    this.pngDpi.set(parseInt((event.target as HTMLSelectElement).value, 10));
  }

  /**
   * Scales an SVG to the user's chosen physical width, preserving aspect ratio.
   *
   * How SVG sizing works:
   *   - width/height attrs define the physical output size (what Inkscape puts on canvas)
   *   - viewBox defines the internal coordinate space the paths live in
   *   - Changing width/height while leaving viewBox untouched causes the renderer
   *     to map the coordinate space to the new physical size — correct scaling
   *
   * Why we only touch the <svg> opening tag:
   *   - \bwidth would also match stroke-width inside <path> / <style> elements
   *   - We isolate just the opening tag, do replacements there, then splice it back
   *
   * CodeCogs SVGs always use pt units (e.g. width='6.943783pt') and the viewBox
   * coordinates match those pt values, so the aspect ratio is simply wPt / hPt.
   */
  /**
   * Converts a user-specified value in mm/pt/px to CSS pixels at 96dpi.
   * 96dpi is the CSS standard and Inkscape 1.x's internal unit baseline.
   */
  private toPixels(value: number, unit: 'mm' | 'pt' | 'px'): number {
    const factors: Record<string, number> = { mm: 3.7795275591, pt: 1.3333333333, px: 1 };
    return value * (factors[unit] ?? 1);
  }

  /**
   * Scales an SVG to the user's chosen physical width and always outputs
   * dimensions in px — never mm or pt.
   *
   * WHY px only:
   *   When Inkscape receives an SVG via clipboard paste it uses its internal
   *   96dpi px coordinate system. If the SVG says width='50mm', some versions
   *   of Inkscape strip the unit during clipboard import and treat '50' as px
   *   (≈13mm), so the pasted object appears the same tiny size as the original.
   *   Outputting width='188.976px' is unambiguous — no unit conversion needed
   *   at paste time — and 188.976px / 96dpi * 25.4 = exactly 50mm on canvas.
   *
   * WHY viewBox is untouched:
   *   The SVG spec says the renderer maps viewBox coords to the physical
   *   width/height. CodeCogs' viewBox is already in pt coords that match the
   *   original width/height numerically. Changing only width/height lets the
   *   renderer scale the paths automatically — no path data recalculation needed.
   *
   * WHY we scope to the opening <svg> tag:
   *   A global /\bwidth/ regex would also match stroke-width in <path> / <style>
   *   elements. We extract just the <svg ...> opening tag, operate on that
   *   string slice, then splice it back.
   */
  private scaleSvg(svgText: string): string {
    const targetWidth = this.svgExportWidth();
    if (!targetWidth) return svgText; // auto — no-op

    const unit = this.svgExportUnit();

    // Extract only the opening <svg ...> tag
    const svgTagMatch = svgText.match(/<svg([^>]*)>/);
    if (!svgTagMatch) return svgText;

    const originalTag = svgTagMatch[0];
    const attrs = svgTagMatch[1];

    // Parse original pt dimensions (CodeCogs always outputs pt)
    const wMatch = attrs.match(/\bwidth=['"]([0-9.]+)[a-z%]*['"]/);
    const hMatch = attrs.match(/\bheight=['"]([0-9.]+)[a-z%]*['"]/);
    if (!wMatch || !hMatch) return svgText;

    const wPt = parseFloat(wMatch[1]);
    const hPt = parseFloat(hMatch[1]);
    if (!wPt || !hPt) return svgText;

    // Convert target to px — always px in output for Inkscape clipboard reliability
    const targetWidthPx  = +this.toPixels(targetWidth, unit).toFixed(3);
    const targetHeightPx = +(targetWidthPx / (wPt / hPt)).toFixed(3);

    const newAttrs = attrs
      .replace(/\bwidth=['"][^'"]*['"]/, `width='${targetWidthPx}px'`)
      .replace(/\bheight=['"][^'"]*['"]/, `height='${targetHeightPx}px'`);

    return svgText.replace(originalTag, `<svg${newAttrs}>`);
  }

  async downloadSvg() {
    if (!this.previewUrl()) return;

    try {
      const svgText = await this.fetchSvgText();
      const scaled = this.scaleSvg(svgText);
      const blob = new Blob([scaled], { type: 'image/svg+xml' });
      this.triggerDownload(blob, this.generateFilename(this.latexInput(), 'svg'));
    } catch (error: unknown) {
      console.error('Failed to download SVG:', error);
    }
  }

  async downloadPng() {
    const code = this.latexInput().trim();
    if (!code) return;

    try {
      // Prepend \dpi{N} so CodeCogs renders at the chosen resolution
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
    // Check URL query params for feature flags
    const params = new URLSearchParams(window.location.search);
    if (params.get('ai') === 'true') {
      this.features.AI_FIX = true;
    }
  }

  @HostListener('document:keydown', ['$event'])
  onGlobalKeyDown(event: KeyboardEvent) {
    // Skip if the textarea is already focused
    const textarea = this.textareaRef()?.nativeElement;
    if (!textarea || document.activeElement === textarea) {
      return;
    }

    // Skip modifier keys and special keys
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

    // Focus the textarea and prevent default behavior
    event.preventDefault();
    textarea.focus();

    // If it's a printable character, insert it into the textarea
    if (event.key.length === 1) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;
      textarea.value = value.substring(0, start) + event.key + value.substring(end);
      textarea.selectionStart = textarea.selectionEnd = start + 1;
      this.latexInput.set(textarea.value);
    }
  }
}