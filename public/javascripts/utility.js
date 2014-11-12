$(document).ready(function(){
	
	$.get('/bitcoinprice', function(price){
		$('#priceTick-div').append('<div><strong>last price '+ price.last.toString()+' usd' +'</strong></div>');
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