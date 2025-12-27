import { Component, inject, signal, computed } from '@angular/core';
import { GeminiService } from '../services/gemini.service';
import { HistoryService } from '../services/history.service';

@Component({
  selector: 'app-latex-editor',
  standalone: true,
  template: `
    <div class="flex flex-col h-full gap-6 p-6 max-w-4xl mx-auto">
      
      <!-- Preview Section -->
      <div class="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden flex flex-col md:flex-row min-h-[250px]">
        <div class="flex-1 p-8 latex-preview-container flex items-center justify-center relative bg-gray-50">
           @if (latexInput()) {
             <img 
               [src]="previewUrl()" 
               alt="LaTeX Preview" 
               class="max-w-full max-h-[200px] transition-all duration-300 z-10"
             />
             <div class="absolute bottom-3 right-3 text-xs text-gray-400 bg-white/80 px-2 py-1 rounded backdrop-blur-sm border border-gray-200">
                SVG Preview
             </div>
           } @else {
             <div class="text-center text-gray-400">
               <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
               </svg>
               <p>Enter LaTeX code to preview</p>
             </div>
           }
        </div>
        
        <!-- Quick Actions / Info -->
        <div class="w-full md:w-64 bg-gray-50 border-t md:border-t-0 md:border-l border-gray-200 p-5 flex flex-col gap-4">
           <div class="text-sm font-semibold text-gray-600 uppercase tracking-wider">Quick Actions</div>
           
           <button 
             (click)="copySvgUrl()"
             class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-indigo-300 hover:text-indigo-600 transition-all shadow-sm group">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400 group-hover:text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
             </svg>
             {{ copiedUrl() ? 'Copied URL!' : 'Copy URL' }}
           </button>

           <button 
             (click)="copySvgCode()"
             class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-indigo-300 hover:text-indigo-600 transition-all shadow-sm group">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400 group-hover:text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
             </svg>
             {{ copiedSvg() ? 'Copied SVG!' : 'Copy SVG Code' }}
           </button>

           <button 
             (click)="downloadSvg()"
             class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-indigo-300 hover:text-indigo-600 transition-all shadow-sm group">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400 group-hover:text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
             </svg>
             Download SVG
           </button>

           <div class="mt-auto pt-4 border-t border-gray-200">
             <p class="text-xs text-gray-500 leading-relaxed">
               Uses <span class="font-semibold text-gray-700">CodeCogs API</span> for rendering.
             </p>
           </div>
        </div>
      </div>

      <!-- Editor Section -->
      <div class="flex-1 min-h-0 flex flex-col gap-3">
        <div class="flex justify-between items-center">
          <label class="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            LaTeX Input
          </label>
          
          <button 
            (click)="fixWithAi()"
            [disabled]="isAiLoading() || !latexInput()"
            class="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-md text-xs font-semibold hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            @if (isAiLoading()) {
              <svg class="animate-spin h-3 w-3 text-indigo-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Fixing...
            } @else {
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Fix with AI
            }
          </button>
        </div>

        <div class="relative group">
          <textarea 
            [value]="latexInput()"
            (input)="updateLatex($event)"
            class="w-full h-32 p-4 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none font-mono text-sm shadow-sm transition-all"
            placeholder="\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}"
          ></textarea>
          
          <!-- Example Chips Overlay (if empty) -->
          @if (!latexInput()) {
            <div class="absolute top-14 left-4 right-4 flex flex-wrap gap-2 pointer-events-none">
              @for (ex of examples; track ex.label) {
                <button 
                  (click)="setLatex(ex.code)" 
                  class="pointer-events-auto px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs rounded-full border border-gray-200 transition-colors shadow-sm"
                >
                  {{ ex.label }}
                </button>
              }
            </div>
          }
        </div>
        
        <div class="flex justify-between items-center text-xs text-gray-500 px-1">
          <span>Supported: Standard LaTeX math syntax</span>
          <span>{{ latexInput().length }} chars</span>
        </div>
      </div>
    </div>
  `
})
export class LatexEditorComponent {
  private geminiService = inject(GeminiService);
  private historyService = inject(HistoryService);

  latexInput = signal('');
  isAiLoading = signal(false);
  copiedUrl = signal(false);
  copiedSvg = signal(false);

  // Examples for quick start
  examples = [
    { label: 'Quadratic', code: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}' },
    { label: 'Integral', code: '\\int_{a}^{b} x^2 \\,dx' },
    { label: 'Matrix', code: '\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}' },
    { label: 'Summation', code: '\\sum_{i=0}^n i^2 = \\frac{(n^2+n)(2n+1)}{6}' }
  ];

  previewUrl = computed(() => {
    const code = this.latexInput();
    if (!code) return '';
    // Encode and add some styling for better visibility
    return `https://latex.codecogs.com/svg.latex?\\huge ${encodeURIComponent(code)}`;
  });

  updateLatex(event: Event) {
    const input = event.target as HTMLTextAreaElement;
    this.latexInput.set(input.value);
  }

  setLatex(code: string) {
    this.latexInput.set(code);
    this.historyService.addToHistory(code);
  }

  async fixWithAi() {
    if (!this.latexInput()) return;
    
    this.isAiLoading.set(true);
    try {
      const fixed = await this.geminiService.fixLatex(this.latexInput());
      if (fixed) {
        this.latexInput.set(fixed);
        this.historyService.addToHistory(fixed);
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

  downloadSvg() {
    const url = this.previewUrl();
    if (!url) return;
    
    // Create a temporary link to download
    const link = document.createElement('a');
    link.href = url;
    link.download = 'equation.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  constructor() {}
}