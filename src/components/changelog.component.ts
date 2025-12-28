import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface ChangelogEntry {
  version: string;
  date: string;
  changes: string[];
}

@Component({
  selector: 'app-changelog',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen bg-gray-50">
      <div class="max-w-5xl mx-auto px-6 py-12">

        <!-- Header -->
        <div class="mb-12">
          <h1 class="text-3xl font-light text-gray-900 mb-2">Changelog</h1>
          <p class="text-gray-500">What's new in LaTeX to SVG</p>
        </div>

        <!-- Entries -->
        <div class="space-y-12">
          @for (entry of changelog; track entry.version) {
            <section>
              <div class="flex items-baseline gap-3 mb-4">
                <h2 class="text-lg font-medium text-gray-900">{{ entry.version }}</h2>
                <span class="text-sm text-gray-400">{{ entry.date }}</span>
              </div>
              <ul class="space-y-2">
                @for (change of entry.changes; track change) {
                  <li class="text-gray-600 pl-4 border-l-2 border-gray-200">{{ change }}</li>
                }
              </ul>
            </section>
          }
        </div>

        <!-- Links -->
        <section class="pt-12 mt-12 border-t border-gray-200">
          <div class="flex gap-6 text-sm">
            <a href="https://github.com/abhinav937/latex-to-svg" target="_blank" class="text-gray-500 hover:text-gray-900 transition-colors">GitHub</a>
            <a routerLink="/help" class="text-gray-500 hover:text-gray-900 transition-colors">Help</a>
            <a routerLink="/" class="text-gray-500 hover:text-gray-900 transition-colors">Back to app</a>
          </div>
        </section>

      </div>
    </div>
  `
})
export class ChangelogComponent {
  changelog: ChangelogEntry[] = [
    {
      version: "2.1.0",
      date: "Dec 28, 2025",
      changes: [
        "Added Copy as Image feature for pasting into Inkscape",
        "Press Enter to render instead of clicking button",
        "Autocomplete now shows live previews for first 4 suggestions",
        "Added 125+ new LaTeX commands including text formatting, colors, brackets",
        "Example chips now always visible below textarea",
        "Fixed Download SVG opening in new tab",
        "Fixed history previews display issue"
      ]
    },
    {
      version: "2.0.0",
      date: "Dec 2025",
      changes: [
        "Converted to Angular components with proper routing",
        "Added Help and Changelog pages",
        "Improved layout consistency across all pages",
        "Fixed duplicate header and scrolling issues"
      ]
    },
    {
      version: "1.5.0",
      date: "Nov 2025",
      changes: [
        "Redesigned autocomplete with Material Design 3 styling",
        "Horizontal layout for autocomplete items",
        "Improved autocomplete positioning below text box",
        "Custom scrollbar styling"
      ]
    },
    {
      version: "1.4.0",
      date: "Oct 2025",
      changes: [
        "History preserves text size when clicking saved equations",
        "Added text size display in history items",
        "Same equation can be saved with different text sizes",
        "Enhanced SEO meta tags",
        "Removed usage statistics tracking for privacy"
      ]
    },
    {
      version: "1.3.0",
      date: "Aug 2025",
      changes: [
        "Added custom domain support",
        "Updated web app manifest for better PWA experience",
        "Added site icons and branding"
      ]
    },
    {
      version: "1.0.0",
      date: "Jul 2025",
      changes: [
        "Initial release",
        "Real-time LaTeX to SVG conversion",
        "Drag-and-drop interface",
        "Responsive design",
        "Comprehensive LaTeX command support"
      ]
    }
  ];
}
