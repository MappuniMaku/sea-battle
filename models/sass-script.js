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
                    console.log(1)
                }
                else {
                    console.log(result.css.toString());
                    console.log(2)
                    resolve(result.css);
                }
            });
        });
    }
}

module.exports = ScssScript;