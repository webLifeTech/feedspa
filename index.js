const path = require('path');
const http = require('http');
const https = require('https');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const routes = require('./app/routes/routes');
const helper = require('./app/services/helper');
const app = module.exports = express();
const cors = require('cors');


process.env.URL = 'http://192.168.0.123:3000/'; // Local
// process.env.URL = 'http://128.199.153.135:3000/'; // Server

mongoose.connect('mongodb://localhost:27017/feedspa', (err, db) => {
    if (err) console.log(err);
    console.log('Connected...');
});

app.use(bodyParser.urlencoded({
    extended: true
}));


app.use(cors());
app.use(bodyParser.json({limit:'100mb'}));
app.use(cookieParser());
app.use(methodOverride());
app.use(flash());
app.use(express.static(__dirname + '/public'));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-with, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});


app.use('/', routes);


const server = http.createServer(app);
server.listen(process.env.PORT || 3000,(res)=> {
	console.log("Express server listening on port 3000");
});

// const io = require('socket.io')(server);
// const socketService = require('./app/services/socket');
// io.on('connection', (socket)=> {
//     socketService.setSocket(socket);
// });