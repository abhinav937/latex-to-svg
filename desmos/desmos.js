// Desmos Graphing Calculator JavaScript

let calculator = null;
let expressionIds = [];
let functionsLibrary = null;
let helperExpressions = {}; // Store helper expressions

// Initialize the calculator when the page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeCalculator();
    setupEventListeners();
    initializeFunctionsLibrary();
    initializeLLMIntegration();
    
    // Auto-configure LLM API endpoint (already set in LLMConfig, but ensure it's ready)
    if (typeof configureLLMAPI === 'function' && LLMConfig.apiEndpoint) {
        configureLLMAPI(LLMConfig.apiEndpoint);
    }
});

// Initialize the Desmos calculator
function initializeCalculator() {
    const elt = document.getElementById('calculator');

    if (elt) {
        calculator = Desmos.GraphingCalculator(elt, {
            expressions: true,
            settingsMenu: true,
            zoomButtons: true,
            border: false,
            lockViewport: false,
            expressionsCollapsed: false,
            authorFeatures: false,  // Replaced deprecated administerSecretFolders
            allowComplex: true  // Enable Complex Mode toggle in settings menu
        });

        // Set some default settings
        calculator.updateSettings({
            invertedColors: false,
            projectorMode: false,
            language: 'en'
        });

        // Set up expression analysis observer
        setupExpressionAnalysisObserver();

        console.log('Desmos calculator initialized successfully');
    } else {
        console.error('Calculator element not found');
    }
}

// Set up expression analysis observer
function setupExpressionAnalysisObserver() {
    if (!calculator) return;

    calculator.observe('expressionAnalysis', function() {
        for (var id in calculator.expressionAnalysis) {
            var analysis = calculator.expressionAnalysis[id];
            
            if (analysis.isError) {
                console.warn(`Expression '${id}' error:`, analysis.errorMessage);
            }
            
            if (analysis.evaluation) {
                console.log(`Expression '${id}' evaluation:`, analysis.evaluation);
            }
        }
    });
}

// Setup event listeners for buttons and inputs
function setupEventListeners() {
    // Plot function button
    const plotButton = document.getElementById('plot-button');
    if (plotButton) {
        plotButton.addEventListener('click', function() {
            plotFunction();
        });
    }

    // Clear calculator button
    const clearButton = document.getElementById('clear-calc-button');
    if (clearButton) {
        clearButton.addEventListener('click', clearCalculator);
    }

    // Reset view button
    const resetViewButton = document.getElementById('reset-view-button');
    if (resetViewButton) {
        resetViewButton.addEventListener('click', resetView);
    }

    // Function input field - allow plotting on Enter key
    const functionInput = document.getElementById('function-input');
    if (functionInput) {
        functionInput.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                plotFunction();
            }
        });
    }

    // LLM prompt button
    const llmPromptButton = document.getElementById('llm-prompt-button');
    if (llmPromptButton) {
        llmPromptButton.addEventListener('click', function() {
            // Prevent multiple clicks
            if (llmPromptButton.disabled) {
                return;
            }
            processLLMPrompt();
        });
    }

    // LLM prompt input field - allow processing on Enter key
    const llmPromptInput = document.getElementById('llm-prompt-input');
    if (llmPromptInput) {
        llmPromptInput.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                processLLMPrompt();
            }
        });
    }
}

