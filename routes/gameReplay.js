const express = require('express');
const router = express.Router();

const SavedGame = require('../models/savedGame');

router.get('/:gameId', async (req, res) => {
    let game = await getGameFromId(req.params.gameId);

    console.log(req.params.gameId);
    console.log(game);

    res.render('gameReplay', { game: game });
});

async function getGameFromId (gameId) {
    let game;

    await SavedGame.findOne({ gameId: gameId })
    .then (result => {
        game = result;
        console.log(result);
    })
    .catch (err => {
        console.log(err);
    });

    console.log(game);

    return game;
}

module.exports = router;