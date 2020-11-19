import {
    Swiper,
    A11y,
    Navigation,
    Scrollbar,
    Thumbs,
    Pagination,
} from 'swiper/js/swiper.esm';

Swiper.use([
    A11y,
    Navigation,
    Scrollbar,
    Thumbs,
    Pagination,
]);

export const CLASSES = {
    CONTAINER: '.swiper-container',
    WRAPPER: '.swiper-wrapper',
};

export const SELECTORS = {
    ARROW_PREV: '[data-slider-arrow-prev]',
    ARROW_NEXT: '[data-slider-arrow-next]',
    SCROLLBAR: '[data-slider-scrollbar]',
    PAGINATION: '[data-slider-pagination]',
};

/**
 * Default Swiper options
 */
export const defaultOptions = {
    loop: false,
    speed: 650,
    spaceBetween: 0,
    slidesPerView: 'auto',
    navigation: true,
    scrollbar: true,
    pagination: true,
};

/**
 * Get HTML DOM Element
 * @param {string|Element} element
 * @return Element|null
 */
function getNode(element) {
    return element;
}


/**
 * Default scrollbar options
 * @param {string|Element} element
 * @return Object|false
 */
export function scrollbar(element) {
    element = getNode(element);
    if (!element) return false;

    const scrollbarEl = element.querySelector(SELECTORS.SCROLLBAR);
    if (!scrollbarEl) return false;

    return {
        el: scrollbarEl,
        hide: true,
    };
}

/**
 * Default navigation options
 * @param {string|Element} element
 * @return Object|false
 */
export function navigation(element) {
    element = getNode(element);
    if (!element) return false;

    // the slider can have multiple controls
    const prev = element.querySelectorAll(SELECTORS.ARROW_PREV);
    const next = element.querySelectorAll(SELECTORS.ARROW_NEXT);
    if (!prev || !next) return false;

    return {
        nextEl: next,
        prevEl: prev,
    };
}

/**
 * Default pagination options
 * @param {string|Element} element
 * @return Object|false
 */
export function pagination(element) {
    element = getNode(element);
    if (!element) return false;

    const paginationEl = element.querySelector(SELECTORS.PAGINATION);
    if (!paginationEl) return false;

    return {
        el: paginationEl,
        type: 'bullets',
        clickable: true,
        renderBullet(index, className) {
            return `<li class="${className}"><span>${(index + 1)}</span></li>`;
        },
    };
}

function updateProperty(instance, options, property, callback) {
    if (options[property] === true) {
        if (options[property] === true) options[property] = callback(instance);

        if (typeof (options[property]) === 'object') {
            options[property] = { ...callback(instance), ...options[property]};
        }
    }
}

/**
 * Combine navigation, pagination properties with default values
 * @param {Element} container
 * @param {Object} options
 * @return Object
 */
function updateProperties(container, options) {
    updateProperty(container, options, 'pagination', pagination);
    updateProperty(container, options, 'navigation', navigation);
    updateProperty(container, options, 'scrollbar', scrollbar);

    // disable looping and swiping when slides count <= 1
    if (options.thumbsElementId !== undefined) {
        options.thumbs = {
            ...options.thumbs,
            swiper: window.swipers[options.thumbsElementId],
        };
    }

    const slidesCount = container.querySelectorAll('.swiper-slide').length;
    options.loop = options.loop && slidesCount > 1;
    options.allowSlidePrev = options.allowSlidePrev || slidesCount > 1;
    options.allowSlideNext = options.allowSlideNext || slidesCount > 1;

    return options;
}

/**
 * Initialize Swiper instance only for special media query defined in options
 * @param {Object} instance
 * @param {Object} options
 */
function initOnBreakpoint(instance, options) {
    // breakpoint where swiper will be destroyed
    // and switches to a dual-column layout
    const breakpoint = window.matchMedia(options.mediaQueryForInit);
    // keep track of swiper instances to destroy later
    let mySwiper;

    const enableSwiper = () => {
        mySwiper = new Swiper(instance, options);
    };

    const breakpointChecker = () => {
        // if larger viewport and multi-row layout needed
        if (breakpoint.matches === true) {
            // fire small viewport version of swiper
            return enableSwiper();
        }
        if (breakpoint.matches === false) {
            // clean up old instances and inline styles when available
            if (mySwiper !== undefined) {
                mySwiper.destroy(true, true);
            }
            // else if a small viewport and single column layout needed
        }

        return null;
    };

    // keep an eye on viewport size changes
    breakpoint.addListener(breakpointChecker);
    // kickstart
    breakpointChecker();
}

/**
 * Initialize Swiper instance
 * @param {string|Element} element
 * @param {Object|null} options
 */
export function initializer(element, options) {
    element = getNode(element);
    if (!element) return;

    const instance = element.querySelector(CLASSES.CONTAINER);
    if (!instance) return;

    const datasetOptions = {};

    if (options.watchAttributes) {
        options.watchAttributes.forEach(attr => {
            if (instance.dataset[attr] !== undefined) {
                datasetOptions[attr] = instance.dataset[attr];
            }
        });
    }

    options = { ...defaultOptions, ...options, ...datasetOptions };
    options = updateProperties(element, options);

    if (options.initOnBreakpoint && options.mediaQueryForInit) {
        initOnBreakpoint(instance, options);
    } else {
        const swiperResult = new Swiper(instance, options);

        if (element.id) {
            window.swipers[element.id] = swiperResult;
        }
    }
}

/**
 * Initialize Swiper slider instances
 * @param {{ selector: string, options: Object|null }[]} instances
 */
export function initSwiperInstances(instances) {
    window.swipers = {};

    instances.forEach(({ selector, options }) => {
        document.querySelectorAll(selector).forEach(instance => {
            initializer(instance, options || {});
        });
    });
}
