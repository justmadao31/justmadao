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
            isLeaf: 'isLeaf'
        },
        dialogLoginVisible: false,
        loginForm: {
            username: '',
            password: ''
        }
    },
    methods: {
        videoTreeClick(data, node) {
            //console.log(JSON.stringify(data, null, 4));
            //console.log(node);
            this.activeVideoNode = node
            if (data.isLeaf) {
                this.videoUrl = 'http://justmadao.club/video/' + this.videoPath + '.mp4';
                this.$refs['video'].load()
            }
        },
        loadNode(node, resolve) {
            //console.log(node.data)
            this.$axios.post('/yuyuyui/getVideoTreeNode', {pid: node.data ? node.data.id : 0})
                .then(function (response) {
                    resolve(response.data.result)
                })
                .catch(function (error) {
                    console.log(error);
                });
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
        }
    },
    computed: {
        videoPath: function () {
            if (this.activeVideoNode == null) return ''
            return this.getVideoPath('', this.activeVideoNode)
        }
    },
    created: function () {

    }
})