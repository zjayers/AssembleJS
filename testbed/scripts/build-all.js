#!/usr/bin/env node

/**
 * Script to build all testbed projects
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directory containing all testbed projects
const testbedDir = path.resolve(__dirname, '..');

// Find all directories that start with assemblejs-
const projectDirs = fs.readdirSync(testbedDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory() && dirent.name.startsWith('assemblejs-'))
  .map(dirent => path.join(testbedDir, dirent.name));

console.log(`Found ${projectDirs.length} testbed projects to build`);

// Build each project
projectDirs.forEach(projectDir => {
  try {
    console.log(`\n\n===============================================`);
    console.log(`Building ${path.basename(projectDir)}`);
    console.log(`===============================================`);
    
    // Run npm build
    execSync(`cd "${projectDir}" && npm run build`, { 
      stdio: 'inherit'
    });
    
    console.log(`✅ Completed build for ${path.basename(projectDir)}`);
  } catch (error) {
    console.error(`❌ Error building ${path.basename(projectDir)}: ${error.message}`);
  }
});

console.log(`\n✅ All builds complete`);