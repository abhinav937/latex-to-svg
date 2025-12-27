import { Component, inject, viewChild } from '@angular/core';
import { HeaderComponent } from './components/header.component';
import { LatexEditorComponent } from './components/latex-editor.component';
import { HistoryComponent } from './components/history.component';
import { HistoryService } from './services/history.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HeaderComponent, LatexEditorComponent, HistoryComponent],
  templateUrl: './app.component.html'
})
export class AppComponent {
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