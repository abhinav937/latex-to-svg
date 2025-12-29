<div align="center">

# LaTeX to SVG

A fast, browser-based tool for converting LaTeX equations to SVG and PNG images.

[Report Bug](https://github.com/your-username/latex-to-svg/issues)

</div>

## Features

- **Real-time Preview** - See your LaTeX equations rendered instantly as SVG
- **Multiple Export Formats** - Download as SVG or high-resolution PNG
- **Copy to Clipboard** - Copy SVG code or image directly to clipboard
- **Smart Autocomplete** - Type `\` to get suggestions for LaTeX commands
- **History Sidebar** - Access previously rendered equations
- **Keyboard Shortcuts** - Press Enter to render, Tab to select autocomplete

## Quick Start

**Prerequisites:** Node.js 18+

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Enter your LaTeX code in the input field
2. Press **Enter** or click **Render** to preview
3. Use quick actions to:
   - Copy SVG code
   - Copy as image (PNG)
   - Download SVG
   - Download PNG

### Example Equations

```latex
\frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
```

```latex
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
```

```latex
\nabla \times \vec{E} = -\frac{\partial \vec{B}}{\partial t}
```

## Tech Stack

- **Framework:** Angular 21
- **Styling:** Tailwind CSS 4
- **LaTeX Rendering:** [CodeCogs API](https://latex.codecogs.com/)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

## License

MIT
