var scraperCoinDesk = (function(){

	var http = require('http');
	var cheerio = require('cheerio');
	var request = require('request');
	var async = require('async');
	var models = require('../models');
	var postPopular = require('./postPopular');  // postPopular library
	var postList = [];
	var countTotal = 0;

	// ****************************************************************
	// function to collect post-list from CoinTelegraph undocumented API
	// push detail data of individual post into postList array
	// ***************************************************************

	var collectPostList = function(n, cb_function){
		var options ={
			url: 'http://coindesk.com/page/' + n.toString(),
			headers: {
		  		'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.104 Safari/537.36'
		  	},
		};

		var callback = function(err, res, body){
			var cheer = cheerio.load(body);
			cheer('.article').each(function(i, element){
					var post= {};
					post.image = cheer(this).find('img').attr('src');
					post.created = cheer(this).find('time').attr('datetime');
					post.author = cheer(this).find('cite').text();
					post.title = cheer(this).find('.post-info').find('a').attr('title');
					post.url = cheer(this).find('.post-info').find('a').attr('href');
					if ((post.title != undefined)&&(post.title != '')) postList.push(post);
					countTotal ++; console.log('CoinDesk: ',countTotal);
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
			var content = cheer('.single-content').text();
			postPopular.init(postURL, function(results){
				cb_function({
					content: content,
					likeF: results.likeF,
					likeT: results.likeT,
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
						'image': post.image,
						'title': post.title,
						'titleEncoded': encodeURIComponent(post.title),
						'url' : post['url'],
						'lead_text': "",
						'author' : post.author,
						'created': post.created,
						'source'	: 2,
						'content' : value.content,
						'likeFB'	: value.likeF,
						'likeTw' : value.likeT
					});
			 	newPost.save();
			 	countTotal ++; // console.log(countTotal, post.created);
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

module.exports = scraperCoinDesk;