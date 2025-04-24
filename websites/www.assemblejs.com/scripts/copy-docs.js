#!/usr/bin/env node

/**
 * This script copies documentation files from public/docs to public/custom-docs,
 * renaming them with appropriate prefixes based on their directory structure.
 * For example:
 * - public/docs/classes/Blueprint.md -> public/custom-docs/classes-Blueprint.md
 * - public/docs/interfaces/BlueprintInstance.md -> public/custom-docs/interfaces-BlueprintInstance.md
 */

const fs = require('fs');
const path = require('path');

// Paths
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const DOCS_SOURCE = path.join(PUBLIC_DIR, 'docs');
const CUSTOM_DOCS_TARGET = path.join(PUBLIC_DIR, 'custom-docs');

// Create custom-docs directory if it doesn't exist
if (!fs.existsSync(CUSTOM_DOCS_TARGET)) {
  console.log('Creating custom-docs directory...');
  fs.mkdirSync(CUSTOM_DOCS_TARGET, { recursive: true });
}

/**
 * Process a file or directory
 * @param {string} sourcePath - Path to source file or directory
 * @param {string} basePath - Base path for calculating relative paths
 */
function processItem(sourcePath, basePath) {
  const stats = fs.statSync(sourcePath);
  const relativePath = path.relative(basePath, sourcePath);
  
  if (stats.isDirectory()) {
    // Process all items in directory
    const entries = fs.readdirSync(sourcePath);
    
    for (const entry of entries) {
      processItem(path.join(sourcePath, entry), basePath);
    }
  } else if (stats.isFile() && sourcePath.endsWith('.md')) {
    // Get relative directory path (for prefixing)
    const dirPath = path.dirname(relativePath);
    const fileName = path.basename(relativePath);
    
    // Skip if this is the root index.md
    if (dirPath === '.' && fileName === 'index.md') {
      const targetPath = path.join(CUSTOM_DOCS_TARGET, fileName);
      fs.copyFileSync(sourcePath, targetPath);
      console.log(`Copied: ${fileName} (unchanged)`);
      return;
    }
    
    // Create new filename with prefix
    let newFileName;
    if (dirPath === '.') {
      // Root files remain unchanged
      newFileName = fileName;
    } else {
      // Create prefix from directory structure
      const prefix = dirPath.split(path.sep).join('-');
      newFileName = `${prefix}-${fileName}`;
    }
    
    // Copy with new name to custom-docs, updating any internal links in markdown files
    const targetPath = path.join(CUSTOM_DOCS_TARGET, newFileName);
    
    // Read file content
    let content = fs.readFileSync(sourcePath, 'utf8');
    
    // Replace relative links - e.g., [Assembly](Assembly.md) -> [Assembly](interfaces-Assembly.md)
    // and [Assembly](../interfaces/Assembly.md) -> [Assembly](interfaces-Assembly.md)
    
    // 1. Process links that reference directories
    content = content.replace(/\[(.*?)\]\((\.\.\/)?([a-z]+)\/([^)]+)\.md\)/g, (match, text, prefix, folder, file) => {
      return `[${text}](${folder}-${file}.md)`;
    });
    
    // 2. Process links that reference files in the same directory
    content = content.replace(/\[(.*?)\]\(([^/)]+)\.md\)/g, (match, text, file) => {
      // Get current directory name from relativePath
      const currentDir = path.dirname(relativePath);
      if (currentDir === '.') return match; // Skip if in root
      
      const prefix = currentDir.split(path.sep).join('-');
      return `[${text}](${prefix}-${file}.md)`;
    });
    
    // Write the updated content to the target file
    fs.writeFileSync(targetPath, content);
    console.log(`Copied: ${relativePath} -> ${newFileName} (links updated)`);
  }
}

console.log('Starting documentation copying process...');

// Start copying
try {
  processItem(DOCS_SOURCE, DOCS_SOURCE);
  console.log('Documentation copied successfully!');
} catch (error) {
  console.error('Error copying documentation:', error);
  process.exit(1);
}