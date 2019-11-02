Vue.prototype.$axios = axios;
var vueApp = new Vue({
    el: '#vueApp',
    data: {
        userDto: null,
        activeNav: '1',
        activeVideoNode: null,
        videoUrl: null,
        props: {
            label: 'label',
            children: 'children',
            isLeaf: 'leaf'
        },
        dialogLoginVisible: false,
        loginForm: {
            username: '',
            password: ''
        },
        editNode: null
    },
    methods: {
        videoTreeClick(data, node) {
            //console.log(JSON.stringify(data, null, 4));
            //console.log(node);
            this.activeVideoNode = node
            if (data.isLeaf) {
                this.videoUrl = 'http://justmadao.club/video/' + this.videoPath + '.mp4';
                this.$nextTick(function () {
                    this.$refs['video'].load()
                })
            }
        },
        loadNode(node, resolve) {
            //console.log(node.data)
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
    created: function () {

    }
})