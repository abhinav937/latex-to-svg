import { Component, input, output, inject } from '@angular/core';
import { HistoryService } from '../services/history.service';

@Component({
  selector: 'app-history',
  standalone: true,
  template: `
    <div class="h-full flex flex-col bg-white">
      <div class="px-4 xl:px-6 py-4 xl:py-5 border-b border-gray-200 flex justify-between items-center bg-gray-50 flex-shrink-0">
        <h3 class="text-sm xl:text-base font-semibold text-gray-700 flex items-center gap-2 xl:gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 xl:h-5 xl:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          History
        </h3>
        <button 
          (click)="historyService.clearHistory()" 
          class="text-xs xl:text-sm text-red-500 hover:text-red-700 hover:bg-red-50 px-2 xl:px-3 py-1 xl:py-1.5 rounded transition-colors"
          [class.invisible]="historyService.history().length === 0"
          title="Clear all history"
        >
          Clear
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-3 xl:p-4 space-y-2 xl:space-y-3">
        @if (historyService.history().length === 0) {
          <div class="text-center py-12 xl:py-16 px-4 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 xl:h-12 xl:w-12 mx-auto mb-3 xl:mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p class="text-sm xl:text-base font-medium mb-1 xl:mb-2">No history yet</p>
            <p class="text-xs xl:text-sm">Generated equations will appear here</p>
          </div>
        }

        @for (item of historyService.history(); track item) {
          <div class="group relative bg-white hover:bg-gray-50 border border-gray-200 hover:border-indigo-400 rounded-lg xl:rounded-xl p-3 xl:p-4 transition-all duration-150 shadow-sm hover:shadow-md cursor-pointer">
            <!-- Clickable Area for Selection -->
            <div (click)="select.emit(item)" class="space-y-2 xl:space-y-3">
              <!-- Preview Image -->
              <div class="h-12 xl:h-16 overflow-hidden flex items-center justify-center bg-gray-50 xl:bg-gray-100 rounded-lg xl:rounded-xl border border-gray-100 xl:border-gray-200 p-1 xl:p-2">
                 <img 
                   [src]="'https://latex.codecogs.com/svg.latex?\\small ' + encode(item)" 
                   alt="preview" 
                   class="max-h-full max-w-full object-contain" 
                   loading="lazy"
                   onerror="this.style.display='none'"
                 />
              </div>
              <!-- LaTeX Code -->
              <div class="text-xs xl:text-sm text-gray-600 font-mono truncate leading-relaxed xl:leading-normal px-0.5">
                {{ item }}
              </div>
            </div>

            <!-- Delete Button -->
            <button 
              (click)="deleteItem($event, item)"
              class="absolute top-3 xl:top-4 right-3 xl:right-4 p-1.5 xl:p-2 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-red-50"
              title="Remove from history"
              aria-label="Delete"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 xl:h-4 xl:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        }
      </div>
    </div>
  `
})
export class HistoryComponent {
  historyService = inject(HistoryService);
  select = output<string>();

  encode(str: string): string {
    return encodeURIComponent(str);
  }

  deleteItem(e: Event, item: string) {
    e.stopPropagation();
    this.historyService.removeFromHistory(item);
  }
}