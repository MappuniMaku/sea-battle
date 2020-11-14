console.log('JavaScript included')

const app = new Vue({
    el: '#app',
    data: {
        message: 'Hello Vue!',
        scss: '',
    },
    methods: {
        async compileScss(e) {
            e.preventDefault();

            let response = await fetch('/compile_scss', {
                method: 'POST',
                headers: {'Content-Type': 'application/json;charset=utf-8'},
                mode: 'cors',
                body: JSON.stringify({scss: this.scss})
            });

            let result = await response.text();

            console.log(result);
        },
    }
});