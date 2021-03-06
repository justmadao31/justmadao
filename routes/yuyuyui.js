const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser')
const pf = require('../common/promiseFunction')
const session = require("express-session");
const fs = require('fs');
const multer = require('multer')
const upload = multer({dest: 'public/images/'});
const gm = require('gm')
const http = require('https');
const url = require("url");
const querystring = require("querystring");
const zlib = require('zlib');
const xml2js = require('xml2js');
const path = require('path');
const emailUtil = require('../util/EmailUtil');
const cos = require('../util/cosUtil');
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
    let sql = 'select * from videoTree where pid=? order by orderNo'

    pf.dbQuery(sql, [req.body.pid])
        .then(result => {
            result.forEach(function (v, i) {
                v.leaf = v.isLeaf == 1
            })
            data.status = 1
            data.result = result
            res.end(JSON.stringify(data));
        })
        .catch(err => {
            data.status = 0
            res.end(JSON.stringify(data));
        })
})

router.post('/saveVideoNode', function (req, res) {
    res.status(200);
    var data = {}
    var list = [req.body.pid, req.body.label, req.body.isLeaf, req.body.src, req.body.size, req.body.orderNo, req.body.cid, req.body.img, req.body.id]
    let sql = ''
    if (req.body.id == null) {
        sql = 'insert into videoTree (pid,label,isLeaf,src,size,orderNo,cid,img) values (?,?,?,?,?,?,?,?)'
    } else {
        sql = 'update videoTree set pid=?,label=?,isLeaf=?,src=?,size=?,orderNo=?,cid=?,img=? where id=?'
    }

    pf.dbQuery(sql, list)
        .then(result => {
            data.status = 1
            data.result = result
            if (req.body.id == null && req.body.isLeaf == 1) {
                pf.saveNews('更新剧情视频：' + req.body.path + '/' + req.body.label, req.body.img)
            }
            res.end(JSON.stringify(data));
        })
        .catch(err => {
            data.status = 0
            res.end(JSON.stringify(data));
        })
})

router.post('/getCards', function (req, res) {
    res.status(200);
    var data = {}
    let sql = 'select count(*) from cards where 1=1'

    let sql2 = 'select id,title,beforeImgName,afterImgName,`character`,color,rate,0 as open from cards where 1=1'
    var list = []

    var condition = ''
    if (req.body.color.length != 0) {
        condition += ' and color in ('
        req.body.color.forEach(function (value, index, array) {
            if (index != 0) condition += ','
            condition += '?'
            list.push(value)
        })
        condition += ') '
    }
    if (req.body.rate.length != 0) {
        condition += ' and rate in ('
        req.body.rate.forEach(function (value, index, array) {
            if (index != 0) condition += ','
            condition += '?'
            list.push(value)
        })
        condition += ') '
    }
    if (req.body.character.length != 0) {
        condition += ' and `character` in ('
        req.body.character.forEach(function (value, index, array) {
            if (index != 0) condition += ','
            condition += '?'
            list.push(value)
        })
        condition += ') '
    }


    sql += condition
    sql2 += condition

    list.push((req.body.pageNo - 1) * req.body.pageSize)
    list.push(req.body.pageSize)
    sql2 += ' order by id DESC limit ?,?'

    pf.dbQuery(sql, list)
        .then(result => {
            console.log(result)
            data.status = 1
            data.totalCount = result[0]['count(*)']
            return pf.dbQuery(sql2, list)
        })
        .catch(err => {
            data.status = 0
            res.end(JSON.stringify(data));
        })
        .then(result => {
            data.result = result
            res.end(JSON.stringify(data));
        })
        .catch(err => {
            data.status = 0
            res.end(JSON.stringify(data));
        })

})

router.post('/getCardById', function (req, res) {
    res.status(200);
    var data = {}

    var sql = 'select * from cards where id=?'
    pf.dbQuery(sql, [req.body.id])
        .then(result => {
            data.result = result
            res.end(JSON.stringify(data));
        })
        .catch(err => {
            data.status = 0
            res.end(JSON.stringify(data));
        })

})

router.post('/saveCard', function (req, res) {
    res.status(200);
    var data = {}
    var list = [req.body.title, req.body.character, req.body.color, req.body.rate, req.body.beforeImgName, req.body.afterImgName, req.body.leaderSkillName
        , req.body.leaderSkillConctent, req.body.skillName, req.body.skillContent, req.body.abilityName, req.body.abilityContent, req.body.description
        , req.body.akt, req.body.hp, req.body.grown, req.body.speed, req.body.cost, req.body.crt, req.body.strength, req.body.id]
    let sql = ''
    if (req.body.id == null) {
        sql = 'insert into cards (title,`character`,color,rate,beforeImgName,afterImgName,' +
            'leaderSkillName,leaderSkillConctent,skillName,skillContent,abilityName,abilityContent,description,' +
            'akt,hp,grown,speed,cost,crt,strength) values ' +
            '(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
    } else {
        sql = 'update cards set title=?,`character`=?,color=?,rate=?,beforeImgName=?,afterImgName=?,' +
            ' leaderSkillName=?,leaderSkillConctent=?,skillName=?,skillContent=?,abilityName=?,abilityContent=?,description=?,' +
            ' akt=?,hp=?,grown=?,speed=?,cost=?,crt=?,strength=? where id=?'
    }

    pf.dbQuery(sql, list)
        .then(result => {
            data.status = 1
            data.result = result

            if (req.body.id == null) {
                pf.saveNews('增加图鉴：' + req.body.title + '·' + req.body.character, req.body.beforeImgName.replace('yuyuyui', '/images/thumbnail').replace('png', 'jpg'))
            }

            res.end(JSON.stringify(data));
        })
        .catch(err => {
            data.status = 0
            res.end(JSON.stringify(data));
        })

})

