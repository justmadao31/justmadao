var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser')
const db = require('../util/mysqlConnect')

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('yuyuyui/index', {title: '闪光的花结'});
});


router.post('/getVideoTreeNode', function (req, res) {
    res.status(200);
    var data = {}
    db().connect()
    let sql = 'select * from videoTree where pid=? order by orderNo'
    db().query(sql, req.body.pid, function (err, result) {
        if (err) {
            console.log(err.message)
            data.status = 0
            res.end(JSON.stringify(data));
        } else {
            result.forEach(function (v, i) {
                v.isLeaf = v.isLeaf == 1
            })
            data.status = 1
            data.result = result
            res.end(JSON.stringify(data));
        }

    });

    db().end();
})
module.exports = router;
