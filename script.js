const BASE_PT_SIZE = 12; // Baseline point size where scale = 1

// PWA (Progressive Web App) functionality
let deferredPrompt;

// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Listen for the beforeinstallprompt event
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later
  deferredPrompt = e;
  
  // Show install button or notification
  showInstallPrompt();
});

// Listen for successful installation
window.addEventListener('appinstalled', (evt) => {
  console.log('App was installed');
  // Hide the install prompt if it exists
  hideInstallPrompt();
});

// Show install prompt
function showInstallPrompt() {
  // Create install prompt if it doesn't exist
  if (!document.getElementById('install-prompt')) {
    const installPrompt = document.createElement('div');
    installPrompt.id = 'install-prompt';
    installPrompt.className = 'install-prompt';
    installPrompt.innerHTML = `
      <div class="install-content">
        <span class="material-symbols-outlined">download</span>
        <span>Install LaTeX Generator as an app for easy access!</span>
        <button onclick="installPWA()" class="install-btn">Install</button>
        <button onclick="hideInstallPrompt()" class="dismiss-btn">×</button>
      </div>
    `;
    document.body.appendChild(installPrompt);
  }
}

// Hide install prompt
function hideInstallPrompt() {
  const prompt = document.getElementById('install-prompt');
  if (prompt) {
    prompt.remove();
  }
}

// Install PWA function
async function installPWA() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    deferredPrompt = null;
    hideInstallPrompt();
  }
}

// Mobile detection utility
function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
         window.innerWidth <= 768;
}

// Enhanced LaTeX Autocomplete System
class LaTeXAutocomplete {
  constructor() {
    // Disable autocomplete on mobile devices
    if (isMobileDevice()) {
      console.log('Autocomplete disabled on mobile device');
      return;
    }
    
    this.commands = [];
    this.filteredCommands = [];
    this.currentIndex = -1;
    this.isVisible = false;
    this.container = null;
    this.input = null;
    this.context = { isMathMode: false, currentPosition: 0 };
    this.debounceTimer = null;
    this.commandCache = new Map(); // Cache for command filtering results
    this.lastSearchTerm = ''; // Track the last search term to prevent unnecessary re-renders
    this.isInitialized = false; // Track initialization status
    this.initPromise = null; // Promise for initialization
    this.symbolMap = {
      // Greek letters (lowercase)
      '\\alpha': 'α', '\\beta': 'β', '\\gamma': 'γ', '\\delta': 'δ', '\\epsilon': 'ε',
      '\\zeta': 'ζ', '\\eta': 'η', '\\theta': 'θ', '\\iota': 'ι', '\\kappa': 'κ',
      '\\lambda': 'λ', '\\mu': 'μ', '\\nu': 'ν', '\\xi': 'ξ', '\\pi': 'π',
      '\\rho': 'ρ', '\\sigma': 'σ', '\\tau': 'τ', '\\upsilon': 'υ', '\\phi': 'φ',
      '\\chi': 'χ', '\\psi': 'ψ', '\\omega': 'ω',
      
      // Greek letters (uppercase)
      '\\Alpha': 'Α', '\\Beta': 'Β', '\\Gamma': 'Γ', '\\Delta': 'Δ', '\\Epsilon': 'Ε',
      '\\Zeta': 'Ζ', '\\Eta': 'Η', '\\Theta': 'Θ', '\\Iota': 'Ι', '\\Kappa': 'Κ',
      '\\Lambda': 'Λ', '\\Mu': 'Μ', '\\Nu': 'Ν', '\\Xi': 'Ξ', '\\Pi': 'Π',
      '\\Rho': 'Ρ', '\\Sigma': 'Σ', '\\Tau': 'Τ', '\\Upsilon': 'Υ', '\\Phi': 'Φ',
      '\\Chi': 'Χ', '\\Psi': 'Ψ', '\\Omega': 'Ω',
      
      // Math symbols
      '\\infty': '∞', '\\partial': '∂', '\\nabla': '∇', '\\sum': '∑',
      '\\int': '∫', '\\oint': '∮', '\\sqrt': '√', '\\pm': '±', '\\mp': '∓',
      '\\times': '×', '\\div': '÷', '\\leq': '≤', '\\geq': '≥', '\\neq': '≠',
      '\\approx': '≈', '\\equiv': '≡', '\\propto': '∝', '\\perp': '⊥', '\\parallel': '∥',
      '\\angle': '∠', '\\triangle': '△', '\\square': '□', '\\circle': '○',
      '\\diamond': '◇', '\\bullet': '•', '\\cdot': '·', '\\circ': '∘',
      
      // Arrows
      '\\rightarrow': '→', '\\leftarrow': '←', '\\leftrightarrow': '↔',
      '\\Rightarrow': '⇒', '\\Leftarrow': '⇐', '\\Leftrightarrow': '⇔',
      '\\uparrow': '↑', '\\downarrow': '↓', '\\updownarrow': '↕',
      '\\nearrow': '↗', '\\nwarrow': '↖', '\\searrow': '↘', '\\swarrow': '↙',
      
      // Set theory
      '\\in': '∈', '\\notin': '∉', '\\ni': '∋', '\\subset': '⊂', '\\supset': '⊃',
      '\\subseteq': '⊆', '\\supseteq': '⊇', '\\cup': '∪', '\\cap': '∩',
      '\\emptyset': '∅', '\\forall': '∀', '\\exists': '∃',
      
      // Logic
      '\\land': '∧', '\\lor': '∨', '\\neg': '¬', '\\implies': '⟹', '\\iff': '⟺',
      '\\top': '⊤', '\\bot': '⊥',
      
      // Calculus
      '\\lim': 'lim', '\\liminf': 'lim inf', '\\limsup': 'lim sup',
      '\\inf': 'inf', '\\sup': 'sup', '\\max': 'max', '\\min': 'min',
      
      // Operators
      '\\oplus': '⊕', '\\otimes': '⊗', '\\ominus': '⊖', '\\oslash': '⊘',
      '\\bigodot': '⨀',
      
      // Relations
      '\\sim': '∼', '\\simeq': '≃', '\\cong': '≅', '\\asymp': '≍',
      '\\prec': '≺', '\\succ': '≻', '\\preceq': '⪯', '\\succeq': '⪰',
      
      // Functions
      '\\sin': 'sin', '\\cos': 'cos', '\\tan': 'tan', '\\cot': 'cot',
      '\\sec': 'sec', '\\csc': 'csc', '\\arcsin': 'arcsin', '\\arccos': 'arccos',
      '\\arctan': 'arctan', '\\sinh': 'sinh', '\\cosh': 'cosh', '\\tanh': 'tanh',
      '\\log': 'log', '\\ln': 'ln', '\\exp': 'exp',
      
      // Number sets
      '\\mathbb{R}': 'ℝ', '\\mathbb{Z}': 'ℤ', '\\mathbb{N}': 'ℕ', '\\mathbb{Q}': 'ℚ',
      '\\mathbb{C}': 'ℂ', '\\mathbb{P}': 'ℙ',
      
      // Other symbols
      '\\degree': '°', '\\prime': '′', '\\doubleprime': '″', '\\ell': 'ℓ',
      '\\hbar': 'ℏ', '\\imath': 'ı', '\\jmath': 'ȷ', '\\aleph': 'ℵ',
      '\\beth': 'ℶ', '\\gimel': 'ℷ', '\\daleth': 'ℸ',
      
      // Arrows with text
      '\\xrightarrow': '→', '\\xleftarrow': '←', '\\xleftrightarrow': '↔',
      '\\xRightarrow': '⇒', '\\xLeftarrow': '⇐', '\\xLeftrightarrow': '⇔',
      
      // Delimiters
      '\\langle': '⟨', '\\rangle': '⟩', '\\lceil': '⌈', '\\rceil': '⌉',
      '\\lfloor': '⌊', '\\rfloor': '⌋',
      
      // Misc math
      '\\therefore': '∴', '\\because': '∵', '\\qed': '∎', '\\blacksquare': '■',
      '\\blacktriangle': '▲', '\\blacktriangledown': '▼', '\\star': '★',
      '\\bigstar': '★', '\\clubsuit': '♣', '\\diamondsuit': '♦', '\\heartsuit': '♥', '\\spadesuit': '♠',
      
      // Common math commands (text representations)
      '\\frac': 'a/b', '\\sqrt': '√x', '\\lim': 'lim', '\\sum': '∑',
      '\\int': '∫', '\\oint': '∮', '\\partial': '∂', '\\nabla': '∇',
      '\\text': 'text', '\\mathbf': 'bold', '\\mathit': 'italic', '\\mathrm': 'roman'
    };
    this.init();
  }

