Vue.prototype.$axios = axios;
var vueApp = new Vue({
    el: '#vueApp',
    data: {
        activeNav: '1'
    },
    methods: {
        videoTreeClick(data) {
            console.log(JSON.stringify(data, null, 4));
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
    created: function () {

    }
})