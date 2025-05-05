/**
 * Code Analyzer Service
 * Service for parsing and analyzing JavaScript and TypeScript code
 */

const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const t = require('@babel/types');
const fs = require('fs').promises;
const path = require('path');
const { createError } = require('../utils/errorUtils');
const tsParser = require('@typescript-eslint/parser');

/**
 * Code Analyzer Service
 * Provides functionality for parsing and analyzing code in the codebase
 */
class CodeAnalyzerService {
  constructor() {
    this.cache = new Map();
    this.cacheMaxSize = 100;
    this.cacheExpiryMs = 60 * 60 * 1000; // 1 hour
    
    console.log('Code Analyzer Service initialized');
  }

  /**
   * Parse a JavaScript or TypeScript file
   * @param {string} filePath - Path to the file
   * @param {boolean} useCache - Whether to use cached AST
   * @return {Object} AST representation of the file
   */
  async parseFile(filePath, useCache = true) {
    try {
      // Check cache if enabled
      if (useCache) {
        const cachedResult = this.getFromCache(filePath);
        if (cachedResult) {
          return cachedResult;
        }
      }

      // Read the file
      const code = await fs.readFile(filePath, 'utf8');
      
      // Determine file type
      const fileType = path.extname(filePath).toLowerCase();
      
      let ast;
      if (fileType === '.ts' || fileType === '.tsx') {
        // Parse TypeScript
        ast = this.parseTypeScript(code, fileType === '.tsx');
      } else {
        // Parse JavaScript
        ast = this.parseJavaScript(code, fileType === '.jsx');
      }
      
      // Cache the result
      if (useCache) {
        this.addToCache(filePath, ast);
      }
      
      return ast;
    } catch (error) {
      console.error(`Error parsing file ${filePath}:`, error);
      throw createError(`Failed to parse file ${filePath}: ${error.message}`, 'PARSER_ERROR');
    }
  }

  /**
   * Parse JavaScript code
   * @param {string} code - JavaScript code to parse
   * @param {boolean} jsx - Whether to enable JSX parsing
   * @return {Object} AST object
   */
  parseJavaScript(code, jsx = false) {
    return parser.parse(code, {
      sourceType: 'module',
      plugins: [
        'jsx',
        'typescript',
        'classProperties',
        'classPrivateProperties',
        'classPrivateMethods',
        'decorators-legacy',
        'dynamicImport',
        'objectRestSpread',
        'optionalChaining',
        'nullishCoalescingOperator',
      ],
      jsx
    });
  }

  /**
   * Parse TypeScript code
   * @param {string} code - TypeScript code to parse
   * @param {boolean} tsx - Whether to enable TSX parsing
   * @return {Object} AST object
   */
  parseTypeScript(code, tsx = false) {
    try {
      // Use @typescript-eslint/parser for TypeScript parsing
      const ast = tsParser.parse(code, {
        sourceType: 'module',
        ecmaFeatures: { jsx: tsx },
        tokens: true,
        comment: true,
        loc: true,
        range: true
      });
      
      return ast;
    } catch (error) {
      // Fallback to babel parser if typescript-eslint parser fails
      return parser.parse(code, {
        sourceType: 'module',
        plugins: [
          'typescript',
          ...(tsx ? ['jsx'] : []),
          'classProperties',
          'decorators-legacy',
          'dynamicImport',
        ],
      });
    }
  }

  /**
   * Find class definitions in a file
   * @param {string} filePath - Path to the file
   * @return {Promise<Array>} Array of class definitions
   */
  async findClasses(filePath) {
    const ast = await this.parseFile(filePath);
    const classes = [];
    
    traverse(ast, {
      ClassDeclaration(path) {
        const className = path.node.id ? path.node.id.name : 'AnonymousClass';
        const superClass = path.node.superClass ? 
          (path.node.superClass.name || 'UnknownSuperClass') : 
          null;
          
        const methods = [];
        const properties = [];
        
        // Collect methods and properties
        path.node.body.body.forEach(node => {
          if (t.isClassMethod(node)) {
            methods.push({
              name: node.key.name || 'anonymousMethod',
              kind: node.kind, // "constructor", "method", "get", "set"
              params: node.params.map(param => {
                if (t.isIdentifier(param)) {
                  return param.name;
                } else if (t.isAssignmentPattern(param) && t.isIdentifier(param.left)) {
                  return `${param.left.name} = ...`;
                }
                return 'complexParam';
              }),
              loc: node.loc
            });
          } else if (t.isClassProperty(node)) {
            properties.push({
              name: node.key.name || 'anonymousProperty',
              type: node.typeAnnotation ? 'typed' : 'untyped',
              loc: node.loc
            });
          }
        });
        
        classes.push({
          name: className,
          superClass,
          methods,
          properties,
          loc: path.node.loc
        });
      }
    });
    
    return classes;
  }

