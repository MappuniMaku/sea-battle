const sass = require('node-sass');

class ScssScript {
    constructor(scss) {
        this.scss = scss;
    }

    async compileString() {
        return await new Promise((resolve, reject) => {
            const result = sass.renderSync({
                data: this.scss,
            });

            resolve(result.css);
            reject(() => {
                console.log('В стилях допущена ошибка');
            })
        });
    }
}

module.exports = ScssScript;