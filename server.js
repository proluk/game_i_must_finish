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
let binaryModule = require('./modules/binary.js');
let hash = require('./modules/hash.js');
let valid = require('./modules/validate.js');
let virusModule = require('./modules/virus.js');

app.use(express.static(path.join(__dirname, '/public')));

app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');

let index = require(path.join(__dirname, '/routes/index.js'));

app.use('/',index);

let onion_website = 'http://atw4mhgtbbs1.onion'; //a tor website 4 my hacker game to buy botnet strength 1
let botnet_price = 0.1;
let gate_price = 0.01;

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
	let killkill = false;
	let killkillpin = false;
	let mine_per_min = 0;
	let login = '';
	let nick = '';
	let tor = false;

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

	let killing;

	mining.pause();

	let virus_unpack = false;
	let virusUnpack; 
	let virusTimeout;
	let virus_pin = '';
	let virus_hash = '';



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
			} else if ( site && !tor ) {
				help_data = communicates.help('openw');
			} else if ( site && tor ) {
				help_data = communicates.help('opent');
			}
			socket.emit("communicate", {data: help_data});
		},
		morehelp : function() {
			socket.emit("open-help");
		},
		clear : function(){
			socket.emit('clear');
		},
		connect : function(option, user, blank){
			let tmp = hash.encrypt(user);
			if ( connection ) {
				socket.emit("communicate", {data: communicates.communicates.already_connected});
			} else if ( site ) {
				socket.emit("communicate", {data: communicates.communicates.close_site_first});
			} else {
				//socket.emit('connection-stage-one');
				if ( !option ) {
					socket.emit('communicate', {data: communicates.communicates.wrong_command_use});
				} else {
					if ( option == '-d' ) { //d - direct
						directConnection(tmp);
					} else if ( option == '-f' ) { // f - force
						botnetAttack(tmp);
					} else {
						socket.emit('communicate', {data: communicates.communicates.wrong_command_use});
					}	
				}

			}
		},
		disconnect : function(blank) {
			if ( site ) {
				socket.emit("communicate", {data: communicates.communicates.close_site_first});
			} else {
				if ( connection ) {
					socket.leave(connection);
					socket.emit('communicate', {data: communicates.communicates.disconnect});
					connection = false;
					setPlace('');
				} else {
					socket.emit('communicate', {data: "Cannot Disconnect From Home"});					
				}
			}
		},
		open : function ( option, link , blank ) {
			if ( site ) {
				socket.emit("communicate", {data: communicates.communicates.already_connected});
			} else if ( connection ) {
				socket.emit("communicate", {data: communicates.communicates.disconnect_user_first});
			} else if ( bank ) {
				socket.emit("communicate", {data: communicates.communicates.account_close_first});
			} else {
				if ( option && link ) {
					if ( option == '-w' ) {
						if ( link.indexOf('www.') == 0  ) {
							socket.emit("communicate", {data: communicates.communicates.provide_url});
						} else {
							urlExists(link, function(err, exists) {
								if ( exists ) {
									site = link;
									socket.join(link);
									setPlace(site);
									socket.emit("communicate", {data: communicates.communicates.open+link});
								} else {
									socket.emit("communicate", {data: communicates.communicates.no_website+link});
								}
							});					
						}
					} else if ( option == '-t' ) {
						if ( link != onion_website ) { 
							socket.emit("communicate", {data: communicates.communicates.no_website+link});
						} else {
							tor = onion_website;
							site = onion_website;
							socket.join(link);
							setPlace(site);
							socket.emit("communicate", {data: communicates.communicates.open+link});
							socket.emit("communicate", {data: communicates.communicates.tor_connection});
						}
					}
				} else {
					socket.emit('communicate', {data: communicates.communicates.wrong_command_use});
				}
			}
		},
		close : function(blank, blank){
			if ( site ) {
				socket.emit("communicate", {data: communicates.communicates.closed});
				socket.leave(site);
				site = false;
				tor = false;
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
			if ( !tor ) {
				if ( !lis ) {
					if ( site ) {
						socket.emit('communicate' , {data: communicates.communicates.listen_process_begin});
						socket.emit('listen-process');
						lis = true;
						listening.resume();
					} else {
						socket.emit("communicate", {data: communicates.communicates.no_listen_process});
					}
				} else {
					socket.emit("communicate", {data: communicates.communicates.already_listening});
				}				
			} else {
				socket.emit("communicate", {data: communicates.communicates.cannot_listen_on_tor});
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
				bank = false;
				setPlace('');
			} else {
				socket.emit("communicate", {data: communicates.communicates.account_error});
			}	
		},
		balance : function() {
			if ( bank ) {
				databaseModule.showBalance(bank, function(data){
					socket.emit("communicate", {data: communicates.communicates.account_balance+data.toFixed(3)});
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
							databaseModule.addMoney(tmp, howmuch, function(data){
								databaseModule.addTransactionLog(bank,'Transfer to: '+hash.decrypt(tmp)+' completed. '+howmuch+'B');
								databaseModule.addTransactionLog(tmp,'Transfer recived from: '+hash.decrypt(bank)+'. '+howmuch+'B');
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
		rule : function(option, name){
			if ( !bank && !site ) {
				if ( option ) {
					if ( option == '-a' ) {
						if ( name ) {
							databaseModule.checkIfNickExists(hash.encrypt(name), function(res){
								if ( res ) {
									databaseModule.addAuthorizedConnection(hash.encrypt(name), bank, function(res){
										socket.emit("communicate", {data: communicates.communicates.add_auth_connection});
									});											
								} else {
									socket.emit('communicate', {data: communicates.communicates.no_nick});
								}
							});							
						} else {
							socket.emit('communicate', {data: communicates.communicates.wrong_command_use});
						}
		
					} else if ( option == '-r' ) {
						if ( name ) {
							databaseModule.removeAuthorizedConnection(hash.encrypt(name), bank, function(res){
								socket.emit("communicate", {data: communicates.communicates.remove_auth_connection});
							});	
						} else {
							socket.emit('communicate', {data: communicates.communicates.wrong_command_use});
						}
				
					} else if ( option == '-s' ) {
						databaseModule.showAuthorizedConnection(bank, function(res){
							let reso = 'Connection Allowed For: </br></br>';
							for ( let i = 0 ; i < res.length ; i ++ ) {
								reso += hash.decrypt(res[i].nick)+"</br>";
							}
							res += "</br></br>";
							socket.emit('communicate', {data: reso});
						});	
					} else {
						socket.emit('communicate', {data: communicates.communicates.wrong_command_use});
					}
				} else {
					socket.emit('communicate', {data: communicates.communicates.wrong_command_use});
				}				
			} else {
				socket.emit("communicate", {data: communicates.communicates.rule_error_wrong_place});
			}
		},
		logs : function(){
			if ( bank ) {
				databaseModule.showTransactionLogs(bank, function(res){
					let reso = '=============================== LOGS ===============================</br></br>';
					for ( let i = 0 ; i < res.length ; i ++ ){
						reso += res[i].time+" : "+res[i].info+"</br></br>";
					}
					reso += "====================================================================</br></br>";
					socket.emit('communicate', {data: reso});
				});
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
			socket.emit('set-memo', {data:socket.id});
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
			} else {

			}
		},
		buy : function( option , howmany ) {
			if ( tor ) {
				if ( option && howmany ) {
					if ( option == '-b' ) {
						//buy botnet
						databaseModule.showBalance(home, function(res){
							if ( howmany * botnet_price <= res ) {
								databaseModule.getMoney(home, (howmany*botnet_price), function(res){
									databaseModule.addBotnetPoints(home, howmany, function(res){
										socket.emit('communicate', {data: communicates.communicates.transaction_success});
										databaseModule.addTransactionLog(home, 'TOR website. Artificial Connections Quantity: '+howmany+'. '+howmany*botnet_price+'B');
									});
								});
							} else {
								socket.emit('communicate', {data: communicates.communicates.not_enough_money});
							}
						});
					} else if ( option == '-g' ) {
						// buy gate
						databaseModule.showBalance(home, function(res){
							if ( howmany * gate_price <= res ) {
								databaseModule.getMoney(home, (howmany*gate_price), function(res){
									databaseModule.addGatePoints(home, howmany, function(res){
										socket.emit('communicate', {data: communicates.communicates.transaction_success});
										databaseModule.addTransactionLog(home, 'TOR website. Gate Connections Resistance Quantity: '+howmany+'. '+howmany*gate_price+'B');
									});
								});
							} else {
								socket.emit('communicate', {data: communicates.communicates.not_enough_money});
							}
						});
					} else {
						socket.emit('communicate', {data: communicates.communicates.wrong_command_use});
					}
				} else {
					socket.emit('communicate', {data: communicates.communicates.wrong_command_use});
				}				
			} else {
				socket.emit('communicate' , {data: communicates.communicates.connect_to_tor_website_first});
			}
		},
		system : function(){
			if ( bank ) {
				socket.emit("communicate", {data: communicates.communicates.account_close_first});
			} else {	
				let stats = '</br>~~~~~~~~~~~~~~~~ SYSTEM ~~~~~~~~~~~~~~~~</br></br>';
				if ( connection ) {
					databaseModule.systemStats(connection, function(res){
						let num = hash.decrypt(res.pin);
						let binpin = hash.simpleEncrypt(binaryModule.makeBinary(num, 1, 2, 4), 'des3');
						stats += "Hashed Nick : "+hash.simpleEncrypt(hash.decrypt(res.nick), 'des3')+"</br></br>";
						stats += "Hashed Binary Pin Representation: "+binpin+"</br></br>";
						stats += "Hashed Botnet Artificial Connections : "+hash.simpleEncrypt(res.botnet.toString(), 'des3')+"</br></br>";
						stats += "Hashed Gate Connections Resistance : "+hash.simpleEncrypt(res.brama.toString(), 'des3')+"</br></br>";
						socket.emit('communicate', {data: stats});
						socket.emit('set-memo',{data:binpin});
					});
				} else {
					let socks = '';
					for ( let i in io.sockets.adapter.rooms[socket.id].sockets ) {
						socks += i+"</br>";
						socket.emit('set-memo',{data:i});					
					}
					databaseModule.systemStats(home, function(res){
						let num = hash.decrypt(res.pin);
						stats += "Nick : "+hash.decrypt(res.nick)+"</br></br>";
						stats += "Binary Pin Representation : "+binaryModule.makeBinary(num, 1, 2, 4)+"</br></br>";
						stats += "Botnet Artificial Connections : "+res.botnet.toString()+"</br></br>";
						stats += "Gate Connections Resistance : "+res.brama.toString()+"</br></br>";
						stats += "=== List Of Connected users ===</br></br>"+socks+"</br></br>";
						socket.emit('communicate', {data: stats});
					});
				}
			}
		},
		decrypt : function(option, cipher){
			if ( option && cipher ) {
				let res = '';
				if ( option == 'aes128' ) {
					//simple decrypt
					res = hash.simpleDecrypt(cipher.toString(), 'aes128');
				} else if ( option == 'aes192' ) {
					res = hash.simpleDecrypt(cipher.toString(), 'aes192');
				} else if ( option == 'aes256' ) {
					res = hash.simpleDecrypt(cipher.toString(), 'aes256');
				} else if ( option == 'des3' ) {
					res = hash.simpleDecrypt(cipher.toString(), 'des3');
				} else {
					socket.emit('communicate', {data: communicates.communicates.not_supported_decryption});
				}
				if ( res ) {
					socket.emit('communicate', {data: res});
					socket.emit('set-memo', {data: res});
				} else {
					socket.emit('communicate', {data: communicates.communicates.decrypt_error});					
				}
			} else {
				socket.emit('communicate', {data: communicates.communicates.wrong_command_use});
			}
		},
		unpack : function(option, virus, pin, cipher) {
			if ( option == '-s' ) {
				if ( virus && pin && cipher ) {
					if ( pin.length == 3 ) {
						let binpin = binaryModule.makeBinary(parseInt(pin),1,2,4);
						let cip = hash.simpleEncrypt(virus+" "+binpin+" "+cipher, cipher);
						if ( cip ) {
							if ( connection ) {
								databaseModule.checkVirus(hash.encrypt(virus), function(res) {
									if ( res && res.state == 0 ) {
										databaseModule.checkIfSocketInfected(connection, function(res1) {
											if ( res1 ) {
												runVirus(res, connection, pin);
												io.sockets.connected[hash.decrypt(connection)].emit('communicate',{data: cip});
												socket.emit('set-memo',{data:cip});
												io.sockets.connected[hash.decrypt(connection)].emit('communicate',{data: communicates.communicates.virus_block_help});
												io.sockets.connected[hash.decrypt(connection)].emit('communicate',{data: communicates.communicates.virus_unpack_info});
											} else {
												socket.emit('communicate', {data: communicates.communicates.user_already_infected});
											}
										});
									} else {
										socket.emit('communicate', {data: communicates.communicates.virus_error});
									}
								});
							} else {
								databaseModule.checkVirus(hash.encrypt(virus), function(res) {
									if ( res && res.state == 0 ) {
										databaseModule.checkIfSocketInfected(connection, function(res1) {
											if ( res1 ) {
												runVirus(res, home, pin);
												socket.emit('communicate',{data: cip});
												io.sockets.connected[socket.id].emit('communicate',{data: communicates.communicates.virus_block_help});
												io.sockets.connected[socket.id].emit('communicate',{data: communicates.communicates.virus_unpack_info});
											} else {
												socket.emit('communicate', {data: communicates.communicates.user_already_infected});
											}
										});
									} else {
										socket.emit('communicate', {data: communicates.communicates.virus_error});
									}
								});
							}								
						} else {
							socket.emit('communicate', {data: communicates.communicates.decrypt_error});
						}
					} else {
						socket.emit('communicate', {data: communicates.communicates.enter_new_pin});
					}
				} else {
					socket.emit('communicate', {data: communicates.communicates.wrong_command_use});
				}
			} else if ( option == '-a' ) {
				if ( virus && pin ) {
					if ( pin.length == 3 ) {
						stopVirus(pin);
					} else {
						socket.emit('communicate', {data: communicates.communicates.enter_new_pin});
					}
				} else {
					socket.emit('communicate', {data: communicates.communicates.wrong_command_use});
				}
			} else {
				socket.emit('communicate', {data: communicates.communicates.wrong_command_use});
			}
		},
		kill : function( option, socketo, pin, hasho ) {
			if ( option ) {
				if ( option == '-s' ) {
					if ( socketo && pin && hasho ) {
						let point = connection ? connection : home;
						hashFunction(hasho, pin, function(response) {
							if ( response ) {
								io.in(hash.decrypt(point)).emit('communicate', {data: response});
								socket.broadcast.to(socketo).emit('set-memo', {data: response});
								io.in(hash.decrypt(point)).emit('communicate',{data: "Process: "+socketo+" will be killed in 20sec."});
								socket.broadcast.to(socketo).emit('kill-start', {data:pin});
							} else {
								socket.emit('communicate', {data: communicates.communicates.wrong_command_use});
							}
						});
					} else {
						
					}
				} else if ( option == '-a' ) {
					if ( socketo && pin ) {
						if ( pin == killkillpin ) {
							killing.pause();
							killkill = false;
							killing = false;
							socket.emit('communicate', {data: communicates.communicates.killing_abort});
						}
					} else {
						socket.emit('communicate', {data: communicates.communicates.wrong_command_use});
					}
				} else {
					console.log("dupa");
				}			
			} else {
				socket.emit('communicate', {data: communicates.communicates.wrong_command_use});
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
		virusTimeout = false;
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
			databaseModule.checkIfNickExists(tmp_nick, function(res) {
				if ( res ) {
					socket.emit("communicate", {data: communicates.communicates.nick_exists});
					socket.emit('register-nick');
				} else {
				wait_for_email_response = false;
				databaseModule.registerAccount(tmp_login, tmp_pass, tmp_email, tmp_nick); 
				socket.emit("communicate", {data: communicates.communicates.register_success});
				socket.emit("comm");
				tmp_login = '';
				tmp_email = '';
				tmp_pass = '';
				tmp_nick = '';					
				}
			});
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
					databaseModule.setSocketIdToAccount(login,hash.encrypt(socket.id), function(){
						databaseModule.getNickFromSocket(hash.encrypt(socket.id), function(e){
							nick = e;
						});
						databaseModule.checkVirusBySocketId(home, function(res){
							if ( res ) {
								virus_pin = res.pin;
								virus_hash = res.hashval;
								socket.emit('virus-start',{dur: res.duration, url: res.url, type: res.type});
								virusTimeout = setTimeout(function(){
									databaseModule.destroyVirus(res.hashval);
									socket.emit('virus-stop');
								}, res.duration);
								
							}
						});				
					});
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
	socket.on('kill-start-response', function(data) {
		if ( !killkill ) {
			killkill = true;
			killkillpin = data.data;
			killing = pause.setTimeout(function() {
				if ( killkill ) {
					if ( connection ) {
						io.in(hash.decrypt(connection)).emit('communicate', {data: communicates.communicates.killing_success});
					}
					commands.disconnect();
				}
			},20000);			
		} else {
			io.in(hash.decrypt(connection)).emit('communicate', {data: communicates.communicates.killing_running});
		}

	});
	function hashFunction(type, value, callback){
		let res = '';
		if ( type == 'aes128' ) {
			//simple decrypt
			res = hash.simpleEncrypt(value, 'aes128');
			callback(res);			
		} else if ( type == 'aes192' ) {
			res = hash.simpleEncrypt(value, 'aes192');
			callback(res);
		} else if ( type == 'aes256' ) {
			res = hash.simpleEncrypt(value, 'aes256');
			callback(res);
		} else if ( type == 'des3' ) {
			res = hash.simpleEncrypt(value, 'des3');
			callback(res);
		} else {
			callback(false);
		}
	}
	function  veryfiCommand(data) {
		command = [];
		command = data.command.split(" ");
		commands[command[0]] ? commands[command[0]](command[1],command[2],command[3],command[4]) : socket.emit("communicate", {data: communicates.communicates.no_command+data.command});
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
				let fhash = hash.simpleEncrypt(rarray[rand],'des3');
				socket.emit("communicate", {data: communicates.communicates.found_hash+fhash});
				socket.emit('set-memo', {data:fhash});
			} else {
				socket.emit("communicate", {data: communicates.communicates.room_empty});
			}
			socket.emit('listen-end');
			lis = false;
		}				
	}
	function mineFunc(){
		databaseModule.checkBotnetPoints(home, function(res){
			let mv = mine_per_min + (mine_per_min * res/10);
			mv = Math.round(mv*1000)/1000;
			databaseModule.addMoney(home,mv, function(){
				socket.emit("communicate", {data: "You mined: "+mv+" bitcoin."});
			});
			if ( percentageChance(1) ) {
				let uuid = hash.random(8);
				let v = virusModule.randomVirus();
				databaseModule.addVirus(hash.encrypt(uuid),v.duration,v.type,v.url,function(res){
					socket.emit("communicate", {data: "You mined virus: "+uuid});
				});
			}
		})

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
	function botnetAttack(tmp){
		//preform botnet attack
		socket.emit('communicate', {data: communicates.communicates.preparing_botnet});
		let botnet_strength = 0;
		let gate_strength = 0;
		databaseModule.checkBotnetPoints(home, function(res0){
			setTimeout(function(){
				if ( res0 ) {
					botnet_strength = res0;
					socket.emit('communicate', {data: communicates.communicates.botnet_ready});
					socket.emit("communicate", {data: communicates.communicates.connection_stage_one_try});
					databaseModule.checkIfSocketInDatabase(tmp , function(res1){
						setTimeout(function(){
							if ( res1 > 0 ) {
								socket.emit('communicate', {data: communicates.communicates.connection_stage_one_success});
								socket.emit('communicate', {data: communicates.communicates.botnet_attack_start});
								databaseModule.checkGatePoints(tmp, function(res2) {
									gate_strength = res2;
									socket.emit('communicate', {data: communicates.communicates.botnet_attack_finished});
									if ( botnet_strength >= gate_strength ) {
										databaseModule.removeBotnetPoints(home, gate_strength, function(res3){
											socket.emit('communicate', {data: communicates.communicates.botnet_points_removed+gate_strength});
											databaseModule.removeGatePoints(tmp, gate_strength , function(res4){
												socket.emit('communicate', {data: communicates.communicates.gate_status+"0"});
											});
										});
									} else {
										databaseModule.removeBotnetPoints(home, botnet_strength, function(res3){
											socket.emit('communicate', {data: communicates.communicates.botnet_points_removed+botnet_strength});
											databaseModule.removeGatePoints(tmp, botnet_strength , function(res4){
												socket.emit('communicate', {data: communicates.communicates.gate_status+(gate_strength - botnet_strength)})
											});
										});
									}
								});
							} else {
								socket.emit('communicate', {data: communicates.communicates.no_such_connection});
								//end
							}
						},3000);
					});					
				} else {
					socket.emit('communicate', {data: communicates.communicates.no_such_connection});
				}

			},3000);
		});
	}
	function directConnection(tmp){
		socket.emit('communicate', {data: communicates.communicates.connection_stage_one_try});
		setTimeout(function(){
			if ( checkIfRoomExist(hash.decrypt(tmp)) ) {
				socket.emit('communicate', {data: communicates.communicates.connection_stage_one_success});
				//socket.emit('connection-stage-two');
				socket.emit('communicate', {data: communicates.communicates.connection_stage_two_try});
				setTimeout(function(){
					let tmp_gate_points;
					databaseModule.checkGatePoints(tmp, function(res0){
						if ( res0 > 0 ) {
							databaseModule.checkAuthorizedConnection(tmp , nick, function(res1) {
								if ( res1 ) {
									socket.emit('communicate', {data: communicates.communicates.connection_stage_two_success});
									socket.emit('communicate', {data: communicates.communicates.connection_pre_established});
									setTimeout(function(){
										connection = tmp;
										socket.join(hash.decrypt(tmp));
										socket.emit('communicate', {data: communicates.communicates.connection_established});
										socket.emit("communicate", {data: communicates.communicates.connected+hash.decrypt(connection)});
										io.sockets.connected[hash.decrypt(connection)].emit('communicate',{data: communicates.communicates.user_connected});
										setPlace('');
									},3000);
								} else {
									socket.emit('')
									databaseModule.removeGatePoints(tmp, 1,  function(res2){
										socket.emit("communicate", {data: communicates.communicates.connection_handshake_failed});
										socket.emit("communicate", {data: communicates.communicates.gate_status+(res0 - 1) });
									});												  
								}
							});
						} else {
							socket.emit('communicate', {data: communicates.communicates.connection_stage_two_success});
							socket.emit('communicate', {data: communicates.communicates.connection_pre_established});
							setTimeout(function(){
								connection = tmp;
								socket.join(hash.decrypt(tmp));
								socket.emit('communicate', {data: communicates.communicates.connection_established});
								socket.emit("communicate", {data: communicates.communicates.connected+hash.decrypt(connection)});
								io.sockets.connected[hash.decrypt(connection)].emit('communicate',{data: communicates.communicates.user_connected});
								setPlace('');
							},3000);
						}
					});
					
				},3000);			
			} else {
				socket.emit("communicate", {data: communicates.communicates.no_such_connection});
			}						
		},2000);
	}
	function runVirus(virus, user, pin){
		databaseModule.setPinToVirus(virus.hashval, pin, function() {
			databaseModule.addVirusToUser(virus.hashval, user, function(res) {
				databaseModule.changeVirusState(1, virus.hashval, function(res1) {
					//odpal timeout na zablokowanie
					virus_hash = virus.hasval;
					virus_unpack = true;					
					virusUnpack = pause.setTimeout(function() {
						if ( virus_unpack ) {
							virus_unpack = false;
							//odpal timeout na duration virusa.
							io.sockets.connected[hash.decrypt(user)].emit('virus-start',{dur: virus.duration, url: virus.url, type: virus.type});
							virusTimeout = setTimeout(function(){
								databaseModule.destroyVirus(virus.hashval);
								io.sockets.connected[hash.decrypt(user)].emit('virus-stop');
							}, virus.duration);
							
						}
					},45000);
				});
			});
		});
	}
	function stopVirus(pin){
		databaseModule.checkVirusPin(function(res){
			if ( pin == res ) {
				virus_unpack = false;
				virusUnpack.pause();
				databaseModule.destroyVirus(virus_hash);
				socket.emit('communicate', {data: communicates.communicates.virus_block_success});
			} else {
				socket.emit('communicate', {data: communicates.communicates.wrong_pin});
			}
		});
	}
});

server.listen(8000, function(){
	console.log("Server listening on port 8000...");
});