  async init() {
    if (this.isInitialized) {
      return;
    }

    this.initPromise = new Promise(async (resolve) => {
      try {
        const response = await fetch('./latex-commands.json');
        const data = await response.json();
        this.commands = data.commands;
        this.isInitialized = true;
        console.log(`LaTeX autocomplete initialized with ${this.commands.length} commands`);
        
        // Preload common images in the background
        this.preloadCommonImages();
        
        resolve();
      } catch (error) {
        console.error('Failed to load LaTeX commands:', error);
        // Fallback to basic commands if JSON fails to load
        this.commands = [
          { command: "\\frac", arguments: "{numerator}{denominator}", description: "Fraction", example: "\\frac{1}{2}", category: "math" },
          { command: "\\sum", arguments: "_{lower}^{upper}", description: "Summation", example: "\\sum_{i=1}^{n}", category: "math" },
          { command: "\\int", arguments: "_{lower}^{upper}", description: "Integral", example: "\\int_{0}^{\\infty}", category: "math" },
          { command: "\\sqrt", arguments: "[degree]{radicand}", description: "Square root", example: "\\sqrt{x}", category: "math" },
          { command: "\\alpha", arguments: "", description: "Greek letter alpha", example: "\\alpha", category: "greek" },
          { command: "\\beta", arguments: "", description: "Greek letter beta", example: "\\beta", category: "greek" },
          { command: "\\gamma", arguments: "", description: "Greek letter gamma", example: "\\gamma", category: "greek" },
          { command: "\\delta", arguments: "", description: "Greek letter delta", example: "\\delta", category: "greek" }
        ];
        this.isInitialized = true; // Ensure it's marked as initialized even on error
        console.log('Using fallback LaTeX commands');
        
        // Preload common images in the background
        this.preloadCommonImages();
        
        resolve(); // Resolve anyway to allow other parts to proceed
      }
    });

    await this.initPromise;
  }

  // Force initialization (useful for debugging)
  async forceInit() {
    this.isInitialized = false;
    this.initPromise = null;
    await this.init();
  }

  // Check if autocomplete is ready to use
  isReady() {
    return this.isInitialized && this.commands.length > 0;
  }

  // Get loading status for user feedback
  getLoadingStatus() {
    if (this.isInitialized) {
      return {
        ready: true,
        commandsLoaded: this.commands.length,
        message: `Ready with ${this.commands.length} commands`
      };
    } else {
      return {
        ready: false,
        commandsLoaded: 0,
        message: 'Loading commands...'
      };
    }
  }

  // Preload common LaTeX rendering images for better performance
  async preloadCommonImages() {
    const commonCommands = [
      '\\frac{1}{2}',
      '\\sum_{i=1}^{n}',
      '\\int_{0}^{1}',
      '\\sqrt{x}',
      '\\alpha',
      '\\beta',
      '\\gamma',
      '\\delta'
    ];

    const preloadPromises = commonCommands.map(async (command) => {
      try {
        const encodedLatex = encodeURIComponent(`\\dpi{150} \\color{black} ${command}`);
        const imgUrl = `https://latex.codecogs.com/svg?${encodedLatex}`;
        
        // Create a hidden image element to preload
        const img = new Image();
        img.style.display = 'none';
        document.body.appendChild(img);
        
        return new Promise((resolve) => {
          img.onload = () => {
            document.body.removeChild(img);
            resolve();
          };
          img.onerror = () => {
            document.body.removeChild(img);
            resolve(); // Resolve even on error to not block
          };
          img.src = imgUrl;
        });
      } catch (error) {
        console.warn('Failed to preload image for:', command);
        return Promise.resolve();
      }
    });

    // Preload in background without blocking
    Promise.all(preloadPromises).then(() => {
      console.log('Common LaTeX images preloaded');
    });
  }

  // Simple Context Detection
  detectContext(inputValue, cursorPosition) {
    const beforeCursor = inputValue.substring(0, cursorPosition);
    
    // Detect if we're inside brackets
    const bracketStack = [];
    let isInsideBrackets = false;
    let bracketDepth = 0;
    
    for (let i = 0; i < beforeCursor.length; i++) {
      const char = beforeCursor[i];
      if (char === '{') {
        bracketStack.push('{');
        bracketDepth++;
      } else if (char === '}') {
        bracketStack.pop();
        bracketDepth--;
      }
    }
    
    isInsideBrackets = bracketDepth > 0;
    
    // Detect if we're after a backslash (command context)
    const afterBackslash = beforeCursor.match(/\\[a-zA-Z]*$/);
    
    return {
      isMathMode: false, // Always false - no smart detection
      isInsideBrackets,
      bracketDepth,
      afterBackslash: afterBackslash ? afterBackslash[0] : null,
      currentPosition: cursorPosition
    };
  }

  // Enhanced Search & Filtering with Fuzzy Search and Caching
  fuzzySearch(searchTerm, text) {
    const pattern = searchTerm.split('').join('.*');
    const regex = new RegExp(pattern, 'i');
    return regex.test(text);
  }

  filterCommands(searchTerm, context) {
    if (!searchTerm.startsWith('\\')) {
      this.filteredCommands = [];
      return;
    }

    // Check cache first
    const cacheKey = searchTerm.toLowerCase();
    if (this.commandCache.has(cacheKey)) {
      this.filteredCommands = this.commandCache.get(cacheKey);
      return;
    }

    const term = searchTerm.toLowerCase();
    let filtered = this.commands.filter(cmd => {
      // If just backslash is typed, show all commands
      if (term === '\\') {
        return true;
      }
      
      // Basic matching with early return for performance
      const commandMatch = cmd.command.toLowerCase().includes(term);
      if (commandMatch) return true;
      
      const descriptionMatch = cmd.description.toLowerCase().includes(term);
      if (descriptionMatch) return true;
      
      // Only do fuzzy search if basic matching fails
      return this.fuzzySearch(term, cmd.command) || this.fuzzySearch(term, cmd.description);
    });

    // Simple ranking with early optimization
    filtered = filtered.map(cmd => {
      let score = 0;
      
      // Exact command match gets highest score
      if (cmd.command.toLowerCase() === term) score += 100;
      else if (cmd.command.toLowerCase().startsWith(term)) score += 50;
      else if (cmd.command.toLowerCase().includes(term)) score += 25;
      
      // Description match
      if (cmd.description.toLowerCase().includes(term)) score += 10;
      
      // Common commands bonus
      const commonCommands = ['\\frac', '\\sum', '\\int', '\\sqrt', '\\alpha', '\\beta'];
      if (commonCommands.includes(cmd.command)) score += 15;
      
      return { ...cmd, score };
    });

    // Sort by score and limit results
    this.filteredCommands = filtered
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
    
    // Cache the result
    this.commandCache.set(cacheKey, this.filteredCommands);
    
    // Limit cache size to prevent memory leaks
    if (this.commandCache.size > 100) {
      const firstKey = this.commandCache.keys().next().value;
      this.commandCache.delete(firstKey);
    }
  }

  createAutocompleteContainer() {
    if (this.container) return;

    this.container = document.createElement('div');
    this.container.id = 'latex-autocomplete';
    this.container.style.display = 'none';
    this.container.style.opacity = '0';
    this.container.style.transform = 'translateY(-8px)';
    this.container.style.transition = 'opacity var(--md-sys-motion-easing-emphasized) var(--md-sys-motion-duration-medium2), transform var(--md-sys-motion-easing-emphasized) var(--md-sys-motion-duration-medium2)';
    
    // Material UI themed styling - now handled by CSS
    this.container.style.position = 'absolute';
    this.container.style.zIndex = '10000';
    this.container.style.minWidth = '320px';
    this.container.style.maxWidth = '480px';
    this.container.style.maxHeight = '320px';
    this.container.style.overflowY = 'auto';

    document.body.appendChild(this.container);
  }

