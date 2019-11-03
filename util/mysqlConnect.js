const mysql = require('mysql')

const connectdb=()=>{
    let connection = mysql.createConnection({
        host     : 'loaclhost',
        port     : '3306',
        user     : '1111',
        password : '2222',
        database : '3333'
    })
    return connection;
}

module.exports=connectdb