var scraperBitcoinMagazine = (function(){

	var http = require('http');
	var cheerio = require('cheerio');
	var request = require('request');
	var fs = require('fs');
	var async = require('async');
	var models = require('./models')
	var postList = [];
	var countTotal = 0;

	// ****************************************************************
	// function to collect post-list from CoinTelegraph undocumented API
	// push detail data of individual post into postList array
	// ***************************************************************

	var collectPostList = function(n, cb_function){
		var options ={
			url: 'http://bitcoinmagazine.com/page/' + n.toString(),
			headers: {
		  		'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.104 Safari/537.36'
		  	},
		};

		var callback = function(err, res, body){
			var cheer = cheerio.load(body);
			cheer('.post_box').each(function(i, element){
					var post= {};
					post.author = cheer(this).find('.post_author').text();
					post.title = cheer(this).find('.headline').text();
					post.url = cheer(this).find('.headline').find('a').attr('href');
					if (post.title != undefined) postList.push(post);
			});

			if (n>1) { collectPostList(n-1, function(){ cb_function() }) }
		 		else cb_function();
		};

		request(options, callback);
	};

	// ************************************************************
	// function to make a http request for one post given the URL
	// ************************************************************

	var collectSinglePostInfo = function(postURL, cb_function) {
		var options = {
	  	url: postURL,
	  	headers: {
	  		'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.104 Safari/537.36'
	  	}
		};

		var callback = function(err, res, body) {
			var cheer = cheerio.load(body);
			var postURLencoded = encodeURIComponent(postURL);
			var content = cheer('.post_content').text();
			var created = cheer('.post_date').attr('title');
			var image = cheer('.content').find('img').attr('src');

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
							 created: created,
							 image: image
						});
				});
		};

		request(options, callback)
	};

	// *****************************************************************************************
	// given the postList this function cordinate to collect all the information in the postList
	// *****************************************************************************************

	var importPosts = function() {
		postList.forEach(function(post){
			collectSinglePostInfo(post['url'], function(value){
					var newPost = new models.Post({
						'image': value.image,
						'title': post.title,
						'titleEncoded': encodeURIComponent(post.title),
						'url' : post['url'],
						'lead_text': "",
						'author' : post.author,
						'created': new Date(value.created),
						'source'	: 3,
						'content' : value.content,
						'likeFB'	: value.likeF,
						'likeTw' : value.likeT
					});
			 	newPost.save();
			 	countTotal ++; console.log(countTotal,' FB: ',value.likeF, 'title', post['title'], value.created, post.author);
			});
		});
	};

	// ************************************************************************************
	// this will open the mongoDB data base and update the facebook and twitter share count
	// ************************************************************************************

	var updateDatabase = function(n) {

	};

 // ****************************************************************************
 // API of scraping program. init() to start scrap. n define the number of page
 // update to update the n most recent articles.
// *****************************************************************************

	return {
		init: function(n) {
			collectPostList(n, function(){
				importPosts();
			})
		},
		update: function(n) {
			updateDatabase(n);
		}
	};

}());

module.exports = scraperBitcoinMagazine;