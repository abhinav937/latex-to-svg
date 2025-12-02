# Desmos LLM API - Vercel Backend

This document provides comprehensive guidance for the Desmos LLM API endpoint that processes natural language prompts and returns Desmos graphing calculator configurations.

## 🚀 Quick Start

### 1. API Endpoint

The API is available at:
```
https://ai-reply-bot.vercel.app/api/desmos-llm
```

Handles POST requests with JSON body.

### 2. Environment Variables

Set in Vercel dashboard:
- `API_KEY` - Your Google Gemini API key

### 3. Basic Usage

```javascript
const response = await fetch('https://ai-reply-bot.vercel.app/api/desmos-llm', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: "Plot y = x^2"
  })
});

const desmosConfig = await response.json();
// Use desmosConfig.expressions, desmosConfig.viewport, etc.
```

### 4. Frontend Configuration

In your frontend code:
```javascript
configureLLMAPI('https://ai-reply-bot.vercel.app/api/desmos-llm');
```

---

## 📋 Table of Contents

- [Overview](#overview)
- [API Specification](#api-specification)
- [Request Format](#request-format)
- [Response Format](#response-format)
- [Features](#features)
- [Testing](#testing)
- [Frontend Integration](#frontend-integration)
- [Troubleshooting](#troubleshooting)
- [Deployment](#deployment)

---

## Overview

The Vercel API endpoint receives natural language prompts from the frontend, processes them with Google Gemini AI, and returns structured JSON that the frontend converts into Desmos expressions.

**Flow:**
```
Frontend → Vercel API → Google Gemini → Vercel API → Frontend → Desmos Calculator
```

**Status:** ✅ Live and working

**Production URL:** `https://ai-reply-bot.vercel.app/api/desmos-llm`

---

## API Specification

### Endpoint
```
POST /api/desmos-llm
```

### Headers
```
Content-Type: application/json
```

### CORS
Your API should allow CORS from your frontend domain:
```javascript
headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
}
```

---

## Request Format

Your API will receive POST requests with this structure:

```json
{
  "prompt": "plot a sinwave with 50Hz frequency in red color and a blue color cos wave with 100Hz",
  "context": {
    "currentExpressions": [],
    "currentViewport": {
      "left": -10,
      "right": 10,
      "bottom": -10,
      "top": 10
    },
    "currentSettings": {
      "showGrid": true,
      "showXAxis": true,
      "showYAxis": true
    },
    "timestamp": "2025-01-27T10:30:00.000Z"
  },
  "systemPrompt": "You are an expert mathematical graphing assistant...",
  "responseFormat": {
    "type": "object",
    "properties": {
      "expressions": { ... },
      "viewport": { ... },
      "settings": { ... },
      "explanation": { ... }
    }
  }
}
```

### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `prompt` | string | ✅ Yes | User's natural language request |
| `context` | object | No | Current calculator state (optional) |
| `systemPrompt` | string | No | System prompt for LLM (provided by frontend) |
| `responseFormat` | object | No | JSON schema for response (provided by frontend) |

---

## Response Format

Your API **must** return JSON in this exact format:

```json
{
  "expressions": [
    {
      "type": "expression",
      "latex": "y = \\sin(2\\pi \\cdot 50 \\cdot x)",
      "color": "#c74440",
      "lineWidth": 2.5,
      "lineStyle": "SOLID"
    },
    {
      "type": "expression",
      "latex": "y = \\cos(2\\pi \\cdot 100 \\cdot x)",
      "color": "#2d70b3",
      "lineWidth": 2.5,
      "lineStyle": "SOLID"
    }
  ],
  "viewport": {
    "left": -0.1,
    "right": 0.1,
    "bottom": -2,
    "top": 2
  },
  "settings": {
    "showGrid": true,
    "showXAxis": true,
    "showYAxis": true,
    "xAxisLabel": "Time (s)",
    "yAxisLabel": "Amplitude"
  },
  "explanation": "Plotted red sine wave at 50Hz and blue cosine wave at 100Hz"
}
```

### Response Fields

#### `expressions` (array, **required**)

Array of expressions to plot. Each expression object:

**Required:**
- `type` (string): `"expression"`, `"table"`, or `"text"`

**For `type: "expression"`:**
- `latex` (string, **required**): LaTeX expression

**For `type: "text"`:**
- `text` (string, **required**): Text content

**For `type: "table"`:**
- `columns` (array, **required**): Array of column objects

**Optional Properties:**
- `color` (string): Hex color code (e.g., `"#c74440"`)
- `lineStyle` (string): `"SOLID"`, `"DASHED"`, or `"DOTTED"`
- `lineWidth` (number): Line width (1-10)
- `lineOpacity` (number): Line opacity (0-1)
- `pointStyle` (string): `"POINT"`, `"OPEN"`, `"CROSS"`, or `"OPEN_POINT"`
- `pointSize` (number): Point size (1-20)
- `pointOpacity` (number): Point opacity (0-1)
- `fill` (boolean): Whether to fill region (for inequalities)
- `fillOpacity` (number): Fill opacity (0-1)
- `hidden` (boolean): Whether expression is hidden
- `label` (string): Label text
- `showLabel` (boolean): Whether to show label
- `sliderBounds` (object): For slider variables
  ```json
  {
    "min": "0",
    "max": "10",
    "step": "0.1"  // optional
  }
  ```
- `parametricDomain` (object): For parametric curves
  ```json
  {
    "min": "0",
    "max": "2\\pi"
  }
  ```
- `polarDomain` (object): For polar curves
  ```json
  {
    "min": "0",
    "max": "2\\pi"
  }
  ```

#### `viewport` (object, optional)

Viewport/math bounds:
```json
{
  "left": -5,
  "right": 5,
  "bottom": -5,
  "top": 5
}
```

#### `settings` (object, optional)

Calculator settings:
- `xAxisLabel` (string): X-axis label
- `yAxisLabel` (string): Y-axis label
- `showGrid` (boolean): Show grid
- `showXAxis` (boolean): Show X-axis
- `showYAxis` (boolean): Show Y-axis
- `xAxisNumbers` (boolean): Show X-axis numbers
- `yAxisNumbers` (boolean): Show Y-axis numbers
- `xAxisArrowMode` (string): `"NONE"`, `"POSITIVE"`, or `"BOTH"`
- `yAxisArrowMode` (string): `"NONE"`, `"POSITIVE"`, or `"BOTH"`
- `polarMode` (boolean): Enable polar mode
- `degreeMode` (boolean): Use degrees instead of radians
- `invertedColors` (boolean): Inverted color scheme
- `projectorMode` (boolean): Projector mode

#### `explanation` (string, optional)

Brief explanation of what was plotted (shown to user).

---

## Features

### ✅ Implemented Features

- **Google Gemini AI Integration** - Uses Google Gemini for natural language processing
- **Request Validation** - Validates required fields and input types
- **Response Validation** - Validates JSON structure and required fields
- **Rate Limiting** - 5 requests per minute per client (sliding window)
- **CORS Support** - Configurable allowed origins with preflight handling
- **Error Handling** - Comprehensive error messages with proper HTTP status codes
- **Structured Prompt Engineering** - Optimized prompts for consistent JSON output
- **LaTeX Syntax Validation** - Ensures valid Desmos LaTeX expressions
- **Production Logging** - Clean, structured logging for debugging

### Rate Limiting

- **Limit:** 5 requests per minute per client
- **Algorithm:** Sliding window
- **Headers:** Returns `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `Retry-After`

### CORS Configuration

- Configurable allowed origins
- Preflight OPTIONS request handling
- Security headers included

### Error Handling

- Proper HTTP status codes (400, 429, 500)
- Detailed error messages
- Graceful fallbacks for LLM errors

---

## Frontend Integration

### Basic Usage

```javascript
// Make a request
async function plotWithLLM(prompt) {
  const response = await fetch('https://ai-reply-bot.vercel.app/api/desmos-llm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt })
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const config = await response.json();
  applyDesmosConfiguration(config);
}

// Get current calculator state (optional context)
function getCurrentCalculatorState() {
  return {
    currentExpressions: calculator.getExpressions(),
    currentViewport: calculator.getMathBounds(),
    currentSettings: {
      showGrid: calculator.getSettings().showGrid,
      showXAxis: calculator.getSettings().showXAxis,
      showYAxis: calculator.getSettings().showYAxis
    },
    timestamp: new Date().toISOString()
  };
}

// Apply configuration to Desmos
function applyDesmosConfiguration(config) {
  if (config.viewport) {
    calculator.setMathBounds(config.viewport);
  }

  if (config.settings) {
    calculator.updateSettings(config.settings);
  }

  if (config.expressions) {
    config.expressions.forEach(expr => {
      calculator.setExpression(expr);
    });
  }

  console.log(config.explanation || 'Plot updated');
}
```

### HTML/JavaScript Example

```html
<!DOCTYPE html>
<html>
<body>
  <button onclick="plotWithLLM()">Plot y = x^2</button>
  <div id="result"></div>
  
  <script>
  async function plotWithLLM() {
    const apiUrl = 'https://ai-reply-bot.vercel.app/api/desmos-llm';
    
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'Plot y = x^2' })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      document.getElementById('result').innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
      console.log('Desmos config:', data);
      
    } catch (error) {
      console.error('Error:', error);
      document.getElementById('result').innerHTML = `Error: ${error.message}`;
    }
  }
  </script>
</body>
</html>
```

### Context-Aware Requests

Include current calculator state for better results:

```javascript
const context = {
  currentExpressions: calculator.getExpressions(),
  currentViewport: calculator.getMathBounds(),
  currentSettings: calculator.getSettings(),
  timestamp: new Date().toISOString()
};

const response = await fetch('/api/desmos-llm', {
  method: 'POST',
  body: JSON.stringify({
    prompt: "Add a tangent line at x=2",
    context
  })
});
```

---

## Example Responses

### Example 1: Simple Function
**Prompt:** "Plot y = x^2"

**Response:**
```json
{
  "expressions": [
    {
      "type": "expression",
      "latex": "y = x^2",
      "color": "#2d70b3",
      "lineWidth": 2.5
    }
  ],
  "viewport": {
    "left": -5,
    "right": 5,
    "bottom": -1,
    "top": 25
  },
  "explanation": "Plotted quadratic function y = x²"
}
```

### Example 2: Multiple Functions
**Prompt:** "Plot sin(x) and cos(x)"

**Response:**
```json
{
  "expressions": [
    {
      "type": "expression",
      "latex": "y = \\sin(x)",
      "color": "#2d70b3",
      "lineWidth": 2.5
    },
    {
      "type": "expression",
      "latex": "y = \\cos(x)",
      "color": "#c74440",
      "lineWidth": 2.5
    }
  ],
  "viewport": {
    "left": -10,
    "right": 10,
    "bottom": -2,
    "top": 2
  },
  "explanation": "Plotted sine and cosine functions"
}
```

### Example 3: Frequency Domain (Your Example)
**Prompt:** "plot a sinwave with 50Hz frequency in red color and a blue color cos wave with 100Hz"

**Response:**
```json
{
  "expressions": [
    {
      "type": "expression",
      "latex": "y = \\sin(2\\pi \\cdot 50 \\cdot x)",
      "color": "#c74440",
      "lineWidth": 2.5,
      "lineStyle": "SOLID"
    },
    {
      "type": "expression",
      "latex": "y = \\cos(2\\pi \\cdot 100 \\cdot x)",
      "color": "#2d70b3",
      "lineWidth": 2.5,
      "lineStyle": "SOLID"
    }
  ],
  "viewport": {
    "left": -0.1,
    "right": 0.1,
    "bottom": -2,
    "top": 2
  },
  "settings": {
    "showGrid": true,
    "xAxisLabel": "Time (s)",
    "yAxisLabel": "Amplitude"
  },
  "explanation": "Plotted red sine wave at 50Hz and blue cosine wave at 100Hz"
}
```

### Example 4: Inequality
**Prompt:** "Plot y > x^2"

**Response:**
```json
{
  "expressions": [
    {
      "type": "expression",
      "latex": "y > x^2",
      "color": "#c74440",
      "fill": true,
      "fillOpacity": 0.4,
      "lineWidth": 2.5
    }
  ],
  "viewport": {
    "left": -5,
    "right": 5,
    "bottom": -5,
    "top": 10
  },
  "explanation": "Plotted inequality y > x² with fill"
}
```

### Example 5: Slider
**Prompt:** "Create a slider for parameter a and plot y = a*x^2"

**Response:**
```json
{
  "expressions": [
    {
      "type": "expression",
      "latex": "a = 2",
      "sliderBounds": {
        "min": "0",
        "max": "10",
        "step": "0.1"
      }
    },
    {
      "type": "expression",
      "latex": "y = a * x^2",
      "color": "#388c46",
      "lineWidth": 2.5
    }
  ],
  "viewport": {
    "left": -5,
    "right": 5,
    "bottom": -5,
    "top": 50
  },
  "explanation": "Created quadratic function with adjustable parameter a"
}
```

---

## Testing

### Test with curl

```bash
# Basic quadratic function
curl -X POST https://ai-reply-bot.vercel.app/api/desmos-llm \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Plot y = x^2"}'
```

```bash
# Trigonometric functions
curl -X POST https://ai-reply-bot.vercel.app/api/desmos-llm \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Plot sin(x) and cos(x)"}'
```

```bash
# Frequency domain example
curl -X POST https://ai-reply-bot.vercel.app/api/desmos-llm \
  -H "Content-Type: application/json" \
  -d '{"prompt": "plot a sinwave with 50Hz frequency in red color and a blue color cos wave with 100Hz"}'
```

### Quick Test

```bash
curl -X POST https://ai-reply-bot.vercel.app/api/desmos-llm \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Plot y = x^2"}'
```

### Test Cases Covered

- ✅ Simple functions (y = x²)
- ✅ Multiple expressions (sin(x), cos(x))
- ✅ Frequency domain plots (sine waves with Hz)
- ✅ Colors and styling
- ✅ Inequalities with fill
- ✅ Parametric curves
- ✅ Polar curves
- ✅ Slider parameters

### Validation Checklist

- [x] Response is valid JSON
- [x] `expressions` array is present
- [x] Each expression has `type` field
- [x] Expressions with `type: "expression"` have `latex` field
- [x] LaTeX syntax is correct (escaped backslashes: `\\sin`)
- [x] Colors are valid hex codes
- [x] Viewport bounds are numbers
- [x] No undefined or null values in required fields

---

## Deployment

### Vercel Configuration

The API is configured in `vercel.json`:

```json
{
  "functions": {
    "api/desmos-llm.ts": {
      "maxDuration": 30
    }
  }
}
```

### Environment Variables

**Required:**
- `API_KEY`: Google Gemini API key

Set in Vercel dashboard under Project Settings → Environment Variables.

### Build & Deploy

```bash
vercel --prod --yes
```

**Current Production URL:** 
```
https://ai-reply-bot.vercel.app/api/desmos-llm
```

**Status:** ✅ Live and working

---

## Troubleshooting

### Common Issues

1. **"API_KEY environment variable is not set"**
   - Ensure `API_KEY` is set in Vercel environment variables
   - Check that it's your Google Gemini API key
   - Verify environment variables are set for the correct environment (Production/Preview)

2. **"Rate limit exceeded"**
   - API allows 5 requests per minute per client
   - Implement client-side rate limiting
   - Show retry-after time to users
   - Check `X-RateLimit-Remaining` header

3. **"Invalid JSON response from LLM"**
   - LLM may have returned malformed JSON
   - Check API response parsing logic
   - Ensure proper prompt engineering
   - Verify Google Gemini API is responding correctly

4. **"expressions array required"**
   - LLM response validation failed
   - Check that response has required fields
   - Verify JSON schema compliance
   - Review API logs for LLM response

5. **CORS errors**
   - Add frontend domain to allowed origins in API
   - Check CORS configuration
   - Verify OPTIONS request handling
   - Check browser console for specific CORS error

6. **API timeout**
   - Vercel function timeout is 30 seconds
   - Optimize LLM prompt (shorter, more focused)
   - Check Google Gemini API response times
   - Consider caching common requests

### Debug Mode

Enable debug logging by checking Vercel function logs:

```bash
vercel logs
```

Or view logs in Vercel dashboard under your project → Functions → Logs.

---

## Advanced Features

### Custom System Prompts

Override the default system prompt:

```javascript
const customPrompt = `
You are a specialized graphing assistant for engineering students.
Focus on technical accuracy and include axis labels for measurements.
Always use SI units and proper scaling.
`;

const response = await fetch('/api/desmos-llm', {
  method: 'POST',
  body: JSON.stringify({
    prompt: "Plot voltage vs time for a 1kHz sine wave",
    systemPrompt: customPrompt
  })
});
```

### Response Schema Customization

Provide custom JSON schema:

```javascript
const customSchema = {
  type: "object",
  properties: {
    expressions: { type: "array" },
    viewport: { type: "object" },
    settings: { type: "object" },
    explanation: { type: "string" },
    metadata: { type: "object" } // Custom field
  },
  required: ["expressions"]
};
```

## Performance Considerations

- **Rate Limiting**: Prevents abuse and manages costs (5 req/min)
- **Response Caching**: Consider caching frequent queries
- **Prompt Optimization**: Keep prompts concise
- **Model Selection**: Google Gemini Pro is optimized for this use case
- **Timeout Handling**: 30-second Vercel limit

## API Status

**Current Production URL:** 
```
https://ai-reply-bot.vercel.app/api/desmos-llm
```

**Status:** ✅ Live and working

**Features:**
- ✅ Natural language to Desmos JSON conversion
- ✅ Google Gemini AI integration
- ✅ Comprehensive error handling
- ✅ CORS support for web applications
- ✅ Rate limiting (5 req/min)
- ✅ Clean, production-ready logging

## Key Points to Remember

1. **Always return valid JSON** - No markdown formatting
2. **Required fields** - `expressions` array is mandatory
3. **LaTeX escaping** - Use `\\sin` not `\sin` in JSON
4. **Color codes** - Use exact hex codes from Desmos palette
5. **Viewport bounds** - Set appropriate bounds for the graph
6. **Error handling** - Return proper error responses, don't crash
7. **CORS** - Enabled for web applications
8. **Rate limiting** - 5 requests per minute per client
9. **Validation** - Response validation ensures quality

## Additional Resources

- **Frontend Integration**: See `../docs/VERCEL_API_SPEC.md`
- **Prompt Examples**: See `../docs/LLM_PROMPT_GUIDE.md`
- **Test Cases**: See `../test-api-responses.js`
- **Workflow Explanation**: See `../WORKFLOW_EXPLANATION.md`

## Support

If you encounter issues:
1. Check browser console for errors
2. Check Vercel function logs (`vercel logs`)
3. Verify `API_KEY` environment variable is set
4. Test with curl to isolate frontend issues
5. Review test cases in `test-api-responses.js`
6. Check rate limit headers in response

---

**API is live and ready to use!** 🚀

This API implementation is part of the ai-reply-bot project.

