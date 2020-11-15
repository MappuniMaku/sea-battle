const sass = require('node-sass');

class ScssScript {
    constructor(scss) {
        this.scss = scss;
    }

    async compileString() {
        let promisedStyles = await new Promise((resolve, reject) => {
            const result = sass.renderSync({
                data: this.scss,
            });

            if (result.css) {
                resolve(result.css);
            } else {
                reject(new Error('В стилях допущена ошибка'));
            }
        });

        promisedStyles.then((result) => {
            return result;
        }).catch((error) => {
            return error;
        });
    }
}

module.exports = ScssScript;