  // Material Design Command Previews
  renderSuggestions() {
    console.log('Rendering suggestions:', this.filteredCommands.length); // Debug
    this.container.innerHTML = '';

    this.filteredCommands.forEach((cmd, index) => {
      const item = document.createElement('div');
      item.className = 'autocomplete-item';
      item.setAttribute('role', 'option');
      item.setAttribute('aria-selected', 'false');
      item.setAttribute('tabindex', '-1');

      // Command
      const commandSpan = document.createElement('div');
      commandSpan.className = 'command';
      // Show command with empty brackets instead of filled arguments
      let displayCommand = cmd.command;
      if (cmd.arguments && cmd.arguments.trim() !== '') {
        // Replace argument content with empty brackets
        displayCommand += cmd.arguments.replace(/\{[^}]*\}/g, '{}');
      }
      commandSpan.textContent = displayCommand;
      
      // Description
      const descSpan = document.createElement('div');
      descSpan.className = 'description';
      descSpan.textContent = cmd.description;
      
      // Actual LaTeX rendering preview
      const previewSpan = document.createElement('div');
      previewSpan.className = 'latex-preview';
      // Material UI themed styling - now handled by CSS
      
      // Create a simple LaTeX expression for preview
      let latexExpression = cmd.command;
      
      // Add sample arguments for commands that need them
      if (cmd.command === '\\frac') {
        latexExpression = '\\frac{1}{2}';
      } else if (cmd.command === '\\sqrt') {
        latexExpression = '\\sqrt{x}';
      } else if (cmd.command === '\\sum') {
        latexExpression = '\\sum_{i=1}^{n}';
      } else if (cmd.command === '\\int') {
        latexExpression = '\\int_{0}^{1}';
      } else if (cmd.command === '\\lim') {
        latexExpression = '\\lim_{x \\to 0}';


      } else if (cmd.command === '\\mathbf') {
        latexExpression = '\\mathbf{x}';
      } else if (cmd.command === '\\mathit') {
        latexExpression = '\\mathit{x}';
      } else if (cmd.command === '\\mathrm') {
        latexExpression = '\\mathrm{sin}';
      } else if (cmd.arguments && cmd.arguments.trim() !== '') {
        // For commands with arguments, create a sample
        latexExpression = cmd.command + cmd.arguments.replace(/\{[^}]*\}/g, '{x}');
      }
      
      // Render the LaTeX using the same service as the main app
      const img = new Image();
      // Material UI themed styling - now handled by CSS
      img.alt = cmd.command;
      
      img.onload = () => {
        previewSpan.innerHTML = '';
        previewSpan.appendChild(img);
      };
      
      img.onerror = () => {
        // Fallback to text if rendering fails
        previewSpan.innerHTML = `<span style="font-size: 12px; color: #666; font-style: italic;">${cmd.command.replace('\\', '')}</span>`;
      };
      
      // Use the same rendering service as the main app
      const encodedLatex = encodeURIComponent(`\\dpi{150} \\color{black} ${latexExpression}`);
      img.src = `https://latex.codecogs.com/svg?${encodedLatex}`;
      
      item.appendChild(previewSpan);

      // Example
      if (cmd.example) {
        const exampleSpan = document.createElement('div');
        exampleSpan.className = 'example';
        exampleSpan.textContent = cmd.example;
        item.appendChild(exampleSpan);
      }

      // Category badge
      if (cmd.category) {
        const categoryBadge = document.createElement('span');
        categoryBadge.className = 'category-badge';
        categoryBadge.textContent = cmd.category;
        item.appendChild(categoryBadge);
      }

      item.appendChild(commandSpan);
      item.appendChild(descSpan);

      // Enhanced hover effects with Material Design interactions
      item.addEventListener('mouseenter', () => {
        this.currentIndex = index;
        this.highlightItem();
      });

      item.addEventListener('click', () => {
        this.selectCommand(cmd);
        // Add ripple effect
        const ripple = document.createElement('div');
        ripple.style.position = 'absolute';
        ripple.style.top = '50%';
        ripple.style.left = '50%';
        ripple.style.width = '0';
        ripple.style.height = '0';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(25, 118, 210, 0.2)';
        ripple.style.transform = 'translate(-50%, -50%)';
        ripple.style.transition = 'all 0.3s ease-out';
        item.style.position = 'relative';
        item.appendChild(ripple);
        
        requestAnimationFrame(() => {
          ripple.style.width = '100px';
          ripple.style.height = '100px';
          ripple.style.opacity = '0';
        });
        
        setTimeout(() => {
          if (ripple.parentNode) {
            ripple.parentNode.removeChild(ripple);
          }
        }, 300);
      });
      
      this.container.appendChild(item);
    });

    // Add keyboard navigation and accessibility
    this.container.setAttribute('role', 'listbox');
    this.container.setAttribute('aria-label', 'LaTeX command suggestions');
    this.container.addEventListener('keydown', (e) => this.handleKeydown(e));
  }

  getCategoryColor(category) {
    const colors = {
      'math': '#1976d2',
      'greek': '#388e3c',
      'text': '#f57c00',
      'symbols': '#7b1fa2',
      'arrows': '#d32f2f'
    };
    return colors[category] || '#666';
  }

  highlightItem() {
    const items = this.container.querySelectorAll('.autocomplete-item');
    items.forEach((item, index) => {
      if (index === this.currentIndex) {
        item.classList.add('selected');
        item.setAttribute('aria-selected', 'true');
        // Ensure the selected item is visible
        if (item.offsetTop < this.container.scrollTop) {
          this.container.scrollTop = item.offsetTop - 8;
        } else if (item.offsetTop + item.offsetHeight > this.container.scrollTop + this.container.clientHeight) {
          this.container.scrollTop = item.offsetTop + item.offsetHeight - this.container.clientHeight + 8;
        }
      } else {
        item.classList.remove('selected');
        item.setAttribute('aria-selected', 'false');
      }
    });
  }

  handleKeydown(e) {
    if (!this.isVisible) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.currentIndex = Math.min(this.currentIndex + 1, this.filteredCommands.length - 1);
        this.highlightItem();
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.currentIndex = Math.max(this.currentIndex - 1, -1);
        this.highlightItem();
        break;
      case 'Tab':
        e.preventDefault();
        if (this.currentIndex >= 0 && this.currentIndex < this.filteredCommands.length) {
          this.selectCommand(this.filteredCommands[this.currentIndex]);
        } else if (this.filteredCommands.length > 0) {
          // If no item is selected, select the first one
          this.currentIndex = 0;
          this.selectCommand(this.filteredCommands[0]);
        }
        break;
      case 'Enter':
        e.preventDefault();
        if (this.currentIndex >= 0 && this.currentIndex < this.filteredCommands.length) {
          this.selectCommand(this.filteredCommands[this.currentIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        this.hideAutocomplete();
        break;
    }
  }

  // Simple command insertion without cursor positioning
  selectCommand(cmd) {
    if (!this.input) return;

    let inputValue = '';
    
    // Handle Material Web Components
    if (this.input.tagName === 'MD-OUTLINED-TEXT-FIELD') {
      inputValue = this.input.value || '';
    } else {
      inputValue = this.input.value;
    }
    
    // Find the start of the current command
    const cursorPosition = this.input.tagName === 'MD-OUTLINED-TEXT-FIELD' ? inputValue.length : this.input.selectionStart;
    const beforeCursor = inputValue.substring(0, cursorPosition);
    const afterCursor = inputValue.substring(cursorPosition);
    
    const match = beforeCursor.match(/\\[a-zA-Z]*$/);
    if (!match) return;

    const startPos = cursorPosition - match[0].length;
    
    // Build the command with empty brackets
    let commandToInsert = cmd.command;
    
    // Handle nested brackets and arguments properly
    if (cmd.arguments && cmd.arguments.trim() !== '') {
      // Replace argument content with empty brackets
      const emptyArgs = cmd.arguments.replace(/\{[^}]*\}/g, '{}');
      commandToInsert += emptyArgs;
    }
    
    const newValue = inputValue.substring(0, startPos) + commandToInsert + afterCursor;
    
    // Update the input value
    if (this.input.tagName === 'MD-OUTLINED-TEXT-FIELD') {
      this.input.value = newValue;
      this.input.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
      this.input.value = newValue;
    }
    
    // Position cursor at the first parameter position
    const newCursorPosition = startPos + commandToInsert.length;
    let finalCursorPosition = newCursorPosition;
    
    // If the command has arguments, position cursor inside the first set of brackets
    if (cmd.arguments && cmd.arguments.trim() !== '') {
      // Find the position of the first opening brace after the command
      const commandEndPos = startPos + cmd.command.length;
      const firstBracePos = newValue.indexOf('{', commandEndPos);
      if (firstBracePos !== -1) {
        finalCursorPosition = firstBracePos + 1; // Position inside the first bracket
      }
    }
    
    // Set cursor position
    if (this.input.tagName === 'MD-OUTLINED-TEXT-FIELD') {
      // For Material Web Components, we need to find the actual input element
      const actualInput = this.input.querySelector('input, textarea') || this.input.shadowRoot?.querySelector('input, textarea');
      if (actualInput) {
        actualInput.setSelectionRange(finalCursorPosition, finalCursorPosition);
        actualInput.focus();
      } else {
        // Fallback: try to set selection on the Material Web Component itself
        this.input.focus();
        // Use setTimeout to ensure the component is ready
        setTimeout(() => {
          if (this.input.setSelectionRange) {
            this.input.setSelectionRange(finalCursorPosition, finalCursorPosition);
          }
        }, 0);
      }
    } else {
      this.input.setSelectionRange(finalCursorPosition, finalCursorPosition);
      this.input.focus();
    }
    
    this.hideAutocomplete();
    
    // Trigger input event to update any listeners
    this.input.dispatchEvent(new Event('input', { bubbles: true }));
  }

  async showAutocomplete(input, cursorPosition) {
    // Wait for initialization to complete
    if (!this.isInitialized && this.initPromise) {
      await this.initPromise;
    }
    
    if (!this.container) this.createAutocompleteContainer();

    const inputRect = input.getBoundingClientRect();
    let inputValue = '';
    
    // Handle Material Web Components
    if (input.tagName === 'MD-OUTLINED-TEXT-FIELD') {
      inputValue = input.value || '';
    } else {
      inputValue = input.value;
    }
    
    // Detect context
    this.context = this.detectContext(inputValue, cursorPosition);
    
    // Find the current word being typed
    const beforeCursor = inputValue.substring(0, cursorPosition);
    const match = beforeCursor.match(/\\[a-zA-Z]*$/);
    
    // Check if we just typed a backslash (single backslash)
    const justBackslash = beforeCursor.endsWith('\\');
    
    // Only hide autocomplete if we're not typing a LaTeX command
    if (!match && !justBackslash) {
      // Only hide if we were previously showing autocomplete
      if (this.isVisible) {
        this.hideAutocomplete();
      }
      return;
    }

    // Additional check: if we're not at the end of a backslash command, don't show
    const afterCursor = inputValue.substring(cursorPosition);
    const isInMiddleOfCommand = match && afterCursor.match(/^[a-zA-Z]/);
    if (isInMiddleOfCommand) {
      // Don't show autocomplete if we're in the middle of typing a command
      return;
    }

    const searchTerm = match ? match[0] : '\\';
    this.filterCommands(searchTerm, this.context);

    // If no commands match, hide autocomplete
    if (this.filteredCommands.length === 0) {
      if (this.isVisible) {
        this.hideAutocomplete();
      }
      return;
    }

    // If autocomplete is already visible and we have the same results, don't re-render
    if (this.isVisible && this.container.style.display !== 'none') {
      // Only update if the search term has changed significantly
      const currentSearchTerm = this.lastSearchTerm || '';
      if (searchTerm === currentSearchTerm) {
        return; // Don't re-render if search term hasn't changed
      }
    }

    this.lastSearchTerm = searchTerm;

    // Show loading state only if not already visible
    if (!this.isVisible) {
      this.container.innerHTML = `
        <div style="padding: 16px; text-align: center; color: var(--md-sys-color-on-surface-variant);">
          <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
            <div style="width: 16px; height: 16px; border: 2px solid var(--md-sys-color-outline); border-top: 2px solid var(--md-sys-color-primary); border-radius: 50%; animation: spin 1s linear infinite;"></div>
            Loading suggestions...
          </div>
        </div>
      `;
      this.container.style.display = 'block';
      
      // Trigger animation
      requestAnimationFrame(() => {
        this.container.style.opacity = '1';
        this.container.style.transform = 'translateY(0)';
      });
    }

    // Position the autocomplete dropdown with Material Design spacing
    const inputStyle = window.getComputedStyle(input);
    const lineHeight = parseInt(inputStyle.lineHeight) || 20;
    const lines = beforeCursor.split('\n').length;
    const topOffset = lines * lineHeight + 48; // Material Design spacing

    // Ensure the dropdown doesn't go off-screen
    const containerHeight = Math.min(this.filteredCommands.length * 48, 320); // Material Design item height
    const viewportHeight = window.innerHeight;
    const bottomSpace = viewportHeight - inputRect.top - topOffset - containerHeight;
    
    let finalTop = inputRect.top + topOffset;
    if (bottomSpace < 24) { // Material Design spacing
      // Position above the input if not enough space below
      finalTop = inputRect.top - containerHeight - 16;
    }

    this.container.style.top = `${finalTop}px`;
    this.container.style.left = `${inputRect.left}px`;
    this.container.style.width = `${Math.max(320, inputRect.width)}px`;

    // Render suggestions immediately if already visible, or after a brief delay for new visibility
    if (this.isVisible) {
      this.renderSuggestions();
    } else {
      setTimeout(() => {
        this.renderSuggestions();
      }, 50);
    }
    
    this.isVisible = true;
    this.currentIndex = 0; // Select the first item by default
    
    // Highlight the first item after rendering
    setTimeout(() => {
      this.highlightItem();
    }, 60);
  }

  hideAutocomplete() {
    if (this.container && this.isVisible) {
      // Animate out
      this.container.style.opacity = '0';
      this.container.style.transform = 'translateY(-8px)';
      
      setTimeout(() => {
        if (this.container) {
          this.container.style.display = 'none';
        }
      }, 200); // Match the transition duration
    }
    this.isVisible = false;
    this.currentIndex = -1;
    this.lastSearchTerm = ''; // Reset the last search term
  }

  attachToInput(input) {
    // For Material Web Components, we need to find the actual input element
    let actualInput = input;
    if (input.tagName === 'MD-OUTLINED-TEXT-FIELD') {
      // Find the actual input element inside the Material Web Component
      actualInput = input.querySelector('input, textarea') || input.shadowRoot?.querySelector('input, textarea');
      
      // If we can't find the actual input, work with the Material Web Component directly
      if (!actualInput) {
        this.input = input;
        
        // Track selection state to detect text replacement
        let hadSelection = false;
        
        // Listen for selection changes
        input.addEventListener('select', () => {
          const actualInput = input.querySelector('input, textarea');
          if (actualInput) {
            hadSelection = actualInput.selectionStart !== actualInput.selectionEnd;
          }
        });
        
        // Optimized event handling with debouncing
        const debouncedShowAutocomplete = async (e) => {
          clearTimeout(this.debounceTimer);
          this.debounceTimer = setTimeout(async () => {
            const value = e.target.value || '';
            let cursorPosition = value.length;
            const actualInput = input.querySelector('input, textarea');
            if (actualInput && actualInput.selectionStart !== undefined) {
              cursorPosition = actualInput.selectionStart;
            }
            
            // Don't show autocomplete if text was selected and replaced
            // This prevents interference with normal text selection behavior
            if (hadSelection && e.inputType === 'insertText') {
              hadSelection = false; // Reset the flag
              return; // Skip autocomplete for this input event
            }
            
            await this.showAutocomplete(input, cursorPosition);
          }, 50); // Reduced debounce time for better responsiveness
        };
        
        // Listen to the Material Web Component's input events
        input.addEventListener('input', debouncedShowAutocomplete);
        
        // Listen for focus events
        input.addEventListener('focus', () => {
          // Clear any existing autocomplete
          this.hideAutocomplete();
        });
        
        // Optimized backslash detection
        input.addEventListener('keydown', (e) => {
          if (this.isVisible) {
            this.handleKeydown(e);
          }
          
          // Check if backslash was typed
          if (e.key === '\\') {
            setTimeout(async () => {
              const value = input.value || '';
              const cursorPosition = value.length;
              await this.showAutocomplete(input, cursorPosition);
            }, 0);
          }
        });
        
        return;
      }
    }
    
    if (!actualInput) {
      console.error('Could not find actual input element');
      return;
    }
    
    this.input = actualInput;
    
    // Track selection state to detect text replacement
    let hadSelection = false;
    
    // Listen for selection changes
    actualInput.addEventListener('select', () => {
      hadSelection = actualInput.selectionStart !== actualInput.selectionEnd;
    });
    
    // Optimized debounced input event
    const debouncedInput = async (e) => {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(async () => {
        const cursorPosition = e.target.selectionStart;
        
        // Don't show autocomplete if text was selected and replaced
        // This prevents interference with normal text selection behavior
        if (hadSelection && e.inputType === 'insertText') {
          hadSelection = false; // Reset the flag
          return; // Skip autocomplete for this input event
        }
        
        await this.showAutocomplete(actualInput, cursorPosition);
      }, 50); // Reduced debounce time for better responsiveness
    };
    
    actualInput.addEventListener('input', debouncedInput);

    actualInput.addEventListener('keydown', (e) => {
      if (this.isVisible) {
        this.handleKeydown(e);
      }
      
      // Check if backslash was typed
      if (e.key === '\\') {
        setTimeout(async () => {
          const cursorPosition = e.target.selectionStart;
          await this.showAutocomplete(actualInput, cursorPosition);
        }, 0);
      }
    });

    actualInput.addEventListener('blur', () => {
      // Delay hiding to allow for clicks on suggestions
      setTimeout(() => this.hideAutocomplete(), 150);
    });

    // Optimized click outside handler
    const handleClickOutside = (e) => {
      if (!this.container?.contains(e.target) && e.target !== actualInput) {
        this.hideAutocomplete();
      }
    };
    
    document.addEventListener('click', handleClickOutside);

    // Handle cursor position changes
    actualInput.addEventListener('click', async (e) => {
      const cursorPosition = e.target.selectionStart;
      await this.showAutocomplete(actualInput, cursorPosition);
    });

    actualInput.addEventListener('keyup', async (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'Home' || e.key === 'End') {
        const cursorPosition = e.target.selectionStart;
        await this.showAutocomplete(actualInput, cursorPosition);
      }
      
      // Also check for backslash on keyup for more reliable detection
      if (e.key === '\\') {
        const cursorPosition = e.target.selectionStart;
        await this.showAutocomplete(actualInput, cursorPosition);
      }
    });
  }
}

