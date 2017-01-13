let express = require('express');
let app = express();
let server = require('http').Server(app);
let io = require('socket.io')(server);
let path = require('path');
let urlExists = require('url-exists');
const communicates = require('./modules/communicates.js');

app.use(express.static(path.join(__dirname, '/public')));

app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');

let index = require(path.join(__dirname, '/routes/index.js'));

app.use('/',index);

io.on('connection', function(socket) {
	socket.join(socket.id);
	let money = 0;
	let home = socket.id;
	let connection = false;
	let ssh = false;
	let site = false;
	//commands
	let commands = {
		connect : function(user, blank){
			if ( connection ) {
				socket.emit("communicate", {data: communicates.already_connected});
			} else if ( site ) {
				socket.emit("communicate", {data: communicates.close_site_first});
			} else {
				connection = user;
				socket.join(connection);
				io.sockets.connected[connection].emit("communicate", {data: communicates.user_connected});
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
			if ( command ) {
				if( command === ''){
					
				}
			}
		},
		balance : function() {
			ssh ? socket.emit("communicate", {data: communicates.account_balance+money}) : socket.emit("communicate", {data: communicates.account_error});
		}


	}

	let command = [];

	socket.emit("communicate", {data: communicates.begin});

	socket.on("command", function(data) {
		veryfiCommand(data);
	});
	socket.on("disconnect", function(socket) {
		console.log("socket disconnected");
	});

	function  veryfiCommand(data) {
		command = data.command.split(" ");
		commands[command[0]] ? commands[command[0]](command[1],command[2]) : socket.emit("communicate", {data: communicates.no_command+data.command});
	}
});

server.listen(8000, function(){
	console.log("Server listening on port 8000...");
});