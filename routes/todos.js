const { Router } = require('express');
const ScssScript = require('../models/sass-script');
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

    products += await new Promise((resolve, reject) => {
        const client = new Client({
            connectionString: process.env.DATABASE_URL,
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        });

        client.connect();

        client.query('SELECT * FROM products;', (error, response) => {
            if (error) throw error;

            let result = response.rows.map((row) => {
                console.log(row.name);
                return row.name;
            }).join(', ');

            client.end();

            resolve(result);
        });
    });

    console.log(res);

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

router.post('/compile_scss', async (req, res) => {
    console.log(`Получена строка для компиляции: ${req.body}`);

    try {
        let compiledScss = await new Promise((resolve, reject) => {
            const result = new ScssScript(req.body).compileString();

            if (result) {
                resolve(result);
            } else {
                reject(new Error('Произошла серверная ошибка компиляции'));
            }
        });

        console.log('Компиляция завершена');
        res.send(compiledScss);
    } catch (err) {
        console.log(err);
        res.send(err);
    }
});

router.post('/complete', async (req, res) => {
    res.redirect('/');
});

module.exports = router;