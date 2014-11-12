var http = require('http');
var cheerio = require('cheerio');
var request = require('request');
var fs = require('fs');
var async = require('async');
var countTotal = 0;

// ************ header data for posts 
function storeDataHeader(){
	var i;
	for (i=1; i<2; i++){
		var options = {	
	  	url: 'http://cointelegraph.com/rest/posts/get_page',
	  	method: 'POST',
	  	headers: {
	  		// 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
	  		// 'Accept-Encoding':'gzip,deflate,sdch',
	  		// 'Accept-Language':'en-US,en;q=0.8,vi;q=0.6',
	  		// 'Cache-Control':'max-age=0',
	  		// 'Connection':'keep-alive',
	  		'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/38.0.2125.104 Safari/537.36'
	  	},
	  	form: {
	  		'page': i.toString(),
	  		'lang': 'en'
	  	}
	  	// json: true
		};
		var callback = function(err, res, body) {
		  // console.log(body);
		  fs.writeFile('./CoinTelegraphData/file0.txt', body)
		}
	 	request(options, callback.bind({i:i}));
	};
};

function collectPostInfo(postURL, cb_function){
	// var postURL = 'http://cointelegraph.com/news/112837/i-just-paid-for-top-notch-surgery-with-bitcoin-and-gold';
	// console.log(postURL);
	// fs.appendFileSync('log.txt', postURL +'\n\n');
	var options = {	
	  	url: postURL,
	  	// method: 'POST',
	  	headers: {
	  		// 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
	  		// 'Accept-Encoding':'gzip,deflate,sdch',
	  		// 'Accept-Language':'en-US,en;q=0.8,vi;q=0.6',
	  		// 'Cache-Control':'max-age=0',
	  		// 'Connection':'keep-alive',
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
 			
 			// var linkURL = 'https://www.linkedin.com/countserv/count/share?url=' + postURLencoded ;
			// linkedIn: function(callback){
			// 	request(linkURL, function(err, res, linkBody){
			// 		callback(null, JSON.parse(linkBody.substring(26, linkBody.length-2))['count']);
			// 	})
			// }	
			
			// ************ to collect like from social medias ********************

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

	// ******************
	// In the work ...
	// ******************
function importData(){
	
	models = require('./models/index')
	var file_num;
	
	//async times
	for (file_num=1; file_num<79; file_num++){	
		
		var file_name = 'file' + file_num.toString() +'.txt'; 
		
		fs.readFile('./CoinTelegraphData/'+ file_name, function(err, data){
			
			if (err) throw err;
			var info = JSON.parse(data.toString());
		
			//async each

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
					newPost.save(); 
					countTotal ++;
					console.log(countTotal);
				});
			});
		});	
	};
};

//*******************************************************************
//**************************BODY CODES*******************************
//*******************************************************************

var scraperAlpha = function(){
	
	// console.log('Scraper Alpha working ...');
	//collectPostInfo(); // to collect the content and like indicator for one article
	
	// ****** to write header data from CoinTelegraph to CoinTelegraphData folder
	// storeDataHeader();  
	// ******  to import article data to the pre-defined mongoDB data
	// importData(); 


};

// var scraper = function(){
// 	console.log('Scraper bot is working ...');
	
// 	var options = {
//   	url: 'http://hiento.wordpress.com/',
//   	// method: 'POST',
//   	headers: {},
//   	// form: {
//   	//	'page': '1',
//   	//	'lang': 'en'
//   	//},
//   	// json: true
// 	};
// 	var callback = function(err, res, body) {
// 	  // console.log(body);
// 	  storeData(body);
// 	}
//  	request(options, callback);
	
// 	console.log('Scraper has finished working...');
// };

module.exports = scraperAlpha;


