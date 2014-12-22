var express = require('express');
var router = express.Router();
var Post = require('../models').Post;
var User = require('../models').User;

/* GET users listing. */
router.get('/', function(req, res) {
  res.send('respond with a resource');
});

router.post('/toggleSavePost', function(req, res) {
  Post.findOne({titleEncoded: req.body.titleEncoded }, function(err, post){
  	User.findOne({_id: req.user._id}, function(err, user){
  		var position = user.savedposts.indexOf(post._id)
  		if (position === -1) {
  			user.savedposts.push(post._id);
  		} else {
  			user.savedposts.splice(position,1);
  		};
  		user.save();
  	})
  })

  res.send('OK');
});


module.exports = router;
