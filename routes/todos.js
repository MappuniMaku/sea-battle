const { Router } = require('express');
const ScssScript = require('../models/sass-script');
const router = Router();
const { Client } = require('pg');
const fs = require('fs');

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
    const path = 'public/scss-styles.scss';

    await new Promise(() => {
        fs.opendir('public', (err) => {
            if (err) throw err;
            console.log('Папка успешно открыта');
        });

        fs.writeFile('styles.scss', req.body, (err) => {
            if (err) throw err;
            console.log('Файл был успешно записан');
        });
    })

    const compiledScss = new ScssScript(path).compileToCss();

    console.log(compiledScss);
    res.send(compiledScss);
});

router.post('/complete', async (req, res) => {
    res.redirect('/');
});

module.exports = router;