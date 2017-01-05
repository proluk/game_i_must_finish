let express = require('express');
let app = express();
let server = require('http').Server(app);
let io = require('socket.io')(server);

app.get("/", function(req,res) {
	res.send("Hello hackerman!");
});

io.on('connection', function(socket) {
	console.log('socket connected');
});


server.listen(8000, function(){
	console.log("Server listening on port 8000...");
});