  /**
   * Find functions in a file
   * @param {string} filePath - Path to the file
   * @return {Promise<Array>} Array of function definitions
   */
  async findFunctions(filePath) {
    const ast = await this.parseFile(filePath);
    const functions = [];
    
    traverse(ast, {
      FunctionDeclaration(path) {
        const functionName = path.node.id ? path.node.id.name : 'AnonymousFunction';
        
        functions.push({
          name: functionName,
          params: path.node.params.map(param => {
            if (t.isIdentifier(param)) {
              return param.name;
            } else if (t.isAssignmentPattern(param) && t.isIdentifier(param.left)) {
              return `${param.left.name} = ...`;
            }
            return 'complexParam';
          }),
          loc: path.node.loc,
          type: 'declaration'
        });
      },
      
      VariableDeclarator(path) {
        if (t.isArrowFunctionExpression(path.node.init) || t.isFunctionExpression(path.node.init)) {
          const functionName = path.node.id ? path.node.id.name : 'AnonymousFunction';
          const func = path.node.init;
          
          functions.push({
            name: functionName,
            params: func.params.map(param => {
              if (t.isIdentifier(param)) {
                return param.name;
              } else if (t.isAssignmentPattern(param) && t.isIdentifier(param.left)) {
                return `${param.left.name} = ...`;
              }
              return 'complexParam';
            }),
            loc: path.node.loc,
            type: t.isArrowFunctionExpression(func) ? 'arrow' : 'expression'
          });
        }
      }
    });
    
    return functions;
  }

  /**
   * Find imports in a file
   * @param {string} filePath - Path to the file
   * @return {Promise<Array>} Array of import statements
   */
  async findImports(filePath) {
    const ast = await this.parseFile(filePath);
    const imports = [];
    
    traverse(ast, {
      ImportDeclaration(path) {
        const source = path.node.source.value;
        const importedItems = [];
        
        path.node.specifiers.forEach(specifier => {
          if (t.isImportDefaultSpecifier(specifier)) {
            importedItems.push({
              type: 'default',
              name: specifier.local.name
            });
          } else if (t.isImportSpecifier(specifier)) {
            importedItems.push({
              type: 'named',
              name: specifier.local.name,
              imported: specifier.imported ? specifier.imported.name : specifier.local.name
            });
          } else if (t.isImportNamespaceSpecifier(specifier)) {
            importedItems.push({
              type: 'namespace',
              name: specifier.local.name
            });
          }
        });
        
        imports.push({
          source,
          items: importedItems,
          loc: path.node.loc
        });
      }
    });
    
    return imports;
  }

  /**
   * Find exports in a file
   * @param {string} filePath - Path to the file
   * @return {Promise<Array>} Array of export statements
   */
  async findExports(filePath) {
    const ast = await this.parseFile(filePath);
    const exports = [];
    
    traverse(ast, {
      ExportNamedDeclaration(path) {
        const exportedItems = [];
        
        if (path.node.declaration) {
          // Exported declaration
          if (t.isVariableDeclaration(path.node.declaration)) {
            path.node.declaration.declarations.forEach(declaration => {
              if (t.isIdentifier(declaration.id)) {
                exportedItems.push({
                  type: 'variable',
                  name: declaration.id.name
                });
              }
            });
          } else if (t.isFunctionDeclaration(path.node.declaration) && path.node.declaration.id) {
            exportedItems.push({
              type: 'function',
              name: path.node.declaration.id.name
            });
          } else if (t.isClassDeclaration(path.node.declaration) && path.node.declaration.id) {
            exportedItems.push({
              type: 'class',
              name: path.node.declaration.id.name
            });
          }
        } else if (path.node.specifiers) {
          // Export specifiers
          path.node.specifiers.forEach(specifier => {
            exportedItems.push({
              type: 'named',
              name: specifier.exported.name,
              local: specifier.local.name
            });
          });
        }
        
        exports.push({
          items: exportedItems,
          source: path.node.source ? path.node.source.value : null,
          loc: path.node.loc
        });
      },
      
      ExportDefaultDeclaration(path) {
        let name = 'AnonymousDefault';
        let type = 'expression';
        
        if (t.isFunctionDeclaration(path.node.declaration)) {
          type = 'function';
          name = path.node.declaration.id ? path.node.declaration.id.name : 'AnonymousFunction';
        } else if (t.isClassDeclaration(path.node.declaration)) {
          type = 'class';
          name = path.node.declaration.id ? path.node.declaration.id.name : 'AnonymousClass';
        } else if (t.isIdentifier(path.node.declaration)) {
          type = 'identifier';
          name = path.node.declaration.name;
        }
        
        exports.push({
          type: 'default',
          name,
          exportType: type,
          loc: path.node.loc
        });
      },
      
      ExportAllDeclaration(path) {
        if (path.node.source) {
          exports.push({
            type: 'all',
            source: path.node.source.value,
            loc: path.node.loc
          });
        }
      }
    });
    
    return exports;
  }

