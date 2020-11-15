const sass = require('node-sass');

class ScssScript {
    constructor(scss) {
        this.scss = scss;
    }

    async compileString() {
        try {
            return await new Promise((resolve) => {
                const result = sass.renderSync({
                    data: this.scss,
                });

                resolve(result.css);
            });
        } catch (err) {
            return new Error('В стилях допущена ошибка');
        }
    }
}

module.exports = ScssScript;