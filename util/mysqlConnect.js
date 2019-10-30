const mysql = require('mysql')

const connectdb=()=>{
    let connection = mysql.createConnection({
        host     : 'cdb-7uu6csip.gz.tencentcdb.com',
        port     : '10144',
        user     : 'soapbuble',
        password : '1218f321be8e',
        database : 'yuyuyui'
    })
    return connection;
}

module.exports=connectdb