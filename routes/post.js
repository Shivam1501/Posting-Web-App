var mongoose = require('mongoose');

const user = require('./users');

const postSchema = mongoose.Schema({
    imageurl: String,
    caption: String,
    likes: { type: Array, default: [] },
    postuser: { type: mongoose.Schema.Types.ObjectId, ref: 'user' }
})

module.exports = mongoose.model("post", postSchema)
