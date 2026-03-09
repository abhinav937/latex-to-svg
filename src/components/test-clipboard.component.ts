import { Component, signal, OnInit } from '@angular/core';

interface EquationConfig {
  key: string;
  latex: string;
  targetWidthPx: number;
  label: string;
  tagClass: string;
}

@Component({
  selector: 'app-test-clipboard',
  standalone: true,
  template: `
    <div class="min-h-screen bg-gray-100 p-4 sm:p-8 max-w-5xl mx-auto font-sans">
      <h1 class="text-2xl font-bold mb-1">SVG Clipboard → Inkscape Paste Test</h1>
      <p class="text-gray-500 mb-6 text-sm">
        Click a <strong>Copy</strong> button, then <kbd class="px-1.5 py-0.5 bg-gray-200 rounded text-xs">Ctrl+V</kbd> in Inkscape.
        The two equations should paste at <strong>different sizes</strong>.
      </p>

      <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-blue-900 text-sm">
        <strong>How to test:</strong> Copy the small equation → paste in Inkscape → copy the large equation → paste in Inkscape.
        If both appear at the same size, the SVG scaling is broken.
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        @for (eq of equations; track eq.key) {
          <div class="bg-white rounded-xl shadow-md border border-gray-200 p-5">
            <div class="flex items-center gap-2 mb-1">
              <h2 class="font-semibold">{{ eq.label }}</h2>
              <span class="text-xs font-semibold px-2 py-0.5 rounded" [class]="eq.tagClass">
                {{ eq.targetWidthPx }}px wide
              </span>
            </div>
            <div class="text-xs text-gray-400 font-mono mb-3" [id]="'dims-' + eq.key">
              {{ dimsInfo[eq.key] || 'Loading…' }}
            </div>

            <div class="bg-gray-50 border border-dashed border-gray-300 rounded-lg min-h-[100px] flex items-center justify-center p-4 mb-3">
              @if (previewUrls[eq.key]) {
                <img [src]="previewUrls[eq.key]" [alt]="eq.label" class="max-w-full" />
              } @else {
                <span class="text-gray-300 text-sm">Loading…</span>
              }
            </div>

            <div class="flex flex-wrap gap-2">
              <button
                (click)="copyAsImage(eq.key)"
                class="px-3 py-2 rounded-lg text-sm font-medium border transition-all"
                [class]="copyState[eq.key] === 'image' ? 'bg-green-500 text-white border-green-500' : 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700'">
                {{ copyState[eq.key] === 'image' ? '✓ Copied!' : '📋 Copy as Image' }}
              </button>
              <button
                (click)="copySvgCode(eq.key)"
                class="px-3 py-2 rounded-lg text-sm font-medium border transition-all"
                [class]="copyState[eq.key] === 'code' ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400 hover:text-indigo-600'">
                {{ copyState[eq.key] === 'code' ? '✓ Copied!' : 'Copy SVG Code' }}
              </button>
              <button
                (click)="copyPlainTextOnly(eq.key)"
                class="px-3 py-2 rounded-lg text-sm font-medium border transition-all"
                [class]="copyState[eq.key] === 'text' ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400 hover:text-indigo-600'">
                {{ copyState[eq.key] === 'text' ? '✓ Copied!' : 'Copy (text/plain only)' }}
              </button>
              <button
                (click)="downloadSvg(eq.key)"
                class="px-3 py-2 rounded-lg text-sm font-medium bg-white text-gray-700 border border-gray-300 hover:border-indigo-400 hover:text-indigo-600 transition-all">
                ⬇ Download SVG
              </button>
            </div>
            <div class="text-xs text-gray-500 mt-2" [id]="'method-' + eq.key">
              {{ methodInfo[eq.key] || '' }}
            </div>
          </div>
        }
      </div>

      <div>
        <h2 class="font-semibold mb-2">Debug Log</h2>
        <div class="bg-gray-900 text-gray-300 p-4 rounded-xl font-mono text-xs max-h-[400px] overflow-y-auto whitespace-pre-wrap break-all">{{ logText() }}</div>
      </div>
    </div>
  `,
})
export class TestClipboardComponent implements OnInit {
  equations: EquationConfig[] = [
    { key: 'small', latex: 'E=mc^2', targetWidthPx: 16, label: 'Equation A (Small)', tagClass: 'bg-blue-100 text-blue-700' },
    { key: 'large', latex: '\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}', targetWidthPx: 200, label: 'Equation B (Large)', tagClass: 'bg-pink-100 text-pink-700' },
  ];

  svgCache: Record<string, string> = {};
  previewUrls: Record<string, string> = {};
  dimsInfo: Record<string, string> = {};
  copyState: Record<string, string> = {};
  methodInfo: Record<string, string> = {};
  logText = signal('Ready.\n');

  private log(msg: string) {
    const ts = new Date().toLocaleTimeString();
    this.logText.update(v => v + `[${ts}] ${msg}\n`);
  }

