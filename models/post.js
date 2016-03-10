var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var info = new Schema ({ name: String, username: String, verified: Boolean, admin: Boolean, avatarURL: String, themecolor: String })

var Post = new Schema({
        author: [info],
        _author: Schema.Types.ObjectId,
        content: String,
        raw: String,
        likes: Number,
        dislikes: Number,
        created: Date,
        group: [String],
        images: [String]
});

module.exports = mongoose.model('posts', Post);