#!/usr/bin/env node

/**
 * Script to remove all accessibility properties from React Native project
 * Run with: node remove_accessibility.js
 */

const fs = require('fs');
const path = require('path');

// Files and directories to process
const TARGET_DIRS = ['src', 'components'];
const FILE_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx'];

// Accessibility properties to remove
const ACCESSIBILITY_PROPS = [
  'accessible',
  'accessibilityLabel',
  'accessibilityHint',
  'accessibilityRole',
  'accessibilityState',
  'accessibilityValue',
  'accessibilityActions',
  'accessibilityLiveRegion',
  'importantForAccessibility',
  'accessibilityElementsHidden',
  'accessibilityViewIsModal',
  'onAccessibilityAction',
  'onAccessibilityTap',
  'onMagicTap',
  'onAccessibilityEscape',
  'accessibilityIgnoresInvertColors'
];

// Patterns to remove
const PATTERNS_TO_REMOVE = [
  // Import statements
  /import\s+{\s*AccessibilityInfo[^}]*}\s+from\s+['"]react-native['"];?\n?/g,
  /import\s+{\s*AccessibilityUtils[^}]*}\s+from[^;]+;?\n?/g,
  /import\s+.*AccessibilityUtils.*from[^;]+;?\n?/g,
  
  // Spread operator usage
  /\.\.\.\s*AccessibilityUtils\.[^,\}]+[,\s]*/g,
  
  // Function calls
  /AccessibilityUtils\.[^,\)\}]+[,\s]*/g,
  /AccessibilityInfo\.[^,\)\}]+[,\s]*/g,
  
  // Comments about accessibility
  /\/\*\*[\s\S]*?accessibility[\s\S]*?\*\//gi,
  /\/\/.*accessibility.*/gi,
];

function removeAccessibilityFromFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  console.log(`Processing: ${filePath}`);

  // Remove accessibility imports and function calls
  PATTERNS_TO_REMOVE.forEach(pattern => {
    const before = content;
    content = content.replace(pattern, '');
    if (before !== content) modified = true;
  });

  // Remove accessibility properties from JSX
  ACCESSIBILITY_PROPS.forEach(prop => {
    const patterns = [
      // Single line props
      new RegExp(`\\s+${prop}\\s*=\\s*{[^}]*}`, 'g'),
      new RegExp(`\\s+${prop}\\s*=\\s*"[^"]*"`, 'g'),
      new RegExp(`\\s+${prop}\\s*=\\s*'[^']*'`, 'g'),
      new RegExp(`\\s+${prop}\\s*=\\s*true`, 'g'),
      new RegExp(`\\s+${prop}\\s*=\\s*false`, 'g'),
      
      // Multi-line props
      new RegExp(`\\s+${prop}\\s*=\\s*{[\\s\\S]*?}`, 'g'),
      
      // Props in object destructuring
      new RegExp(`${prop}\\s*[,:]\\s*[^,}]+[,]?`, 'g'),
      new RegExp(`${prop}\\s*,?`, 'g'),
    ];

    patterns.forEach(pattern => {
      const before = content;
      content = content.replace(pattern, '');
      if (before !== content) modified = true;
    });
  });

  // Remove empty lines and fix formatting
  content = content
    .replace(/\n\s*\n\s*\n/g, '\n\n')  // Remove multiple empty lines
    .replace(/{\s*,/g, '{')             // Remove leading commas in objects
    .replace(/,\s*}/g, '}')             // Remove trailing commas before }
    .replace(/,\s*>/g, '>')             // Remove trailing commas before >
    .replace(/,\s*\)/g, ')')            // Remove trailing commas before )
    .replace(/\s+\>/g, '>')             // Clean up JSX closing tags
    .replace(/\(\s*\)/g, '()')          // Clean up empty function calls

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Modified: ${filePath}`);
  } else {
    console.log(`⚪ No changes: ${filePath}`);
  }

  return modified;
}

function removeAccessibilityFiles() {
  const filesToRemove = [
    'src/utils/accessibility.js',
    'src/utils/accessibility.ts',
    'src/constants/accessibility.js',
    'src/constants/accessibility.ts'
  ];

  filesToRemove.forEach(file => {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      console.log(`🗑️  Removed file: ${file}`);
    }
  });
}

function processDirectory(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`Directory not found: ${dir}`);
    return;
  }

  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (FILE_EXTENSIONS.some(ext => file.endsWith(ext))) {
      removeAccessibilityFromFile(fullPath);
    }
  });
}

function updatePackageJson() {
  const packagePath = 'package.json';
  if (fs.existsSync(packagePath)) {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    // Remove accessibility-related dependencies
    const depsToRemove = [
      'react-native-accessibility',
      '@react-native-accessibility/voice-over',
      'react-native-voice-over'
    ];
    
    let modified = false;
    ['dependencies', 'devDependencies'].forEach(depType => {
      if (packageJson[depType]) {
        depsToRemove.forEach(dep => {
          if (packageJson[depType][dep]) {
            delete packageJson[depType][dep];
            modified = true;
            console.log(`🗑️  Removed dependency: ${dep}`);
          }
        });
      }
    });
    
    if (modified) {
      fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
      console.log(`✅ Updated package.json`);
    }
  }
}

function main() {
  console.log('🚀 Starting accessibility removal process...\n');
  
  // Remove accessibility utility files
  removeAccessibilityFiles();
  
  // Process all source directories
  TARGET_DIRS.forEach(dir => {
    console.log(`\n📁 Processing directory: ${dir}`);
    processDirectory(dir);
  });
  
  // Update package.json
  updatePackageJson();
  
  console.log('\n✅ Accessibility removal completed!');
  console.log('\n📝 Manual steps required:');
  console.log('1. Remove any remaining accessibility imports in your files');
  console.log('2. Remove accessibility constants from constants files');
  console.log('3. Test your app to ensure it still works properly');
  console.log('4. Run: npm install or yarn install to update dependencies');
}

// Run the script
main();