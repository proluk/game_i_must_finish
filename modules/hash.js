//hash module
let crypt = require('crypto');
    let algorithm = 'aes-256-ctr';
    let password = 'ap0s9dap0s9diu';

    let simple_pass = 'easypizy01';

function encrypt(text){
  if ( text ) {
    let cipher = crypt.createCipher(algorithm,password);
    let crypted = cipher.update(text,'utf8','hex');
    crypted += cipher.final('hex');
    return crypted;
  }  
} 

function decrypt(text){
  if ( text ) {
    let decipher = crypt.createDecipher(algorithm,password);
    let dec = decipher.update(text,'hex','utf8');
    dec += decipher.final('utf8');
    return dec;
  }
}

function simpleEncrypt(text, option){
  try {
    let cipher = crypt.createCipher(option,simple_pass);
    let crypted = cipher.update(text,'utf8','hex');
    crypted += cipher.final('hex');
    return crypted;
  } catch (e) {
    return false;
  }   
}
function simpleDecrypt(text, option){
  try {
    let decipher = crypt.createDecipher(option,simple_pass);
    let dec = decipher.update(text,'hex','utf8');
    dec += decipher.final('utf8');
    return dec;
  } catch (e) {
    return false;
  }   
}

module.exports.simpleEncrypt = simpleEncrypt;
module.exports.simpleDecrypt = simpleDecrypt;
module.exports.encrypt = encrypt;
module.exports.decrypt = decrypt;