// "Connect Four" game Server made by Tomer Biton

const http = require('http');
const url = require('url');
const fs = require('fs');           
const path = require('path');  

const PORT = process.env.PORT || 3000;

// Import game logic functions 
const { createGame, joinGame, getState, makeMove } = require('./game');

const server = http.createServer((req, res) => {

    // Parsed Url
    const parsedUrl = url.parse(req.url, true);
    const pathName = parsedUrl.pathname;
    const method = req.method;

    // Headers
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers','Content-Type');

    // Handling OPTIONS requests
    if(req.method == 'OPTIONS') {
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(200);
        res.end();
        return;
    }

    // Creates new game
    if(method == 'POST' && pathName == '/create') {
        res.setHeader('Content-Type', 'application/json');
        const code = Math.floor(100000 + Math.random() * 900000).toString(); // generates 6 numbers game code
        const game = createGame(code);
        res.writeHead(200);
        res.end(JSON.stringify({ success: true, game}));
        return;
    }

    // New player join the game
    if(method == 'POST' && pathName.startsWith('/join/')) {
        res.setHeader('Content-Type', 'application/json');
        const code = pathName.split('/')[2];
        const game = joinGame(code);
        if(!game) {
            res.writeHead(400);
            res.end(JSON.stringify({ success: false, message: "Can't join the game" }));
            return;
        }

        res.writeHead(200);
        res.end(JSON.stringify({ success: true, game }));
        return;
    }
    
    // Player makes a move
    if(method == 'POST' && pathName.startsWith('/move/')) {
        res.setHeader('Content-Type', 'application/json');
        const code = pathName.split('/')[2];
        let body = '';

        req.on('data', (chunk) => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                const { player, column } = JSON.parse(body);

                const game = makeMove(code, player, column);

                if(!game) {
                    res.writeHead(400);
                    res.end(JSON.stringify({ success: false, message: 'Invalid move' }));
                    return;
                }

                res.writeHead(200);
                res.end(JSON.stringify({ success: true, game}));
            }

            catch(err) {
                res.writeHead(400);
                res.end(JSON.stringify({ success: false, message: 'Bad request' }));
            }
        })

        return;
    }

    if(method == 'GET' && pathName.startsWith('/state/')) {
        res.setHeader('Content-Type', 'application/json');
        const code = pathName.split('/')[2];
        const game = getState(code);

        if(!game) {
            res.writeHead(404);
            res.end(JSON.stringify({ success: false, message: 'Game not found' }));
            return;
        }

        res.writeHead(200);
        res.end(JSON.stringify({ success: true, game }));
        return;
    }

    // Frontend connection
    if (method == 'GET') {

        let filePath;
        if (pathName == '/') {
            filePath = path.join(__dirname, '..', '..', 'client', 'src', 'index.html');
        } 
        
        else {
            filePath = path.join(__dirname, '..', '..', 'client', 'src', pathName);
        }

        const ext = path.extname(filePath).toLowerCase();
        
        let contentType = 'text/plain';
        if (ext == '.html') contentType = 'text/html';
        if (ext == '.css') contentType = 'text/css';
        if (ext == '.js') contentType = 'application/javascript';

        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('File not found');
                console.log("Serving file:", filePath); // Log to check file path
                return;
            }
            res.writeHead(200, { 'Content-Type': contentType });
            console.log("Serving file:", filePath); // Log to check file path
            res.end(data);
        });
        return;
    }

    // Page not found
    res.writeHead(404, { "Content-Type": "text/html" });
    res.end("Page Not Found 404");
});


// Listen to PORT 
server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`); 
});
