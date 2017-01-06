$(document).ready(function(){
	let input = $('#input');
	let log = $("#log");

	$("html").click(function() {
        input.val(input.val()).focus();
    });       
    $(document).keypress(function(e) {
	    if(e.which == 13) {
	        text = input.val();
	        log.append("<div class='row'>"+text+"</div>");
	        input.val("");
	    }
	});
});