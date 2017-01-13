let mysql = require('mysql');
let connection = mysql.createPool(
    {
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'baza'
    }
);

function registerAccount(login,password) {
    connection.getConnection(function(error,connection){
        if(!error){
            connection.query('INSERT INTO Account (id,login,password,money) VALUES (null,?,?,0);',[login,password],function(err, results){
               connection.release();
               err ? return err : null;
            });
        } else {
            return 'registerAccount database module getConnection error';
        }
    });
}

function checkIfLoginExists(login){
    connection.getConnection(function(error,connection){
        if(!error){
            connection.query('SELECT COUNT(login) FROM Account WHERE login=?',[login],function(err, results){
                connection.release();
                if ( err ) {
                    return err;
                } else {
                    if( results[0]>0 ) {
                        return true;
                    } else {
                        return false;
                    }
                }
            });
        } else {
            return 'checkIfLoginExists database module getConnection error';
        }
    });
}
