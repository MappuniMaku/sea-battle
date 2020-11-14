console.log('JavaScript included')

const app = new Vue({
    el: '#app',
    data: {
        message: 'Hello Vue!'
    },
    methods: {
        async compileScss(e) {
            e.preventDefault();

            let response = await fetch('/article/fetch/post/user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain;charset=UTF-8'
                },
                body: e.target.scss
            });

            console.log(response);
        },
    }
});