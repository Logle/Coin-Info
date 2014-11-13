var http = require('http');
var cheerio = require('cheerio');
var request = require('request');
var fs = require('fs');
var async = require('async');
var posts= [];
var count=0;

function getDataHeader(pageNumber){
		var options ={
			url: 'http://bitcoinmagazine.com/page/' + pageNumber.toString(),
			headers: {
		  		// 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
		  		// 'Accept-Encoding':'gzip,deflate,sdch',
		  		// 'Accept-Language':'en-US,en;q=0.8,vi;q=0.6',
		  		// 'Cache-Control':'max-age=0',
		  		// 'Connection':'keep-alive',
		  		'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.104 Safari/537.36'
		  	},
		};
		var callback = function(err, res, body){
			console.log('Hello');
			var cheer = cheerio.load(body);
			cheer('.post_box').each(function(i, element){
					var post= {};
					post.author = cheer(this).find('.post_author').text();
					post.title = cheer(this).find('.headline').text();
					post.url = cheer(this).find('.headline').find('a').attr('href');
					posts.push(post);
					console.log(posts.length);
			});
			if (pageNumber <6) { 
				getDataHeader(pageNumber+1) ;
			} else {
				fs.writeFile('./BitcoinMagazineData/data3-6.txt', JSON.stringify(posts));
			};
		};
		request(options, callback);
};	

function collectPostInfo(postURL, cb_function){
	// var postURL = 'http://cointelegraph.com/news/112837/i-just-paid-for-top-notch-surgery-with-bitcoin-and-gold';
	// console.log(postURL);
	// fs.appendFileSync('log.txt', postURL +'\n\n');
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
						 created: created,
						 image : image
					});
			});		
	};
	// ****  start request
	request(options, callback);
};

function importData(){
	models = require('./models/index');
	fs.readFile('./BitcoinMagazineData/data3-6.txt', function(err,data){
		if (err) throw err;
		var info = JSON.parse(data);
		// console.log(info);
		info.forEach(function(post){
			collectPostInfo(post['url'], function(value){
					var newPost = new models.Post({
						'image': value.image,
						'title': post.title,
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
				count++;
				console.log(count);
		
			}); 
		});
	})
};

var scraperBCmagazine = function(){
	console.log('scraperBC working...');
	// getDataHeader(3);
	importData();
};

module.exports = scraperBCmagazine;