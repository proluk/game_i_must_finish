//hash module
let crypt = require('crypto');
    let algorithm = 'aes-256-ctr';
    let password = 'ap0s9dap0s9diu';

function encrypt(text){
	let cipher = crypt.createCipher(algorithm,password)
	let crypted = cipher.update(text,'utf8','hex')
	crypted += cipher.final('hex');
	return crypted;
} 

function decrypt(text){
  let decipher = crypt.createDecipher(algorithm,password)
  let dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}

module.exports.encrypt = encrypt;
module.exports.decrypt = decrypt;