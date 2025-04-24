// Feature flag for scaling functionality
const enableScaling = false; // Set to true to enable scaling, false to disable

// Check if Material Web Components are loaded
if (!customElements.get('md-filled-text-field')) {
  console.error('Material Web Components not loaded. Ensure the library is included.');
}

const latexInput = document.getElementById('latex-input');
const latexImage = document.getElementById('latex-image');
const latexPreview = document.getElementById('latex-preview');
const errorMessage = document.getElementById('error-message');
const imageActions = document.getElementById('image-actions');
const historyList = document.getElementById('history-list');
let imageUrl = '';
let latexHistory = JSON.parse(sessionStorage.getItem('latexHistory')) || [];

// Scaling functionality (only if enabled)
if (enableScaling) {
  const scaleSlider = document.getElementById('scale-slider');
  const scaleValue = document.getElementById('scale-value');

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

function clearHistory() {
  latexHistory = [];
  sessionStorage.removeItem('latexHistory');
  updateHistory();
}

function setExample(latex) {
  latexInput.value = latex;
  renderLaTeX();
}

async function renderLaTeX() {
  const latex = latexInput.value.trim();
  if (!latex) {
    showError('Please enter a LaTeX command.');
    return;
  }

  try {
    const encodedLatex = encodeURIComponent(`\\dpi{300} \\color{black} \\mathrm{${latex}}`);
    imageUrl = `https://latex.codecogs.com/svg?${encodedLatex}`;
    console.log('Generated URL:', imageUrl);

    latexImage.src = imageUrl;
    latexImage.style.display = 'inline-block';
    
    // Apply scaling only if enabled
    if (enableScaling) {
      const scaleSlider = document.getElementById('scale-slider');
      const sliderValue = parseFloat(scaleSlider.value);
      latexImage.style.transform = `scale(${sliderValue})`;
    }
    
    latexImage.onerror = () => {
      console.error('Failed to load LaTeX image from:', imageUrl);
      showError('Error rendering LaTeX. Please check your syntax or try again later.');
      latexImage.style.display = 'none';
      imageActions.style.display = 'none';
    };
    latexImage.onload = () => {
      hideError();
      imageActions.style.display = 'flex';
      if (!latexHistory.includes(latex)) {
        latexHistory.unshift(latex);
        if (latexHistory.length > 5) latexHistory.pop();
        sessionStorage.setItem('latexHistory', JSON.stringify(latexHistory));
        updateHistory();
      }
    };
  } catch (err) {
    showError('Invalid LaTeX command: ' + err.message);
  }
}

async function copyImage() {
  if (!navigator.clipboard) {
    showError('Clipboard API not supported in this browser.');
    return;
  }

  try {
    const latex = latexInput.value.trim();
    if (!latex) {
      showError('No LaTeX to render');
      return;
    }

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
}

async function downloadImage() {
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
}

async function shareImage() {
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
    showError('Failed to share image: ' + err.message);
  }
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.style.display = 'block';
  imageActions.style.display = 'none';
}

function hideError() {
  errorMessage.style.display = 'none';
}

function toggleDarkMode() {
  document.body.dataset.theme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
}

latexInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    renderLaTeX();
  }
});