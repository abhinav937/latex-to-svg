import { Component } from '@angular/core';

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [],
  template: `
    <div class="bg-gray-50 min-h-[calc(100vh-4rem)] flex flex-col overflow-y-auto">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 w-full">
        <div class="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 md:p-8 lg:p-12">
          <div class="text-center mb-8 sm:mb-12">
            <h1 class="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-800 mb-3 sm:mb-4 px-2">LaTeX to SVG Generator Help</h1>
            <p class="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-2">Generate high-quality SVG images from LaTeX code, no installation required. A web-based alternative to TexText for Inkscape.</p>
          </div>

          <div class="space-y-8 sm:space-y-10 md:space-y-12">
            <!-- Features Section -->
            <div class="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6 md:p-8 hover:shadow-md transition-shadow">
              <h2 class="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6 pb-2 sm:pb-3 border-b-2 border-indigo-600">Features</h2>
              <ul class="space-y-2 sm:space-y-3 text-sm sm:text-base text-gray-700">
                <li><strong class="text-gray-900">Instant LaTeX to SVG</strong>: Enter LaTeX code and render SVG images instantly</li>
                <li><strong class="text-gray-900">AI LaTeX Fix</strong>: Click the AI button to automatically correct syntax errors</li>
                <li><strong class="text-gray-900">Smart Autocomplete</strong>: Type <code class="bg-indigo-100 text-indigo-800 px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm font-mono">\\</code> to see LaTeX command suggestions</li>
                <li><strong class="text-gray-900">Scale Control</strong>: Adjust the point size (8-72pt) using the number input for your output image</li>
                <li><strong class="text-gray-900">Progressive Web App</strong>: Install the app for offline access and native app experience</li>
                <li><strong class="text-gray-900">Copy & Download</strong>: Copy SVG to clipboard or download as file</li>
                <li><strong class="text-gray-900">Share Equations</strong>: Generate shareable links so others can edit your equations</li>
                <li><strong class="text-gray-900">Recent History</strong>: Stores your last 10 LaTeX inputs for quick reuse</li>
                <li><strong class="text-gray-900">Mobile Friendly</strong>: Fully responsive and easy to use on any device</li>
              </ul>
            </div>

            <!-- How to Use Section -->
            <div class="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6 md:p-8 hover:shadow-md transition-shadow">
              <h2 class="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6 pb-2 sm:pb-3 border-b-2 border-indigo-600">How to Use</h2>
              
              <h3 class="text-lg sm:text-xl font-semibold text-gray-800 mt-4 sm:mt-6 mb-3 sm:mb-4">Basic Usage</h3>
              <ol class="space-y-3 sm:space-y-4 text-sm sm:text-base text-gray-700 list-decimal list-inside">
                <li><strong class="text-gray-900">Enter LaTeX Code</strong>: Type or paste your LaTeX code in the input box
                  <ul class="mt-2 ml-4 sm:ml-6 space-y-2 list-disc text-sm sm:text-base">
                    <li><strong class="text-gray-900">Inline Math</strong>: Use single <code class="bg-indigo-100 text-indigo-800 px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm font-mono">$</code> for inline equations</li>
                    <li><strong class="text-gray-900">Display Math</strong>: Use <code class="bg-indigo-100 text-indigo-800 px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm font-mono">$$</code> for centered equations</li>
                    <li><strong class="text-gray-900">Text Mode</strong>: Regular text is automatically wrapped in <code class="bg-indigo-100 text-indigo-800 px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm font-mono">\\text{{ '{' }}{{ '}' }}</code></li>
                  </ul>
                </li>
                <li><strong class="text-gray-900">AI Fix</strong>: Click the AI button to automatically correct LaTeX syntax errors</li>
                <li><strong class="text-gray-900">Use Autocomplete</strong>: Type <code class="bg-indigo-100 text-indigo-800 px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm font-mono">\\</code> to see command suggestions
                  <ul class="mt-2 ml-4 sm:ml-6 space-y-2 list-disc text-sm sm:text-base">
                    <li>Navigate with arrow keys or mouse</li>
                    <li>Press Tab/Enter to select</li>
                    <li>Press Escape to close</li>
                  </ul>
                </li>
                <li><strong class="text-gray-900">Adjust Scale</strong>: Use the point size input field (8-72pt) to set image size</li>
                <li><strong class="text-gray-900">Convert to SVG</strong>: Click <strong>Convert to SVG</strong> or press Enter to generate the SVG</li>
                <li><strong class="text-gray-900">Manage Output</strong>:
                  <ul class="mt-2 ml-4 sm:ml-6 space-y-2 list-disc text-sm sm:text-base">
                    <li><strong class="text-gray-900">Copy</strong>: Copy the SVG image to your clipboard</li>
                    <li><strong class="text-gray-900">Download</strong>: Download the SVG file with smart filename</li>
                    <li><strong class="text-gray-900">Copy SVG Code</strong>: Copy the raw SVG markup</li>
                  </ul>
                </li>
                <li><strong class="text-gray-900">Share Equations</strong>: Click the share button to copy a link that others can use to edit your equation
                  <ul class="mt-2 ml-4 sm:ml-6 space-y-2 list-disc text-sm sm:text-base">
                    <li>Anyone with the link can view and modify the equation</li>
                    <li>Perfect for collaborating on mathematical expressions</li>
                    <li>Link automatically renders the equation when opened</li>
                  </ul>
                </li>
                <li><strong class="text-gray-900">View History</strong>: Your last 10 LaTeX commands are shown in the sidebar. Click any to reuse.</li>
              </ol>
              
              <h3 class="text-lg sm:text-xl font-semibold text-gray-800 mt-4 sm:mt-6 mb-3 sm:mb-4">AI LaTeX Fix Feature</h3>
              <ul class="space-y-2 text-sm sm:text-base text-gray-700 list-disc list-inside">
                <li><strong class="text-gray-900">Automatic Correction</strong>: Click the AI button to fix syntax errors</li>
                <li><strong class="text-gray-900">Smart Analysis</strong>: AI analyzes your LaTeX and provides corrected version</li>
                <li><strong class="text-gray-900">Auto-Render</strong>: Corrected LaTeX is automatically rendered after fixing</li>
                <li><strong class="text-gray-900">Error Handling</strong>: Clear error messages for rate limits, invalid input, etc.</li>
              </ul>
            </div>

            <!-- LaTeX Examples Section -->
            <div class="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6 md:p-8 hover:shadow-md transition-shadow">
              <h2 class="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6 pb-2 sm:pb-3 border-b-2 border-indigo-600">LaTeX Examples</h2>
              
              <h3 class="text-lg sm:text-xl font-semibold text-gray-800 mt-4 sm:mt-6 mb-3 sm:mb-4">Basic Math</h3>
              <pre class="bg-gray-100 p-3 sm:p-4 rounded-lg overflow-x-auto my-3 sm:my-4"><code class="text-xs sm:text-sm">{{ basicMathExample }}</code></pre>
              
              <h3 class="text-lg sm:text-xl font-semibold text-gray-800 mt-4 sm:mt-6 mb-3 sm:mb-4">Greek Letters</h3>
              <pre class="bg-gray-100 p-3 sm:p-4 rounded-lg overflow-x-auto my-3 sm:my-4"><code class="text-xs sm:text-sm">{{ greekLettersExample }}</code></pre>
              
              <h3 class="text-lg sm:text-xl font-semibold text-gray-800 mt-4 sm:mt-6 mb-3 sm:mb-4">Advanced Math</h3>
              <pre class="bg-gray-100 p-3 sm:p-4 rounded-lg overflow-x-auto my-3 sm:my-4"><code class="text-xs sm:text-sm">{{ advancedMathExample }}</code></pre>
              
              <h3 class="text-lg sm:text-xl font-semibold text-gray-800 mt-4 sm:mt-6 mb-3 sm:mb-4">Text and Formatting</h3>
              <pre class="bg-gray-100 p-3 sm:p-4 rounded-lg overflow-x-auto my-3 sm:my-4"><code class="text-xs sm:text-sm">{{ textFormattingExample }}</code></pre>
            </div>

            <!-- Autocomplete System Section -->
            <div class="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6 md:p-8 hover:shadow-md transition-shadow">
              <h2 class="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6 pb-2 sm:pb-3 border-b-2 border-indigo-600">Autocomplete System</h2>
              
              <h3 class="text-lg sm:text-xl font-semibold text-gray-800 mt-4 sm:mt-6 mb-3 sm:mb-4">How to Use</h3>
              <ol class="space-y-2 text-sm sm:text-base text-gray-700 list-decimal list-inside">
                <li><strong class="text-gray-900">Start typing</strong>: Type <code class="bg-indigo-100 text-indigo-800 px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm font-mono">\\</code> to trigger autocomplete</li>
                <li><strong class="text-gray-900">Browse suggestions</strong>: Use arrow keys or mouse to navigate</li>
                <li><strong class="text-gray-900">Select command</strong>: Press Tab, Enter, or click to insert</li>
                <li><strong class="text-gray-900">Close</strong>: Press Escape or click outside</li>
              </ol>
              
              <h3 class="text-lg sm:text-xl font-semibold text-gray-800 mt-4 sm:mt-6 mb-3 sm:mb-4">Supported Commands</h3>
              <p class="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4">The autocomplete includes:</p>
              <ul class="space-y-2 text-sm sm:text-base text-gray-700 list-disc list-inside">
                <li><strong class="text-gray-900">Greek letters</strong>: <code class="bg-indigo-100 text-indigo-800 px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm font-mono">\\alpha</code>, <code class="bg-indigo-100 text-indigo-800 px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm font-mono">\\beta</code>, <code class="bg-indigo-100 text-indigo-800 px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm font-mono">\\pi</code>, etc.</li>
                <li><strong class="text-gray-900">Math symbols</strong>: <code class="bg-indigo-100 text-indigo-800 px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm font-mono">\\sum</code>, <code class="bg-indigo-100 text-indigo-800 px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm font-mono">\\int</code>, <code class="bg-indigo-100 text-indigo-800 px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm font-mono">\\sqrt</code>, <code class="bg-indigo-100 text-indigo-800 px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm font-mono">\\frac</code>, etc.</li>
                <li><strong class="text-gray-900">Arrows</strong>: <code class="bg-indigo-100 text-indigo-800 px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm font-mono">\\rightarrow</code>, <code class="bg-indigo-100 text-indigo-800 px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm font-mono">\\leftarrow</code>, <code class="bg-indigo-100 text-indigo-800 px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm font-mono">\\Rightarrow</code>, etc.</li>
                <li><strong class="text-gray-900">Set theory</strong>: <code class="bg-indigo-100 text-indigo-800 px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm font-mono">\\in</code>, <code class="bg-indigo-100 text-indigo-800 px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm font-mono">\\subset</code>, <code class="bg-indigo-100 text-indigo-800 px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm font-mono">\\cup</code>, <code class="bg-indigo-100 text-indigo-800 px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm font-mono">\\cap</code>, etc.</li>
                <li><strong class="text-gray-900">Logic</strong>: <code class="bg-indigo-100 text-indigo-800 px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm font-mono">\\land</code>, <code class="bg-indigo-100 text-indigo-800 px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm font-mono">\\lor</code>, <code class="bg-indigo-100 text-indigo-800 px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm font-mono">\\neg</code>, <code class="bg-indigo-100 text-indigo-800 px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm font-mono">\\implies</code>, etc.</li>
                <li><strong class="text-gray-900">Functions</strong>: <code class="bg-indigo-100 text-indigo-800 px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm font-mono">\\sin</code>, <code class="bg-indigo-100 text-indigo-800 px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm font-mono">\\cos</code>, <code class="bg-indigo-100 text-indigo-800 px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm font-mono">\\log</code>, <code class="bg-indigo-100 text-indigo-800 px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm font-mono">\\exp</code>, etc.</li>
                <li><strong class="text-gray-900">Formatting</strong>: <code class="bg-indigo-100 text-indigo-800 px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm font-mono">\\mathbf</code>, <code class="bg-indigo-100 text-indigo-800 px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm font-mono">\\mathit</code>, <code class="bg-indigo-100 text-indigo-800 px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm font-mono">\\mathrm</code>, <code class="bg-indigo-100 text-indigo-800 px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm font-mono">\\text</code>, etc.</li>
              </ul>
            </div>

            <!-- Keyboard Shortcuts Section -->
            <div class="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6 md:p-8 hover:shadow-md transition-shadow">
              <h2 class="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6 pb-2 sm:pb-3 border-b-2 border-indigo-600">Keyboard Shortcuts</h2>
              
              <div class="overflow-x-auto -mx-4 sm:mx-0">
                <table class="w-full border-collapse my-3 sm:my-4 min-w-[300px]">
                  <thead>
                    <tr>
                      <th class="bg-indigo-100 text-indigo-900 px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold border-b-2 border-indigo-600 text-sm sm:text-base">Shortcut</th>
                      <th class="bg-indigo-100 text-indigo-900 px-3 sm:px-4 py-2 sm:py-3 text-left font-semibold border-b-2 border-indigo-600 text-sm sm:text-base">Action</th>
                    </tr>
                  </thead>
                  <tbody class="text-sm sm:text-base text-gray-700">
                    <tr class="border-b border-gray-200"><td class="px-3 sm:px-4 py-2 sm:py-3"><strong>Enter</strong></td><td class="px-3 sm:px-4 py-2 sm:py-3">Convert LaTeX to SVG</td></tr>
                    <tr class="border-b border-gray-200"><td class="px-3 sm:px-4 py-2 sm:py-3"><strong>Shift + Enter</strong></td><td class="px-3 sm:px-4 py-2 sm:py-3">Add newline in input</td></tr>
                    <tr class="border-b border-gray-200"><td class="px-3 sm:px-4 py-2 sm:py-3"><strong>Tab</strong></td><td class="px-3 sm:px-4 py-2 sm:py-3">Select autocomplete suggestion</td></tr>
                    <tr class="border-b border-gray-200"><td class="px-3 sm:px-4 py-2 sm:py-3"><strong>Arrow keys</strong></td><td class="px-3 sm:px-4 py-2 sm:py-3">Navigate autocomplete suggestions</td></tr>
                    <tr class="border-b border-gray-200"><td class="px-3 sm:px-4 py-2 sm:py-3"><strong>Escape</strong></td><td class="px-3 sm:px-4 py-2 sm:py-3">Close autocomplete</td></tr>
                    <tr><td class="px-3 sm:px-4 py-2 sm:py-3"><strong>\\</strong></td><td class="px-3 sm:px-4 py-2 sm:py-3">Trigger autocomplete</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Error Handling Section -->
            <div class="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6 md:p-8 hover:shadow-md transition-shadow">
              <h2 class="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6 pb-2 sm:pb-3 border-b-2 border-indigo-600">Error Handling</h2>
              <p class="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4">The tool provides clear error messages for:</p>
              <ul class="space-y-2 text-sm sm:text-base text-gray-700 list-disc list-inside">
                <li><strong class="text-gray-900">Empty input</strong>: "Please enter a LaTeX command"</li>
                <li><strong class="text-gray-900">Network errors</strong>: "Unable to fetch rendered image"</li>
                <li><strong class="text-gray-900">Invalid LaTeX</strong>: "The equation could not be rendered"</li>
                <li><strong class="text-gray-900">AI service errors</strong>: Rate limits, authentication, and service availability</li>
              </ul>
            </div>

            <!-- Tips & Best Practices Section -->
            <div class="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6 md:p-8 hover:shadow-md transition-shadow">
              <h2 class="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6 pb-2 sm:pb-3 border-b-2 border-indigo-600">Tips & Best Practices</h2>
              
              <h3 class="text-lg sm:text-xl font-semibold text-gray-800 mt-4 sm:mt-6 mb-3 sm:mb-4">LaTeX Syntax</h3>
              <ul class="space-y-2 text-sm sm:text-base text-gray-700 list-disc list-inside">
                <li><strong class="text-gray-900">Inline math</strong>: Use single <code class="bg-indigo-100 text-indigo-800 px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm font-mono">$</code> for equations within text</li>
                <li><strong class="text-gray-900">Display math</strong>: Use <code class="bg-indigo-100 text-indigo-800 px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm font-mono">$$</code> for centered equations</li>
                <li><strong class="text-gray-900">Text mode</strong>: Regular text is automatically wrapped in <code class="bg-indigo-100 text-indigo-800 px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm font-mono">\\text{{ '{' }}{{ '}' }}</code></li>
                <li><strong class="text-gray-900">Bold text</strong>: Use <code class="bg-indigo-100 text-indigo-800 px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm font-mono">\\mathbf{{ '{' }}{{ '}' }}</code> for mathematical bold</li>
                <li><strong class="text-gray-900">Italic text</strong>: Use <code class="bg-indigo-100 text-indigo-800 px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm font-mono">\\mathit{{ '{' }}{{ '}' }}</code> for mathematical italic</li>
              </ul>
              
              <h3 class="text-lg sm:text-xl font-semibold text-gray-800 mt-4 sm:mt-6 mb-3 sm:mb-4">Performance</h3>
              <ul class="space-y-2 text-sm sm:text-base text-gray-700 list-disc list-inside">
                <li><strong class="text-gray-900">Scale wisely</strong>: Higher point sizes create larger files</li>
                <li><strong class="text-gray-900">Use autocomplete</strong>: Faster than typing full commands</li>
                <li><strong class="text-gray-900">Check history</strong>: Reuse recent commands instead of retyping</li>
                <li><strong class="text-gray-900">Use AI fix</strong>: Let AI correct syntax errors automatically</li>
              </ul>
              
              <h3 class="text-lg sm:text-xl font-semibold text-gray-800 mt-4 sm:mt-6 mb-3 sm:mb-4">File Management</h3>
              <ul class="space-y-2 text-sm sm:text-base text-gray-700 list-disc list-inside">
                <li><strong class="text-gray-900">Smart filenames</strong>: Downloaded files include content and timestamp</li>
                <li><strong class="text-gray-900">SVG format</strong>: Vector graphics that scale perfectly</li>
                <li><strong class="text-gray-900">Clipboard support</strong>: Copy SVG for use in other applications</li>
              </ul>
            </div>

            <!-- Troubleshooting Section -->
            <div class="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6 md:p-8 hover:shadow-md transition-shadow">
              <h2 class="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6 pb-2 sm:pb-3 border-b-2 border-indigo-600">Troubleshooting</h2>
              
              <h3 class="text-lg sm:text-xl font-semibold text-gray-800 mt-4 sm:mt-6 mb-3 sm:mb-4">Common Issues</h3>
              
              <p class="text-sm sm:text-base text-gray-900 font-semibold mb-2">Autocomplete not working?</p>
              <ul class="mb-3 sm:mb-4 ml-4 sm:ml-6 space-y-2 text-sm sm:text-base text-gray-700 list-disc">
                <li>Make sure you're typing <code class="bg-indigo-100 text-indigo-800 px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm font-mono">\\</code> (backslash)</li>
                <li>Check if your browser supports the required APIs</li>
                <li>Try refreshing the page</li>
              </ul>
              
              <p class="text-sm sm:text-base text-gray-900 font-semibold mb-2">Image not rendering?</p>
              <ul class="mb-3 sm:mb-4 ml-4 sm:ml-6 space-y-2 text-sm sm:text-base text-gray-700 list-disc">
                <li>Check your LaTeX syntax</li>
                <li>Use the AI fix button to correct errors</li>
                <li>Ensure you have an internet connection</li>
                <li>Try a simpler example first</li>
              </ul>
              
              <p class="text-sm sm:text-base text-gray-900 font-semibold mb-2">AI fix not working?</p>
              <ul class="mb-3 sm:mb-4 ml-4 sm:ml-6 space-y-2 text-sm sm:text-base text-gray-700 list-disc">
                <li>Check if you have valid LaTeX code to fix</li>
                <li>Ensure you have an internet connection</li>
                <li>Try again later if rate limited</li>
              </ul>
              
              <p class="text-sm sm:text-base text-gray-900 font-semibold mb-2">Copy/Download not working?</p>
              <ul class="mb-3 sm:mb-4 ml-4 sm:ml-6 space-y-2 text-sm sm:text-base text-gray-700 list-disc">
                <li>Make sure an image has been rendered first</li>
                <li>Check browser permissions for clipboard access</li>
                <li>Try a different browser</li>
              </ul>
              
              <h3 class="text-lg sm:text-xl font-semibold text-gray-800 mt-4 sm:mt-6 mb-3 sm:mb-4">Getting Help</h3>
              <p class="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4">If you encounter issues not covered here:</p>
              <ol class="space-y-2 text-sm sm:text-base text-gray-700 list-decimal list-inside">
                <li>Check the browser console for error messages</li>
                <li>Try refreshing the page</li>
                <li>Test with a simple example like <code class="bg-indigo-100 text-indigo-800 px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs sm:text-sm font-mono">$x^2$</code></li>
                <li>Use the AI fix feature for syntax errors</li>
                <li>Contact the developer with specific error details</li>
              </ol>
            </div>

            <!-- PWA Section -->
            <div class="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6 md:p-8 hover:shadow-md transition-shadow">
              <h2 class="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6 pb-2 sm:pb-3 border-b-2 border-indigo-600">Progressive Web App (PWA)</h2>
              <p class="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4">This tool can be installed as a Progressive Web App for a better experience:</p>
              <ul class="space-y-2 text-sm sm:text-base text-gray-700 list-disc list-inside">
                <li><strong class="text-gray-900">Installation</strong>: Look for the install prompt that appears when you visit the site</li>
                <li><strong class="text-gray-900">Offline Access</strong>: Once installed, the app works offline for previously rendered equations</li>
                <li><strong class="text-gray-900">Native Experience</strong>: Get app-like experience with standalone window and shortcuts</li>
                <li><strong class="text-gray-900">File Handling</strong>: Open SVG files directly from your device</li>
              </ul>
            </div>

            <!-- Need More Help Section -->
            <div class="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6 md:p-8 hover:shadow-md transition-shadow">
              <h2 class="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6 pb-2 sm:pb-3 border-b-2 border-indigo-600">Need More Help?</h2>
              <ul class="space-y-2 text-sm sm:text-base text-gray-700 list-disc list-inside">
                <li><strong class="text-gray-900">LaTeX Reference</strong>: See the <a href="https://editor.codecogs.com/docs" class="text-indigo-600 hover:underline font-medium" target="_blank" rel="noopener noreferrer">CodeCogs Equation Editor Documentation</a> for complete LaTeX syntax</li>
                <li><strong class="text-gray-900">Examples</strong>: Click the example chips on the main page for sample code</li>
                <li><strong class="text-gray-900">Contact</strong>: For issues with this tool, contact <a href="https://x.com/abhinav_937" class="text-indigo-600 hover:underline font-medium" target="_blank" rel="noopener noreferrer">Abhinav Chinnusamy</a></li>
                <li><strong class="text-gray-900">GitHub</strong>: View the source code and contribute at <a href="https://github.com/abhinav937/latex-to-svg" class="text-indigo-600 hover:underline font-medium" target="_blank" rel="noopener noreferrer">GitHub Repository</a></li>
              </ul>
            </div>
          </div>
          
          <!-- Back to Top -->
          <div class="text-center mt-8 sm:mt-12 pt-4 sm:pt-6 border-t border-gray-200">
            <button (click)="scrollToTop()" class="text-sm sm:text-base text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
              ↑ Back to Top
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class HelpComponent {
  // LaTeX examples stored as strings to avoid template parsing issues
  basicMathExample = `$E = mc^2$
$\\frac{a}{b}$
$\\sqrt{x^2 + y^2}$`;

  greekLettersExample = `$\\alpha, \\beta, \\gamma, \\delta$
$\\pi, \\theta, \\phi, \\omega$
$\\sum_{i=1}^{n} x_i$`;

  advancedMathExample = `$$\\int_{0}^{\\infty} e^{-x} dx = 1$$
$$\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$$
$$\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$$`;

  textFormattingExample = `$\\text{Hello World}$
$\\mathbf{bold text}$
$\\mathit{italic text}$
$\\mathrm{roman text}$
R_{DS}
R\\textsubscript{ds,on}`;

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
