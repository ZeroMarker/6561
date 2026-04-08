const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp4': 'video/mp4',
    '.woff': 'application/font-woff',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf',
    '.wasm': 'application/wasm'
};

const server = http.createServer((req, res) => {
    console.log(`请求: ${req.method} ${req.url}`);
    
    let filePath = req.url === '/' ? './index.html' : req.url;
    filePath = '.' + filePath.split('?')[0];
    
    const extname = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[extname] || 'application/octet-stream';
    
    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404);
                res.end('文件未找到');
            } else {
                res.writeHead(500);
                res.end(`服务器错误: ${err.code}`);
            }
        } else {
            res.writeHead(200, { 
                'Content-Type': contentType,
                'Access-Control-Allow-Origin': '*'
            });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n服务器已启动！`);
    console.log(`\n本地访问: http://localhost:${PORT}`);
    console.log(`\n手机访问（同一WiFi）: http://你的电脑IP:${PORT}`);
    console.log(`\n⚠️  注意:`);
    console.log(`   - 加速度传感器需要 HTTPS 或 localhost`);
    console.log(`   - 手机测试建议使用 ngrok 或其他内网穿透工具`);
    console.log(`   - 或直接在电脑浏览器使用 localhost 测试\n`);
});
