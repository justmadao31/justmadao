const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser')
const db = require('../util/mysqlConnect')
const pf = require('../common/promiseFunction')
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
                v.leaf = v.isLeaf == 1
            })
            data.status = 1
            data.result = result
            res.end(JSON.stringify(data));
        }

    });

    db().end();
})

router.post('/saveVideoNode', function (req, res) {
    res.status(200);
    var data = {}
    db().connect()
    var list = [req.body.pid, req.body.label, req.body.isLeaf, req.body.src, req.body.size, req.body.orderNo, req.body.id]
    let sql = ''
    if (req.body.id == null) {
        sql = 'insert into videoTree (pid,label,isLeaf,src,size,orderNo) values (?,?,?,?,?,?)'
    } else {
        sql = 'update videoTree set pid=?,label=?,isLeaf=?,src=?,size=?,orderNo=? where id=?'
    }
    db().query(sql, list, function (err, result) {
        if (err) {
            console.log(err.message)
            data.status = 0
            res.end(JSON.stringify(data));
        } else {
            data.status = 1
            data.result = result
            res.end(JSON.stringify(data));
        }
    });

    db().end();
})

router.post('/getCards', function (req, res) {
    res.status(200);
    var data = {}
    db().connect()
    let sql = 'select count(id) as total from cards'

    let sql2 = 'select id,title,beforeImg,`character`,color,rate from cards limit ?,?'
    pf.dbQuery(db(), sql, null)
        .catch(err => {
            data.status = 0
            res.end(JSON.stringify(data));
        })
        .then(result => {
            data.status = 1
            data.totalCount = result[0]['total']
            return pf.dbQuery(db(), sql2, [(req.body.pageNo - 1) * req.body.pageSize, req.body.pageSize])
        })
        .catch(err => {
            data.status = 0
            res.end(JSON.stringify(data));
        })
        .then(result => {
            data.result = result
            res.end(JSON.stringify(data));
        })
    db().end();
})

module.exports = router;
