let socket = io.connect('http://localhost:8000');

$(document).ready(function(){
	let website = null;
	let input = $('#input');
	let log = $("#log");
	let mode = 'comm';
	let alog = $('#active-log');

	let isPaused = true;
	let inter = setInterval(function(){
		if(!isPaused){
			alog.text(randString());
		}
	},50);

	socket.on("communicate", function(data) {
		add(data.data);
	});
	socket.on("open", function(data){
		website = window.open(data.data);
	});
	socket.on("close", function(){
		website.close();
	});
	socket.on('login-write-login', function(){
		mode = 'login-write-login';
		input.attr('type','text');
	});
	socket.on('login-password', function(){
		mode = 'login-password';
		input.attr('type','password');
	});	
	socket.on('register-write-login', function(){
		mode = 'register-write-login';
		input.attr('type','text');
	});
	socket.on('register-password', function(){
		mode = 'register-password';
		input.attr('type','password');
	});
	socket.on('register-email', function(){
		mode = 'register-email';
		input.attr('type','email');
	});
	socket.on('comm', function(){
		mode = 'comm';
		input.attr('type','text');
	});
	socket.on('open-help', function() {
		 window.open('https://mywebadventure.com');
	});
	socket.on('clear', function() {
		log.empty();
	});
	socket.on('listen-process', function() {
		alog.show();
		isPaused = false;
	});
	socket.on('listen-end', function() {
		alog.hide();
		isPaused = true;
	});

	$("html").click(function() {
        input.val(input.val()).focus();
    });       
    $(document).keypress(function(e) {
	    if(e.which == 13) {
	    	console.log(mode);
	    	let text = input.val();
	    	input.val("");
	    	if( mode === 'login-write-login' ) {
	    		loginWriteLogin(text);
	    	} else if ( mode === 'login-password' ) {
	    		loginWritePass(text);
	    	} else if ( mode === 'register-write-login' ) {
	    		registerLogin(text);
	    	} else if ( mode === 'register-password' ) {
	    		registerPass(text);
	    	} else if ( mode === 'register-email' ) {
	    		registerEmail(text);
	    	} else if ( mode === 'comm' ) {
	    		command(text);
	    	}
	    }
	});

	function command(data) {
	    add("~$ "+data);
		socket.emit("command", {command: data});
	}
	function registerLogin(data) {
		socket.emit('register-write-login-response', {data: data});
	}
	function registerPass(data) {
		socket.emit('register-password-response', {data: data});
	}
	function registerEmail(data) {
		socket.emit('register-email-response', {data: data});
	}
	function loginWritePass(data) {
		socket.emit('login-password-response', {data: data});
	}
	function loginWriteLogin(data){
		socket.emit('login-write-login-response', {data: data});
	}
	function add(data){
		log.append("<div class='row'>"+data+"</div>");
		window.scrollTo(0,document.body.scrollHeight);
	}
	function randString() {
	    let text = "";
	    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	    for( let i=0; i < 60; i++ ) {
	        text += possible.charAt(Math.floor(Math.random() * possible.length));
	    }
	    return text;
	}
});
