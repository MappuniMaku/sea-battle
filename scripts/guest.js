import Vue from 'vue/dist/vue.esm';
import '../styles/global.scss';
import '../vendor/swiper/swiper'
import { initSwiperInstances } from '../vendor/swiper/swiper';
import gallerySliderOptions from '../scripts/slider-options';
const ws = new WebSocket('wss://slider-constructor.herokuapp.com/chat');
// const ws = new WebSocket('ws://localhost:3000/chat');

const options = {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric'
};

new Vue({
    el: '#app',
    data: {
        state: 'initial',
        message: 'Vue успешно подключен!',
        buttonText: 'Точно?',
        scss: '',
        chatMessage: '',
        messages: [],
    },
    beforeMount() {
        ws.onmessage = (message) => {
            this.messages.push({
                time: new Date().toLocaleString('ru', options),
                message: message.data,
            });
        };
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

        sendMessage(e) {
            e.preventDefault();
            ws.send(this.chatMessage);
            this.chatMessage = '';
        },
    },
});

window.addEventListener('DOMContentLoaded', () => {
    initSwiperInstances([
        {
            selector: '[data-gallery-slider]',
            options: gallerySliderOptions,
        },
    ]);
});
