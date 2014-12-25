var express = require('express');
var router = express.Router();
var Post = require('../models').Post;
var User = require('../models').User;
var fs = require('fs');
var request = require('request');
var passport = require('passport');
/* GET home page. */

function checkUserName(user) {
	if (user === undefined) return 'Login.OK'
		else return user.facebook.name;
};

function cleanData(posts){
	var postsOK = posts;
	for (post in postsOK){
		if (postsOK[post].source === 1){
			postsOK[post].sourceString ='Coin Telegraph';
	 		postsOK[post].sourceURL ='http://cointelegraph.com/';
		} else if (postsOK[post].source === 2){
			postsOK[post].sourceString ='Coin Desk';
	 		postsOK[post].sourceURL ='http://coindesk.com/';
		} else if (postsOK[post].source === 3){
			postsOK[post].sourceString ='Bitcoin Magazine';
	 		postsOK[post].sourceURL ='http://bitcoinmagazine.com/';
		}
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
		.limit(15)
		.exec(function(err, posts){
			res.send(posts);
		})
});

router.get('/', function(req, res){
	Post.find()
		.sort({created: -1})
		.limit(25)
		.exec(function(err, posts){
			res.render('index', {
				user : checkUserName(req.user),
				active: 'most recent',
				posts: cleanData(posts)
			});
		});
});

router.get('/post/:title', function(req, res){
	var title = req.params.title;
	Post.findOne({title: title}, function(err, post){
		var isSaved = false;
		if ((req.user != undefined)&&(req.user.savedposts.indexOf(post._id)!=-1)) { isSaved=true; }
		res.render('postview', {
			post: post,
			user : checkUserName(req.user),
			isSaved: isSaved
		});
	});
});

router.post('/searchPost', function(req, res){
	res.redirect('post/' + req.body.title);
})

router.get('/author/:author', function(req, res){
	var author = req.params.author;
	Post.find({author: author})
		.sort({created: -1})
		.exec(function(err, posts){
			res.render('authorview', {
				author: author,
				posts: posts,
				user: checkUserName(req.user)
			});
		});
});

router.get('/bestposts', function(req, res){
	Post.find()
		.sort({likeFB: -1})
		.limit(25)
		.exec(function(err, posts){
			res.render('index', {
				active: 'best',
				posts: cleanData(posts),
				user : checkUserName(req.user)
			});
		});
});

router.get('/trending', function(req, res){
	var today = new Date();
	var maxday = today.setDate(today.getDate()-14);
	Post.find({"created": {$gt: maxday}})
		.sort({likeFB:-1})
		.limit(25)
		.exec(function(err, posts){
			res.render('index', {
				active: 'trending',
				posts: cleanData(posts),
				user : checkUserName(req.user)
			});
		});
});

router.get('/savedposts', function(req,res){
	if (req.user != undefined) {
		User.findOne({'facebook.id': req.user.facebook.id})
			.populate ('savedposts')
			.exec(function(err, user){
				res.render('savedpostview', {
					posts: user.savedposts,
					user: checkUserName(req.user)
				});
			})
	};
})

//FACEBOOK ROUTES
//facebook authentication and login
router.get('/auth/facebook', passport.authenticate('facebook'));

// handle the callback after facebook has authenticated the user
router.get('/auth/facebook/callback',
  passport.authenticate('facebook', {
    successRedirect : '/',
    failureRedirect : '/'
  }));

//route for logging out
router.get('/logout', function(req, res){
  req.logout(); //this logout function is provided by passport
  res.redirect('/');
})

module.exports = router;
