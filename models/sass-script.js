const sass = require('node-sass');

class ScssScript {
    constructor(file) {
        this.file = file;
    }

    async compileToCss() {
        return await new Promise((resolve, reject) => {
            sass.render({
                file: this.file,
            }, (error, result) => {
                if (error) {
                    console.log(error.message);
                }
                else {
                    console.log(result.css.toString());
                    resolve(result.css);
                }
            });
        });
    }
}

module.exports = ScssScript;