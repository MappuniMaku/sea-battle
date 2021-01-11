import Vue from 'vue/dist/vue.esm';

new Vue({
    el: '#scss-compiler',
    data: {
        scss: '',
    },
    methods: {
        async compileScss(e) {
            e.preventDefault();

            try {
                let response = await fetch('/compile_scss', {
                    method: 'POST',
                    mode: 'cors',
                    body: this.scss,
                });

                let result = await response.text();

                console.log(`Компиляция завершена, результат: "${result}"`);
            } catch {
                throw new Error('Ошибка отправки запроса');
            }
        },
    },
});
