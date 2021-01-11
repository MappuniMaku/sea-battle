import Vue from 'vue/dist/vue.esm';
import './chat';
import './scss-compiler';
import '../styles/global.scss';
import '../vendor/swiper/swiper'
import { initSwiperInstances } from '../vendor/swiper/swiper';
import gallerySliderOptions from '../scripts/slider-options';

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

window.addEventListener('DOMContentLoaded', () => {
    initSwiperInstances([
        {
            selector: '[data-gallery-slider]',
            options: gallerySliderOptions,
        },
    ]);
});
