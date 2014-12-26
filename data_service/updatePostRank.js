// to update the database on the post ranking up or down compared to other posts

var updatePopular = (function(){
	var models = require('../models');
	var Post = models.Post;

	var update = function(x) {
		var today = new Date();
		var maxday = today.setDate(today.getDate()-14);
		Post.find({"created": {$gt: maxday}})
		.sort({likeFB:-1})
		.limit(x)
		.exec(function(err, posts){
			posts.forEach(function(post, index){
				post.rank.push(index+1);
				post.save();
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

