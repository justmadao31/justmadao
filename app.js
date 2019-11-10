const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const lessMiddleware = require('less-middleware');
const logger = require('morgan');
const session = require("express-session");
const bodyParser = require('body-parser');
const fs = require('fs');
const pf = require('./common/promiseFunction')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var yuyuyuiRouter = require('./routes/yuyuyui');
var app = express();

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

    pf.dbQuery(sql,[req.body.username, req.body.password])
        .catch(err=>{
            data.status = 0
            res.end(JSON.stringify(data));
        })
        .then(result=>{
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
