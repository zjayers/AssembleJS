// AssembleJS TypeDoc Theme Plugin
// This plugin applies the AssembleJS styling to the TypeDoc documentation

const fs = require("fs");
const path = require("path");

// Function to copy the CSS and JS files to the output directory
function copyAssets(outDir) {
  // Create assets directory if it doesn't exist
  const assetsDir = path.join(outDir, "assets");
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  // Copy theme CSS file
  const cssSource = path.join(__dirname, "theme.css");
  const cssDest = path.join(assetsDir, "assemblejs-theme.css");
  fs.copyFileSync(cssSource, cssDest);

  // Copy theme JS file
  const jsSource = path.join(__dirname, "theme-client.js");
  const jsDest = path.join(assetsDir, "assemblejs-theme.js");
  fs.copyFileSync(jsSource, jsDest);

  // Copy logo
  try {
    const logoSource = path.join(process.cwd(), "src", "assets", "favicon.ico");
    const logoDest = path.join(outDir, "favicon.ico");
    fs.copyFileSync(logoSource, logoDest);
  } catch (err) {
    console.warn("Could not copy logo:", err.message);
  }
}

// Function to inject our custom CSS and JS into all HTML files
function injectCustomAssets(outDir) {
  // Get all HTML files in the output directory (recursive)
  const htmlFiles = getAllFiles(outDir).filter((file) =>
    file.endsWith(".html")
  );

  for (const htmlFile of htmlFiles) {
    let html = fs.readFileSync(htmlFile, "utf8");

    // Add our CSS file to the head
    html = html.replace(
      "</head>",
      `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap">
      <link rel="stylesheet" href="./assets/assemblejs-theme.css">
      </head>`
    );

    // Add our JS file to the end of the body
    html = html.replace(
      "</body>",
      `<div class="abstract-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
        <div class="shape shape-4"></div>
        <div class="shape shape-5"></div>
        <div class="shape shape-6"></div>
        <div class="shape shape-7"></div>
        <div class="shape shape-8"></div>
      </div>
      <script src="./assets/assemblejs-theme.js"></script>
      </body>`
    );

    // Add AssembleJS logo link to the navigation header
    html = html.replace(
      '<header class="tsd-page-toolbar">',
      `<header class="tsd-page-toolbar">
      <div class="logo">
        <div class="logo-icon">
          <div class="orbit-container">
            <div class="logo-block block-1"></div>
            <div class="logo-block block-2"></div>
            <div class="logo-block block-3"></div>
            <div class="logo-block block-4"></div>
            <div class="logo-block block-5"></div>
            <div class="logo-block block-6"></div>
          </div>
        </div>
        <h1 class="assemblejs-title">AssembleJS</h1>
      </div>
      <button id="theme-toggle" class="theme-toggle" aria-label="Toggle theme">
        <svg id="dark-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
        <svg id="light-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: none;">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
      </button>
      `
    );

    // Add footer with copyright
    html = html.replace(
      "</footer>",
      `<div class="copyright">
        <p>Created with AssembleJS</p>
        <p>© 2023-2025 Zachariah Ayers</p>
       </div>
       </footer>`
    );

    // Write the modified HTML back to the file
    fs.writeFileSync(htmlFile, html);
  }
}

// Helper function to get all files in a directory recursively
function getAllFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      getAllFiles(fullPath, files);
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

// Export the load function that TypeDoc will call
module.exports = {
  load: function (app) {
    // Add hooks for when the renderer starts and finishes
    app.renderer.on("start", () => {
      console.log("Starting AssembleJS theme customization...");
    });

    app.renderer.on("end", () => {
      const outputDir = app.options.getValue("out");
      console.log(`Applying AssembleJS theme to: ${outputDir}`);

      // Copy assets and inject them into HTML files
      copyAssets(outputDir);
      injectCustomAssets(outputDir);

      console.log("AssembleJS theme customization completed!");
    });
  },
};
