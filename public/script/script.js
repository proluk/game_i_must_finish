let socket = io.connect('http://localhost:8000');

$(document).ready(function(){
	
	let input = $('#input');
	let log = $("#log");

	socket.on("communicate", function(data) {
		add(data.data);
	});

	$("html").click(function() {
        input.val(input.val()).focus();
    });       
    $(document).keypress(function(e) {
	    if(e.which == 13) {
	        text = input.val();
	        input.val("");
	        socket.emit("command", {command: text});
	    }
	});
	function add(data){
		log.append("<div class='row'>"+data+"</div>");
		window.scrollTo(0,document.body.scrollHeight);
	}
});
