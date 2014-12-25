var updatePopular = (function(){
	var models = require('../models');
	var Post = models.Post;
	var request = require('request');
	var async = require('async');

	var collectPostPopular = function(postURL, cb_function) {
		var options = {
	  	url: postURL,
	  	headers: {
	  		'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.104 Safari/537.36'
	  	}
		};
		var callback = function(err, res, body) {
			var postURLencoded = encodeURIComponent(postURL);
			var fbURL = 'https://graph.facebook.com/fql?q=SELECT+total_count+FROM+link_stat+WHERE+url%3D%22' + postURLencoded +'%22';
			var twitURL = 'https://cdn.api.twitter.com/1/urls/count.json?url=' + postURLencoded ;
			async.parallel({
					fb: function(callback){
						request(fbURL, function(err, res, fbBody){
							if (JSON.parse(fbBody)['data'] != undefined){
								callback(null, JSON.parse(fbBody)['data'][0]['total_count']);
							}
						});
					},
					twitter: function(callback){
						request(twitURL, function(err, res, tBody){
							callback(null, JSON.parse(tBody)['count']);
						});
					}
				},
				function(err, results){
						cb_function({
							 likeF: results.fb,
							 likeT: results.twitter,
						});
				});
		};
		request(options, callback)
	};

	var update = function(x) {
		Post.find()
			.sort({created: -1})
			.limit(x)
			.exec(function(err, posts){
				posts.forEach(function(post){
					collectPostPopular(post.url, function(value){
						if (value.likeF > post.likeFB) {
							post.likeFB = value.likeF;
						};
						if (value.likeT > post.likeTw){
							post.likeTw = value.likeT
						};
						post.save();
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

