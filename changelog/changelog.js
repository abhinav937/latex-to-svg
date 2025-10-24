// Changelog data and functionality

const changelogData = [
  {
    date: "Oct 24, 2025",
    sections: {
      "Privacy & Performance Improvements": [
        "Removed website content caching from service worker",
        "Eliminated usage statistics tracking",
        "Simplified persistent storage to only history feature",
        "Enhanced privacy by removing unnecessary data collection"
      ],
      "New Features": [
        "Added comprehensive changelog page",
        "Improved page navigation with changelog link",
        "Enhanced SEO meta tags for better discoverability"
      ],
      "Bug Fixes": [
        "Fixed minor styling inconsistencies across pages",
        "Resolved navigation link alignment issues"
      ]
    }
  },
  {
    date: "Aug 26, 2025",
    sections: {
      "New Features": [
        "Added CNAME configuration for custom domain",
        "Enhanced site deployment and hosting setup"
      ]
    }
  },
  {
    date: "Aug 04, 2025",
    sections: {
      "New Features": [
        "Updated web app manifest for better PWA experience",
        "Added comprehensive site icons and branding"
      ],
      "Bug Fixes": [
        "Fixed multiple UI and functionality issues",
        "Improved overall stability and performance"
      ]
    }
  },
  {
    date: "Jul 15, 2025",
    sections: {
      "New Features": [
        "Launched LaTeX to SVG Generator web application",
        "Implemented real-time LaTeX to SVG conversion",
        "Added drag-and-drop LaTeX input interface",
        "Integrated Google Analytics for usage tracking"
      ],
      "Improvements": [
        "Optimized page load performance",
        "Enhanced user interface with Material Design components",
        "Added comprehensive LaTeX command support",
        "Implemented responsive design principles"
      ]
    }
  }
];

function createChangelogEntry(entry) {
  const entryDiv = document.createElement('div');
  entryDiv.className = 'changelog-entry';

  let entryHTML = `<div class="changelog-date">${entry.date}</div>`;

  for (const [sectionTitle, items] of Object.entries(entry.sections)) {
    entryHTML += `
      <div class="changelog-section">
        <div class="changelog-section-title">${sectionTitle}</div>
        <ul class="changelog-list">
          ${items.map(item => `<li>${item}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  entryDiv.innerHTML = entryHTML;
  return entryDiv;
}

function loadChangelog() {
  const container = document.getElementById('changelog-entries');

  if (!container) {
    console.error('Changelog container not found');
    return;
  }

  // Clear existing content
  container.innerHTML = '';

  // Add all changelog entries
  changelogData.forEach(entry => {
    const entryElement = createChangelogEntry(entry);
    container.appendChild(entryElement);
  });
}

// Initialize changelog when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  loadChangelog();
});
