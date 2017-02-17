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
function registerAccount(login,password,email,nick) {
    connection.getConnection(function(error,connection){
        if(!error){
            connection.query('INSERT INTO account (id,login,password,email,nick,money,pin,brama,botnet,socket) VALUES (null,?,?,?,?,0,173763,0,0,null);',[login,password,email,nick],function(err, results){
                if( err ) {
                    console.log(err);
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
function checkIfNickExists(nick, callback){
    connection.getConnection(function(error,connection){
        if(!error){
            connection.query('SELECT COUNT(nick) AS c FROM account WHERE nick=?;',[nick],function(err, results){
                connection.release();
                if ( err ) {
                    callback(false);
                    console.log(err);
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
            return 'checkIfNickExists database module getConnection error';
        }
    });
}
function checkIfSocketInDatabase(socket, callback){
    connection.getConnection(function(error,connection){
        if(!error){
            connection.query('SELECT COUNT(socket) AS c FROM account WHERE socket=?;',[socket],function(err, results){
                connection.release();
                if ( err ) {
                    return err;
                    callback(0);
                } else {
                    callback(results[0].c);
                }
            });
        } else {
            return 'checkIfNickExists database module getConnection error';
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

function setSocketIdToAccount(login, id, callback){
    connection.getConnection(function(error, connection){
        if( !error ) {
            connection.query('UPDATE account SET socket = ? WHERE login = ?;',[id,login],  function(err, results) {
                if ( err ) {
                    return err;
                } else {
                    callback();
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
                     if( results[0] ) {
                        callback(true, results[0].bitpermin);
                    } else {
                        callback(false, results[0]);
                    }
                }
            });
        } else {
            console.log('checMine database module getConnection error');
        }
        connection.release();
    });
}

function checkPin(url, callback) {
    connection.getConnection(function(error, connection){
        if(!error){
            connection.query('SELECT pin FROM account WHERE socket = ?', [url], function(err, results){
                if ( err ) {
                    return err;
                } else {
                    callback(results[0].pin);
                }
            });
        } else {
            console.log('checMPin database module getConnection error');
        }
        connection.release();
    });
}
function setPin(url, pin, callback) {
    connection.getConnection(function(error, connection){
        if(!error){
            connection.query('UPDATE account SET pin = ? WHERE socket = ?', [pin,url], function(err, results){
                if ( err ) {
                    console.log(err);
                    callback(false);
                } else {
                    callback(true);
                }
            });
        } else {
            console.log('setPin database module getConnection error');
        }
        connection.release();
    });
}
function addBotnetPoints(socket, howmany, callback){
    connection.getConnection(function(error, connection){
        if ( !error ) {
            connection.query('UPDATE account SET botnet = botnet + ? WHERE socket = ?', [howmany, socket], function(err, results){
                if ( err ) {
                    console.log(err);
                    callback(false);
                } else {
                    callback(true);
                }
            });
        } else {
            console.log("addBotnetPoints database module getConnection error");
        }
        connection.release();
    });

}
function removeBotnetPoints(socket, howmany, callback){
    connection.getConnection(function(error, connection){
        if ( !error ) {
            connection.query('UPDATE account SET botnet = botnet - ? WHERE socket = ?', [howmany, socket], function(err, results){
                if ( err ) {
                    console.log(err);
                    callback(false);
                } else {
                    callback(true);
                }
            });
        } else {
            console.log("removeBotnetPoints database module getConnection error");
        }
        connection.release();
    });
}
function checkBotnetPoints(socket , callback ){
    connection.getConnection(function(error, connection){
        if ( !error ) {
            connection.query('SELECT botnet AS b FROM account WHERE socket = ?', [socket], function(err, results){
                if ( err ) {
                    console.log(err);
                    callback(false);
                } else {
                    callback(results[0].b);
                }
            });
        } else {
            console.log("removeGatePoints database module getConnection error");
        }
        connection.release();
    });   
}
function addGatePoints(socket, howmany, callback){
    connection.getConnection(function(error, connection){
        if ( !error ) {
            connection.query('UPDATE account SET brama = brama + ? WHERE socket = ?', [howmany, socket], function(err, results){
                if ( err ) {
                    console.log(err);
                    callback(false);
                } else {
                    callback(true);
                }
            });
        } else {
            console.log("addGatePoints database module getConnection error");
        }
        connection.release();
    });
}
function removeGatePoints(socket, howmany, callback){
    connection.getConnection(function(error, connection){
        if ( !error ) {
            connection.query('UPDATE account SET brama = brama - ? WHERE socket = ?', [howmany, socket], function(err, results){
                if ( err ) {
                    console.log(err);
                    callback(false);
                } else {
                    callback(true);
                }
            });
        } else {
            console.log("removeGatePoints database module getConnection error");
        }
        connection.release();
    });
}
function checkGatePoints(socket, callback) {
    connection.getConnection(function(error, connection){
        if ( !error ) {
            connection.query('SELECT brama AS b FROM account WHERE socket = ?', [socket], function(err, results){
                if ( err ) {
                    console.log(err);
                    callback(false);
                } else {
                    callback(results[0].b);
                }
            });
        } else {
            console.log("removeGatePoints database module getConnection error");
        }
        connection.release();
    });
}
function getNickFromSocket ( socket , callback ) {
    connection.getConnection(function(error, connection){
        if ( !error ) {
            connection.query('SELECT nick AS n FROM account WHERE socket = ?', [socket], function(err, results){
                if ( err ) {
                    console.log(err);
                    callback(false);
                } else {
                    callback(results[0].n);
                }
            });
        } else {
            console.log("removeGatePoints database module getConnection error");
        }
        connection.release();
    });
}
function checkAuthorizedConnection(ine , name, callback){
    connection.getConnection(function(error, connection){
        if ( !error ) {
            connection.query('SELECT COUNT(a.id) AS res FROM account AS a INNER JOIN authorizedConnections AS ac ON a.id = ac.id WHERE a.socket = ? AND ac.nick = ?', [ine , name], function(err , results){
                if ( err ) {
                    console.log(err);
                    return err;
                } else {
                    if ( results[0].res > 0 ) {
                        callback(true);
                    } else {
                        callback(false);
                    }
                }
            });            
        } else {
            console.log("checkAuthorizedConnection database module getConnection error");
        }
        connection.release();
    });
}
function addAuthorizedConnection(name, socket, callback){
    connection.getConnection(function(error, connection){
        if ( !error ) {
            connection.query('INSERT INTO authorizedConnections (id, nick) SELECT ( SELECT id FROM account WHERE socket = ? ) , ( SELECT nick FROM account WHERE nick = ? ) ;', [socket, name], function(err , results){
                if ( err ) {
                    callback(false);
                    console.log(err);
                    return err;
                } else {
                    callback(true);
                }
            });     
        } else {
            console.log("addAuthorizedConnection database module getConnection error");
        }
        connection.release();
    });
}
function removeAuthorizedConnection(name, socket, callback){
    connection.getConnection(function(error, connection){
        if ( !error ) {
            connection.query('DELETE FROM authorizedConnections WHERE id = (SELECT id FROM account WHERE socket = ?) AND nick = (SELECT nick FROM account WHERE nick = ? )', [socket, name], function(err , results){
                if ( err ) {
                    callback(false);
                    console.log(err);
                    return err;
                } else {
                    callback(true);
                }
            });  
        } else {
            console.log("removeAuthorizedConnection database module getConnection error");
        }
        connection.release();
    });
}
function showAuthorizedConnection(socket, callback){
    connection.getConnection(function(error, connection){
        if ( !error ) {
            connection.query('SELECT nick FROM authorizedConnections WHERE id = (SELECT id FROM account WHERE socket = ?)', [socket], function(err , results){
                if ( err ) {
                    callback(false);
                    console.log(err);
                    return err;
                } else {
                    callback(results);
                }
            });  
        } else {
            console.log("removeAuthorizedConnection database module getConnection error");
        }
        connection.release();
    });   
}
function systemStats(socket, callback){
    connection.getConnection(function(error, connection){
        if ( !error ) {
            connection.query('SELECT nick, pin, botnet, brama FROM account WHERE socket = ?', [socket], function(err , results){
                if ( err ) {
                    console.log(err);
                    callback(false);
                    return err;
                } else {
                    callback(results[0]);
                }
            });            
        } else {
            console.log("checkAuthorizedConnection database module getConnection error");
        }
        connection.release();
    });
}
function showTransactionLogs(socket, callback){
    connection.getConnection(function(error, connection){
        if ( !error ) {
            connection.query('SELECT DATE_FORMAT(time,"%H:%i:%S") time, info FROM transaction_logs WHERE id = (SELECT id FROM account WHERE socket = ?)', [socket], function(err, results){
                if ( err ) {
                    callback(false);
                    console.log(err);
                    return err;
                } else {
                    callback(results);
                }
            });
        } else {
            console.log("showTransactionLogs database module getConnection error");
        }
        connection.release();
    });
}
function addTransactionLog(socket,info){
    connection.getConnection(function(error, connection){
        if ( !error ) {
            connection.query('INSERT INTO transaction_logs (id,time,info) SELECT ( SELECT id FROM account WHERE socket = ?), null , ?', [socket,info], function(err, results){
                if ( err ) {
                    console.log(err);
                    return err;
                } 
            });
        } else {
            console.log("addTransactionLog database module getConnection error");
        }
        connection.release();
    });
}

module.exports.addTransactionLog = addTransactionLog;
module.exports.showTransactionLogs = showTransactionLogs;
module.exports.showAuthorizedConnection = showAuthorizedConnection;
module.exports.addAuthorizedConnection = addAuthorizedConnection;
module.exports.removeAuthorizedConnection = removeAuthorizedConnection;
module.exports.systemStats = systemStats;
module.exports.checkBotnetPoints = checkBotnetPoints;
module.exports.checkIfSocketInDatabase = checkIfSocketInDatabase;
module.exports.getNickFromSocket = getNickFromSocket;
module.exports.checkGatePoints = checkGatePoints;
module.exports.checkAuthorizedConnection = checkAuthorizedConnection;
module.exports.addGatePoints = addGatePoints;
module.exports.removeGatePoints = removeGatePoints;
module.exports.addBotnetPoints = addBotnetPoints;
module.exports.removeBotnetPoints = removeBotnetPoints;
module.exports.setPin = setPin;
module.exports.checkPin = checkPin;
module.exports.checkMine = checkMine;
module.exports.showBalance = showBalance;
module.exports.setSocketIdToAccount = setSocketIdToAccount;
module.exports.addMoney = addMoney;
module.exports.getMoney = getMoney;
module.exports.login = login;
module.exports.registerAccount = registerAccount;
module.exports.checkIfNickExists = checkIfNickExists;
module.exports.checkIfEmailExists = checkIfEmailExists;
module.exports.checkIfLoginExists = checkIfLoginExists;
module.exports.registerAccount = registerAccount;
