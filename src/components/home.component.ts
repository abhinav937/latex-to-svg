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
      <main class="flex-1 flex overflow-hidden relative">
        <!-- Main Editor Area -->
        <div class="flex-1 overflow-y-auto bg-white relative z-0">
          <app-latex-editor></app-latex-editor>
        </div>

        <!-- History Sidebar (Desktop) -->
        <aside class="w-80 hidden lg:block h-full shadow-xl z-10">
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
