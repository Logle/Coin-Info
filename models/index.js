// Data model:

var mongoose = require('mongoose');
// production database in MongoLab
mongoose.connect('mongodb://heroku_app32792295:q06dlscp9gehtvg22c16tbt3in@ds049150.mongolab.com:49150/heroku_app32792295');
// local database
// mongoose.connect('mongodb://localhost/coin_data')
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

var Post, User;
var Schema = mongoose.Schema;

var postSchema = new Schema({
	image: String,
	title: String,
	url: String,
	titleEncoded: String,
	lead_text: String,
	author: String,
	created: {type: Date, default: Date.now},
	source: Number,
	content: String,
	likeFB: Number,
	likeTw: Number
});

var userSchema = new Schema({
  savedposts: [{type: Schema.Types.ObjectId, ref: 'Post'}],
  name:  {
      first: String,
      last: String
    },
  local            : {
      email        : String,
      password     : String
  },
  facebook         : {
      id           : String,
      token        : String,
      email        : String,
      name         : String
  },
  twitter          : {
      id           : String,
      token        : String,
      displayName  : String,
      username     : String
  },
  google           : {
      id           : String,
      token        : String,
      email        : String,
      name         : String
  }
});

Post = mongoose.model('Post', postSchema);
User = mongoose.model('User', userSchema);

module.exports = {"Post": Post, "User": User};



