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
                mode: 'cors',
                body: this.scss,
            });

            let result = await response.text();

            console.log(result);
        },
    }
});