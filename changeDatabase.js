// This function is to add an extra field to the collection: titleEncode to deal with
// the issue of broswer not encoding title properly.

var changeDatabase = (function(){
	var models = require('./models');
	var Post = models.Post;

	var update = function() {
		Post.find()
			.exec(function(err, posts){
				posts.forEach(function(post){
					post.titleEncoded = encodeURIComponent(post.title);
					post.save();
				})
			});
	};

	return 	{
		init: function(){
			update();
		}
	};
}());

module.exports = changeDatabase;

