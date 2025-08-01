const BASE_PT_SIZE = 12; // Baseline point size where scale = 1

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
    this.currentIndex = -1;
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
    
    // Optimized debounced input event
    const debouncedInput = async (e) => {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(async () => {
        const cursorPosition = e.target.selectionStart;
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

// Initialize autocomplete
const latexAutocomplete = new LaTeXAutocomplete();

document.addEventListener('DOMContentLoaded', () => {
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
      const errorMessage = document.getElementById('error-message');
      if (errorMessage) {
        errorMessage.innerHTML = `<strong>Loading Error:</strong> Some components failed to load. Please refresh the page or check your internet connection.`;
        errorMessage.style.display = 'block';
      }
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
  const errorMessage = document.getElementById('error-message');
  const imageActions = document.getElementById('image-actions');
  const historyList = document.getElementById('history-list');
  const scaleInput = document.getElementById('scale-input');

  if (!latexInput || !latexImage || !latexPreview || !errorMessage || !imageActions || !historyList || !scaleInput) {
    console.error('One or more DOM elements not found.');
    if (errorMessage) {
      errorMessage.textContent = 'Error: Required DOM elements not found.';
      errorMessage.style.display = 'block';
    }
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
          console.log('✅ Autocomplete system fully initialized and ready');
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
  let latexHistory = JSON.parse(sessionStorage.getItem('latexHistory')) || [];

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
    errorMessage.innerHTML = '';
    errorMessage.style.display = 'none';
    
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

  function updateHistory() {
    historyList.innerHTML = '';
    if (latexHistory.length === 0) {
      const emptyMessage = document.createElement('div');
      emptyMessage.style = 'padding: 8px; color: #666; font-style: italic; text-align: center;';
      emptyMessage.textContent = 'No recent commands';
      historyList.appendChild(emptyMessage);
      return;
    }
    
    latexHistory.forEach((latex, index) => {
      const historyItem = document.createElement('div');
      historyItem.style = 'padding: 8px; cursor: pointer; border-bottom: 1px solid #eee; transition: background 0.15s;';
      historyItem.textContent = latex.length > 50 ? latex.substring(0, 50) + '...' : latex;
      historyItem.title = latex; // Show full text on hover
      
      historyItem.addEventListener('click', () => {
        latexInput.value = latex;
        renderLaTeX();
      });
      
      historyItem.addEventListener('mouseenter', () => {
        historyItem.style.background = 'rgba(0, 105, 92, 0.08)';
      });
      
      historyItem.addEventListener('mouseleave', () => {
        historyItem.style.background = 'transparent';
      });
      
      historyList.appendChild(historyItem);
    });
  }
  updateHistory();

  window.clearHistory = function () {
    latexHistory = [];
    sessionStorage.removeItem('latexHistory');
    updateHistory();
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

  // Enhanced error display
  function showError(type, message, details) {
    errorMessage.innerHTML = `<strong>${type}:</strong> ${message}` + (details ? `<br><small>${details}</small>` : '');
    errorMessage.style.display = 'block';
    imageActions.style.display = 'none';
  }
  function hideError() {
    errorMessage.style.display = 'none';
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
          
          // Optimize history update
          if (!latexHistory.includes(latex)) {
            latexHistory.unshift(latex);
            if (latexHistory.length > 10) latexHistory.pop();
            sessionStorage.setItem('latexHistory', JSON.stringify(latexHistory));
            updateHistory();
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

  window.downloadImage = async function () {
    if (!imageUrl) {
      showError('Nothing to download.');
      return;
    }

    try {
      const response = await fetch(imageUrl);
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

      const fileName = generateFileName(latexInput.value.trim());
      const blob = new Blob([svgText], { type: 'image/svg+xml' });
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Download error:', err);
      showError('Download failed: ' + err.message);
    }
  };

  window.shareImage = async function () {
    if (!imageUrl) {
      showError('Nothing to share.');
      return;
    }

    if (!navigator.share) {
      showError('Sharing not supported in this browser.');
      return;
    }

    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch SVG');
      }
      const blob = await response.blob();
      
      const fileName = generateFileName(latexInput.value.trim());
      
      const file = new File([blob], fileName, { type: 'image/svg+xml' });
      await navigator.share({
        files: [file],
        title: 'LaTeX Rendered Image',
        text: 'Check out this LaTeX rendered image!'
      });
    } catch (err) {
      console.error('Share error:', err);
      showError('Failed to share image: ' + err.message);
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

  // Show/hide Copy SVG Code button when SVG is rendered
  const copySVGCodeButton = document.getElementById('copy-svgcode-button');
  
  // Patch image load logic to show/hide Copy SVG Code button
  latexImage.onload = function() {
    copySVGCodeButton.style.display = 'inline-flex';
  };
  latexImage.onerror = function() {
    copySVGCodeButton.style.display = 'none';
  };

  // Blur all [data-tooltip] elements after click to prevent tooltip reappearing
  document.querySelectorAll('[data-tooltip]').forEach(el => {
    el.addEventListener('click', function() {
      if (this.blur) this.blur();
    });
  });
});