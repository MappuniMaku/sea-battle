const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const miscRoutes = require('./server/routes/misc');
const bodyParser = require('body-parser');

const PORT = process.env.PORT || 3000;

const app = express();

const hbs = exphbs.create({
    defaultLayout: 'main',
    extname: 'hbs',
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', 'views');

app.use(bodyParser.json());
app.use(bodyParser.text());
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));

app.use(miscRoutes);

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type, X-Requested-With");
    next();
});

app.listen(PORT, () => {
    console.log('Server start');
});
