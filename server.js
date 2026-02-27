const express = require('express');
const app = express();
const http = require('http').createServer(app);
const { Server } = require('socket.io');
const io = new Server(http);

const port = process.env.PORT || 4200;

http.listen(port, () => {
    console.log(` *** SERVER START *** . port is ${port}`);
}).on('error', (err) => {
    console.error('Server failed to start:', err);
});

// Load brain module safely
try {
    const brain = require('./mind/brain');
    brain.socket(io);
} catch (err) {
    console.error('Error loading brain module:', err);
}

// Redirect old domain
app.use((req, res, next) => {
    const host = req.get('Host');
    if (host === 'thespacechat.com') {
        return res.redirect(301, 'https://spacechat.app' + req.originalUrl);
    }
    next();
});
               

// Browser APIs
app.set('views', './browser/view');
app.set('view engine', 'ejs');
app.use(express.static('./browser/public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./browser/public'));       
app.use(express.static('./public_root'));   

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/web', (req, res) => {
    res.render('web');
});

app.get('/rouls', (req, res) => {
    res.render('rouls');
});