  async ngOnInit() {
    for (const eq of this.equations) {
      try {
        const raw = await this.fetchSvgText(eq.latex);
        const scaled = this.scaleSvg(raw, eq.targetWidthPx);
        this.svgCache[eq.key] = scaled;

        const blob = new Blob([scaled], { type: 'image/svg+xml' });
        this.previewUrls[eq.key] = URL.createObjectURL(blob);

        const wMatch = scaled.match(/width="([^"]+)"/);
        const hMatch = scaled.match(/height="([^"]+)"/);
        this.dimsInfo[eq.key] = `width="${wMatch?.[1]}"  height="${hMatch?.[1]}"  |  ${eq.latex}`;
        this.log(`✓ ${eq.key} equation ready (${eq.targetWidthPx}px target)`);
      } catch (err: any) {
        this.log(`✗ ${eq.key} FAILED: ${err.message}`);
      }
    }
  }

  private async fetchSvgText(latex: string): Promise<string> {
    const url = `https://latex.codecogs.com/svg?${encodeURIComponent('\\dpi{300} ' + latex)}`;
    this.log(`Fetching: ${url.substring(0, 90)}…`);
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Fetch failed: ${resp.status}`);
    return resp.text();
  }

  /**
   * Scales an SVG to a target width in px, preserving aspect ratio.
   * Mirrors scaleSvgForExport from latex-editor.component.ts
   */
  private scaleSvg(svgText: string, targetWidthPx: number): string {
    const tagMatch = svgText.match(/<svg([^>]*)>/);
    if (!tagMatch) { this.log('ERROR: no <svg> tag'); return svgText; }

    const originalTag = tagMatch[0];
    let attrs = tagMatch[1];

    const wMatch = attrs.match(/\bwidth=['"]([0-9.]+)[a-z%]*['"]/);
    const hMatch = attrs.match(/\bheight=['"]([0-9.]+)[a-z%]*['"]/);
    if (!wMatch || !hMatch) { this.log('ERROR: no width/height'); return svgText; }

    const nativeW = parseFloat(wMatch[1]);
    const nativeH = parseFloat(hMatch[1]);
    this.log(`  Native: ${nativeW} × ${nativeH} (raw attr: ${wMatch[0]})`);

    // Ensure viewBox
    if (!/\bviewBox\s*=/.test(attrs)) {
      attrs += ` viewBox="0 0 ${nativeW} ${nativeH}"`;
      this.log(`  Added viewBox`);
    }

    const targetH = targetWidthPx * (nativeH / nativeW);
    this.log(`  Scaled: ${targetWidthPx.toFixed(1)}px × ${targetH.toFixed(1)}px`);

    attrs = attrs
      .replace(/\bwidth=['"][^'"]*['"]/, `width="${targetWidthPx.toFixed(3)}px"`)
      .replace(/\bheight=['"][^'"]*['"]/, `height="${targetH.toFixed(3)}px"`);

    let newTag = `<svg${attrs}>`;
    if (!/\bxmlns\s*=/.test(attrs)) {
      newTag = newTag.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
    }

    const result = svgText.replace(originalTag, newTag);
    const finalSvgTag = result.match(/<svg[^>]*>/)?.[0] ?? '???';
    this.log(`  Final tag: ${finalSvgTag}`);
    return result;
  }

  async copyAsImage(key: string) {
    const svgText = this.svgCache[key];
    if (!svgText) return;

    try {
      const svgBlob = new Blob([svgText], { type: 'image/svg+xml' });

      if ('ClipboardItem' in window && 'supports' in (ClipboardItem as any) &&
          (ClipboardItem as any).supports('image/svg+xml')) {
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/svg+xml': svgBlob,
            'text/plain': new Blob([svgText], { type: 'text/plain' }),
          })
        ]);
        this.log(`✓ Copied "${key}" via ClipboardItem (image/svg+xml + text/plain)`);
        this.methodInfo[key] = 'Async Clipboard API: image/svg+xml + text/plain';
      } else {
        // Fallback
        await new Promise<void>((resolve, reject) => {
          const dummy = document.createElement('textarea');
          dummy.value = ' ';
          dummy.style.cssText = 'position:fixed;top:-9999px;opacity:0';
          document.body.appendChild(dummy);
          dummy.focus();
          dummy.select();
          document.addEventListener('copy', (e: ClipboardEvent) => {
            e.preventDefault();
            e.clipboardData?.setData('image/svg+xml', svgText);
            e.clipboardData?.setData('text/plain', svgText);
            document.body.removeChild(dummy);
            resolve();
          }, { once: true });
          if (!document.execCommand('copy')) {
            document.body.removeChild(dummy);
            reject(new Error('execCommand failed'));
          }
        });
        this.log(`✓ Copied "${key}" via execCommand fallback`);
        this.methodInfo[key] = 'execCommand fallback: image/svg+xml + text/plain';
      }
      this.flashCopy(key, 'image');
    } catch (err: any) {
      this.log(`✗ Copy image failed: ${err.message}`);
    }
  }

  async copySvgCode(key: string) {
    const svgText = this.svgCache[key];
    if (!svgText) return;
    try {
      await navigator.clipboard.writeText(svgText);
      this.log(`✓ Copied "${key}" SVG code as text`);
      this.methodInfo[key] = 'clipboard.writeText (SVG as plain text)';
      this.flashCopy(key, 'code');
    } catch (err: any) {
      this.log(`✗ Copy code failed: ${err.message}`);
    }
  }

  /**
   * Copy as text/plain ONLY — no image/svg+xml MIME type.
   * This tests whether Inkscape reads SVG from the text/plain clipboard target.
   */
  async copyPlainTextOnly(key: string) {
    const svgText = this.svgCache[key];
    if (!svgText) return;
    try {
      await navigator.clipboard.writeText(svgText);
      this.log(`✓ Copied "${key}" as text/plain only (no image/svg+xml)`);
      this.methodInfo[key] = 'writeText: text/plain ONLY — tests if Inkscape reads SVG from plain text';
      this.flashCopy(key, 'text');
    } catch (err: any) {
      this.log(`✗ Copy plain text failed: ${err.message}`);
    }
  }

  downloadSvg(key: string) {
    const svgText = this.svgCache[key];
    if (!svgText) return;
    const blob = new Blob([svgText], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-${key}.svg`;
    a.click();
    URL.revokeObjectURL(url);
    this.log(`⬇ Downloaded test-${key}.svg`);
  }

  private flashCopy(key: string, type: string) {
    this.copyState[key] = type;
    setTimeout(() => { this.copyState[key] = ''; }, 2000);
  }
}
