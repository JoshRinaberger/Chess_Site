const express = require('express');
const router = express.Router();

const SavedGame = require('../models/savedGame');
const UserSettings = require('../models/userSettings');

router.get('/:gameId', async (req, res) => {
    let game = await getGameFromId(req.params.gameId);

    console.log(req.params.gameId);
    console.log(game);

    // retrieve saved user settings
    UserSettings.findOne({ email: req.user.email })
    .then(userSettings => {
        if (userSettings) {
            console.log("USER SETTINGS FOUND");
            let savedUserSettings = userSettings;

            console.log(savedUserSettings);

            res.render('gameReplay', { game: game, userSettings: savedUserSettings });
        }
    });
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