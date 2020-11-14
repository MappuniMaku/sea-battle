const sass = require('node-sass');

class ScssScript {
    constructor(file) {
        this.file = file;
    }

    async compileToCss() {
        return await new Promise((resolve, reject) => {
            sass.render({
                file: this.file,
            }, (err, result) => resolve(result));
        });
    }
}

module.exports = ScssScript;