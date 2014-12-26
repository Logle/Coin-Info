// This function is to add an extra field to the collection: titleEncode to deal with
// the issue of broswer not encoding title properly.
// to delete a field : db.posts.update({},{$unset: {'lastRank': 1}}, {multi: true});

var changeDatabase = (function(){
	var models = require('../models');
	var Post = models.Post;

	var addTitleEncoded = function(){
		Post.find()
			.exec(function(err, posts){
				posts.forEach(function(post){
					post.titleEncoded = encodeURIComponent(post.title);
					post.save();
				})
			});
	};

// note: mongoLab update is much slower than local database.

	var addPostRank = function(){
		Post.find()
			.exec(function(err, posts){
				posts.forEach(function(post){
					post.rank.push(100);
					post.save();
				})
			});
	};

	return 	{
		init: function(){
			addPostRank();
		}
	};
}());

module.exports = changeDatabase;