// Enhanced History System with Material Design 3
class HistoryManager {
  constructor() {
    this.history = [];
    this.maxItems = 50; // Increased from 10 to 50
    this.usageStats = {};
    this.loadHistory();
    this.loadUsageStats();
  }

  // Load history from localStorage
  loadHistory() {
    try {
      const saved = localStorage.getItem('latexHistory');
      this.history = saved ? JSON.parse(saved) : [];
      
      // Migrate old sessionStorage data if exists
      const sessionHistory = sessionStorage.getItem('latexHistory');
      if (sessionHistory) {
        const sessionData = JSON.parse(sessionHistory);
        // Merge and deduplicate
        const merged = [...new Set([...sessionData, ...this.history])];
        this.history = merged.slice(0, this.maxItems);
        sessionStorage.removeItem('latexHistory');
        this.saveHistory();
      }
    } catch (error) {
      console.error('Failed to load history:', error);
      this.history = [];
    }
  }

  // Save history to localStorage
  saveHistory() {
    try {
      localStorage.setItem('latexHistory', JSON.stringify(this.history));
    } catch (error) {
      console.error('Failed to save history:', error);
    }
  }

  // Load usage statistics
  loadUsageStats() {
    try {
      const saved = localStorage.getItem('latexUsageStats');
      this.usageStats = saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error('Failed to load usage stats:', error);
      this.usageStats = {};
    }
  }