router.post('/uploadCardImg', upload.single('pic'), function (req, res, next) {
    var file = req.file;
    fs.rename(file.path, path.join(__dirname, '../public/images/cards/' + req.body.fileName), function (err, data) {
        if (err) {
            console.log(err)
            res.send({status: 0});
        } else {
            gm(path.join(__dirname, '../public/images/cards/' + req.body.fileName))
                .resize(480, 270, "!")
                .write(path.join(__dirname, '../public/images/thumbnail/' + req.body.fileName), function (err) {
                    res.send({status: 1});
                });
        }
    })

});

router.post('/getNews', function (req, res) {
    res.status(200);
    var data = {}
    var sql = 'select * from news order by id DESC limit 0,6'
    pf.dbQuery(sql, null)
        .then(result => {
            data.status = 1
            data.result = result
            res.send(data)
        })
        .catch(() => {
            data.status = 0
            res.send(data)
        })
})

router.get('/getdanmu', function (req, res) {
    //获取返回的url对象的query属性值
    var arg = url.parse(req.url).query;

    //将arg参数字符串反序列化为一个对象
    var params = querystring.parse(arg);

    var sql = 'select * from danmu where cid=?'

    pf.dbQuery(sql, [params.id])
        .then(result => {
            var list = []
            result.forEach(function (v) {
                list.push([v.time, v.type, v.color, v.author, v.text])
            })
            res.send({code: 0, data: list})
        })
        .catch(err => {
            res.send({code: 0, data: []})
        })
})

router.post('/getdanmu/', function (req, res) {
    if (req.session.userInfo == null) {
        res.send({code: 1})
    } else {
        var list = []
        var str = []
        var p = []
        req.body.author = req.session.userInfo.name
        for (var key in req.body) {
            list.push(req.body[key])
            p.push('?')
            str.push('`' + (key == 'id' ? 'cid' : key) + '`')
        }
        var sql = 'insert into danmu (' + str.join(',') + ') value (' + p.join(',') + ')'

        pf.dbQuery(sql, list)
            .then(result => {
                res.send({code: 0})
            })
            .catch(err => {
                res.send({code: 0})
            })
    }
})

router.get('/getBiliBilidanmu', function (req, res1) {

    var arg = url.parse(req.url).query;
    var params = querystring.parse(arg);
    if (params.cid == 0) {
        res1.send({code: 0, data: []})
    } else {
        pf.fsRead(path.join(__dirname, "../public/danmu/" + params.cid + '.json'))
            .then(data => {
                console.log('读取弹幕文件')
                res1.send(data)
            })
            .catch(() => {
                var biliUrl = 'https://api.bilibili.com/x/v1/dm/list.so?oid=' + params.cid
                return pf.httpGet(biliUrl)
            })
            .then(res => {
                var chunks = []
                res.on('data', (chunk) => {
                    chunks.push(chunk);
                });
                res.on('end', function () {
                    var buffer = Buffer.concat(chunks);
                    if (buffer.toString().search('<!DOCTYPE HTML') == 0) {
                        res1.send({code: 0, data: []})
                    } else {
                        pf.zlibInflateRaw(buffer)
                            .then(decoded => pf.xmlToJson(decoded.toString()))
                            .catch(() => {
                                res1.send({code: 0, data: []})
                            })
                            .then(result => {
                                var list = []
                                result.i.d.forEach(function (v) {
                                    var t = v.$.p.split(',')
                                    list.push([t[0], t[1], parseInt(t[3]), t[6], v._])
                                })
                                var data = {code: 0, data: list}
                                res1.send(data)
                                pf.fsWrite(path.join(__dirname, "../public/danmu/" + params.cid + '.json'), JSON.stringify(data))
                                    .then(() => {

                                    })
                                    .catch(() => {

                                    })
                            })
                            .catch(() => {
                                res1.send({code: 0, data: []})
                            })
                    }

                })
            })
            .catch(() => {
                res1.send({code: 0, data: []})
            })
    }
})

router.post('/trimDanmu', function (req, res) {
    if (req.session.userInfo != null && req.session.userInfo.level == 1) {
        pf.fsRead(path.join(__dirname, "../public/danmu/" + req.body.cid + '.json'))
            .then(data => {
                var danmu = JSON.parse(data);
                var ratio = req.body.newTime / req.body.oldTime
                danmu.data.forEach(function (v) {
                    v[0] = parseFloat(v[0]) * ratio
                })
                pf.fsWrite(path.join(__dirname, "../public/danmu/" + req.body.cid + '.json'), JSON.stringify(danmu))
                    .then(() => {
                        res.send({status: 1, message: '修改成功'})
                    })
                    .catch(() => {
                        res.send({status: 0, message: '写入失败'})
                    })
            })
            .catch(() => {
                res.send({status: 0, message: '读取文件出错'})
            })
    } else {
        res.send({status: 0, message: '没有修改权限'})
    }
})

router.post('/getInfoLog', function (req, res) {
    res.status(200);
    var data = {}
    pf.fsRead(path.join(__dirname, "../util/info.json"))
        .then(str=>{
            data=str
            res.send(data)
        })
})
module.exports = router;
