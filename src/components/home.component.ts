import { Component, inject, viewChild } from '@angular/core';
import { LatexEditorComponent } from './latex-editor.component';
import { HistoryComponent } from './history.component';
import { HistoryService } from '../services/history.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [LatexEditorComponent, HistoryComponent],
  template: `
    <div class="h-[calc(100vh-4rem)] flex flex-col bg-white">
      <main class="flex-1 flex relative min-h-0">
        <!-- Main Editor Area -->
        <div class="flex-1 overflow-y-auto bg-white relative z-0 min-h-0">
          <app-latex-editor></app-latex-editor>
        </div>

        <!-- History Sidebar (Desktop) -->
        <aside class="w-72 xl:w-80 hidden lg:block overflow-hidden h-full shadow-lg border-l border-gray-200 z-10 flex-shrink-0">
          <app-history (select)="onHistorySelect($event)"></app-history>
        </aside>
      </main>
    </div>
  `
})
export class HomeComponent {
  private historyService = inject(HistoryService);
  
  // Using viewChild to access the editor component to set value
  editor = viewChild(LatexEditorComponent);

  onHistorySelect(latex: string) {
    const editorRef = this.editor();
    if (editorRef) {
      editorRef.setLatex(latex);
    }
  }
}
