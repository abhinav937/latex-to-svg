/**
 * Simple LLM Integration for Desmos Calculator
 * Only converts natural language to mathematical expressions
 * Desmos handles ALL calculations and plotting
 */

const LLMConfig = {
    apiEndpoint: 'https://ai-reply-bot.vercel.app/api/desmos-llm',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    timeout: 30000,
    maxRetries: 3,
    retryDelay: 1000
};

function configureLLMAPIEndpoint(endpoint) {
    if (endpoint) {
        LLMConfig.apiEndpoint = endpoint;
        console.log('LLM API configured:', endpoint);
    }
}

function createRequest(prompt, context = {}) {
    return {
        prompt: prompt,
        context: {
            currentExpressions: context.currentExpressions || [],
            currentViewport: context.currentViewport || null,
            timestamp: new Date().toISOString()
        },
        systemPrompt: getSystemPrompt(),
        responseFormat: getResponseFormat()
    };
}

function getSystemPrompt() {
    return `Convert natural language to Desmos mathematical expressions.
DO NOT perform calculations - let Desmos handle all math.
Return expressions that Desmos can directly plot.

Examples:
- "plot x squared" → {latex: "y = x^2"}
- "2+3i plus 4+2i" → {latex: "(2+3i) + (4+2i)", complexMode: true}
- "sine wave" → {latex: "y = \\sin(x)"}`;
}

function getResponseFormat() {
    return {
        type: "object",
        properties: {
            expressions: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        type: { type: "string", enum: ["expression"] },
                        latex: { type: "string" },
                        color: { type: "string" },
                        lineWidth: { type: "number" },
                        sliderBounds: { type: "object" }
                    },
                    required: ["latex"]
                }
            },
            settings: {
                type: "object",
                properties: {
                    complexMode: { type: "boolean" },
                    polarMode: { type: "boolean" },
                    degreeMode: { type: "boolean" }
                }
            },
            viewport: {
                type: "object",
                properties: {
                    left: { type: "number" },
                    right: { type: "number" },
                    bottom: { type: "number" },
                    top: { type: "number" }
                }
            },
            explanation: { type: "string" }
        },
        required: ["expressions"]
    };
}

function normalizeResponse(response) {
    if (!response || !Array.isArray(response.expressions)) {
        throw new Error('Invalid response format');
    }

    return {
        expressions: response.expressions.map(expr => ({
            type: expr.type || 'expression',
            latex: cleanLatex(expr.latex || ''),
            color: expr.color,
            lineWidth: expr.lineWidth,
            sliderBounds: expr.sliderBounds,
            ...expr
        })),
        settings: response.settings || {},
        viewport: response.viewport || { left: -10, right: 10, bottom: -10, top: 10 },
        explanation: response.explanation || ''
    };
}

function cleanLatex(latex) {
    if (!latex) return '';
    return latex
        .replace(/\$([^$]+)\$/g, '$1')
        .replace(/\\\(([^)]+)\\\)/g, '$1')
        .replace(/\\\[([^\]]+)\\\]/g, '$1')
        .trim();
}

/**
 * Simple LLM Integration Class
 */
class LLMIntegration {
    constructor() {
        this.isProcessing = false;
    }

    async processPrompt(prompt, context = {}) {
        if (this.isProcessing) throw new Error('Already processing');
        if (!prompt?.trim()) throw new Error('Empty prompt');

        this.isProcessing = true;
        try {
            const request = createRequest(prompt, context);
            const response = await this.callAPI(request);
            return normalizeResponse(response);
        } finally {
            this.isProcessing = false;
        }
    }

