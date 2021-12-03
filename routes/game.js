const express = require('express');
const router = express.Router();

const {v4: uuidv4} = require('uuid');
const { ensureAuthenticated } = require('../config/auth');

const io = require('socket.io')(3001, {
    cors: {
        origin: ['http://localhost:3000'],
    },
});

const SavedGame = require('../models/savedGame');
const UserSettings = require('../models/userSettings');

router.get('/', (req, res) => {
    res.redirect(`/game/${uuidv4()}`);
});

router.get('/:id', (req, res) => {
    let authUsername = "";
    if (typeof req.user != "undefined") {
        authUsername = req.user.username;
        console.log("AUTH NAME");
        console.log(authUsername);
    }

    // retrieve user settings if user is logged in and render the game with them
    // otherwise render the game without them
    if (req.isAuthenticated()) {
        // retrieve saved user settings
        UserSettings.findOne({ email: req.user.email })
        .then(userSettings => {
            if (userSettings) {
                console.log("USER SETTINGS FOUND");
                let savedUserSettings = userSettings;

                console.log(savedUserSettings);

                res.render('game', { gameId: req.params.id, username: authUsername, userSettings: savedUserSettings });
            }
        });

    } else {
        // if the user is not logged in, then provide the default user settings
        const defaultUserSettings = {
            autoQueen: false,
            lowTimeWarning: true,
            boardColor1: "#859094",
            boardColor2: "#1D9ECD",
            chatBackgroundColor: "#232d3a",
            chatTextColor: "#ffffff" 
        }

        res.render('game', { gameId: req.params.id, username: authUsername, userSettings: defaultUserSettings });
    }
});


io.on('connection', socket => {
    console.log("Client Socket ID: " + socket.id);


    socket.on('join-game', (gameId, userId, username) => {
        console.log("Client " + socket.id + " atempting to join game " + gameId);

        var gameRoom;

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

                // save the username
                gameRoom = io.sockets.adapter.rooms.get(gameId);
                gameRoom.username2 = username;
            } else {
                socket.emit('join-game-failure');

                console.log("Client " + socket.id + "failed to join game " + gameId + ". Game is at maximum capacity.");
            } 
        } else {
            socket.join(gameId);

            console.log("Client " + socket.id + "succesfully to joined game " + gameId);

            // save the username
            gameRoom = io.sockets.adapter.rooms.get(gameId);
            gameRoom.username1 = username;
        }

        socket.on("start-game", (playerColor, startingTime) => {
            // notifies the non-host client that the game is starting
            // also updates the settings for their game to make sure that they match those of the host client
            socket.to(gameId).emit('start-game', playerColor, startingTime);
        
            // save player colors
            io.sockets.adapter.rooms.get(gameId).player1Color = (playerColor);

            if (playerColor == "white") {
                gameRoom.player2Color = "black";
            } else {
                gameRoom.player2Color = "white";
            }

            console.log(gameRoom);

            gameRoom.startIndexes = [];
            gameRoom.endIndexes = [];
            gameRoom.moveTypes = [];
            gameRoom.gameStarted = true;
        })

        socket.on('make-move', (startIndex, endIndex, moveType) => {
            console.log('Move Received. Start Index: ' + startIndex + "    End Index:" + endIndex + "      Move Type: " + moveType);

            socket.to(gameId).emit('receive-move', startIndex, endIndex, moveType);

            // save move
            gameRoom.startIndexes.push(startIndex);
            gameRoom.endIndexes.push(endIndex);
            gameRoom.moveTypes.push(moveType);

            console.log(gameRoom);
        });

        socket.on('player-color-changed', (playerColor) => {
            socket.to(gameId).emit('receive-player-color', playerColor);
        });

        socket.on('starting-time-changed', (time) => {
            socket.to(gameId).emit('receive-starting-time', time);
        });

        
        socket.on('end-game', (endCondition, winningColor) => {

            const game = {
                gameId: gameId,
                username1: gameRoom.username1,
                username2: gameRoom.username2,
                player1Color: gameRoom.player1Color,
                player2Color: gameRoom.player2Color,
                startIndexes: gameRoom.startIndexes,
                endIndexes: gameRoom.endIndexes,
                moveTypes: gameRoom.moveTypes,
                endCondition: endCondition,
                winningColor: winningColor
            }

            if (gameRoom.gameStarted) {
                saveGame(game);

                gameRoom.gameStarted = false;
            }

        });

        socket.on('chat-send', (chatMessage, username) => {
            socket.to(gameId).emit('chat-receive', chatMessage, username);
        });
    });
});

function saveGame(game) {
    console.log(game);

    // don't save the game if both users are guests
    if (game.username1.includes("-") && game.username2.includes("-")) {
        console.log("Game not saved. Both players are guests.");
        return;
    }

    SavedGame.findOne({ gameId: game.gameId })
    .then (savedGame => {
        // don't save the game if there is already an entry with the gameId
        if (savedGame) {
            console.log("Error: Game already exists in DB.");
        } else {
            // create a saved game to save to DB
            const newSavedGame = new SavedGame({
                gameId: game.gameId,
                username1: game.username1,
                username2: game.username2,
                player1Color: game.player1Color,
                player2Color: game.player2Color,
                startIndexes: game.startIndexes,
                endIndexes: game.endIndexes,
                moveTypes: game.moveTypes,
                endCondition: game.endCondition,
                winningColor: game.winningColor
            });

            // save game to the DB
            newSavedGame.save()
            .then(savedGame => {
                console.log("Game Saved");
            })
            .catch(err => console.log(err));
        }
    });

    
}


module.exports = router;