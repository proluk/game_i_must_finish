let mysql = require('mysql');
let connection = mysql.createPool(
    {
        host: 'localhost',
        user: 'gameserver',
        password: 'alweiq941',
        database: 'baza'
    }
);

function login(login, password, callback) {
    connection.getConnection(function(error,connection){
        if(!error){
            connection.query('SELECT COUNT(id) AS c FROM account WHERE login=? AND password=?;',[login,password],function(err, results){
                if ( err ) {
                    console.error(err);
                } else {
                    if( results[0].c>0 ) {
                        callback(true);
                    } else {
                        callback(false);
                    }
                }
                connection.release();
            });
        } else {
            console.error(error);
        }
    });
}
function registerAccount(login,password,email,nick) {
    connection.getConnection(function(error,connection){
        if(!error){
            connection.query('INSERT INTO account (id,login,password,email,nick,money,pin,brama,botnet,socket) VALUES (null,?,?,?,?,0,173763,0,0,null);',[login,password,email,nick],function(err, results){
                if( err ) {
                    console.log(err);
                } else {
                    return true;
                }
                connection.release();
            });
        } else {
            console.error(error);
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
            console.error(error);
        }
    });
}
function checkIfEmailExists(email){
    connection.getConnection(function(error,connection){
        if(!error){
            connection.query('SELECT COUNT(email) AS c FROM account WHERE email=?;',[email],function(err, results){
                connection.release();
                if ( err ) {
                    console.error(err);
                } else {
                    if( results[0].c>0 ) {
                        return true;
                    } else {
                        return false;
                    }
                }
            });
            connection.release();
        } else {
            console.error(error);
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
                    console.error(err);
                } else {
                    if( results[0].c>0 ) {
                        callback(true);
                    } else {
                        callback(false);
                    }
                }
            });
        } else {
           console.error(error);
        }
    });
}
function checkIfSocketInDatabase(socket, callback){
    connection.getConnection(function(error,connection){
        if(!error){
            connection.query('SELECT COUNT(socket) AS c FROM account WHERE socket=?;',[socket],function(err, results){
                connection.release();
                if ( err ) {
                    console.error(err);
                    callback(0);
                } else {
                    callback(results[0].c);
                }
            });
        } else {
            console.error(error);
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
           console.error(error);
        }
        connection.release();   
    });
}

