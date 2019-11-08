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
    let sql = 'select count(*) from cards where 1=1'

    let sql2 = 'select id,title,beforeImg,afterImg,`character`,color,rate,0 as open from cards where 1=1'
    var list = []

    var condition = ''
    if (req.body.color.length != 0) {
        condition += ' and color in ('
        req.body.color.forEach(function (value, index, array) {
            if (index != 0 && index != array.length - 2) condition += ','
            condition += '?'
            list.push(value)
        })
        condition += ') '
    }
    if (req.body.rate.length != 0) {
        condition += ' and rate in ('
        req.body.rate.forEach(function (value, index, array) {
            if (index != 0 && index != array.length - 2) condition += ','
            condition += '?'
            list.push(value)
        })
        condition += ') '
    }
    if (req.body.character.length != 0) {
        condition += ' and `character` in ('
        req.body.character.forEach(function (value, index, array) {
            if (index != 0 && index != array.length - 2) condition += ','
            condition += '?'
            list.push(value)
        })
        condition += ') '
    }


    sql += condition
    sql2 += condition

    list.push((req.body.pageNo - 1) * req.body.pageSize)
    list.push(req.body.pageSize)
    sql2 += ' limit ?,?'

    pf.dbQuery(db(), sql, list)
        .catch(err => {
            data.status = 0
            res.end(JSON.stringify(data));
        })
        .then(result => {
            console.log(result)
            data.status = 1
            data.totalCount = result[0]['count(*)']
            return pf.dbQuery(db(), sql2, list)
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
