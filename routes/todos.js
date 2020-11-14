const { Router } = require('express');
const Todo = require('../models/todos');
const router = Router();
const { Client } = require('pg');

router.get('/', async (req, res) => {
    const products = 'До обращения к базе';

    res.render('index', {
        title: 'Todos list',
        isIndex: true,
        products,
    });
});

router.post('/query', async (req, res) => {
    let products = 'Полученные данные: ';

    products = await new Promise((resolve, reject) => {
        const client = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        });

        client.connect();

        client.query('SELECT * FROM products;', (error, response) => {
            if (error) reject(error);
            let myres = '';
            for (let row of response.rows) {
                console.log(JSON.stringify(row));
                myres += ${JSON.stringify(row)};
            }
            client.end();
            resolve(myres);
        });
    });

    console.log(products);

    res.render('index', {
        title: 'Todos list',
        isIndex: true,
        products,
    });
});

router.get('/create', (req, res) => {
    res.render('create', {
        title: 'Create todo',
        isCreate: true,
    });
});

router.post('/create', async (req, res) => {
    const todo = new Todo(req.body.title).compileScss();
    console.log(todo)
    res.render('create', {
        title: todo.css,
        isCreate: true,
    })
});

router.post('/complete', async (req, res) => {
    res.redirect('/');
});

module.exports = router;