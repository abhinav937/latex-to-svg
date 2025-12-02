# Desmos Graphing Calculator

Interactive graphing calculator powered by Desmos API with AI-powered natural language plotting.

## Directory Structure

```
desmos/
├── index.html              # Main HTML file
├── desmos.js              # Core calculator logic
├── desmos.css             # Styling
│
├── functions/              # Functions library
│   ├── desmos-functions-library.js
│   └── desmos-functions.json
│
├── llm/                    # LLM integration (frontend)
│   ├── llm-schema.js      # Request/response schemas
│   ├── llm-integration.js # API communication
│   └── README.md          # API documentation
│
├── docs/                   # Documentation
│   ├── QUICK_START.md      # Quick setup guide
│   ├── VERCEL_API_SPEC.md  # API specification
│   ├── LLM_PROMPT_GUIDE.md # LLM prompt instructions
│   ├── DESMOS_API_FORMAT.md # Desmos API format reference
│   ├── WORKFLOW_EXPLANATION.md # Complete workflow guide
│   └── TESTING_GUIDE.md    # Testing instructions
│
└── tests/                  # Test files
    ├── test-api-responses.html
    ├── test-api-responses.js
    └── test-functionality.html
```

## Quick Start

1. **Open** `index.html` in your browser
2. **Use AI mode**: Enter a prompt like "Plot y = x²" and click "Generate Plot with AI"
3. **Use manual mode**: Enter LaTeX expressions directly

## API Configuration

The API endpoint is pre-configured to:
```
https://ai-reply-bot.vercel.app/api/desmos-llm
```

To change it, call:
```javascript
configureLLMAPI('your-api-endpoint');
```

## Documentation

- **API Documentation**: See `llm/README.md`
- **Quick Start**: See `docs/QUICK_START.md`
- **API Specification**: See `docs/VERCEL_API_SPEC.md`
- **Workflow Guide**: See `docs/WORKFLOW_EXPLANATION.md`
- **Testing**: See `docs/TESTING_GUIDE.md`

## Features

- ✅ Interactive Desmos graphing calculator
- ✅ AI-powered natural language plotting
- ✅ Manual LaTeX expression input
- ✅ Functions library browser
- ✅ Customizable styling and settings
- ✅ Support for functions, equations, inequalities, parametric curves, and more

## Testing

Run tests by opening files in `tests/` folder:
- `test-functionality.html` - Full workflow test (prompt → graph)
- `test-api-responses.html` - API response format validation

