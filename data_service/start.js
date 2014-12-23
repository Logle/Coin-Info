var data_service = (function(){

	var scraperCoinTelegraph = require('./scraperCoinTelegraph');
	var scraperCoinDesk = require('./scraperCoinDesk');
	var scraperBitcoinMagazine = require('./scraperBitcoinMagazine');  // Bitcoin Magazine is closed in November-2014

	return {
		init: function(x,y){
			scraperCoinTelegraph.init(x);
			scraperCoinDesk.init(y);
		}
	}

}());

module.exports = data_service;
