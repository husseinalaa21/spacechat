const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
// SERVER RUN >
const port = process.env.PORT || 4200;
http.listen(port, function () {
    console.log(` *** SERVER START *** . port is ${port}`);
})


// MIND ->
const brain = require('./mind/brain')
brain.socket(io)


// BROWSER APIs ->
app.set('views', './browser/view')
app.set('view engine', 'ejs')
app.use(express.static('./browser/public'))
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
    res.render('home')
})

app.get('/web', (req, res) => {
    res.render('web')
})