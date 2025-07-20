const BASE_PT_SIZE = 12; // Baseline point size where scale = 1

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded');

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

  console.log('latexInput:', latexInput);
  console.log('latexImage:', latexImage);
  console.log('latexPreview:', latexPreview);
  console.log('errorMessage:', errorMessage);
  console.log('imageActions:', imageActions);
  console.log('historyList:', historyList);
  console.log('scaleInput:', scaleInput);

  if (!latexInput || !latexImage || !latexPreview || !errorMessage || !imageActions || !historyList || !scaleInput) {
    console.error('One or more DOM elements not found.');
    if (errorMessage) {
      errorMessage.textContent = 'Error: Required DOM elements not found.';
      errorMessage.style.display = 'block';
    }
    return;
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
    console.log(`Selected ptSize: ${ptSize}, Scale: ${scale}`);
    
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
  const originalRenderLaTeX = window.renderLaTeX;
  window.renderLaTeX = async function() {
    showSpinner();
    try {
      let latex = latexInput.value.trim();
      if (!latex) {
        showError('Input Error', 'Please enter a LaTeX command.');
        return;
      }
      let formattedLatex = latex;
      let isMathMode = false;
      const mathModeMatch = latex.match(/^[\$]+\$?(.*?)\$+[\$]?$/s);
      if (mathModeMatch) {
        isMathMode = true;
        formattedLatex = mathModeMatch[1].trim();
        formattedLatex = formattedLatex.replace(/\\textbf\{((?:[^{}]|\{[^{}]*\})*)\}/g, '\\mathbf{$1}');
      } else {
        formattedLatex = `\\text{${formattedLatex}}`;
      }
      const encodedLatex = encodeURIComponent(`\\dpi{300} \\color{black} ${formattedLatex}`);
      imageUrl = `https://latex.codecogs.com/svg?${encodedLatex}`;
      latexImage.src = '';
      latexImage.style.display = 'none';
      imageActions.style.display = 'none';
      latexImage.src = imageUrl;
      await new Promise((resolve, reject) => {
        latexImage.onload = () => {
          latexImage.style.display = 'inline-block';
          imageActions.style.display = 'flex';
          const ptSize = parseFloat(scaleInput.value);
          const scale = ptSize / BASE_PT_SIZE;
          latexImage.style.transform = `scale(${scale})`;
          hideError();
          if (!latexHistory.includes(latex)) {
            latexHistory.unshift(latex);
            if (latexHistory.length > 10) latexHistory.pop();
            sessionStorage.setItem('latexHistory', JSON.stringify(latexHistory));
            updateHistory();
          }
          resolve();
        };
        latexImage.onerror = (e) => {
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

      const ptSize = parseFloat(scaleInput.value);
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

      const ptSize = parseFloat(scaleInput.value);
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

      const fileName = generateFileName(latexInput.value.trim());
      console.log('Generated filename:', fileName);

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
      console.log('Generated filename for sharing:', fileName);
      
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

  window.toggleDarkMode = function () {
    document.body.dataset.theme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
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
  const showCopySVGCodeButton = () => { copySVGCodeButton.style.display = 'inline-flex'; };
  const hideCopySVGCodeButton = () => { copySVGCodeButton.style.display = 'none'; };

  // Patch image load logic to show/hide Copy SVG Code button
  const origOnload = latexImage.onload;
  latexImage.onload = function() {
    showCopySVGCodeButton();
    if (origOnload) origOnload();
  };
  latexImage.onerror = function() {
    hideCopySVGCodeButton();
    if (origOnload) origOnload();
  };

  // Blur all [data-tooltip] elements after click to prevent tooltip reappearing
  document.querySelectorAll('[data-tooltip]').forEach(el => {
    el.addEventListener('click', function() {
      if (this.blur) this.blur();
    });
  });
});