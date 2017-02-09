let express = require('express');
let app = express();
let server = require('http').Server(app);
let io = require('socket.io')(server);
let path = require('path');
let urlExists = require('url-exists');
let mailer = require('nodemailer');
let pause = require('pauseable');

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
	let wait_for_nick_response = false;
	let money = 0;
	let home = hash.encrypt(socket.id);
	let connection = false;
	let bank = false;
	let potential_bank = false;
	let site = false;
	let lis = false;
	let minemine = false;
	let mine_per_min = 0;
	let login = '';

	let listening = pause.setInterval(function() {
		if ( lis ) {
			listenFunc();	
		}
	},2000);
	listening.pause();

	let mining = pause.setInterval(function() {
		if ( minemine ) {
			mineFunc();	
		}
	},60000);
	mining.pause();

	//commands
	let before = {
		login : function() {
			socket.emit("communicate", {data: communicates.communicates.login_started});
			socket.emit("login-write-login");
		}, 
		register : function() {
			socket.emit("communicate", {data: communicates.communicates.register_started});
			socket.emit("register-write-login");
		},
		activate : function(hash) {
			//verify hash for sql injection
			/*databaseModule.activateAccount(hash, function(){
				console.log("callback");
				//acc activated, socket emit login
				socket.emit("communicate", {data: communicates.communicates.account_activated});
			});*/
		},
		help : function() {
			let help_data = communicates.help('before');
			socket.emit("communicate", {data: help_data});
		},
		morehelp : function() {
			socket.emit("open-help");
		}
	}
	let commands = {
		help : function() {
			let help_data = '';
			if ( bank ) {
				help_data = communicates.help('bank');
			} else if ( connection || home && !site ) { 
				help_data = communicates.help('home');
			} else if ( site ) {
				help_data = communicates.help('open');
			}
			socket.emit("communicate", {data: help_data});
		},
		morehelp : function() {
			socket.emit("open-help");
		},
		clear : function(){
			socket.emit('clear');
		},
		connect : function(user, blank){
			let tmp = hash.encrypt(user);
			if ( connection ) {
				socket.emit("communicate", {data: communicates.communicates.already_connected});
			} else if ( site ) {
				socket.emit("communicate", {data: communicates.communicates.close_site_first});
			} else {
				if ( checkIfRoomExist(hash.decrypt(tmp)) ) {
					connection = tmp;
					socket.join(hash.decrypt(tmp));
					socket.emit("communicate", {data: communicates.communicates.connected+hash.decrypt(connection)});
					setPlace('');						
				} else {
					socket.emit("communicate", {data: communicates.communicates.no_such_connection});
				}			
			}
		},
		disconnect : function(who, blank) {
			if ( site ) {
				socket.emit("communicate", {data: communicates.communicates.close_site_first});
			} else if ( connection && !who ) {
				socket.leave(connection);
				socket.emit('communicate', {data: communicates.communicates.disconnect});
				connection = false;
				setPlace('');
			} else if ( connection && who ) {
				if (io.sockets.connected[who]) {
			    	io.sockets.connected[who].leave(connection);
			    	io.sockets.connected[who].emit("communicate", {data: communicates.communicates.disconnect});
				}
			} else if ( !connection && !who ) {
				//wyrzuca siebie z domu
			} else if ( !connection && who ) {
				if (io.sockets.connected[who]) {
			    	io.sockets.connected[who].leave(home);
			    	io.sockets.connected[who].emit("communicate", {data: communicates.communicates.disconnect});
				}
			}
		},
		open : function ( link , blank ) {
			if ( site ) {
				socket.emit("communicate", {data: communicates.communicates.already_connected});
			} else if ( connection ) {
				socket.emit("communicate", {data: communicates.communicates.disconnect_user_first});
			} else if ( bank ) {
				socket.emit("communicate", {data: communicates.communicates.account_close_first});
			} else {
				if ( link.indexOf('www.') == 0  ) {
					socket.emit("communicate", {data: communicates.communicates.provide_url});
				} else {
					urlExists(link, function(err, exists) {
						if ( exists ) {
							site = link;
							socket.join(link);
							setPlace(site);
							socket.emit("open", {data: link});
							socket.emit("communicate", {data: communicates.communicates.open+link});
						} else {
							socket.emit("communicate", {data: communicates.communicates.no_website+link});
						}
					});					
				}

			}
		},
		close : function(blank, blank){
			if ( site ) {
				socket.emit("communicate", {data: communicates.communicates.closed});
				socket.leave(site);
				socket.emit("close");
				site = false;
				setPlace('');
				if ( minemine ) {
					socket.emit('mine-stop');
					minemine = false;
					mining.pause();
					socket.emit('communicate', {data: communicates.communicates.mine_stop});
				}	
			} else {
				socket.emit("communicate", {data: communicates.communicates.no_connection});
			}
		},
		listen : function() {
			if ( !lis ) {
				if ( site ) {
					socket.emit('listen-process');
					lis = true;
					listening.resume();
				} else {
					socket.emit("communicate", {data: communicates.communicates.no_listen_process});
				}
			} else {
				socket.emit("communicate", {data: communicates.communicates.already_listening});
			}
		},
		stop : function(option) {
			if ( option ){
				if(option == '-l'){
					if ( lis ) {
						socket.emit('listen-end');
						lis = false;
						listening.pause();
						socket.emit('communicate', {data: communicates.communicates.listen_stopped});
					} else {
						socket.emit('communicate', {data: communicates.communicates.no_listen_process});
					}	
				} else if ( option == '-m' ) {
					if ( minemine ) {
						socket.emit('mine-stop');
						minemine = false;
						mining.pause();
						socket.emit('communicate', {data: communicates.communicates.mine_stop});
					} else {
						socket.emit('communicate', {data: communicates.communicates.no_mine_process});
					}	
				}				
			} else {
				socket.emit('communicate', {data: communicates.communicates.wrong_command_use});
			}
		},
		ssh : function(func,blank) {
			if ( !site  ){
				if ( func ) {
					if ( func === 'account' ) {
						if ( connection ) {
							potential_bank = connection;
							databaseModule.checkPin(potential_bank, function(data){
								if ( data != null ) {
									socket.emit("communicate", {data: communicates.communicates.enter_pin});
									socket.emit('enter-pin');									
								} else {
									bank = connection;
									setPlace('account');
									socket.emit("communicate", {data: communicates.communicates.account});									
								}
							});					
						} else {
							potential_bank = hash.encrypt(socket.id);
							databaseModule.checkPin(potential_bank, function(data){
								if ( data != null ) {
									socket.emit("communicate", {data: communicates.communicates.enter_pin});
									socket.emit('enter-pin');									
								} else {
									bank = hash.encrypt(socket.id);
									setPlace('account');
									socket.emit("communicate", {data: communicates.communicates.account});									
								}
							});					
						}
					} else {
						socket.emit("communicate", {data: communicates.communicates.no_command+func});
					}
				}				
			} else {
				socket.emit("communicate", {data: communicates.communicates.close_site_first});
			}

		},
		exit : function(blank,blank) {
			if ( bank ) {
				socket.emit("communicate", {data: communicates.communicates.account_close});
				bank = '';
				setPlace('');
			} else {
				socket.emit("communicate", {data: communicates.communicates.account_error});
			}	
		},
		sudo : function(command,link) {

		},
		balance : function() {
			if ( bank ) {
				databaseModule.showBalance(bank, function(data){
					socket.emit("communicate", {data: communicates.communicates.account_balance+(Math.round(data*100)/100)});
				});
			} else {
				socket.emit("communicate", {data: communicates.communicates.account_error});
			}
		},
		transfer : function(to, howmuch) {
			let tmp = hash.encrypt(to);
			if ( bank ) {
				// function transfer money
				databaseModule.showBalance(bank, function(data){
					if ( data-howmuch >= 0 ) {
						databaseModule.getMoney(bank, howmuch, function(data){
							databaseModule.addMoney(tmp,howmuch, function(data){
								socket.emit("communicate", {data: communicates.communicates.transaction_success});							
							});
						});						
					} else {
						socket.emit("communicate", {data: communicates.communicates.not_enough_money});
					}
				});
			} else {
				socket.emit("communicate", {data: communicates.communicates.account_error});
			}
		},
		mine : function() {
			if ( site ) {
				//check if site avaiable for mining
				databaseModule.checkMine(hash.encrypt(site),function(res, bit){
					if(res){
						minemine = true;
						mine_per_min = bit;
						mining.resume();
						socket.emit("communicate", {data: communicates.communicates.mine_start});
						socket.emit('mine-start');
					} else {
						socket.emit("communicate", {data: communicates.communicates.not_mine});
					}
				});
			} else {
				socket.emit("communicate", {data: communicates.communicates.connect_mine_first});
			}
		},
		me : function() {
			socket.emit("communicate", {data: "You are "+socket.id});
		},
		options : function(option) {
			if ( bank ) {
				if ( option ){
					if( option == '-p' ){
						//set pin
						socket.emit('communicate', {data: communicates.communicates.enter_new_pin});
						socket.emit('set-pin');
					} else {
						socket.emit("communicate", {data: communicates.communicates.no_command+option});
					}				
				} else {
					socket.emit('communicate', {data: communicates.communicates.wrong_command_use});
				}				
			}
		}
	}

	let command = [];
	let tmp_login = '';
	let tmp_email = '';
	let tmp_pass = '';
	let tmp_nick = '';

	socket.emit("communicate", {data: communicates.communicates.begin});

	socket.on("command", function(data) {
		acc ? veryfiCommand(data) : verifyBefore(data);
	});
	socket.on("disconnect", function(socket) {

	});
	socket.on("register-write-login-response", function(data) {
		let tmp = hash.encrypt(data.data);
		databaseModule.checkIfLoginExists(tmp, function(data) {
			if ( data ) {
				socket.emit("communicate", {data: communicates.communicates.login_already_exists});
				socket.emit('register-write-login');
			} else {
				tmp_login = tmp;
				socket.emit("communicate", {data: communicates.communicates.register_password});
				socket.emit("register-password");
				wait_for_password_response = true;
			}
		});
	});
	socket.on('register-password-response', function(data) {
		let tmp = hash.encrypt(data.data);
		if ( wait_for_password_response ) {
			socket.emit("register-email");
			socket.emit("communicate", {data: communicates.communicates.register_email});
			wait_for_password_response = false;
			wait_for_email_response = true;
			tmp_pass = tmp;
		} else {
			socket.emit("communicate", {data: communicates.communicates.rules_breaking});
		}
	});
	socket.on('register-email-response', function(data) {
		let tmp = hash.encrypt(data.data);
		tmp_email = tmp;
		if( wait_for_email_response ) {
			if (databaseModule.checkIfEmailExists(tmp_email)) {
				socket.emit("communicate", {data: communicates.communicates.email_exists});
				socket.emit('register-email');
			} else {
				socket.emit('register-nick');
				socket.emit('communicate', {data: communicates.communicates.register_nick});
				wait_for_email_response = false;
				wait_for_nick_response = true;
			}
		}
	});
	socket.on('register-nick-response', function(data) {
		let tmp = hash.encrypt(data.data);
		tmp_nick = tmp;
		if ( wait_for_nick_response ) {
			if ( databaseModule.checkIfNickExists(tmp_nick)) {
				socket.emit("communicate", {data: communicates.communicates.nick_exists});
				socket.emit('register-nick');
			} else {
				//socket.emit("activate-account");
				wait_for_email_response = false;
				databaseModule.registerAccount(tmp_login, tmp_pass, tmp_email, tmp_nick); 
				socket.emit("communicate", {data: communicates.communicates.register_success});
				socket.emit("comm");
				tmp_login = '';
				tmp_email = '';
				tmp_pass = '';
				tmp_nick = '';
			}
		}
	});
	socket.on('login-write-login-response', function(data) {
		let tmp = hash.encrypt(data.data);
		databaseModule.checkIfLoginExists(tmp, function(data) {
			if ( data ) {
				socket.emit("login-password");
				socket.emit("communicate", {data: communicates.communicates.login_password});
				wait_for_login_password = true;
				tmp_login = tmp;
				login = tmp;
			} else {
				socket.emit("communicate", {data: communicates.communicates.login_not_found});
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
					socket.emit('communicate', {data: communicates.communicates.login_success});	
					socket.emit('comm');
					acc = true;
					databaseModule.setSocketIdToAccount(login,hash.encrypt(socket.id));
					setPlace('');
				} else {
					socket.emit('communicate', {data: communicates.communicates.login_failed});
					socket.emit("login-write-login");	
				}
			});
		}
	});
	socket.on('enter-pin-response', function(data) {
		let pino = hash.encrypt(data.data);
		databaseModule.checkPin(potential_bank, function(result) {
			if ( result == pino ) {
				//success
				bank = potential_bank;
				socket.emit("communicate", {data: communicates.communicates.account});
				socket.emit('comm');
				setPlace('account');
			} else {
				//wrong pin try again
				socket.emit('communicate', {data: communicates.communicates.wrong_pin});
				socket.emit('enter-pin');
			}
		});
	});
	socket.on('set-pin-response', function(data) {
		let num = Number(data.data);
		if ( Number.isInteger(num) && data.data.length === 3 ) {
			let pino = hash.encrypt(data.data);
			databaseModule.setPin(bank, pino, function(result) {
				if ( result ) {
					socket.emit('communicate', {data: communicates.communicates.set_pin_success});
					socket.emit('comm');
				} else {
					socket.emit('communicate', {data: communicates.communicates.set_wrong_pin});
					socket.emit('set-pin');
				}
			});
		} else {
			socket.emit('communicate', {data: communicates.communicates.set_wrong_pin});
			socket.emit('set-pin');
		}
	});

	function  veryfiCommand(data) {
		command = [];
		command = data.command.split(" ");
		commands[command[0]] ? commands[command[0]](command[1],command[2]) : socket.emit("communicate", {data: communicates.communicates.no_command+data.command});
	}
	function verifyBefore(data) {
		command = [];
		command = data.command.split(" ");
		before[command[0]] ? before[command[0]]() : socket.emit("communicate", {data: communicates.communicates.no_command+data.command});
	}
	function listenFunc(){
		if ( percentageChance(10) ) {
			listening.pause();
			let rarray = listSocketsInRoom(site);
			if ( rarray.length>1 ) {
				let rand = random(0,rarray.length);
				if ( rarray[rand] == socket.id ) {
					if ( rand + 1 >= rarray.length ) {
						rand--;
					} else {
						rand++;
					}
				}
				socket.emit("communicate", {data: communicates.communicates.found_hash+rarray[rand]});
			} else {
				socket.emit("communicate", {data: communicates.communicates.room_empty});
			}
			socket.emit('listen-end');
			lis = false;
		}				
	}
	function mineFunc(){
		databaseModule.addMoney(hash.encrypt(socket.id),mine_per_min, function(){
			socket.emit("communicate", {data: "You mined: "+mine_per_min+" bitcoin."});
		});
	}
	function percentageChance(percent) {
		let tmp = Math.floor( (Math.random() * 100 ) + 0);
		if ( tmp < percent ) { 
			return true;
		} else {
			return false;
		}
	}
	function listSocketsInRoom(room) {
		let inrooms = io.sockets.adapter.rooms[room];
		let rarray = [];
		if ( inrooms.sockets ) {
			for ( let sockete in inrooms.sockets ) {
				rarray.push(sockete);
			}			
		}
		return rarray;
	}
	function checkIfRoomExist(room) {
		if ( io.sockets.adapter.rooms[room] ) {
			return true;
		} else {
			return false;
		}
	}
	function random(min,max) {
		return Math.floor( (Math.random() * max ) + min);
	}
	function setPlace(place) {
		if ( connection ) {
			if ( place ) {
				socket.emit('set-place', {data: hash.decrypt(connection)+":"+place});
			} else {
				socket.emit('set-place', {data: hash.decrypt(connection)});
			}
		} else {
			socket.emit('set-place', {data: place});
		}
	}
});

server.listen(8000, function(){
	console.log("Server listening on port 8000...");
});