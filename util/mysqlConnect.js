const mysql = require('mysql')

const connectdb=()=>{
    let connection = mysql.createConnection({
        host     : '47.240.87.248',
        port     : '3306',
        user     : 'zhaoqi',
        password : '123456',
        database : 'yuyuyui'
    })
    return connection;
}

module.exports=connectdb