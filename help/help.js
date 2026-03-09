// Help Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
  // Initialize help content
  initializeHelpContent();
});

function initializeHelpContent() {
  const helpElement = document.getElementById('help-content');

  if (helpElement) {
    helpElement.innerHTML = `
      <div class="help-header">
        <h1>LaTeX to SVG Generator Help</h1>
        <p>Generate high-quality SVG and PNG images from LaTeX code, no installation required. A web-based alternative to TexText for Inkscape.</p>
      </div>

      <div class="help-section">
        <h2>Features</h2>
        <ul>
          <li><strong>Instant LaTeX Rendering</strong>: Enter LaTeX code and render SVG images instantly via the CodeCogs API</li>
          <li><strong>Smart Autocomplete</strong>: Type <code>\\</code> to see 265+ LaTeX command suggestions with live previews</li>
          <li><strong>Output Size Control</strong>: Adjust font size (in pt, px, or mm) with a slider; the preview badge shows the exact output dimensions</li>
          <li><strong>Download as SVG or PNG</strong>: Download vector SVG or raster PNG at 72–600 DPI</li>
          <li><strong>Copy as Image</strong>: Copy the rendered equation as an SVG image to your clipboard (optimized for Inkscape)</li>
          <li><strong>Copy SVG Code</strong>: Copy the raw SVG markup for use in other tools</li>
          <li><strong>Recent History</strong>: Stores your last 50 equations locally with visual previews for quick reuse</li>
          <li><strong>Example Chips</strong>: One-click example equations to get started quickly</li>
          <li><strong>Mobile Friendly</strong>: Fully responsive and easy to use on any device</li>
        </ul>
      </div>

      <div class="help-section">
        <h2>How to Use</h2>

        <h3>Basic Usage</h3>
        <ol>
          <li><strong>Enter LaTeX Code</strong>: Type or paste your LaTeX code in the input box, or click one of the example chips below the editor</li>
          <li><strong>Use Autocomplete</strong>: Type <code>\\</code> to see command suggestions
            <ul>
              <li>The first 4 suggestions show live rendered previews</li>
              <li>Navigate with <kbd>↑</kbd> <kbd>↓</kbd> arrow keys or mouse</li>
              <li>Press <kbd>Tab</kbd> to select the highlighted suggestion</li>
              <li>Press <kbd>Escape</kbd> to close</li>
            </ul>
          </li>
          <li><strong>Render</strong>: Click <strong>Render</strong> or press <kbd>Enter</kbd> to generate the SVG</li>
          <li><strong>Adjust Output Size</strong>:
            <ul>
              <li>Use the <strong>Font size</strong> slider to control the scale of the output</li>
              <li>Switch between <strong>pt</strong>, <strong>px</strong>, and <strong>mm</strong> units using the dropdown next to the slider</li>
              <li>The size badge in the preview corner shows the exact output dimensions</li>
            </ul>
          </li>
          <li><strong>Export or Copy</strong>:
            <ul>
              <li><strong>Copy as Image</strong>: Copies the scaled SVG to clipboard — paste directly into Inkscape</li>
              <li><strong>Copy SVG Code</strong>: Copies the raw SVG markup</li>
              <li><strong>Download SVG</strong>: Saves a scaled .svg file with a smart filename</li>
              <li><strong>Download PNG</strong>: Saves a .png file; use the <strong>PNG DPI</strong> dropdown (72–600 dpi) to control resolution</li>
            </ul>
          </li>
          <li><strong>History</strong>: Your last 50 equations are shown in the sidebar. Click any to reload it in the editor. Hover over an entry to reveal the delete button, or use <strong>Clear</strong> to remove all history.</li>
        </ol>

      </div>

      <div class="help-section">
        <h2>LaTeX Examples</h2>

        <h3>Text Labels</h3>
        <pre><code>\\text{Buck Converter}
R_{DS}
R\\textsubscript{ds,on}</code></pre>

        <h3>Greek Letters &amp; Equations</h3>
        <pre><code>\\eta = \\frac{P_{out}}{P_{in}}
P = V \\cdot I
\\frac{V_{out}}{V_{in}} = D</code></pre>

        <h3>Integrals &amp; Summations</h3>
        <pre><code>\\int_0^\\infty e^{-x} dx
\\sum_{i=1}^n i = \\frac{n(n+1)}{2}</code></pre>

        <h3>Matrices (State Space)</h3>
        <pre><code>\\dot{x} = \\begin{bmatrix} 0 & -\\frac{1}{L} \\\\ \\frac{1}{C} & -\\frac{1}{RC} \\end{bmatrix} x + \\begin{bmatrix} \\frac{1}{L} \\\\ 0 \\end{bmatrix} u</code></pre>

        <h3>Classic Formulas</h3>
        <pre><code>\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}
$\\text{Hello World}$
$\\mathbf{bold}$
$\\mathit{italic}$</code></pre>
      </div>

      <div class="help-section">
        <h2>Autocomplete System</h2>

        <h3>How to Use</h3>
        <ol>
          <li><strong>Start typing</strong>: Type <code>\\</code> followed by one or more letters to trigger autocomplete</li>
          <li><strong>Live previews</strong>: The first 4 suggestions show a rendered preview of the command</li>
          <li><strong>Browse suggestions</strong>: Use <kbd>↑</kbd> <kbd>↓</kbd> arrow keys or mouse to navigate</li>
          <li><strong>Select command</strong>: Press <kbd>Tab</kbd> or click to insert; cursor is placed inside the first argument braces automatically</li>
          <li><strong>Close</strong>: Press <kbd>Escape</kbd> or click outside</li>
        </ol>

        <h3>Supported Commands (265+)</h3>
        <p>The autocomplete includes:</p>
        <ul>
          <li><strong>Greek letters</strong>: <code>\\alpha</code>, <code>\\beta</code>, <code>\\pi</code>, etc.</li>
          <li><strong>Math symbols</strong>: <code>\\sum</code>, <code>\\int</code>, <code>\\sqrt</code>, <code>\\frac</code>, etc.</li>
          <li><strong>Text formatting</strong>: <code>\\mathbf</code>, <code>\\mathit</code>, <code>\\mathrm</code>, <code>\\text</code>, etc.</li>
          <li><strong>Arrows</strong>: <code>\\rightarrow</code>, <code>\\leftarrow</code>, <code>\\Rightarrow</code>, etc.</li>
          <li><strong>Brackets</strong>: <code>\\left(</code>, <code>\\right)</code>, <code>\\langle</code>, etc.</li>
          <li><strong>Logic &amp; Sets</strong>: <code>\\land</code>, <code>\\lor</code>, <code>\\in</code>, <code>\\subset</code>, etc.</li>
          <li><strong>Functions</strong>: <code>\\sin</code>, <code>\\cos</code>, <code>\\log</code>, <code>\\exp</code>, etc.</li>
          <li><strong>Spacing</strong>: <code>\\,</code>, <code>\\;</code>, <code>\\quad</code>, etc.</li>
          <li><strong>Colors</strong>: <code>\\color{red}</code>, etc.</li>
        </ul>
      </div>

      <div class="help-section">
        <h2>Keyboard Shortcuts</h2>

        <table>
          <thead>
            <tr>
              <th>Shortcut</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><strong>Enter</strong></td><td>Render LaTeX to SVG</td></tr>
            <tr><td><strong>Shift + Enter</strong></td><td>Add a newline in the input</td></tr>
            <tr><td><strong>\\</strong></td><td>Trigger autocomplete</td></tr>
            <tr><td><strong>↑ / ↓</strong></td><td>Navigate autocomplete suggestions</td></tr>
            <tr><td><strong>Tab</strong></td><td>Select the highlighted autocomplete suggestion</td></tr>
            <tr><td><strong>Escape</strong></td><td>Close autocomplete</td></tr>
            <tr><td><em>Any printable key</em></td><td>Focuses the editor if it isn't already focused</td></tr>
          </tbody>
        </table>
      </div>

      <div class="help-section">
        <h2>Output Size &amp; Export</h2>

        <h3>Font Size Slider</h3>
        <p>The slider controls the font size of the rendered output. CodeCogs renders equations at a 10pt baseline; the slider scales the output relative to that baseline so body text matches your chosen size. Tall constructs like fractions and integrals grow proportionally — exactly like a real LaTeX document.</p>
        <ul>
          <li>Switch between <strong>pt</strong> (typographic points), <strong>px</strong> (screen pixels), and <strong>mm</strong> (millimetres) using the unit dropdown</li>
          <li>The size badge in the bottom-right of the preview shows the exact width × height in the selected unit</li>
        </ul>

        <h3>PNG DPI</h3>
        <p>When downloading as PNG, choose a DPI from the dropdown: <strong>72</strong>, <strong>96</strong>, <strong>150</strong>, <strong>300</strong>, or <strong>600</strong>. Higher DPI produces sharper images but larger file sizes. 150 dpi is the default.</p>

        <h3>Smart Filenames</h3>
        <p>Downloaded SVG and PNG files are named automatically based on the LaTeX content — e.g. <code>fraction.svg</code>, <code>integral.png</code>, or a hash-based name for complex expressions.</p>
      </div>

      <div class="help-section">
        <h2>History</h2>
        <p>Your last 50 equations are saved automatically in your browser's local storage. The history sidebar (visible on desktop) shows a rendered preview and the LaTeX code for each entry.</p>
        <ul>
          <li><strong>Reuse</strong>: Click any history entry to load it back into the editor</li>
          <li><strong>Delete one</strong>: Hover over an entry and click the ✕ button</li>
          <li><strong>Clear all</strong>: Click the <strong>Clear</strong> button in the history header</li>
        </ul>
      </div>

      <div class="help-section">
        <h2>Troubleshooting</h2>

        <p><strong>Autocomplete not showing?</strong></p>
        <ul>
          <li>Make sure you're typing <code>\\</code> (backslash) followed by at least one letter</li>
          <li>Try refreshing the page</li>
        </ul>

        <p><strong>Image not rendering?</strong></p>
        <ul>
          <li>Check your LaTeX syntax — even a missing brace will cause a failure</li>
          <li>Ensure you have an internet connection (the CodeCogs API is required)</li>
          <li>Try a simpler example like <code>x^2</code> to verify the connection</li>
        </ul>

        <p><strong>Copy as Image not pasting into Inkscape?</strong></p>
        <ul>
          <li>Make sure an image has been rendered first</li>
          <li>Grant clipboard permissions if your browser asks</li>
          <li>If Copy as Image doesn't work, use <strong>Download SVG</strong> and import the file directly into Inkscape</li>
          <li>Some browsers (e.g. Firefox) have limited SVG clipboard support — try Chrome for the best Inkscape compatibility</li>
        </ul>

        <p><strong>PNG download looks blurry?</strong></p>
        <ul>
          <li>Increase the PNG DPI setting to 300 or 600 for high-resolution output</li>
        </ul>

        <h3>Getting Help</h3>
        <ol>
          <li>Test with a simple example like <code>x^2</code></li>
          <li>Check the browser console (F12) for error messages</li>
          <li>Try refreshing the page</li>
          <li>Contact the developer with specific error details</li>
        </ol>
      </div>

      <div class="help-section">
        <h2>Need More Help?</h2>
        <ul>
          <li><strong>LaTeX Reference</strong>: See the <a href="https://editor.codecogs.com/docs">CodeCogs Equation Editor Documentation</a> for complete LaTeX syntax</li>
          <li><strong>Examples</strong>: Click the example chips on the main page for sample code</li>
          <li><strong>Changelog</strong>: See <a href="../changelog">what's new</a></li>
          <li><strong>Contact</strong>: For issues with this tool, contact <a href="https://x.com/emotor">Abhinav Chinnusamy</a></li>
          <li><strong>GitHub</strong>: View the source code and contribute at <a href="https://github.com/abhinav937/latex-to-svg">GitHub Repository</a></li>
        </ul>
      </div>
    `;
  }
}