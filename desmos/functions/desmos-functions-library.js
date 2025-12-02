/**
 * Desmos Functions Library
 * A comprehensive library of all Desmos-supported functions
 * Based on: https://help.desmos.com/hc/en-us/articles/212235786-Supported-Functions
 */

class DesmosFunctionsLibrary {
    constructor() {
        this.functionsData = null;
        this.loadFunctions();
    }

    /**
     * Load functions data from JSON file
     */
    async loadFunctions() {
        try {
            const response = await fetch('./functions/desmos-functions.json');
            this.functionsData = await response.json();
        } catch (error) {
            console.error('Error loading Desmos functions library:', error);
            // Fallback: use embedded data if fetch fails
            this.loadEmbeddedData();
        }
    }

    /**
     * Get all functions
     */
    getAllFunctions() {
        if (!this.functionsData) return [];
        
        const allFunctions = [];
        Object.values(this.functionsData.categories).forEach(category => {
            if (category.functions) {
                allFunctions.push(...category.functions.map(f => ({
                    ...f,
                    category: category.name
                })));
            }
        });
        return allFunctions;
    }

    /**
     * Get functions by category
     */
    getFunctionsByCategory(categoryKey) {
        if (!this.functionsData) return [];
        const category = this.functionsData.categories[categoryKey];
        return category && category.functions ? category.functions : [];
    }

    /**
     * Search functions by name or description
     */
    searchFunctions(query) {
        const allFunctions = this.getAllFunctions();
        const lowerQuery = query.toLowerCase();
        
        return allFunctions.filter(func => 
            func.name.toLowerCase().includes(lowerQuery) ||
            func.description.toLowerCase().includes(lowerQuery) ||
            func.syntax.toLowerCase().includes(lowerQuery)
        );
    }

    /**
     * Get function by name
     */
    getFunctionByName(name) {
        const allFunctions = this.getAllFunctions();
        return allFunctions.find(func => func.name.toLowerCase() === name.toLowerCase());
    }

    /**
     * Get all categories
     */
    getCategories() {
        if (!this.functionsData) return [];
        return Object.keys(this.functionsData.categories).map(key => ({
            key,
            ...this.functionsData.categories[key]
        }));
    }

    /**
     * Get constants
     */
    getConstants() {
        if (!this.functionsData) return [];
        const constantsCategory = this.functionsData.categories.constants;
        return constantsCategory && constantsCategory.constants ? constantsCategory.constants : [];
    }

    /**
     * Get special variables
     */
    getVariables() {
        if (!this.functionsData) return [];
        const variablesCategory = this.functionsData.categories.variables;
        return variablesCategory && variablesCategory.variables ? variablesCategory.variables : [];
    }

    /**
     * Get autocomplete suggestions based on input
     */
    getAutocompleteSuggestions(input) {
        if (!input || input.length < 1) return [];
        
        const allFunctions = this.getAllFunctions();
        const lowerInput = input.toLowerCase();
        
        // Filter functions that match the input
        const matches = allFunctions.filter(func => 
            func.name.toLowerCase().startsWith(lowerInput) ||
            func.syntax.toLowerCase().includes(lowerInput)
        );
        
        // Sort by relevance (exact name matches first)
        return matches.sort((a, b) => {
            const aStarts = a.name.toLowerCase().startsWith(lowerInput);
            const bStarts = b.name.toLowerCase().startsWith(lowerInput);
            if (aStarts && !bStarts) return -1;
            if (!aStarts && bStarts) return 1;
            return a.name.localeCompare(b.name);
        }).slice(0, 10); // Limit to 10 suggestions
    }

    /**
     * Get function examples by category
     */
    getExamplesByCategory(categoryKey, limit = 5) {
        const functions = this.getFunctionsByCategory(categoryKey);
        return functions.slice(0, limit).map(f => ({
            name: f.name,
            example: f.example,
            description: f.description
        }));
    }

    /**
     * Get popular/common functions
     */
    getPopularFunctions() {
        const popular = [
            'sin', 'cos', 'tan', 'ln', 'log', 'sqrt', 'abs',
            'mean', 'median', 'min', 'max', 'exp', 'floor', 'ceil'
        ];
        
        return popular.map(name => this.getFunctionByName(name)).filter(f => f !== undefined);
    }

    /**
     * Format function for display
     */
    formatFunctionForDisplay(func) {
        return {
            name: func.name,
            syntax: func.syntax,
            description: func.description,
            example: func.example,
            category: func.category || 'Unknown'
        };
    }

    /**
     * Get function documentation string
     */
    getFunctionDocumentation(func) {
        return `${func.name}\nSyntax: ${func.syntax}\nDescription: ${func.description}\nExample: ${func.example}`;
    }

    /**
     * Check if a string contains a valid Desmos function
     */
    containsFunction(input) {
        const allFunctions = this.getAllFunctions();
        const lowerInput = input.toLowerCase();
        
        return allFunctions.some(func => 
            lowerInput.includes(func.name.toLowerCase()) ||
            lowerInput.includes(func.syntax.toLowerCase())
        );
    }

    /**
     * Extract functions from an expression
     */
    extractFunctionsFromExpression(expression) {
        const allFunctions = this.getAllFunctions();
        const found = [];
        const lowerExpr = expression.toLowerCase();
        
        allFunctions.forEach(func => {
            if (lowerExpr.includes(func.name.toLowerCase())) {
                found.push(func);
            }
        });
        
        return found;
    }

    /**
     * Get related functions (same category)
     */
    getRelatedFunctions(functionName) {
        const func = this.getFunctionByName(functionName);
        if (!func) return [];
        
        const category = Object.keys(this.functionsData.categories).find(key => {
            const cat = this.functionsData.categories[key];
            return cat.functions && cat.functions.some(f => f.name === func.name);
        });
        
        if (!category) return [];
        
        return this.getFunctionsByCategory(category).filter(f => f.name !== functionName);
    }

    /**
     * Fallback: Load embedded data if JSON fetch fails
     */
    loadEmbeddedData() {
        // This would contain the same data as the JSON file
        // For now, we'll just log that we need to load it
        console.warn('Using embedded data fallback - consider loading from JSON file');
    }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DesmosFunctionsLibrary;
}

// Make available globally
if (typeof window !== 'undefined') {
    window.DesmosFunctionsLibrary = DesmosFunctionsLibrary;
}
