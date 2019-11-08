module.exports = {
    dbQuery: function (db, sql, list) {
        return new Promise(function (resolve, reject) {
            var query = db.query(sql, list, function (err, result) {
                if (err) {
                    console.log(err.message)
                    reject(err)
                } else {
                    resolve(result)
                }
            })
            console.log(query.sql)
        })
    }
}