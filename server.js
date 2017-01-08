let express = require('express');
let app = express();
let server = require('http').Server(app);
let io = require('socket.io')(server);
let path = require('path');
let urlExists = require('url-exists');

const communicates = {
	begin : "Hello",
	tip_01 : "",
	tip_02 : "",
	no_command : "No such command: ",
	connected : "Connected to: ",
	disconnect : "You have been disconnected. ",
	already_connected : "You are already connected somewhere.",
	no_connection : "No connection to close.",
	open : "Open success, connected to: ",
	no_website : "Cannot connect. No such website: ",
	closed : "Connection Closed.",	
	user_connected : "Unknown user has established a connection with you.",
	close_site_first : "Close connection to site first.",
	disconnect_user_first : "Disconnect from user first.",
	user_left : "Uknown user has left."
}

app.use(express.static(path.join(__dirname, '/public')));

app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');

let index = require(path.join(__dirname, '/routes/index.js'));

app.use('/',index);

io.on('connection', function(socket) {
	socket.join(socket.id);
	let home = socket.id;
	let connection = false;
	let site = false;
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
		commands[command[0]] ? commands[command[0]](command[1]) : socket.emit("communicate", {data: communicates.no_command+command});
	}
});

server.listen(8000, function(){
	console.log("Server listening on port 8000...");
});