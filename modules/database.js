let mysql = require('mysql');
let connection = mysql.createPool(
    {
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'baza'
    }
);

function login(login, password, callback) {
    connection.getConnection(function(error,connection){
        if(!error){
            connection.query('SELECT COUNT(id) AS c FROM Account WHERE login=? AND password=?;',[login,password],function(err, results){
                if ( err ) {
                    return err;
                } else {
                    if( results[0].c>0 ) {
                        callback(true);
                    } else {
                        callback(false);
                    }
                }
            });
        } else {
            return 'login database module getConnection error';
        }
    });
}
function registerAccount(login,password,email) {
    connection.getConnection(function(error,connection){
        if(!error){
            connection.query('INSERT INTO account (id,login,password,email,money,socket) VALUES (null,?,?,?,0,null);',[login,password,email],function(err, results){
                if( err ) {
                    return err;
                } else {
                    return true;
                }
            });
        } else {
            return 'registerAccount database module getConnection error';
        }
    });
}

function checkIfLoginExists(login, callback){
    connection.getConnection(function(error,connection){
        if(!error){
            connection.query('SELECT COUNT(*) AS c FROM account WHERE login=?',[login],function(err, results){
                if ( err ) {
                    return err;
                } else {
                    if( results[0].c > 0 ) {
                        callback(true);
                    } else {
                        callback(false);
                    }
                }
                connection.release();
            });
        } else {
            return 'checkIfLoginExists database module getConnection error';
        }
    });
}
function checkIfEmailExists(email){
    connection.getConnection(function(error,connection){
        if(!error){
            connection.query('SELECT COUNT(email) AS c FROM account WHERE email=?;',[email],function(err, results){
                connection.release();
                if ( err ) {
                    return err;
                } else {
                    if( results[0].c>0 ) {
                        return true;
                    } else {
                        console.log(results[0].c);
                        return false;
                    }
                }
            });
        } else {
            return 'checkIfEmailExists database module getConnection error';
        }
    });
}

function activateAccount(hash, callback) {
    connection.getConnection(function(error,connection){
        if(!error){
            connection.query('UPDATE account AS a INNER JOIN ActivateHash AS b ON a.id = b.id SET a.active = TRUE WHERE b.hash = ? ;',[hash],function(err, results){
                if ( err ) {
                    return err;
                } else {
                    return true;
                }
            });
        } else {
            return 'activateAccounts database module getConnection error';
        }
        connection.release();   
    });
}

function setSocketIdToAccount(login, id){
    connection.getConnection(function(error, connection){
        if( !error ) {
            connection.query('UPDATE account SET socket = ? WHERE login = ?;',[id,login],  function(err, results) {
                if ( err ) {
                    return err;
                } else {
                    return true;
                }
            });
        } else {
            console.log('setSocketIdToAccount database module getConnection error');
        } 
        connection.release();        
    });
}
function addMoney(to, howmuch, callback) {
    connection.getConnection(function(error,connection){
        if(!error){
            connection.query('UPDATE account SET money = money + ? WHERE socket = ?;', [howmuch,to], function(err, results) {
                if ( err ) {
                    console.log(err);
                    return err;
                } else {
                    callback(true);
                }
            });

        } else {
            console.log('addMoney database module getConnection error');
        }
        connection.release(); 
    });   
}

function getMoney(from, howmuch, callback) {
    connection.getConnection(function(error,connection){
        if(!error){
            connection.query('UPDATE account SET money = money - ? WHERE socket = ?', [howmuch,from], function(err, results) {
                if ( err ) {
                    return err;
                } else {
                    callback(true);
                }
            });
        } else {
            console.log('getMoney database module getConnection error');
        }
        connection.release();
    });
}

function showBalance(socket, callback){
    connection.getConnection(function(error,connection){
        if(!error){
            connection.query('SELECT money AS m FROM account WHERE socket = ?', [socket], function(err, results) {
                if ( err ) {
                    console.log(err);
                    return err;
                } else {
                    callback(results[0].m);
                }
            });
        } else {
            console.log('getMoney database module getConnection error');
        }
        connection.release();
    });      
}

function checkMine(url, callback) {
    connection.getConnection(function(error, connection){
        if(!error){
            connection.query('SELECT link, bitpermin FROM mines WHERE link = ?', [url], function(err, results){
                if(err){
                    return err;
                } else {
                     if( results[0].link ) {
                        callback(true, results[0].bitpermin);
                    } else {
                        callback(false, results[0].bitpermin);
                    }
                }
            });
        } else {
            console.log('checMine database module getConnection error');
        }
        connection.release();
    });
}

module.exports.checkMine = checkMine;
module.exports.showBalance = showBalance;
module.exports.setSocketIdToAccount = setSocketIdToAccount;
module.exports.addMoney = addMoney;
module.exports.getMoney = getMoney;
module.exports.login = login;
module.exports.registerAccount = registerAccount;
module.exports.checkIfEmailExists = checkIfEmailExists;
module.exports.checkIfLoginExists = checkIfLoginExists;
module.exports.registerAccount = registerAccount;
