const express = require('express');
const router = express.Router();

const { ensureAuthenticated } = require('../config/auth');

const SavedGame = require('../models/savedGame');

// ensureAuthenticated parameter will make sure you must be logged in to use the page
router.get('/', ensureAuthenticated, async (req, res) => {
    res.redirect(`/viewGames/${1}/${"latest"}`);
});

router.get('/:pageNumber/:dateSortType', ensureAuthenticated, async (req, res) => {
    var gameList = await getGameList(req.user.username, req.params.dateSortType);

    const numberOfPages = getNumberOfPages(gameList);

    gameList = filterGameList(gameList, req.params.pageNumber);

    res.render('viewGamesList', {
        username: req.user.username,
        pageNumber: req.params.pageNumber,
        gameList: gameList,
        numberOfPages: numberOfPages,
        dateSortType: req.params.dateSortType
    });
})

router.post('/changePage', (req, res) => {
    const pageNumber = req.body.newPageNumber;
    const dateSortType = req.body.dateSortType;
    res.redirect(`/viewGames/${pageNumber}/${dateSortType}`);
});

router.post('/newest', (req, res) => {
    res.redirect(`/viewGames/${1}/${"latest"}`);
});

router.post('/oldest', (req, res) => {
    res.redirect(`/viewGames/${1}/${"oldest"}`);
});

router.post('/selectGame', (req, res) => {
    console.log(req.body.gameId);
    res.redirect(`/gameReplay/${req.body.gameId}`);
});

async function getGameList(username, dateSortType) {

    var gameList = [];

    await SavedGame.find({ username1: username })
    .then (savedGames => {
        gameList = gameList.concat(savedGames);
    }) .catch (err => {
        console.log(err);
    });

    await SavedGame.find({ username2: username })
    .then (savedGames => {
        gameList = gameList.concat(savedGames);
    }) .catch (err => {
        console.log(err);
    });

    // sort the results by the most recent played or the least recent played games
    if (dateSortType == "latest"){
        gameList.sort((a, b) => (a.date < b.date) ? 1 : -1);
    } else {
        gameList.sort((a, b) => (a.date > b.date) ? 1 : -1);
    }
    
    return gameList;
}

// filter out 10 results corresponding to the given page number
function filterGameList(gameList, pageNumber) {
    const lowIndex = (pageNumber - 1) * 10;
    var highIndex = pageNumber * 10;

    if (highIndex > (gameList.length - 1)) {
        highIndex = lowIndex + (gameList.length % 10);
    }

    const filteredGameList = gameList.slice(lowIndex, highIndex);

    return filteredGameList;
}

function getNumberOfPages(gameList) {
    var numberOfPages = Math.floor(gameList.length / 10);

    if (gameList.length % 10 != 0) {
        numberOfPages++;
    }

    return numberOfPages;
}

module.exports = router;