let socket = io.connect('http://localhost:8000');

$(document).ready(function(){
	let website = null;
	let input = $('#input');
	let log = $("#log");

	socket.on("communicate", function(data) {
		add(data.data);
	});
	socket.on("open", function(data){
		website = window.open(data.data);
	});
	socket.on("close", function(){
		website.close();
	});

	$("html").click(function() {
        input.val(input.val()).focus();
    });       
    $(document).keypress(function(e) {
	    if(e.which == 13) {
	        text = input.val();
	        input.val("");
	        add("~$ "+text);
	        socket.emit("command", {command: text});
	    }
	});
	function add(data){
		log.append("<div class='row'>"+data+"</div>");
		window.scrollTo(0,document.body.scrollHeight);
	}
});
