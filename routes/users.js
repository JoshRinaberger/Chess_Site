const express = require('express');
const router = express.Router();

const bcrypt = require('bcryptjs');
const passport = require('passport');

const User = require('../models/User');
const UserSettings = require('../models/userSettings');

router.get('/login', (req, res) => {
    res.render('login');
})

router.get('/register', (req, res) => {
    res.render('register');
})

router.post('/register', (req, res) => {
    const { username, email, password, password2 } = req.body;
    let errors = [];

    // make sure all the fields are filled out
    if (!username || !email || !password || !password2) {
        errors.push({ msg: 'Please fill in all fields.' });
    }

    // make sure that the username contains no special characters
    const specialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;

    if (specialChars.test(username)) {
        errors.push({ msg: 'Username can not contain special characters.' });
    }

    // Check password length
    if (password.length < 8) {
        errors.push({ msg: 'Password must be at least 8 characters.' });
    }

    // make sure password and password confirmation match
    if (password !== password2) {
        errors.push({ msg: 'Passwords do not match.' });
    }

    if (errors.length > 0) {
        console.log('Register Error(s): ');
        console.log(errors);

        errors = [errors[0]];

        res.render('register', {
            errors,
            username,
            email,
            password,
            password2
        });
    } else {
        // Valid form entries case

        // checks and sends error if the given username is already attached to an account
        User.findOne({ username: username })
        .then(user => {
            if (user) {
                errors.push({ msg: 'Username is already taken.' });

                res.render('register', {
                    errors,
                    username,
                    email,
                    password,
                    password2
                });
            } else {
                // checks and sends error if the given email is already attached to an account
                User.findOne({ email: email })
                .then(user => {
                    if (user) {
                        errors.push({ msg: 'Email is already registered.' });
                        
                        res.render('register', {
                            errors,
                            username,
                            email,
                            password,
                            password2
                        });
                    } else {
                        // given user info passes all of the tests

                        // create user entry
                        const newUser = new User({
                            username,
                            email,
                            password
                        });

                        // Hash password
                        bcrypt.genSalt(10, (err, salt) => 
                            bcrypt.hash(newUser.password, salt, (err, hash) => {
                                if (err) throw err;
                                //set pasword to the hashed password
                                newUser.password = hash;
                                // save user to DB
                                newUser.save()
                                .then(user => {
                                    createDefaultUserSettings(email);

                                    res.redirect('/users/login');
                                })
                                .catch(err => console.log(err));
                        }));
                    }
                });
            }
        });
    }
});

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/settings',
        failureRedirect: '/users/login'
    })(req, res, next);
});

router.get('/logout', (req, res) => {
    // automatically gives the passport logout function through the middleware
    req.logout();

    res.redirect('login');
});

function createDefaultUserSettings(email) {
    // create user entry
    const newUserSettings = new UserSettings({
        email,
        autoQueen: false,
        lowTimeWarning: true,
        boardColor1: "#859094",
        boardColor2: "#1D9ECD",
        chatBackgroundColor: "#232d3a",
        chatTextColor: "#ffffff" 
    });

    newUserSettings.save()
    .then(userSettings => {
        console.log("User settings created for: " + email);
    })
    .catch(err => console.log(err));
}

module.exports = router;