const BASE_PT_SIZE = 12; // Baseline point size where scale = 1

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded');

  if (!customElements.get('md-outlined-text-field') || !customElements.get('md-slider')) {
    console.error('Material Web Components not loaded. Ensure the library is included.');
    const errorMessage = document.getElementById('error-message');
    if (errorMessage) {
      errorMessage.textContent = 'Error: Material Web Components not loaded.';
      errorMessage.style.display = 'block';
    }
    return;
  }

  const latexInput = document.getElementById('latex-input');
  const latexImage = document.getElementById('latex-image');
  const latexPreview = document.getElementById('latex-preview');
  const errorMessage = document.getElementById('error-message');
  const imageActions = document.getElementById('image-actions');
  const historyList = document.getElementById('history-list');
  const scaleSlider = document.getElementById('scale-slider');
  const scaleValue = document.getElementById('scale-value');

  console.log('latexInput:', latexInput);
  console.log('latexImage:', latexImage);
  console.log('latexPreview:', latexPreview);
  console.log('errorMessage:', errorMessage);
  console.log('imageActions:', imageActions);
  console.log('historyList:', historyList);
  console.log('scaleSlider:', scaleSlider);
  console.log('scaleValue:', scaleValue);

  if (!latexInput || !latexImage || !latexPreview || !errorMessage || !imageActions || !historyList || !scaleSlider || !scaleValue) {
    console.error('One or more DOM elements not found.');
    if (errorMessage) {
      errorMessage.textContent = 'Error: Required DOM elements not found.';
      errorMessage.style.display = 'block';
    }
    return;
  }

  let imageUrl = '';
  let latexHistory = JSON.parse(sessionStorage.getItem('latexHistory')) || [];

  // Slider event listener for point size
  scaleSlider.addEventListener('input', () => {
    const ptSize = parseFloat(scaleSlider.value);
    scaleValue.textContent = `${ptSize} pt`;
    const scale = ptSize / BASE_PT_SIZE;
    console.log(`Selected ptSize: ${ptSize}, Scale: ${scale}`);
    latexImage.style.transform = `scale(${scale})`;
  });

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

      // Handle $...$ and $$...$$ for math mode
      const mathModeMatch = latex.match(/^\$+\$?(.*?)\$+\$?$/s);
      if (mathModeMatch) {
        isMathMode = true;
        formattedLatex = mathModeMatch[1].trim();
        formattedLatex = formattedLatex.replace(/\\textbf\{((?:[^{}]|\{[^{}]*\})*)\}/g, '\\mathbf{$1}');
      } else {
        formattedLatex = `\\text{${formattedLatex}}`;
      }

      console.log('Formatted LaTeX:', formattedLatex, 'Math Mode:', isMathMode);

      const encodedLatex = encodeURIComponent(`\\dpi{300} \\color{black} ${formattedLatex}`);
      imageUrl = `https://latex.codecogs.com/svg?${encodedLatex}`;
      console.log('Generated URL:', imageUrl);

      latexImage.src = '';
      latexImage.style.display = 'none';
      imageActions.style.display = 'none';

      latexImage.src = imageUrl;

      await new Promise((resolve, reject) => {
        latexImage.onload = () => {
          console.log('Image loaded successfully');
          latexImage.style.display = 'inline-block';
          imageActions.style.display = 'flex';
          const ptSize = parseFloat(scaleSlider.value);
          const scale = ptSize / BASE_PT_SIZE;
          latexImage.style.transform = `scale(${scale})`;
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
          showError(`Error rendering LaTeX. Check syntax (e.g., use $...$ or $$...$$ for equations, \\text{} for upright text). See Help for details.`);
          latexImage.style.display = 'none';
          imageActions.style.display = 'none';
          reject(new Error('Image loading failed'));
        };
      });
    } catch (err) {
      console.error('Render error:', err);
      showError(`Invalid LaTeX command: ${err.message}. Try $...$ or $$...$$ for equations or \\text{} for upright text.`);
      latexImage.style.display = 'none';
      imageActions.style.display = 'none';
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

      console.log('Copying LaTeX:', formattedLatex, 'Math Mode:', isMathMode);

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

      const ptSize = parseFloat(scaleSlider.value);
      const scale = ptSize / BASE_PT_SIZE;
      console.log(`Copying SVG with ptSize: ${ptSize}, Scale: ${scale}`);
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
      console.log('SVG copied to clipboard');

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

      const ptSize = parseFloat(scaleSlider.value);
      const scale = ptSize / BASE_PT_SIZE;
      console.log(`Downloading SVG with ptSize: ${ptSize}, Scale: ${scale}`);
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

  latexInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      renderLaTeX();
    }
  });
});