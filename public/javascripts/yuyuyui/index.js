Vue.prototype.$axios = axios;
var vueApp = new Vue({
    el: '#vueApp',
    data: {
        userDto: null,
        activeNav: '2-1',
        loginForm: {
            username: '',
            password: ''
        },
        character: [
            {
                title: '结城友奈',
                value: '1'
            },
            {
                title: '东乡美森',
                value: '2'
            },
            {
                title: '三好夏凛',
                value: '3'
            },
            {
                title: '犬吠埼风',
                value: '4'
            },
            {
                title: '犬吠埼树',
                value: '5'
            },
            {
                title: '乃木园子（中）',
                value: '6'
            },
            {
                title: '鹫尾须美',
                value: '7'
            },
            {
                title: '三之轮银',
                value: '8'
            },
            {
                title: '乃木园子（小）',
                value: '9'
            },
            {
                title: '乃木若叶',
                value: '10'
            },
            {
                title: '高嶋友奈',
                value: '11'
            },
            {
                title: '郡千景',
                value: '12'
            },
            {
                title: '土居球子',
                value: '13'
            },
            {
                title: '伊予岛杏',
                value: '14'
            },
            {
                title: '上里日向',
                value: '15'
            },
            {
                title: '白鸟歌野',
                value: '16'
            },
            {
                title: '藤森水都',
                value: '17'
            },
            {
                title: '古波藏棗',
                value: '18'
            },
            {
                title: '秋原雪花',
                value: '19'
            },
            {
                title: '赤岭友奈',
                value: '20'
            },
            {
                title: '楠芽吹',
                value: '21'
            },
            {
                title: '山伏雫',
                value: '22'
            },
            {
                title: '加贺城雀',
                value: '23'
            },
            {
                title: '弥勒夕海子',
                value: '24'
            },
            {
                title: '国土亚耶',
                value: '25'
            },
            {
                title: '其他',
                value: '26'
            }
        ],
        //剧情视频
        activeVideoNode: null,
        videoUrl: null,
        props: {
            label: 'label',
            children: 'children',
            isLeaf: 'leaf'
        },
        dialogLoginVisible: false,
        editNode: null,
        //卡面图鉴
        cardsPageNo: 1,
        cardsPageSize: 8,
        cardsTotal: 0,
        cardList: [],
        cardsForm: {
            color: [],
            rate: [],
            character: []
        }
    },
    methods: {
        //通用部分
        navSelect: function (key, keyPath) {
            this.activeNav = key
        },
        J_login: function () {
            this.$axios.post('/login', this.loginForm)
                .then(response => {
                    if (response.data.status == 1) {
                        location.reload()
                    } else if (response.data.status == 0) {
                        this.$alert(response.data.message, '错误', {
                            confirmButtonText: '确定',
                            callback: action => {

                            }
                        });
                    } else if (response.data.status == 2) {
                        this.$alert(response.data.message, '错误', {
                            confirmButtonText: '确定',
                            callback: action => {

                            }
                        });
                        this.dialogLoginVisible = false
                    }
                })
                .catch(function (error) {
                    console.log(error);
                });
        },
        //视频剧情
        videoTreeClick(data, node) {
            this.activeVideoNode = node
            if (data.isLeaf) {
                this.videoUrl = 'http://justmadao.club/video/' + this.videoPath + '.mp4';

                this.$nextTick(function () {
                    this.$refs['video'].load()
                })
            }
        },
        loadNode(node, resolve) {
            this.getVideoTreeNode(node).then(response => {
                resolve(response.data.result)
            })
        },
        getVideoTreeNode: function (node) {
            return this.$axios.post('/yuyuyui/getVideoTreeNode', {pid: node.data ? node.data.id : 0})
        },
        getVideoPath: function (path, node) {
            var p = node.label + path
            if (node.level == 1) {
                return p
            } else {
                return this.getVideoPath('/' + p, node.parent);
            }
        },
        clickEditNode: function (e) {
            this.editNode = JSON.parse(JSON.stringify(e.row))
        },
        saveVideoNode: function () {
            this.editNode.isLeaf = this.editNode.leaf ? 1 : 0
            //console.log(this.editNode)
            this.$axios.post('/yuyuyui/saveVideoNode', this.editNode)
                .then(response => {
                    this.$message({
                        message: '保存成功',
                        type: 'success'
                    });
                    this.editNode = null
                    this.getVideoTreeNode(this.activeVideoNode).then(res => {
                        this.activeVideoNode.childNodes = []
                        this.activeVideoNode.doCreateChildren(res.data.result)
                    })
                })
        },
        createNewVideoNode: function () {
            this.editNode = {
                id: null,
                pid: this.activeVideoNode ? this.activeVideoNode.data.id : 0,
                orderNo: 0,
                label: '',
                leaf: false,
                src: '',
                size: 0,
                isLeaf: 0
            }
        },
        gotoXL: function () {
            window.open(this.activeVideoNode.data.src)
        },
        //卡面图鉴
        getCards: function (page) {
            if (page) this.cardsPageNo = page
            var param = {
                pageNo: this.cardsPageNo,
                pageSize: this.cardsPageSize,
                color: this.cardsForm.color,
                character: this.cardsForm.character,
                rate: this.cardsForm.rate
            }
            this.$axios.post('/yuyuyui/getCards', param)
                .then(res => {
                    this.cardsTotal = res.data.totalCount
                    this.cardList = res.data.result;
                })
        },
        cardsPageChange: function (e) {
            this.cardsPageNo = e
            this.getCards()
        },
        getCardPath: function (type, path) {
            if (type == 1) {
                return path.replace('yuyuyui', '/images/thumbnail')
            } else {
                return path.replace('yuyuyui', '/images/cards')
            }
        }
    },
    computed: {
        videoPath: function () {
            if (this.activeVideoNode == null) return ''
            return this.getVideoPath('', this.activeVideoNode)
        },
        editVideoNode: function () {
            var list = []

            if (this.activeVideoNode) {
                $.each(this.activeVideoNode.childNodes, (i, o) => {
                    list.push(o.data)
                })
            }

            return list;
        }
    },
    watch: {
        'activeNav': function (newValue) {
            if (this.$refs['video']) {
                if (newValue != '4') {
                    this.$refs['video'].pause()
                } else {
                    this.$refs['video'].play()
                }
            }

        }
    },
    created: function () {

    }
})