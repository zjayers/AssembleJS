#!/usr/bin/env node

/**
 * Script to build all testbed projects
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

// Directory containing all testbed projects
const testbedDir = path.resolve(__dirname, '..');

// Find all directories that start with assemblejs-
const projectDirs = fs.readdirSync(testbedDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory() && dirent.name.startsWith('assemblejs-'))
  .map(dirent => path.join(testbedDir, dirent.name));

console.log(`Found ${projectDirs.length} testbed projects to build`);

// Build projects in parallel
const results = {
  success: [],
  failure: []
};

// Function to build a single project
const buildProject = async (projectDir) => {
  const projectName = path.basename(projectDir);
  try {
    console.log(`🔄 Building ${projectName}...`);
    
    // Use promisified exec
    try {
      const command = `cd "${projectDir}" && npm run build`;
      const { stdout, stderr } = await execPromise(command, { 
        maxBuffer: 10 * 1024 * 1024 // 10MB buffer to handle larger outputs
      });
      
      console.log(`✅ Build successful for ${projectName}`);
      results.success.push({ name: projectName, dir: projectDir });
    } catch (execError) {
      console.error(`❌ Build failed for ${projectName}`);
      results.failure.push({ 
        name: projectName, 
        dir: projectDir, 
        output: execError.stdout || '' + execError.stderr || '',
        error: execError.message
      });
    }
  } catch (error) {
    console.error(`❌ Error building ${projectName}: ${error.message}`);
    results.failure.push({ name: projectName, dir: projectDir, error: error.message });
  }
};

// Create and run all build promises
try {
  console.log(`\nStarting parallel builds for ${projectDirs.length} projects...\n`);
  
  // Increase concurrency but not too much to avoid overwhelming the system
  // Process in batches of 5 projects at a time
  const concurrencyLimit = 5;
  const chunks = [];
  
  for (let i = 0; i < projectDirs.length; i += concurrencyLimit) {
    chunks.push(projectDirs.slice(i, i + concurrencyLimit));
  }
  
  // Process chunks in sequence, but projects within chunks in parallel
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    console.log(`\nProcessing batch ${i+1} of ${chunks.length} (${chunk.length} projects)...`);
    await Promise.all(chunk.map(buildProject));
  }
  
  // Print summary
  console.log("\n===============================================");
  console.log("               BUILD SUMMARY                  ");
  console.log("===============================================");
  console.log(`Total projects: ${projectDirs.length}`);
  console.log(`✅ Successful: ${results.success.length}`);
  
  if (results.success.length > 0) {
    console.log("\nSuccessfully built:");
    results.success.forEach(project => console.log(`  - ${project.name}`));
  }
  
  if (results.failure.length > 0) {
    console.log(`\n❌ Failed: ${results.failure.length}`);
    console.log("\nFailed builds:");
    results.failure.forEach(project => console.log(`  - ${project.name}`));
    
    // Exit with error if any build failed
    process.exit(1);
  } else {
    console.log(`\n✅ All builds complete!`);
  }
} catch (error) {
  console.error(`\n❌ Fatal error during build process: ${error.message}`);
  process.exit(1);
}