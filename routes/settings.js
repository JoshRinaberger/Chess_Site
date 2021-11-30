const express = require('express');
const router = express.Router();

const bcrypt = require('bcryptjs');

const { ensureAuthenticated } = require('../config/auth');

const User = require('../models/User');
const UserSettings = require('../models/userSettings');
const SavedGame = require('../models/savedGame');
const { Model } = require('mongoose');

// ensureAuthenticated parameter will make sure you must be logged in to use the page
router.get('/', ensureAuthenticated,  (req, res) => {
    const errors = req.session.errors;

    if (req.session.errors) {
        delete req.session.errors;
    }

    console.log("GET");
    console.log(errors);

    let savedUserSettings;

    // retrieve saved user settings
    UserSettings.findOne({ email: req.user.email })
    .then(userSettings => {
        if (userSettings) {
            console.log("USER SETTINGS FOUND");
            let savedUserSettings = userSettings;

            console.log(savedUserSettings);

            res.render('settings', { errors, user: req.user, userSettings: savedUserSettings });
    
        }
    });


});

router.post('/', (req, res, next) => {
    const { boardColor1, boardColor2, chatBackgroundColor, chatTextColor } = req.body;
    
    let autoQueen = false;
    if (typeof req.body.autoQueen != "undefined") {
        autoQueen = true;
    }

    let lowTimeWarning = false;
    if (typeof req.body.lowTimeWarning != "undefined") {
        lowTimeWarning = true;
    }

    const newUserSettings = {
        autoQueen,
        lowTimeWarning,
        boardColor1,
        boardColor2,
        chatBackgroundColor,
        chatTextColor
    }

    let savedUserSettings = UserSettings.findOneAndUpdate(req.user.email, newUserSettings, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            console.log(result);
        }
    });


    res.redirect('/settings');
});

router.post('/changePassword', async (req, res) => {
    const { oldPassword, password, password2 } = req.body;
    let errors = [];

    User.findOne({ email: req.user.email }) 
    .then (async user => {
        // make sure entered old password matches
        const isMatch = await bcrypt.compare(oldPassword, user.password);

        if (isMatch == false) {
            errors.push({ msg: 'Old password is incorrect.' });
        }

        // Check password length
        if (password.length < 8) {
            errors.push({ msg: 'New password must be at least 8 characters.' });
        }

        // make sure password and password confirmation match
        if (password !== password2) {
            errors.push({ msg: 'New passwords do not match.' });
        }

        console.log(errors);

        if (errors.length > 0) {
            errors = [errors[0]];

            req.session.errors = errors;
            res.redirect('/settings');

        } else {
            changePassword(req.user.email, password);
            res.redirect('/settings');
        }
    });
});

function changePassword(email, password) {
   // Hash password
    bcrypt.genSalt(10, (err, salt) => 
    bcrypt.hash(password, salt, (err, hash) => {
        if (err) throw err;
        //set pasword to the hashed password
        const passwordChange = { password: hash };
        let user = User.findOneAndUpdate(email, passwordChange, (err, result) => {
            if (err) {
                console.log(err);
            } else {
                console.log(result);
            }
        });
    }));
}

router.post('/deleteAccount', (req, res) => {
    // Delete user
    User.deleteOne({ email: req.user.email })
    .then(() => {
        console.log("user " + req.user.email + " deleted");
    }) .catch((err) => {
        console.log(err);
    });

    // Delete user settings
    UserSettings.deleteOne({ email: req.user.email })
    .then(() => {
        console.log("user " + req.user.email + " settings deleted");
    }) .catch((err) => {
        console.log(err);
    });

    // update/delete games where the account was registered as the first user
    SavedGame.find({ username1: req.user.username })
    .then(savedGames => {
        console.log(savedGames);

        for(let i = 0; i < savedGames.length; i++) {
            if (savedGames[i].username2.includes("-")) {
                // delete game if there will no longer be a registered user tied to the game
                SavedGame.deleteOne({ id: savedGames[i].id })
                .then (() => {
                    console.log("Game deleted.");
                });
            } else {
                // update the saved game to no longer include this account's username
                let newUsername = { username1: "deleted-user" };
                SavedGame.findOneAndUpdate({ id: savedGames[i].id}, newUsername, (err, result) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(result);
                    }
                });
            }
        }
    });

    // update/delete games where the account was registered as the second user
    SavedGame.find({ username2: req.user.username })
    .then(savedGames => {
        console.log(savedGames);

        for(let i = 0; i < savedGames.length; i++) {
            if (savedGames[i].username1.includes("-")) {
                // delete game if there will no longer be a registered user tied to the game
                SavedGame.deleteOne({ id: savedGames[i].id })
                .then (() => {
                    console.log("Game deleted.");
                });
            } else {
                // update the saved game to no longer include this account's username
                let newUsername = { username2: "deleted-user" };
                SavedGame.findOneAndUpdate({ id: savedGames[i].id}, newUsername, (err, result) => {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log(result);
                    }
                });
            }
        }
    });

    res.redirect('/users/logout')
});

module.exports = router;