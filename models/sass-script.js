const sass = require('node-sass');

class ScssScript {
    constructor(scss) {
        this.scss = scss;
    }

    async compileToCss() {
        return await new Promise((resolve, reject) => {
            resolve(sass.renderSync({
                data: this.scss
            }));
        });
    }
}

module.exports = ScssScript;