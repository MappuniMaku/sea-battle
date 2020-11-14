const sass = require('node-sass');

class ScssScript {
    constructor(scss) {
        this.scss = scss;
    }

    async compileString() {
        console.log('Компиляция 2 началась...');

        return await new Promise((resolve, reject) => {
            const result = sass.renderSync({
                data: this.scss,
            });

            resolve(result.css);
        });
    }
}

module.exports = ScssScript;