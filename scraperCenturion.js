var http = require('http');
var cheerio = require('cheerio');
var request = require('request');
var fs = require('fs');
var async = require('async');
var countTotal = 0;


function collectPostInfo(postURL, cb_function){
	var options = {	
	  	url: postURL,
	  	// method: 'POST',
	  	headers: {
	  		'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.104 Safari/537.36'
	  	} 
		};
	var callback = function(err, res, body) {
		 
			var cheer = cheerio.load(body);
			var postURLencoded = encodeURIComponent(postURL);
			var content = cheer('.post-itself').text();		
			
			var temp;  
			
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
						 content: content,
						 likeF: results.fb,
						 likeT: results.twitter,
					});
			});		
	};
	// ****  start request
	request(options, callback);
};


function importData(){
	models = require('./models/index')
	fs.readFile('./CoinTelegraphData/file0.txt', function(err,data){
		if (err) throw err;
		var info = JSON.parse(data.toString());
		console.log(info.posts.length);		
		
		info.posts.forEach(function(post) {
				collectPostInfo('http://cointelegraph.com' + post['url'], function(value){
					var newPost = new models.Post({
						'image': 'http://cointelegraph.com/images/393_' + post['image'],
						'title': post['title'],
						'url' : 'http://cointelegraph.com' + post['url'],
						'lead_text': post['lead_text'],
						'author' : post['author'],
						'created': post['created'],
						'source'	: 1,
						'content' : value.content,
						'likeFB'	: value.likeF,
						'likeTw' : value.likeT
					});
				  
				 newPost.save(); //MongoDB prevent writing duplicate post thanks to indexing
					
					countTotal ++;
					console.log(countTotal);

				});
			});

	});
};

var scraperCenturion = function(){
	console.log('scraperCenturion working...');
	// importData();
};

module.exports = scraperCenturion;