Vue.prototype.$axios = axios;
var vueApp = new Vue({
    el: '#vueApp',
    data: {
        userDto: null,
        activeNav: '1',
        loginForm: {
            username: '',
            password: ''
        },
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
        getCards: function () {
            this.$axios.post('/yuyuyui/getCards', {pageNo:1,pageSize:20})
                .then(res => {
                    console.log(res)
                })
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
        this.getCards()
    }
})