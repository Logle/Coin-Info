var express = require('express');
var router = express.Router();
var Post = require('../models').Post;
var fs = require('fs');
var request = require('request');
/* GET home page. */

function cleanData(posts){
	var postsOK = posts;
	for (post in postsOK){
		if (postsOK[post].source === 1){
			postsOK[post].sourceString ='Coin Telegraph';
	 		postsOK[post].sourceURL ='http://cointelegraph.com/';
		} else if (postsOK[post].source === 2){
			postsOK[post].sourceString ='Coin Desk';
	 		postsOK[post].sourceURL ='http://coindesk.com/';
		};
	// console.log(postsOK[post].sourceString, postsOK[post].sourceURL)
	}
	return postsOK;
};

router.get('/bitcoinprice', function(req, res){
	var option = {
		url : 'https://www.bitstamp.net/api/ticker/'
	};
	var callback = function(err, respond, body){
		res.send(JSON.parse(body));
	};

	request(option, callback);
});

router.get('/searchBox', function(req, res){
	Post.find({$text:{$search: req.query.query}})
		.limit(8)
		.exec(function(err, posts){
			res.send(posts);
		})
});

router.get('/', function(req, res){
	Post.find()
		.sort({created: -1})
		.limit(30)
		.exec(function(err, posts){
			res.render('index', {
				posts: cleanData(posts)
			});
		});
});

router.get('/post/:title', function(req, res){
	var title = req.params.title;
	Post.findOne({title: title}, function(err, post){
		res.render('postView', {post: post});
	});
});

router.post('/searchPost', function(req, res){
	var title = req.body.title;
	Post.findOne({title: title}, function(err, post){
		res.render('postView', {post: post});
	});
})

router.get('/author/:author', function(req, res){
	var author = req.params.author;
	Post.find({author: author}, function(err, posts){
		res.render('authorView', {author: author, posts: posts});
	});
});

router.get('/bestposts', function(req, res){
	Post.find()
		.sort({likeFB: -1})
		.limit(30)
		.exec(function(err, posts){
			res.render('bestpostview', {
				posts: cleanData(posts)
			});
		});
});

router.get('/trending', function(req, res){
	var today = new Date();
	var maxday = today.setDate(today.getDate()-14);
	Post.find({"created": {$gt: maxday}})
		.sort({likeFB:-1})
		.limit(30)
		.exec(function(err, posts){
			res.render('trendingview', {
				posts: cleanData(posts)
			});
		});
});


module.exports = router;