  // Save usage statistics
  saveUsageStats() {
    try {
      localStorage.setItem('latexUsageStats', JSON.stringify(this.usageStats));
    } catch (error) {
      console.error('Failed to save usage stats:', error);
    }
  }



  // Add item to history with timestamp and usage tracking
  addToHistory(latex) {
    if (!latex || latex.trim() === '') return;

    const now = new Date();
    const timestamp = now.getTime();
    
    // Create history item with metadata
    const historyItem = {
      latex: latex.trim(),
      timestamp: timestamp,
      usageCount: 1
    };

    // Remove existing item if it exists
    this.history = this.history.filter(item => item.latex !== latex);

    // Add to beginning
    this.history.unshift(historyItem);

    // Limit to max items
    if (this.history.length > this.maxItems) {
      this.history = this.history.slice(0, this.maxItems);
    }

    // Update usage statistics
    this.updateUsageStats(latex);

    this.saveHistory();
    this.saveUsageStats();
    this.updateUI();
  }

  // Update usage statistics for a LaTeX command
  updateUsageStats(latex) {
    if (!this.usageStats[latex]) {
      this.usageStats[latex] = {
        count: 0,
        firstUsed: Date.now(),
        lastUsed: Date.now()
      };
    }
    
    this.usageStats[latex].count++;
    this.usageStats[latex].lastUsed = Date.now();
  }





  // Get filtered history
  getFilteredHistory() {
    return [...this.history];
  }



  // Format relative time
  formatRelativeTime(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return new Date(timestamp).toLocaleDateString();
  }



  // Clear history
  clearHistory() {
    this.history = [];
    this.saveHistory();
    this.updateUI();
  }

  // Update the UI with Material Design 3 styling
  updateUI() {
    const historyContainer = document.getElementById('history-section');
    if (!historyContainer) return;

    const filteredHistory = this.getFilteredHistory();

    // Create Material Design 3 styled history section
    historyContainer.innerHTML = `
      <div class="history-header">
        <h2 class="history-title">Recent LaTeX Commands</h2>
      </div>

      <div class="history-list" id="history-list">
        ${filteredHistory.length === 0 ? `
          <div class="empty-state">
            <md-icon class="empty-icon">history</md-icon>
            <p class="empty-text">No commands found</p>
            <p class="empty-subtext">Your LaTeX commands will appear here</p>
          </div>
        ` : filteredHistory.map(item => this.renderHistoryItem(item)).join('')}
      </div>

      <div class="history-actions-bottom">
        <md-outlined-button id="clear-history">Clear History</md-outlined-button>
      </div>
    `;

    // Add event listeners
    this.addHistoryEventListeners();
  }

