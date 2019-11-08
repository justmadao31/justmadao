module.exports = {
    dbQuery: function (db, sql, list) {
        return new Promise(function (resolve, reject) {
            db.query(sql, list, function (err, result) {
                if (err) {
                    console.log(err.message)
                    reject(err)
                } else {
                    resolve(result)
                }
            })
        })
    }
}