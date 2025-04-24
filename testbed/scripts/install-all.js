#!/usr/bin/env node

/**
 * Script to install dependencies in all testbed projects
 * Installs the asmbl package from local tarball in each project
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Create promisified version of exec
const execPromise = promisify(exec);

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Root directory of the project
const rootDir = path.resolve(__dirname, '..', '..');

// Directory containing all testbed projects
const testbedDir = path.resolve(__dirname, '..');

// Read package.json to get current version
const packageJsonPath = path.join(rootDir, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ Error: package.json not found in project root');
  process.exit(1);
}

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const currentVersion = packageJson.version;

// Construct tarball path based on current version
const tarballPath = path.join(rootDir, `asmbl-${currentVersion}.tgz`);

// Check if the tarball exists
if (!fs.existsSync(tarballPath)) {
  console.error(`❌ Error: asmbl-${currentVersion}.tgz not found at ${tarballPath}`);
  console.error('Please build the package first with: npm pack');
  process.exit(1);
}

console.log(`Found asmbl-${currentVersion}.tgz tarball`);

// Find all directories that start with assemblejs-
const projectDirs = fs.readdirSync(testbedDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory() && dirent.name.startsWith('assemblejs-'))
  .map(dirent => path.join(testbedDir, dirent.name));

console.log(`Found ${projectDirs.length} testbed projects to install`);

// Install dependencies for each project in parallel
const results = {
  success: [],
  failure: []
};

// Function to install deps for a single project
const installProject = async (projectDir) => {
  const projectName = path.basename(projectDir);
  try {
    console.log(`🔄 Installing dependencies for ${projectName}...`);
    
    // Use promisified exec
    try {
      const command = `cd "${projectDir}" && npm install --ignore-scripts "${tarballPath}"`;
      const { stdout, stderr } = await execPromise(command, { 
        maxBuffer: 10 * 1024 * 1024 // 10MB buffer to handle larger outputs
      });
      
      console.log(`✅ Completed installation for ${projectName}`);
      results.success.push({ name: projectName, dir: projectDir });
    } catch (execError) {
      console.error(`❌ Error installing dependencies for ${projectName}`);
      results.failure.push({ 
        name: projectName, 
        dir: projectDir, 
        output: execError.stdout || '' + execError.stderr || '',
        error: execError.message
      });
    }
  } catch (error) {
    console.error(`❌ Error installing dependencies for ${projectName}: ${error.message}`);
    results.failure.push({ name: projectName, dir: projectDir, error: error.message });
  }
};

// Create and run all install promises
try {
  console.log(`\nStarting parallel installation for ${projectDirs.length} projects...\n`);
  
  await Promise.all(projectDirs.map(installProject));
  
  // Print summary
  console.log("\n===============================================");
  console.log("            INSTALLATION SUMMARY               ");
  console.log("===============================================");
  console.log(`Total projects: ${projectDirs.length}`);
  console.log(`✅ Successful: ${results.success.length}`);
  
  if (results.success.length > 0) {
    console.log("\nSuccessfully installed:");
    results.success.forEach(project => console.log(`  - ${project.name}`));
  }
  
  if (results.failure.length > 0) {
    console.log(`\n❌ Failed: ${results.failure.length}`);
    console.log("\nFailed installations:");
    results.failure.forEach(project => console.log(`  - ${project.name}`));
    
    // Exit with error if any installation failed
    process.exit(1);
  } else {
    console.log(`\n✅ All installations complete!`);
  }
} catch (error) {
  console.error(`\n❌ Fatal error during installation process: ${error.message}`);
  process.exit(1);
}