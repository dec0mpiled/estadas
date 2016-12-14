var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Post = new Schema({
        name: String,
        username: String,
        verified: Boolean,
        admin: Boolean,
        avatarURL: String,
        themecolor: String,
        _author: Schema.Types.ObjectId,
        content: String,
        raw: String,
        doing: String,
        likes: Number,
        dislikes: Number,
        shares: Number,
        created: Date,
        time: String,
        group: [String],
        image: String,
        type: String,
});

module.exports = mongoose.model('posts', Post);