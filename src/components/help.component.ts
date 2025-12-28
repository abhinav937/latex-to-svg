import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50">
      <div class="max-w-5xl mx-auto px-6 py-12">

        <!-- Header -->
        <div class="mb-12">
          <h1 class="text-3xl font-light text-gray-900 mb-2">Help</h1>
          <p class="text-gray-500">Learn how to use the LaTeX to SVG generator</p>
        </div>

        <!-- Quick Start -->
        <section class="mb-12">
          <h2 class="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Quick Start</h2>
          <div class="space-y-3 text-gray-700">
            <p>1. Type your LaTeX code in the editor</p>
            <p>2. Press <kbd class="px-2 py-1 bg-gray-200 rounded text-sm font-mono">Enter</kbd> to render</p>
            <p>3. Use the action buttons to copy or download</p>
          </div>
        </section>

        <!-- Keyboard Shortcuts -->
        <section class="mb-12">
          <h2 class="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Keyboard Shortcuts</h2>
          <div class="space-y-2">
            <div class="flex justify-between py-2 border-b border-gray-100">
              <span class="text-gray-600">Render equation</span>
              <kbd class="px-2 py-1 bg-gray-100 rounded text-sm font-mono text-gray-700">Enter</kbd>
            </div>
            <div class="flex justify-between py-2 border-b border-gray-100">
              <span class="text-gray-600">New line</span>
              <kbd class="px-2 py-1 bg-gray-100 rounded text-sm font-mono text-gray-700">Shift + Enter</kbd>
            </div>
            <div class="flex justify-between py-2 border-b border-gray-100">
              <span class="text-gray-600">Trigger autocomplete</span>
              <kbd class="px-2 py-1 bg-gray-100 rounded text-sm font-mono text-gray-700">\\</kbd>
            </div>
            <div class="flex justify-between py-2 border-b border-gray-100">
              <span class="text-gray-600">Navigate suggestions</span>
              <kbd class="px-2 py-1 bg-gray-100 rounded text-sm font-mono text-gray-700">↑ ↓</kbd>
            </div>
            <div class="flex justify-between py-2 border-b border-gray-100">
              <span class="text-gray-600">Select suggestion</span>
              <kbd class="px-2 py-1 bg-gray-100 rounded text-sm font-mono text-gray-700">Tab</kbd>
            </div>
            <div class="flex justify-between py-2">
              <span class="text-gray-600">Close autocomplete</span>
              <kbd class="px-2 py-1 bg-gray-100 rounded text-sm font-mono text-gray-700">Esc</kbd>
            </div>
          </div>
        </section>

        <!-- Autocomplete -->
        <section class="mb-12">
          <h2 class="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Autocomplete</h2>
          <p class="text-gray-600 mb-4">
            Type <code class="px-1.5 py-0.5 bg-gray-100 rounded font-mono text-sm">\\</code> followed by letters to see suggestions.
            The first 4 suggestions show live previews.
          </p>
          <p class="text-gray-600 mb-4">265+ commands available including:</p>
          <div class="flex flex-wrap gap-2">
            @for (category of categories; track category) {
              <span class="px-3 py-1 bg-white border border-gray-200 rounded-full text-sm text-gray-600">{{ category }}</span>
            }
          </div>
        </section>

        <!-- Actions -->
        <section class="mb-12">
          <h2 class="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Actions</h2>
          <div class="space-y-3">
            <div class="flex gap-4">
              <span class="text-gray-900 font-medium w-32">Copy as Image</span>
              <span class="text-gray-600">Copy as PNG for Inkscape or other apps</span>
            </div>
            <div class="flex gap-4">
              <span class="text-gray-900 font-medium w-32">Copy SVG Code</span>
              <span class="text-gray-600">Copy raw SVG markup</span>
            </div>
            <div class="flex gap-4">
              <span class="text-gray-900 font-medium w-32">Download SVG</span>
              <span class="text-gray-600">Save as .svg file</span>
            </div>
          </div>
        </section>

        <!-- Examples -->
        <section class="mb-12">
          <h2 class="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Examples</h2>
          <div class="space-y-4">
            @for (example of examples; track example.label) {
              <div class="p-4 bg-white border border-gray-200 rounded-lg">
                <code class="text-sm text-gray-700 font-mono">{{ example.code }}</code>
                <p class="text-xs text-gray-400 mt-2">{{ example.label }}</p>
              </div>
            }
          </div>
        </section>

        <!-- History -->
        <section class="mb-12">
          <h2 class="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">History</h2>
          <p class="text-gray-600">
            Your last 50 equations are saved locally and shown in the sidebar. Click any to reuse.
          </p>
        </section>

        <!-- Links -->
        <section class="pt-8 border-t border-gray-200">
          <div class="flex gap-6 text-sm">
            <a href="https://github.com/abhinav937/latex-to-svg" target="_blank" class="text-gray-500 hover:text-gray-900 transition-colors">GitHub</a>
            <a href="https://x.com/abhinav_937" target="_blank" class="text-gray-500 hover:text-gray-900 transition-colors">Contact</a>
            <a routerLink="/changelog" class="text-gray-500 hover:text-gray-900 transition-colors">Changelog</a>
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
