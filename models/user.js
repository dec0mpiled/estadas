var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var User = new Schema({
    name: String,
    username: String,
    password: String,
    xhashed: String,
    email: String,
    bio: String,
    avatarURL: String,
    coverURL: String,
    themecolor: String,
    gender: String,
    age: String,
    admin: Boolean,
    verified: Boolean
});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('users', User);