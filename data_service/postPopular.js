// an independent library that return social media shares for a URL.

var postPopular = (function(postURL, cb_function){
	var async = require('async');
	var request = require('request');

	return {
		init : function(postURL, cb_function){
			var postURLencoded = encodeURIComponent(postURL);
			var fbURL = 'https://graph.facebook.com/fql?q=SELECT+total_count+FROM+link_stat+WHERE+url%3D%22' + postURLencoded +'%22';
			var twitURL = 'https://cdn.api.twitter.com/1/urls/count.json?url=' + postURLencoded ;
			async.parallel({
					fb: function(callback){
						request(fbURL, function(err, res, fbBody){
							if (err) { callback(null, 0); }
							else if (JSON.parse(fbBody)['data'] != undefined){
								callback(null, JSON.parse(fbBody)['data'][0]['total_count']);
							} else {
								callback(null, 0);
							};
						});
					},
					twitter: function(callback){
						request(twitURL, function(err, res, tBody){
							if (err) { callback(null, 0); }
							else if (JSON.parse(tBody)['count'] != undefined) {
								callback(null, JSON.parse(tBody)['count']);
							} else {
								callback(null, 0);
							}
						});
					}
				},
				function(err, results){
						cb_function({
							 likeF: results.fb,
							 likeT: results.twitter,
						});
				});
		}
	};
}());

module.exports = postPopular;