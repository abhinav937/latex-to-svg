import { Component, input, output, inject } from '@angular/core';
import { HistoryService } from '../services/history.service';

@Component({
  selector: 'app-history',
  standalone: true,
  template: `
    <div class="h-full flex flex-col bg-white border-l border-gray-200">
      <div class="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
        <h3 class="font-semibold text-gray-700 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          History
        </h3>
        <button 
          (click)="historyService.clearHistory()" 
          class="text-xs text-red-500 hover:text-red-700 hover:underline px-2 py-1 rounded transition-colors"
          [class.invisible]="historyService.history().length === 0"
        >
          Clear All
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-4 space-y-3">
        @if (historyService.history().length === 0) {
          <div class="text-center py-10 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p class="text-sm">No history yet.</p>
            <p class="text-xs">Generated equations will appear here.</p>
          </div>
        }

        @for (item of historyService.history(); track item) {
          <div class="group relative bg-gray-50 hover:bg-white border border-gray-200 hover:border-indigo-300 rounded-lg p-3 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer">
            <!-- Clickable Area for Selection -->
            <div (click)="select.emit(item)" class="space-y-2">
              <div class="h-8 overflow-hidden flex items-center">
                 <img [src]="'https://latex.codecogs.com/svg.latex?\\small ' + encode(item)" alt="preview" class="max-h-full max-w-full opacity-80" loading="lazy" />
              </div>
              <div class="text-xs text-gray-500 font-mono truncate border-t border-gray-100 pt-2 mt-1">
                {{ item }}
              </div>
            </div>

            <!-- Delete Button -->
            <button 
              (click)="deleteItem($event, item)"
              class="absolute top-1 right-1 p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-red-50"
              title="Remove from history"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
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