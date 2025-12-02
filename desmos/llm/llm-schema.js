/**
 * Simple Schema for Desmos LLM Integration
 * Only defines expression conversion - no calculation logic
 */

const LLMRequestSchema = {
    createRequest: (prompt, context = {}) => ({
        prompt,
            context: {
                currentExpressions: context.currentExpressions || [],
                timestamp: new Date().toISOString()
            },
        systemPrompt: getSystemPrompt(),
        responseFormat: getResponseFormat()
    })
};

function getSystemPrompt() {
    return `Convert natural language to Desmos mathematical expressions.
DO NOT perform calculations - let Desmos handle all math.

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

/**
 * Response Schema - What we expect from the LLM
 */
const LLMResponseSchema = {
    validate: (response) => {
        const errors = [];
        if (!response || !Array.isArray(response.expressions)) {
            errors.push('Response must contain expressions array');
        } else {
            response.expressions.forEach((expr, index) => {
                if (expr.type === 'expression' && !expr.latex) {
                    errors.push(`Expression ${index}: missing latex`);
                }
            });
        }
        return { isValid: errors.length === 0, errors };
    },

    normalize: (response) => ({
        expressions: response.expressions || [],
        settings: response.settings || {},
        viewport: response.viewport || { left: -10, right: 10, bottom: -10, top: 10 },
            explanation: response.explanation || ''
    })
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { LLMRequestSchema, LLMResponseSchema };
}

// Make available globally
window.LLMRequestSchema = LLMRequestSchema;
window.LLMResponseSchema = LLMResponseSchema;
