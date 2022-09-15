var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/likes1DB');

const post = require('./post');

var passportLocalMongoose = require('passport-local-mongoose');

const userSchema = mongoose.Schema({
  name: String,
  email: String,
  username: String,
  password: String,
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'post' }],
  profilepic: [{type: String}],
  secret:{
    type:String
  },
  expiry:{
    type:Date
  }
})

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("user", userSchema)
