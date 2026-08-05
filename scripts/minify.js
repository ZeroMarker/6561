/**
 * Build script for 6561 game
 * Minifies HTML, CSS, and JS for production with source maps
 */

const fs = require('fs');
const path = require('path');
const Terser = require('terser');

const WWW_DIR = path.join(__dirname, '..', 'www');
const ROOT_DIR = path.join(__dirname, '..');

// Ensure www directory exists
fs.mkdirSync(WWW_DIR, { recursive: true });

function minifyHTML(html) {
    return html
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/\s+/g, ' ')
        .replace(/>\s+</g, '><')
        .trim();
}

function minifyCSS(css) {
    return css
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\s+/g, ' ')
        .replace(/\s*([{}:;,])\s*/g, '$1')
        .replace(/;\}/g, '}')
        .trim();
}

async function build() {
    console.log('Building 6561 game...\n');

    // Minify HTML
    const htmlContent = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf8');
    fs.writeFileSync(path.join(WWW_DIR, 'index.html'), minifyHTML(htmlContent));
    console.log('- Minified index.html');

    // Minify CSS
    const cssContent = fs.readFileSync(path.join(ROOT_DIR, 'styles.css'), 'utf8');
    fs.writeFileSync(path.join(WWW_DIR, 'styles.css'), minifyCSS(cssContent));
    console.log('- Minified styles.css');

    // Minify JS with Terser + source map
    const jsContent = fs.readFileSync(path.join(ROOT_DIR, 'game.js'), 'utf8');
    const jsResult = await Terser.minify(jsContent, {
        sourceMap: { url: 'game.js.map' },
        compress: { passes: 2 },
        output: { comments: false }
    });
    fs.writeFileSync(path.join(WWW_DIR, 'game.js'), jsResult.code);
    fs.writeFileSync(path.join(WWW_DIR, 'game.js.map'), jsResult.map);
    console.log('- Minified game.js + source map');

    // Minify service worker
    const swContent = fs.readFileSync(path.join(ROOT_DIR, 'sw.js'), 'utf8');
    const swResult = await Terser.minify(swContent, {
        sourceMap: { url: 'sw.js.map' },
        compress: { passes: 2 },
        output: { comments: false }
    });
    fs.writeFileSync(path.join(WWW_DIR, 'sw.js'), swResult.code);
    fs.writeFileSync(path.join(WWW_DIR, 'sw.js.map'), swResult.map);
    console.log('- Minified sw.js + source map');

    // Copy static assets
    fs.copyFileSync(path.join(ROOT_DIR, 'manifest.json'), path.join(WWW_DIR, 'manifest.json'));
    console.log('- Copied manifest.json');

    if (fs.existsSync(path.join(ROOT_DIR, 'icon-192.png'))) {
        fs.copyFileSync(path.join(ROOT_DIR, 'icon-192.png'), path.join(WWW_DIR, 'icon-192.png'));
        fs.copyFileSync(path.join(ROOT_DIR, 'icon-512.png'), path.join(WWW_DIR, 'icon-512.png'));
        console.log('- Copied icons');
    }

    if (fs.existsSync(path.join(ROOT_DIR, 'icon.svg'))) {
        fs.copyFileSync(path.join(ROOT_DIR, 'icon.svg'), path.join(WWW_DIR, 'icon.svg'));
        console.log('- Copied icon.svg');
    }

    // Size report
    const files = ['index.html', 'styles.css', 'game.js', 'sw.js'];
    const originalSize = files.reduce(
        (sum, f) => sum + fs.statSync(path.join(ROOT_DIR, f)).size,
        0
    );
    const minifiedSize = files.reduce((sum, f) => sum + fs.statSync(path.join(WWW_DIR, f)).size, 0);
    const savings = ((1 - minifiedSize / originalSize) * 100).toFixed(1);

    console.log('\nBuild Summary:');
    console.log('  Original: ' + (originalSize / 1024).toFixed(2) + ' KB');
    console.log('  Minified: ' + (minifiedSize / 1024).toFixed(2) + ' KB');
    console.log('  Savings: ' + savings + '%\n');
}

build().catch((err) => {
    console.error('Build failed:', err.message);
    process.exit(1);
});
