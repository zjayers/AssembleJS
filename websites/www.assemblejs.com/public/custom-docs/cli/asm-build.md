# asm-build - AssembleJS Build Command

The `asm-build` command is designed to build your AssembleJS application for production deployment, optimizing assets and generating the most efficient output.

## Overview

`asm-build` compiles, bundles, and optimizes your AssembleJS application, preparing it for production deployment. It handles asset optimization, code minification, and creates a production-ready build with the highest performance characteristics.

## Usage

```bash
npm run build
```

Or directly:

```bash
npx asm-build [options]
```

## Command Options

| Option | Description |
|--------|-------------|
| `--outDir=<DIR>` | Specify the output directory (defaults to "dist") |
| `--minify` | Enable minification (enabled by default) |
| `--no-minify` | Disable minification |
| `--sourcemap` | Generate source maps |
| `--stats` | Generate bundle statistics |
| `--analyze` | Analyze the bundle size and composition |
| `--help`, `-h` | Display help information |

## Environment Variables

The build process can be customized using environment variables:

| Variable | Description |
|----------|-------------|
| `ASSEMBLEJS_ENVIRONMENT` | The build environment (development, production, test) |
| `ASSEMBLEJS_BUILD_OUTDIR` | The output directory for the build |
| `ASSEMBLEJS_BUILD_MINIFY` | Whether to minify the output (true/false) |
| `ASSEMBLEJS_BUILD_SOURCEMAP` | Whether to generate source maps (true/false) |

## Build Output

The build process generates the following output structure:

```
dist/
├── server/         # Server-side code
│   ├── index.js    # Server entry point
│   └── ...         # Other server files
├── client/         # Client-side assets
│   ├── js/         # JavaScript bundles
│   ├── css/        # CSS bundles
│   └── assets/     # Other assets (images, fonts, etc.)
├── package.json    # Production dependencies
└── ...             # Other configuration files
```

## Build Process

The `asm-build` command performs the following steps:

1. **Clean** - Removes previous build artifacts
2. **TypeScript Compilation** - Compiles TypeScript to JavaScript
3. **Asset Bundling** - Bundles JavaScript and CSS files
4. **Optimization** - Minifies and optimizes all assets
5. **Code Splitting** - Creates optimal chunks for better loading performance
6. **Cache Optimization** - Adds content hashes for long-term caching
7. **Generation of Server Entry** - Creates optimized server entry points

## Advanced Configuration

For advanced build configuration, you can create an `asm.config.js` file in your project root:

```javascript
// asm.config.js
module.exports = {
  build: {
    outDir: './build',
    minify: true,
    sourcemap: false,
    // Advanced options
    optimization: {
      splitChunks: true,
      treeShaking: true
    },
    assets: {
      inlineLimit: 10000, // inline assets < 10kb
      publicPath: '/static/'
    }
  }
};
```

## Performance Optimizations

The build process includes several performance optimizations:

- **Tree Shaking** - Removes unused code
- **Code Splitting** - Creates smaller, more focused bundles
- **Asset Optimization** - Compresses images and other assets
- **CSS Minification** - Removes whitespace and optimizes styles
- **JavaScript Minification** - Reduces code size for faster loading
- **Long-term Caching** - Content-hashed filenames for optimal caching

## Common Use Cases

### Basic Production Build

```bash
npm run build
```

### Development Build with Source Maps

```bash
ASSEMBLEJS_BUILD_SOURCEMAP=true npm run build
```

### Build with Bundle Analysis

```bash
npx asm-build --analyze
```

### Custom Output Directory

```bash
npx asm-build --outDir=./build
```

## Best Practices

- Run `npm run build` before deployment to ensure production-ready code
- Commit the `asm.config.js` file to version control for consistent builds
- Use environment variables for environment-specific configurations
- Review bundle analysis to identify optimization opportunities

## Related Commands

- [asmgen](./asmgen.md) - Generate project artifacts
- [asm-serve](./asm-serve.md) - Start the development server
- [asm-insights](./asm-insights.md) - Analyze and optimize your application