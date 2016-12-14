var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var notes1 = new Schema({from:String, value:String, time: Date, type:String, red: String});
var likekeys = new Schema({ keys: String });
var dislikekeys = new Schema({ keys: String });

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
    boxtype: String,
    gender: String,
    age: String,
    admin: Boolean,
    verified: Boolean,
    notifications: [notes1],
    notes: Number,
    likes: [likekeys],
    dislikes: [dislikekeys],
});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('users', User);