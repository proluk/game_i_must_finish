let socket = io.connect('http://localhost:8000');

$(document).ready(function(){
	let commands = [];
	let command_num = 0;
	let website = null;
	let input = $('#input');
	let log = $("#log");
	let mode = 'comm';
	let alog = $('#active-log');
	let labelo = $('#labelo');
	let current_place = 'guest~$ ';
	let vir;
	let bl;
	let memo = '';

	labelo.text(current_place);
	input.attr('maxLength', '150');

	let isPaused = true;
	let isPausedBinary = true;
	let inter = setInterval(function(){
		if(!isPaused){
			alog.html(randString());
		}
	},50);

	let binary = setInterval(function(){
		if(!isPausedBinary){
			alog.html(randBinary());
		}
	},50);

	socket.on('set-memo', function(data){
		memo = data.data;
	});
	socket.on('set-place', function(data) {
		current_place = data.data+'~$ ';
		labelo.text(current_place);
	});
	socket.on("communicate", function(data) {
		add(data.data);
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
	socket.on('register-nick', function(){
		mode = 'register-nick';
		input.attr('type','text');
	});
	socket.on('comm', function(){
		input.attr('maxLength', '150');
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
	socket.on('mine-start', function() {
		alog.show();
		isPausedBinary = false;
	});
	socket.on('mine-stop', function() {
		alog.hide();
		isPausedBinary = true;
	});
	socket.on('enter-pin', function() {
		mode = 'enter-pin';
		input.attr('maxLength', '3');
		input.attr('type','password');
	});
	socket.on('set-pin', function() {
		mode = 'set-pin';
		input.attr('maxLength', '3');
		input.attr('type', 'password');
	});
	socket.on('virus-start', function(data) {
		startVirus(data.type, data.url, data.dur);
	});
	socket.on('virus-stop', function(){
		stopVirus();
	});
	socket.on('kill-start', function(data){
		socket.emit('kill-start-response', {data:data.data});
	});
	socket.on('transfer-start', function(data){
		socket.emit('transfer-start-response', {data: data});
	});
	socket.on('transfer-stop', function(data){
		socket.emit('transfer-stop-response', {data:data.data});
	});

	$("html").click(function() {
        input.val(input.val()).focus();
    });       
    $(document).on('keydown',function(e) {
	    if(e.which == 13) {
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
	    	} else if ( mode === 'register-nick' ) {
	    		registerNick(text);
	    	} else if ( mode === 'enter-pin' ) {
	    		enterPin(text);
	    	} else if ( mode === 'set-pin' ) {
	    		setPin(text);
	    	} else if ( mode === 'comm' ) {
	    		command(text);
	    		commands.push(text);
	    		command_num = commands.length;
	    	}
	    } else if ( e.which == 38 ) {
	    	//arrow up
	    	if ( command_num > 0 ) {
	    		command_num--;
	    		input.val(commands[command_num]);
	    	}
	    } else if ( e.which == 40 ) {
	    	//arrow down
	    	if ( command_num < commands.length-1 ) {
	    		command_num++;
	    		input.val(commands[command_num]);
	    	} else {
	    		command_num = commands.length;
	    		input.val('');
	    	}
	    } else if (e.which == 192 ) {
	    	e.preventDefault();
	    	input.val(input.val()+memo);
	    }
	});

	function command(data) {
	    add(current_place+data);
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
	function registerNick(data) {
		socket.emit('register-nick-response', {data: data});
	}
	function loginWritePass(data) {
		socket.emit('login-password-response', {data: data});
	}
	function loginWriteLogin(data){
		socket.emit('login-write-login-response', {data: data});
	}
	function enterPin(data){
		socket.emit('enter-pin-response', {data: data});
	}
	function setPin(data){
		socket.emit('set-pin-response', {data: data});
	}
	function add(data){
		log.append("<div class='row'>"+data+"</div>");
		window.scrollTo(0,document.body.scrollHeight);
	}
	function startVirus(name, url, dur){
		vir = $('<div class="virus-window"><iframe width="1280" height="720" src="'+url+'?autoplay=1" frameborder="0" allowfullscreen></iframe></div>');
		bl = $('<div style="position:fixed; top:0;left:0;width:100vw;height:100vh;background-color:rgba(0,0,0,0.1);z-index:1000000;"></div>');
		$('#vir-info').show();
		$('body').append(vir);
		$('body').append(bl);
		let time = dur/1000;
		console.log(time);
		let tmp = setInterval(function(){
			$('#vir-info').html('Your Account is Infected! Virus Type: '+name+" Remaining Time: "+time);
			time--;
			if ( time == 0 ) {
				tmp = null;
			}
		},1000);		
	}
	function stopVirus(){
		vir.hide();
		vir.remove();
		vir = '';
		bl.hide();
		bl.remove();
		bl = '';
		$('#vir-info').html('').hide();
	}
	function randString() {
	    let text = "";
	    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	    for( let m = 0 ; m < 3 ; m ++ ) {
		    for( let i=0; i < 80; i++ ) {
		        text += possible.charAt(Math.floor(Math.random() * possible.length));
		    }
		    text+='</br>';    	
	    }

	    return text;
	}
	function randBinary(){
		let text = "";
		for( let m = 0 ; m < 5 ; m ++ ) {
			for( let i = 0 ; i < 60 ; i ++ ) {
				text += Math.round((Math.random() * 1 ) + 0 );
			}
			text += "</br>";
		}
		return text;
	}
});
