import Vue from 'vue/dist/vue.min';
import './chat';
import './sea-battle';
import './scss-compiler';
import '../styles/global.scss';

window.addEventListener('DOMContentLoaded', () => {
    new Vue({
        el: '#main',
        data: {
            state: 'initial',
            message: 'Vue успешно подключен!',
            buttonText: 'Точно?',
        },
        methods: {
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
        },
    });
});
