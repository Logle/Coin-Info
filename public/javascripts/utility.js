$(document).ready(function(){
	
	$.get('/bitcoinprice', function(price){
		// console.log(price);
		if (price.last > price.low){
			$('#priceTick-div').append("<div><strong>last price " + price.last.toString()+ " usd </strong><span id='burning' class='glyphicon glyphicon-fire'></span></div>");
		} else {
			$('#priceTick-div').append("<div><strong>last price " + price.last.toString()+ " usd </strong><span class='glyphicon glyphicon-cloud'></span></div>");
		}
		// var burningTime = 0;
		// var tickerInterval = window.setInterval(function(){
		// 	 if (burningTime <20) { 
		// 	 	  $('#burning').toggleClass('glyphicon glyphicon-fire');  burningTime++; 
		// 	 } else {
		// 	 		window.clearInterval(tickerInterval);
		// 	 }
		// }, 500);	
	
	})

	$('#searchBox').typeahead({
		hint: true,
  	highlight: true,
  	minLength: 3
	},
	{
		name: 'article-data',
  	displayKey: 'title',
  	source: function(query, callback){	
  		return $.get('/searchBox', {query:query}, function(data){
				callback(data);	
  		});
  	}
	});

});