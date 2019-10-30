var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser')

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('yuyuyui/index', {title: '闪光的花结'});
});


router.post('/getVideoTreeNode', function (req, res) {
    console.log(req.body);
    res.status(200);
    var data = {}
    if (req.body) {
        data.msg = 'success'
        data.result = [{
            label: '闪光的花结',
            isleaf: true,
            children: [],
            id: 1
        }]
    } else {
        data.msg = 'error'
    }
    res.end(JSON.stringify(data));
})
module.exports = router;
