// Changelog data and functionality

const changelogData = [
  {
    date: "Nov 2025",
    sections: {
      "New Features": [
        "Redesigned autocomplete shortcuts with modern Material Design 3 styling",
        "Horizontal layout for autocomplete items showing preview, code, badge, and description in a single row",
        "Enhanced autocomplete positioning - now appears strictly below the text box with proper spacing",
        "Improved autocomplete styling with rounded corners and refined borders"
      ],
      "UI Improvements": [
        "Modernized autocomplete dropdown with 16px rounded corners",
        "Cleaner badge design - removed category badges (GREEK, LOGIC, etc.), keeping only math mode indicators",
        "Refined border styling with subtle shadows for better visual hierarchy",
        "Custom scrollbar styling with rounded corners for autocomplete dropdown"
      ],
      "Bug Fixes": [
        "Fixed autocomplete overlapping text box - now positions correctly below input field",
        "Removed unnecessary console log messages for cleaner developer experience"
      ]
    }
  },
  {
    date: "Oct 24, 2025",
    sections: {
      "New Features": [
        "History now preserves and restores text size when clicking on saved equations",
        "Added text size display in history items (shows point size like '12pt', '24pt')",
        "Same LaTeX equation can now be saved multiple times with different text sizes",
        "Added comprehensive changelog page",
        "Improved page navigation with changelog link",
        "Enhanced SEO meta tags for better discoverability"
      ],
      "Privacy & Performance Improvements": [
        "Removed website content caching from service worker",
        "Eliminated usage statistics tracking",
        "Simplified persistent storage to only history feature",
        "Enhanced privacy by removing unnecessary data collection"
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
