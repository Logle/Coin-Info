// Data model:

// Article schema:

// 1. image (image - URLlink)
// 2. title (text)
// 3. content (text)
// 4. author (text)
// 5. like {
// 	facebook:
// 	twitter:
// 	linked:
// }
// 6. created (original date)
// 7. lead text (text)
// 8. source (number)

// Author schema:

// 1. Post title
// 2. lead text
// 3. total like

// User schema:

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/coin_data');
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
  name: String,
  email: String
});

Post = mongoose.model('Post', postSchema);
User = mongoose.model('User', userSchema);

module.exports = {"Post": Post, "User": User};