  /**
   * Find interfaces and types in a TypeScript file
   * @param {string} filePath - Path to the file
   * @return {Promise<Array>} Array of interface and type definitions
   */
  async findInterfacesAndTypes(filePath) {
    if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) {
      return { interfaces: [], types: [] };
    }
    
    const ast = await this.parseFile(filePath);
    const interfaces = [];
    const types = [];
    
    traverse(ast, {
      TSInterfaceDeclaration(path) {
        const interfaceName = path.node.id ? path.node.id.name : 'AnonymousInterface';
        const properties = [];
        
        if (path.node.body && path.node.body.body) {
          path.node.body.body.forEach(member => {
            if (t.isTSPropertySignature(member) && member.key) {
              properties.push({
                name: t.isIdentifier(member.key) ? member.key.name : 'anonymousProperty',
                optional: !!member.optional,
                loc: member.loc
              });
            }
          });
        }
        
        interfaces.push({
          name: interfaceName,
          properties,
          loc: path.node.loc
        });
      },
      
      TSTypeAliasDeclaration(path) {
        const typeName = path.node.id ? path.node.id.name : 'AnonymousType';
        
        types.push({
          name: typeName,
          loc: path.node.loc
        });
      }
    });
    
    return { interfaces, types };
  }

  /**
   * Analyze dependencies in a file
   * @param {string} filePath - Path to the file
   * @return {Promise<Object>} Dependency analysis
   */
  async analyzeDependencies(filePath) {
    const imports = await this.findImports(filePath);
    
    // Categorize dependencies
    const dependencies = {
      internal: [],
      external: [],
      relative: []
    };
    
    imports.forEach(importItem => {
      const source = importItem.source;
      
      if (source.startsWith('.')) {
        dependencies.relative.push({
          source,
          items: importItem.items
        });
      } else if (source.includes('/')) {
        // This is an approximation - more accurate categorization might need project context
        dependencies.internal.push({
          source,
          items: importItem.items
        });
      } else {
        dependencies.external.push({
          source,
          items: importItem.items
        });
      }
    });
    
    return dependencies;
  }

  /**
   * Generate a dependency graph for a file
   * @param {string} rootFilePath - Path to the root file
   * @param {number} depth - Maximum depth to traverse
   * @param {Set<string>} visited - Set of already visited files
   * @return {Promise<Object>} Dependency graph
   */
  async generateDependencyGraph(rootFilePath, depth = 3, visited = new Set()) {
    if (depth <= 0 || visited.has(rootFilePath)) {
      return null;
    }
    
    visited.add(rootFilePath);
    
    try {
      const imports = await this.findImports(rootFilePath);
      const graph = {
        file: rootFilePath,
        imports: []
      };
      
      // Process each import
      for (const importItem of imports) {
        const source = importItem.source;
        
        // Handle relative paths
        if (source.startsWith('.')) {
          const dir = path.dirname(rootFilePath);
          let resolvedPath;
          
          // Try to resolve the path with different extensions
          const extensions = ['.js', '.jsx', '.ts', '.tsx'];
          for (const ext of extensions) {
            const candidatePath = path.resolve(dir, `${source}${ext}`);
            try {
              await fs.access(candidatePath);
              resolvedPath = candidatePath;
              break;
            } catch (e) {
              // File doesn't exist with this extension, try next
            }
            
            // Also try with /index
            const indexPath = path.resolve(dir, `${source}/index${ext}`);
            try {
              await fs.access(indexPath);
              resolvedPath = indexPath;
              break;
            } catch (e) {
              // File doesn't exist with this extension, try next
            }
          }
          
          if (resolvedPath) {
            const childGraph = await this.generateDependencyGraph(
              resolvedPath, 
              depth - 1,
              visited
            );
            
            if (childGraph) {
              graph.imports.push({
                source,
                items: importItem.items,
                resolvedPath,
                graph: childGraph
              });
            } else {
              graph.imports.push({
                source,
                items: importItem.items,
                resolvedPath,
                graph: null // Already visited or max depth reached
              });
            }
          } else {
            graph.imports.push({
              source,
              items: importItem.items,
              resolvedPath: null,
              graph: null
            });
          }
        } else {
          // External or internal non-relative import
          graph.imports.push({
            source,
            items: importItem.items,
            resolvedPath: null,
            graph: null
          });
        }
      }
      
      return graph;
    } catch (error) {
      console.error(`Error generating dependency graph for ${rootFilePath}:`, error);
      return {
        file: rootFilePath,
        imports: [],
        error: error.message
      };
    }
  }

  /**
   * Search for patterns in a file
   * @param {string} filePath - Path to the file
   * @param {Object} patterns - Patterns to search for
   * @return {Promise<Array>} Array of matches
   */
  async searchPatterns(filePath, patterns) {
    const ast = await this.parseFile(filePath);
    const matches = [];
    
    // Define visitor based on patterns
    const visitor = {};
    
    if (patterns.functionCalls && patterns.functionCalls.length > 0) {
      visitor.CallExpression = path => {
        if (t.isIdentifier(path.node.callee)) {
          const functionName = path.node.callee.name;
          
          if (patterns.functionCalls.includes(functionName)) {
            matches.push({
              type: 'functionCall',
              name: functionName,
              arguments: path.node.arguments.length,
              loc: path.node.loc
            });
          }
        } else if (
          t.isMemberExpression(path.node.callee) && 
          t.isIdentifier(path.node.callee.property)
        ) {
          const methodName = path.node.callee.property.name;
          
          if (patterns.functionCalls.includes(methodName)) {
            matches.push({
              type: 'methodCall',
              name: methodName,
              arguments: path.node.arguments.length,
              loc: path.node.loc
            });
          }
        }
      };
    }
    
    if (patterns.identifiers && patterns.identifiers.length > 0) {
      visitor.Identifier = path => {
        const name = path.node.name;
        
        if (patterns.identifiers.includes(name)) {
          // Skip if part of imports or declarations
          if (
            path.parent && 
            (t.isImportSpecifier(path.parent) || 
             t.isImportDefaultSpecifier(path.parent) ||
             (t.isVariableDeclarator(path.parent) && path.parent.id === path.node))
          ) {
            return;
          }
          
          matches.push({
            type: 'identifier',
            name,
            loc: path.node.loc
          });
        }
      };
    }
    
    traverse(ast, visitor);
    
    return matches;
  }

  /**
   * Get file metrics
   * @param {string} filePath - Path to the file
   * @return {Promise<Object>} File metrics
   */
  async getFileMetrics(filePath) {
    const ast = await this.parseFile(filePath);
    const code = await fs.readFile(filePath, 'utf8');
    
    const lines = code.split('\n').length;
    
    const metrics = {
      lines,
      classes: 0,
      functions: 0,
      imports: 0,
      exports: 0,
      complexity: 0
    };
    
    // Function to count nodes of a specific type
    const countNodes = (nodeType) => {
      let count = 0;
      traverse(ast, {
        [nodeType](path) {
          count++;
        }
      });
      return count;
    };
    
    metrics.classes = countNodes('ClassDeclaration');
    metrics.functions = countNodes('FunctionDeclaration') + countNodes('ArrowFunctionExpression');
    metrics.imports = countNodes('ImportDeclaration');
    metrics.exports = countNodes('ExportNamedDeclaration') + countNodes('ExportDefaultDeclaration');
    
    // Calculate cyclomatic complexity (simplified)
    let complexityCount = 0;
    traverse(ast, {
      IfStatement() { complexityCount++; },
      WhileStatement() { complexityCount++; },
      DoWhileStatement() { complexityCount++; },
      ForStatement() { complexityCount++; },
      ForInStatement() { complexityCount++; },
      ForOfStatement() { complexityCount++; },
      ConditionalExpression() { complexityCount++; },
      SwitchCase() { complexityCount++; },
      LogicalExpression(path) {
        if (path.node.operator === '&&' || path.node.operator === '||') {
          complexityCount++;
        }
      }
    });
    
    metrics.complexity = complexityCount;
    
    return metrics;
  }

  /**
   * Generate a cache key for a query
   * @param {string} filePath - The file path
   * @return {string} The cache key
   */
  generateCacheKey(filePath) {
    return filePath;
  }

  /**
   * Get a value from the cache
   * @param {string} filePath - The file path
   * @return {Object|null} The cached AST or null
   */
  getFromCache(filePath) {
    const key = this.generateCacheKey(filePath);
    const cachedItem = this.cache.get(key);

    if (!cachedItem) {
      return null;
    }

    // Check if expired
    if (Date.now() - cachedItem.timestamp > this.cacheExpiryMs) {
      this.cache.delete(key);
      return null;
    }

    return cachedItem.value;
  }

  /**
   * Add a value to the cache
   * @param {string} filePath - The file path
   * @param {Object} ast - The AST to cache
   */
  addToCache(filePath, ast) {
    const key = this.generateCacheKey(filePath);
    
    // If cache is full, remove oldest item
    if (this.cache.size >= this.cacheMaxSize) {
      const oldestKey = Array.from(this.cache.keys())[0];
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      value: ast,
      timestamp: Date.now(),
    });
  }
}

module.exports = new CodeAnalyzerService();