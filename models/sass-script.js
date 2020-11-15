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
            console.log(`В SCSS была допущена ошибка: ${err.message}`);
            return err.message;
        }
    }
}

module.exports = ScssScript;