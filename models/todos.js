const sass = require('node-sass');

class Todo {
    constructor(scss) {
        this.scss = scss;
    }

    compileScss() {
        return sass.renderSync({
            data: this.scss
        });
    }
}

module.exports = Todo;