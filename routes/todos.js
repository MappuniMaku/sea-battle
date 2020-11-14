const { Router } = require('express');
const Todo = require('../models/todos');
const router = Router();
const { Client } = require('pg');

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        require: true,
        rejectUnauthorized: false
    }
});

client.connect();

router.get('/', async (req, res) => {
    let products = 'До обращения к базе';

    await client.query('SELECT * FROM products;', (err, res) => {
        if (err) throw err;
        for (let row of res.rows) {
            console.log(JSON.stringify(row));
            products += `${JSON.stringify(row)}`;
        }
        client.end();
    });

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