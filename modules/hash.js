//hash module
let crypt = require('crypto');
    let algorithm = 'aes-256-ctr';
    let password = 'ap0s9dap0s9diu';

    let simplePassword = 'easypizymd5';

function encrypt(text){
  if ( text ) {
    let cipher = crypt.createCipher(algorithm,password);
    let crypted = cipher.update(text.toString(),'utf8','hex');
    crypted += cipher.final('hex');
    return crypted;
  }  
} 

function decrypt(text){
  if ( text ) {
    let decipher = crypt.createDecipher(algorithm,password);
    let dec = decipher.update(text.toString(),'hex','utf8');
    dec += decipher.final('utf8');
    return dec;
  }
}

function simpleEncrypt(text){
  if ( text ) {
    let cipher = crypt.createCipher(algorithm,simplePassword);
    let crypted = cipher.update(text.toString(),'utf8','hex');
    crypted += cipher.final('hex');
    return crypted;
  }  
}
function simpleDecrypt(text){
  if ( text ) {
    let decipher = crypt.createDecipher(algorithm,simplePassword);
    let dec = decipher.update(text.toString(),'hex','utf8');
    dec += decipher.final('utf8');
    return dec;
  } 
}

module.exports.simpleEncrypt = simpleEncrypt;
module.exports.simpleDecrypt = simpleDecrypt;
module.exports.encrypt = encrypt;
module.exports.decrypt = decrypt;