// Detect if expression requires complex mode
function requiresComplexMode(expression) {
    if (!expression) return false;
    const exprStr = expression.toLowerCase();
    // Check for complex number indicators
    const hasComplexIndicator = /i\b|sqrt\(-|complex|imaginary|\\sqrt\{-|argand|complex plane|complex number/.test(exprStr);
    console.log('Complex mode detection for:', exprStr, '->', hasComplexIndicator);
    return hasComplexIndicator;
}

// Detect if expression requires logarithmic axes
function requiresLogarithmicAxes(expression) {
    if (!expression) return false;
    const exprStr = expression.toLowerCase();
    // Check for logarithmic patterns
    return /log|ln|exponential|exp\(|10\^|e\^/.test(exprStr);
}

// Auto-configure calculator settings based on expression
function autoConfigureSettings(expression, options = {}) {
    if (!calculator) return;
    
    const settings = {};
    let needsUpdate = false;

    // Configure logarithmic axes if needed
    // Desmos API uses xAxisScale/yAxisScale with values 'linear' or 'logarithmic'
    if (requiresLogarithmicAxes(expression) || options.logarithmicAxes) {
        if (options.xAxisMode === 'log' || options.logarithmicAxes === 'x' || options.logarithmicAxes === 'both') {
            settings.xAxisScale = 'logarithmic';
            needsUpdate = true;
        }
        if (options.yAxisMode === 'log' || options.logarithmicAxes === 'y' || options.logarithmicAxes === 'both') {
            settings.yAxisScale = 'logarithmic';
            needsUpdate = true;
        }
    }
    // Also handle direct xAxisScale/yAxisScale options
    if (options.xAxisScale !== undefined) {
        settings.xAxisScale = options.xAxisScale;
        needsUpdate = true;
    }
    if (options.yAxisScale !== undefined) {
        settings.yAxisScale = options.yAxisScale;
        needsUpdate = true;
    }
    
    // Apply polar mode if specified
    if (options.polarMode !== undefined) {
        settings.polarMode = options.polarMode;
        needsUpdate = true;
    }
    
    // Apply degree mode if specified
    if (options.degreeMode !== undefined) {
        settings.degreeMode = options.degreeMode;
        needsUpdate = true;
    }
    
    if (needsUpdate) {
        calculator.updateSettings(settings);
        console.log('Auto-configured settings:', settings);
    }
}

// Plot a function on the calculator with full expression properties support
function plotFunction(expression, options = {}) {
    if (!calculator) {
        console.error('Calculator not initialized');
        return;
    }

    // Get expression from parameter or input field
    let expr = expression;
    if (!expr) {
        const input = document.getElementById('function-input');
        if (input && input.value.trim()) {
            expr = input.value.trim();
        }
    }

    if (!expr) {
        alert('Please enter a function or equation to plot.');
        return;
    }

    // Auto-configure settings based on expression
    autoConfigureSettings(expr, options);

    try {
        // Generate a unique ID if not provided
        const id = options.id || 'expr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        // Prepare expression object with all supported properties
        const exprObj = {
            id: id,
            type: options.type || 'expression',
            latex: expr,
            color: options.color,
            lineStyle: options.lineStyle,
            lineWidth: options.lineWidth,
            lineOpacity: options.lineOpacity,
            pointStyle: options.pointStyle,
            pointSize: options.pointSize,
            pointOpacity: options.pointOpacity,
            fillOpacity: options.fillOpacity,
            points: options.points,
            lines: options.lines,
            fill: options.fill,
            hidden: options.hidden || false,
            secret: options.secret || false,
            sliderBounds: options.sliderBounds,
            playing: options.playing || false,
            parametricDomain: options.parametricDomain,
            polarDomain: options.polarDomain,
            dragMode: options.dragMode,
            label: options.label,
            showLabel: options.showLabel,
            labelSize: options.labelSize,
            labelOrientation: options.labelOrientation,
            columns: options.columns // For tables
        };

        // Remove undefined properties
        Object.keys(exprObj).forEach(key => {
            if (exprObj[key] === undefined) {
                delete exprObj[key];
            }
        });

        // Add the expression to the calculator
        calculator.setExpression(exprObj);

        // Store the expression ID for potential removal
        if (!expressionIds.includes(id)) {
            expressionIds.push(id);
        }

        console.log('Plotted expression:', expr, 'with ID:', id, 'Options:', options);

        // Clear the input field if it was used
        if (!expression) {
            const input = document.getElementById('function-input');
            if (input) {
                input.value = '';
            }
        }

        return id;

    } catch (error) {
        console.error('Error plotting function:', error);
        alert('Error plotting function. Please check your syntax and try again.\n\nTip: Use LaTeX syntax like y = x^2 or x^2 + y^2 = 1');
        return null;
    }
}

// Update an existing expression
function updateExpression(id, updates) {
    if (!calculator) {
        console.error('Calculator not initialized');
        return false;
    }

    try {
        const currentExpr = calculator.getExpressions().find(expr => expr.id === id);
        if (!currentExpr) {
            console.error('Expression not found:', id);
            return false;
        }

        // Merge updates with existing expression
        const updatedExpr = {
            ...currentExpr,
            ...updates,
            id: id // Ensure ID is preserved
        };

        calculator.setExpression(updatedExpr);
        console.log('Updated expression:', id, updates);
        return true;
    } catch (error) {
        console.error('Error updating expression:', error);
        return false;
    }
}

// Create a table expression
function createTable(columns, id = null) {
    if (!calculator) {
        console.error('Calculator not initialized');
        return null;
    }

    try {
        const tableId = id || 'table_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        const tableExpr = {
            id: tableId,
            type: 'table',
            columns: columns
        };

        calculator.setExpression(tableExpr);
        expressionIds.push(tableId);
        console.log('Created table:', tableId, columns);
        return tableId;
    } catch (error) {
        console.error('Error creating table:', error);
        return null;
    }
}

// Create a note/text expression
function createNote(text, id = null) {
    if (!calculator) {
        console.error('Calculator not initialized');
        return null;
    }

    try {
        const noteId = id || 'note_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        const noteExpr = {
            id: noteId,
            type: 'text',
            text: text || ''
        };

        calculator.setExpression(noteExpr);
        expressionIds.push(noteId);
        console.log('Created note:', noteId, text);
        return noteId;
    } catch (error) {
        console.error('Error creating note:', error);
        return null;
    }
}

// Remove an expression by ID
function removeExpressionById(id) {
    if (!calculator) {
        console.error('Calculator not initialized');
        return false;
    }

    try {
        calculator.removeExpression({ id: id });
        expressionIds = expressionIds.filter(exprId => exprId !== id);
        console.log('Removed expression:', id);
        return true;
    } catch (error) {
        console.error('Error removing expression:', error);
        return false;
    }
}

// Get expression analysis for an expression ID
function getExpressionAnalysis(id) {
    if (!calculator || !calculator.expressionAnalysis) {
        return null;
    }

    return calculator.expressionAnalysis[id] || null;
}

// Get all expressions
function getAllExpressions() {
    if (!calculator) {
        return [];
    }

    return calculator.getExpressions();
}

// Create a helper expression (doesn't show in expressions list)
function createHelperExpression(latex, callback) {
    if (!calculator) {
        console.error('Calculator not initialized');
        return null;
    }

    try {
        const helperExpr = calculator.HelperExpression({ latex: latex });
        
        // Set up observers if callback provided
        if (callback) {
            if (helperExpr.numericValue !== undefined) {
                helperExpr.observe('numericValue', function() {
                    callback(helperExpr.numericValue, 'numeric');
                });
            }
            if (helperExpr.listValue !== undefined) {
                helperExpr.observe('listValue', function() {
                    callback(helperExpr.listValue, 'list');
                });
            }
        }

        helperExpressions[latex] = helperExpr;
        console.log('Created helper expression:', latex);
        return helperExpr;
    } catch (error) {
        console.error('Error creating helper expression:', error);
        return null;
    }
}

// Get helper expression value
function getHelperExpressionValue(latex) {
    if (helperExpressions[latex]) {
        const expr = helperExpressions[latex];
        if (expr.numericValue !== undefined) {
            return { value: expr.numericValue, type: 'numeric' };
        }
        if (expr.listValue !== undefined) {
            return { value: expr.listValue, type: 'list' };
        }
    }
    return null;
}

// Clear all expressions from the calculator
function clearCalculator() {
    if (!calculator) {
        console.error('Calculator not initialized');
        alert('Calculator not initialized. Please refresh the page.');
        return;
    }

    try {
        // Get all current expressions and remove them
        const expressions = calculator.getExpressions();
        if (expressions.length > 0) {
            const idsToRemove = expressions.map(expr => ({ id: expr.id }));
            calculator.removeExpressions(idsToRemove);
        }
        
        // Clear the expression IDs array
        expressionIds = [];
        
        // Clear helper expressions
        helperExpressions = {};

        console.log('Calculator cleared successfully');

    } catch (error) {
        console.error('Error clearing calculator:', error);
        // Fallback: use setExpressions with empty array
        try {
            calculator.setExpressions([]);
            expressionIds = [];
            helperExpressions = {};
        } catch (fallbackError) {
            console.error('Fallback clear also failed:', fallbackError);
            alert('Error clearing calculator. Please try again.');
        }
    }
}

// Make function globally accessible
window.clearCalculator = clearCalculator;

// Reset the calculator view to default
function resetView() {
    if (!calculator) {
        console.error('Calculator not initialized');
        alert('Calculator not initialized. Please refresh the page.');
        return;
    }

    try {
        // Reset the math bounds to default viewport (-10 to 10 on both axes)
        calculator.setMathBounds({
            left: -10,
            right: 10,
            bottom: -10,
            top: 10
        });
        console.log('Calculator view reset successfully');
    } catch (error) {
        console.error('Error resetting view:', error);
        // Fallback: try setDefaultState if setMathBounds doesn't work
        try {
            if (typeof calculator.setDefaultState === 'function') {
                calculator.setDefaultState();
                console.log('Calculator view reset using fallback method');
            } else {
                // Alternative: reset using setState with default bounds
                const state = calculator.getState();
                if (state && state.graph) {
                    state.graph.viewport = {
                        xmin: -10,
                        xmax: 10,
                        ymin: -10,
                        ymax: 10
                    };
                    calculator.setState(state);
                }
            }
        } catch (fallbackError) {
            console.error('Fallback reset also failed:', fallbackError);
            alert('Error resetting view. Please try zooming out manually.');
        }
    }
}

// Make function globally accessible
window.resetView = resetView;

// Toggle complex mode on/off
function toggleComplexMode() {
    if (!calculator) {
        console.error('Calculator not initialized');
        alert('Calculator not initialized. Please refresh the page.');
        return;
    }

    try {
        // Get current settings
        const currentSettings = calculator.settings;
        const currentComplexMode = currentSettings.complex || false;

        // Toggle complex mode
        const newComplexMode = !currentComplexMode;

        // Update calculator settings
        calculator.updateSettings({
            complex: newComplexMode
        });

        console.log('Complex mode toggled to:', newComplexMode);

        // Update button appearance if needed
        const complexButton = document.getElementById('complex-mode-button');
        if (complexButton) {
            if (newComplexMode) {
                complexButton.classList.add('active');
            } else {
                complexButton.classList.remove('active');
            }
        }

        // Show status message
        const statusElement = document.getElementById('llm-status');
        if (statusElement) {
            statusElement.textContent = newComplexMode ? 'Complex mode enabled' : 'Complex mode disabled';
            statusElement.className = 'status-message active success';
        }

    } catch (error) {
        console.error('Error toggling complex mode:', error);
        alert('Error toggling complex mode: ' + error.message);
    }
}

// Make function globally accessible
window.toggleComplexMode = toggleComplexMode;

// Set example function in input field
function setExample(expression) {
    const input = document.getElementById('function-input');
    if (input) {
        input.value = expression;
    }
}

// Utility function to get current expressions
function getExpressions() {
    if (!calculator) {
        return [];
    }

    return calculator.getExpressions();
}

// Utility function to export calculator state
function exportState() {
    if (!calculator) {
        return null;
    }

    return calculator.getState();
}

// Utility function to import calculator state
function importState(state) {
    if (!calculator || !state) {
        return;
    }

    calculator.setState(state);
}

// Initialize Functions Library
function initializeFunctionsLibrary() {
    if (typeof DesmosFunctionsLibrary !== 'undefined') {
        functionsLibrary = new DesmosFunctionsLibrary();
        // Load functions list after library is ready
        setTimeout(() => {
            displayFunctionsLibrary();
        }, 500);
    } else {
        console.warn('DesmosFunctionsLibrary not available');
    }
}

// Toggle Functions Library Panel
function toggleFunctionsLibrary() {
    const panel = document.getElementById('functions-library-panel');
    if (panel) {
        const isVisible = panel.classList.contains('active');
        if (isVisible) {
            panel.classList.remove('active');
        } else {
            panel.classList.add('active');
            if (functionsLibrary) {
                displayFunctionsLibrary();
            }
        }
    }
}

// Display Functions Library
function displayFunctionsLibrary(searchQuery = '') {
    if (!functionsLibrary) {
        console.error('Functions library not initialized');
        return;
    }

    const listContainer = document.getElementById('functions-library-list');
    if (!listContainer) return;

    let functions = [];
    if (searchQuery && searchQuery.trim()) {
        functions = functionsLibrary.searchFunctions(searchQuery.trim());
    } else {
        functions = functionsLibrary.getAllFunctions();
    }

    if (functions.length === 0) {
        listContainer.innerHTML = '<div class="no-results">No functions found. Try a different search term.</div>';
        return;
    }

    // Group functions by category
    const grouped = {};
    functions.forEach(func => {
        const category = func.category || 'Other';
        if (!grouped[category]) {
            grouped[category] = [];
        }
        grouped[category].push(func);
    });

    // Build HTML
    let html = '';
    Object.keys(grouped).sort().forEach(category => {
        html += `<div class="function-category-section" style="margin-bottom: 24px;">`;
        html += `<h4 style="font-size: 1.125rem; font-weight: 600; color: var(--md-sys-color-on-surface); margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid var(--md-sys-color-outline);">${category}</h4>`;
        html += `<div class="function-category-functions" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px;">`;
        
        grouped[category].forEach(func => {
            html += createFunctionCard(func);
        });
        
        html += `</div></div>`;
    });

    listContainer.innerHTML = html;

    // Add click handlers to function cards
    listContainer.querySelectorAll('.function-card').forEach(card => {
        card.addEventListener('click', function() {
            const example = this.dataset.example;
            if (example) {
                // Plot the function directly
                plotFunction(example);
                // Close the panel
                toggleFunctionsLibrary();
            }
        });
    });
}

// Create Function Card HTML
function createFunctionCard(func) {
    // Determine the best expression to use for plotting
    let plotExpression = func.latex || func.example || func.syntax;
    
    // Convert numeric examples to plottable function forms
    if (func.example) {
        // Check if example contains numeric values that need conversion
        const numericPatterns = [
            // Single numeric argument: sqrt(16) -> sqrt(x)
            /^(\w+)\((\d+(?:\.\d+)?)\)$/,
            // Two numeric arguments: gcd(12, 18) -> gcd(x, y) or gcd(x, 2)
            /^(\w+)\((\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?)\)$/,
            // Three numeric arguments: nPr(5, 3) -> nPr(x, y)
            /^(\w+)\((\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?)\)$/,
            // Lists: mean([1,2,3]) -> mean([x, y, z])
            /^(\w+)\(\[[\d\s,]+\]\)$/,
            // Factorial: 5! -> x!
            /^(\d+)!$/,
            // Percent: 50% -> x%
            /^(\d+(?:\.\d+)?)%$/,
            // Mod: mod(17, 5) -> mod(x, y)
            /^mod\((\d+),\s*(\d+)\)$/,
        ];
        
        // Use LaTeX if available (it's usually the best representation)
        if (func.latex) {
            plotExpression = func.latex;
            // Special case: Convert |x| to abs(x) for Desmos compatibility
            if (func.name === 'abs' && plotExpression.includes('|')) {
                plotExpression = 'abs(x)';
            }
        } else {
            // Convert numeric examples to function form
            let converted = func.example;
            
            // Single argument functions: sqrt(16) -> sqrt(x)
            if (converted.match(/^\w+\(\d+(?:\.\d+)?\)$/)) {
                const match = converted.match(/^(\w+)\(/);
                if (match) {
                    converted = `${match[1]}(x)`;
                }
            }
            // Two argument functions: gcd(12, 18) -> gcd(x, y)
            else if (converted.match(/^\w+\(\d+(?:\.\d+)?,\s*\d+(?:\.\d+)?\)$/)) {
                const match = converted.match(/^(\w+)\(/);
                if (match) {
                    converted = `${match[1]}(x, y)`;
                }
            }
            // Lists: mean([1,2,3]) -> mean([x, y, z])
            else if (converted.match(/^\w+\(\[[\d\s,]+\]\)$/)) {
                const match = converted.match(/^(\w+)\(/);
                if (match) {
                    converted = `${match[1]}([x, y, z])`;
                }
            }
            // Factorial: 5! -> x!
            else if (converted.match(/^\d+!$/)) {
                converted = 'x!';
            }
            // Percent: 50% -> x%
            else if (converted.match(/^\d+(?:\.\d+)?%$/)) {
                converted = 'x%';
            }
            // Mod: mod(17, 5) -> mod(x, y)
            else if (converted.match(/^mod\(\d+,\s*\d+\)$/)) {
                converted = 'mod(x, y)';
            }
            // Absolute value: |x| -> abs(x) (Desmos doesn't support |x| directly)
            else if (converted.includes('|') && func.name === 'abs') {
                converted = 'abs(x)';
            }
            // Handle "or" cases like "|x| or abs(x)" -> use abs(x)
            else if (converted.includes(' or ') && func.name === 'abs') {
                const parts = converted.split(' or ');
                converted = parts.find(p => p.includes('abs')) || 'abs(x)';
            }
            
            plotExpression = converted;
        }
    }
    
    return `
        <div class="function-card" data-example="${plotExpression}" data-function-name="${func.name}">
            <div class="function-name">${func.name}</div>
            <div class="function-syntax">${func.syntax}</div>
        </div>
    `;
}

// Search Functions Library
function searchFunctionsLibrary(query) {
    displayFunctionsLibrary(query);
}

// Helper functions for common expression styles
const ExpressionStyles = {
    // Color presets
    RED: '#c74440',
    BLUE: '#2d70b3',
    GREEN: '#388c46',
    PURPLE: '#6042a6',
    ORANGE: '#fa7e19',
    BLACK: '#000000',
    
    // Line styles (lazy-loaded to avoid errors if Desmos not loaded yet)
    get SOLID() {
        return typeof Desmos !== 'undefined' && Desmos.LineStyles ? Desmos.LineStyles.SOLID : undefined;
    },
    get DASHED() {
        return typeof Desmos !== 'undefined' && Desmos.LineStyles ? Desmos.LineStyles.DASHED : undefined;
    },
    get DOTTED() {
        return typeof Desmos !== 'undefined' && Desmos.LineStyles ? Desmos.LineStyles.DOTTED : undefined;
    },
    
    // Point styles (lazy-loaded)
    get POINT() {
        return typeof Desmos !== 'undefined' && Desmos.PointStyles ? Desmos.PointStyles.POINT : undefined;
    },
    get OPEN() {
        return typeof Desmos !== 'undefined' && Desmos.PointStyles ? Desmos.PointStyles.OPEN : undefined;
    },
    get CROSS() {
        return typeof Desmos !== 'undefined' && Desmos.PointStyles ? Desmos.PointStyles.CROSS : undefined;
    },
    get OPEN_POINT() {
        return typeof Desmos !== 'undefined' && Desmos.PointStyles ? Desmos.PointStyles.OPEN_POINT : undefined;
    },
    
    // Create a styled function
    createStyledFunction: function(latex, color, lineWidth = 2.5, lineStyle = null) {
        // Use SOLID as default if lineStyle not provided
        if (lineStyle === null) {
            lineStyle = ExpressionStyles.SOLID;
        }
        return plotFunction(latex, {
            color: color,
            lineWidth: lineWidth,
            lineStyle: lineStyle
        });
    },
    
    // Create a point with label
    createLabeledPoint: function(x, y, label, color = '#c74440') {
        return plotFunction(`(${x}, ${y})`, {
            color: color,
            label: label,
            showLabel: true,
            pointStyle: ExpressionStyles.POINT,
            pointSize: 9
        });
    },
    
    // Create a slider
    createSlider: function(variable, initialValue, min, max, step = null) {
        const sliderBounds = { min: String(min), max: String(max) };
        if (step !== null) {
            sliderBounds.step = String(step);
        }
        
        return plotFunction(`${variable} = ${initialValue}`, {
            sliderBounds: sliderBounds
        });
    },
    
    // Create an inequality with fill
    createInequality: function(latex, color = '#c74440', fillOpacity = 0.4) {
        return plotFunction(latex, {
            color: color,
            fillOpacity: fillOpacity,
            fill: true
        });
    }
};

// Make ExpressionStyles globally accessible
window.ExpressionStyles = ExpressionStyles;

// Example function to create a sample table
function createExampleTable() {
    const tableId = createTable([
        {
            latex: 'x',
            values: ['1', '2', '3', '4', '5']
        },
        {
            latex: 'y',
            values: ['1', '4', '9', '16', '25'],
            dragMode: Desmos.DragModes.XY,
            color: '#c74440'
        },
        {
            latex: 'x^2',
            color: '#2d70b3',
            lines: true,
            points: true
        }
    ]);
    
    if (tableId) {
        console.log('Example table created with ID:', tableId);
    }
}

// Make createExampleTable globally accessible
window.createExampleTable = createExampleTable;

// ============================================================================
// LLM Integration Functions
// ============================================================================

/**
 * Initialize LLM Integration
 */
function initializeLLMIntegration() {
    // Check if LLM modules are loaded
    if (typeof LLMRequestSchema === 'undefined' || typeof llmIntegration === 'undefined') {
        console.warn('LLM integration modules not loaded. Make sure llm-schema.js and llm-integration.js are included.');
        return;
    }
    
    // Initialize Desmos config constants
    if (typeof DesmosConfig !== 'undefined' && typeof Desmos !== 'undefined') {
        DesmosConfig.initialize();
    }
    
    // Log API endpoint status
    if (typeof LLMConfig !== 'undefined' && LLMConfig.apiEndpoint) {
        console.log('LLM API endpoint configured:', LLMConfig.apiEndpoint);
    } else {
        console.warn('LLM API endpoint not configured. Call configureLLMAPI() to set it.');
    }
    
    console.log('LLM integration initialized');
}

/**
 * Process user prompt with LLM and apply to calculator
 */
async function processLLMPrompt() {
    if (!calculator) {
        alert('Calculator not initialized');
        return;
    }

    const promptInput = document.getElementById('llm-prompt-input');
    const prompt = promptInput?.value?.trim();
    if (!prompt) {
        alert('Please enter a prompt');
        return;
    }

    const promptButton = document.getElementById('llm-prompt-button');
    const statusElement = document.getElementById('llm-status');

    // Show loading
    if (promptButton) {
        promptButton.disabled = true;
        promptButton.textContent = 'Processing...';
    }
    if (statusElement) {
        statusElement.className = '';
        statusElement.textContent = '';
    }

    try {
        // Get context
        const context = { currentExpressions: calculator.getExpressions() };

        // Process with LLM
        const response = await llmIntegration.processPrompt(prompt, context);

        // Apply to calculator
        const expressionIds = DesmosConverter.applyToCalculator(response, calculator);

        // Update UI
        if (statusElement) {
            statusElement.textContent = response.explanation || 'Plotted successfully';
            statusElement.className = 'status-message active success';
        }
        promptInput.value = '';

        // Update API status after successful request
        checkAPIStatus();

    } catch (error) {
        console.error('Error:', error);
        const message = error.message.includes('Rate limit')
            ? '⏱️ Rate limit exceeded. Try again later.'
            : error.message;

        if (statusElement) {
            statusElement.textContent = message;
            statusElement.className = 'status-message active error';
        } else {
            alert(message);
        }

        // Update API status after error (especially for rate limits)
        checkAPIStatus();
    } finally {
        // Restore button
        if (promptButton) {
            promptButton.disabled = false;
            promptButton.textContent = 'Plot with AI';
        }
    }
}

/**
 * Get current calculator state as context for LLM
 */
function getCalculatorContext() {
    if (!calculator) {
        return null;
    }

    // Get viewport from calculator graphpaperBounds
    let viewport = null;
    try {
        if (calculator.graphpaperBounds && calculator.graphpaperBounds.mathCoordinates) {
            viewport = calculator.graphpaperBounds.mathCoordinates;
        }
    } catch (e) {
        console.warn('Could not get viewport from calculator:', e);
    }

    // Get settings from calculator.settings object
    let settings = null;
    try {
        if (calculator.settings) {
            settings = {
                showGrid: calculator.settings.showGrid,
                showXAxis: calculator.settings.showXAxis,
                showYAxis: calculator.settings.showYAxis,
                xAxisLabel: calculator.settings.xAxisLabel,
                yAxisLabel: calculator.settings.yAxisLabel,
                degreeMode: calculator.settings.degreeMode,
                polarMode: calculator.settings.polarMode
            };
        }
    } catch (e) {
        console.warn('Could not get settings from calculator:', e);
    }

    return {
        expressions: calculator.getExpressions().map(expr => ({
            id: expr.id,
            type: expr.type,
            latex: expr.latex,
            text: expr.text,
            color: expr.color,
            hidden: expr.hidden
        })),
        viewport: viewport,
        settings: settings
    };
}

/**
 * Configure LLM API endpoint (for Vercel backend)
 * Call this function to set your Vercel API endpoint
 * @param {string} apiEndpoint - Your Vercel API endpoint URL (e.g., 'https://your-project.vercel.app/api/desmos-llm')
 */
function configureLLMAPI(apiEndpoint) {
    if (typeof configureLLMAPIEndpoint === 'undefined') {
        console.error('LLM integration not loaded');
        return;
    }
    configureLLMAPIEndpoint(apiEndpoint);
}

// Make functions globally accessible for onclick handlers
window.plotFunction = plotFunction;
window.toggleFunctionsLibrary = toggleFunctionsLibrary;
window.searchFunctionsLibrary = searchFunctionsLibrary;
window.createHelperExpression = createHelperExpression;
window.getHelperExpressionValue = getHelperExpressionValue;
window.updateExpression = updateExpression;
window.createTable = createTable;
window.createNote = createNote;
window.removeExpressionById = removeExpressionById;
window.getExpressionAnalysis = getExpressionAnalysis;
window.getAllExpressions = getAllExpressions;
window.processLLMPrompt = processLLMPrompt;
window.getCalculatorContext = getCalculatorContext;
window.configureLLMAPI = configureLLMAPI;

// API Status Checking Functions
async function checkAPIHealth() {
    try {
        const response = await fetch('https://ai-reply-bot.vercel.app/api/health', {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        // Extract rate limit info from headers
        const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
        const rateLimitLimit = response.headers.get('X-RateLimit-Limit');
        const retryAfter = response.headers.get('Retry-After');

        if (response.status === 429) {
            // Rate limited - extract info from response body
            const data = await response.json();
            console.warn('Rate limit exceeded:', {
                remaining: data.remainingRequests || 0,
                retryAfter: data.retryAfter || retryAfter,
                resetTime: data.resetTime
            });
            return 0; // No requests available
        }

        if (response.ok) {
            const data = await response.json();
            if (data.serverStatus === 'healthy') {
                // Use header value if available, otherwise fall back to body
                const remaining = rateLimitRemaining !== null ? parseInt(rateLimitRemaining) : data.remainingRequests;
                return remaining !== null && remaining !== undefined ? remaining : 0;
            } else {
                // Server has issues but is responding
                return 0; // Treat as no requests available
            }
        } else {
            // API endpoint error
            return 0;
        }
    } catch (error) {
        console.error('API health check failed:', error);
        return 0; // API is offline
    }
}

async function checkAPIRateLimit() {
    try {
        const response = await fetch('https://ai-reply-bot.vercel.app/api/rate-limit', {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Rate limit endpoint response:', data);
            return data;
        } else {
            console.warn('Rate limit endpoint returned:', response.status);
            return null;
        }
    } catch (error) {
        console.error('API rate limit check failed:', error);
        return null;
    }
}

async function checkAPIStatus() {
    const apiButton = document.getElementById('api-status-button');
    const statusIndicator = document.getElementById('api-status-indicator');

    if (apiButton) {
        apiButton.disabled = true;
    }
    if (statusIndicator) {
        statusIndicator.textContent = '';
        statusIndicator.className = 'api-status-indicator status-unknown';
    }

    try {
        // Check health (which includes remaining requests)
        const healthResult = await checkAPIHealth();

        // Update the header status indicator
        if (statusIndicator && healthResult !== null) {
            const remaining = healthResult;
            statusIndicator.textContent = '';

            // Color based on remaining requests
            if (remaining === 0) {
                statusIndicator.className = 'api-status-indicator status-error';
                statusIndicator.title = 'Rate limit exceeded. Please wait before trying again.';
            } else if (remaining <= 2) {
                statusIndicator.className = 'api-status-indicator status-warning';
                statusIndicator.title = `Only ${remaining} request${remaining !== 1 ? 's' : ''} remaining.`;
            } else {
                statusIndicator.className = 'api-status-indicator status-healthy';
                statusIndicator.title = `${remaining} requests remaining.`;
            }
        }

        console.log('API Status Check Results:', { healthResult });

    } catch (error) {
        console.error('API status check failed:', error);
        if (statusIndicator) {
            statusIndicator.textContent = '';
            statusIndicator.className = 'api-status-indicator status-error';
        }
    } finally {
        if (apiButton) {
            apiButton.disabled = false;
        }
    }
}

// Auto-check API status on page load
document.addEventListener('DOMContentLoaded', function() {
    // Check status after a short delay to not interfere with initial page load
    setTimeout(() => {
        checkAPIStatus();
    }, 1000);
});

// Make API status functions globally accessible
window.checkAPIStatus = checkAPIStatus;
window.checkAPIHealth = checkAPIHealth;
window.checkAPIRateLimit = checkAPIRateLimit;
