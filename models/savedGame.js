const mongoose = require('mongoose');

const savedGameSchema = new mongoose.Schema({
    gameId: {
        type: String,
        required: true
    },
    username1: {
        type: String,
        required: true
    },
    username2: {
        type: String,
        required: true
    },
    player1Color: {
        type: String,
        required: true
    },
    player2Color: {
        type: String,
        required: true
    },
    startIndexes: {
        type: [Number],
        required: true
    },
    endIndexes: {
        type: [Number],
        required: true
    },
    moveTypes: {
        type: [String],
        required: true
    },
    endCondition: {
        type: String,
        required: true
    },
    winningColor: {
        type: String,
        required: true
    }, 
    date: {
        type: Date,
        default: Date.now
    }
});

const SavedGame = mongoose.model('savedGame', savedGameSchema);

module.exports = SavedGame;