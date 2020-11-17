const path = require('path');

module.exports = {
    entry: './scripts/guest.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'public'),
    }
}