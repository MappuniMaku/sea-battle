console.log('JavaScript included')

const app = new Vue({
    el: '#app',
    data: {
        state: 'initial',
        message: 'Vue успешно подключен!',
        buttonText: 'Точно?',
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

        changeText() {
            if (this.state === 'initial') {
                this.state = 'afterClick';
                this.message = 'Да!!!';
                this.buttonText = 'Что "да"?';
            } else {
                this.state = 'initial';
                this.message = 'Vue успешно подключен!';
                this.buttonText = 'Точно?';
            }
        },
    }
});