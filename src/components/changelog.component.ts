import { Component } from '@angular/core';

interface ChangelogEntry {
  date: string;
  sections: { [key: string]: string[] };
}

@Component({
  selector: 'app-changelog',
  standalone: true,
  template: `
    <div class="bg-gray-50 min-h-[calc(100vh-4rem)] py-6 sm:py-8 overflow-y-auto">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 w-full">
        <div class="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 md:p-8 lg:p-12">
          <div class="text-center mb-8 sm:mb-12">
            <h1 class="text-2xl sm:text-3xl md:text-4xl font-light text-gray-800 mb-3 sm:mb-4 px-2">Latest updates for LaTeX to SVG Generator</h1>
            <p class="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-2">See what's new in LaTeX to SVG Generator. Here you'll find information about all the latest updates, new features, improvements, and bug fixes.</p>
          </div>

          <div class="space-y-6 sm:space-y-8">
            @for (entry of changelogData; track entry.date) {
              <div class="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6 md:p-8 border border-gray-200 shadow-sm">
                <div class="text-lg sm:text-xl font-medium text-indigo-600 mb-4 sm:mb-6 pb-2 border-b border-gray-200">
                  {{ entry.date }}
                </div>
                
                @for (section of getSectionEntries(entry.sections); track section.title) {
                  <div class="mb-4 sm:mb-6 last:mb-0">
                    <div class="text-sm sm:text-base font-semibold text-gray-800 mb-2 sm:mb-3 uppercase tracking-wide">
                      {{ section.title }}
                    </div>
                    <ul class="space-y-2 list-none pl-0">
                      @for (item of section.items; track item) {
                        <li class="relative pl-5 sm:pl-6 text-sm sm:text-base text-gray-700 leading-relaxed">
                          <span class="absolute left-0 text-indigo-600 font-bold text-base sm:text-lg leading-none top-0.5">•</span>
                          {{ item }}
                        </li>
                      }
                    </ul>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Back to Top -->
          <div class="text-center mt-8 sm:mt-12 pt-4 sm:pt-6 border-t border-gray-200">
            <button (click)="scrollToTop()" class="text-sm sm:text-base text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
              ↑ Back to Top
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ChangelogComponent {
  changelogData: ChangelogEntry[] = [
    {
      date: "Dec 28, 2025",
      sections: {
        "New Features": [
          "Added 'Copy as Image' feature - copy rendered equations as PNG for pasting into Inkscape or other apps",
          "Press Enter to render LaTeX (no need to click the button)",
          "Autocomplete now shows live preview images for the first 4 suggestions",
          "Added 125+ new LaTeX commands to autocomplete including \\textsubscript, \\textsuperscript, colors, brackets, spacing, and more",
          "Quick example chips (Quadratic, Integral, Matrix, Summation) now always visible below textarea"
        ],
        "UI Improvements": [
          "Moved autocomplete suggestions outside the textarea for better visibility",
          "Tab key now selects autocomplete suggestion (Enter is for rendering)",
          "Added preview caching to reduce API requests for autocomplete previews"
        ],
        "Bug Fixes": [
          "Fixed Download SVG opening in new tab instead of downloading",
          "Fixed history previews showing 'small' text prefix"
        ]
      }
    },
    {
      date: "Dec 2025",
      sections: {
        "New Features": [
          "Converted Help and Changelog pages to Angular components",
          "Added Angular Router for seamless navigation between pages",
          "Added navigation links in header for Help and Changelog pages"
        ],
        "UI Improvements": [
          "Improved page layout with consistent header across all routes",
          "Enhanced scrolling behavior for Help and Changelog pages",
          "Maintained consistent styling across all pages using Tailwind CSS"
        ],
        "Bug Fixes": [
          "Fixed duplicate header issue",
          "Fixed scrolling issues on Help and Changelog pages",
          "Removed migration-related references from header"
        ],
        "Technical Improvements": [
          "Migrated from standalone HTML pages to Angular component architecture",
          "Implemented proper routing structure with layout component",
          "Improved code organization and maintainability"
        ]
      }
    },
    {
      date: "Nov 2025",
      sections: {
        "New Features": [
          "Redesigned autocomplete shortcuts with modern Material Design 3 styling",
          "Horizontal layout for autocomplete items showing preview, code, badge, and description in a single row",
          "Enhanced autocomplete positioning - now appears strictly below the text box with proper spacing",
          "Improved autocomplete styling with rounded corners and refined borders"
        ],
        "UI Improvements": [
          "Modernized autocomplete dropdown with 16px rounded corners",
          "Cleaner badge design - removed category badges (GREEK, LOGIC, etc.), keeping only math mode indicators",
          "Refined border styling with subtle shadows for better visual hierarchy",
          "Custom scrollbar styling with rounded corners for autocomplete dropdown"
        ],
        "Bug Fixes": [
          "Fixed autocomplete overlapping text box - now positions correctly below input field",
          "Removed unnecessary console log messages for cleaner developer experience"
        ]
      }
    },
    {
      date: "Oct 24, 2025",
      sections: {
        "New Features": [
          "History now preserves and restores text size when clicking on saved equations",
          "Added text size display in history items (shows point size like '12pt', '24pt')",
          "Same LaTeX equation can now be saved multiple times with different text sizes",
          "Added comprehensive changelog page",
          "Improved page navigation with changelog link",
          "Enhanced SEO meta tags for better discoverability"
        ],
        "Privacy & Performance Improvements": [
          "Removed website content caching from service worker",
          "Eliminated usage statistics tracking",
          "Simplified persistent storage to only history feature",
          "Enhanced privacy by removing unnecessary data collection"
        ],
        "Bug Fixes": [
          "Fixed minor styling inconsistencies across pages",
          "Resolved navigation link alignment issues"
        ]
      }
    },
    {
      date: "Aug 26, 2025",
      sections: {
        "New Features": [
          "Added CNAME configuration for custom domain",
          "Enhanced site deployment and hosting setup"
        ]
      }
    },
    {
      date: "Aug 04, 2025",
      sections: {
        "New Features": [
          "Updated web app manifest for better PWA experience",
          "Added comprehensive site icons and branding"
        ],
        "Bug Fixes": [
          "Fixed multiple UI and functionality issues",
          "Improved overall stability and performance"
        ]
      }
    },
    {
      date: "Jul 15, 2025",
      sections: {
        "New Features": [
          "Launched LaTeX to SVG Generator web application",
          "Implemented real-time LaTeX to SVG conversion",
          "Added drag-and-drop LaTeX input interface",
          "Integrated Google Analytics for usage tracking"
        ],
        "Improvements": [
          "Optimized page load performance",
          "Enhanced user interface with Material Design components",
          "Added comprehensive LaTeX command support",
          "Implemented responsive design principles"
        ]
      }
    }
  ];

  getSectionEntries(sections: { [key: string]: string[] }): { title: string; items: string[] }[] {
    return Object.entries(sections).map(([title, items]) => ({ title, items }));
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
