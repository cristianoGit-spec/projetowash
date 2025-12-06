const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8000;

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject'
};

const server = http.createServer((req, res) => {
    console.log(`${req.method} ${req.url}`);

    // Determinar o caminho do arquivo
    let filePath;
    if (req.url === '/') {
        filePath = path.join(__dirname, 'web', 'index.html');
    } else {
        // Remove query string (ex: ?v=11)
        const urlWithoutQuery = req.url.split('?')[0];
        filePath = path.join(__dirname, 'web', urlWithoutQuery);
    }
    
    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';
    
    console.log(`📂 Tentando carregar: ${filePath}`);

    console.log(`📂 Tentando carregar: ${filePath}`);

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if(error.code == 'ENOENT') {
                console.log(`❌ Arquivo não encontrado: ${filePath}`);
                res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(`
                    <!DOCTYPE html>
                    <html lang="pt-BR">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>404 - Não Encontrado</title>
                        <style>
                            body { font-family: Arial, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
                            .container { text-align: center; color: white; }
                            h1 { font-size: 4rem; margin: 0; }
                            p { font-size: 1.5rem; }
                            a { color: white; text-decoration: underline; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h1>404</h1>
                            <p>Arquivo não encontrado</p>
                            <a href="/">← Voltar para o início</a>
                        </div>
                    </body>
                    </html>
                `, 'utf-8');
            } else {
                console.log(`❌ Erro no servidor: ${error.code}`);
                res.writeHead(500);
                res.end('Erro no servidor: ' + error.code);
            }
        } else {
            console.log(`✅ Arquivo carregado: ${filePath}`);
            res.writeHead(200, { 
                'Content-Type': contentType,
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log('\n' + '='.repeat(60));
    console.log('🚀 SERVIDOR QUATRO CANTOS INICIADO COM SUCESSO!');
    console.log('='.repeat(60));
    console.log(`\n📡 Endereço: http://localhost:${PORT}`);
    console.log(`📁 Diretório: ${path.join(__dirname, 'web')}`);
    console.log(`\n✅ Sistema pronto! Abra o navegador e acesse:`);
    console.log(`   👉 http://localhost:${PORT}`);
    console.log('\n💡 Dicas:');
    console.log('   • Pressione Ctrl+C para parar o servidor');
    console.log('   • Use Ctrl+Shift+R no navegador para atualizar sem cache');
    console.log('\n' + '='.repeat(60) + '\n');
});
