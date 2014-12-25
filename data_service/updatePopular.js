// to update the database on the social popularity at a certain time interval.

var updatePopular = (function(){
	var models = require('../models');
	var Post = models.Post;
	var postPopular = require('./postPopular');

	var update = function(x) {
		Post.find()
			.sort({created: -1})
			.limit(x)
			.exec(function(err, posts){
				posts.forEach(function(post){
					postPopular.init(post.url, function(value){
						if (value.likeF != undefined) {
							post.likeFB = value.likeF;
						};
						if (value.likeT != undefined){
							post.likeTw = value.likeT
						};
						post.save();
						// console.log(post.title);
					});
				})
			});
	};

	return 	{
		init: function(x){
			update(x);
		}
	};
}());

module.exports = updatePopular;

