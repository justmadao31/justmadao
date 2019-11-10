const mysql = require('mysql')
module.exports = {
    dbQuery: function (sql, list) {
        let connection = mysql.createConnection({
            host     : 'localhost',
            port     : '3306',
            user     : 'zhaoqi',
            password : '123456',
            database : 'zq'
        })


        return new Promise(function (resolve, reject) {
            var query = connection.query(sql, list, function (err, result) {
                if (err) {
                    console.log(err.message)
                    reject(err)
                } else {
                    resolve(result)
                }
            })
            console.log(query.sql)
            connection.end()
        })
    }
}