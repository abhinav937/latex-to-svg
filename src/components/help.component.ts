import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div class="max-w-5xl mx-auto px-6 py-12">

        <!-- Header -->
        <div class="mb-12">
          <h1 class="text-3xl font-light text-gray-900 dark:text-gray-100 mb-2">Help</h1>
          <p class="text-gray-500 dark:text-gray-400">Learn how to use the LaTeX to SVG generator</p>
        </div>

        <!-- Quick Start -->
        <section class="mb-12">
          <h2 class="text-sm font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">Quick Start</h2>
          <div class="space-y-3 text-gray-700 dark:text-gray-200">
            <p>1. Type your LaTeX code in the editor</p>
            <p>2. Press <kbd class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-sm font-mono">Enter</kbd> to render</p>
            <p>3. Use the action buttons to copy or download</p>
          </div>
        </section>

        <!-- Keyboard Shortcuts -->
        <section class="mb-12">
          <h2 class="text-sm font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">Keyboard Shortcuts</h2>
          <div class="space-y-2">
            <div class="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
              <span class="text-gray-600 dark:text-gray-300">Render equation</span>
              <kbd class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm font-mono text-gray-700 dark:text-gray-200">Enter</kbd>
            </div>
            <div class="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
              <span class="text-gray-600 dark:text-gray-300">New line</span>
              <kbd class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm font-mono text-gray-700 dark:text-gray-200">Shift + Enter</kbd>
            </div>
            <div class="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
              <span class="text-gray-600 dark:text-gray-300">Trigger autocomplete</span>
              <kbd class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm font-mono text-gray-700 dark:text-gray-200">\\</kbd>
            </div>
            <div class="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
              <span class="text-gray-600 dark:text-gray-300">Navigate suggestions</span>
              <kbd class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm font-mono text-gray-700 dark:text-gray-200">↑ ↓</kbd>
            </div>
            <div class="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
              <span class="text-gray-600 dark:text-gray-300">Select suggestion</span>
              <kbd class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm font-mono text-gray-700 dark:text-gray-200">Tab</kbd>
            </div>
            <div class="flex justify-between py-2">
              <span class="text-gray-600 dark:text-gray-300">Close autocomplete</span>
              <kbd class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm font-mono text-gray-700 dark:text-gray-200">Esc</kbd>
            </div>
          </div>
        </section>

        <!-- Autocomplete -->
        <section class="mb-12">
          <h2 class="text-sm font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">Autocomplete</h2>
          <p class="text-gray-600 dark:text-gray-300 mb-4">
            Type <code class="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded font-mono text-sm">\\</code> followed by letters to see suggestions.
            The first 4 suggestions show live previews.
          </p>
          <p class="text-gray-600 dark:text-gray-300 mb-4">265+ commands available including:</p>
          <div class="flex flex-wrap gap-2">
            @for (category of categories; track category) {
              <span class="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm text-gray-600 dark:text-gray-300">{{ category }}</span>
            }
          </div>
        </section>

        <!-- Actions -->
        <section class="mb-12">
          <h2 class="text-sm font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">Actions</h2>
          <div class="space-y-3">
            <div class="flex gap-4">
              <span class="text-gray-900 dark:text-gray-100 font-medium w-32">Copy as Image</span>
              <span class="text-gray-600 dark:text-gray-300">Copy as PNG for Inkscape or other apps</span>
            </div>
            <div class="flex gap-4">
              <span class="text-gray-900 dark:text-gray-100 font-medium w-32">Copy SVG Code</span>
              <span class="text-gray-600 dark:text-gray-300">Copy raw SVG markup</span>
            </div>
            <div class="flex gap-4">
              <span class="text-gray-900 dark:text-gray-100 font-medium w-32">Download SVG</span>
              <span class="text-gray-600 dark:text-gray-300">Save as .svg file</span>
            </div>
          </div>
        </section>

        <!-- Examples -->
        <section class="mb-12">
          <h2 class="text-sm font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">Examples</h2>
          <div class="space-y-4">
            @for (example of examples; track example.label) {
              <div class="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                <code class="text-sm text-gray-700 dark:text-gray-200 font-mono">{{ example.code }}</code>
                <p class="text-xs text-gray-400 dark:text-gray-500 mt-2">{{ example.label }}</p>
              </div>
            }
          </div>
        </section>

        <!-- History -->
        <section class="mb-12">
          <h2 class="text-sm font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">History</h2>
          <p class="text-gray-600 dark:text-gray-300">
            Your last 50 equations are saved locally and shown in the sidebar. Click any to reuse.
          </p>
        </section>

        <!-- Links -->
        <section class="pt-8 border-t border-gray-200 dark:border-gray-700">
          <div class="flex gap-6 text-sm">
            <a href="https://github.com/abhinav937/latex-to-svg" target="_blank" class="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">GitHub</a>
            <a href="https://x.com/emotor" target="_blank" class="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">Contact</a>
            <a routerLink="/changelog" class="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">Changelog</a>
          </div>
        </section>

      </div>
    </div>
  `
})
export class HelpComponent {
  categories = [
    'Greek letters',
    'Math symbols',
    'Text formatting',
    'Arrows',
    'Brackets',
    'Logic & Sets',
    'Functions',
    'Spacing',
    'Colors'
  ];

  examples = [
    { code: '\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}', label: 'Quadratic formula' },
    { code: '\\int_0^\\infty e^{-x} dx', label: 'Integral' },
    { code: '\\sum_{i=1}^n i = \\frac{n(n+1)}{2}', label: 'Summation' }
  ];
}
