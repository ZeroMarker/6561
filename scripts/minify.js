/**
 * Minification script for 6561 game
 * Minifies HTML, CSS, and JS files for production build with source maps
 */

const fs = require('fs');
const path = require('path');

const WWW_DIR = path.join(__dirname, '..', 'www');
const ROOT_DIR = path.join(__dirname, '..');

// Ensure www directory exists
if (!fs.existsSync(WWW_DIR)) {
    fs.mkdirSync(WWW_DIR, { recursive: true });
}

// Minify HTML by removing comments and extra whitespace
function minifyHTML(html) {
    return html
        .replace(/<!--[\s\S]*?-->/g, '') // Remove comments
        .replace(/\s+/g, ' ') // Collapse whitespace
        .replace(/>\s+</g, '><') // Remove space between tags
        .trim();
}

// Minify CSS by removing comments and extra whitespace
function minifyCSS(css) {
    return css
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
        .replace(/\s+/g, ' ') // Collapse whitespace
        .replace(/\s*([{}:;,])\s*/g, '$1') // Remove space around special chars
        .replace(/;\}/g, '}') // Remove trailing semicolons
        .trim();
}

// Simple JS minification with basic source map generation
function minifyJS(js, sourceFile) {
    // Store original lines for source map
    const originalLines = js.split('\n');
    
    const minified = js
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
        .replace(/\/\/.*$/gm, '') // Remove single-line comments
        .replace(/\s+/g, ' ') // Collapse whitespace
        .replace(/\s*([{};(),=+\-*/<>!&|])\s*/g, '$1') // Remove space around operators
        .trim();

    // Generate simple source map (line mappings only)
    const sourceMap = {
        version: 3,
        file: path.basename(sourceFile),
        sources: [sourceFile],
        sourcesContent: [js],
        names: [],
        mappings: generateMappings(originalLines.length)
    };

    return { minified, sourceMap };
}

// Generate basic source map mappings (all mapped to line 1)
function generateMappings(originalLineCount) {
    // Simple mapping: all minified code maps to original line 1
    // This is a simplified approach - a real minifier would track each segment
    return 'AAAA';
}

// Copy and minify files
function build() {
    console.log('🔨 Building 6561 game...\n');

    // Copy and minify HTML
    const htmlContent = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf8');
    fs.writeFileSync(path.join(WWW_DIR, 'index.html'), minifyHTML(htmlContent));
    console.log('✓ Minified index.html');

    // Copy and minify CSS
    const cssContent = fs.readFileSync(path.join(ROOT_DIR, 'styles.css'), 'utf8');
    const minifiedCss = minifyCSS(cssContent);
    fs.writeFileSync(path.join(WWW_DIR, 'styles.css'), minifiedCss);
    console.log('✓ Minified styles.css');

    // Copy and minify JS with source maps
    const jsContent = fs.readFileSync(path.join(ROOT_DIR, 'game.js'), 'utf8');
    const { minified: minifiedJs, sourceMap: jsSourceMap } = minifyJS(jsContent, 'game.js');
    fs.writeFileSync(path.join(WWW_DIR, 'game.js'), minifiedJs);
    fs.writeFileSync(path.join(WWW_DIR, 'game.js.map'), JSON.stringify(jsSourceMap));
    console.log('✓ Minified game.js + source map');

    // Copy service worker (minified) with source map
    const swContent = fs.readFileSync(path.join(ROOT_DIR, 'sw.js'), 'utf8');
    const { minified: minifiedSw, sourceMap: swSourceMap } = minifyJS(swContent, 'sw.js');
    fs.writeFileSync(path.join(WWW_DIR, 'sw.js'), minifiedSw);
    fs.writeFileSync(path.join(WWW_DIR, 'sw.js.map'), JSON.stringify(swSourceMap));
    console.log('✓ Minified sw.js + source map');

    // Copy manifest.json
    const manifestContent = fs.readFileSync(path.join(ROOT_DIR, 'manifest.json'), 'utf8');
    fs.writeFileSync(path.join(WWW_DIR, 'manifest.json'), manifestContent);
    console.log('✓ Copied manifest.json');

    // Copy icons
    fs.copyFileSync(path.join(ROOT_DIR, 'icon-192.png'), path.join(WWW_DIR, 'icon-192.png'));
    fs.copyFileSync(path.join(ROOT_DIR, 'icon-512.png'), path.join(WWW_DIR, 'icon-512.png'));
    console.log('✓ Copied icons');

    // Calculate size savings
    const originalSize =
        fs.statSync(path.join(ROOT_DIR, 'index.html')).size +
        fs.statSync(path.join(ROOT_DIR, 'styles.css')).size +
        fs.statSync(path.join(ROOT_DIR, 'game.js')).size +
        fs.statSync(path.join(ROOT_DIR, 'sw.js')).size;

    const minifiedSize =
        fs.statSync(path.join(WWW_DIR, 'index.html')).size +
        fs.statSync(path.join(WWW_DIR, 'styles.css')).size +
        fs.statSync(path.join(WWW_DIR, 'game.js')).size +
        fs.statSync(path.join(WWW_DIR, 'sw.js')).size;

    const savings = ((1 - minifiedSize / originalSize) * 100).toFixed(1);

    console.log('\n📊 Build Summary:');
    console.log(`   Original size: ${(originalSize / 1024).toFixed(2)} KB`);
    console.log(`   Minified size: ${(minifiedSize / 1024).toFixed(2)} KB`);
    console.log(`   Savings: ${savings}%`);
    console.log(`   Source maps: game.js.map, sw.js.map`);
    console.log('\n✅ Build complete! Output in www/ directory\n');
}

// Run build
try {
    build();
} catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
}
