//node module

function generateLogin(){
	let login = randString(6);
	return login;
}

function generateAddress(){
	let address = randString(12);
	return address;
}

function deleteNode(){
	//database module
}

function makeNewNode(){
	//generate login
	//generate address
	//combine
	//database module
}

function randString(length) {
    let text = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
	for( let i=0; i < length ; i++ ) {
	    text += possible.charAt(Math.floor(Math.random() * possible.length));
	}    	
    return text;
}
