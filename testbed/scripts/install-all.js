#!/usr/bin/env node

/**
 * Script to install dependencies in all testbed projects
 * Installs the asmbl@next package in each project
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

console.log(`Found ${projectDirs.length} testbed projects to install`);

// Install dependencies for each project
projectDirs.forEach(projectDir => {
  try {
    console.log(`\n\n===============================================`);
    console.log(`Installing dependencies for ${path.basename(projectDir)}`);
    console.log(`===============================================`);
    
    // Run npm install with ignore-scripts to avoid postinstall issues
    execSync(`cd "${projectDir}" && npm install --ignore-scripts asmbl@next`, { 
      stdio: 'inherit'
    });
    
    console.log(`✅ Completed installation for ${path.basename(projectDir)}`);
  } catch (error) {
    console.error(`❌ Error installing dependencies for ${path.basename(projectDir)}: ${error.message}`);
  }
});

console.log(`\n✅ All installations complete`);