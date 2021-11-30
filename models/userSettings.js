const mongoose = require('mongoose');

const UserSettingsSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    autoQueen: {
        type: Boolean,
        required: true
    },
    lowTimeWarning: {
        type: Boolean,
        required: true
    },
    boardColor1: {
        type: String,
        required: true
    },
    boardColor2: {
        type: String,
        required: true
    },
    chatBackgroundColor: {
        type: String,
        required: true
    },
    chatTextColor: {
        type: String,
        required: true
    }
});

const UserSettings = mongoose.model('UserSettings', UserSettingsSchema);

module.exports = UserSettings;