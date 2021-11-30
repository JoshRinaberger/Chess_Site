const express = require('express');
//const expressLayouts = require('express-ejs-layouts');

const app = express();
const server = require('http').Server(app);

//app.use(expressLayouts);
app.set('view engine', 'ejs');

// body parser
app.use(express.urlencoded({ extended: true }));

// Express session
const session = require('express-session');
app.use(
    session({
      secret: 'secret',
      resave: true,
      saveUninitialized: true
    })
  );

//passport config
const passport = require('passport');
require('./config/passport')(passport);

// passport middleware
app.use(passport.initialize());
app.use(passport.session());

const { ensureAuthenticated } = require('./config/auth');


const mongoose = require('mongoose');
const db = require('./config/keys').MongoURI;
const { application } = require('express');

// connect to mongoDB through atlas
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log(err));


//routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));
app.use('/game', require('./routes/game'));
app.use('/settings', require('./routes/settings'));
app.use('/viewGames', require('./routes/viewGames'));
app.use('/gameReplay', require('./routes/gameReplay'));

app.listen(3000, () => {
    console.log("Server listening on port 3000");
});

// serve css as static
app.use(express.static(__dirname + "/public"));


app.get('/', (req, res) => {
    res.render('index');
});

app.get('/tic', (req, res) => {
    res.sendFile(__dirname + "/public/tic.html");
});


/*
const {v4: uuidv4} = require('uuid');

app.get('/game', (req, res) => {
    //res.sendFile(__dirname + "/public/game.html");
    res.redirect(`/game-${uuidv4()}`);
});

app.get('/game-:id', (req, res) => {
    let authUsername = "";
    if (typeof req.user != "undefined") {
        authUsername = req.user.username;
        console.log("AUTH NAME");
        console.log(authUsername);
    }

    res.render('game', { gameId: req.params.id, username: authUsername });
});
*/


/*
io.on('connection', socket => {
    console.log("Client Socket ID: " + socket.id);


    socket.on('join-game', (gameId, userId, username) => {
        console.log("Client " + socket.id + " atempting to join game " + gameId);

        // only allow 2 players into the game, as their only two colors of pieces to control
        // otherwise send the clienting attempting to join an error
        if (io.sockets.adapter.rooms.get(gameId) != null) {
            if (io.sockets.adapter.rooms.get(gameId).size < 2) {
                socket.join(gameId);

                console.log("Client " + socket.id + " succesfully to joined game " + gameId);

                // notify the client who's hosting the game that an oppenent has joined, so it knows that it can start the game
                socket.to(gameId).emit('opponent-joined', username);
                
                // notify that the connection was successful
                socket.emit('join-game-successful');
            } else {
                socket.emit('join-game-failure');

                console.log("Client " + socket.id + "failed to join game " + gameId + ". Game is at maximum capacity.");
            } 
        } else {
            socket.join(gameId);

            console.log("Client " + socket.id + "succesfully to joined game " + gameId);
        }

        socket.on("start-game", (playerColor, startingTime) => {
            // notifies the non-host client that the game is starting
            // also updates the settings for their game to make sure that they match those of the host client
            socket.to(gameId).emit('start-game', playerColor, startingTime);
        })

        // saves all of the moves to be saved into the database when the game concludes
        let startIndexes = [];
        let endIndexes = [];
        let moveTypes = [];

        socket.on('make-move', (startIndex, endIndex, moveType) => {
            console.log('Move Received. Start Index: ' + startIndex + "    End Index:" + endIndex + "      Move Type: " + moveType);
            socket.to(gameId).emit('receive-move', startIndex, endIndex, moveType);
        });

        socket.on('player-color-changed', (playerColor) => {
            socket.to(gameId).emit('receive-player-color', playerColor);
        });

        socket.on('starting-time-changed', (time) => {
            socket.to(gameId).emit('receive-starting-time', time);
        });

        socket.on('chat-send', (chatMessage, username) => {
            socket.to(gameId).emit('chat-receive', chatMessage, username);
        }) 

        socket.on('end-game'), (winner) => {

        }
    });
});
*/