  // Render a single history item with Material Design 3 styling
  renderHistoryItem(item) {
    const usageCount = this.usageStats[item.latex]?.count || 1;
    const relativeTime = this.formatRelativeTime(item.timestamp);
    
    return `
      <div class="history-item" data-latex="${item.latex}">
        <div class="history-item-content">
          <div class="history-item-main">
            <div class="history-item-text" title="${item.latex}">
              ${item.latex.length > 40 ? item.latex.substring(0, 40) + '...' : item.latex}
            </div>
            <div class="history-item-meta">
              <span class="history-time">${relativeTime}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Add event listeners for history functionality
  addHistoryEventListeners() {
    // History item interactions
    const historyItems = document.querySelectorAll('.history-item');
    historyItems.forEach(item => {
      const latex = item.dataset.latex;
      
      // Click anywhere on item to use
      const useFunction = () => {
        const latexInput = document.getElementById('latex-input');
        if (latexInput) {
          latexInput.value = latex;
          latexInput.dispatchEvent(new Event('input', { bubbles: true }));
          renderLaTeX();
        }
      };
      
      // Click anywhere on item
      item.addEventListener('click', useFunction);
    });

    // Clear history
    const clearBtn = document.getElementById('clear-history');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all history?')) {
          this.clearHistory();
        }
      });
    }
  }
}

// Initialize the enhanced history manager
const historyManager = new HistoryManager();
window.historyManager = historyManager; // Make globally accessible for testing

  // Initialize autocomplete
  const latexAutocomplete = new LaTeXAutocomplete();

  document.addEventListener('DOMContentLoaded', () => {
    // Check AI service availability on page load (removed to prevent reload icon)
    // updateAIButtonState();
    
    // Re-check AI service availability every 5 minutes (removed to prevent periodic reload icons)
    // setInterval(updateAIButtonState, 5 * 60 * 1000);
    
    // Add click handler for retry when AI service is unavailable
    const aiButton = document.getElementById('ai-fix-button');
    if (aiButton) {
      aiButton.addEventListener('click', async (e) => {
        if (aiButton.hasAttribute('disabled') && !aiButton.classList.contains('loading')) {
          e.preventDefault();
          e.stopPropagation();
          await updateAIButtonState();
        }
      });
    }
  // More robust Material Web Components loading check
  function checkMaterialComponents() {
    const requiredComponents = [
      'md-outlined-text-field',
      'md-filled-button', 
      'md-outlined-button',
      'md-icon-button',
      'md-assist-chip',
      'md-circular-progress',
      'md-text-button'
    ];
    
    const missingComponents = requiredComponents.filter(comp => !customElements.get(comp));
    
    if (missingComponents.length > 0) {
      console.error('Missing Material Web Components:', missingComponents);
      showError('Loading Error', 'Some components failed to load. Please refresh the page or check your internet connection.');
      return false;
    }
    
    return true;
  }

  // Check components after a short delay to allow for loading
  setTimeout(() => {
    if (!checkMaterialComponents()) {
      console.warn('Material Web Components not fully loaded, retrying...');
      setTimeout(checkMaterialComponents, 1000);
    }
  }, 500);

  const latexInput = document.getElementById('latex-input');
  const latexImage = document.getElementById('latex-image');
  const latexPreview = document.getElementById('latex-preview');
  const imageActions = document.getElementById('image-actions');
  const scaleInput = document.getElementById('scale-input');

  if (!latexInput || !latexImage || !latexPreview || !imageActions || !scaleInput) {
    console.error('One or more DOM elements not found.');
    showError('Initialization Error', 'Required DOM elements not found.');
    return;
  }

  // Attach autocomplete to the LaTeX input
  if (latexInput) {
    // Skip autocomplete on mobile devices
    if (isMobileDevice()) {
      console.log('Skipping autocomplete attachment on mobile device');
    } else {
      // Wait for autocomplete to be ready
      const attachAutocomplete = async () => {
        // Wait for autocomplete initialization
        if (latexAutocomplete && !latexAutocomplete.isReady()) {
          await latexAutocomplete.init();
        }
        
        if (latexAutocomplete && latexAutocomplete.isReady()) {
          // Try multiple ways to find the actual input
          let actualInput = null;
          
          // Method 1: Direct query
          actualInput = latexInput.querySelector('input, textarea');
          
          // Method 2: Shadow DOM
          if (!actualInput && latexInput.shadowRoot) {
            actualInput = latexInput.shadowRoot.querySelector('input, textarea');
          }
          
          // Method 3: Check if the component is ready
          if (!actualInput && latexInput.ready) {
            actualInput = latexInput.querySelector('input, textarea');
          }
          
          if (actualInput) {
            latexAutocomplete.attachToInput(latexInput);
            console.log('Autocomplete attached to input element');
          } else {
            // If we can't find the actual input, work with the Material Web Component directly
            latexAutocomplete.attachToInput(latexInput);
            console.log('Autocomplete attached to Material Web Component');
          }
          
          // Update placeholder to indicate autocomplete is ready
          latexInput.placeholder = "Enter LaTeX code (e.g., $E = mc^2$ or R_{DS}) - Type \\ for autocomplete";
          console.log('Autocomplete system fully initialized and ready');
        } else {
          console.warn('Autocomplete not ready, retrying...');
          setTimeout(attachAutocomplete, 200);
        }
      };
      
      // Start trying to attach after a short delay
      setTimeout(attachAutocomplete, 100);
    }
  } else {
    console.error('latexInput element not found for autocomplete');
  }

  let imageUrl = '';



  window.clearInput = function() {
    const latexInput = document.getElementById('latex-input');
    const latexImage = document.getElementById('latex-image');
    const imageActions = document.getElementById('image-actions');
    const errorMessage = document.getElementById('error-message');
    
    // Clear the input field
    latexInput.value = '';
    
    // Hide the preview image and actions
    latexImage.style.display = 'none';
    imageActions.style.display = 'none';
    
    // Clear any error messages
    hideError();
    
    // Focus back to the input field
    latexInput.focus();
  };

  // Slider event listener for point size
  scaleInput.addEventListener('input', () => {
    const ptSize = parseFloat(scaleInput.value);
    const scale = ptSize / BASE_PT_SIZE;
    
    // Validate input
    if (isNaN(ptSize) || ptSize < 8 || ptSize > 72) {
      console.warn('Invalid point size:', ptSize);
      return;
    }
    
    // Apply scale to image if it exists
    if (latexImage.style.display !== 'none') {
      latexImage.style.transform = `scale(${scale})`;
    }
  });

  // Add validation for scale input
  scaleInput.addEventListener('blur', () => {
    const ptSize = parseFloat(scaleInput.value);
    if (isNaN(ptSize) || ptSize < 8) {
      scaleInput.value = '8';
    } else if (ptSize > 72) {
      scaleInput.value = '72';
    }
  });

  // Initialize the history manager UI
  if (historyManager) {
    historyManager.updateUI();
  }

  window.clearHistory = function () {
    if (historyManager) {
      historyManager.clearHistory();
    }
  };

  window.setExample = function (latex) {
    latexInput.value = latex;
    renderLaTeX();
  };

  // Show spinner during rendering
  const renderSpinner = document.getElementById('render-spinner');
  const renderButton = document.getElementById('render-button');
  let spinnerTimeout;
  
  function showSpinner() {
    renderSpinner.style.display = 'block';
    renderButton.setAttribute('disabled', 'true');
  }
  
  function hideSpinner() {
    clearTimeout(spinnerTimeout);
    spinnerTimeout = setTimeout(() => {
      renderSpinner.style.display = 'none';
      renderButton.removeAttribute('disabled');
    }, 500);
  }

  // Internet connectivity detection
  let isOnline = navigator.onLine;
  let connectivityCheckInterval = null;

  // Function to check internet connectivity
  async function checkInternetConnectivity() {
    try {
      // Try to fetch a small resource from a reliable CDN
      const response = await fetch('https://www.google.com/favicon.ico', {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-cache'
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  // Function to handle connectivity changes
  async function handleConnectivityChange() {
    const wasOnline = isOnline;
    isOnline = navigator.onLine;
    
    // If we were offline and now we're online, clear any connectivity errors
    if (!wasOnline && isOnline) {
      hideError();
      console.log('Internet connection restored');
    }
    
    // If we were online and now we're offline, show connectivity error
    if (wasOnline && !isOnline) {
      showError('Network Error', 'No internet connection detected. Please check your connection and try again.');
      console.log('Internet connection lost');
    }
  }

  // Function to start connectivity monitoring
  function startConnectivityMonitoring() {
    // Listen for online/offline events
    window.addEventListener('online', handleConnectivityChange);
    window.addEventListener('offline', handleConnectivityChange);
    
    // Also perform periodic connectivity checks
    connectivityCheckInterval = setInterval(async () => {
      const isConnected = await checkInternetConnectivity();
      if (!isConnected && isOnline) {
        isOnline = false;
        showError('Network Error', 'No internet connection detected. Please check your connection and try again.');
        console.log('Internet connection lost (detected via periodic check)');
      } else if (isConnected && !isOnline) {
        isOnline = true;
        hideError();
        console.log('Internet connection restored (detected via periodic check)');
      }
    }, 30000); // Check every 30 seconds
  }

  // Function to stop connectivity monitoring
  function stopConnectivityMonitoring() {
    window.removeEventListener('online', handleConnectivityChange);
    window.removeEventListener('offline', handleConnectivityChange);
    if (connectivityCheckInterval) {
      clearInterval(connectivityCheckInterval);
      connectivityCheckInterval = null;
    }
  }

  // Enhanced error display - now shows inside the text field
  function showError(type, message, details) {
    const latexInput = document.getElementById('latex-input');
    
    // Set the error state on the Material Design text field
    latexInput.error = true;
    latexInput.errorText = `${type}: ${message}` + (details ? ` ${details}` : '');
    
    imageActions.style.display = 'none';
  }
  
  function hideError() {
    const latexInput = document.getElementById('latex-input');
    
    // Clear the error state on the Material Design text field
    latexInput.error = false;
    latexInput.errorText = '';
  }

  // Patch renderLaTeX to use the new spinner logic
  window.renderLaTeX = async function() {
    showSpinner();
    try {
      let latex = latexInput.value.trim();
      if (!latex) {
        showError('Input Error', 'Please enter a LaTeX command.');
        return;
      }
      
      // Check internet connectivity before attempting to render
      if (!isOnline) {
        showError('Network Error', 'No internet connection detected. Please check your connection and try again.');
        return;
      }
      
      // Additional connectivity check for reliability
      const isConnected = await checkInternetConnectivity();
      if (!isConnected) {
        isOnline = false;
        showError('Network Error', 'No internet connection detected. Please check your connection and try again.');
        return;
      }
      
      // Optimize LaTeX processing
      let formattedLatex = latex;
      let isMathMode = false;
      const mathModeMatch = latex.match(/^[\$]+\$?(.*?)\$+[\$]?$/s);
      if (mathModeMatch) {
        isMathMode = true;
        formattedLatex = mathModeMatch[1].trim();
        // Use more efficient regex replacement
        formattedLatex = formattedLatex.replace(/\\textbf\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g, '\\mathbf{$1}');
      } else {
        formattedLatex = `\\text{${formattedLatex}}`;
      }
      
      const encodedLatex = encodeURIComponent(`\\dpi{300} \\color{black} ${formattedLatex}`);
      imageUrl = `https://latex.codecogs.com/svg?${encodedLatex}`;
      
      // Clear previous image immediately
      latexImage.src = '';
      latexImage.style.display = 'none';
      imageActions.style.display = 'none';
      
      // Set new image source
      latexImage.src = imageUrl;
      
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Image loading timeout'));
        }, 10000); // 10 second timeout
        
        latexImage.onload = () => {
          clearTimeout(timeout);
          latexImage.style.display = 'inline-block';
          imageActions.style.display = 'flex';
          const ptSize = parseFloat(scaleInput.value);
          const scale = ptSize / BASE_PT_SIZE;
          latexImage.style.transform = `scale(${scale})`;
          hideError();
          
          // Add to enhanced history system
          if (historyManager) {
            historyManager.addToHistory(latex);
          }
          resolve();
        };
        
        latexImage.onerror = (e) => {
          clearTimeout(timeout);
          showError('Network Error', 'Unable to fetch rendered image. Please check your connection or try again later.', e?.message || '');
          latexImage.style.display = 'none';
          imageActions.style.display = 'none';
          reject(new Error('Image loading failed'));
        };
      });
    } catch (err) {
      showError('Invalid LaTeX', 'The equation could not be rendered. Please check your syntax.', err.message);
      latexImage.style.display = 'none';
      imageActions.style.display = 'none';
    } finally {
      hideSpinner();
    }
  };

  window.copyImage = async function () {
    if (!navigator.clipboard) {
      showError('Clipboard API not supported in this browser.');
      return;
    }

    const copyButton = document.getElementById('copy-button');
    const copyIcon = copyButton.querySelector('md-icon');

    if (!copyIcon) {
      console.error('Copy icon not found inside copy button.');
      showError('Copy icon not found.');
      return;
    }

    try {
      let latex = latexInput.value.trim();
      if (!latex) {
        showError('No LaTeX to render');
        return;
      }

      let formattedLatex = latex;
      let isMathMode = false;

      const mathModeMatch = latex.match(/^\$+\$?(.*?)\$+\$?$/s);
      if (mathModeMatch) {
        isMathMode = true;
        formattedLatex = mathModeMatch[1].trim();
        formattedLatex = formattedLatex.replace(/\\textbf\{((?:[^{}]|\{[^{}]*\})*)\}/g, '\\mathbf{$1}');
      } else {
        formattedLatex = `\\text{${formattedLatex}}`;
      }

      const encodedLatex = encodeURIComponent(`\\dpi{300} \\color{black} ${formattedLatex}`);
      const tempImageUrl = `https://latex.codecogs.com/svg?${encodedLatex}`;
      const response = await fetch(tempImageUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch SVG');
      }
      let svgText = await response.text();

      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
      const svgElement = svgDoc.querySelector('svg');
      if (!svgElement) {
        throw new Error('Invalid SVG content');
      }

      const ptSize = parseFloat(scaleInput.value);
      const scale = ptSize / BASE_PT_SIZE;
      const group = svgDoc.createElementNS('http://www.w3.org/2000/svg', 'g');
      group.setAttribute('transform', `scale(${scale})`);

      while (svgElement.firstChild) {
        group.appendChild(svgElement.firstChild);
      }
      svgElement.appendChild(group);

      let width = svgElement.getAttribute('width') || svgElement.getAttribute('viewBox')?.split(' ')[2] || 100;
      let height = svgElement.getAttribute('height') || svgElement.getAttribute('viewBox')?.split(' ')[3] || 100;
      width = parseFloat(width) * scale;
      height = parseFloat(height) * scale;
      svgElement.setAttribute('width', `${width}`);
      svgElement.setAttribute('height', `${height}`);

      const viewBox = svgElement.getAttribute('viewBox');
      if (viewBox) {
        const [minX, minY, vbWidth, vbHeight] = viewBox.split(' ').map(Number);
        svgElement.setAttribute('viewBox', `${minX} ${minY} ${vbWidth} ${vbHeight}`);
      }

      const serializer = new XMLSerializer();
      svgText = serializer.serializeToString(svgDoc);

      const blob = new Blob([svgText], { type: 'image/svg+xml' });
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/svg+xml': blob })
      ]);

      copyButton.classList.add('copied');
      copyIcon.innerHTML = 'check';

      setTimeout(() => {
        copyButton.classList.remove('copied');
        copyIcon.innerHTML = 'content_copy';
      }, 3500);
    } catch (err) {
      console.error('Copy error:', err);
      showError('Failed to copy image: ' + err.message);
    }
  };







  latexInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      renderLaTeX();
    }
  });

  // Autofocus latex input on any key press if not already focused
  window.addEventListener('keydown', (e) => {
    // Ignore if modifier keys are pressed or if focus is already in an input/textarea/contenteditable
    if (
      e.ctrlKey ||
      e.altKey ||
      e.metaKey ||
      e.target === latexInput ||
      e.target.tagName === 'INPUT' ||
      e.target.tagName === 'TEXTAREA' ||
      e.target.isContentEditable
    ) {
      return;
    }
    latexInput.focus();
  });

  // Smart dollar sign functionality
  latexInput.addEventListener('keydown', (e) => {
    if (e.key === '$') {
      const input = e.target;
      const value = input.value;
      const cursorPosition = input.selectionStart;
      
      // Check if we're already inside a dollar sign pair
      const beforeCursor = value.substring(0, cursorPosition);
      const afterCursor = value.substring(cursorPosition);
      
      // Check if we're already inside $$ or $ pairs
      const beforeDollarCount = (beforeCursor.match(/\$/g) || []).length;
      const afterDollarCount = (afterCursor.match(/\$/g) || []).length;
      
      // If we have an odd number of $ before cursor and even number after, we're inside a $ pair
      const isInsideSingleDollar = beforeDollarCount % 2 === 1 && afterDollarCount % 2 === 0;
      
      // If we have an odd number of $ before cursor and even number after, we're inside a $$ pair
      const isInsideDoubleDollar = beforeDollarCount % 2 === 1 && afterDollarCount % 2 === 0 && 
                                  beforeCursor.endsWith('$$') && afterCursor.startsWith('$$');
      
      // If we're at the beginning of a line or after a space/newline, add $$
      const isAtStart = cursorPosition === 0 || /[\s\n]$/.test(beforeCursor);
      
      // If we're inside a $ pair, just add a single $
      if (isInsideSingleDollar) {
        return; // Let the default behavior happen
      }
      
      // If we're inside a $$ pair, just add a single $
      if (isInsideDoubleDollar) {
        return; // Let the default behavior happen
      }
      
      // If we're at the start of a line or after space, add $$
      if (isAtStart) {
        e.preventDefault();
        const newValue = beforeCursor + '$$' + afterCursor;
        input.value = newValue;
        
        // Position cursor in the middle
        const newCursorPosition = cursorPosition + 1;
        input.setSelectionRange(newCursorPosition, newCursorPosition);
        
        // Trigger input event
        input.dispatchEvent(new Event('input', { bubbles: true }));
        return;
      }
      
      // If we're not at start and not inside dollar signs, check if we should add $$
      // Look for common LaTeX patterns that suggest we want display math
      const commonDisplayPatterns = [
        /\\frac\s*\{/, /\\sum\s*_/, /\\int\s*_/, /\\lim\s*_/,
        /\\sqrt\s*\{/, /\\left\s*\(/, /\\begin\s*\{/
      ];
      
      const textAfterCursor = afterCursor.trim();
      const shouldUseDisplayMath = commonDisplayPatterns.some(pattern => 
        pattern.test(textAfterCursor)
      );
      
      if (shouldUseDisplayMath) {
        e.preventDefault();
        const newValue = beforeCursor + '$$' + afterCursor;
        input.value = newValue;
        
        // Position cursor in the middle
        const newCursorPosition = cursorPosition + 1;
        input.setSelectionRange(newCursorPosition, newCursorPosition);
        
        // Trigger input event
        input.dispatchEvent(new Event('input', { bubbles: true }));
        return;
      }
      
      // For all other cases, just add a single $ (default behavior)
    }
  });



  // Copy SVG code button logic
  window.copySVGCode = async function () {
    if (!imageUrl) {
      showError('Nothing to copy.');
      return;
    }
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error('Failed to fetch SVG');
      let svgText = await response.text();
      await navigator.clipboard.writeText(svgText);
      const btn = document.getElementById('copy-svgcode-button');
      btn.classList.add('copied');
      setTimeout(() => btn.classList.remove('copied'), 2000);
    } catch (err) {
      showError('Failed to copy SVG code: ' + err.message);
    }
  };

  // Generate smart filename function (reusable)
  function generateFileName(latex) {
    // Remove math delimiters and special characters
    let clean = latex.replace(/[$\{\}\\]/g, '').replace(/\s+/g, '_');
    
    // Remove common LaTeX commands and keep meaningful content
    clean = clean.replace(/\\text\{([^}]*)\}/g, '$1');
    clean = clean.replace(/\\mathbf\{([^}]*)\}/g, '$1');
    clean = clean.replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '$1_over_$2');
    clean = clean.replace(/\\sum_\{([^}]*)\}\^\{([^}]*)\}/g, 'sum_$1_to_$2');
    clean = clean.replace(/\\int_\{([^}]*)\}\^\{([^}]*)\}/g, 'int_$1_to_$2');
    
    // Remove other LaTeX commands
    clean = clean.replace(/\\[a-zA-Z]+\{[^}]*\}/g, '');
    clean = clean.replace(/\\[a-zA-Z]+/g, '');
    
    // Clean up multiple underscores and special chars
    clean = clean.replace(/[^a-zA-Z0-9_]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
    
    // Limit length to 20 characters
    if (clean.length > 20) {
      clean = clean.substring(0, 20);
    }
    
    // Add improved date and time
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    
    // Format: filename_YYYY-MM-DD_HH-MM.svg
    return `${clean}_${year}-${month}-${day}_${hours}-${minutes}.svg`;
  }

  // Download SVG function
  window.downloadSVG = async function() {
    const latexImage = document.getElementById('latex-image');
    const imageUrl = latexImage.src;
    const latexInput = document.getElementById('latex-input');
    
    if (!imageUrl || imageUrl === '') {
      showError('No image to download');
      return;
    }
    
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error('Failed to fetch SVG');
      const svgText = await response.text();
      
      // Create a blob and download link
      const blob = new Blob([svgText], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      
      // Create download link with smart filename
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      const latex = latexInput.value.trim();
      downloadLink.download = generateFileName(latex);
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      // Clean up the URL object
      URL.revokeObjectURL(url);
      
      // Show success feedback
      const btn = document.getElementById('download-button');
      btn.classList.add('copied');
      setTimeout(() => btn.classList.remove('copied'), 2000);
    } catch (err) {
      showError('Failed to download SVG: ' + err.message);
    }
  };

  // Show/hide Copy SVG Code button when SVG is rendered
  const copySVGCodeButton = document.getElementById('copy-svgcode-button');
  
  // Patch image load logic to show/hide Copy SVG Code button
  latexImage.onload = function() {
    copySVGCodeButton.style.display = 'inline-flex';
  };
  latexImage.onerror = function() {
    copySVGCodeButton.style.display = 'none';
  };

  // AI Fix LaTeX functionality
  async function checkAIServiceAvailability() {
    // Check internet connectivity first
    if (!isOnline) {
      console.log('AI service check skipped - no internet connection');
      return false;
    }
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch('https://ai-reply-bot.vercel.app/api/latex', {
        method: 'HEAD', // Use HEAD request to check availability without sending data
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.error('AI service availability check failed:', error);
      return false;
    }
  }

  async function updateAIButtonState() {
    const aiButton = document.getElementById('ai-fix-button');
    if (!aiButton) return;

    // Show checking state (without sync icon to prevent reload appearance)
    const originalIcon = aiButton.querySelector('md-icon').innerHTML;
    // aiButton.querySelector('md-icon').innerHTML = 'sync'; // Removed to prevent reload icon
    aiButton.classList.add('checking');
    aiButton.setAttribute('data-tooltip', 'Checking AI service availability...');

    try {
      const isAvailable = await checkAIServiceAvailability();
      
      if (isAvailable) {
        aiButton.removeAttribute('disabled');
        aiButton.removeAttribute('data-tooltip');
        aiButton.setAttribute('data-tooltip', 'Fix LaTeX syntax errors with AI');
        aiButton.style.opacity = '1';
        aiButton.style.cursor = 'pointer';
        aiButton.querySelector('md-icon').innerHTML = 'auto_fix_high';
      } else {
        aiButton.setAttribute('disabled', 'true');
        aiButton.setAttribute('data-tooltip', 'AI service is currently unavailable');
        aiButton.style.opacity = '0.5';
        aiButton.style.cursor = 'not-allowed';
        aiButton.querySelector('md-icon').innerHTML = 'error_outline';
      }
    } catch (error) {
      console.error('Failed to check AI service availability:', error);
      // Default to disabled state if check fails
      aiButton.setAttribute('disabled', 'true');
      aiButton.setAttribute('data-tooltip', 'AI service is currently unavailable');
      aiButton.style.opacity = '0.5';
      aiButton.style.cursor = 'not-allowed';
      aiButton.querySelector('md-icon').innerHTML = 'error_outline';
    } finally {
      aiButton.classList.remove('checking');
    }
  }

  async function fixLatexWithAI(latexCode) {
    // Check internet connectivity first
    if (!isOnline) {
      showError('Network Error', 'No internet connection detected. Please check your connection and try again.');
      return;
    }
    
    try {
      const response = await fetch('https://ai-reply-bot.vercel.app/api/latex', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
        },
        body: JSON.stringify({
          latex: latexCode,
          explain: false
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Handle specific error codes from your API
        if (errorData.errorCode === 'RATE_LIMIT_EXCEEDED') {
          throw new Error('Rate limit exceeded. Please wait before trying again.');
        } else if (errorData.errorCode === 'LATEX_EMPTY_INPUT') {
          throw new Error('Please provide valid LaTeX code to correct.');
        } else if (errorData.errorCode === 'LATEX_TOO_LONG') {
          throw new Error(`LaTeX code is too long. Maximum length is ${errorData.maxLength || 8000} characters.`);
        } else if (errorData.errorCode === 'AUTHENTICATION_ERROR') {
          throw new Error('Authentication failed. Please contact support.');
        } else if (errorData.errorCode === 'AI_SERVICE_UNAVAILABLE') {
          throw new Error('AI service is temporarily unavailable. Please try again later.');
        } else {
          throw new Error(errorData.message || errorData.error || 'Failed to correct LaTeX');
        }
      }

      const data = await response.json();
      
      // Validate the response structure
      if (!data.correctedLatex) {
        throw new Error('Invalid response from AI service');
      }
      
      return data.correctedLatex;
    } catch (error) {
      console.error('AI Fix Error:', error);
      throw error;
    }
  }

  window.fixLatexWithAI = async function() {
    const aiButton = document.getElementById('ai-fix-button');
    const latexInput = document.getElementById('latex-input');
    const originalLatex = latexInput.value.trim();
    
    if (!originalLatex) {
      showError('Input Error', 'Please enter LaTeX code to fix.');
      return;
    }
    
    // Check if AI service is available before proceeding
    if (aiButton.hasAttribute('disabled')) {
      showError('Service Unavailable', 'AI service is currently unavailable. Please try again later.');
      return;
    }
    
    // Prevent multiple simultaneous requests
    if (aiButton.classList.contains('loading')) {
      return;
    }
    
    // Show loading state
    aiButton.classList.add('loading');
    const originalIcon = aiButton.querySelector('md-icon').innerHTML;
    aiButton.querySelector('md-icon').innerHTML = 'auto_fix_high';
    aiButton.setAttribute('disabled', 'true');
    
    // Add AI analyzing animation to text field
    latexInput.classList.add('ai-analyzing');
    
    // Show loading message in the input field
    const originalPlaceholder = latexInput.placeholder;
    latexInput.setAttribute('disabled', 'true');
    
    try {
      // Call the AI API using the new function
      const correctedLatex = await fixLatexWithAI(originalLatex);
      
      if (correctedLatex) {
        // Update the input with corrected LaTeX
        latexInput.value = correctedLatex;
        
        // Trigger input event to update any listeners
        latexInput.dispatchEvent(new Event('input', { bubbles: true }));
        
        // No success messages - just update the LaTeX directly
        
        // Auto-render the corrected LaTeX
        setTimeout(() => {
          renderLaTeX();
        }, 500);
      } else {
        throw new Error('No corrected LaTeX received from AI');
      }
      
    } catch (error) {
      console.error('AI Fix Error:', error);
      
      // Provide more specific error messages based on API response
      let errorMessage = 'Failed to fix LaTeX code. Please try again.';
      if (error.message.includes('fetch') || error.message.includes('Network')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.message.includes('Rate limit exceeded')) {
        errorMessage = 'Rate limit exceeded. Please wait a moment and try again.';
      } else if (error.message.includes('Authentication failed')) {
        errorMessage = 'Authentication error. Please contact support.';
      } else if (error.message.includes('Please provide valid LaTeX code')) {
        errorMessage = 'Please enter valid LaTeX code to fix.';
      } else if (error.message.includes('LaTeX code is too long')) {
        errorMessage = 'LaTeX code is too long. Please shorten it and try again.';
      } else if (error.message.includes('AI service is temporarily unavailable')) {
        errorMessage = 'AI service is temporarily unavailable. Please try again later.';
      } else if (error.message.includes('Invalid response from AI service')) {
        errorMessage = 'AI service returned an invalid response. Please try again.';
      }
      
      // Show error in the input field
      latexInput.placeholder = `Error: ${errorMessage}`;
      
      // Restore original placeholder after 5 seconds for errors
      setTimeout(() => {
        latexInput.placeholder = originalPlaceholder;
      }, 5000);
    } finally {
      // Restore button state
      aiButton.classList.remove('loading');
      aiButton.querySelector('md-icon').innerHTML = originalIcon;
      
      // Re-enable the button only if AI service is available
      updateAIButtonState();
      
      // Remove AI analyzing animation from text field
      latexInput.classList.remove('ai-analyzing');
      
      // Re-enable the input field
      latexInput.removeAttribute('disabled');
    }
  };
  
  // Helper function to show success messages (disabled per user request)
  function showSuccess(type, message) {
    // Success messages are disabled - do nothing
    return;
  }

  // Blur all [data-tooltip] elements after click to prevent tooltip reappearing
  document.querySelectorAll('[data-tooltip]').forEach(el => {
    el.addEventListener('click', function() {
      if (this.blur) this.blur();
    });
  });

  // Start connectivity monitoring
  startConnectivityMonitoring();
  
  // Perform initial connectivity check
  setTimeout(async () => {
    const isConnected = await checkInternetConnectivity();
    if (!isConnected) {
      isOnline = false;
      showError('Network Error', 'No internet connection detected. Please check your connection and try again.');
      console.log('Initial connectivity check failed - no internet connection');
    } else {
      console.log('Initial connectivity check passed');
    }
  }, 1000); // Check after 1 second to allow page to load
});