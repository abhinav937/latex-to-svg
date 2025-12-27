import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm z-10 relative">
      <div class="flex items-center gap-3">
        <a routerLink="/" class="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div class="bg-indigo-600 text-white p-2 rounded-lg shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <div>
            <h1 class="text-xl font-bold text-gray-800 tracking-tight">LaTeX to SVG</h1>
          </div>
        </a>
      </div>
      
      <div class="hidden md:flex items-center gap-4">
        <nav class="flex items-center gap-4">
          <a routerLink="/help" routerLinkActive="text-indigo-600 font-semibold" class="text-gray-700 hover:text-indigo-600 transition-colors font-medium">
            Help
          </a>
          <a routerLink="/changelog" routerLinkActive="text-indigo-600 font-semibold" class="text-gray-700 hover:text-indigo-600 transition-colors font-medium">
            Changelog
          </a>
        </nav>
        <span class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold border border-green-200">
          v2.0
        </span>
      </div>
    </header>
  `
})
export class HeaderComponent {}