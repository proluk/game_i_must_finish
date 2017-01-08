let express = require('express');
let app = express();
let server = require('http').Server(app);
let io = require('socket.io')(server);
let path = require('path');

const communicates = {
	begin : "Hello",
	no_command : "No such command: ",
	connected : "Connected to: ",
	closed : "Connection Closed.",
	no_connection : "No connection to close.",
	already_connected : "You are already connected somewhere."
}

app.use(express.static(path.join(__dirname, '/public')));

app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');

let index = require(path.join(__dirname, '/routes/index.js'));

app.use('/',index);

io.on('connection', function(socket) {
	console.log('socket connected');
	let site = false;
	let commands = {
		connect : function(link){
			if ( site ) {
				socket.emit("communicate", {data: communicates.already_connected});
			} else {
				let adjusted_link = verifyLink(link);
				if(adjusted_link) {
					site = adjusted_link;
					socket.emit("communicate", {data: communicates.connected+adjusted_link});	
					socket.join(adjusted_link);								
				}
			}
		},
		close : function(blank){
			if ( site ) {
				socket.emit("communicate", {data: communicates.closed});
				socket.leave(site);
				site = false;
			} else {
				socket.emit("communicate", {data: communicates.no_connection});
			}
		},
		show : function(blank) {
			let inrooms = io.sockets.clients("https://facebook.com");
			for ( let i = 0 ; i < inrooms.length ; i ++ ) {
				console.log("test");
				socket.emit("communicate", {data: i+" : "+inrooms[i]});
			}
		}
	}
	let command = [];

	socket.emit("communicate", {data: communicates.begin});

	socket.on("command", function(data) {
		veryfiCommand(data);
	});

	function  veryfiCommand(data) {
		command = data.command.split(" ");
		commands[command[0]] ? commands[command[0]](command[1]) : socket.emit("communicate", {data: communicates.no_command+command});
	}
	function verifyLink(link) {
		let string = link.toLowerCase().replace("http", "https").replace("www.","https://"); 
		if(string.indexOf("https")===0){
			return string;
		} else {
			return false;
		}
	}
});

server.listen(8000, function(){
	console.log("Server listening on port 8000...");
});