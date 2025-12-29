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
        <p>Generate high-quality SVG images from LaTeX code, no installation required. A web-based alternative to TexText for Inkscape.</p>
      </div>

      <div class="help-section">
        <h2>Features</h2>
        <ul>
          <li><strong>Instant LaTeX to SVG</strong>: Enter LaTeX code and render SVG images instantly</li>
          <li><strong>AI LaTeX Fix</strong>: Click the AI button to automatically correct syntax errors</li>
          <li><strong>Smart Autocomplete</strong>: Type <code>\\</code> to see LaTeX command suggestions</li>
          <li><strong>Scale Control</strong>: Adjust the point size (8-72pt) using the number input for your output image</li>
          <li><strong>Progressive Web App</strong>: Install the app for offline access and native app experience</li>
          <li><strong>Copy & Download</strong>: Copy SVG to clipboard or download as file</li>
          <li><strong>Share Equations</strong>: Generate shareable links so others can edit your equations</li>
          <li><strong>Recent History</strong>: Stores your last 10 LaTeX inputs for quick reuse</li>
          <li><strong>Mobile Friendly</strong>: Fully responsive and easy to use on any device</li>
        </ul>
      </div>

      <div class="help-section">
        <h2>How to Use</h2>
        
        <h3>Basic Usage</h3>
        <ol>
          <li><strong>Enter LaTeX Code</strong>: Type or paste your LaTeX code in the input box
            <ul>
              <li><strong>Inline Math</strong>: Use single <code>$</code> for inline equations</li>
              <li><strong>Display Math</strong>: Use <code>$$</code> for centered equations</li>
              <li><strong>Text Mode</strong>: Regular text is automatically wrapped in <code>\\text{}</code></li>
            </ul>
          </li>
          <li><strong>AI Fix</strong>: Click the AI button to automatically correct LaTeX syntax errors</li>
          <li><strong>Use Autocomplete</strong>: Type <code>\\</code> to see command suggestions
            <ul>
              <li>Navigate with arrow keys or mouse</li>
              <li>Press Tab/Enter to select</li>
              <li>Press Escape to close</li>
            </ul>
          </li>
          <li><strong>Adjust Scale</strong>: Use the point size input field (8-72pt) to set image size</li>
          <li><strong>Convert to SVG</strong>: Click <strong>Convert to SVG</strong> or press Enter to generate the SVG</li>
          <li><strong>Manage Output</strong>:
            <ul>
              <li><strong>Copy</strong>: Copy the SVG image to your clipboard</li>
              <li><strong>Download</strong>: Download the SVG file with smart filename</li>
              <li><strong>Copy SVG Code</strong>: Copy the raw SVG markup</li>
            </ul>
          </li>
          <li><strong>Share Equations</strong>: Click the share button to copy a link that others can use to edit your equation
            <ul>
              <li>Anyone with the link can view and modify the equation</li>
              <li>Perfect for collaborating on mathematical expressions</li>
              <li>Link automatically renders the equation when opened</li>
            </ul>
          </li>
          <li><strong>View History</strong>: Your last 10 LaTeX commands are shown in the sidebar. Click any to reuse.</li>
        </ol>
        
        <h3>AI LaTeX Fix Feature</h3>
        <ul>
          <li><strong>Automatic Correction</strong>: Click the AI button to fix syntax errors</li>
          <li><strong>Smart Analysis</strong>: AI analyzes your LaTeX and provides corrected version</li>
          <li><strong>Auto-Render</strong>: Corrected LaTeX is automatically rendered after fixing</li>
          <li><strong>Error Handling</strong>: Clear error messages for rate limits, invalid input, etc.</li>
        </ul>
      </div>

      <div class="help-section">
        <h2>LaTeX Examples</h2>
        
        <h3>Basic Math</h3>
        <pre><code>$E = mc^2$