function setSocketIdToAccount(login, id, callback){
    connection.getConnection(function(error, connection){
        if( !error ) {
            connection.query('UPDATE account SET socket = ? WHERE login = ?;',[id,login],  function(err, results) {
                if ( err ) {
                    console.error(err);
                } else {
                    callback();
                }
            });
        } else {
            console.error(error);
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
                    if ( results[0] ) {
                        callback(results[0].b); 
                    } else {
                        callback(false);
                    }
                    
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
                    console.error(err);
                    callback(false);
                } else {
                    callback(results[0].n);
                }
            });
        } else {
            console.error(error);
        }
        connection.release();
    });
}
function getSocketFromNick ( nick , callback ) {
    connection.getConnection(function(error, connection){
        if ( !error ) {
            connection.query('SELECT socket FROM account WHERE nick = ?', [nick], function(err, results){
                if ( err ) {
                    console.log(err);
                    callback(false);
                } else {
                    if ( results ) {
                        callback(results[0].socket);    
                    } else {
                        callback('sorry, unexpected error. oh well...'); 
                    }
                }
            });
        } else {
            console.log("getSocketFromNick database module getConnection error");
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
            connection.query('INSERT INTO authorizedconnections (id, nick) SELECT ( SELECT id FROM account WHERE socket = ? ) , ( SELECT nick FROM account WHERE nick = ? )', [socket, name], function(err , results){
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
            connection.query('DELETE FROM authorizedconnections WHERE id = (SELECT id FROM account WHERE socket = ?) AND nick = (SELECT nick FROM account WHERE nick = ? )', [socket, name], function(err , results){
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
            connection.query('SELECT nick FROM authorizedconnections WHERE id = (SELECT id FROM account WHERE socket = ?)', [socket], function(err , results){
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
                    console.error(err);
                    callback(false);
                    return err;
                } else {
                    callback(results[0]);
                }
            });            
        } else {
            console.error(error);
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
function checkVirus(virus, callback){
    connection.getConnection(function(error, connection){
        if ( !error ) {
            connection.query('SELECT * FROM virus WHERE hashval = ?', [virus], function(err, results){
                if ( err ) {
                    console.log(err);
                    callback(false);
                } else {
                    callback(results[0]);
                }
            });
        } else {
            console.log("addTransactionLog database module getConnection error");
        }
        connection.release();
    });   
}
function checkIfSocketInfected(socket, callback){
    connection.getConnection(function(error, connection){
        if ( !error ) {
            connection.query('SELECT COUNT(*) AS c FROM virus_acc WHERE acc_id = (SELECT id FROM account WHERE socket = ?)', [socket], function(err, results){
                if ( err ) {
                    console.log(err);
                    callback(false);
                } else {
                    if ( results[0].c > 0 ) {
                        callback(false);
                    } else {
                        callback(true);  
                    }
                    
                }
            });
        } else {
            console.log("addTransactionLog database module getConnection error");
        }
        connection.release();
    }); 
}
function addVirusToUser(virus, socket, callback){
    connection.getConnection(function(error, connection){
        if ( !error ) {
            connection.query('INSERT INTO virus_acc (acc_id,virus_id) SELECT (SELECT id FROM account WHERE socket = ?) , (SELECT id FROM virus WHERE hashval = ?)', [socket, virus], function(err, results){
                if ( err ) {
                    callback(false);
                } else {
                    callback(true);
                }
            });
        } else {
            console.log("addVirusToUser database module getConnection error");
        }
        connection.release();
    }); 
}
function changeVirusState(virus, state, callback){
    //state 0 = inactive, ready to use. state 1 = unpacking. state 2 = running.
    connection.getConnection(function(error, connection){
        if ( !error ) {
            connection.query('UPDATE virus SET state = ? WHERE hashval = ?', [state, virus], function(err, results){
                if ( err ) {
                    callback(false);
                } else {
                    callback(true);
                }
            });
        } else {
            console.log("changeVirusState database module getConnection error");
        }
        connection.release();
    });    
}
function setPinToVirus(virus, pin, callback) {
    connection.getConnection(function(error, connection){
        if ( !error ) {
            connection.query('UPDATE virus SET pin = ? WHERE hashval = ?', [pin, virus], function(err, results){
                if ( err ) {
                    callback(false);
                } else {
                    callback(true);
                }
            });
        } else {
            console.log("changeVirusState database module getConnection error");
        }
        connection.release();
    });   
}
function checkVirusBySocketId(socket, callback){
    connection.getConnection(function(error, connection){
        if ( !error ) {
            connection.query('SELECT * FROM virus WHERE id = (SELECT virus_id FROM virus_acc WHERE acc_id = (SELECT id FROM account WHERE socket = ?))', [socket], function(err, results){
                if ( err ) {
                    console.error(err);
                    callback(false);
                } else {
                    callback(results[0]);
                }
            });
        } else {
            console.error(error);
        }
        connection.release();
    });   
}
function checkVirusPin(virus, callback){
    connection.getConnection(function(error, connection){
        if ( !error ) {
            connection.query('SELECT pin FROM virus WHERE hashval = ?', [virus], function(err, results){
                if ( err ) {
                    callback(false);
                } else {
                    if ( results[0] ) {
                        callback(results[0].pin);                        
                    }
                }
            });
        } else {
            console.log("checkVirusPin database module getConnection error");
        }
        connection.release();
    });   
}
function destroyVirus(virus){
    connection.getConnection(function(error, connection){
        if ( !error ) {
            connection.query('DELETE FROM virus WHERE hashval = ?', [virus], function(err, results){
                if ( err ) {
                    console.log(err);
                }
            });
        } else {
            console.log("checkVirusPin database module getConnection error");
        }
        connection.release();
    });   
}
function addVirus(hashval,dur,type,url,callback){
    connection.getConnection(function(error, connection){
        if ( !error ) {
            connection.query('INSERT INTO virus (hashval,duration,type,url) VALUES (?,?,?,?)', [hashval,dur,type,url], function(err, results){
                if ( err ) {
                    console.log(err);
                    callback(false);
                } else {
                    callback(true);
                }
            });
        } else {
            console.log("addVirus database module getConnection error");
        }
        connection.release();
    });  
}
function setOnlineStatus(status,socket){
    connection.getConnection(function(error, connection){
        if ( !error ) {
            connection.query('UPDATE account SET online = ? WHERE socket = ?', [status,socket], function(err){
                if ( err ) {
                    console.error(err);
                } 
            });
        } else {
            console.error(error);
        }
        connection.release();
    });  
}
function checkOnlineStatus(nick,callback){
    connection.getConnection(function(error, connection){
        if ( !error ) {
            connection.query('SELECT online FROM account WHERE nick = ?', [nick], function(err, results){
                if ( err ) {
                    console.log(err);
                    callback(false);
                } else {
                    if ( results[0] ) {
                        callback(results[0].online);
                    }
                }
            });
        } else {
            console.log("checkOnlineStatus database module getConnection error");
        }
        connection.release();
    });  
}
function checkOnlineStatusByLogin(login,callback){
    connection.getConnection(function(error, connection){
        if ( !error ) {
            connection.query('SELECT online FROM account WHERE login = ?', [login], function(err, results){
                if ( err ) {
                    console.error(err);
                    callback(false);
                } else {
                    if ( results[0] ) {
                        callback(results[0].online);
                    }
                }
            });
        } else {
            console.error(error);
        }
        connection.release();
    });  
}
function setAllOffline(){
    connection.getConnection(function(error, connection){
        if ( !error ) {
            connection.query("UPDATE account SET online = 'no'");
        } else {
            console.error(error);
        }
        connection.release();
    });
}
function getTypeOfVirus(hashval, callback){
    connection.getConnection(function(error, connection){
        if ( !error ) {
            connection.query("SELECT type FROM virus WHERE hashval = ? ", [hashval], function(err, result){
                if ( err ) {
                    console.error(err);
                    callback(false);
                } else {
                    if ( result ) {
                        callback(result[0].type);
                    } else {
                        callback(false);
                    }
                }
            });
        } else {
            console.error(error);
        }
        connection.release();
    });
}
function setDailyFinished(socket){
    connection.getConnection(function(error, connection){
        if ( !error ) {
            connection.query("UPDATE account SET daily = 1 WHERE socket = ?", [socket], function(err, result){
                if ( err ) {
                    console.log(err);
                } 
            });
        } else {
            console.log("setDailyFinished databasse module getconnection error");
        }
        connection.release();
    });
}

function setDailyUnfinished(){
    connection.getConnection(function(error, connection){
        if ( !error ) {
            connection.query("UPDATE account SET daily = 0 ", function(err, result){
                if ( err ) {
                    console.log(err);
                }
            });
        } else {
            console.log("setDailyUnfinished databasse module getconnection error");
        }
        connection.release();
    }); 
}

function checkDaily(socket, callback){
    connection.getConnection(function(error, connection){
        if ( !error ) {
            connection.query("SELECT daily FROM account WHERE socket = ? ", [socket], function(err, result){
                if ( err ) {
                    callback(false);
                    console.log(err);
                } else {
                    if ( result ) {
                        callback(result[0].daily);
                    } else {
                        callback(false);
                    }
                }
            });
        } else {
            console.log("setAllOffline databasse module getconnection error");
        }
        connection.release();
    });    
}

function makeNewNode(login, address, money){
    connection.getConnection(function(error, connection){
        if ( !error ) {
            connection.query("INSERT into node (login, address, money) VALUES (?,?,?)", [login, address, money], function(err, result){
                if ( err ) {
                    console.log(err);
                } 
            });
        } else {
            console.log("setAllOffline databasse module getconnection error");
        }
        connection.release();
    });   
}

function addServerLog(message){
    connection.getConnection(function(error, connection){
        if ( !error ) {
            connection.query("INSERT into serverlogs (message) VALUES (?)", [message], function(err, result){
                if ( err ) {
                    console.error(err);
                } 
            });
        } else {
            console.error(error);
        }
        connection.release();
    });   
}

function setInfo(daily_website,daily_reward,botnet_price,gate_price,nick_socket_price,number,quote){
    connection.getConnection(function(error, connection){
        if ( !error ) {
            connection.query("UPDATE gameinfo SET daily_website = ?, daily_reward = ?, botnet_price = ?, gate_price=?, nick_socket_price = ? , number = ?, quote = ?",[daily_website,daily_reward,botnet_price,gate_price,nick_socket_price,number,quote], function(err, result){
                if ( err ) {
                    console.log(err);
                }
            });
        } else {
            console.error(error);
        }
        connection.release();
    }); 
}

function getDailyNum(callback){
    connection.getConnection(function(error, connection){
        if ( !error ) {
            connection.query("SELECT number FROM gameinfo", function(err, result){
                if ( err ) {
                    console.error(err);
                } else {
                    callback(result[0].number);
                }
            });
        } else {
            console.error(error);
        }
        connection.release();
    }); 
}

function getGameInfo(callback){
    connection.getConnection(function(error, connection){
        if ( !error ) {
            connection.query("SELECT * FROM gameinfo", function(err, result){
                if ( err ) {
                    console.error(err);
                } else {
                    callback(result[0]);
                }
            });
        } else {
            console.error(error);
        }
        connection.release();
    }); 
}

module.exports.getGameInfo = getGameInfo;
module.exports.getDailyNum = getDailyNum;
module.exports.setInfo = setInfo;
module.exports.addServerLog = addServerLog;
module.exports.makeNewNode = makeNewNode;
module.exports.checkDaily = checkDaily;
module.exports.setDailyUnfinished = setDailyUnfinished;
module.exports.setDailyFinished = setDailyFinished;
module.exports.getTypeOfVirus = getTypeOfVirus;
module.exports.setAllOffline = setAllOffline;
module.exports.checkOnlineStatusByLogin = checkOnlineStatusByLogin;
module.exports.setOnlineStatus = setOnlineStatus;
module.exports.checkOnlineStatus = checkOnlineStatus;
module.exports.addVirus = addVirus;
module.exports.destroyVirus = destroyVirus;
module.exports.checkIfSocketInfected = checkIfSocketInfected;
module.exports.checkVirusPin = checkVirusPin;
module.exports.checkVirusBySocketId = checkVirusBySocketId;
module.exports.setPinToVirus = setPinToVirus;
module.exports.changeVirusState = changeVirusState;
module.exports.addVirusToUser = addVirusToUser;
module.exports.checkVirus = checkVirus;
module.exports.addTransactionLog = addTransactionLog;
module.exports.showTransactionLogs = showTransactionLogs;
module.exports.showAuthorizedConnection = showAuthorizedConnection;
module.exports.addAuthorizedConnection = addAuthorizedConnection;
module.exports.removeAuthorizedConnection = removeAuthorizedConnection;
module.exports.systemStats = systemStats;
module.exports.checkBotnetPoints = checkBotnetPoints;
module.exports.checkIfSocketInDatabase = checkIfSocketInDatabase;
module.exports.getNickFromSocket = getNickFromSocket;
module.exports.getSocketFromNick = getSocketFromNick;
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
