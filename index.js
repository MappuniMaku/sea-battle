const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const miscRoutes = require('./server/routes/misc');
const bodyParser = require('body-parser');

const PORT = process.env.PORT || 3000;

const app = express();

const expressWs = require('express-ws')(app);

const timeOptions = {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric'
};
let usersCount = 0;

app.ws('/chat', (ws, req) => {
    ws.on('message', msg => {
        const parsedMessage = JSON.parse(msg);

        let payload = {
            userName: parsedMessage.userName,
            message: parsedMessage.message,
            time: new Date().toLocaleString('ru', timeOptions),
        };

        if (parsedMessage.isNewUser) {
            usersCount++;
            payload = {
                ...payload,
                usersCount,
            };
        }

        expressWs.getWss().clients.forEach(client => {
            if (client.readyState === ws.OPEN) {
                client.send(JSON.stringify(payload));
            }
        })
    });

    ws.on('close', () => {
        usersCount--;

        let payload = {
            usersCount,
        };

        expressWs.getWss().clients.forEach(client => {
            if (client.readyState === ws.OPEN) {
                client.send(JSON.stringify(payload));
            }
        })
    });
});

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
