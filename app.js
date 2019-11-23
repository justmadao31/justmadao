const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const lessMiddleware = require('less-middleware');
const logger = require('morgan');
const session = require("express-session");
const bodyParser = require('body-parser');
const fs = require('fs');
const md5 = require('md5-node')
const emailUtil = require('./util/EmailUtil');
const pf = require('./common/promiseFunction')
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const yuyuyuiRouter = require('./routes/yuyuyui');
const app = express();
app.use(session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    cookie: ('name', 'value', {maxAge: 30 * 60 * 1000, secure: false})
}));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(lessMiddleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/yuyuyui', yuyuyuiRouter);

app.post('/login', function (req, res) {
    res.status(200);
    res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type');//可以支持的消息首部列表
    res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');//可以支持的提交方式
    res.header('Content-Type', 'application/json;charset=utf-8');//响应头中定义的类型

    var data = {}
    if (req.session.userInfo != null) {
        data.status = 2;
        data.message = '您已经登录，请不要重复登录'
        res.end(JSON.stringify(data));
        return
    }
    let sql = 'select id,name,level,email from user where name=? and password=?'

    pf.dbQuery(sql, [req.body.username, md5(req.body.password)])
        .then(result => {
            if (result.length == 0) {
                data.status = 0
                data.message = '用户名或密码错误'
            } else {
                req.session.userInfo = result[0]
                data.status = 1
                data.result = result
            }

            res.end(JSON.stringify(data));
        })
        .catch(err => {
            data.status = 0
            res.end(JSON.stringify(data));
        })

})

app.post('/sendCode', function (req, res) {
    if (req.session.lastCodeTime != null && req.session.lastCodeTime + 1 * 60 * 1000 > new Date().getTime()) {
        res.send({code: 0, message: '1分钟内不能重复发送验证码'})
        return
    }
    var code = Math.round(Math.random() * 1000000)
    var str = '<h1>验证码：' + code + '</h1>'

    req.session.lastCodeTime = new Date().getTime()
    req.session.code = code

    emailUtil.sendEmail(req.body.email, str)
        .then(result => {
            res.send({code: 1, message: '已发送验证码，5分钟有效'})
        })
        .catch(err => {
            res.send({code: 0, message: '发送失败请重试'})
        })
})

app.post('/sign', function (req, res) {
    res.status(200);
    res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type');//可以支持的消息首部列表
    res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');//可以支持的提交方式
    res.header('Content-Type', 'application/json;charset=utf-8');//响应头中定义的类型
    if (req.session.code != req.body.code) {
        res.send({status: 0, message: '验证码不正确'})
    } else if (req.session.lastCodeTime + 5 * 1000 * 60 > new Date().getTime()) {
        res.send({status: 0, message: '验证码已过期'})
    } else {
        let sql = 'select * from user where name=? or email=?'
        pf.dbQuery(sql, [req.body.username, req.body.email])
            .then(result => {
                if (result.length != 0) {
                    res.send({status: 0, message: '用户名或邮箱已经注册'})
                } else {
                    let sql2 = 'insert into user (name,password,email,level) values (?,?,?,0)'
                    let list = [req.body.username, md5(req.body.password), req.body.email]
                    pf.dbQuery(sql2, list)
                        .then(result => {
                            let newUser = JSON.parse(JSON.stringify(req.body))
                            newUser.level = 0
                            req.session.userInfo = newUser
                            res.send({status: 1, message: '注册成功'})
                        })
                        .catch(err => {
                            res.send({status: 0, message: '服务器错误，请稍后重试'})
                        })
                }
            })
            .catch(err => {
                res.send({status: 0, message: '服务器错误，请稍后重试'})
            })
    }
})

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
