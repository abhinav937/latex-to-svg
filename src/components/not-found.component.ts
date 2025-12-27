import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div class="text-center max-w-2xl mx-auto">
        <!-- 404 Number -->
        <div class="mb-8">
          <h1 class="text-9xl font-bold text-indigo-600 mb-4 tracking-tight">404</h1>
          <div class="w-24 h-1 bg-indigo-600 mx-auto rounded-full"></div>
        </div>
        
        <!-- Message -->
        <h2 class="text-3xl font-bold text-gray-800 mb-4">Page Not Found</h2>
        <p class="text-lg text-gray-600 mb-8 leading-relaxed">
          Oops! The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
        </p>
        
        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a 
            routerLink="/" 
            class="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors duration-200 hover:shadow-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            Go Home
          </a>
          
          <a 
            routerLink="/help" 
            class="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 font-semibold rounded-lg border-2 border-indigo-600 hover:bg-indigo-50 transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
            </svg>
            Get Help
          </a>
        </div>
        
        <!-- Additional Links -->
        <div class="mt-12 pt-8 border-t border-gray-200">
          <p class="text-sm text-gray-500 mb-4">You might also be looking for:</p>
          <div class="flex flex-wrap justify-center gap-4">
            <a routerLink="/help" class="text-indigo-600 hover:text-indigo-700 font-medium text-sm transition-colors">
              Help & Documentation
            </a>
            <span class="text-gray-300">•</span>
            <a routerLink="/changelog" class="text-indigo-600 hover:text-indigo-700 font-medium text-sm transition-colors">
              Changelog
            </a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class NotFoundComponent {}
