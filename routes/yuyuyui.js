const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser')
const db = require('../util/mysqlConnect')
const session = require("express-session");
/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('yuyuyui/index', {title: '闪光的花结', userInfo: req.session.userInfo});
});


router.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type');//可以支持的消息首部列表
    res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');//可以支持的提交方式
    res.header('Content-Type', 'application/json;charset=utf-8');//响应头中定义的类型
    next();
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
