var data_service = (function(){

	var scraperCoinTelegraph = require('./scraperCoinTelegraph');
	var scraperCoinDesk = require('./scraperCoinDesk');
	var scraperBitcoinMagazine = require('./scraperBitcoinMagazine');  // Bitcoin Magazine is closed in November-2014
	var updatePopular = require('./updatePopular');

	return {
		init: function(x,y){
			scraperCoinTelegraph.init(x);
			scraperCoinDesk.init(y);
		},
		update: function(x){
			updatePopular.init(x);
		}
	}

}());

module.exports = data_service;
