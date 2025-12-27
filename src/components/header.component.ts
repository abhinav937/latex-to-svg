import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between shadow-sm z-10 relative">
      <div class="flex items-center gap-2 sm:gap-3">
        <a routerLink="/" class="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity">
          <div class="bg-indigo-600 text-white p-1.5 sm:p-2 rounded-lg shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 sm:w-6 sm:h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <div>
            <h1 class="text-lg sm:text-xl font-bold text-gray-800 tracking-tight">LaTeX to SVG</h1>
          </div>
        </a>
      </div>
      
      <!-- Desktop Navigation -->
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

      <!-- Mobile Menu Button -->
      <div class="md:hidden flex items-center gap-3">
        <span class="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold border border-green-200">
          v2.0
        </span>
        <button 
          (click)="mobileMenuOpen.set(!mobileMenuOpen())"
          class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          @if (mobileMenuOpen()) {
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          } @else {
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          }
        </button>
      </div>

      <!-- Mobile Menu -->
      @if (mobileMenuOpen()) {
        <div class="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg md:hidden z-20">
          <nav class="flex flex-col py-2">
            <a 
              routerLink="/help" 
              routerLinkActive="bg-indigo-50 text-indigo-600 font-semibold"
              (click)="mobileMenuOpen.set(false)"
              class="px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors font-medium border-b border-gray-100">
              Help
            </a>
            <a 
              routerLink="/changelog" 
              routerLinkActive="bg-indigo-50 text-indigo-600 font-semibold"
              (click)="mobileMenuOpen.set(false)"
              class="px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors font-medium">
              Changelog
            </a>
          </nav>
        </div>
      }
    </header>
  `
})
export class HeaderComponent {
  mobileMenuOpen = signal(false);
}