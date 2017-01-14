let express = require('express');
let app = express();
let server = require('http').Server(app);
let io = require('socket.io')(server);
let path = require('path');
let urlExists = require('url-exists');
let mailer = require('nodemailer');

const communicates = require('./modules/communicates.js');
let databaseModule = require('./modules/database.js');
let hash = require('./modules/hash.js');
let valid = require('./modules/validate.js');

app.use(express.static(path.join(__dirname, '/public')));

app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');

let index = require(path.join(__dirname, '/routes/index.js'));

app.use('/',index);

io.on('connection', function(socket) {
	socket.join(socket.id);
	let acc = false;
	let wait_for_password_response = false;
	let wait_for_email_response = false;
	let wait_for_login_password = false;
	let money = 0;
	let home = socket.id;
	let connection = false;
	let ssh = false;
	let site = false;
	//commands
	let before = {
		login : function() {
			socket.emit("communicate", {data: communicates.login_started});
			socket.emit("login-write-login");
		}, 
		register : function() {
			socket.emit("communicate", {data: communicates.register_started});
			socket.emit("register-write-login");
		},
		activate : function(hash) {
			//verify hash for sql injection
			/*databaseModule.activateAccount(hash, function(){
				console.log("callback");
				//acc activated, socket emit login
				socket.emit("communicate", {data: communicates.account_activated});
			});*/
		}
	}
	let commands = {
		connect : function(user, blank){
			if ( connection ) {
				socket.emit("communicate", {data: communicates.already_connected});
			} else if ( site ) {
				socket.emit("communicate", {data: communicates.close_site_first});
			} else {
				connection = user;
				socket.join(connection);
				socket.emit("communicate", {data: communicates.connected+connection});									
			}
		},
		disconnect : function(who, blank) {
			if ( site ) {
				socket.emit("communicate", {data: communicates.close_site_first});
			} else if ( connection && !who ) {
				socket.leave(connection);
				socket.broadcast.to(connection).emit("communicate", {data: communicates.user_left});
				connection = false;
			} else if ( connection && who ) {
				if (io.sockets.connected[who]) {
			    	io.sockets.connected[who].leave(connection);
			    	io.sockets.connected[who].emit("communicate", {data: communicates.disconnect});
				}
			} else if ( !connection && !who ) {
				//wyrzuca siebie z domu
			} else if ( !connection && who ) {
				if (io.sockets.connected[who]) {
			    	io.sockets.connected[who].leave(home);
			    	io.sockets.connected[who].emit("communicate", {data: communicates.disconnect});
				}
			}
		},
		open : function ( link , blank ) {
			if ( site ) {
				socket.emit("communicate", {data: communicates.already_connected});
			} else if ( connection ) {
				socket.emit("communicate", {data: communicates.disconnect_user_first});
			} else {
				urlExists(link, function(err, exists) {
					if ( exists ) {
						site = link;
						socket.join(link);
						socket.emit("open", {data: link});
						socket.emit("communicate", {data: communicates.open+link});
					} else {
						socket.emit("communicate", {data: communicates.no_website+link});
					}
				});
			}
		},
		close : function(blank, blank){
			if ( site ) {
				socket.emit("communicate", {data: communicates.closed});
				socket.leave(site);
				socket.emit("close");
				site = false;
			} else {
				socket.emit("communicate", {data: communicates.no_connection});
			}
		},
		show : function(blank, blank) {
			if( site ) {
				let inrooms = io.sockets.adapter.rooms[site];
				for ( let sockete in inrooms.sockets ) {
					socket.emit("communicate", {data: sockete});
				}
			} else if ( connection ) {
				let inrooms = io.sockets.adapter.rooms[connection];
				for ( let sockete in inrooms.sockets ) {
					socket.emit("communicate", {data: sockete});
				}
			} else {
				let inrooms = io.sockets.adapter.rooms[home];
				for ( let sockete in inrooms.sockets ) {
					socket.emit("communicate", {data: sockete});
				}
			}
		},
		ssh : function(func,blank) {
			if ( func ) {
				if ( func === 'account' ) {
					socket.emit("communicate", {data: communicates.account});
					ssh = true;
				} else {
					socket.emit("communicate", {data: communicates.no_command});
				}
			}
		},
		exit : function(blank,blank) {
			if ( ssh ) {
				socket.emit("communicate", {data: communicates.account_close});
				ssh = false;
			} else {
				socket.emit("communicate", {data: communicates.account_error});
			}	
		},
		sudo : function(command,link) {

		},
		balance : function() {
			ssh ? socket.emit("communicate", {data: communicates.account_balance+money}) : socket.emit("communicate", {data: communicates.account_error});
		},
		transfer : function(to, howmuch) {
			if ( ssh ) {
				// function transfer money
			} else {
				socket.emit("communicate", {data: communicates.account_error});
			}
		}


	}

	let command = [];
	let tmp_login = '';
	let tmp_email = '';
	let tmp_pass = '';

	socket.emit("communicate", {data: communicates.begin});

	socket.on("command", function(data) {
		acc ? veryfiCommand(data) : verifyBefore(data);
	});
	socket.on("disconnect", function(socket) {
		console.log("socket disconnected");
	});
	socket.on("register-write-login-response", function(data) {
		let tmp = hash.encrypt(data.data);
		if ( databaseModule.checkIfLoginExists(tmp) ) {
			socket.emit("communicate", {data: communicates.login_already_exists});
			socket.emit('register-write-login');
		} else {
			tmp_login = tmp;
			socket.emit("communicate", {data: communicates.register_password});
			socket.emit("register-password");
			wait_for_password_response = true;
		}
	});
	socket.on('register-password-response', function(data) {
		let tmp = hash.encrypt(data.data);
		if ( wait_for_password_response ) {
			socket.emit("register-email");
			socket.emit("communicate", {data: communicates.register_email});
			wait_for_password_response = false;
			wait_for_email_response = true;
			tmp_pass = tmp;
		} else {
			socket.emit("communicate", {data: communicates.rules_breaking});
		}
	});
	socket.on('register-email-response', function(data) {
		let tmp = hash.encrypt(data.data);
		tmp_email = tmp;
		if( wait_for_email_response ) {
			if (databaseModule.checkIfEmailExists(tmp_email)) {
				socket.emit("communicate", {data: communicates.email_exists});
				socket.emit('register-email');
			} else {
				//socket.emit("activate-account");
				wait_for_email_response = false;
				databaseModule.registerAccount(tmp_login, tmp_pass, tmp_email); 
				socket.emit("communicate", {data: communicates.register_success});
				socket.emit("comm");
				tmp_login = '';
				tmp_email = '';
				tmp_pass = '';
			}
		}
	});
	socket.on('login-write-login-response', function(data) {
		let tmp = hash.encrypt(data.data);
		console.log(tmp);
		databaseModule.checkIfLoginExists(tmp, function(data) {
			if ( data ) {
				socket.emit("login-password");
				socket.emit("communicate", {data: communicates.login_password});
				wait_for_login_password = true;
				tmp_login = tmp;
			} else {
				socket.emit("communicate", {data: communicates.login_not_found});
			}
		});
	});
	socket.on('login-password-response', function(data) {
		let tmp = hash.encrypt(data.data);
		tmp_pass = tmp;
		if ( wait_for_login_password ) {
			databaseModule.login(tmp_login, tmp_pass, function(data){
				if ( data ) {
					tmp_login = '';
					tmp_pass = '';
					socket.emit('communicate', {data: communicates.login_success});	
					socket.emit('comm');
					acc = true;
				} else {
					socket.emit('communicate', {data: communicates.login_failed});
					socket.emit("login-write-login");	
				}
			});
		}
	});

	function  veryfiCommand(data) {
		command = [];
		command = data.command.split(" ");
		commands[command[0]] ? commands[command[0]](command[1],command[2]) : socket.emit("communicate", {data: communicates.no_command+data.command});
	}
	function verifyBefore(data) {
		command = [];
		command = data.command.split(" ");
		before[command[0]] ? before[command[0]]() : socket.emit("communicate", {data: communicates.no_command+data.command});
	}
});

server.listen(8000, function(){
	console.log("Server listening on port 8000...");
});