$\\frac{a}{b}$
$\\sqrt{x^2 + y^2}$</code></pre>
        
        <h3>Greek Letters</h3>
        <pre><code>$\\alpha, \\beta, \\gamma, \\delta$
$\\pi, \\theta, \\phi, \\omega$
$\\sum_{i=1}^{n} x_i$</code></pre>
        
        <h3>Advanced Math</h3>
        <pre><code>$$\\int_{0}^{\\infty} e^{-x} dx = 1$$
$$\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$$
$$\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$$</code></pre>
        
        <h3>Text and Formatting</h3>
        <pre><code>$\\text{Hello World}$
$\\mathbf{bold text}$
$\\mathit{italic text}$
$\\mathrm{roman text}$
R_{DS}
R\\textsubscript{ds,on}</code></pre>
      </div>

      <div class="help-section">
        <h2>Autocomplete System</h2>
        
        <h3>How to Use</h3>
        <ol>
          <li><strong>Start typing</strong>: Type <code>\\</code> to trigger autocomplete</li>
          <li><strong>Browse suggestions</strong>: Use arrow keys or mouse to navigate</li>
          <li><strong>Select command</strong>: Press Tab, Enter, or click to insert</li>
          <li><strong>Close</strong>: Press Escape or click outside</li>
        </ol>
        
        <h3>Supported Commands</h3>
        <p>The autocomplete includes:</p>
        <ul>
          <li><strong>Greek letters</strong>: <code>\\alpha</code>, <code>\\beta</code>, <code>\\pi</code>, etc.</li>
          <li><strong>Math symbols</strong>: <code>\\sum</code>, <code>\\int</code>, <code>\\sqrt</code>, <code>\\frac</code>, etc.</li>
          <li><strong>Arrows</strong>: <code>\\rightarrow</code>, <code>\\leftarrow</code>, <code>\\Rightarrow</code>, etc.</li>
          <li><strong>Set theory</strong>: <code>\\in</code>, <code>\\subset</code>, <code>\\cup</code>, <code>\\cap</code>, etc.</li>
          <li><strong>Logic</strong>: <code>\\land</code>, <code>\\lor</code>, <code>\\neg</code>, <code>\\implies</code>, etc.</li>
          <li><strong>Functions</strong>: <code>\\sin</code>, <code>\\cos</code>, <code>\\log</code>, <code>\\exp</code>, etc.</li>
          <li><strong>Formatting</strong>: <code>\\mathbf</code>, <code>\\mathit</code>, <code>\\mathrm</code>, <code>\\text</code>, etc.</li>
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
            <tr><td><strong>Enter</strong></td><td>Convert LaTeX to SVG</td></tr>
            <tr><td><strong>Shift + Enter</strong></td><td>Add newline in input</td></tr>
            <tr><td><strong>Tab</strong></td><td>Select autocomplete suggestion</td></tr>
            <tr><td><strong>Arrow keys</strong></td><td>Navigate autocomplete suggestions</td></tr>
            <tr><td><strong>Escape</strong></td><td>Close autocomplete</td></tr>
            <tr><td><strong>\\</strong></td><td>Trigger autocomplete</td></tr>
          </tbody>
        </table>
      </div>

      <div class="help-section">
        <h2>Error Handling</h2>
        <p>The tool provides clear error messages for:</p>
        <ul>
          <li><strong>Empty input</strong>: "Please enter a LaTeX command"</li>
          <li><strong>Network errors</strong>: "Unable to fetch rendered image"</li>
          <li><strong>Invalid LaTeX</strong>: "The equation could not be rendered"</li>
          <li><strong>AI service errors</strong>: Rate limits, authentication, and service availability</li>
        </ul>
      </div>

      <div class="help-section">
        <h2>Tips & Best Practices</h2>
        
        <h3>LaTeX Syntax</h3>
        <ul>
          <li><strong>Inline math</strong>: Use single <code>$</code> for equations within text</li>
          <li><strong>Display math</strong>: Use <code>$$</code> for centered equations</li>
          <li><strong>Text mode</strong>: Regular text is automatically wrapped in <code>\\text{}</code></li>
          <li><strong>Bold text</strong>: Use <code>\\mathbf{}</code> for mathematical bold</li>
          <li><strong>Italic text</strong>: Use <code>\\mathit{}</code> for mathematical italic</li>
        </ul>
        
        <h3>Performance</h3>
        <ul>
          <li><strong>Scale wisely</strong>: Higher point sizes create larger files</li>
          <li><strong>Use autocomplete</strong>: Faster than typing full commands</li>
          <li><strong>Check history</strong>: Reuse recent commands instead of retyping</li>
          <li><strong>Use AI fix</strong>: Let AI correct syntax errors automatically</li>
        </ul>
        
        <h3>File Management</h3>
        <ul>
          <li><strong>Smart filenames</strong>: Downloaded files include content and timestamp</li>
          <li><strong>SVG format</strong>: Vector graphics that scale perfectly</li>
          <li><strong>Clipboard support</strong>: Copy SVG for use in other applications</li>
        </ul>
      </div>

      <div class="help-section">
        <h2>Troubleshooting</h2>
        
        <h3>Common Issues</h3>
        
        <p><strong>Autocomplete not working?</strong></p>
        <ul>
          <li>Make sure you're typing <code>\\</code> (backslash)</li>
          <li>Check if your browser supports the required APIs</li>
          <li>Try refreshing the page</li>
        </ul>
        
        <p><strong>Image not rendering?</strong></p>
        <ul>
          <li>Check your LaTeX syntax</li>
          <li>Use the AI fix button to correct errors</li>
          <li>Ensure you have an internet connection</li>
          <li>Try a simpler example first</li>
        </ul>
        
        <p><strong>AI fix not working?</strong></p>
        <ul>
          <li>Check if you have valid LaTeX code to fix</li>
          <li>Ensure you have an internet connection</li>
          <li>Try again later if rate limited</li>
        </ul>
        
        <p><strong>Copy/Download not working?</strong></p>
        <ul>
          <li>Make sure an image has been rendered first</li>
          <li>Check browser permissions for clipboard access</li>
          <li>Try a different browser</li>
        </ul>
        
        <h3>Getting Help</h3>
        <p>If you encounter issues not covered here:</p>
        <ol>
          <li>Check the browser console for error messages</li>
          <li>Try refreshing the page</li>
          <li>Test with a simple example like <code>$x^2$</code></li>
          <li>Use the AI fix feature for syntax errors</li>
          <li>Contact the developer with specific error details</li>
        </ol>
      </div>

      <div class="help-section">
        <h2>Progressive Web App (PWA)</h2>
        <p>This tool can be installed as a Progressive Web App for a better experience:</p>
        <ul>
          <li><strong>Installation</strong>: Look for the install prompt that appears when you visit the site</li>
          <li><strong>Offline Access</strong>: Once installed, the app works offline for previously rendered equations</li>
          <li><strong>Native Experience</strong>: Get app-like experience with standalone window and shortcuts</li>
          <li><strong>File Handling</strong>: Open SVG files directly from your device</li>
        </ul>
      </div>

      <div class="help-section">
        <h2>Need More Help?</h2>
        <ul>
          <li><strong>LaTeX Reference</strong>: See the <a href="https://editor.codecogs.com/docs">CodeCogs Equation Editor Documentation</a> for complete LaTeX syntax</li>
          <li><strong>Examples</strong>: Click the example chips on the main page for sample code</li>
          <li><strong>Contact</strong>: For issues with this tool, contact <a href="https://x.com/emotor">Abhinav Chinnusamy</a></li>
          <li><strong>GitHub</strong>: View the source code and contribute at <a href="https://github.com/abhinav937/latex-to-svg">GitHub Repository</a></li>
        </ul>
      </div>
    `;
  }
} 