// Feature flag for scaling functionality
const enableScaling = false; // Set to true to enable scaling, false to disable

// Wait for DOM to fully load
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded');

  // Check if Material Web Components are loaded
  if (!customElements.get('md-filled-text-field')) {
    console.error('Material Web Components not loaded. Ensure the library is included.');
    const errorMessage = document.getElementById('error-message');
    if (errorMessage) {
      errorMessage.textContent = 'Error: Material Web Components not loaded.';
      errorMessage.style.display = 'block';
    }
    return;
  }

  // Get DOM elements with safety checks
  const latexInput = document.getElementById('latex-input');
  const latexImage = document.getElementById('latex-image');
  const latexPreview = document.getElementById('latex-preview');
  const errorMessage = document.getElementById('error-message');
  const imageActions = document.getElementById('image-actions');
  const historyList = document.getElementById('history-list');

  // Log elements for debugging
  console.log('latexInput:', latexInput);
  console.log('latexImage:', latexImage);
  console.log('latexPreview:', latexPreview);
  console.log('errorMessage:', errorMessage);
  console.log('imageActions:', imageActions);
  console.log('historyList:', historyList);

  // Check if critical elements exist
  if (!latexInput || !latexImage || !latexPreview || !errorMessage || !imageActions || !historyList) {
    console.error('One or more DOM elements not found.');
    if (errorMessage) {
      errorMessage.textContent = 'Error: Required DOM elements not found.';
      errorMessage.style.display = 'block';
    }
    return;
  }

  let imageUrl = '';
  let latexHistory = JSON.parse(sessionStorage.getItem('latexHistory')) || [];

  // Scaling functionality (only if enabled)
  if (enableScaling) {
    const scaleSlider = document.getElementById('scale-slider');
    const scaleValue = document.getElementById('scale-value');

    if (!scaleSlider || !scaleValue) {
      console.error('Scaling elements not found.');
      return;
    }

    scaleSlider.addEventListener('input', () => {
      const sliderValue = parseFloat(scaleSlider.value);
      scaleValue.textContent = sliderValue.toFixed(1);
      latexImage.style.transform = `scale(${sliderValue})`;
    });
  }

  // Load and display history
  function updateHistory() {
    historyList.innerHTML = '';
    latexHistory.forEach((latex, index) => {
      const historyItem = document.createElement('div');
      historyItem.style = 'padding: 8px; cursor: pointer; border-bottom: 1px solid #eee;';
      historyItem.textContent = latex;
      historyItem.addEventListener('click', () => {
        latexInput.value = latex;
        renderLaTeX();
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

  window.renderLaTeX = async function () {
    let latex = latexInput.value.trim();
    if (!latex) {
      showError('Please enter a LaTeX command.');
      return;
    }

    try {
      let formattedLatex = latex;
      let isMathMode = false;

      // Check for $$...$$ (math mode)
      const mathModeMatch = latex.match(/^\$\$(.*)\$\$$/s);
      if (mathModeMatch) {
        isMathMode = true;
        formattedLatex = mathModeMatch[1].trim();
        // Preprocess \textbf to \mathbf in math mode
        formattedLatex = formattedLatex.replace(/\\textbf\{((?:[^{}]|\{[^{}]*\})*)\}/g, '\\mathbf{$1}');
      } else {
        // Text mode: wrap in \text{}
        formattedLatex = `\\text{${formattedLatex}}`;
      }

      const encodedLatex = encodeURIComponent(`\\dpi{300} \\color{black} ${formattedLatex}`);
      imageUrl = `https://latex.codecogs.com/svg?${encodedLatex}`;
      console.log('Generated URL:', imageUrl);

      // Reset image state
      latexImage.src = '';
      latexImage.style.display = 'none';
      imageActions.style.display = 'none';

      // Set new image source
      latexImage.src = imageUrl;

      // Use a Promise to handle image loading
      await new Promise((resolve, reject) => {
        latexImage.onload = () => {
          console.log('Image loaded successfully');
          latexImage.style.display = 'inline-block';
          imageActions.style.display = 'flex'; // Ensure buttons are shown
          hideError();
          if (!latexHistory.includes(latex)) {
            latexHistory.unshift(latex);
            if (latexHistory.length > 5) latexHistory.pop();
            sessionStorage.setItem('latexHistory', JSON.stringify(latexHistory));
            updateHistory();
          }
          resolve();
        };
        latexImage.onerror = () => {
          console.error('Failed to load LaTeX image from:', imageUrl);
          showError(`Error rendering LaTeX. Check syntax (e.g., use $$...$$ for equations, \\mathbf{} for bold in math mode, \\textbf{} for bold in text mode). See Help for details.`);
          latexImage.style.display = 'none';
          imageActions.style.display = 'none';
          reject(new Error('Image loading failed'));
        };
      });
    } catch (err) {
      console.error('Render error:', err);
      showError(`Invalid LaTeX command: ${err.message}. Try $$...$$ for equations or \\textbf{} for bold text.`);
      latexImage.style.display = 'none';
      imageActions.style.display = 'none';
    }
  };

  window.copyImage = async function () {
    if (!navigator.clipboard) {
      showError('Clipboard API not supported in this browser.');
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

      // Check for $$...$$ (math mode)
      const mathModeMatch = latex.match(/^\$\$(.*)\$\$$/s);
      if (mathModeMatch) {
        isMathMode = true;
        formattedLatex = mathModeMatch[1].trim();
        // Preprocess \textbf to \mathbf in math mode
        formattedLatex = formattedLatex.replace(/\\textbf\{((?:[^{}]|\{[^{}]*\})*)\}/g, '\\mathbf{$1}');
      } else {
        // Text mode: wrap in \text{}
        formattedLatex = `\\text{${formattedLatex}}`;
      }

      const encodedLatex = encodeURIComponent(`\\dpi{300} \\color{black} ${formattedLatex}`);
      const tempImageUrl = `https://latex.codecogs.com/svg?${encodedLatex}`;
      const response = await fetch(tempImageUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch SVG');
      }
      let svgText = await response.text();

      // Parse SVG
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
      const svgElement = svgDoc.querySelector('svg');
      if (!svgElement) {
        throw new Error('Invalid SVG content');
      }

      // Apply scaling only if enabled
      if (enableScaling) {
        const scaleSlider = document.getElementById('scale-slider');
        const scale = parseFloat(scaleSlider.value);
        let width = svgElement.getAttribute('width') || svgElement.getAttribute('viewBox')?.split(' ')[2] || 100;
        let height = svgElement.getAttribute('height') || svgElement.getAttribute('viewBox')?.split(' ')[3] || 100;
        width = parseFloat(width) * scale;
        height = parseFloat(height) * scale;
        svgElement.setAttribute('width', `${width}`);
        svgElement.setAttribute('height', `${height}`);
        const viewBox = svgElement.getAttribute('viewBox');
        if (viewBox) {
          const [minX, minY, vbWidth, vbHeight] = viewBox.split(' ').map(Number);
          svgElement.setAttribute('viewBox', `${minX} ${minY} ${vbWidth * scale} ${vbHeight * scale}`);
        }
      }

      // Serialize SVG
      const serializer = new XMLSerializer();
      svgText = serializer.serializeToString(svgDoc);

      // Copy to clipboard
      const blob = new Blob([svgText], { type: 'image/svg+xml' });
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/svg+xml': blob })
      ]);
      console.log('SVG copied to clipboard');
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

      // Parse SVG
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
      const svgElement = svgDoc.querySelector('svg');
      if (!svgElement) {
        throw new Error('Invalid SVG content');
      }

      // Apply scaling only if enabled
      if (enableScaling) {
        const scaleSlider = document.getElementById('scale-slider');
        const scale = parseFloat(scaleSlider.value);
        let width = svgElement.getAttribute('width') || svgElement.getAttribute('viewBox')?.split(' ')[2] || 100;
        let height = svgElement.getAttribute('height') || svgElement.getAttribute('viewBox')?.split(' ')[3] || 100;
        width = parseFloat(width) * scale;
        height = parseFloat(height) * scale;
        svgElement.setAttribute('width', `${width}`);
        svgElement.setAttribute('height', `${height}`);
        const viewBox = svgElement.getAttribute('viewBox');
        if (viewBox) {
          const [minX, minY, vbWidth, vbHeight] = viewBox.split(' ').map(Number);
          svgElement.setAttribute('viewBox', `${minX} ${minY} ${vbWidth * scale} ${vbHeight * scale}`);
        }
      }

      // Serialize SVG
      const serializer = new XMLSerializer();
      svgText = serializer.serializeToString(svgDoc);

      // Download
      const blob = new Blob([svgText], { type: 'image/svg+xml' });
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'latex-image.svg';
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
      const file = new File([blob], 'latex-image.svg', { type: 'image/svg+xml' });
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

  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    imageActions.style.display = 'none';
  }

  function hideError() {
    errorMessage.style.display = 'none';
  }

  window.toggleDarkMode = function () {
    document.body.dataset.theme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
  };

  // Add keypress event listener for Enter key
  latexInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      renderLaTeX();
    }
  });
});