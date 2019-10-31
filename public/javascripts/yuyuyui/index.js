Vue.prototype.$axios = axios;
var vueApp = new Vue({
    el: '#vueApp',
    data: {
        activeNav: '1',
        activeVideoNode: null,
        videoUrl: null,
        props: {
            label: 'label',
            children: 'children',
            isLeaf: 'isLeaf'
        }
    },
    methods: {
        videoTreeClick(data) {
            //console.log(JSON.stringify(data, null, 4));
            if (data.isLeaf) {
                this.activeVideoNode = data
                this.videoUrl = 'http://justmadao.club/video/' + this.activeVideoNode.src;
                this.$refs['video'].load()
            }
        },
        loadNode(node, resolve) {
            console.log(node.data)
            this.$axios.post('/yuyuyui/getVideoTreeNode', {pid: node.data ? node.data.id : 0})
                .then(function (response) {
                    resolve(response.data.result)
                })
                .catch(function (error) {
                    console.log(error);
                });
        }
    },
    computed: {},
    created: function () {

    }
})