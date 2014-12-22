$(document).ready(function(){

	$.get('/bitcoinprice', function(price){
		$('#pricetick-div').append("<div><strong>Bitcoin last price " + price.last.toString()+ " usd </strong></div>");
	});

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

	$('.savePost').click(function(){
		var userStatus = $('.savePost').attr('data-userStatus');
		if (userStatus != 'Login') {
			var titleEncoded = $('.savePost').attr('data-titleEncoded');
			$.post('/users/toggleSavePost',{ titleEncoded: titleEncoded }, function(){
				var isSaved = $('.savePost').attr('data-isSaved');
				console.log(isSaved);
				if (isSaved === 'true') {
					console.log('there');
					$('.savePost').text('Save this').removeClass('btn-success').addClass('btn-default').attr('data-isSaved', 'false');
				} else {
					console.log('here');
					$('.savePost').text('Saved').removeClass('btn-default').addClass('btn-success').attr('data-isSaved', 'true')
				};
			});
		} else {};
	});

});