    /**
     * Call LLM API (Vercel backend)
     * @param {Object} request - Structured request object
     * @returns {Promise<Object>} Raw response from LLM
     */
    async callAPI(request) {
        if (!LLMConfig.apiEndpoint) {
            return mockResponse(request);
        }

        for (let attempt = 0; attempt < LLMConfig.maxRetries; attempt++) {
            try {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), LLMConfig.timeout);

                const response = await fetch(LLMConfig.apiEndpoint, {
                    method: LLMConfig.method,
                    headers: LLMConfig.headers,
                    body: JSON.stringify(request),
                    signal: controller.signal
                });

                clearTimeout(timeout);

                if (response.status === 429) {
                    const retryAfter = response.headers.get('Retry-After');
                    const mins = Math.ceil((parseInt(retryAfter) || 60) / 60);
                    throw new Error(`Rate limit exceeded. Try again in ${mins} minute${mins !== 1 ? 's' : ''}.`);
                }

                if (!response.ok) {
                    throw new Error(`API error: ${response.status}`);
                }

                return await response.json();
            } catch (error) {
                if (attempt === LLMConfig.maxRetries - 1) {
                    return mockResponse(request);
                }
                await new Promise(resolve => setTimeout(resolve, LLMConfig.retryDelay * (attempt + 1)));
            }
        }
    }

    isCurrentlyProcessing() {
        return this.isProcessing;
    }
}

/**
 * Simple mock response for development
 */
function mockResponse(request) {
    const prompt = request.prompt.toLowerCase();

    if (prompt.includes('sine') || prompt.includes('sin')) {
        return {
            expressions: [{ latex: 'y = \\sin(x)', color: '#c74440' }],
            viewport: { left: -10, right: 10, bottom: -2, top: 2 },
            explanation: 'Sine wave'
        };
    }

    if (prompt.includes('quadratic') || prompt.includes('x^2')) {
        return {
            expressions: [{ latex: 'y = x^2', color: '#2d70b3' }],
            viewport: { left: -10, right: 10, bottom: -5, top: 15 },
            explanation: 'Quadratic function'
        };
    }

    if (prompt.match(/\d+\+.*i.*\+.*\d+/i)) {
        const numbers = prompt.match(/(\d+\+\d+i)/g) || [];
        return {
            expressions: [
                ...numbers.map(num => ({ latex: num, color: '#2d70b3' })),
                { latex: `(${numbers[0]}) + (${numbers[1]})`, color: '#388c46' }
            ],
            settings: { complexMode: true },
            viewport: { left: -10, right: 10, bottom: -10, top: 10 },
            explanation: 'Complex number addition'
        };
    }

    if (prompt.includes('complex') || prompt.includes('imaginary')) {
        return {
            expressions: [{
                latex: 'z = a + bi',
                sliderBounds: { a: { min: -5, max: 5, step: 0.1 }, b: { min: -5, max: 5, step: 0.1 } },
                color: '#2d70b3'
            }],
            settings: { complexMode: true },
            viewport: { left: -8, right: 8, bottom: -8, top: 8 },
            explanation: 'Interactive complex number'
        };
    }

    return {
        expressions: [{ latex: 'y = x', color: '#2d70b3' }],
        viewport: { left: -10, right: 10, bottom: -10, top: 10 },
        explanation: 'Linear function'
    };
}

// Simple Desmos Converter
const DesmosConverter = {
    applyToCalculator(response, calculator) {
        if (!response.expressions?.length) return [];

        // Apply settings first
        if (response.settings) {
            calculator.updateSettings(response.settings);
        }

        // Apply viewport
        if (response.viewport) {
            calculator.setMathBounds(response.viewport);
        }

        // Apply expressions
        const ids = [];
        response.expressions.forEach(expr => {
            try {
                const desmosExpr = this.convertExpression(expr);
                calculator.setExpression(desmosExpr);
                ids.push(desmosExpr.id);
            } catch (error) {
                console.warn('Failed to apply expression:', expr, error);
            }
        });

        return ids;
    },

    convertExpression(expr) {
        const desmosExpr = {
            id: `expr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: expr.type || 'expression',
            latex: cleanLatex(expr.latex || ''),
            color: expr.color,
            lineWidth: expr.lineWidth,
            sliderBounds: expr.sliderBounds
        };

        // Remove undefined properties
        Object.keys(desmosExpr).forEach(key => {
            if (desmosExpr[key] === undefined) delete desmosExpr[key];
        });

        return desmosExpr;
    }
};

// Create global instance and export
const llmIntegration = new LLMIntegration();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LLMIntegration, DesmosConverter, llmIntegration, configureLLMAPIEndpoint };
}

// Make available globally
window.LLMIntegration = LLMIntegration;
window.DesmosConverter = DesmosConverter;
window.llmIntegration = llmIntegration;
window.configureLLMAPIEndpoint = configureLLMAPIEndpoint;
